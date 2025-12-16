-- ============================================
-- QUERY SECRETS FROM DATABASE
-- ============================================
-- Run these queries to find secrets in your database
-- ============================================

-- 1. Check if secrets table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'secrets'
) AS secrets_table_exists;

-- 2. If secrets table exists, query all secrets
SELECT 
    key,
    name,
    service,
    environment,
    is_active,
    CASE 
        WHEN encrypted THEN '[ENCRYPTED]' 
        ELSE LEFT(value, 20) || '...' 
    END AS value_preview,
    description,
    last_rotated,
    expires_at
FROM secrets
ORDER BY service, key;

-- 3. Query specific secrets by service
SELECT key, name, value, service
FROM secrets
WHERE service = 'stripe' AND is_active = true;

SELECT key, name, value, service
FROM secrets
WHERE service = 'nowpayments' AND is_active = true;

SELECT key, name, value, service
FROM secrets
WHERE service = 'sendgrid' AND is_active = true;

SELECT key, name, value, service
FROM secrets
WHERE service = 'notion' AND is_active = true;

-- 4. Query by secret name pattern
SELECT key, name, value, service
FROM secrets
WHERE key ILIKE '%STRIPE%' AND is_active = true;

SELECT key, name, value, service
FROM secrets
WHERE key ILIKE '%NOWPAYMENTS%' AND is_active = true;

SELECT key, name, value, service
FROM secrets
WHERE key ILIKE '%SENDGRID%' AND is_active = true;

SELECT key, name, value, service
FROM secrets
WHERE key ILIKE '%NOTION%' OR key ILIKE '%CRM%' AND is_active = true;

-- 5. Find all tables that might contain secrets
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name ILIKE '%secret%' OR
    column_name ILIKE '%key%' OR
    column_name ILIKE '%api%' OR
    column_name ILIKE '%config%' OR
    column_name ILIKE '%credential%'
)
ORDER BY table_name, column_name;

-- 6. Query config tables (if they exist)
SELECT * FROM config WHERE key IN (
    'STRIPE_SECRET_KEY_LIVE',
    'STRIPE_WEBHOOK_SECRET_LIVE',
    'NOWPAYMENTS_API_KEY',
    'NOWPAYMENTS_IPN_SECRET',
    'BASE_URL',
    'SENDGRID_API_KEY',
    'EMAIL_FROM',
    'NOTION_SYNC_URL',
    'CRM_API_KEY'
);

-- 7. Query settings tables (if they exist)
SELECT * FROM settings WHERE setting_key IN (
    'STRIPE_SECRET_KEY_LIVE',
    'STRIPE_WEBHOOK_SECRET_LIVE',
    'NOWPAYMENTS_API_KEY',
    'NOWPAYMENTS_IPN_SECRET'
);

-- 8. Export secrets for Wix (formatted)
SELECT 
    'Secret Name: ' || key || E'\n' ||
    'Secret Value: ' || value || E'\n' ||
    '---' AS wix_format
FROM secrets
WHERE is_active = true
ORDER BY service, key;
