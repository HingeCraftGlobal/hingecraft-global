-- Nano Module 1: Rate Limiter - CIA/FBI Level Database Protection
-- Prevents brute force attacks and DoS by limiting request rates

CREATE TABLE IF NOT EXISTS rate_limit_tracker (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    identifier VARCHAR(255) NOT NULL, -- IP, user_id, or session_id
    identifier_type VARCHAR(50) NOT NULL, -- 'ip', 'user', 'session'
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window_duration_seconds INTEGER DEFAULT 60,
    is_blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMP,
    metadata JSONB,
    UNIQUE(identifier, identifier_type, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier 
ON rate_limit_tracker(identifier, identifier_type, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked 
ON rate_limit_tracker(is_blocked, blocked_until) WHERE is_blocked = true;

-- Function: Check and update rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier VARCHAR,
    p_identifier_type VARCHAR,
    p_max_requests INTEGER DEFAULT 100,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    current_window_start TIMESTAMP;
    current_count INTEGER;
    is_currently_blocked BOOLEAN;
BEGIN
    -- Check if currently blocked
    SELECT blocked_until > CURRENT_TIMESTAMP INTO is_currently_blocked
    FROM rate_limit_tracker
    WHERE identifier = p_identifier AND identifier_type = p_identifier_type
    ORDER BY window_start DESC LIMIT 1;
    
    IF is_currently_blocked THEN
        RETURN false; -- Blocked
    END IF;
    
    -- Calculate current window start
    current_window_start := DATE_TRUNC('second', CURRENT_TIMESTAMP - 
        (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER % p_window_seconds || ' seconds')::INTERVAL);
    
    -- Get or create tracker
    INSERT INTO rate_limit_tracker (
        identifier, identifier_type, request_count, window_start, window_duration_seconds
    ) VALUES (
        p_identifier, p_identifier_type, 1, current_window_start, p_window_seconds
    )
    ON CONFLICT (identifier, identifier_type, window_start) 
    DO UPDATE SET request_count = rate_limit_tracker.request_count + 1;
    
    -- Get current count
    SELECT request_count INTO current_count
    FROM rate_limit_tracker
    WHERE identifier = p_identifier AND identifier_type = p_identifier_type
    AND window_start = current_window_start;
    
    -- Block if exceeded
    IF current_count > p_max_requests THEN
        UPDATE rate_limit_tracker
        SET is_blocked = true, blocked_until = CURRENT_TIMESTAMP + (p_window_seconds || ' seconds')::INTERVAL
        WHERE identifier = p_identifier AND identifier_type = p_identifier_type
        AND window_start = current_window_start;
        RETURN false;
    END IF;
    
    RETURN true; -- Allowed
END;
$$ LANGUAGE plpgsql;

-- Function: Clean old rate limit records
CREATE OR REPLACE FUNCTION clean_rate_limit_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limit_tracker
    WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 hour'
    AND is_blocked = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_rate_limit IS 'CIA/FBI level rate limiting - prevents brute force and DoS attacks';

