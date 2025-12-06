-- Governance: Audit Logs and Compliance
-- Comprehensive audit trail, compliance reporting, retention policies

-- ============================================
-- ENHANCED AUDIT LOGS (Extends master audit_logs)
-- ============================================
-- Note: audit_logs table already exists in master_schema
-- This adds governance-specific enhancements

-- ============================================
-- COMPLIANCE POLICIES
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name text UNIQUE NOT NULL,
    policy_type text NOT NULL, -- 'gdpr', 'ccpa', 'hipaa', 'sox', 'ofac', 'aml', 'kyc'
    policy_version text NOT NULL,
    description text,
    requirements jsonb DEFAULT '{}'::jsonb, -- Structured requirements
    applicable_resources text[], -- Resource types this applies to
    is_active boolean DEFAULT true,
    effective_date date NOT NULL,
    expiry_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES users(id),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_compliance_policies_type ON compliance_policies(policy_type, is_active);
CREATE INDEX IF NOT EXISTS idx_compliance_policies_effective ON compliance_policies(effective_date, expiry_date);

-- ============================================
-- COMPLIANCE VIOLATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_violations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id uuid REFERENCES compliance_policies(id),
    violation_type text NOT NULL,
    severity text DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    resource_type text,
    resource_id uuid,
    user_id uuid REFERENCES users(id),
    description text NOT NULL,
    detected_at timestamptz DEFAULT now(),
    resolved_at timestamptz,
    resolved_by uuid REFERENCES users(id),
    resolution_notes text,
    status text DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_compliance_violations_policy_id ON compliance_violations(policy_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_status ON compliance_violations(status, severity);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_user_id ON compliance_violations(user_id);

-- ============================================
-- DATA RETENTION POLICIES
-- ============================================
CREATE TABLE IF NOT EXISTS retention_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name text UNIQUE NOT NULL,
    resource_type text NOT NULL,
    retention_period_days integer NOT NULL,
    retention_action text DEFAULT 'archive', -- 'archive', 'delete', 'anonymize'
    archive_location text,
    is_active boolean DEFAULT true,
    last_run_at timestamptz,
    next_run_at timestamptz,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_retention_policies_resource_type ON retention_policies(resource_type, is_active);

-- ============================================
-- DATA DELETION REQUESTS (GDPR/CCPA)
-- ============================================
CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    request_type text DEFAULT 'account_deletion', -- 'account_deletion', 'data_export', 'data_anonymization'
    status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    requested_at timestamptz DEFAULT now(),
    processed_at timestamptz,
    processed_by uuid REFERENCES users(id),
    verification_token text UNIQUE,
    verification_expires_at timestamptz,
    verified_at timestamptz,
    deletion_log jsonb DEFAULT '{}'::jsonb, -- What was deleted
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status ON data_deletion_requests(status);

-- ============================================
-- AUDIT RETENTION CONFIGURATION
-- ============================================
CREATE TABLE IF NOT EXISTS audit_retention_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_type text UNIQUE NOT NULL, -- 'all', 'user_actions', 'data_access', 'admin_actions', 'compliance'
    retention_days integer NOT NULL,
    archive_after_days integer,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Default retention: 7 years for compliance
INSERT INTO audit_retention_config (audit_type, retention_days, archive_after_days) VALUES
    ('all', 2555, 365), -- 7 years total, archive after 1 year
    ('compliance', 2555, 0), -- 7 years, no archive
    ('user_actions', 1095, 365), -- 3 years total, archive after 1 year
    ('data_access', 2555, 365), -- 7 years for data access logs
    ('admin_actions', 2555, 0) -- 7 years, no archive for admin actions
ON CONFLICT (audit_type) DO NOTHING;

-- ============================================
-- COMPLIANCE REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type text NOT NULL, -- 'gdpr', 'ccpa', 'audit', 'security', 'data_retention'
    report_period_start date NOT NULL,
    report_period_end date NOT NULL,
    generated_by uuid REFERENCES users(id),
    generated_at timestamptz DEFAULT now(),
    report_data jsonb DEFAULT '{}'::jsonb, -- Structured report data
    report_url text, -- Link to generated PDF/report
    status text DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published'
    approved_by uuid REFERENCES users(id),
    approved_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type, report_period_end DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports(status);

COMMENT ON TABLE compliance_policies IS 'Compliance policy definitions (GDPR, CCPA, etc)';
COMMENT ON TABLE compliance_violations IS 'Compliance violation tracking';
COMMENT ON TABLE retention_policies IS 'Data retention policy configuration';
COMMENT ON TABLE data_deletion_requests IS 'GDPR/CCPA data deletion requests';
COMMENT ON TABLE audit_retention_config IS 'Audit log retention configuration';
COMMENT ON TABLE compliance_reports IS 'Generated compliance reports';



