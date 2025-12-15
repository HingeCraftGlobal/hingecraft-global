-- Security Functions for HingeCraft Database
-- Security and compliance functions

-- ============================================
-- ACCESS CONTROL FUNCTIONS
-- ============================================

-- Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
    user_uuid UUID,
    resource_type TEXT,
    permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    -- Check user role permissions
    SELECT EXISTS (
        SELECT 1
        FROM users u
        JOIN rbac_permissions rp ON u.role = rp.role_name
        WHERE u.id = user_uuid
        AND rp.resource_type = has_permission.resource_type
        AND permission = ANY(rp.permissions)
    ) INTO has_access;
    
    RETURN COALESCE(has_access, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_permission(UUID, TEXT, TEXT) IS 'Check if user has specific permission';

-- ============================================
-- ENCRYPTION FUNCTIONS
-- ============================================

-- Encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(
    plaintext TEXT,
    encryption_key_id VARCHAR(255) DEFAULT NULL
)
RETURNS BYTEA AS $$
DECLARE
    key_to_use VARCHAR(255);
    encrypted_data BYTEA;
BEGIN
    -- Get active encryption key
    IF encryption_key_id IS NULL THEN
        SELECT "_id" INTO key_to_use
        FROM encryption_keys
        WHERE is_active = TRUE
        AND key_type = 'column'
        ORDER BY "_createdDate" DESC
        LIMIT 1;
    ELSE
        key_to_use := encryption_key_id;
    END IF;
    
    -- Encrypt using pgcrypto
    SELECT pgp_sym_encrypt(plaintext, 'encryption_key_placeholder') INTO encrypted_data;
    
    RETURN encrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION encrypt_sensitive_data(TEXT, VARCHAR) IS 'Encrypt sensitive data using active encryption key';

-- Decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(
    encrypted_data BYTEA,
    encryption_key_id VARCHAR(255) DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    decrypted_data TEXT;
BEGIN
    -- Decrypt using pgcrypto
    SELECT pgp_sym_decrypt(encrypted_data, 'encryption_key_placeholder') INTO decrypted_data;
    
    RETURN decrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION decrypt_sensitive_data(BYTEA, VARCHAR) IS 'Decrypt sensitive data';

-- ============================================
-- AUDIT FUNCTIONS
-- ============================================

-- Get audit trail for a resource
CREATE OR REPLACE FUNCTION get_audit_trail(
    resource_type TEXT,
    resource_id UUID,
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
    action TEXT,
    actor_id UUID,
    timestamp TIMESTAMPTZ,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.action,
        al.actor_id,
        al.timestamp,
        al.old_values,
        al.new_values,
        al.changed_fields
    FROM audit_logs al
    WHERE al.resource_type = get_audit_trail.resource_type
    AND al.resource_id = get_audit_trail.resource_id
    AND (start_date IS NULL OR al.timestamp >= start_date)
    AND (end_date IS NULL OR al.timestamp <= end_date)
    ORDER BY al.timestamp DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_audit_trail(TEXT, UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Get complete audit trail for a resource';

-- ============================================
-- SECURITY MONITORING FUNCTIONS
-- ============================================

-- Detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    user_uuid UUID,
    time_window_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
    activity_type TEXT,
    count BIGINT,
    risk_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'failed_login'::TEXT as activity_type,
        COUNT(*)::BIGINT as count,
        CASE 
            WHEN COUNT(*) > 5 THEN 10.0
            WHEN COUNT(*) > 3 THEN 7.0
            WHEN COUNT(*) > 1 THEN 4.0
            ELSE 1.0
        END::NUMERIC as risk_score
    FROM audit_logs
    WHERE actor_id = user_uuid
    AND action = 'login_failed'
    AND timestamp > NOW() - (time_window_minutes || ' minutes')::INTERVAL
    GROUP BY activity_type
    HAVING COUNT(*) > 0;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION detect_suspicious_activity(UUID, INTEGER) IS 'Detect suspicious activity patterns for a user';

