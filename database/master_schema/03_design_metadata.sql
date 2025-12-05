-- Multi-Layer Data Model: Design Metadata Layer
-- Design projects, versions, assets, and collaboration

-- ============================================
-- DESIGN PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS design_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by uuid REFERENCES users(id),
    title text NOT NULL,
    description text,
    project_type text, -- 'product', 'architecture', 'graphic', 'ui/ux', 'engineering'
    status text DEFAULT 'draft', -- 'draft', 'in_progress', 'review', 'published', 'archived'
    tags text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    published_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Wix compatibility
    "_id" VARCHAR(255) UNIQUE,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_design_projects_created_by ON design_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_design_projects_status ON design_projects(status);
CREATE INDEX IF NOT EXISTS idx_design_projects_tags ON design_projects USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_design_projects_metadata ON design_projects USING gin(metadata);

-- ============================================
-- DESIGN VERSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS design_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES design_projects(id) ON DELETE CASCADE,
    version_number text NOT NULL,
    created_by uuid REFERENCES users(id),
    description text,
    assets jsonb DEFAULT '[]'::jsonb, -- [{type, url, filename, size}]
    design_data jsonb DEFAULT '{}'::jsonb, -- CAD files, schematics, etc
    is_current boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(project_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_design_versions_project_id ON design_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_design_versions_current ON design_versions(project_id, is_current) WHERE is_current = true;

-- ============================================
-- DESIGN ASSETS
-- ============================================
CREATE TABLE IF NOT EXISTS design_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES design_projects(id) ON DELETE CASCADE,
    version_id uuid REFERENCES design_versions(id) ON DELETE SET NULL,
    asset_type text NOT NULL, -- 'image', 'video', '3d_model', 'document', 'code'
    filename text,
    url text,
    storage_key text, -- MinIO/S3 key
    mime_type text,
    size_bytes bigint,
    dimensions jsonb, -- {width, height, depth} for images/models
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_design_assets_project_id ON design_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_design_assets_type ON design_assets(asset_type);

-- ============================================
-- DESIGN COLLABORATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS design_collaborations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES design_projects(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role text NOT NULL, -- 'owner', 'editor', 'viewer', 'commenter'
    permissions jsonb DEFAULT '{}'::jsonb, -- Granular permissions
    invited_at timestamptz DEFAULT now(),
    joined_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_design_collaborations_project_id ON design_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_design_collaborations_user_id ON design_collaborations(user_id);

COMMENT ON TABLE design_projects IS 'Design project master records';
COMMENT ON TABLE design_versions IS 'Version control for design projects';
COMMENT ON TABLE design_assets IS 'Assets associated with designs';
COMMENT ON TABLE design_collaborations IS 'Multi-user collaboration on designs';

