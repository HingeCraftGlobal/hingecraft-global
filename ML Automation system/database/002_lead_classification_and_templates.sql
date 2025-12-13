-- Lead Classification and Template System
-- Extends existing schema with classification, template mapping, and drive ingestion

-- ============================================
-- TABLE: lead_classifications (Lead Type Classification)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  classification_type VARCHAR(50) NOT NULL, -- 'priority_donor', 'warm_prospect', 'cold_nurture'
  classification_score INTEGER DEFAULT 0, -- 0-100
  classification_signals JSONB, -- {domain_match, title_keywords, company_match, source_weight, etc.}
  classified_at TIMESTAMPTZ DEFAULT NOW(),
  classified_by VARCHAR(50) DEFAULT 'system', -- 'system', 'manual', 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_classifications_lead_id ON lead_classifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_classifications_type ON lead_classifications(classification_type);
CREATE INDEX IF NOT EXISTS idx_lead_classifications_score ON lead_classifications(classification_score DESC);

-- ============================================
-- TABLE: template_mappings (Lead Type → Template Mapping)
-- ============================================
CREATE TABLE IF NOT EXISTS template_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type VARCHAR(50) NOT NULL UNIQUE, -- 'priority_donor', 'warm_prospect', 'cold_nurture'
  template_set VARCHAR(50) NOT NULL, -- 'set_one_student', 'set_two_referral', 'set_three_b2b'
  sequence_id UUID REFERENCES sequences(id),
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_mappings_lead_type ON template_mappings(lead_type);
CREATE INDEX IF NOT EXISTS idx_template_mappings_active ON template_mappings(is_active);

-- ============================================
-- TABLE: drive_ingests (Google Drive File Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS drive_ingests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_file_id VARCHAR(255) UNIQUE NOT NULL,
  filename VARCHAR(500),
  mime_type VARCHAR(100),
  size BIGINT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  anymail_enriched INTEGER DEFAULT 0,
  hubspot_synced INTEGER DEFAULT 0,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  raw_metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_drive_ingests_file_id ON drive_ingests(drive_file_id);
CREATE INDEX IF NOT EXISTS idx_drive_ingests_status ON drive_ingests(status);

-- ============================================
-- TABLE: drive_rows (Parsed Rows from Drive Files)
-- ============================================
CREATE TABLE IF NOT EXISTS drive_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingest_id UUID REFERENCES drive_ingests(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  raw JSONB, -- Original row data
  normalized JSONB, -- Normalized fields: name, company, title, country, timezone, etc.
  processed BOOLEAN DEFAULT FALSE,
  anymail_status VARCHAR(50), -- pending, success, failed, skipped
  anymail_data JSONB, -- AnyMail enrichment results
  hubspot_contact_id VARCHAR(255),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_drive_rows_ingest_id ON drive_rows(ingest_id);
CREATE INDEX IF NOT EXISTS idx_drive_rows_processed ON drive_rows(processed);
CREATE INDEX IF NOT EXISTS idx_drive_rows_hubspot_id ON drive_rows(hubspot_contact_id);

-- ============================================
-- TABLE: drive_ingest_audit (Ingest Event Logging)
-- ============================================
CREATE TABLE IF NOT EXISTS drive_ingest_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingest_id UUID REFERENCES drive_ingests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  action VARCHAR(100) NOT NULL, -- 'file_detected', 'parsed', 'anymail_enriched', 'hubspot_synced', 'classification_complete'
  payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_drive_ingest_audit_ingest_id ON drive_ingest_audit(ingest_id);
CREATE INDEX IF NOT EXISTS idx_drive_ingest_audit_action ON drive_ingest_audit(action);

-- ============================================
-- TABLE: classification_rules (Configurable Classification Rules)
-- ============================================
CREATE TABLE IF NOT EXISTS classification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'domain_whitelist', 'title_keywords', 'company_match', 'source_weight'
  rule_config JSONB NOT NULL, -- Rule-specific configuration
  score_weight INTEGER DEFAULT 0, -- Points added if rule matches
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classification_rules_active ON classification_rules(is_active);

-- ============================================
-- TABLE: hubspot_email_log (HubSpot Email Sending Log)
-- ============================================
CREATE TABLE IF NOT EXISTS hubspot_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  hubspot_message_id VARCHAR(255),
  template_id VARCHAR(255),
  template_set VARCHAR(50), -- 'set_one_student', 'set_two_referral', 'set_three_b2b'
  step_number INTEGER,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, failed
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hubspot_email_log_lead_id ON hubspot_email_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_hubspot_email_log_status ON hubspot_email_log(status);
CREATE INDEX IF NOT EXISTS idx_hubspot_email_log_template_set ON hubspot_email_log(template_set);

-- ============================================
-- UPDATE leads table to include classification fields
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type VARCHAR(50); -- 'priority_donor', 'warm_prospect', 'cold_nurture'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS classification_signals JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS template_set VARCHAR(50); -- Which template set assigned
ALTER TABLE leads ADD COLUMN IF NOT EXISTS drive_ingest_id UUID REFERENCES drive_ingests(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS drive_row_id UUID REFERENCES drive_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_template_set ON leads(template_set);

-- ============================================
-- SEED DATA: Template Mappings
-- ============================================
INSERT INTO template_mappings (lead_type, template_set, priority, is_active)
VALUES
  ('priority_donor', 'set_one_student', 1, true),
  ('warm_prospect', 'set_two_referral', 2, true),
  ('cold_nurture', 'set_three_b2b', 3, true)
ON CONFLICT (lead_type) DO UPDATE
SET template_set = EXCLUDED.template_set, updated_at = NOW();

-- ============================================
-- SEED DATA: Classification Rules
-- ============================================
INSERT INTO classification_rules (rule_name, rule_type, rule_config, score_weight, priority, is_active)
VALUES
  ('High-Value Domains', 'domain_whitelist', '{"domains": ["example-funder.com", "philanthropy.org", "foundation.org", "donor.org"]}', 50, 1, true),
  ('C-Level Titles', 'title_keywords', '{"keywords": ["founder", "ceo", "cto", "co-founder", "c-level", "president", "executive director"]}', 40, 2, true),
  ('Director/Manager Titles', 'title_keywords', '{"keywords": ["director", "manager", "lead", "head", "vp", "vice president"]}', 20, 3, true),
  ('AnyMail Source Bonus', 'source_weight', '{"sources": ["anymail", "anymail_finder", "email_finder"]}', 5, 4, true),
  ('Aspirational Companies', 'company_match', '{"match_type": "db_lookup", "table": "aspirational_companies"}', 30, 5, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get template set for lead type
CREATE OR REPLACE FUNCTION get_template_set_for_lead_type(p_lead_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_template_set VARCHAR;
BEGIN
  SELECT template_set INTO v_template_set
  FROM template_mappings
  WHERE lead_type = p_lead_type AND is_active = true
  ORDER BY priority ASC
  LIMIT 1;
  
  RETURN COALESCE(v_template_set, 'set_three_b2b'); -- Default to B2B
END;
$$ LANGUAGE plpgsql;

-- Function to update template mapping updated_at
CREATE TRIGGER update_template_mappings_updated_at BEFORE UPDATE ON template_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS for Reporting
-- ============================================

CREATE OR REPLACE VIEW lead_classification_summary AS
SELECT 
  l.lead_type,
  COUNT(*) as total_leads,
  AVG(l.lead_score) as avg_score,
  COUNT(*) FILTER (WHERE l.template_set = 'set_one_student') as set_one_count,
  COUNT(*) FILTER (WHERE l.template_set = 'set_two_referral') as set_two_count,
  COUNT(*) FILTER (WHERE l.template_set = 'set_three_b2b') as set_three_count
FROM leads l
WHERE l.lead_type IS NOT NULL
GROUP BY l.lead_type;

CREATE OR REPLACE VIEW drive_ingest_summary AS
SELECT 
  di.id,
  di.filename,
  di.status,
  di.total_rows,
  di.processed_rows,
  di.anymail_enriched,
  di.hubspot_synced,
  COUNT(DISTINCT dr.lead_id) as leads_created,
  COUNT(DISTINCT lc.id) as classifications_complete
FROM drive_ingests di
LEFT JOIN drive_rows dr ON di.id = dr.ingest_id
LEFT JOIN leads l ON dr.lead_id = l.id
LEFT JOIN lead_classifications lc ON l.id = lc.lead_id
GROUP BY di.id, di.filename, di.status, di.total_rows, di.processed_rows, di.anymail_enriched, di.hubspot_synced;
