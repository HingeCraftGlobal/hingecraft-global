-- HingeCraft ML Automation System Database Schema
-- PostgreSQL Database Schema for Lead Automation Pipeline

-- ============================================
-- TABLE: leads (Canonical Lead Store)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    organization VARCHAR(255),
    title VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    
    -- Source tracking
    source VARCHAR(100) DEFAULT 'google_drive',
    source_file_id VARCHAR(255),
    source_row_number INTEGER,
    
    -- Enrichment fields
    gs_id VARCHAR(255), -- GenSpark ID
    persona_score INTEGER DEFAULT 0,
    fm_stage VARCHAR(50), -- Ferguson Matrix stage
    bpsd_tag TEXT[], -- BPSD tags array
    preferred_tone VARCHAR(50),
    
    -- Status fields
    has_donated BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'new', -- new, enriched, contacted, converted, suppressed
    tier INTEGER DEFAULT 1,
    
    -- Fingerprinting for deduplication
    fingerprint VARCHAR(64) UNIQUE,
    
    -- Metadata
    raw_meta JSONB,
    enrichment_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    enriched_at TIMESTAMPTZ,
    last_contacted_at TIMESTAMPTZ
);

-- ============================================
-- TABLE: staging_leads (Temporary staging)
-- ============================================
CREATE TABLE IF NOT EXISTS staging_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL,
    source VARCHAR(100) DEFAULT 'google_drive',
    file_id VARCHAR(255),
    row_number INTEGER,
    raw_row JSONB,
    normalized JSONB,
    fingerprint VARCHAR(64),
    status VARCHAR(50) DEFAULT 'pending', -- pending, duplicate, validated, error, queued
    validation_errors TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- ============================================
-- TABLE: import_batches (Import tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100) NOT NULL,
    file_id VARCHAR(255),
    filename VARCHAR(500),
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, error
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- ============================================
-- TABLE: sequences (Email sequence definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sequence_type VARCHAR(50) NOT NULL, -- welcome, nurture, donation, reactivation
    total_steps INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: sequence_steps (Individual email steps)
-- ============================================
CREATE TABLE IF NOT EXISTS sequence_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    delay_hours INTEGER DEFAULT 24,
    template_id VARCHAR(255),
    subject_template TEXT,
    body_template TEXT,
    conditions JSONB, -- Conditions for sending (requires_open, requires_click, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: lead_sequences (Lead enrollment tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, exited
    last_sent_at TIMESTAMPTZ,
    next_action_due TIMESTAMPTZ,
    conditions_met JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: email_logs (Email sending history)
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    sequence_id UUID REFERENCES sequences(id) ON DELETE SET NULL,
    step_number INTEGER,
    provider VARCHAR(50) NOT NULL, -- anymail, gmail, hubspot
    provider_message_id VARCHAR(255),
    to_email VARCHAR(255) NOT NULL,
    subject TEXT,
    template_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'queued', -- queued, sent, delivered, opened, clicked, bounced, replied
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    bounce_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: hubspot_sync (HubSpot synchronization tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS hubspot_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    hubspot_contact_id VARCHAR(255) UNIQUE,
    hubspot_company_id VARCHAR(255),
    enrolled_sequence BOOLEAN DEFAULT FALSE,
    hubspot_sequence_id VARCHAR(255),
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(50) DEFAULT 'pending', -- pending, synced, error
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: message_logs (Event tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS message_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    provider VARCHAR(50),
    provider_message_id VARCHAR(255),
    campaign_id VARCHAR(255),
    event_type VARCHAR(50), -- open, click, bounce, complaint, delivered, reply
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: suppression_list (Suppressed contacts)
-- ============================================
CREATE TABLE IF NOT EXISTS suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    reason VARCHAR(100), -- unsubscribe, bounce, complaint, manual
    suppressed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: audit_log (System audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(255) DEFAULT 'system',
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100), -- lead, sequence, email, etc.
    entity_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_fingerprint ON leads(fingerprint);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_staging_fingerprint ON staging_leads(fingerprint);
CREATE INDEX IF NOT EXISTS idx_staging_import_id ON staging_leads(import_id);
CREATE INDEX IF NOT EXISTS idx_staging_status ON staging_leads(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_provider_msg_id ON email_logs(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_lead_sequences_lead_id ON lead_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_sequences_status ON lead_sequences(status);
CREATE INDEX IF NOT EXISTS idx_hubspot_sync_lead_id ON hubspot_sync(lead_id);
CREATE INDEX IF NOT EXISTS idx_hubspot_sync_contact_id ON hubspot_sync(hubspot_contact_id);
CREATE INDEX IF NOT EXISTS idx_suppression_email ON suppression_list(email);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_sequences_updated_at BEFORE UPDATE ON lead_sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hubspot_sync_updated_at BEFORE UPDATE ON hubspot_sync
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to compute fingerprint
CREATE OR REPLACE FUNCTION compute_fingerprint(
    p_email VARCHAR,
    p_name VARCHAR,
    p_org VARCHAR,
    p_domain VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
    normalized_email VARCHAR;
    normalized_name VARCHAR;
    normalized_org VARCHAR;
    normalized_domain VARCHAR;
    fingerprint_string TEXT;
BEGIN
    -- Normalize inputs
    normalized_email := LOWER(TRIM(COALESCE(p_email, '')));
    normalized_name := LOWER(REGEXP_REPLACE(COALESCE(p_name, ''), '[^a-z0-9]', '', 'g'));
    normalized_org := LOWER(REGEXP_REPLACE(COALESCE(p_org, ''), '[^a-z0-9]', '', 'g'));
    normalized_domain := LOWER(REGEXP_REPLACE(COALESCE(p_domain, ''), '^www\.', '', 'g'));
    
    -- Create fingerprint string
    fingerprint_string := normalized_email || '|' || normalized_name || '|' || normalized_org || '|' || normalized_domain;
    
    -- Return SHA256 hash (first 64 chars)
    RETURN SUBSTRING(ENCODE(DIGEST(fingerprint_string, 'sha256'), 'hex'), 1, 64);
END;
$$ LANGUAGE plpgsql;
