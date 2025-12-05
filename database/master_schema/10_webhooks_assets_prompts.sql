-- Multi-Layer Data Model: Supporting Infrastructure
-- Webhooks, assets, prompts/LLM outputs, audit logs

-- ============================================
-- WEBHOOKS
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL, -- 'stripe', 'coinbase', 'solana', 'stellar', 'custom'
    event_type text,
    payload jsonb,
    received_at timestamptz DEFAULT now(),
    processed boolean DEFAULT false,
    processed_at timestamptz,
    error_message text,
    retry_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_webhooks_provider ON webhooks(provider, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhooks(processed, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_event_type ON webhooks(event_type);

-- ============================================
-- ASSETS (MinIO/S3 Storage Metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    key text UNIQUE NOT NULL, -- Storage key (MinIO/S3)
    url text,
    filename text,
    size bigint,
    mime text,
    storage_provider text DEFAULT 'minio', -- 'minio', 's3', 'gcs', 'azure'
    bucket text,
    is_public boolean DEFAULT false,
    expires_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_assets_key ON assets(key);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_mime ON assets(mime);

-- ============================================
-- PROMPT RUNS (LLM Outputs)
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    prompt text NOT NULL,
    prompt_template_id uuid, -- References prompt template if used
    model text NOT NULL, -- 'gpt-4', 'claude-3', 'llama-2', etc
    inputs jsonb DEFAULT '{}'::jsonb, -- Input variables
    outputs jsonb DEFAULT '{}'::jsonb, -- LLM outputs
    tokens_input integer DEFAULT 0,
    tokens_output integer DEFAULT 0,
    cost_usd numeric(10,6) DEFAULT 0.0,
    latency_ms integer,
    success boolean DEFAULT true,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_prompt_runs_created_by ON prompt_runs(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_runs_model ON prompt_runs(model);
CREATE INDEX IF NOT EXISTS idx_prompt_runs_template ON prompt_runs(prompt_template_id);

-- ============================================
-- PROMPT TEMPLATES (Reusable Prompts Library)
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name text UNIQUE NOT NULL,
    category text, -- 'design', 'content', 'compliance', 'development', 'governance', 'onboarding'
    description text,
    prompt_text text NOT NULL,
    variables jsonb DEFAULT '{}'::jsonb, -- {var_name: {type, description, default}}
    model_preferences text[], -- Preferred models
    version integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    usage_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category, is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_name ON prompt_templates(template_name);

-- ============================================
-- AUDIT LOGS (Immutable)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES users(id),
    action text NOT NULL, -- 'create', 'update', 'delete', 'read', 'export', 'login', 'logout'
    resource_type text, -- 'user', 'donation', 'project', 'order', etc
    resource_id uuid,
    timestamp timestamptz DEFAULT now(),
    ip_address inet,
    user_agent text,
    request_id text,
    details jsonb DEFAULT '{}'::jsonb,
    old_values jsonb,
    new_values jsonb,
    changed_fields text[]
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, timestamp DESC);

-- Partition by month for performance (example)
-- CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs
-- FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

COMMENT ON TABLE webhooks IS 'Incoming webhook events from external providers';
COMMENT ON TABLE assets IS 'File storage metadata (MinIO/S3)';
COMMENT ON TABLE prompt_runs IS 'LLM prompt execution logs and outputs';
COMMENT ON TABLE prompt_templates IS 'Reusable prompt template library (100+ prompts)';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all operations';

