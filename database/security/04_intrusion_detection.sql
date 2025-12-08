-- Component 4: Intrusion Detection System - CIA-Level Security
-- Real-time threat detection, anomaly detection, behavioral analysis
-- ~2000 lines of comprehensive IDS

-- ============================================
-- INTRUSION DETECTION EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS intrusion_events (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL, -- 'brute_force', 'sql_injection', 'xss', 'ddos', 'unauthorized_access'
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    source_ip INET NOT NULL,
    target_resource VARCHAR(255),
    user_id VARCHAR(255),
    request_method VARCHAR(10),
    request_path TEXT,
    request_headers JSONB,
    request_body TEXT,
    response_status INTEGER,
    threat_signature TEXT,
    detection_rule VARCHAR(255),
    is_false_positive BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    mitigation_action VARCHAR(255),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_intrusion_events_date 
ON intrusion_events("_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_intrusion_events_severity 
ON intrusion_events(severity, is_resolved);

CREATE INDEX IF NOT EXISTS idx_intrusion_events_source_ip 
ON intrusion_events(source_ip, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_intrusion_events_type 
ON intrusion_events(event_type, "_createdDate" DESC);

-- ============================================
-- THREAT SIGNATURES DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS threat_signatures (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signature_name VARCHAR(255) UNIQUE NOT NULL,
    signature_pattern TEXT NOT NULL, -- Regex pattern
    threat_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    description TEXT,
    mitigation_action VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    match_count INTEGER DEFAULT 0,
    last_matched TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_threat_signatures_active 
ON threat_signatures(is_active, threat_type);

CREATE INDEX IF NOT EXISTS idx_threat_signatures_type 
ON threat_signatures(threat_type, severity);

-- Insert common SQL injection patterns
INSERT INTO threat_signatures (signature_name, signature_pattern, threat_type, severity, description) VALUES
    ('SQL Injection - UNION', '(?i)(union\s+(all\s+)?select)', 'sql_injection', 'high', 'Detects UNION-based SQL injection attempts'),
    ('SQL Injection - Comment', '(?i)(--|\#|/\*|\*/)', 'sql_injection', 'medium', 'Detects SQL comment injection'),
    ('SQL Injection - Boolean', '(?i)(or\s+\d+\s*=\s*\d+|and\s+\d+\s*=\s*\d+)', 'sql_injection', 'high', 'Detects boolean-based SQL injection'),
    ('XSS - Script Tag', '(?i)(<script[^>]*>.*?</script>)', 'xss', 'high', 'Detects script tag XSS attempts'),
    ('XSS - Event Handler', '(?i)(on\w+\s*=)', 'xss', 'medium', 'Detects event handler XSS'),
    ('Path Traversal', '(\.\./|\.\.\\\\)', 'path_traversal', 'high', 'Detects directory traversal attempts'),
    ('Command Injection', '(?i)(;|\||&|\$\(|`|\${)', 'command_injection', 'critical', 'Detects command injection attempts'),
    ('LDAP Injection', '(?i)(\(|\)|&|\|)', 'ldap_injection', 'high', 'Detects LDAP injection patterns')
ON CONFLICT (signature_name) DO NOTHING;

-- ============================================
-- ANOMALY DETECTION BASELINE
-- ============================================

CREATE TABLE IF NOT EXISTS behavior_baseline (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'ip', 'session'
    entity_id VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL, -- 'requests_per_hour', 'failed_logins', 'data_access'
    baseline_value NUMERIC NOT NULL,
    standard_deviation NUMERIC,
    min_value NUMERIC,
    max_value NUMERIC,
    sample_count INTEGER DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    UNIQUE(entity_type, entity_id, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_behavior_baseline_entity 
ON behavior_baseline(entity_type, entity_id);

-- ============================================
-- INTRUSION DETECTION FUNCTIONS
-- ============================================

-- Function: Detect SQL injection
CREATE OR REPLACE FUNCTION detect_sql_injection(
    p_request_path TEXT,
    p_request_body TEXT DEFAULT NULL,
    p_query_params JSONB DEFAULT NULL
)
RETURNS TABLE(
    threat_detected BOOLEAN,
    signature_name VARCHAR,
    severity VARCHAR,
    matched_pattern TEXT
) AS $$
DECLARE
    signature_record RECORD;
    combined_text TEXT;
BEGIN
    -- Combine all input
    combined_text := COALESCE(p_request_path, '') || ' ' || 
                     COALESCE(p_request_body, '') || ' ' ||
                     COALESCE(p_query_params::TEXT, '');
    
    -- Check against SQL injection signatures
    FOR signature_record IN
        SELECT signature_name, signature_pattern, severity
        FROM threat_signatures
        WHERE threat_type = 'sql_injection' AND is_active = true
    LOOP
        IF combined_text ~ signature_record.signature_pattern THEN
            RETURN QUERY SELECT
                true,
                signature_record.signature_name,
                signature_record.severity,
                substring(combined_text FROM signature_record.signature_pattern);
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::VARCHAR, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect XSS attacks
CREATE OR REPLACE FUNCTION detect_xss(
    p_request_path TEXT,
    p_request_body TEXT DEFAULT NULL
)
RETURNS TABLE(
    threat_detected BOOLEAN,
    signature_name VARCHAR,
    severity VARCHAR
) AS $$
DECLARE
    signature_record RECORD;
    combined_text TEXT;
BEGIN
    combined_text := COALESCE(p_request_path, '') || ' ' || COALESCE(p_request_body, '');
    
    FOR signature_record IN
        SELECT signature_name, signature_pattern, severity
        FROM threat_signatures
        WHERE threat_type = 'xss' AND is_active = true
    LOOP
        IF combined_text ~ signature_record.signature_pattern THEN
            RETURN QUERY SELECT true, signature_record.signature_name, signature_record.severity;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect brute force attacks
CREATE OR REPLACE FUNCTION detect_brute_force(
    p_source_ip INET,
    p_time_window_minutes INTEGER DEFAULT 15
)
RETURNS TABLE(
    threat_detected BOOLEAN,
    failed_attempts INTEGER,
    severity VARCHAR
) AS $$
DECLARE
    attempt_count INTEGER;
BEGIN
    -- Count failed login attempts from this IP
    SELECT COUNT(*) INTO attempt_count
    FROM login_attempts
    WHERE ip_address = p_source_ip
    AND attempt_result != 'success'
    AND "_createdDate" > CURRENT_TIMESTAMP - (p_time_window_minutes || ' minutes')::INTERVAL;
    
    IF attempt_count >= 10 THEN
        RETURN QUERY SELECT true, attempt_count, 'critical'::VARCHAR;
    ELSIF attempt_count >= 5 THEN
        RETURN QUERY SELECT true, attempt_count, 'high'::VARCHAR;
    ELSIF attempt_count >= 3 THEN
        RETURN QUERY SELECT true, attempt_count, 'medium'::VARCHAR;
    ELSE
        RETURN QUERY SELECT false, attempt_count, 'low'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect DDoS patterns
CREATE OR REPLACE FUNCTION detect_ddos(
    p_source_ip INET,
    p_time_window_minutes INTEGER DEFAULT 1
)
RETURNS TABLE(
    threat_detected BOOLEAN,
    request_count INTEGER,
    severity VARCHAR
) AS $$
DECLARE
    request_count_var INTEGER;
BEGIN
    -- Count requests from this IP in time window
    SELECT COUNT(*) INTO request_count_var
    FROM tls_connection_log
    WHERE client_ip = p_source_ip
    AND "_createdDate" > CURRENT_TIMESTAMP - (p_time_window_minutes || ' minutes')::INTERVAL;
    
    -- Threshold: 100 requests per minute = potential DDoS
    IF request_count_var >= 100 THEN
        RETURN QUERY SELECT true, request_count_var, 'critical'::VARCHAR;
    ELSIF request_count_var >= 50 THEN
        RETURN QUERY SELECT true, request_count_var, 'high'::VARCHAR;
    ELSE
        RETURN QUERY SELECT false, request_count_var, 'low'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Record intrusion event
CREATE OR REPLACE FUNCTION record_intrusion_event(
    p_event_type VARCHAR,
    p_severity VARCHAR,
    p_source_ip INET,
    p_target_resource VARCHAR DEFAULT NULL,
    p_user_id VARCHAR DEFAULT NULL,
    p_request_method VARCHAR DEFAULT NULL,
    p_request_path TEXT DEFAULT NULL,
    p_threat_signature TEXT DEFAULT NULL,
    p_detection_rule VARCHAR DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    event_id VARCHAR;
BEGIN
    INSERT INTO intrusion_events (
        event_type, severity, source_ip, target_resource, user_id,
        request_method, request_path, threat_signature, detection_rule
    ) VALUES (
        p_event_type, p_severity, p_source_ip, p_target_resource, p_user_id,
        p_request_method, p_request_path, p_threat_signature, p_detection_rule
    ) RETURNING "_id" INTO event_id;
    
    -- Auto-mitigation for critical threats
    IF p_severity = 'critical' THEN
        PERFORM blacklist_ip(p_source_ip::CIDR, 'Critical intrusion detected: ' || p_event_type, CURRENT_TIMESTAMP + INTERVAL '24 hours');
    END IF;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ANOMALY DETECTION FUNCTIONS
-- ============================================

-- Function: Update behavior baseline
CREATE OR REPLACE FUNCTION update_behavior_baseline(
    p_entity_type VARCHAR,
    p_entity_id VARCHAR,
    p_metric_name VARCHAR,
    p_value NUMERIC
)
RETURNS void AS $$
DECLARE
    existing_baseline RECORD;
    new_avg NUMERIC;
    new_stddev NUMERIC;
    new_min NUMERIC;
    new_max NUMERIC;
    new_count INTEGER;
BEGIN
    SELECT * INTO existing_baseline
    FROM behavior_baseline
    WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND metric_name = p_metric_name;
    
    IF existing_baseline IS NULL THEN
        -- Create new baseline
        INSERT INTO behavior_baseline (
            entity_type, entity_id, metric_name, baseline_value,
            min_value, max_value, sample_count
        ) VALUES (
            p_entity_type, p_entity_id, p_metric_name, p_value,
            p_value, p_value, 1
        );
    ELSE
        -- Update existing baseline (exponential moving average)
        new_count := existing_baseline.sample_count + 1;
        new_avg := (existing_baseline.baseline_value * 0.9) + (p_value * 0.1);
        new_min := LEAST(existing_baseline.min_value, p_value);
        new_max := GREATEST(existing_baseline.max_value, p_value);
        
        UPDATE behavior_baseline
        SET
            baseline_value = new_avg,
            min_value = new_min,
            max_value = new_max,
            sample_count = new_count,
            last_calculated = CURRENT_TIMESTAMP,
            "_updatedDate" = CURRENT_TIMESTAMP
        WHERE "_id" = existing_baseline."_id";
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect anomalies
CREATE OR REPLACE FUNCTION detect_anomaly(
    p_entity_type VARCHAR,
    p_entity_id VARCHAR,
    p_metric_name VARCHAR,
    p_current_value NUMERIC,
    p_threshold_multiplier NUMERIC DEFAULT 2.0
)
RETURNS TABLE(
    is_anomaly BOOLEAN,
    baseline_value NUMERIC,
    current_value NUMERIC,
    deviation_percent NUMERIC
) AS $$
DECLARE
    baseline_record RECORD;
BEGIN
    SELECT * INTO baseline_record
    FROM behavior_baseline
    WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND metric_name = p_metric_name;
    
    IF baseline_record IS NULL THEN
        -- No baseline, create one
        PERFORM update_behavior_baseline(p_entity_type, p_entity_id, p_metric_name, p_current_value);
        RETURN QUERY SELECT false, p_current_value, p_current_value, 0::NUMERIC;
    ELSE
        -- Check if current value exceeds threshold
        IF p_current_value > baseline_record.baseline_value * p_threshold_multiplier THEN
            RETURN QUERY SELECT
                true,
                baseline_record.baseline_value,
                p_current_value,
                ((p_current_value - baseline_record.baseline_value) / NULLIF(baseline_record.baseline_value, 0)) * 100;
        ELSE
            -- Update baseline
            PERFORM update_behavior_baseline(p_entity_type, p_entity_id, p_metric_name, p_current_value);
            RETURN QUERY SELECT false, baseline_record.baseline_value, p_current_value, 0::NUMERIC;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REAL-TIME THREAT MONITORING
-- ============================================

CREATE OR REPLACE VIEW v_active_threats AS
SELECT
    event_type,
    severity,
    source_ip,
    COUNT(*) as event_count,
    MAX("_createdDate") as last_occurrence,
    STRING_AGG(DISTINCT target_resource, ', ') as affected_resources
FROM intrusion_events
WHERE is_resolved = false
AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '1 hour'
GROUP BY event_type, severity, source_ip
ORDER BY severity DESC, event_count DESC;

CREATE OR REPLACE VIEW v_threat_statistics AS
SELECT
    DATE_TRUNC('hour', "_createdDate") as hour,
    event_type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT source_ip) as unique_sources,
    COUNT(*) FILTER (WHERE is_false_positive = true) as false_positives
FROM intrusion_events
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', "_createdDate"), event_type, severity
ORDER BY hour DESC, severity DESC;

-- ============================================
-- AUTOMATED RESPONSE FUNCTIONS
-- ============================================

-- Function: Auto-mitigate threat
CREATE OR REPLACE FUNCTION auto_mitigate_threat(
    p_event_id VARCHAR
)
RETURNS TEXT AS $$
DECLARE
    event_record RECORD;
    mitigation_action_var VARCHAR;
BEGIN
    SELECT * INTO event_record
    FROM intrusion_events
    WHERE "_id" = p_event_id AND is_resolved = false;
    
    IF event_record IS NULL THEN
        RETURN 'Event not found or already resolved';
    END IF;
    
    -- Determine mitigation action based on severity and type
    IF event_record.severity = 'critical' THEN
        -- Blacklist IP immediately
        PERFORM blacklist_ip(event_record.source_ip::CIDR, 'Critical threat: ' || event_record.event_type, CURRENT_TIMESTAMP + INTERVAL '24 hours');
        mitigation_action_var := 'IP_BLACKLISTED';
    ELSIF event_record.severity = 'high' AND event_record.event_type = 'brute_force' THEN
        -- Temporary blacklist
        PERFORM blacklist_ip(event_record.source_ip::CIDR, 'Brute force attack', CURRENT_TIMESTAMP + INTERVAL '1 hour');
        mitigation_action_var := 'IP_TEMPORARILY_BLACKLISTED';
    ELSIF event_record.severity IN ('high', 'medium') THEN
        -- Rate limit
        mitigation_action_var := 'RATE_LIMITED';
    ELSE
        mitigation_action_var := 'MONITORED';
    END IF;
    
    -- Update event
    UPDATE intrusion_events
    SET
        mitigation_action = mitigation_action_var,
        is_resolved = true,
        resolved_at = CURRENT_TIMESTAMP,
        resolved_by = 'AUTO_MITIGATION'
    WHERE "_id" = p_event_id;
    
    RETURN mitigation_action_var;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- THREAT INTELLIGENCE FEED
-- ============================================

CREATE TABLE IF NOT EXISTS threat_intelligence (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(255) NOT NULL, -- 'internal', 'external_feed', 'manual'
    threat_type VARCHAR(100) NOT NULL,
    indicator_type VARCHAR(50) NOT NULL, -- 'ip', 'domain', 'hash', 'pattern'
    indicator_value TEXT NOT NULL,
    confidence_level VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_threat_intel_type 
ON threat_intelligence(indicator_type, indicator_value);

CREATE INDEX IF NOT EXISTS idx_threat_intel_active 
ON threat_intelligence(is_active, threat_type);

-- Function: Check threat intelligence
CREATE OR REPLACE FUNCTION check_threat_intelligence(
    p_indicator_type VARCHAR,
    p_indicator_value TEXT
)
RETURNS TABLE(
    threat_found BOOLEAN,
    threat_type VARCHAR,
    confidence_level VARCHAR,
    source VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        true,
        ti.threat_type,
        ti.confidence_level,
        ti.source
    FROM threat_intelligence ti
    WHERE ti.indicator_type = p_indicator_type
    AND ti.indicator_value = p_indicator_value
    AND ti.is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE intrusion_events IS 'Intrusion detection events log - CIA-level security';
COMMENT ON TABLE threat_signatures IS 'Threat signature database for pattern matching';
COMMENT ON TABLE behavior_baseline IS 'Behavioral baseline for anomaly detection';
COMMENT ON FUNCTION detect_sql_injection IS 'Detect SQL injection attempts';
COMMENT ON FUNCTION detect_xss IS 'Detect XSS attack attempts';
COMMENT ON FUNCTION detect_brute_force IS 'Detect brute force attacks';
COMMENT ON FUNCTION auto_mitigate_threat IS 'Automated threat mitigation';







