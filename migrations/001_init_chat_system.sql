-- T10 HingeCraft Live Chat System - Database Migration
-- PostgreSQL Schema for Production Chat System

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- TABLE: messages
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  parent_id TEXT NULL REFERENCES messages(id) ON DELETE CASCADE,
  attachments JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  pinned BOOLEAN DEFAULT FALSE,
  edited BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'held', 'deleted'))
);

CREATE INDEX IF NOT EXISTS messages_channel_ts_idx ON messages(channel, ts DESC);
CREATE INDEX IF NOT EXISTS messages_tsv_idx ON messages USING GIN (to_tsvector('english', coalesce(text, '')));
CREATE INDEX IF NOT EXISTS messages_parent_id_idx ON messages(parent_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_pinned_idx ON messages(channel, pinned) WHERE pinned = TRUE;

-- ============================================
-- TABLE: read_receipts
-- ============================================
CREATE TABLE IF NOT EXISTS read_receipts (
  message_id TEXT REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS read_receipts_user_id_idx ON read_receipts(user_id);
CREATE INDEX IF NOT EXISTS read_receipts_ts_idx ON read_receipts(ts DESC);

-- ============================================
-- TABLE: uploads
-- ============================================
CREATE TABLE IF NOT EXISTS uploads (
  upload_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  filename TEXT,
  content_type TEXT,
  size BIGINT,
  file_url TEXT,
  s3_key TEXT,
  status TEXT CHECK (status IN ('requested','complete','failed')) DEFAULT 'requested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads(user_id);
CREATE INDEX IF NOT EXISTS uploads_status_idx ON uploads(status);
CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON uploads(created_at);

-- ============================================
-- TABLE: idempotency_keys
-- ============================================
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idempotency_keys_path_idx ON idempotency_keys(path);
CREATE INDEX IF NOT EXISTS idempotency_keys_created_at_idx ON idempotency_keys(created_at);

-- Cleanup old idempotency keys (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys WHERE created_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLE: moderation_logs
-- ============================================
CREATE TABLE IF NOT EXISTS moderation_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT REFERENCES messages(id) ON DELETE CASCADE,
  reason TEXT,
  score NUMERIC,
  moderated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moderation_logs_message_id_idx ON moderation_logs(message_id);
CREATE INDEX IF NOT EXISTS moderation_logs_ts_idx ON moderation_logs(ts DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update fulltext search index on message insert/update
CREATE OR REPLACE FUNCTION update_message_tsvector()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger is implicit via GIN index
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get channel message count
CREATE OR REPLACE FUNCTION get_channel_message_count(p_channel TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM messages WHERE channel = p_channel AND status = 'active');
END;
$$ LANGUAGE plpgsql;

-- Function to get thread replies count
CREATE OR REPLACE FUNCTION get_thread_replies_count(p_parent_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM messages WHERE parent_id = p_parent_id AND status = 'active');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default channels
-- Channels are stored in application config, not DB
-- But we can add a channels table if needed for dynamic channels

COMMENT ON TABLE users IS 'Chat system users';
COMMENT ON TABLE messages IS 'Chat messages with threading support';
COMMENT ON TABLE read_receipts IS 'Message read receipts per user';
COMMENT ON TABLE uploads IS 'File upload tracking';
COMMENT ON TABLE idempotency_keys IS 'Idempotency protection for API requests';
COMMENT ON TABLE moderation_logs IS 'Content moderation audit trail';

