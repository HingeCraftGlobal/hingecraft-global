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

-- ============================================
-- INSERT ALL HINGECRAFT DATA
-- Complete data insertion for all HingeCraft collections
-- ============================================

-- ============================================
-- DONATIONS DATA (3 records - $175.50 total)
-- ============================================
INSERT INTO donations (
    "_id", "_createdDate", "_updatedDate", "_owner",
    id, amount, currency, is_other_amount, source, payment_status,
    payment_method, transaction_id, member_email, member_name,
    created_at, updated_at, metadata
) VALUES
    ('14ae821b-7915-46bc-bd5d-f5c60264f47a', '2025-12-01 14:49:01.941', '2025-12-01 14:49:02.277529', 'system',
     '14ae821b-7915-46bc-bd5d-f5c60264f47a', 25.50, 'USD', false, 'payment_page', 'verified',
     NULL, NULL, 'verify@test.com', 'Verification Test',
     '2025-12-01 14:49:01.941', '2025-12-01 14:49:02.277529', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

INSERT INTO donations (
    "_id", "_createdDate", "_updatedDate", "_owner",
    id, amount, currency, is_other_amount, source, payment_status,
    payment_method, transaction_id, member_email, member_name,
    created_at, updated_at, metadata
) VALUES
    ('489d10f6-b022-4825-b757-2b334fe08f35', '2025-12-01 14:47:48.528', '2025-12-01 14:48:10.594239', 'system',
     '489d10f6-b022-4825-b757-2b334fe08f35', 100.00, 'USD', false, 'payment_page', 'pending',
     NULL, NULL, 'test2@example.com', 'Test User 2',
     '2025-12-01 14:47:48.528', '2025-12-01 14:48:10.594239', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

INSERT INTO donations (
    "_id", "_createdDate", "_updatedDate", "_owner",
    id, amount, currency, is_other_amount, source, payment_status,
    payment_method, transaction_id, member_email, member_name,
    created_at, updated_at, metadata
) VALUES
    ('a74af7be-08a4-4296-b451-60e61c903c4b', '2025-12-01 14:45:54.879', '2025-12-01 14:45:54.879', 'system',
     'a74af7be-08a4-4296-b451-60e61c903c4b', 50.00, 'USD', false, 'payment_page', 'completed',
     NULL, NULL, 'test@example.com', 'Test User',
     '2025-12-01 14:45:54.879', '2025-12-01 14:45:54.879', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- MEMBERS DATA (Charter List - 10 records)
-- ============================================
INSERT INTO members (
    "_id", "_createdDate", "_updatedDate", "_owner",
    first_name, last_name, twin_name, membership_id, city, region, country,
    registry_date, source_file, created_at, updated_at, metadata
) VALUES
    ('charter-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Wyatt', 'Smith', NULL, NULL, 'Sydney', 'NSW', 'Australia',
     '22/06/2025', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Carter', 'Jones', 'Nimbus-142', NULL, NULL, NULL, 'Australia',
     '03/07/2025', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Grace', 'Harris', NULL, NULL, NULL, NULL, 'Australia',
     '09/04/2025', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Henry', 'Ramirez', 'Zenith-211', NULL, NULL, 'VIC', 'Australia',
     '03/11/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Leo', 'Martinez', 'Drift-271', NULL, 'Sydney', NULL, 'Australia',
     '08/04/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-006', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'James', 'Gonzalez', 'Pixel-280', NULL, 'Melbourne', 'VIC', 'Australia',
     '18/02/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-007', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'James', 'Allen', NULL, NULL, 'Sydney', 'NSW', 'Australia',
     '22/10/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-008', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Harper', 'Scott', 'Comet-349', NULL, NULL, NULL, 'Australia',
     '21/09/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-009', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Noah', 'Moore', NULL, NULL, NULL, NULL, 'Australia',
     '11/01/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-010', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Jack', 'Lee', 'Halo-418', NULL, NULL, 'VIC', 'Australia',
     '10/10/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- MEMBERS DATA (Registry - Sample of first 10)
-- Note: Full registry has 200 members. Use load_all_hingecraft_data.py for complete import.
-- ============================================
INSERT INTO members (
    "_id", "_createdDate", "_updatedDate", "_owner",
    first_name, last_name, twin_name, membership_id, city, region, country,
    registry_date, source_file, created_at, updated_at, metadata
) VALUES
    ('0000000001', '2025-12-04 18:33:17.663409', '2025-12-04 18:33:17.663413', 'system',
     'Alex', 'Anderson', 'Quantum Node', '0000000001', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663409', '2025-12-04 18:33:17.663413', NULL::jsonb),
    ('0000000002', '2025-12-04 18:33:17.663436', '2025-12-04 18:33:17.663439', 'system',
     'Alex', 'Bennett', 'Echo Weaver', '0000000002', 'Canada', NULL, 'Canada',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663436', '2025-12-04 18:33:17.663439', NULL::jsonb),
    ('0000000003', '2025-12-04 18:33:17.663458', '2025-12-04 18:33:17.663462', 'system',
     'Alex', 'Chen', 'Nova Stream', '0000000003', 'Toronto', NULL, 'Toronto',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663458', '2025-12-04 18:33:17.663462', NULL::jsonb),
    ('0000000004', '2025-12-04 18:33:17.663479', '2025-12-04 18:33:17.663483', 'system',
     'Alex', 'Dubois', 'Nimbus Matrix', '0000000004', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663479', '2025-12-04 18:33:17.663483', NULL::jsonb),
    ('0000000005', '2025-12-04 18:33:17.663499', '2025-12-04 18:33:17.663503', 'system',
     'Alex', 'Esposito', 'Lumen Horizon', '0000000005', 'Canada', NULL, 'Canada',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663499', '2025-12-04 18:33:17.663503', NULL::jsonb),
    ('0000000006', '2025-12-04 18:33:17.663519', '2025-12-04 18:33:17.663522', 'system',
     'Alex', 'Fernandez', 'Atlas Beacon', '0000000006', 'Toronto', NULL, 'Toronto',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663519', '2025-12-04 18:33:17.663522', NULL::jsonb),
    ('0000000007', '2025-12-04 18:33:17.663539', '2025-12-04 18:33:17.663542', 'system',
     'Alex', 'Garcia', 'Solace Circuit', '0000000007', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663539', '2025-12-04 18:33:17.663542', NULL::jsonb),
    ('0000000008', '2025-12-04 18:33:17.663559', '2025-12-04 18:33:17.663562', 'system',
     'Alex', 'Haddad', 'Orion Harbor', '0000000008', 'Canada', NULL, 'Canada',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663559', '2025-12-04 18:33:17.663562', NULL::jsonb),
    ('0000000009', '2025-12-04 18:33:17.663579', '2025-12-04 18:33:17.663582', 'system',
     'Alex', 'Ivanov', 'Cascade Forge', '0000000009', 'Toronto', NULL, 'Toronto',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663579', '2025-12-04 18:33:17.663582', NULL::jsonb),
    ('0000000010', '2025-12-04 18:33:17.663598', '2025-12-04 18:33:17.663602', 'system',
     'Alex', 'Johansson', 'Vertex Glyph', '0000000010', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663598', '2025-12-04 18:33:17.663602', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- CHAT CLUBS DATA (6 clubs)
-- ============================================
INSERT INTO chat_clubs (
    "_id", "_createdDate", "_updatedDate", "_owner",
    club_name, category, member_count, status, description, source,
    created_at, updated_at, metadata
) VALUES
    ('club-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Robotics', 'Unknown', 26, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Programming / Coding', 'Unknown', 38, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Hackathon & Developer', 'Unknown', 0, 'Not Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Maker Club / 3D Printing Lab', 'Unknown', 15, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Rocketry', 'Unknown', 0, 'Not Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-006', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Cybersecurity', 'Unknown', 21, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- CHAT MESSAGES DATA (13 messages)
-- ============================================
INSERT INTO chat_messages (
    "_id", "_createdDate", "_updatedDate", "_owner",
    member_name, twin_name, country, room, message, message_type, source,
    created_at, updated_at, metadata
) VALUES
    ('msg-001', '2025-12-04 18:55:12.970396', '2025-12-04 18:55:12.970396', 'system',
     'Member', 'Zenith Loop', 'KE', 'Room 1', 'Room 1 is wild. 🌙', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970396', '2025-12-04 18:55:12.970396', NULL::jsonb),
    ('msg-002', '2025-12-04 18:55:12.970450', '2025-12-04 18:55:12.970450', 'system',
     'Member', 'Logic Fable', 'CO', 'Room 1', 'This is cozy.', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970450', '2025-12-04 18:55:12.970450', NULL::jsonb),
    ('msg-003', '2025-12-04 18:55:12.970462', '2025-12-04 18:55:12.970462', 'system',
     'Member', 'Binary Grove', 'SE', 'Room 1', '📚🌈📚😅', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970462', '2025-12-04 18:55:12.970462', NULL::jsonb),
    ('msg-004', '2025-12-04 18:55:12.970477', '2025-12-04 18:55:12.970477', 'system',
     'Nova', NULL, 'NG', 'Room 1', 'Room 1 is wild. 🔥🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970477', '2025-12-04 18:55:12.970477', NULL::jsonb),
    ('msg-005', '2025-12-04 18:55:12.970486', '2025-12-04 18:55:12.970486', 'system',
     'Member', 'Delta Rune', 'KR', 'Room 1', 'Same here tbh. 🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970486', '2025-12-04 18:55:12.970486', NULL::jsonb),
    ('msg-006', '2025-12-04 18:55:12.970517', '2025-12-04 18:55:12.970517', 'system',
     'Member', 'Vector Solace', 'BR', 'Room 1', 'Trying to focus on the integral, but my brain keeps drifting to the idea that we''re all tiny dots on the map doing math at the same time. Feels like a sci‑fi study group. 🌈🧠', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970517', '2025-12-04 18:55:12.970517', NULL::jsonb),
    ('msg-007', '2025-12-04 18:55:12.971162', '2025-12-04 18:55:12.971162', 'system',
     'Zenith Loop, KE', NULL, NULL, 'Room 1', 'Room 1 is wild. 🌙', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971162', '2025-12-04 18:55:12.971162', NULL::jsonb),
    ('msg-008', '2025-12-04 18:55:12.971189', '2025-12-04 18:55:12.971189', 'system',
     'Logic Fable, CO', NULL, NULL, 'Room 1', 'This is cozy.', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971189', '2025-12-04 18:55:12.971189', NULL::jsonb),
    ('msg-009', '2025-12-04 18:55:12.971202', '2025-12-04 18:55:12.971202', 'system',
     'Binary Grove, SE', NULL, NULL, 'Room 1', '📚🌈📚😅', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971202', '2025-12-04 18:55:12.971202', NULL::jsonb),
    ('msg-010', '2025-12-04 18:55:12.971212', '2025-12-04 18:55:12.971212', 'system',
     'Aurora Quill, U.S.', NULL, NULL, 'Room 1', 'Same here tbh. 💡📚', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971212', '2025-12-04 18:55:12.971212', NULL::jsonb),
    ('msg-011', '2025-12-04 18:55:12.971221', '2025-12-04 18:55:12.971221', 'system',
     'Nova, NG', NULL, NULL, 'Room 1', 'Room 1 is wild. 🔥🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971221', '2025-12-04 18:55:12.971221', NULL::jsonb),
    ('msg-012', '2025-12-04 18:55:12.971229', '2025-12-04 18:55:12.971229', 'system',
     'Delta Rune, KR', NULL, NULL, 'Room 1', 'Same here tbh. 🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971229', '2025-12-04 18:55:12.971229', NULL::jsonb),
    ('msg-013', '2025-12-04 18:55:12.971239', '2025-12-04 18:55:12.971239', 'system',
     'Vector Solace, BR', NULL, NULL, 'Room 1', 'Trying to focus on the integral, but my brain keeps drifting to the idea that we''re all tiny dots on the map doing math at the same time. Feels like a sci‑fi study group. 🌈🧠', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971239', '2025-12-04 18:55:12.971239', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- DATA INSERTION COMPLETE
-- Summary:
-- - Donations: 3 records ($175.50 total)
-- - Members: 20 records (10 charter + 10 registry sample)
-- - Chat Clubs: 6 records
-- - Chat Messages: 13 records
-- ============================================
