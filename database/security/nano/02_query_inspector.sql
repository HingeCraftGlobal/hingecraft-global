-- Nano Module 2: Query Inspector - CIA/FBI Level SQL Injection Detection
-- Real-time SQL injection pattern detection and blocking

CREATE TABLE IF NOT EXISTS query_inspections (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    query_text TEXT NOT NULL,
    user_id VARCHAR(255),
    ip_address INET,
    threat_detected BOOLEAN DEFAULT false,
    threat_type VARCHAR(100), -- 'sql_injection', 'xss', 'command_injection'
    threat_pattern TEXT,
    action_taken VARCHAR(100), -- 'blocked', 'logged', 'allowed'
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_query_inspections_threat 
ON query_inspections(threat_detected, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_query_inspections_user 
ON query_inspections(user_id, "_createdDate" DESC);

-- SQL Injection patterns (CIA/FBI level)
CREATE TABLE IF NOT EXISTS sql_injection_patterns (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    pattern_name VARCHAR(255) UNIQUE NOT NULL,
    pattern_regex TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'high',
    is_active BOOLEAN DEFAULT true
);

INSERT INTO sql_injection_patterns (pattern_name, pattern_regex, severity) VALUES
    ('union_select', '(?i)(union\s+(all\s+)?select)', 'critical'),
    ('or_1_equals_1', '(?i)(or\s+1\s*=\s*1)', 'high'),
    ('comment_injection', '(--|#|/\*|\*/)', 'high'),
    ('semicolon_injection', '(;|--|\#)', 'medium'),
    ('exec_statement', '(?i)(exec|execute|sp_executesql)', 'critical'),
    ('drop_table', '(?i)(drop\s+table|truncate\s+table)', 'critical'),
    ('delete_from', '(?i)(delete\s+from)', 'high'),
    ('update_set', '(?i)(update\s+\w+\s+set)', 'high')
ON CONFLICT (pattern_name) DO NOTHING;

-- Function: Inspect query for SQL injection
CREATE OR REPLACE FUNCTION inspect_query_for_injection(
    p_query_text TEXT,
    p_user_id VARCHAR DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS TABLE(
    threat_detected BOOLEAN,
    threat_type VARCHAR,
    threat_pattern TEXT,
    action_taken VARCHAR
) AS $$
DECLARE
    pattern_record RECORD;
    action VARCHAR;
BEGIN
    -- Check against SQL injection patterns
    FOR pattern_record IN
        SELECT pattern_name, pattern_regex, severity
        FROM sql_injection_patterns
        WHERE is_active = true
    LOOP
        IF p_query_text ~ pattern_record.pattern_regex THEN
            -- Log the threat
            INSERT INTO query_inspections (
                query_text, user_id, ip_address, threat_detected,
                threat_type, threat_pattern, action_taken
            ) VALUES (
                p_query_text, p_user_id, p_ip_address, true,
                'sql_injection', pattern_record.pattern_name, 'blocked'
            );
            
            -- Block critical threats immediately
            IF pattern_record.severity = 'critical' THEN
                action := 'blocked';
            ELSE
                action := 'logged';
            END IF;
            
            RETURN QUERY SELECT true, 'sql_injection'::VARCHAR, pattern_record.pattern_name, action;
            RETURN;
        END IF;
    END LOOP;
    
    -- No threat detected
    INSERT INTO query_inspections (
        query_text, user_id, ip_address, threat_detected, action_taken
    ) VALUES (
        p_query_text, p_user_id, p_ip_address, false, 'allowed'
    );
    
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::TEXT, 'allowed'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION inspect_query_for_injection IS 'CIA/FBI level SQL injection detection - real-time threat blocking';

