-- HingeCraft Database URL & Wallet Address Extraction
-- Run these queries to extract all payment URLs and wallet addresses
-- Output to CSV for processing
--
-- IMPORTANT: This script assumes you have a local PostgreSQL database
-- If your payment data is ONLY in Wix, use extract_from_wix.js instead
--
-- For Docker PostgreSQL (automation): 
--   docker exec -i hingecraft-postgres psql -U hingecraft_user -d hingecraft_automation < extract_database_urls.sql
--
-- For Docker PostgreSQL (chat):
--   docker exec -i hingecraft-chat-db psql -U hingecraft -d hingecraft_chat < extract_database_urls.sql
--
-- For direct PostgreSQL connection:
--   psql -h localhost -U your_user -d your_database -f extract_database_urls.sql

-- ============================================
-- 1. EXTRACT ALL PAYMENT URLs
-- ============================================
-- This query extracts all payment URLs from the payments table
\copy (
  SELECT 
    id,
    created_at,
    user_id,
    gateway,
    payment_url,
    invoice_url,
    transaction_id,
    amount,
    currency,
    payment_status,
    payment_method,
    metadata
  FROM payments
  WHERE 
    payment_url IS NOT NULL 
    OR invoice_url IS NOT NULL 
    OR metadata::text ILIKE '%http%'
    OR metadata::text ILIKE '%invoice%'
    OR metadata::text ILIKE '%checkout%'
  ORDER BY created_at DESC
) TO '/tmp/hingecraft_payments.csv' CSV HEADER;

-- ============================================
-- 2. EXTRACT ALL WALLET ADDRESSES
-- ============================================
-- This query extracts all crypto wallet addresses
\copy (
  SELECT 
    id,
    created_at,
    user_id,
    wallet_address,
    coin,
    currency,
    network,
    meta,
    metadata
  FROM wallets
  WHERE wallet_address IS NOT NULL
  ORDER BY created_at DESC
) TO '/tmp/hingecraft_wallets.csv' CSV HEADER;

-- ============================================
-- 3. EXTRACT EXTERNAL PAYMENT PROVIDER RECORDS
-- ============================================
-- This extracts Stripe and NOWPayments records
\copy (
  SELECT 
    id,
    created_at,
    updated_at,
    gateway,
    provider_id,
    provider_payload,
    metadata,
    status,
    amount,
    currency
  FROM external_payments
  WHERE 
    gateway ILIKE '%stripe%' 
    OR gateway ILIKE '%nowpayment%' 
    OR gateway ILIKE '%nowpayments%'
    OR gateway ILIKE '%now-payments%'
  ORDER BY created_at DESC
) TO '/tmp/hingecraft_external_payments.csv' CSV HEADER;

-- ============================================
-- 4. EXTRACT CRYPTO PAYMENT RECORDS
-- ============================================
-- This extracts NOWPayments invoice and payment data
\copy (
  SELECT 
    _id,
    intent_id,
    order_id,
    invoice_id,
    payment_url,
    pay_address,
    pay_amount_crypto,
    pay_currency,
    price_amount,
    price_currency,
    status,
    nowpayments_status,
    invoice_created_at,
    invoice_expires_at,
    payment_confirmed_at,
    raw_response,
    metadata
  FROM CryptoPayments
  WHERE 
    payment_url IS NOT NULL
    OR pay_address IS NOT NULL
    OR invoice_id IS NOT NULL
  ORDER BY invoice_created_at DESC
) TO '/tmp/hingecraft_crypto_payments.csv' CSV HEADER;

-- ============================================
-- 5. EXTRACT STRIPE SESSION RECORDS
-- ============================================
-- This extracts Stripe checkout session URLs
\copy (
  SELECT 
    _id,
    session_id,
    amount,
    currency,
    status,
    payment_method,
    checkout_url,
    success_url,
    cancel_url,
    metadata,
    created_at
  FROM StripePayments
  WHERE 
    checkout_url IS NOT NULL
    OR session_id IS NOT NULL
  ORDER BY created_at DESC
) TO '/tmp/hingecraft_stripe_payments.csv' CSV HEADER;

-- ============================================
-- 6. NORMALIZED PAYMENT URL MAPPING
-- ============================================
-- This creates a normalized view of all payment URLs by currency
\copy (
  SELECT DISTINCT
    currency,
    gateway,
    payment_method,
    payment_url,
    invoice_url,
    COUNT(*) as usage_count,
    MAX(created_at) as last_used
  FROM (
    SELECT currency, gateway, payment_method, payment_url, invoice_url, created_at FROM payments
    UNION ALL
    SELECT price_currency as currency, 'nowpayments' as gateway, 'crypto' as payment_method, payment_url, NULL as invoice_url, invoice_created_at as created_at FROM CryptoPayments
    UNION ALL
    SELECT currency, 'stripe' as gateway, payment_method, checkout_url as payment_url, NULL as invoice_url, created_at FROM StripePayments
  ) combined
  WHERE payment_url IS NOT NULL
  GROUP BY currency, gateway, payment_method, payment_url, invoice_url
  ORDER BY currency, usage_count DESC
) TO '/tmp/hingecraft_payment_url_mapping.csv' CSV HEADER;

-- ============================================
-- 7. WALLET ADDRESS BY CURRENCY
-- ============================================
-- This creates a mapping of wallet addresses by currency
\copy (
  SELECT DISTINCT
    coin,
    currency,
    wallet_address,
    network,
    COUNT(*) as usage_count,
    MAX(created_at) as last_used
  FROM wallets
  WHERE wallet_address IS NOT NULL
  GROUP BY coin, currency, wallet_address, network
  ORDER BY coin, usage_count DESC
) TO '/tmp/hingecraft_wallet_mapping.csv' CSV HEADER;

-- ============================================
-- NOTES:
-- ============================================
-- After running these queries:
-- 1. Review the CSV files
-- 2. Extract unique URLs and wallet addresses
-- 3. Map them to currencies in payment-currency-map.json
-- 4. Update paymentRoutes in charter page code
