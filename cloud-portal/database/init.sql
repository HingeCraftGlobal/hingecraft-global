-- =====================================================
-- Cloud Portal Database Initialization
-- =====================================================
-- 
-- This script runs on first database startup
-- to set up the initial admin user and default company
--

-- Create default admin company
INSERT INTO companies (id, name, domain, tier, status)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'HingeCraft Global',
    'hingecraft.global',
    'enterprise',
    'active'
)
ON CONFLICT (domain) DO NOTHING;

-- Note: Default admin user will be created via the Go admin tool
-- This ensures proper password hashing with Argon2id

