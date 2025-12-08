-- Governance and Access Rules - Role-Based Access Control
-- Role-based permissions, escalation, audit logs, digital signatures

-- ============================================
-- ROLES
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name text UNIQUE NOT NULL,
    role_type text NOT NULL, -- 'system', 'custom', 'temporary'
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Insert default roles
INSERT INTO roles (role_name, role_type, description) VALUES
    ('admin', 'system', 'Full system administrator'),
    ('finance', 'system', 'Financial operations and treasury'),
    ('compliance', 'system', 'Compliance and legal oversight'),
    ('dev', 'system', 'Developer and technical operations'),
    ('member', 'system', 'Standard member'),
    ('student', 'system', 'Student member'),
    ('moderator', 'system', 'Community moderator'),
    ('instructor', 'system', 'Learning course instructor')
ON CONFLICT (role_name) DO NOTHING;

-- ============================================
-- PERMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name text UNIQUE NOT NULL,
    resource_type text NOT NULL, -- 'user', 'donation', 'project', 'order', 'document', etc
    action text NOT NULL, -- 'create', 'read', 'update', 'delete', 'export', 'approve'
    description text,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Insert common permissions
INSERT INTO permissions (permission_name, resource_type, action, description, is_system) VALUES
    ('users.create', 'user', 'create', 'Create new users', true),
    ('users.read', 'user', 'read', 'Read user data', true),
    ('users.update', 'user', 'update', 'Update user data', true),
    ('users.delete', 'user', 'delete', 'Delete users', true),
    ('donations.create', 'donation', 'create', 'Create donations', true),
    ('donations.read', 'donation', 'read', 'Read donations', true),
    ('donations.approve', 'donation', 'approve', 'Approve donations', true),
    ('treasury.manage', 'treasury', 'update', 'Manage treasury operations', true),
    ('compliance.review', 'compliance', 'read', 'Review compliance data', true),
    ('documents.read', 'document', 'read', 'Read documents', true),
    ('documents.create', 'document', 'create', 'Create documents', true)
ON CONFLICT (permission_name) DO NOTHING;

-- ============================================
-- ROLE PERMISSIONS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at timestamptz DEFAULT now(),
    granted_by uuid REFERENCES users(id),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Grant default permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_name = 'admin' -- Admin gets all permissions
ON CONFLICT DO NOTHING;

-- ============================================
-- USER ROLES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at timestamptz DEFAULT now(),
    assigned_by uuid REFERENCES users(id),
    expires_at timestamptz, -- For temporary roles
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(user_id, role_id) WHERE is_active = true
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- ============================================
-- PERMISSION ESCALATION REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS escalation_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by uuid REFERENCES users(id),
    resource_type text NOT NULL,
    resource_id uuid,
    requested_permission text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
    reviewed_by uuid REFERENCES users(id),
    reviewed_at timestamptz,
    review_notes text,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_escalation_requests_requested_by ON escalation_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_escalation_requests_status ON escalation_requests(status);

-- ============================================
-- DIGITAL SIGNATURES
-- ============================================
CREATE TABLE IF NOT EXISTS digital_signatures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    signer_id uuid REFERENCES users(id),
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    signature_hash text NOT NULL, -- SHA-256 hash of signature
    signature_data text NOT NULL, -- Encrypted signature
    signing_method text DEFAULT 'pgp', -- 'pgp', 'x509', 'blockchain', 'multisig'
    certificate_id uuid,
    signed_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    is_valid boolean DEFAULT true,
    verified_at timestamptz,
    verified_by uuid REFERENCES users(id),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(resource_type, resource_id, signer_id, signed_at)
);

CREATE INDEX IF NOT EXISTS idx_digital_signatures_signer_id ON digital_signatures(signer_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_resource ON digital_signatures(resource_type, resource_id);

-- ============================================
-- FUNCTION: Check User Permission
-- ============================================
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id uuid,
    p_permission_name text,
    p_resource_type text DEFAULT NULL,
    p_resource_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    has_permission boolean := false;
BEGIN
    -- Check if user has role with permission
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
        AND p.permission_name = p_permission_name
        AND (p_resource_type IS NULL OR p.resource_type = p_resource_type)
    ) INTO has_permission;
    
    -- Check for active escalation requests
    IF NOT has_permission THEN
        SELECT EXISTS (
            SELECT 1
            FROM escalation_requests er
            WHERE er.requested_by = p_user_id
            AND er.requested_permission = p_permission_name
            AND er.status = 'approved'
            AND (er.expires_at IS NULL OR er.expires_at > now())
            AND (p_resource_type IS NULL OR er.resource_type = p_resource_type)
            AND (p_resource_id IS NULL OR er.resource_id = p_resource_id)
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE roles IS 'System and custom roles';
COMMENT ON TABLE permissions IS 'Granular permissions';
COMMENT ON TABLE role_permissions IS 'Role-permission mappings';
COMMENT ON TABLE user_roles IS 'User-role assignments';
COMMENT ON TABLE escalation_requests IS 'Permission escalation workflow';
COMMENT ON TABLE digital_signatures IS 'Digital signatures for governance';
COMMENT ON FUNCTION check_user_permission IS 'Check if user has permission';






