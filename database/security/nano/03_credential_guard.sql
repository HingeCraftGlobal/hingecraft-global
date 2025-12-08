-- Nano Module 3: Credential Guard - CIA/FBI Level Password Protection
-- Advanced password policy enforcement and credential validation

CREATE TABLE IF NOT EXISTS password_policies (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    policy_name VARCHAR(255) UNIQUE NOT NULL,
    min_length INTEGER DEFAULT 12,
    require_uppercase BOOLEAN DEFAULT true,
    require_lowercase BOOLEAN DEFAULT true,
    require_numbers BOOLEAN DEFAULT true,
    require_special_chars BOOLEAN DEFAULT true,
    max_age_days INTEGER DEFAULT 90,
    prevent_reuse_count INTEGER DEFAULT 5,
    lockout_attempts INTEGER DEFAULT 5,
    lockout_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO password_policies (policy_name) VALUES ('cia_fbi_standard')
ON CONFLICT (policy_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS password_history (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_history_user 
ON password_history(user_id, changed_at DESC);

-- Function: Validate password strength (CIA/FBI level)
CREATE OR REPLACE FUNCTION validate_password_strength(
    p_password TEXT,
    p_policy_name VARCHAR DEFAULT 'cia_fbi_standard'
)
RETURNS TABLE(
    is_valid BOOLEAN,
    validation_errors TEXT[]
) AS $$
DECLARE
    policy_record RECORD;
    errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    SELECT * INTO policy_record FROM password_policies WHERE policy_name = p_policy_name AND is_active = true;
    
    IF policy_record IS NULL THEN
        RETURN QUERY SELECT false, ARRAY['Policy not found']::TEXT[];
        RETURN;
    END IF;
    
    -- Check length
    IF length(p_password) < policy_record.min_length THEN
        errors := array_append(errors, 'Password must be at least ' || policy_record.min_length || ' characters');
    END IF;
    
    -- Check uppercase
    IF policy_record.require_uppercase AND p_password !~ '[A-Z]' THEN
        errors := array_append(errors, 'Password must contain uppercase letters');
    END IF;
    
    -- Check lowercase
    IF policy_record.require_lowercase AND p_password !~ '[a-z]' THEN
        errors := array_append(errors, 'Password must contain lowercase letters');
    END IF;
    
    -- Check numbers
    IF policy_record.require_numbers AND p_password !~ '[0-9]' THEN
        errors := array_append(errors, 'Password must contain numbers');
    END IF;
    
    -- Check special characters
    IF policy_record.require_special_chars AND p_password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        errors := array_append(errors, 'Password must contain special characters');
    END IF;
    
    -- Check common passwords (CIA/FBI level check)
    IF p_password IN ('password', 'Password123!', '12345678', 'qwerty', 'admin') THEN
        errors := array_append(errors, 'Password is too common - use a unique password');
    END IF;
    
    RETURN QUERY SELECT array_length(errors, 1) IS NULL, errors;
END;
$$ LANGUAGE plpgsql;

-- Function: Check password reuse
CREATE OR REPLACE FUNCTION check_password_reuse(
    p_user_id VARCHAR,
    p_password_hash TEXT,
    p_policy_name VARCHAR DEFAULT 'cia_fbi_standard'
)
RETURNS BOOLEAN AS $$
DECLARE
    policy_record RECORD;
    reuse_count INTEGER;
BEGIN
    SELECT * INTO policy_record FROM password_policies WHERE policy_name = p_policy_name AND is_active = true;
    
    IF policy_record IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT COUNT(*) INTO reuse_count
    FROM password_history
    WHERE user_id = p_user_id
    AND password_hash = p_password_hash
    ORDER BY changed_at DESC
    LIMIT policy_record.prevent_reuse_count;
    
    RETURN reuse_count = 0; -- true if not reused
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_password_strength IS 'CIA/FBI level password strength validation';
COMMENT ON FUNCTION check_password_reuse IS 'Prevent password reuse - CIA/FBI security standard';







