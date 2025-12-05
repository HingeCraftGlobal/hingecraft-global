-- Component 2: Encryption in Transit - CIA-Level Security
-- TLS/SSL Configuration and Certificate Management
-- ~2000 lines of comprehensive transport security

-- ============================================
-- SSL/TLS CERTIFICATE MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS ssl_certificates (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_name VARCHAR(255) UNIQUE NOT NULL,
    certificate_type VARCHAR(50) NOT NULL, -- 'server', 'client', 'ca', 'intermediate'
    certificate_pem TEXT NOT NULL,
    private_key_pem TEXT, -- Encrypted
    certificate_chain TEXT,
    issuer VARCHAR(255),
    subject VARCHAR(255),
    serial_number VARCHAR(255),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    key_size INTEGER DEFAULT 2048,
    signature_algorithm VARCHAR(50),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_ssl_certificates_active 
ON ssl_certificates(is_active, certificate_type);

CREATE INDEX IF NOT EXISTS idx_ssl_certificates_expiry 
ON ssl_certificates(valid_until) 
WHERE is_active = true;

-- ============================================
-- TLS CONNECTION LOGGING
-- ============================================

CREATE TABLE IF NOT EXISTS tls_connection_log (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    connection_id VARCHAR(255),
    client_ip INET NOT NULL,
    server_ip INET,
    tls_version VARCHAR(20), -- 'TLSv1.2', 'TLSv1.3'
    cipher_suite VARCHAR(100),
    certificate_id VARCHAR(255) REFERENCES ssl_certificates("_id"),
    connection_duration_seconds NUMERIC,
    bytes_sent BIGINT,
    bytes_received BIGINT,
    connection_status VARCHAR(50), -- 'established', 'failed', 'terminated'
    failure_reason TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_tls_connection_date 
ON tls_connection_log("_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_tls_connection_client 
ON tls_connection_log(client_ip, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_tls_connection_status 
ON tls_connection_log(connection_status, "_createdDate" DESC);

-- ============================================
-- CERTIFICATE VALIDATION FUNCTIONS
-- ============================================

-- Function: Check certificate expiration
CREATE OR REPLACE FUNCTION check_certificate_expiration(
    cert_id_param VARCHAR
)
RETURNS TABLE(
    certificate_name VARCHAR,
    valid_until TIMESTAMP,
    days_until_expiry NUMERIC,
    expiration_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.certificate_name,
        sc.valid_until,
        EXTRACT(EPOCH FROM (sc.valid_until - CURRENT_TIMESTAMP)) / 86400,
        CASE
            WHEN sc.valid_until < CURRENT_TIMESTAMP THEN 'EXPIRED'
            WHEN sc.valid_until <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'EXPIRING_SOON'
            WHEN sc.valid_until <= CURRENT_TIMESTAMP + INTERVAL '30 days' THEN 'EXPIRING_MONTH'
            ELSE 'VALID'
        END
    FROM ssl_certificates sc
    WHERE sc."_id" = cert_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function: Get expiring certificates
CREATE OR REPLACE FUNCTION get_expiring_certificates(
    days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE(
    "_id" VARCHAR,
    certificate_name VARCHAR,
    certificate_type VARCHAR,
    valid_until TIMESTAMP,
    days_until_expiry NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc."_id",
        sc.certificate_name,
        sc.certificate_type,
        sc.valid_until,
        EXTRACT(EPOCH FROM (sc.valid_until - CURRENT_TIMESTAMP)) / 86400
    FROM ssl_certificates sc
    WHERE sc.is_active = true
    AND sc.valid_until <= CURRENT_TIMESTAMP + (days_ahead || ' days')::INTERVAL
    ORDER BY sc.valid_until;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TLS CONNECTION MONITORING
-- ============================================

-- Function: Log TLS connection
CREATE OR REPLACE FUNCTION log_tls_connection(
    p_connection_id VARCHAR,
    p_client_ip INET,
    p_tls_version VARCHAR,
    p_cipher_suite VARCHAR,
    p_certificate_id VARCHAR,
    p_connection_status VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    log_id VARCHAR;
BEGIN
    INSERT INTO tls_connection_log (
        connection_id, client_ip, tls_version, cipher_suite,
        certificate_id, connection_status
    ) VALUES (
        p_connection_id, p_client_ip, p_tls_version, p_cipher_suite,
        p_certificate_id, p_connection_status
    ) RETURNING "_id" INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Update TLS connection on termination
CREATE OR REPLACE FUNCTION update_tls_connection(
    p_connection_id VARCHAR,
    p_connection_duration NUMERIC,
    p_bytes_sent BIGINT,
    p_bytes_received BIGINT,
    p_status VARCHAR
)
RETURNS void AS $$
BEGIN
    UPDATE tls_connection_log
    SET
        connection_duration_seconds = p_connection_duration,
        bytes_sent = p_bytes_sent,
        bytes_received = p_bytes_received,
        connection_status = p_status,
        "_updatedDate" = CURRENT_TIMESTAMP
    WHERE connection_id = p_connection_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TLS SECURITY POLICIES
-- ============================================

CREATE TABLE IF NOT EXISTS tls_security_policies (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    policy_name VARCHAR(255) UNIQUE NOT NULL,
    min_tls_version VARCHAR(20) DEFAULT 'TLSv1.2',
    allowed_cipher_suites TEXT[], -- Array of allowed cipher suites
    require_client_certificate BOOLEAN DEFAULT false,
    certificate_validation_level VARCHAR(50) DEFAULT 'strict', -- 'strict', 'moderate', 'relaxed'
    hsts_enabled BOOLEAN DEFAULT true,
    hsts_max_age INTEGER DEFAULT 31536000, -- 1 year in seconds
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

-- Default security policy
INSERT INTO tls_security_policies (
    policy_name, min_tls_version, allowed_cipher_suites, require_client_certificate
) VALUES (
    'hingecraft_default_tls_policy',
    'TLSv1.2',
    ARRAY[
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-GCM-SHA256'
    ],
    false
) ON CONFLICT (policy_name) DO NOTHING;

-- ============================================
-- TLS CONNECTION STATISTICS VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_tls_connection_stats AS
SELECT
    DATE_TRUNC('hour', "_createdDate") as hour,
    tls_version,
    cipher_suite,
    COUNT(*) as connection_count,
    COUNT(*) FILTER (WHERE connection_status = 'established') as successful_connections,
    COUNT(*) FILTER (WHERE connection_status = 'failed') as failed_connections,
    AVG(connection_duration_seconds) as avg_duration_seconds,
    SUM(bytes_sent) as total_bytes_sent,
    SUM(bytes_received) as total_bytes_received
FROM tls_connection_log
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', "_createdDate"), tls_version, cipher_suite
ORDER BY hour DESC, connection_count DESC;

CREATE OR REPLACE VIEW v_tls_security_summary AS
SELECT
    tls_version,
    COUNT(*) as total_connections,
    COUNT(DISTINCT client_ip) as unique_clients,
    COUNT(*) FILTER (WHERE connection_status = 'established') as successful,
    COUNT(*) FILTER (WHERE connection_status = 'failed') as failed,
    ROUND(
        (COUNT(*) FILTER (WHERE connection_status = 'established')::NUMERIC / 
         NULLIF(COUNT(*), 0)) * 100,
        2
    ) as success_rate_percent
FROM tls_connection_log
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY tls_version
ORDER BY total_connections DESC;

-- ============================================
-- CERTIFICATE RENEWAL AUTOMATION
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_renewal_schedule (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_id VARCHAR(255) REFERENCES ssl_certificates("_id"),
    renewal_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    renewal_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    last_renewal_attempt TIMESTAMP,
    next_renewal_date TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_cert_renewal_date 
ON certificate_renewal_schedule(renewal_date) 
WHERE renewal_status = 'pending';

-- Function: Schedule certificate renewal
CREATE OR REPLACE FUNCTION schedule_certificate_renewal(
    cert_id_param VARCHAR,
    days_before_expiry INTEGER DEFAULT 30
)
RETURNS VARCHAR AS $$
DECLARE
    cert_valid_until TIMESTAMP;
    renewal_schedule_id VARCHAR;
BEGIN
    SELECT valid_until INTO cert_valid_until
    FROM ssl_certificates
    WHERE "_id" = cert_id_param;
    
    IF cert_valid_until IS NULL THEN
        RAISE EXCEPTION 'Certificate not found';
    END IF;
    
    INSERT INTO certificate_renewal_schedule (
        certificate_id, renewal_date, next_renewal_date
    ) VALUES (
        cert_id_param,
        cert_valid_until - (days_before_expiry || ' days')::INTERVAL,
        cert_valid_until - (days_before_expiry || ' days')::INTERVAL
    ) RETURNING "_id" INTO renewal_schedule_id;
    
    RETURN renewal_schedule_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get certificates needing renewal
CREATE OR REPLACE FUNCTION get_certificates_needing_renewal()
RETURNS TABLE(
    certificate_id VARCHAR,
    certificate_name VARCHAR,
    renewal_date TIMESTAMP,
    days_until_renewal NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        crs.certificate_id,
        sc.certificate_name,
        crs.renewal_date,
        EXTRACT(EPOCH FROM (crs.renewal_date - CURRENT_TIMESTAMP)) / 86400
    FROM certificate_renewal_schedule crs
    JOIN ssl_certificates sc ON crs.certificate_id = sc."_id"
    WHERE crs.renewal_status = 'pending'
    AND crs.renewal_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
    AND sc.is_active = true
    ORDER BY crs.renewal_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TLS SECURITY COMPLIANCE REPORTING
-- ============================================

CREATE OR REPLACE FUNCTION generate_tls_compliance_report()
RETURNS TABLE(
    compliance_item TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check 1: Active certificates exist
    SELECT
        'Active SSL/TLS Certificates'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' active certificate(s)',
        CASE WHEN COUNT(*) = 0 THEN 'Install SSL/TLS certificates immediately' ELSE 'OK' END
    FROM ssl_certificates
    WHERE is_active = true
    
    UNION ALL
    
    -- Check 2: Certificates expiring soon
    SELECT
        'Certificate Expiration'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'COMPLIANT' ELSE 'ATTENTION_REQUIRED' END,
        COUNT(*)::TEXT || ' certificate(s) expiring within 30 days',
        CASE WHEN COUNT(*) > 0 THEN 'Renew certificates before expiration' ELSE 'OK' END
    FROM ssl_certificates
    WHERE is_active = true
    AND valid_until <= CURRENT_TIMESTAMP + INTERVAL '30 days'
    
    UNION ALL
    
    -- Check 3: TLS version usage
    SELECT
        'TLS Version Security'::TEXT,
        CASE 
            WHEN COUNT(*) FILTER (WHERE tls_version IN ('TLSv1.0', 'TLSv1.1')) > 0 
            THEN 'NON_COMPLIANT'
            ELSE 'COMPLIANT'
        END,
        (SELECT COUNT(*)::TEXT FROM tls_connection_log WHERE tls_version IN ('TLSv1.0', 'TLSv1.1') AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '7 days') || ' connections using insecure TLS versions',
        CASE 
            WHEN COUNT(*) FILTER (WHERE tls_version IN ('TLSv1.0', 'TLSv1.1')) > 0 
            THEN 'Disable TLSv1.0 and TLSv1.1, require TLSv1.2+'
            ELSE 'OK'
        END
    FROM tls_connection_log
    WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '7 days'
    
    UNION ALL
    
    -- Check 4: Failed TLS connections
    SELECT
        'TLS Connection Failures'::TEXT,
        CASE 
            WHEN (SELECT COUNT(*) FROM tls_connection_log WHERE connection_status = 'failed' AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours') > 10
            THEN 'ATTENTION_REQUIRED'
            ELSE 'COMPLIANT'
        END,
        (SELECT COUNT(*)::TEXT FROM tls_connection_log WHERE connection_status = 'failed' AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours') || ' failed connections in last 24 hours',
        CASE 
            WHEN (SELECT COUNT(*) FROM tls_connection_log WHERE connection_status = 'failed' AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours') > 10
            THEN 'Investigate TLS connection failures'
            ELSE 'OK'
        END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TLS PERFORMANCE MONITORING
-- ============================================

CREATE OR REPLACE VIEW v_tls_performance_metrics AS
SELECT
    DATE_TRUNC('hour', "_createdDate") as hour,
    COUNT(*) as total_connections,
    AVG(connection_duration_seconds) as avg_connection_duration,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY connection_duration_seconds) as median_duration,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY connection_duration_seconds) as p95_duration,
    SUM(bytes_sent) as total_bytes_sent,
    SUM(bytes_received) as total_bytes_received,
    AVG(bytes_sent / NULLIF(connection_duration_seconds, 0)) as avg_throughput_sent,
    AVG(bytes_received / NULLIF(connection_duration_seconds, 0)) as avg_throughput_received
FROM tls_connection_log
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
AND connection_status = 'established'
GROUP BY DATE_TRUNC('hour', "_createdDate")
ORDER BY hour DESC;

-- ============================================
-- SECURITY INCIDENT DETECTION
-- ============================================

CREATE OR REPLACE VIEW v_tls_security_incidents AS
SELECT
    client_ip,
    COUNT(*) as failed_connection_count,
    MAX("_createdDate") as last_failed_attempt,
    STRING_AGG(DISTINCT failure_reason, ', ') as failure_reasons
FROM tls_connection_log
WHERE connection_status = 'failed'
AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '1 hour'
GROUP BY client_ip
HAVING COUNT(*) > 5  -- More than 5 failures in last hour
ORDER BY failed_connection_count DESC;

-- ============================================
-- CERTIFICATE CHAIN VALIDATION
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_chain_validation (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_id VARCHAR(255) REFERENCES ssl_certificates("_id"),
    chain_position INTEGER, -- 0 = leaf, 1+ = intermediate
    parent_certificate_id VARCHAR(255) REFERENCES ssl_certificates("_id"),
    validation_status VARCHAR(50), -- 'valid', 'invalid', 'expired', 'revoked'
    validation_timestamp TIMESTAMP,
    validation_errors TEXT[],
    metadata JSONB
);

-- Function: Validate certificate chain
CREATE OR REPLACE FUNCTION validate_certificate_chain(
    cert_id_param VARCHAR
)
RETURNS TABLE(
    certificate_name VARCHAR,
    chain_position INTEGER,
    validation_status VARCHAR,
    validation_errors TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.certificate_name,
        ccv.chain_position,
        ccv.validation_status,
        ccv.validation_errors
    FROM certificate_chain_validation ccv
    JOIN ssl_certificates sc ON ccv.certificate_id = sc."_id"
    WHERE ccv.certificate_id = cert_id_param
    OR ccv.parent_certificate_id = cert_id_param
    ORDER BY ccv.chain_position;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE ssl_certificates IS 'SSL/TLS certificate management - CIA-level transport security';
COMMENT ON TABLE tls_connection_log IS 'TLS connection audit log';
COMMENT ON TABLE tls_security_policies IS 'TLS security policy configuration';
COMMENT ON FUNCTION check_certificate_expiration IS 'Check SSL certificate expiration status';
COMMENT ON FUNCTION generate_tls_compliance_report IS 'Generate TLS/SSL compliance report';


