-- ============================================
-- QUERY WALLET ADDRESSES FROM DATABASE
-- ============================================
-- Run these queries to find crypto wallet addresses for HingeCraft
-- ============================================

-- 1. Check if crypto_treasury table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'crypto_treasury'
) AS crypto_treasury_exists;

-- 2. Query crypto_treasury for wallet addresses
SELECT 
    currency,
    wallet_address,
    wallet_type,
    network,
    is_active,
    created_at
FROM crypto_treasury
WHERE is_active = true
ORDER BY currency, wallet_type;

-- 3. Get wallet addresses by currency
SELECT wallet_address, wallet_type, network
FROM crypto_treasury
WHERE currency = 'BTC' AND is_active = true;

SELECT wallet_address, wallet_type, network
FROM crypto_treasury
WHERE currency = 'ETH' AND is_active = true;

SELECT wallet_address, wallet_type, network
FROM crypto_treasury
WHERE currency = 'SOL' AND is_active = true;

SELECT wallet_address, wallet_type, network
FROM crypto_treasury
WHERE currency = 'XLM' AND is_active = true;

-- 4. Check wallets table (if exists)
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'wallets'
) AS wallets_table_exists;

-- 5. Query wallets table
SELECT 
    currency,
    address,
    type,
    is_active
FROM wallets
WHERE is_active = true
ORDER BY currency;

-- 6. Check secrets/config for wallet addresses
SELECT key, value, description
FROM secrets
WHERE (
    key ILIKE '%WALLET%' OR 
    key ILIKE '%ADDRESS%' OR
    key ILIKE '%BTC%' OR
    key ILIKE '%ETH%' OR
    key ILIKE '%SOL%' OR
    key ILIKE '%XLM%' OR
    key ILIKE '%BITCOIN%' OR
    key ILIKE '%ETHEREUM%' OR
    key ILIKE '%SOLANA%' OR
    key ILIKE '%STELLAR%'
)
AND is_active = true
ORDER BY key;

-- 7. Export wallet addresses for NOWPayments (formatted)
SELECT 
    currency,
    wallet_address as address,
    'NOWPayments Payout Address for ' || currency as description
FROM crypto_treasury
WHERE is_active = true
AND wallet_type = 'payout'
ORDER BY currency;

-- 8. Get all tables that might contain wallet addresses
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name ILIKE '%wallet%' OR
    column_name ILIKE '%address%' OR
    column_name ILIKE '%crypto%' OR
    column_name ILIKE '%treasury%'
)
ORDER BY table_name, column_name;
