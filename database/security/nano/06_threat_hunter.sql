-- Nano Module 6: Threat Hunter - CIA/FBI Level Active Threat Detection
-- Proactive threat hunting and anomaly detection

CREATE TABLE IF NOT EXISTS threat_indicators (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    indicator_type VARCHAR(50) NOT NULL, -- 'ip', 'user', 'pattern', 'behavior'
    indicator_value TEXT NOT NULL,
    threat_level VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    confidence_score NUMERIC(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    occurrence_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_threat_indicators_type 
ON threat_indicators(indicator_type, indicator_value);

CREATE INDEX IF NOT EXISTS idx_threat_indicators_level 
ON threat_indicators(threat_level, is_active);

-- Function: Hunt for threats
CREATE OR REPLACE FUNCTION hunt_threats(
    p_time_window_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
    threat_type VARCHAR,
    indicator_value TEXT,
    threat_level VARCHAR,
    occurrence_count INTEGER,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Hunt 1: Multiple failed logins from same IP
    SELECT
        'brute_force'::VARCHAR,
        ip_address::TEXT,
        CASE WHEN COUNT(*) > 10 THEN 'critical' WHEN COUNT(*) > 5 THEN 'high' ELSE 'medium' END,
        COUNT(*)::INTEGER,
        'Block IP address and investigate'::TEXT
    FROM login_attempts
    WHERE attempt_result != 'success'
    AND "_createdDate" > CURRENT_TIMESTAMP - (p_time_window_hours || ' hours')::INTERVAL
    GROUP BY ip_address
    HAVING COUNT(*) > 3
    
    UNION ALL
    
    -- Hunt 2: Unusual data access patterns
    SELECT
        'data_access_anomaly'::VARCHAR,
        user_id,
        CASE WHEN SUM(records_accessed) > 100000 THEN 'high' ELSE 'medium' END,
        COUNT(*)::INTEGER,
        'Review user access patterns'::TEXT
    FROM data_access_audit
    WHERE "_createdDate" > CURRENT_TIMESTAMP - (p_time_window_hours || ' hours')::INTERVAL
    GROUP BY user_id
    HAVING SUM(records_accessed) > 10000
    
    UNION ALL
    
    -- Hunt 3: SQL injection attempts
    SELECT
        'sql_injection'::VARCHAR,
        source_ip::TEXT,
        'high'::VARCHAR,
        COUNT(*)::INTEGER,
        'Block IP and investigate'::TEXT
    FROM intrusion_events
    WHERE event_type = 'sql_injection'
    AND "_createdDate" > CURRENT_TIMESTAMP - (p_time_window_hours || ' hours')::INTERVAL
    GROUP BY source_ip
    HAVING COUNT(*) > 0
    
    UNION ALL
    
    -- Hunt 4: Privilege escalation attempts
    SELECT
        'privilege_escalation'::VARCHAR,
        user_id,
        'critical'::VARCHAR,
        COUNT(*)::INTEGER,
        'Immediate investigation required'::TEXT
    FROM security_event_audit
    WHERE event_type LIKE '%permission%' OR event_type LIKE '%privilege%'
    AND success = false
    AND "_createdDate" > CURRENT_TIMESTAMP - (p_time_window_hours || ' hours')::INTERVAL
    GROUP BY user_id
    HAVING COUNT(*) > 0;
END;
$$ LANGUAGE plpgsql;

-- Function: Record threat indicator
CREATE OR REPLACE FUNCTION record_threat_indicator(
    p_indicator_type VARCHAR,
    p_indicator_value TEXT,
    p_threat_level VARCHAR,
    p_confidence_score NUMERIC DEFAULT 0.5
)
RETURNS VARCHAR AS $$
DECLARE
    indicator_id VARCHAR;
BEGIN
    INSERT INTO threat_indicators (
        indicator_type, indicator_value, threat_level,
        confidence_score, occurrence_count
    ) VALUES (
        p_indicator_type, p_indicator_value, p_threat_level,
        p_confidence_score, 1
    )
    ON CONFLICT (indicator_type, indicator_value) 
    DO UPDATE SET
        occurrence_count = threat_indicators.occurrence_count + 1,
        last_seen = CURRENT_TIMESTAMP,
        threat_level = GREATEST(threat_indicators.threat_level, EXCLUDED.threat_level)
    RETURNING "_id" INTO indicator_id;
    
    RETURN indicator_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hunt_threats IS 'CIA/FBI level proactive threat hunting';
COMMENT ON FUNCTION record_threat_indicator IS 'Record threat indicators for continuous monitoring';


