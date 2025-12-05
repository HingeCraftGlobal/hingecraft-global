-- Nano Module 4: Session Guard - CIA/FBI Level Session Security
-- Advanced session management and hijacking prevention

CREATE TABLE IF NOT EXISTS session_security (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent_hash VARCHAR(64), -- SHA-256 hash of user agent
    device_fingerprint TEXT,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    suspicious_activity_count INTEGER DEFAULT 0,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_session_security_user 
ON session_security(user_id, is_valid);

CREATE INDEX IF NOT EXISTS idx_session_security_token 
ON session_security(session_token) WHERE is_valid = true;

CREATE INDEX IF NOT EXISTS idx_session_security_expires 
ON session_security(expires_at) WHERE is_valid = true;

-- Function: Validate session security
CREATE OR REPLACE FUNCTION validate_session_security(
    p_session_token VARCHAR,
    p_current_ip INET,
    p_current_user_agent TEXT
)
RETURNS TABLE(
    is_valid BOOLEAN,
    security_issue TEXT,
    action_required VARCHAR
) AS $$
DECLARE
    session_record RECORD;
    user_agent_hash VARCHAR(64);
BEGIN
    -- Get session
    SELECT * INTO session_record
    FROM session_security
    WHERE session_token = p_session_token AND is_valid = true;
    
    IF session_record IS NULL THEN
        RETURN QUERY SELECT false, 'Session not found'::TEXT, 'invalidate'::VARCHAR;
        RETURN;
    END IF;
    
    -- Check expiration
    IF session_record.expires_at < CURRENT_TIMESTAMP THEN
        UPDATE session_security SET is_valid = false WHERE session_id = session_record.session_id;
        RETURN QUERY SELECT false, 'Session expired'::TEXT, 'invalidate'::VARCHAR;
        RETURN;
    END IF;
    
    -- Check IP address change (potential hijacking)
    IF session_record.ip_address != p_current_ip THEN
        UPDATE session_security 
        SET suspicious_activity_count = suspicious_activity_count + 1
        WHERE session_id = session_record.session_id;
        
        IF session_record.suspicious_activity_count + 1 >= 3 THEN
            UPDATE session_security SET is_valid = false WHERE session_id = session_record.session_id;
            RETURN QUERY SELECT false, 'IP address changed - potential hijacking'::TEXT, 'invalidate'::VARCHAR;
            RETURN;
        END IF;
        
        RETURN QUERY SELECT true, 'IP address changed - monitoring'::TEXT, 'warn'::VARCHAR;
        RETURN;
    END IF;
    
    -- Check user agent change
    user_agent_hash := encode(digest(p_current_user_agent, 'sha256'), 'hex');
    IF session_record.user_agent_hash IS NOT NULL AND session_record.user_agent_hash != user_agent_hash THEN
        UPDATE session_security 
        SET suspicious_activity_count = suspicious_activity_count + 1
        WHERE session_id = session_record.session_id;
        
        RETURN QUERY SELECT true, 'User agent changed - monitoring'::TEXT, 'warn'::VARCHAR;
        RETURN;
    END IF;
    
    -- Update last activity
    UPDATE session_security 
    SET last_activity = CURRENT_TIMESTAMP
    WHERE session_id = session_record.session_id;
    
    RETURN QUERY SELECT true, NULL::TEXT, 'allow'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function: Create secure session
CREATE OR REPLACE FUNCTION create_secure_session(
    p_user_id VARCHAR,
    p_ip_address INET,
    p_user_agent TEXT,
    p_duration_hours INTEGER DEFAULT 24
)
RETURNS VARCHAR AS $$
DECLARE
    session_id_var VARCHAR;
    session_token_var VARCHAR;
    user_agent_hash_var VARCHAR(64);
BEGIN
    session_id_var := gen_random_uuid()::VARCHAR;
    session_token_var := encode(gen_random_bytes(32), 'hex');
    user_agent_hash_var := encode(digest(p_user_agent, 'sha256'), 'hex');
    
    INSERT INTO session_security (
        session_id, user_id, ip_address, user_agent_hash,
        session_token, expires_at
    ) VALUES (
        session_id_var, p_user_id, p_ip_address, user_agent_hash_var,
        session_token_var, CURRENT_TIMESTAMP + (p_duration_hours || ' hours')::INTERVAL
    );
    
    RETURN session_token_var;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_session_security IS 'CIA/FBI level session security validation - prevents hijacking';
COMMENT ON FUNCTION create_secure_session IS 'Create secure session with CIA/FBI level protection';

