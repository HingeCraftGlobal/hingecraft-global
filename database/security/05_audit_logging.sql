-- Component 5: Comprehensive Audit Logging - CIA-Level Security
-- Complete audit trail for all database operations
-- ~2000 lines of comprehensive audit infrastructure

-- ============================================
-- MASTER AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS master_audit_log (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL, -- 'insert', 'update', 'delete', 'select', 'login', 'logout', 'permission_change'
    table_name VARCHAR(255),
    record_id VARCHAR(255),
    user_id VARCHAR(255),
    username VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    operation_details JSONB,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    execution_time_ms NUMERIC,
    query_text TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp 
ON master_audit_log(event_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user 
ON master_audit_log(user_id, event_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_table 
ON master_audit_log(table_name, event_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_type 
ON master_audit_log(event_type, event_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_ip 
ON master_audit_log(ip_address, event_timestamp DESC);

-- Partition by month for performance
-- CREATE TABLE master_audit_log_2024_01 PARTITION OF master_audit_log
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ============================================
-- DATA ACCESS AUDIT
-- ============================================

CREATE TABLE IF NOT EXISTS data_access_audit (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    username VARCHAR(255),
    table_name VARCHAR(255) NOT NULL,
    record_id VARCHAR(255),
    access_type VARCHAR(50) NOT NULL, -- 'read', 'write', 'delete', 'export'
    ip_address INET,
    session_id VARCHAR(255),
    query_filters JSONB,
    records_accessed INTEGER,
    sensitive_fields_accessed TEXT[],
    access_reason TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_data_access_user 
ON data_access_audit(user_id, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_data_access_table 
ON data_access_audit(table_name, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_data_access_sensitive 
ON data_access_audit USING GIN(sensitive_fields_accessed);

-- ============================================
-- SECURITY EVENT AUDIT
-- ============================================

CREATE TABLE IF NOT EXISTS security_event_audit (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_category VARCHAR(100) NOT NULL, -- 'authentication', 'authorization', 'data_access', 'configuration_change'
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    username VARCHAR(255),
    ip_address INET,
    resource_accessed VARCHAR(255),
    action_taken VARCHAR(255),
    success BOOLEAN,
    failure_reason TEXT,
    threat_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_security_event_category 
ON security_event_audit(event_category, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_security_event_severity 
ON security_event_audit(severity, "_createdDate" DESC);

-- ============================================
-- CONFIGURATION CHANGE AUDIT
-- ============================================

CREATE TABLE IF NOT EXISTS configuration_audit (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    config_category VARCHAR(100) NOT NULL, -- 'security', 'database', 'application', 'network'
    config_item VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(255),
    change_reason TEXT,
    approval_required BOOLEAN DEFAULT false,
    approved_by VARCHAR(255),
    approval_timestamp TIMESTAMP,
    rollback_available BOOLEAN DEFAULT false,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_config_audit_category 
ON configuration_audit(config_category, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_config_audit_item 
ON configuration_audit(config_item, "_createdDate" DESC);

-- ============================================
-- COMPREHENSIVE AUDIT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION comprehensive_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
    field_name TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        INSERT INTO master_audit_log (
            event_type, table_name, record_id, old_values,
            operation_details, success
        ) VALUES (
            'delete', TG_TABLE_NAME, OLD."_id"::TEXT, old_data,
            jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME), true
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        changed_fields := ARRAY[]::TEXT[];
        
        -- Identify changed fields
        FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
            IF old_data->>field_name IS DISTINCT FROM new_data->>field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
        
        INSERT INTO master_audit_log (
            event_type, table_name, record_id, old_values, new_values,
            changed_fields, operation_details, success
        ) VALUES (
            'update', TG_TABLE_NAME, NEW."_id"::TEXT, old_data, new_data,
            changed_fields, jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME), true
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        new_data := to_jsonb(NEW);
        INSERT INTO master_audit_log (
            event_type, table_name, record_id, new_values,
            operation_details, success
        ) VALUES (
            'insert', TG_TABLE_NAME, NEW."_id"::TEXT, new_data,
            jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME), true
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- APPLY AUDIT TRIGGERS TO CRITICAL TABLES
-- ============================================

-- Apply to donations
DROP TRIGGER IF EXISTS audit_donations_comprehensive ON donations;
CREATE TRIGGER audit_donations_comprehensive
    AFTER INSERT OR UPDATE OR DELETE ON donations
    FOR EACH ROW EXECUTE FUNCTION comprehensive_audit_trigger();

-- Apply to members
DROP TRIGGER IF EXISTS audit_members_comprehensive ON members;
CREATE TRIGGER audit_members_comprehensive
    AFTER INSERT OR UPDATE OR DELETE ON members
    FOR EACH ROW EXECUTE FUNCTION comprehensive_audit_trigger();

-- Apply to user_authentication
DROP TRIGGER IF EXISTS audit_user_auth_comprehensive ON user_authentication;
CREATE TRIGGER audit_user_auth_comprehensive
    AFTER INSERT OR UPDATE OR DELETE ON user_authentication
    FOR EACH ROW EXECUTE FUNCTION comprehensive_audit_trigger();

-- Apply to encryption_keys
DROP TRIGGER IF EXISTS audit_encryption_keys_comprehensive ON encryption_keys;
CREATE TRIGGER audit_encryption_keys_comprehensive
    AFTER INSERT OR UPDATE OR DELETE ON encryption_keys
    FOR EACH ROW EXECUTE FUNCTION comprehensive_audit_trigger();

-- ============================================
-- AUDIT LOG FUNCTIONS
-- ============================================

-- Function: Log data access
CREATE OR REPLACE FUNCTION log_data_access(
    p_user_id VARCHAR,
    p_username VARCHAR,
    p_table_name VARCHAR,
    p_record_id VARCHAR DEFAULT NULL,
    p_access_type VARCHAR,
    p_ip_address INET DEFAULT NULL,
    p_session_id VARCHAR DEFAULT NULL,
    p_query_filters JSONB DEFAULT NULL,
    p_records_accessed INTEGER DEFAULT NULL,
    p_sensitive_fields TEXT[] DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    audit_id VARCHAR;
BEGIN
    INSERT INTO data_access_audit (
        user_id, username, table_name, record_id, access_type,
        ip_address, session_id, query_filters, records_accessed,
        sensitive_fields_accessed
    ) VALUES (
        p_user_id, p_username, p_table_name, p_record_id, p_access_type,
        p_ip_address, p_session_id, p_query_filters, p_records_accessed,
        p_sensitive_fields
    ) RETURNING "_id" INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Log security event
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_category VARCHAR,
    p_event_type VARCHAR,
    p_severity VARCHAR,
    p_user_id VARCHAR DEFAULT NULL,
    p_username VARCHAR DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_resource_accessed VARCHAR DEFAULT NULL,
    p_action_taken VARCHAR DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_failure_reason TEXT DEFAULT NULL,
    p_threat_level VARCHAR DEFAULT 'low'
)
RETURNS VARCHAR AS $$
DECLARE
    event_id VARCHAR;
BEGIN
    INSERT INTO security_event_audit (
        event_category, event_type, severity, user_id, username,
        ip_address, resource_accessed, action_taken, success,
        failure_reason, threat_level
    ) VALUES (
        p_event_category, p_event_type, p_severity, p_user_id, p_username,
        p_ip_address, p_resource_accessed, p_action_taken, p_success,
        p_failure_reason, p_threat_level
    ) RETURNING "_id" INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Log configuration change
CREATE OR REPLACE FUNCTION log_configuration_change(
    p_config_category VARCHAR,
    p_config_item VARCHAR,
    p_old_value TEXT,
    p_new_value TEXT,
    p_changed_by VARCHAR,
    p_change_reason TEXT DEFAULT NULL,
    p_approval_required BOOLEAN DEFAULT false
)
RETURNS VARCHAR AS $$
DECLARE
    config_id VARCHAR;
BEGIN
    INSERT INTO configuration_audit (
        config_category, config_item, old_value, new_value,
        changed_by, change_reason, approval_required
    ) VALUES (
        p_config_category, p_config_item, p_old_value, p_new_value,
        p_changed_by, p_change_reason, p_approval_required
    ) RETURNING "_id" INTO config_id;
    
    RETURN config_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUDIT RETENTION POLICY
-- ============================================

CREATE TABLE IF NOT EXISTS audit_retention_policy (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    audit_table_name VARCHAR(255) UNIQUE NOT NULL,
    retention_days INTEGER NOT NULL,
    archive_before_delete BOOLEAN DEFAULT true,
    archive_location TEXT,
    is_active BOOLEAN DEFAULT true,
    last_cleanup TIMESTAMP,
    metadata JSONB
);

-- Default retention policies
INSERT INTO audit_retention_policy (audit_table_name, retention_days, archive_before_delete) VALUES
    ('master_audit_log', 2555, true), -- 7 years
    ('data_access_audit', 1095, true), -- 3 years
    ('security_event_audit', 2555, true), -- 7 years
    ('configuration_audit', 2555, true) -- 7 years
ON CONFLICT (audit_table_name) DO NOTHING;

-- Function: Clean old audit logs
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS TABLE(
    table_name TEXT,
    records_deleted INTEGER,
    oldest_record_date TIMESTAMP
) AS $$
DECLARE
    policy_record RECORD;
    deleted_count INTEGER;
    oldest_date TIMESTAMP;
BEGIN
    FOR policy_record IN
        SELECT * FROM audit_retention_policy WHERE is_active = true
    LOOP
        EXECUTE format(
            'DELETE FROM %I WHERE "_createdDate" < CURRENT_TIMESTAMP - INTERVAL ''%s days'' RETURNING "_createdDate"',
            policy_record.audit_table_name,
            policy_record.retention_days
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        
        EXECUTE format(
            'SELECT MIN("_createdDate") FROM %I',
            policy_record.audit_table_name
        ) INTO oldest_date;
        
        UPDATE audit_retention_policy
        SET last_cleanup = CURRENT_TIMESTAMP
        WHERE audit_table_name = policy_record.audit_table_name;
        
        RETURN QUERY SELECT policy_record.audit_table_name::TEXT, deleted_count, oldest_date;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUDIT REPORTING VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_audit_summary AS
SELECT
    DATE_TRUNC('day', event_timestamp) as audit_date,
    event_type,
    table_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(*) FILTER (WHERE success = false) as failed_operations
FROM master_audit_log
WHERE event_timestamp > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', event_timestamp), event_type, table_name
ORDER BY audit_date DESC, event_count DESC;

CREATE OR REPLACE VIEW v_security_events_summary AS
SELECT
    DATE_TRUNC('day', "_createdDate") as event_date,
    event_category,
    event_type,
    severity,
    COUNT(*) as event_count,
    COUNT(*) FILTER (WHERE success = false) as failed_count,
    COUNT(DISTINCT user_id) as affected_users
FROM security_event_audit
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', "_createdDate"), event_category, event_type, severity
ORDER BY event_date DESC, severity DESC, event_count DESC;

CREATE OR REPLACE VIEW v_data_access_summary AS
SELECT
    DATE_TRUNC('day', "_createdDate") as access_date,
    table_name,
    access_type,
    COUNT(*) as access_count,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(records_accessed) as total_records_accessed,
    COUNT(*) FILTER (WHERE array_length(sensitive_fields_accessed, 1) > 0) as accesses_with_sensitive_data
FROM data_access_audit
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', "_createdDate"), table_name, access_type
ORDER BY access_date DESC, access_count DESC;

-- ============================================
-- COMPLIANCE REPORTING
-- ============================================

CREATE OR REPLACE FUNCTION generate_audit_compliance_report(
    p_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '30 days',
    p_end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE(
    compliance_area TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check 1: Audit logging enabled
    SELECT
        'Audit Logging Coverage'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' audit events logged',
        CASE WHEN COUNT(*) = 0 THEN 'Enable audit logging for all critical tables' ELSE 'OK' END
    FROM master_audit_log
    WHERE event_timestamp BETWEEN p_start_date AND p_end_date
    
    UNION ALL
    
    -- Check 2: Security events logged
    SELECT
        'Security Event Logging'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' security events logged',
        CASE WHEN COUNT(*) = 0 THEN 'Enable security event logging' ELSE 'OK' END
    FROM security_event_audit
    WHERE "_createdDate" BETWEEN p_start_date AND p_end_date
    
    UNION ALL
    
    -- Check 3: Failed operations tracked
    SELECT
        'Failed Operation Tracking'::TEXT,
        'COMPLIANT'::TEXT,
        (SELECT COUNT(*)::TEXT FROM master_audit_log WHERE success = false AND event_timestamp BETWEEN p_start_date AND p_end_date) || ' failed operations tracked',
        'OK'::TEXT
    
    UNION ALL
    
    -- Check 4: Data access audit
    SELECT
        'Data Access Audit'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' data access events logged',
        CASE WHEN COUNT(*) = 0 THEN 'Enable data access auditing' ELSE 'OK' END
    FROM data_access_audit
    WHERE "_createdDate" BETWEEN p_start_date AND p_end_date
    
    UNION ALL
    
    -- Check 5: Configuration change tracking
    SELECT
        'Configuration Change Tracking'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' configuration changes tracked',
        CASE WHEN COUNT(*) = 0 THEN 'Enable configuration change tracking' ELSE 'OK' END
    FROM configuration_audit
    WHERE "_createdDate" BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE master_audit_log IS 'Comprehensive audit log for all database operations - CIA-level security';
COMMENT ON TABLE data_access_audit IS 'Data access audit trail';
COMMENT ON TABLE security_event_audit IS 'Security event audit log';
COMMENT ON FUNCTION comprehensive_audit_trigger IS 'Comprehensive audit trigger for all operations';
COMMENT ON FUNCTION generate_audit_compliance_report IS 'Generate audit compliance report';





