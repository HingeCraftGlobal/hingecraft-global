-- =====================================================
-- Cloud Portal Database Schema
-- PostgreSQL with pgvector extension
-- =====================================================
-- 
-- This schema implements a multi-tenant, ML-powered
-- documentation and data vault system.
--
-- Features:
-- - Multi-company isolation (Row-Level Security)
-- - Vector embeddings for semantic search
-- - Document versioning
-- - Role-based access control
-- - Audit logging
--
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- =====================================================
-- 1. COMPANIES TABLE (Multi-Tenant Core)
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'enterprise', 'government')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_tier ON companies(tier);
CREATE INDEX idx_companies_status ON companies(status);

-- =====================================================
-- 2. ROLES TABLE (RBAC)
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
    ('superuser', 'Full system access'),
    ('admin', 'Company administrator'),
    ('editor', 'Can create and edit documents'),
    ('viewer', 'Read-only access')
ON CONFLICT (role_name) DO NOTHING;

-- =====================================================
-- 3. MEMBERS TABLE (Authentication & Identity)
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,  -- Argon2id hash
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) DEFAULT 4,  -- Default: viewer
    first_name TEXT,
    last_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_company_id ON members(company_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_role_id ON members(role_id);

-- =====================================================
-- 4. MEMBER VAULT (The "Cloud" Data Store)
-- =====================================================
CREATE TABLE IF NOT EXISTS member_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL,  -- e.g., 'document', 'profile_metric', 'log', 'legal_doc'
    raw_data JSONB NOT NULL,  -- The actual content (flexible schema)
    embedding vector(384),  -- 384-dim vector for MiniLM model
    ai_summary TEXT,  -- Auto-generated summary
    ai_tags TEXT[],  -- Extracted entities/categories
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Index for ultra-fast semantic search
CREATE INDEX IF NOT EXISTS idx_member_vault_embedding ON member_vault 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64)
    WHERE embedding IS NOT NULL;

-- GIN Index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_member_vault_raw_data ON member_vault 
    USING GIN (raw_data);

-- Standard indexes
CREATE INDEX idx_member_vault_member_id ON member_vault(member_id);
CREATE INDEX idx_member_vault_company_id ON member_vault(company_id);
CREATE INDEX idx_member_vault_data_type ON member_vault(data_type);
CREATE INDEX idx_member_vault_processing_status ON member_vault(processing_status);
CREATE INDEX idx_member_vault_created_at ON member_vault(created_at);
CREATE INDEX idx_member_vault_is_deleted ON member_vault(is_deleted);

-- Partial index for active company data
CREATE INDEX idx_member_vault_company_active ON member_vault(company_id, created_at)
    WHERE is_deleted = FALSE;

-- =====================================================
-- 5. DOCUMENT VERSIONS (Version Control)
-- =====================================================
CREATE TABLE IF NOT EXISTS doc_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_doc_id UUID NOT NULL REFERENCES member_vault(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content_snapshot JSONB NOT NULL,
    embedding vector(384),
    changed_by UUID REFERENCES members(id),
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(original_doc_id, version_number)
);

CREATE INDEX idx_doc_versions_original_doc_id ON doc_versions(original_doc_id);
CREATE INDEX idx_doc_versions_created_at ON doc_versions(created_at);

-- =====================================================
-- 6. ACCESS LOGS (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    company_id UUID REFERENCES companies(id),
    action TEXT NOT NULL,  -- e.g., 'read', 'write', 'delete', 'search'
    resource_type TEXT,  -- e.g., 'document', 'vault', 'search'
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_logs_member_id ON access_logs(member_id);
CREATE INDEX idx_access_logs_company_id ON access_logs(company_id);
CREATE INDEX idx_access_logs_action ON access_logs(action);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX idx_access_logs_resource_type ON access_logs(resource_type);

-- =====================================================
-- 7. MEMBERSHIPS TABLE (Subscription/Access Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'premium', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memberships_member_id ON memberships(member_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_tier ON memberships(tier);

-- =====================================================
-- 8. ROW-LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on member_vault
ALTER TABLE member_vault ENABLE ROW LEVEL SECURITY;

-- Policy: Members can only see their own company's data
CREATE POLICY company_isolation_policy ON member_vault
    USING (
        company_id = current_setting('app.current_company_id', TRUE)::UUID
        AND is_deleted = FALSE
    );

-- Policy: Members can only see their own data (if needed)
CREATE POLICY member_isolation_policy ON member_vault
    USING (
        member_id = current_setting('app.current_member_id', TRUE)::UUID
        OR current_setting('app.current_role', TRUE) IN ('admin', 'superuser')
    );

-- Enable RLS on access_logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY access_logs_company_policy ON access_logs
    USING (
        company_id = current_setting('app.current_company_id', TRUE)::UUID
        OR current_setting('app.current_role', TRUE) = 'superuser'
    );

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_vault_updated_at BEFORE UPDATE ON member_vault
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-assign company based on email domain
CREATE OR REPLACE FUNCTION assign_company_from_email()
RETURNS TRIGGER AS $$
DECLARE
    email_domain TEXT;
    company_uuid UUID;
BEGIN
    -- Extract domain from email
    email_domain := lower(substring(NEW.email from '@(.+)$'));
    
    -- Find matching company by domain
    SELECT id INTO company_uuid
    FROM companies
    WHERE domain = email_domain;
    
    -- If company found, assign it
    IF company_uuid IS NOT NULL THEN
        NEW.company_id := company_uuid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_company_on_member_insert BEFORE INSERT ON members
    FOR EACH ROW EXECUTE FUNCTION assign_company_from_email();

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to get member's company context
CREATE OR REPLACE FUNCTION get_member_company(member_uuid UUID)
RETURNS UUID AS $$
DECLARE
    company_uuid UUID;
BEGIN
    SELECT company_id INTO company_uuid
    FROM members
    WHERE id = member_uuid;
    
    RETURN company_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function for semantic search (called from Go middleware)
CREATE OR REPLACE FUNCTION semantic_search(
    p_member_id UUID,
    p_query_vector vector(384),
    p_limit INT DEFAULT 5,
    p_similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    raw_data JSONB,
    similarity FLOAT,
    ai_summary TEXT,
    ai_tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mv.id,
        mv.raw_data,
        1 - (mv.embedding <=> p_query_vector) AS similarity,
        mv.ai_summary,
        mv.ai_tags
    FROM member_vault mv
    WHERE mv.member_id = p_member_id
        AND mv.embedding IS NOT NULL
        AND mv.is_deleted = FALSE
        AND mv.processing_status = 'completed'
        AND 1 - (mv.embedding <=> p_query_vector) >= p_similarity_threshold
    ORDER BY mv.embedding <=> p_query_vector
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE companies IS 'Multi-tenant company entities';
COMMENT ON TABLE members IS 'User authentication and identity';
COMMENT ON TABLE member_vault IS 'The core data vault with vector embeddings for semantic search';
COMMENT ON TABLE doc_versions IS 'Version history for documents';
COMMENT ON TABLE access_logs IS 'Audit trail for all access actions';
COMMENT ON TABLE memberships IS 'Subscription and access tier tracking';
COMMENT ON COLUMN member_vault.embedding IS '384-dimensional vector embedding for semantic search';
COMMENT ON COLUMN member_vault.raw_data IS 'Flexible JSONB storage for any data format';

-- =====================================================
-- Schema creation complete
-- =====================================================

