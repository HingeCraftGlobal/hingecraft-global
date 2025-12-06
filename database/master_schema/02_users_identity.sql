-- Multi-Layer Data Model: User Identity Layer
-- Part of Master Schema - Custom Postgres with full control

-- ============================================
-- USERS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE,
    display_name text,
    role text NOT NULL DEFAULT 'user', -- admin, finance, compliance, dev, member, student
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_student boolean DEFAULT false,
    campus text,
    wallet_addresses jsonb DEFAULT '[]'::jsonb, -- [{chain,address,label,verified_at}]
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Wix compatibility columns
    "_id" VARCHAR(255) UNIQUE,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_campus ON users(campus);
CREATE INDEX IF NOT EXISTS idx_users_wallet_addresses ON users USING gin(wallet_addresses);
CREATE INDEX IF NOT EXISTS idx_users_metadata ON users USING gin(metadata);

-- ============================================
-- USER PROFILES (Extended Identity)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    bio text,
    avatar_url text,
    location jsonb DEFAULT '{}'::jsonb, -- {city, region, country, coordinates}
    social_links jsonb DEFAULT '{}'::jsonb, -- {twitter, linkedin, github, etc}
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles USING gin(location);

-- ============================================
-- CONSENTS (GDPR/CCPA Compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'privacy', 'marketing', 'analytics', 'cookies'
    accepted_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz,
    version text, -- Policy version
    ip_address inet,
    user_agent text,
    details jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_consents_user_id ON consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_type ON consents(type);

-- ============================================
-- USER IDENTITIES (Multi-Identity Support)
-- ============================================
CREATE TABLE IF NOT EXISTS user_identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    identity_type text NOT NULL, -- 'email', 'wallet', 'oauth', 'phone'
    identity_value text NOT NULL,
    provider text, -- For OAuth: 'google', 'github', etc
    verified boolean DEFAULT false,
    verified_at timestamptz,
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(identity_type, identity_value)
);

CREATE INDEX IF NOT EXISTS idx_user_identities_user_id ON user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_identities_type_value ON user_identities(identity_type, identity_value);

COMMENT ON TABLE users IS 'Core user identity table - Multi-layer data model';
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON TABLE consents IS 'GDPR/CCPA consent tracking';
COMMENT ON TABLE user_identities IS 'Multiple identity providers per user';




