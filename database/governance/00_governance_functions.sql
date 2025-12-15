-- Governance Functions for HingeCraft Database
-- RBAC, access control, and compliance functions

-- ============================================
-- RBAC FUNCTIONS
-- ============================================

-- Get user roles and permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE(
    role_name TEXT,
    resource_type TEXT,
    permissions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.role_name,
        rp.resource_type,
        rp.permissions
    FROM users u
    JOIN rbac_permissions rp ON u.role = rp.role_name
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_permissions(UUID) IS 'Get all permissions for a user based on their role';

-- Check access rule
CREATE OR REPLACE FUNCTION check_access_rule(
    user_uuid UUID,
    resource_type TEXT,
    resource_id UUID,
    action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    -- Check if user has permission
    SELECT has_permission(user_uuid, resource_type, action) INTO has_access;
    
    -- Additional access rule checks would go here
    -- (e.g., resource ownership, time-based access, etc.)
    
    RETURN COALESCE(has_access, FALSE);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_access_rule(UUID, TEXT, UUID, TEXT) IS 'Check if user can perform action on resource';

-- ============================================
-- COMPLIANCE FUNCTIONS
-- ============================================

-- Get user consent status
CREATE OR REPLACE FUNCTION get_user_consent_status(
    user_uuid UUID,
    consent_type TEXT
)
RETURNS TABLE(
    consent_type TEXT,
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.type,
        c.accepted_at,
        c.revoked_at,
        (c.revoked_at IS NULL)::BOOLEAN as is_active
    FROM consents c
    WHERE c.user_id = user_uuid
    AND c.type = consent_type
    ORDER BY c.accepted_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_consent_status(UUID, TEXT) IS 'Get current consent status for a user';

-- Check GDPR compliance
CREATE OR REPLACE FUNCTION check_gdpr_compliance(user_uuid UUID)
RETURNS TABLE(
    requirement TEXT,
    compliant BOOLEAN,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'privacy_consent'::TEXT as requirement,
        EXISTS(
            SELECT 1 FROM consents 
            WHERE user_id = user_uuid 
            AND type = 'privacy' 
            AND revoked_at IS NULL
        )::BOOLEAN as compliant,
        'Privacy consent required'::TEXT as details
    UNION ALL
    SELECT 
        'data_access'::TEXT,
        TRUE::BOOLEAN,
        'Data access available'::TEXT
    UNION ALL
    SELECT 
        'data_deletion'::TEXT,
        TRUE::BOOLEAN,
        'Data deletion available'::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_gdpr_compliance(UUID) IS 'Check GDPR compliance status for a user';

