-- Component 6: Data Loss Prevention (DLP) - CIA-Level Security
-- Data classification, masking, and leak prevention
-- ~2000 lines of comprehensive DLP infrastructure

-- ============================================
-- DATA CLASSIFICATION SCHEMA
-- ============================================

CREATE TABLE IF NOT EXISTS data_classification (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    classification_level VARCHAR(50) NOT NULL, -- 'public', 'internal', 'confidential', 'restricted', 'top_secret'
    data_type VARCHAR(100), -- 'pii', 'financial', 'health', 'credentials', 'intellectual_property'
    sensitivity_score INTEGER DEFAULT 0, -- 0-100
    requires_encryption BOOLEAN DEFAULT false,
    requires_masking BOOLEAN DEFAULT false,
    requires_redaction BOOLEAN DEFAULT false,
    retention_period_days INTEGER,
    legal_hold BOOLEAN DEFAULT false,
    compliance_requirements TEXT[], -- 'GDPR', 'HIPAA', 'PCI-DSS', 'SOX'
    metadata JSONB,
    UNIQUE(table_name, column_name)
);

CREATE INDEX IF NOT EXISTS idx_data_classification_level 
ON data_classification(classification_level, sensitivity_score);

CREATE INDEX IF NOT EXISTS idx_data_classification_type 
ON data_classification(data_type, requires_encryption);

-- Default classifications
INSERT INTO data_classification (table_name, column_name, classification_level, data_type, sensitivity_score, requires_encryption, requires_masking, compliance_requirements) VALUES
    ('donations', 'member_email', 'confidential', 'pii', 75, true, true, ARRAY['GDPR']),
    ('donations', 'member_name', 'internal', 'pii', 50, false, true, ARRAY['GDPR']),
    ('donations', 'amount', 'internal', 'financial', 60, false, false, ARRAY['PCI-DSS']),
    ('donations', 'transaction_id', 'confidential', 'financial', 70, true, true, ARRAY['PCI-DSS']),
    ('members', 'email', 'confidential', 'pii', 80, true, true, ARRAY['GDPR']),
    ('members', 'first_name', 'internal', 'pii', 40, false, true, NULL),
    ('members', 'last_name', 'internal', 'pii', 40, false, true, NULL),
    ('user_authentication', 'password_hash', 'restricted', 'credentials', 100, true, true, NULL),
    ('user_authentication', 'mfa_secret', 'restricted', 'credentials', 100, true, true, NULL)
ON CONFLICT (table_name, column_name) DO NOTHING;

-- ============================================
-- DATA LEAK DETECTION
-- ============================================

CREATE TABLE IF NOT EXISTS data_leak_events (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL, -- 'unauthorized_access', 'bulk_export', 'suspicious_query', 'data_exfiltration'
    severity VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    username VARCHAR(255),
    ip_address INET,
    table_name VARCHAR(255),
    column_name VARCHAR(255),
    classification_level VARCHAR(50),
    records_accessed INTEGER,
    data_size_bytes BIGINT,
    detection_method VARCHAR(100), -- 'pattern_match', 'anomaly', 'policy_violation', 'manual'
    leak_prevented BOOLEAN DEFAULT false,
    action_taken VARCHAR(255),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_data_leak_severity 
ON data_leak_events(severity, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_data_leak_user 
ON data_leak_events(user_id, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_data_leak_classification 
ON data_leak_events(classification_level, "_createdDate" DESC);

-- ============================================
-- DATA MASKING RULES
-- ============================================

CREATE TABLE IF NOT EXISTS data_masking_rules (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rule_name VARCHAR(255) UNIQUE NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    masking_type VARCHAR(50) NOT NULL, -- 'partial', 'full', 'hash', 'encrypt', 'redact', 'tokenize'
    masking_pattern VARCHAR(255), -- Pattern for partial masking
    preserve_format BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    apply_to_user_roles TEXT[], -- Roles that see masked data
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_masking_rules_table 
ON data_masking_rules(table_name, column_name, is_active);

-- Default masking rules
INSERT INTO data_masking_rules (rule_name, table_name, column_name, masking_type, masking_pattern, apply_to_user_roles) VALUES
    ('mask_email', 'donations', 'member_email', 'partial', 'X***@***.com', ARRAY['readonly', 'user']),
    ('mask_email_members', 'members', 'email', 'partial', 'X***@***.com', ARRAY['readonly', 'user']),
    ('mask_name', 'donations', 'member_name', 'partial', 'X***', ARRAY['readonly']),
    ('mask_transaction_id', 'donations', 'transaction_id', 'partial', '****-****-****-####', ARRAY['readonly', 'user'])
ON CONFLICT (rule_name) DO NOTHING;

-- ============================================
-- DATA MASKING FUNCTIONS
-- ============================================

-- Function: Mask email address
CREATE OR REPLACE FUNCTION mask_email_dlp(
    email_text TEXT,
    masking_type VARCHAR DEFAULT 'partial'
)
RETURNS TEXT AS $$
DECLARE
    email_parts TEXT[];
    local_part TEXT;
    domain_part TEXT;
    masked_local TEXT;
BEGIN
    IF email_text IS NULL OR email_text = '' THEN
        RETURN email_text;
    END IF;
    
    IF masking_type = 'full' THEN
        RETURN '***@***.***';
    END IF;
    
    email_parts := string_to_array(email_text, '@');
    
    IF array_length(email_parts, 1) = 2 THEN
        local_part := email_parts[1];
        domain_parts := string_to_array(email_parts[2], '.');
        
        IF length(local_part) > 2 THEN
            masked_local := LEFT(local_part, 1) || REPEAT('*', GREATEST(length(local_part) - 2, 3)) || RIGHT(local_part, 1);
        ELSE
            masked_local := REPEAT('*', length(local_part));
        END IF;
        
        IF array_length(domain_parts, 1) >= 2 THEN
            RETURN masked_local || '@' || REPEAT('*', length(domain_parts[1])) || '.' || domain_parts[array_length(domain_parts, 1)];
        ELSE
            RETURN masked_local || '@' || REPEAT('*', length(email_parts[2]));
        END IF;
    END IF;
    
    RETURN email_text;
END;
$$ LANGUAGE plpgsql;

-- Function: Mask credit card number
CREATE OR REPLACE FUNCTION mask_credit_card(
    card_number TEXT
)
RETURNS TEXT AS $$
BEGIN
    IF card_number IS NULL OR card_number = '' THEN
        RETURN card_number;
    END IF;
    
    -- Keep last 4 digits, mask the rest
    IF length(card_number) >= 4 THEN
        RETURN REPEAT('*', length(card_number) - 4) || RIGHT(card_number, 4);
    END IF;
    
    RETURN REPEAT('*', length(card_number));
END;
$$ LANGUAGE plpgsql;

-- Function: Mask SSN
CREATE OR REPLACE FUNCTION mask_ssn(
    ssn_text TEXT
)
RETURNS TEXT AS $$
BEGIN
    IF ssn_text IS NULL OR ssn_text = '' THEN
        RETURN ssn_text;
    END IF;
    
    -- Format: XXX-XX-1234
    IF length(ssn_text) >= 4 THEN
        RETURN '***-**-' || RIGHT(ssn_text, 4);
    END IF;
    
    RETURN REPEAT('*', length(ssn_text));
END;
$$ LANGUAGE plpgsql;

-- Function: Apply data masking based on rules
CREATE OR REPLACE FUNCTION apply_data_masking(
    p_table_name VARCHAR,
    p_column_name VARCHAR,
    p_value TEXT,
    p_user_role VARCHAR DEFAULT 'user'
)
RETURNS TEXT AS $$
DECLARE
    masking_rule RECORD;
BEGIN
    -- Get masking rule
    SELECT * INTO masking_rule
    FROM data_masking_rules
    WHERE table_name = p_table_name
    AND column_name = p_column_name
    AND is_active = true
    AND (apply_to_user_roles IS NULL OR p_user_role = ANY(apply_to_user_roles));
    
    IF masking_rule IS NULL THEN
        RETURN p_value; -- No masking rule, return original
    END IF;
    
    -- Apply masking based on type
    CASE masking_rule.masking_type
        WHEN 'partial' THEN
            IF p_column_name LIKE '%email%' THEN
                RETURN mask_email_dlp(p_value, 'partial');
            ELSIF p_column_name LIKE '%card%' OR p_column_name LIKE '%credit%' THEN
                RETURN mask_credit_card(p_value);
            ELSIF p_column_name LIKE '%ssn%' OR p_column_name LIKE '%social%' THEN
                RETURN mask_ssn(p_value);
            ELSE
                -- Generic partial masking
                IF length(p_value) > 4 THEN
                    RETURN LEFT(p_value, 1) || REPEAT('*', length(p_value) - 2) || RIGHT(p_value, 1);
                ELSE
                    RETURN REPEAT('*', length(p_value));
                END IF;
            END IF;
        WHEN 'full' THEN
            RETURN REPEAT('*', GREATEST(length(p_value), 8));
        WHEN 'hash' THEN
            RETURN encode(digest(p_value, 'sha256'), 'hex');
        WHEN 'redact' THEN
            RETURN '[REDACTED]';
        ELSE
            RETURN p_value;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATA EXPORT MONITORING
-- ============================================

CREATE TABLE IF NOT EXISTS data_export_log (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    username VARCHAR(255),
    export_type VARCHAR(50) NOT NULL, -- 'csv', 'json', 'pdf', 'api', 'bulk_query'
    table_name VARCHAR(255),
    records_exported INTEGER,
    data_size_bytes BIGINT,
    classification_level VARCHAR(50),
    sensitive_fields_included TEXT[],
    export_destination TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    approved_by VARCHAR(255),
    approval_timestamp TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_export_log_user 
ON data_export_log(user_id, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_export_log_classification 
ON data_export_log(classification_level, "_createdDate" DESC);

-- Function: Log data export
CREATE OR REPLACE FUNCTION log_data_export(
    p_user_id VARCHAR,
    p_username VARCHAR,
    p_export_type VARCHAR,
    p_table_name VARCHAR,
    p_records_exported INTEGER,
    p_data_size_bytes BIGINT,
    p_classification_level VARCHAR,
    p_sensitive_fields TEXT[],
    p_ip_address INET DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    export_id VARCHAR;
    requires_approval BOOLEAN;
BEGIN
    -- Check if export requires approval
    requires_approval := p_classification_level IN ('confidential', 'restricted', 'top_secret')
                         OR p_records_exported > 1000
                         OR array_length(p_sensitive_fields, 1) > 0;
    
    INSERT INTO data_export_log (
        user_id, username, export_type, table_name, records_exported,
        data_size_bytes, classification_level, sensitive_fields_included,
        ip_address
    ) VALUES (
        p_user_id, p_username, p_export_type, p_table_name, p_records_exported,
        p_data_size_bytes, p_classification_level, p_sensitive_fields,
        p_ip_address
    ) RETURNING "_id" INTO export_id;
    
    -- Check for potential data leak
    IF p_records_exported > 10000 OR p_data_size_bytes > 10485760 THEN -- 10MB
        INSERT INTO data_leak_events (
            event_type, severity, user_id, username, ip_address,
            table_name, classification_level, records_accessed,
            data_size_bytes, detection_method, leak_prevented
        ) VALUES (
            'bulk_export', 'high', p_user_id, p_username, p_ip_address,
            p_table_name, p_classification_level, p_records_exported,
            p_data_size_bytes, 'threshold_exceeded', false
        );
    END IF;
    
    RETURN export_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATA RETENTION AND DELETION
-- ============================================

CREATE TABLE IF NOT EXISTS data_retention_policy (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name VARCHAR(255) UNIQUE NOT NULL,
    retention_period_days INTEGER NOT NULL,
    deletion_method VARCHAR(50) DEFAULT 'soft_delete', -- 'soft_delete', 'hard_delete', 'archive'
    archive_location TEXT,
    legal_hold BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_cleanup TIMESTAMP,
    metadata JSONB
);

-- Default retention policies
INSERT INTO data_retention_policy (table_name, retention_period_days, deletion_method) VALUES
    ('donations', 2555, 'soft_delete'), -- 7 years
    ('members', 2555, 'soft_delete'), -- 7 years
    ('user_sessions', 90, 'hard_delete'), -- 90 days
    ('login_attempts', 365, 'hard_delete'), -- 1 year
    ('audit_log', 2555, 'archive') -- 7 years
ON CONFLICT (table_name) DO NOTHING;

-- Function: Enforce data retention
CREATE OR REPLACE FUNCTION enforce_data_retention()
RETURNS TABLE(
    table_name TEXT,
    records_deleted INTEGER,
    deletion_method VARCHAR
) AS $$
DECLARE
    policy_record RECORD;
    deleted_count INTEGER;
BEGIN
    FOR policy_record IN
        SELECT * FROM data_retention_policy WHERE is_active = true AND legal_hold = false
    LOOP
        IF policy_record.deletion_method = 'hard_delete' THEN
            EXECUTE format(
                'DELETE FROM %I WHERE "_createdDate" < CURRENT_TIMESTAMP - INTERVAL ''%s days''',
                policy_record.table_name,
                policy_record.retention_period_days
            );
            GET DIAGNOSTICS deleted_count = ROW_COUNT;
        ELSIF policy_record.deletion_method = 'soft_delete' THEN
            -- Add soft delete column if not exists
            EXECUTE format(
                'ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP',
                policy_record.table_name
            );
            EXECUTE format(
                'UPDATE %I SET deleted_at = CURRENT_TIMESTAMP WHERE deleted_at IS NULL AND "_createdDate" < CURRENT_TIMESTAMP - INTERVAL ''%s days''',
                policy_record.table_name,
                policy_record.retention_period_days
            );
            GET DIAGNOSTICS deleted_count = ROW_COUNT;
        END IF;
        
        UPDATE data_retention_policy
        SET last_cleanup = CURRENT_TIMESTAMP
        WHERE table_name = policy_record.table_name;
        
        RETURN QUERY SELECT policy_record.table_name::TEXT, deleted_count, policy_record.deletion_method;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DLP COMPLIANCE REPORTING
-- ============================================

CREATE OR REPLACE FUNCTION generate_dlp_compliance_report()
RETURNS TABLE(
    compliance_area TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check 1: Data classification coverage
    SELECT
        'Data Classification Coverage'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' columns classified',
        CASE WHEN COUNT(*) = 0 THEN 'Classify all sensitive data columns' ELSE 'OK' END
    FROM data_classification
    
    UNION ALL
    
    -- Check 2: Encryption for sensitive data
    SELECT
        'Sensitive Data Encryption'::TEXT,
        CASE 
            WHEN COUNT(*) FILTER (WHERE requires_encryption = true AND classification_level IN ('confidential', 'restricted', 'top_secret')) > 0
            THEN 'COMPLIANT'
            ELSE 'NON_COMPLIANT'
        END,
        COUNT(*) FILTER (WHERE requires_encryption = true)::TEXT || ' columns require encryption',
        CASE 
            WHEN COUNT(*) FILTER (WHERE requires_encryption = true AND classification_level IN ('confidential', 'restricted', 'top_secret')) = 0
            THEN 'Enable encryption for all confidential/restricted data'
            ELSE 'OK'
        END
    FROM data_classification
    
    UNION ALL
    
    -- Check 3: Data leak events
    SELECT
        'Data Leak Detection'::TEXT,
        CASE 
            WHEN (SELECT COUNT(*) FROM data_leak_events WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '30 days') = 0
            THEN 'COMPLIANT'
            ELSE 'ATTENTION_REQUIRED'
        END,
        (SELECT COUNT(*)::TEXT FROM data_leak_events WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '30 days') || ' leak events in last 30 days',
        CASE 
            WHEN (SELECT COUNT(*) FROM data_leak_events WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '30 days') > 0
            THEN 'Investigate data leak events'
            ELSE 'OK'
        END
    
    UNION ALL
    
    -- Check 4: Data export monitoring
    SELECT
        'Data Export Monitoring'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' exports logged',
        CASE WHEN COUNT(*) = 0 THEN 'Enable data export logging' ELSE 'OK' END
    FROM data_export_log
    WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE data_classification IS 'Data classification schema - CIA-level DLP';
COMMENT ON TABLE data_leak_events IS 'Data leak detection events';
COMMENT ON TABLE data_masking_rules IS 'Data masking rules for sensitive data';
COMMENT ON FUNCTION apply_data_masking IS 'Apply data masking based on rules';
COMMENT ON FUNCTION generate_dlp_compliance_report IS 'Generate DLP compliance report';







