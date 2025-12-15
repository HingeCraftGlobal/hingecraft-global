-- HingeCraft Donations Database Schema
-- This file is automatically executed when PostgreSQL container starts
-- UPDATED: Added Wix required columns (_id, _createdDate, _updatedDate, _owner)

-- ============================================
-- TABLE: donations
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
    -- Wix Required Columns (for read-write access) - Must be quoted for case sensitivity
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    -- Custom Donation Fields
    id VARCHAR(255) UNIQUE,  -- Keep for backward compatibility
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_other_amount BOOLEAN DEFAULT FALSE,
    source VARCHAR(100) DEFAULT 'payment_page',
    payment_status VARCHAR(50) DEFAULT 'completed',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    member_email VARCHAR(255),
    member_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Keep for backward compatibility
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Keep for backward compatibility
    metadata JSONB
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations("_createdDate" DESC);
CREATE INDEX IF NOT EXISTS idx_donations_transaction_id ON donations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_member_email ON donations(member_email);
CREATE INDEX IF NOT EXISTS idx_donations_owner ON donations("_owner");

-- ============================================
-- FUNCTION: Update _updatedDate timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."_updatedDate" = CURRENT_TIMESTAMP;
    NEW.updated_at = CURRENT_TIMESTAMP;  -- Also update backward compatibility field
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGER: Auto-update _updatedDate
-- ============================================
DROP TRIGGER IF EXISTS update_donations_updated_date ON donations;
CREATE TRIGGER update_donations_updated_date
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- ============================================
-- FUNCTION: Auto-set _id from id if not provided
-- ============================================
CREATE OR REPLACE FUNCTION set_wix_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If _id is not set, use id (if exists) or generate UUID
    IF NEW."_id" IS NULL OR NEW."_id" = '' THEN
        -- Check if table has 'id' column (for donations table)
        BEGIN
            IF NEW.id IS NOT NULL AND NEW.id != '' THEN
                NEW."_id" := NEW.id;
            ELSE
                NEW."_id" := gen_random_uuid()::VARCHAR;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Table doesn't have 'id' column, just generate UUID
            NEW."_id" := gen_random_uuid()::VARCHAR;
        END;
    END IF;
    
    -- If table has 'id' column and it's not set, use _id
    BEGIN
        IF NEW.id IS NULL OR NEW.id = '' THEN
            NEW.id := NEW."_id";
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Table doesn't have 'id' column, skip
        NULL;
    END;
    
    -- Set _createdDate if not set
    IF NEW."_createdDate" IS NULL THEN
        NEW."_createdDate" := CURRENT_TIMESTAMP;
    END IF;
    
    -- Set _updatedDate if not set
    IF NEW."_updatedDate" IS NULL THEN
        NEW."_updatedDate" := CURRENT_TIMESTAMP;
    END IF;
    
    -- Set _owner if not set
    IF NEW."_owner" IS NULL OR NEW."_owner" = '' THEN
        NEW."_owner" := 'system';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGER: Auto-set _id
-- ============================================
DROP TRIGGER IF EXISTS set_donations_wix_id ON donations;
CREATE TRIGGER set_donations_wix_id
    BEFORE INSERT ON donations
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: members (registry)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',

    first_name VARCHAR(255),
    last_name VARCHAR(255),
    twin_name VARCHAR(255),
    membership_id VARCHAR(255) UNIQUE,
    city VARCHAR(255),
    region VARCHAR(255),
    country VARCHAR(255),
    registry_date VARCHAR(50),
    source_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_members_created_at ON members("_createdDate" DESC);
CREATE INDEX IF NOT EXISTS idx_members_membership_id ON members(membership_id);
CREATE INDEX IF NOT EXISTS idx_members_country ON members(country);
CREATE INDEX IF NOT EXISTS idx_members_owner ON members("_owner");

DROP TRIGGER IF EXISTS update_members_updated_date ON members;
CREATE TRIGGER update_members_updated_date
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_members_wix_id ON members;
CREATE TRIGGER set_members_wix_id
    BEFORE INSERT ON members
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: chat_clubs
-- ============================================
CREATE TABLE IF NOT EXISTS chat_clubs (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    club_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    description TEXT,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_clubs_category ON chat_clubs(category);
CREATE INDEX IF NOT EXISTS idx_chat_clubs_status ON chat_clubs(status);
CREATE INDEX IF NOT EXISTS idx_chat_clubs_created_at ON chat_clubs("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_chat_clubs_updated_date ON chat_clubs;
CREATE TRIGGER update_chat_clubs_updated_date
    BEFORE UPDATE ON chat_clubs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_chat_clubs_wix_id ON chat_clubs;
CREATE TRIGGER set_chat_clubs_wix_id
    BEFORE INSERT ON chat_clubs
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: chat_messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    member_name VARCHAR(255),
    twin_name VARCHAR(255),
    country VARCHAR(100),
    room VARCHAR(255),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room);
CREATE INDEX IF NOT EXISTS idx_chat_messages_country ON chat_messages(country);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_chat_messages_updated_date ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_date
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_chat_messages_wix_id ON chat_messages;
CREATE TRIGGER set_chat_messages_wix_id
    BEFORE INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: ambassadors
-- ============================================
CREATE TABLE IF NOT EXISTS ambassadors (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    ambassador_name VARCHAR(255),
    email VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(255),
    campaign_name VARCHAR(255),
    program_type VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    impact_metrics JSONB,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_ambassadors_country ON ambassadors(country);
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON ambassadors(status);
CREATE INDEX IF NOT EXISTS idx_ambassadors_created_at ON ambassadors("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_ambassadors_updated_date ON ambassadors;
CREATE TRIGGER update_ambassadors_updated_date
    BEFORE UPDATE ON ambassadors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_ambassadors_wix_id ON ambassadors;
CREATE TRIGGER set_ambassadors_wix_id
    BEFORE INSERT ON ambassadors
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: contribution_intents
-- T10 Implementation: Stores contribution intent data from Mission Support form and Other Amount flow
-- ============================================
CREATE TABLE IF NOT EXISTS contribution_intents (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    -- Amount and status
    amount_entered DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'intent', -- intent → pending → completed
    source VARCHAR(100) DEFAULT 'missionSupportForm', -- missionSupportForm, charterPage, paymentPage
    
    -- Mission Support form fields
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    address VARCHAR(500),
    mission_support_name VARCHAR(255), -- Attribution/dedication name
    
    -- Session and tracking
    session_id VARCHAR(255),
    anonymous_fingerprint VARCHAR(255),
    referrer_source TEXT,
    page_url TEXT,
    user_agent TEXT,
    
    -- Timestamps
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata (UTM params, form version, etc.)
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_contribution_intents_status ON contribution_intents(status);
CREATE INDEX IF NOT EXISTS idx_contribution_intents_source ON contribution_intents(source);
CREATE INDEX IF NOT EXISTS idx_contribution_intents_session_id ON contribution_intents(session_id);
CREATE INDEX IF NOT EXISTS idx_contribution_intents_email ON contribution_intents(email);
CREATE INDEX IF NOT EXISTS idx_contribution_intents_created_at ON contribution_intents("_createdDate" DESC);
CREATE INDEX IF NOT EXISTS idx_contribution_intents_owner ON contribution_intents("_owner");

DROP TRIGGER IF EXISTS update_contribution_intents_updated_date ON contribution_intents;
CREATE TRIGGER update_contribution_intents_updated_date
    BEFORE UPDATE ON contribution_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_contribution_intents_wix_id ON contribution_intents;
CREATE TRIGGER set_contribution_intents_wix_id
    BEFORE INSERT ON contribution_intents
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: crypto_payments
-- NOWPayments Integration: Stores crypto payment invoices and transactions
-- ============================================
CREATE TABLE IF NOT EXISTS crypto_payments (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    -- Link to contribution intent
    intent_id VARCHAR(255), -- FK to contribution_intents._id
    order_id VARCHAR(255) UNIQUE, -- NOWPayments order_id (same as intent_id for idempotency)
    
    -- NOWPayments invoice data
    invoice_id VARCHAR(255) UNIQUE, -- NOWPayments invoice ID
    payment_url TEXT, -- Invoice URL for donor
    pay_address TEXT, -- Crypto receiving address
    pay_amount_crypto DECIMAL(20, 8), -- Amount in crypto
    pay_currency VARCHAR(10), -- Crypto symbol (BTC, ETH, SOL, etc.)
    
    -- USD pricing
    price_amount DECIMAL(10, 2) NOT NULL, -- USD amount
    price_currency VARCHAR(10) DEFAULT 'usd',
    
    -- Transaction data
    tx_hash VARCHAR(255), -- Blockchain transaction hash
    chain VARCHAR(50), -- Blockchain (ethereum, bitcoin, solana)
    confirmations INTEGER DEFAULT 0,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending_invoice', -- pending_invoice, waiting, pending_payment, detected, confirmed, partial, expired, failed
    nowpayments_status VARCHAR(50), -- NOWPayments status field
    
    -- Timestamps
    invoice_created_at TIMESTAMP,
    invoice_expires_at TIMESTAMP,
    payment_detected_at TIMESTAMP,
    payment_confirmed_at TIMESTAMP,
    
    -- Raw responses and metadata
    raw_response JSONB, -- Full NOWPayments API response
    raw_webhook JSONB, -- Full webhook payload
    metadata JSONB DEFAULT '{}'::jsonb -- Additional metadata
    
    -- Foreign key constraint (optional, depends on DB setup)
    -- CONSTRAINT fk_intent FOREIGN KEY (intent_id) REFERENCES contribution_intents("_id")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_payments_intent_id ON crypto_payments(intent_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_order_id ON crypto_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_invoice_id ON crypto_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_tx_hash ON crypto_payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_created_at ON crypto_payments("_createdDate" DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_owner ON crypto_payments("_owner");

-- Triggers
DROP TRIGGER IF EXISTS update_crypto_payments_updated_date ON crypto_payments;
CREATE TRIGGER update_crypto_payments_updated_date
    BEFORE UPDATE ON crypto_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_crypto_payments_wix_id ON crypto_payments;
CREATE TRIGGER set_crypto_payments_wix_id
    BEFORE INSERT ON crypto_payments
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: webhook_logs
-- Stores all webhook events for audit and debugging
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    -- Webhook identification
    event_id VARCHAR(255) UNIQUE, -- NOWPayments event ID or Stripe event ID
    event_type VARCHAR(100), -- invoice_paid, invoice_expired, checkout.session.completed, etc.
    source VARCHAR(50) DEFAULT 'nowpayments', -- nowpayments, stripe, etc.
    
    -- Verification
    signature_valid BOOLEAN DEFAULT FALSE,
    signature_header TEXT, -- Raw signature header for debugging
    
    -- Payload
    payload_json JSONB NOT NULL, -- Full webhook payload
    
    -- Processing
    processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processed, failed, retry
    processing_error TEXT,
    processed_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_signature_valid ON webhook_logs(signature_valid);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processing_status ON webhook_logs(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_webhook_logs_updated_date ON webhook_logs;
CREATE TRIGGER update_webhook_logs_updated_date
    BEFORE UPDATE ON webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_webhook_logs_wix_id ON webhook_logs;
CREATE TRIGGER set_webhook_logs_wix_id
    BEFORE INSERT ON webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: kyc_verifications
-- KYC/AML verification tracking
-- ============================================
CREATE TABLE IF NOT EXISTS kyc_verifications (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    -- Link to user/donation
    user_id VARCHAR(255), -- FK to users or contribution_intents
    triggered_by_payment_id VARCHAR(255), -- FK to donations or crypto_payments
    triggered_by_intent_id VARCHAR(255), -- FK to contribution_intents
    
    -- Threshold and reason
    threshold_amount DECIMAL(10, 2),
    trigger_reason VARCHAR(255), -- amount_threshold, crypto_flag, ofac_match, etc.
    
    -- Verification details
    verification_url TEXT, -- Secure KYC portal URL
    verification_provider VARCHAR(100), -- stripe_identity, jumio, persona, manual, etc.
    verification_token VARCHAR(255), -- One-time token for KYC portal
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected, expired, cancelled
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP, -- Token expiration (typically 72 hours)
    
    -- Results
    verification_result JSONB, -- Provider response data
    rejection_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_payment_id ON kyc_verifications(triggered_by_payment_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_intent_id ON kyc_verifications(triggered_by_intent_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_created_at ON kyc_verifications("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_kyc_verifications_updated_date ON kyc_verifications;
CREATE TRIGGER update_kyc_verifications_updated_date
    BEFORE UPDATE ON kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_kyc_verifications_wix_id ON kyc_verifications;
CREATE TRIGGER set_kyc_verifications_wix_id
    BEFORE INSERT ON kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();
