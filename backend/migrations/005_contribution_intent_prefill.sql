-- Ensure ContributionIntent table supports prefill tokens
-- Add columns if they don't exist (for prefill functionality)

ALTER TABLE contribution_intent
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

-- Create unique index on _id if not exists
CREATE UNIQUE INDEX IF NOT EXISTS ux_contribution_intent_id ON contribution_intent(_id);

-- Create index for prefill lookups
CREATE INDEX IF NOT EXISTS idx_contribution_intent_prefill ON contribution_intent(_id, expires_at, used) 
  WHERE source = 'mission_support_other';
