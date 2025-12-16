-- ============================================
-- SECRETS TABLE
-- ============================================
-- This table stores API keys and secrets for the HingeCraft application
-- Run this SQL to create the table if it doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS secrets (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    -- Secret identification
    key VARCHAR(255) UNIQUE NOT NULL, -- Secret name (e.g., 'STRIPE_SECRET_KEY_LIVE')
    name VARCHAR(255), -- Human-readable name
    value TEXT NOT NULL, -- The actual secret value (encrypted in production)
    
    -- Metadata
    service VARCHAR(100), -- 'stripe', 'nowpayments', 'sendgrid', 'notion', etc.
    environment VARCHAR(50) DEFAULT 'production', -- 'production', 'test', 'development'
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    
    -- Security
    encrypted BOOLEAN DEFAULT false,
    last_rotated TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Audit
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_secrets_key ON secrets(key);
CREATE INDEX IF NOT EXISTS idx_secrets_service ON secrets(service);
CREATE INDEX IF NOT EXISTS idx_secrets_environment ON secrets(environment);
CREATE INDEX IF NOT EXISTS idx_secrets_active ON secrets(is_active);
CREATE INDEX IF NOT EXISTS idx_secrets_created_at ON secrets("_createdDate" DESC);

-- Triggers
DROP TRIGGER IF EXISTS update_secrets_updated_date ON secrets;
CREATE TRIGGER update_secrets_updated_date
    BEFORE UPDATE ON secrets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_secrets_wix_id ON secrets;
CREATE TRIGGER set_secrets_wix_id
    BEFORE INSERT ON secrets
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- QUERY TO FIND ALL SECRETS
-- ============================================
-- Run this query to see all stored secrets:
-- SELECT key, name, service, environment, is_active, 
--        CASE WHEN encrypted THEN '[ENCRYPTED]' ELSE LEFT(value, 20) || '...' END as value_preview
-- FROM secrets
-- ORDER BY service, key;

-- ============================================
-- INSERT EXAMPLE SECRETS (DO NOT USE IN PRODUCTION)
-- ============================================
-- INSERT INTO secrets (key, name, value, service, environment, description) VALUES
-- ('STRIPE_SECRET_KEY_LIVE', 'Stripe Secret Key (Live)', 'sk_live_YOUR_KEY_HERE', 'stripe', 'production', 'Stripe API secret key for live payments'),
-- ('STRIPE_WEBHOOK_SECRET_LIVE', 'Stripe Webhook Secret (Live)', 'whsec_YOUR_SECRET_HERE', 'stripe', 'production', 'Stripe webhook signing secret'),
-- ('NOWPAYMENTS_API_KEY', 'NOWPayments API Key', 'YOUR_API_KEY_HERE', 'nowpayments', 'production', 'NOWPayments API key for crypto payments'),
-- ('NOWPAYMENTS_IPN_SECRET', 'NOWPayments IPN Secret', 'YOUR_IPN_SECRET_HERE', 'nowpayments', 'production', 'NOWPayments IPN secret for webhook verification'),
-- ('BASE_URL', 'Base URL', 'https://hingecraft-global.ai', 'config', 'production', 'Base URL for redirects and callbacks'),
-- ('SENDGRID_API_KEY', 'SendGrid API Key', 'YOUR_SENDGRID_KEY_HERE', 'sendgrid', 'production', 'SendGrid API key for email notifications'),
-- ('EMAIL_FROM', 'Default Sender Email', 'no-reply@hingecraft-global.ai', 'sendgrid', 'production', 'Default sender email address'),
-- ('NOTION_SYNC_URL', 'Notion Sync URL', 'YOUR_NOTION_URL_HERE', 'notion', 'production', 'Notion API endpoint for CRM sync'),
-- ('CRM_API_KEY', 'CRM API Key', 'YOUR_CRM_KEY_HERE', 'notion', 'production', 'CRM/Notion API key for integration');
