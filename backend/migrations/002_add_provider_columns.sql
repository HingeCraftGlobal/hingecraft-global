-- Add provider columns to payments and external_payments tables
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_url TEXT,
  ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT FALSE;

ALTER TABLE external_payments
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_url TEXT,
  ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON payments(provider_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_url ON payments(provider_url);
CREATE INDEX IF NOT EXISTS idx_external_payments_provider_id ON external_payments(provider_id);
CREATE INDEX IF NOT EXISTS idx_external_payments_provider_url ON external_payments(provider_url);
