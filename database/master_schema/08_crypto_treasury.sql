-- Multi-Layer Data Model: Crypto Donation & Treasury Data Layer
-- Enhanced donations, wallets, transactions, compliance

-- ============================================
-- DONATIONS (Enhanced from existing)
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id text UNIQUE,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    chain text NOT NULL, -- solana, stellar, bitcoin, ethereum, polygon
    token text NOT NULL, -- SOL, USDC, XLM, BTC, ETH, MATIC
    amount_crypto numeric(20,8) NOT NULL,
    amount_usd numeric(10,2) NOT NULL,
    to_address text NOT NULL,
    from_address text,
    memo text,
    txid text,
    confirmations int DEFAULT 0,
    status text NOT NULL DEFAULT 'created', -- created/pending/confirmed/failed/flagged/kyc_required/reconciled
    earmark text DEFAULT 'general', -- 'general', 'project', 'scholarship', 'infrastructure'
    po_b jsonb DEFAULT '{}'::jsonb, -- Purchase order / billing details
    aml_score numeric(5,2), -- 0-100 AML risk score
    ofac_flag boolean DEFAULT false,
    kyc_id uuid,
    receipt_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Wix compatibility (keep existing structure)
    "_id" VARCHAR(255) UNIQUE,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_chain ON donations(chain);
CREATE INDEX IF NOT EXISTS idx_donations_txid ON donations(txid);
CREATE INDEX IF NOT EXISTS idx_donations_created_by ON donations(created_by);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- ============================================
-- WALLETS (Treasury Management)
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chain text NOT NULL,
    address text UNIQUE NOT NULL,
    label text,
    wallet_type text NOT NULL DEFAULT 'public', -- public, hot, cold, multisig, custodial
    derivation_path text, -- For HD wallets
    public_key text,
    active boolean DEFAULT true,
    balance_crypto numeric(20,8) DEFAULT 0,
    balance_usd numeric(10,2) DEFAULT 0,
    last_balance_check timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_wallets_chain ON wallets(chain);
CREATE INDEX IF NOT EXISTS idx_wallets_type ON wallets(wallet_type);
CREATE INDEX IF NOT EXISTS idx_wallets_active ON wallets(active);

-- ============================================
-- CRYPTO TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS crypto_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id uuid REFERENCES donations(id) ON DELETE SET NULL,
    wallet_id uuid REFERENCES wallets(id) ON DELETE SET NULL,
    transaction_type text NOT NULL, -- 'incoming', 'outgoing', 'sweep', 'exchange', 'fee'
    chain text NOT NULL,
    token text NOT NULL,
    from_address text,
    to_address text NOT NULL,
    amount_crypto numeric(20,8) NOT NULL,
    amount_usd numeric(10,2),
    txid text UNIQUE,
    block_number bigint,
    block_hash text,
    confirmations integer DEFAULT 0,
    fee_crypto numeric(20,8) DEFAULT 0,
    fee_usd numeric(10,2) DEFAULT 0,
    status text DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'replaced'
    created_at timestamptz DEFAULT now(),
    confirmed_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crypto_transactions_txid ON crypto_transactions(txid);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_wallet_id ON crypto_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_status ON crypto_transactions(status);

-- ============================================
-- TREASURY OPERATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS treasury_operations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type text NOT NULL, -- 'sweep', 'exchange', 'multisig_proposal', 'withdrawal'
    from_wallet_id uuid REFERENCES wallets(id),
    to_wallet_id uuid REFERENCES wallets(id),
    amount_crypto numeric(20,8) NOT NULL,
    amount_usd numeric(10,2),
    status text DEFAULT 'pending', -- 'pending', 'approved', 'executed', 'rejected', 'cancelled'
    proposed_by uuid REFERENCES users(id),
    approved_by uuid[] DEFAULT '{}', -- Array of user IDs
    required_approvals integer DEFAULT 1,
    executed_at timestamptz,
    transaction_id uuid REFERENCES crypto_transactions(id),
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_treasury_operations_status ON treasury_operations(status);
CREATE INDEX IF NOT EXISTS idx_treasury_operations_proposed_by ON treasury_operations(proposed_by);

-- ============================================
-- EXCHANGE RATES (Historical)
-- ============================================
CREATE TABLE IF NOT EXISTS exchange_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chain text NOT NULL,
    token text NOT NULL,
    rate_usd numeric(20,8) NOT NULL,
    source text, -- 'coingecko', 'binance', 'manual'
    recorded_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(chain, token, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_chain_token ON exchange_rates(chain, token, recorded_at DESC);

COMMENT ON TABLE donations IS 'Crypto donation records with compliance';
COMMENT ON TABLE wallets IS 'Treasury wallet management';
COMMENT ON TABLE crypto_transactions IS 'All blockchain transactions';
COMMENT ON TABLE treasury_operations IS 'Treasury management operations';
COMMENT ON TABLE exchange_rates IS 'Historical exchange rates for conversion';



