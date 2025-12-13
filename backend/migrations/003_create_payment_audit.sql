-- Create payment_audit table for tracking all payment operations
CREATE TABLE IF NOT EXISTS payment_audit (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  source_table TEXT,
  row_id INT,
  action TEXT,
  payload JSONB,
  resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_source_table ON payment_audit(source_table, row_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_created_at ON payment_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_audit_resolved ON payment_audit(resolved);
