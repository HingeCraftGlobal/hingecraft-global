-- Complete Postgres Schema - Production Grade
-- All tables: users, memberships, designs, assets, donations, wallets, transactions, PoB, microfactories, KYC, receipts, consents, analytics, audit logs, content, webhooks

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 1. Users (accounts)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email text UNIQUE,
  display_name text,
  wallet_addresses jsonb DEFAULT '[]'::jsonb, -- array of {chain, address, label, verified}
  role text DEFAULT 'user', -- admin/finance/compliance/designer/member
  membership_tier text,
  metadata jsonb DEFAULT '{}'::jsonb, -- free-form from vault
  is_student boolean DEFAULT false,
  campus text,
  last_login timestamptz NULL,
  pii_encrypted bytea NULL, -- optional encrypted blob for extra PII
  
  -- Wix compatibility
  "_id" VARCHAR(255) UNIQUE,
  "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_owner" VARCHAR(255) DEFAULT 'system'
);

-- 2. Consents & Legal
CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  consent_type text, -- 'tos','privacy','charter_pledge','marketing'
  accepted_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  source text, -- web|api|wix
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 3. Designs / Assets
CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  title text,
  description text,
  tags text[],
  visibility text DEFAULT 'private', -- public|private|community|marketplace
  files jsonb DEFAULT '{}'::jsonb, -- array of file refs {filename, key, mime, size}
  hinge_spec jsonb DEFAULT '{}'::jsonb, -- hinge parameters
  llm_prompts jsonb DEFAULT '{}'::jsonb, -- generated prompts/versions
  license jsonb DEFAULT '{}'::jsonb,
  marketplace_status text DEFAULT 'unlisted',
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Wix compatibility
  "_id" VARCHAR(255) UNIQUE,
  "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_owner" VARCHAR(255) DEFAULT 'system'
);

-- 4. Assets table (files / images)
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  key text, -- S3/MinIO key
  url text,
  filename text,
  content_type text,
  size bigint,
  hash text,
  usage jsonb DEFAULT '{}'::jsonb -- e.g., {"design_id":..., "post_id":...}
);

-- 5. Donations & Crypto Donations
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  created_by uuid NULL REFERENCES users(id),
  donor_name text NULL,
  donor_email text NULL,
  anonymous boolean DEFAULT false,
  chain text NOT NULL, -- solana|stellar|bitcoin|custodial
  token text NOT NULL, -- SOL, USDC, XLM, BTC
  amount_crypto numeric NOT NULL,
  amount_usd numeric NOT NULL, -- FMV at receipt
  txid text NULL,
  to_address text,
  from_address text NULL,
  memo text NULL,
  confirmations int DEFAULT 0,
  status text DEFAULT 'created', -- created/pending/confirmed/failed/flagged/kyc_required/reconciled
  earmark text DEFAULT 'general', -- movement/microfactory/scholarship/project:<id>
  po_b jsonb DEFAULT '{}'::jsonb, -- proof-of-benefit metrics
  aml_score numeric NULL,
  ofac_flag boolean DEFAULT false,
  kyc_id uuid NULL,
  receipt_id uuid NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Wix compatibility
  "_id" VARCHAR(255) UNIQUE,
  "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_owner" VARCHAR(255) DEFAULT 'system'
);

-- 6. Wallets & Treasury
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chain text,
  label text,
  address text UNIQUE,
  type text DEFAULT 'public', -- public|hot|cold|multisig|custodial
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 7. Transactions ledger for internal accounting
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NULL REFERENCES donations(id),
  created_at timestamptz DEFAULT now(),
  gl_account text,
  amount_usd numeric,
  amount_crypto numeric,
  chain text,
  memo text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 8. KYC records (pointer to secure docs)
CREATE TABLE IF NOT EXISTS kycs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES users(id),
  donation_id uuid NULL REFERENCES donations(id),
  provider text, -- Persona/Onfido
  status text DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz NULL,
  document_key text NULL, -- pointer to secure storage
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 9. Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid REFERENCES donations(id),
  generated_at timestamptz DEFAULT now(),
  pdf_key text, -- S3 key
  pdf_url text,
  usd_value numeric,
  donor_name text,
  donor_email text,
  ein text NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 10. Projects / Microfactories / Campaigns
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES users(id),
  title text,
  slug text UNIQUE,
  description text,
  goal_amount_usd numeric,
  raised_amount_usd numeric DEFAULT 0,
  wallet_address text NULL,
  status text DEFAULT 'draft',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  -- Wix compatibility
  "_id" VARCHAR(255) UNIQUE,
  "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "_owner" VARCHAR(255) DEFAULT 'system'
);

-- 11. Proof-of-Benefit (PoB) metrics table
CREATE TABLE IF NOT EXISTS pob_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  donation_id uuid REFERENCES donations(id),
  bottles_saved int DEFAULT 0,
  hours_funded numeric DEFAULT 0,
  units_produced int DEFAULT 0,
  generated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 12. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NULL REFERENCES users(id),
  action text,
  resource_type text,
  resource_id uuid,
  timestamp timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb
);

-- 13. Webhook events staging
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text, -- solana_listener, stellar_horizon, bitcoin_node, wix
  payload jsonb,
  received_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false,
  error text NULL
);

-- 14. Content / CMS (ties to Wix)
CREATE TABLE IF NOT EXISTS cms_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text, -- wix, vault, manual
  external_id text, -- wix item id
  title text,
  slug text UNIQUE,
  body text,
  summary text,
  published boolean DEFAULT false,
  published_at timestamptz NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 15. Analytics events (raw)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  user_id uuid NULL REFERENCES users(id),
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- 16. Prompt/LLM results (from your vault)
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES users(id),
  prompt_text text,
  model text,
  inputs jsonb,
  response jsonb,
  created_at timestamptz DEFAULT now()
);

-- 17. Indexes for speed
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_txid ON donations(txid);
CREATE INDEX IF NOT EXISTS idx_donations_chain ON donations(chain);
CREATE INDEX IF NOT EXISTS idx_webhooks_provider ON webhooks(provider);
CREATE INDEX IF NOT EXISTS idx_assets_key ON assets(key);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at DESC);

-- Add foreign key constraints
ALTER TABLE donations ADD CONSTRAINT fk_donations_kyc FOREIGN KEY (kyc_id) REFERENCES kycs(id);
ALTER TABLE donations ADD CONSTRAINT fk_donations_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id);
