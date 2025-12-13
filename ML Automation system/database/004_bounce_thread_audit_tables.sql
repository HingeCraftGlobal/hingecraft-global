-- ============================================
-- DATABASE MIGRATION: Bounce, Thread, Audit Enhancement
-- Migration: 004_bounce_thread_audit_tables.sql
-- Purpose: Add tables for bounce handling, thread joining, multi-segment reconciliation, and enhanced audit
-- ============================================

-- ============================================
-- TABLE: email_bounces (Detailed Bounce Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS email_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_log_id UUID REFERENCES email_logs(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL, -- 'gmail', 'anymail', 'hubspot'
  provider_message_id VARCHAR(255),
  bounce_type VARCHAR(50) NOT NULL, -- 'hard', 'soft', 'transient', 'permanent'
  bounce_category VARCHAR(100), -- 'invalid_email', 'mailbox_full', 'domain_not_found', etc.
  bounce_subcategory VARCHAR(100),
  bounce_reason TEXT,
  bounce_code VARCHAR(50), -- SMTP error code
  recipient_email VARCHAR(255) NOT NULL,
  recipient_domain VARCHAR(255),
  severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  is_suppressed BOOLEAN DEFAULT FALSE,
  suppression_reason VARCHAR(100),
  suppression_expires_at TIMESTAMPTZ, -- NULL for permanent, timestamp for temporary
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_retry_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  bounce_metadata JSONB, -- Raw bounce payload
  raw_payload JSONB, -- Full webhook payload
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_bounces_email_log_id ON email_bounces(email_log_id);
CREATE INDEX IF NOT EXISTS idx_email_bounces_lead_id ON email_bounces(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_bounces_recipient_email ON email_bounces(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_bounces_bounce_type ON email_bounces(bounce_type);
CREATE INDEX IF NOT EXISTS idx_email_bounces_is_suppressed ON email_bounces(is_suppressed);
CREATE INDEX IF NOT EXISTS idx_email_bounces_next_retry_at ON email_bounces(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- ============================================
-- TABLE: email_threads (Thread Tracking for Reply Detection)
-- ============================================
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  thread_id VARCHAR(255) NOT NULL, -- Gmail thread ID or message thread ID
  original_message_id VARCHAR(255), -- First message in thread
  latest_message_id VARCHAR(255), -- Most recent message
  subject VARCHAR(500),
  participant_emails TEXT[], -- All email addresses in thread
  message_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id)
);

CREATE INDEX IF NOT EXISTS idx_email_threads_lead_id ON email_threads(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_thread_id ON email_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_is_active ON email_threads(is_active);
CREATE INDEX IF NOT EXISTS idx_email_threads_last_activity ON email_threads(last_activity_at DESC);

-- ============================================
-- TABLE: email_replies (Reply Detection & Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS email_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES email_threads(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  email_log_id UUID REFERENCES email_logs(id) ON DELETE SET NULL, -- Original sent email
  provider VARCHAR(50) NOT NULL,
  provider_message_id VARCHAR(255) NOT NULL,
  in_reply_to VARCHAR(255), -- Message-ID this replies to
  references_header TEXT, -- References header
  reply_from_email VARCHAR(255) NOT NULL,
  reply_to_email VARCHAR(255),
  subject VARCHAR(500),
  body_preview TEXT, -- First 500 chars
  is_auto_reply BOOLEAN DEFAULT FALSE,
  is_out_of_office BOOLEAN DEFAULT FALSE,
  is_vacation_message BOOLEAN DEFAULT FALSE,
  is_human_reply BOOLEAN DEFAULT FALSE,
  sentiment VARCHAR(50), -- 'positive', 'neutral', 'negative' (optional)
  reply_timestamp TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  automation_paused BOOLEAN DEFAULT FALSE,
  pause_reason VARCHAR(100),
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_replies_thread_id ON email_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_lead_id ON email_replies(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_email_log_id ON email_replies(email_log_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_provider_msg_id ON email_replies(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_is_human ON email_replies(is_human_reply);
CREATE INDEX IF NOT EXISTS idx_email_replies_automation_paused ON email_replies(automation_paused);
CREATE INDEX IF NOT EXISTS idx_email_replies_detected_at ON email_replies(detected_at DESC);

-- ============================================
-- TABLE: email_tracking (Open & Click Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_log_id UUID REFERENCES email_logs(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  tracking_type VARCHAR(50) NOT NULL, -- 'open', 'click', 'unsubscribe'
  tracking_token VARCHAR(255) UNIQUE NOT NULL, -- Unique token for tracking pixel/link
  tracking_url TEXT, -- URL that was clicked (for click tracking)
  user_agent TEXT,
  ip_address INET,
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  client_type VARCHAR(100), -- 'gmail', 'outlook', 'apple_mail', etc.
  first_occurrence BOOLEAN DEFAULT TRUE, -- First open/click
  occurrence_count INTEGER DEFAULT 1,
  tracked_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_tracking_email_log_id ON email_tracking(email_log_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_lead_id ON email_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_token ON email_tracking(tracking_token);
CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON email_tracking(tracking_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_tracked_at ON email_tracking(tracked_at DESC);

-- ============================================
-- TABLE: lead_segments (Multi-Segment Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  segment_type VARCHAR(50) NOT NULL, -- 'primary', 'secondary', 'tertiary', 'behavioral'
  segment_name VARCHAR(100) NOT NULL, -- 'ngo', 'school', 'student', 'media', etc.
  segment_value VARCHAR(255), -- Specific value within segment
  confidence_score DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 1.00
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  source VARCHAR(100), -- 'classification', 'manual', 'inference', 'historical'
  evidence JSONB, -- Evidence that led to this segment assignment
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for permanent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, segment_type, segment_name)
);

CREATE INDEX IF NOT EXISTS idx_lead_segments_lead_id ON lead_segments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_segments_segment_name ON lead_segments(segment_name);
CREATE INDEX IF NOT EXISTS idx_lead_segments_is_primary ON lead_segments(is_primary);
CREATE INDEX IF NOT EXISTS idx_lead_segments_is_active ON lead_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_lead_segments_confidence ON lead_segments(confidence_score DESC);

-- ============================================
-- TABLE: segment_conflicts (Multi-Segment Conflict Resolution)
-- ============================================
CREATE TABLE IF NOT EXISTS segment_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  conflicting_segments UUID[], -- Array of lead_segments.id
  conflict_type VARCHAR(50), -- 'priority', 'exclusivity', 'confidence_tie'
  resolution_method VARCHAR(50), -- 'highest_confidence', 'most_recent', 'manual', 'priority_rules'
  resolved_segment_id UUID REFERENCES lead_segments(id) ON DELETE SET NULL,
  resolution_confidence DECIMAL(5,2),
  resolution_evidence JSONB,
  resolved_by VARCHAR(255) DEFAULT 'system', -- 'system' or user email
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_segment_conflicts_lead_id ON segment_conflicts(lead_id);
CREATE INDEX IF NOT EXISTS idx_segment_conflicts_resolved ON segment_conflicts(resolved_at) WHERE resolved_at IS NOT NULL;

-- ============================================
-- TABLE: audit_trace (Enhanced Audit Trail with Full Traceback)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_trace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id UUID NOT NULL, -- Groups related audit events
  parent_trace_id UUID REFERENCES audit_trace(id) ON DELETE SET NULL, -- For hierarchical traces
  event_type VARCHAR(100) NOT NULL, -- 'file_ingestion', 'lead_classification', 'email_send', 'bounce', 'reply', etc.
  entity_type VARCHAR(100), -- 'lead', 'email', 'thread', 'bounce', 'segment'
  entity_id UUID,
  actor VARCHAR(255) DEFAULT 'system',
  action VARCHAR(100) NOT NULL,
  stage VARCHAR(100), -- Pipeline stage
  status VARCHAR(50), -- 'success', 'failure', 'pending', 'retry'
  input_data JSONB, -- Input state
  output_data JSONB, -- Output state
  metadata JSONB, -- Additional context
  error_message TEXT,
  error_stack TEXT,
  duration_ms INTEGER, -- Processing duration
  verification_checks JSONB, -- Verification items checked (from checklist)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_trace_trace_id ON audit_trace(trace_id);
CREATE INDEX IF NOT EXISTS idx_audit_trace_parent_trace_id ON audit_trace(parent_trace_id);
CREATE INDEX IF NOT EXISTS idx_audit_trace_event_type ON audit_trace(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_trace_entity_type ON audit_trace(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trace_actor ON audit_trace(actor);
CREATE INDEX IF NOT EXISTS idx_audit_trace_stage ON audit_trace(stage);
CREATE INDEX IF NOT EXISTS idx_audit_trace_status ON audit_trace(status);
CREATE INDEX IF NOT EXISTS idx_audit_trace_created_at ON audit_trace(created_at DESC);

-- ============================================
-- TABLE: domain_suppression (Domain-Level Suppression)
-- ============================================
CREATE TABLE IF NOT EXISTS domain_suppression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) UNIQUE NOT NULL,
  suppression_type VARCHAR(50) NOT NULL, -- 'bounce_pattern', 'complaint_pattern', 'manual', 'legal'
  bounce_count INTEGER DEFAULT 0,
  complaint_count INTEGER DEFAULT 0,
  suppression_reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  suppressed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for permanent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domain_suppression_domain ON domain_suppression(domain);
CREATE INDEX IF NOT EXISTS idx_domain_suppression_is_active ON domain_suppression(is_active);

-- ============================================
-- UPDATE email_logs table to add thread tracking
-- ============================================
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES email_threads(id) ON DELETE SET NULL;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS in_reply_to VARCHAR(255);
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS references_header TEXT;

CREATE INDEX IF NOT EXISTS idx_email_logs_thread_id ON email_logs(thread_id);

-- ============================================
-- UPDATE lead_sequences to add pause tracking
-- ============================================
ALTER TABLE lead_sequences ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;
ALTER TABLE lead_sequences ADD COLUMN IF NOT EXISTS pause_reason VARCHAR(100);
ALTER TABLE lead_sequences ADD COLUMN IF NOT EXISTS paused_by VARCHAR(255) DEFAULT 'system';

CREATE INDEX IF NOT EXISTS idx_lead_sequences_paused_at ON lead_sequences(paused_at) WHERE paused_at IS NOT NULL;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at for new tables
CREATE TRIGGER update_email_bounces_updated_at BEFORE UPDATE ON email_bounces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_threads_updated_at BEFORE UPDATE ON email_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_segments_updated_at BEFORE UPDATE ON lead_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_suppression_updated_at BEFORE UPDATE ON domain_suppression
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically pause sequences on reply
CREATE OR REPLACE FUNCTION pause_sequence_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- When a human reply is detected, pause all active sequences for that lead
  IF NEW.is_human_reply = TRUE AND NEW.automation_paused = FALSE THEN
    UPDATE lead_sequences
    SET status = 'paused',
        paused_at = NOW(),
        pause_reason = 'reply_received',
        paused_by = 'system'
    WHERE lead_id = NEW.lead_id
      AND status = 'active';
    
    NEW.automation_paused = TRUE;
    NEW.pause_reason = 'reply_detected';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pause_sequence_on_reply
  BEFORE INSERT OR UPDATE ON email_replies
  FOR EACH ROW
  WHEN (NEW.is_human_reply = TRUE)
  EXECUTE FUNCTION pause_sequence_on_reply();

-- Function to suppress email on hard bounce
CREATE OR REPLACE FUNCTION suppress_on_hard_bounce()
RETURNS TRIGGER AS $$
BEGIN
  -- When a hard/permanent bounce is detected, add to suppression list
  IF NEW.bounce_type IN ('hard', 'permanent') AND NEW.is_suppressed = FALSE THEN
    -- Add to suppression_list
    INSERT INTO suppression_list (email, reason, suppressed_at)
    VALUES (NEW.recipient_email, 'bounce', NOW())
    ON CONFLICT (email) DO NOTHING;
    
    -- Update lead status
    UPDATE leads
    SET status = 'suppressed'
    WHERE email = NEW.recipient_email;
    
    NEW.is_suppressed = TRUE;
    NEW.suppression_reason = 'hard_bounce';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_suppress_on_hard_bounce
  BEFORE INSERT OR UPDATE ON email_bounces
  FOR EACH ROW
  WHEN (NEW.bounce_type IN ('hard', 'permanent'))
  EXECUTE FUNCTION suppress_on_hard_bounce();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE email_bounces IS 'Detailed bounce tracking with classification and suppression management';
COMMENT ON TABLE email_threads IS 'Email thread tracking for reply detection and conversation management';
COMMENT ON TABLE email_replies IS 'Reply detection and tracking with automation pause logic';
COMMENT ON TABLE email_tracking IS 'Open and click tracking with detailed analytics';
COMMENT ON TABLE lead_segments IS 'Multi-dimensional segment tracking for leads';
COMMENT ON TABLE segment_conflicts IS 'Segment conflict detection and resolution tracking';
COMMENT ON TABLE audit_trace IS 'Enhanced audit trail with full traceback capability';
COMMENT ON TABLE domain_suppression IS 'Domain-level suppression for bounce/complaint patterns';
