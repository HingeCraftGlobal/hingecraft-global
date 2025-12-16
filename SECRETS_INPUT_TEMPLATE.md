# Secrets Input Template for Wix Secrets Manager

## 📋 Copy-Paste Ready Format

Use this template to input secrets into Wix Secrets Manager. Fill in the values from your database or API dashboards.

---

## ✅ REQUIRED SECRETS (Must Configure)

### 1. STRIPE_SECRET_KEY_LIVE
```
Secret Name: STRIPE_SECRET_KEY_LIVE
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'STRIPE_SECRET_KEY_LIVE']
```
**Where to Get:** 
1. **From Database:** `SELECT value FROM secrets WHERE key = 'STRIPE_SECRET_KEY_LIVE'`
2. **From Stripe Dashboard:** https://dashboard.stripe.com → Developers → API keys → Secret key
3. **Format:** Starts with `sk_live_...` or `sk_test_...`

---

### 2. STRIPE_WEBHOOK_SECRET_LIVE
```
Secret Name: STRIPE_WEBHOOK_SECRET_LIVE
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'STRIPE_WEBHOOK_SECRET_LIVE']
```
**Where to Get:** 
1. **From Database:** `SELECT value FROM secrets WHERE key = 'STRIPE_WEBHOOK_SECRET_LIVE'`
2. **From Stripe Dashboard:** https://dashboard.stripe.com → Developers → Webhooks → Signing secret
3. **Format:** Starts with `whsec_...`
**Webhook URL to Set:** `https://hingecraft-global.ai/_functions/webhooks/stripe`

---

### 3. NOWPAYMENTS_API_KEY
```
Secret Name: NOWPAYMENTS_API_KEY
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'NOWPAYMENTS_API_KEY']
```
**Where to Get:** 
1. **From Database:** `SELECT value FROM secrets WHERE key = 'NOWPAYMENTS_API_KEY'`
2. **From NOWPayments Dashboard:** https://nowpayments.io → Settings → API Keys
3. **Note:** Save immediately - only shown once upon creation

---

### 4. NOWPAYMENTS_IPN_SECRET
```
Secret Name: NOWPAYMENTS_IPN_SECRET
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'NOWPAYMENTS_IPN_SECRET']
```
**Where to Get:** 
1. **From Database:** `SELECT value FROM secrets WHERE key = 'NOWPAYMENTS_IPN_SECRET'`
2. **From NOWPayments Dashboard:** https://nowpayments.io → Settings → Store Settings → IPN Secret
3. **CRITICAL:** Save immediately - only shown once upon creation
**IPN Callback URL to Set:** `https://hingecraft-global.ai/_functions/webhooks/nowpayments`

---

## ⚠️ RECOMMENDED SECRETS (Optional but Useful)

### 5. BASE_URL
```
Secret Name: BASE_URL
Secret Value: https://hingecraft-global.ai
```
**Note:** Defaults to `https://www.hingecraft-global.ai` if not set

---

### 6. STRIPE_PUBLISHABLE_KEY_LIVE
```
Secret Name: STRIPE_PUBLISHABLE_KEY_LIVE
Secret Value: [Paste your Stripe publishable key here - starts with pk_live_ or pk_test_]
```
**Note:** Auto-derived from secret key if not set

---

## 🔧 OPTIONAL SECRETS (Only if Using Feature)

### 7. NOWPAYMENTS_BASE_URL
```
Secret Name: NOWPAYMENTS_BASE_URL
Secret Value: https://api.nowpayments.io/v1
```
**Note:** Defaults to `https://api.nowpayments.io/v1` if not set

---

### 8. KYC_THRESHOLD_USD
```
Secret Name: KYC_THRESHOLD_USD
Secret Value: 1000
```
**Note:** Defaults to `1000` if not set

---

### 9. CRYPTO_CONFIRMATIONS_REQUIRED
```
Secret Name: CRYPTO_CONFIRMATIONS_REQUIRED
Secret Value: 3
```
**Note:** Defaults to `3` if not set

---

### 10. EXTERNAL_DB_ENDPOINT
```
Secret Name: EXTERNAL_DB_ENDPOINT
Secret Value: [Your external database API endpoint URL]
```
**Note:** Only needed if using external PostgreSQL database

---

### 11. EXTERNAL_DB_SECRET_KEY
```
Secret Name: EXTERNAL_DB_SECRET_KEY
Secret Value: [Your external database API key]
```
**Note:** Only needed if using external PostgreSQL database

---

### 12. SENDGRID_API_KEY
```
Secret Name: SENDGRID_API_KEY
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'SENDGRID_API_KEY']
```
**Where to Get:** 
1. **From Database:** `SELECT value FROM secrets WHERE key = 'SENDGRID_API_KEY'`
2. **From SendGrid Dashboard:** https://app.sendgrid.com → Settings → API Keys
**Note:** Only needed if using SendGrid for email notifications

---

### 13. EMAIL_FROM
```
Secret Name: EMAIL_FROM
Secret Value: no-reply@hingecraft-global.ai
```
**Note:** Only needed if using email notifications

---

### 14. NOTION_SYNC_URL
```
Secret Name: NOTION_SYNC_URL
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'NOTION_SYNC_URL']
```
**Where to Get:** 
1. **From Database:** `SELECT value FROM secrets WHERE key = 'NOTION_SYNC_URL'`
2. **From Notion:** https://www.notion.so → Settings → Connections → API
**Note:** Only needed if syncing with Notion/CRM

---

### 15. CRM_API_KEY
```
Secret Name: CRM_API_KEY
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'CRM_API_KEY']
```
**Where to Get:** 
1. **From Database:** `SELECT value FROM secrets WHERE key = 'CRM_API_KEY'`
2. **From Notion/CRM Dashboard:** API Keys section
**Note:** Only needed if syncing with Notion/CRM

---

## 💰 CRYPTO WALLET ADDRESSES (For NOWPayments Payouts)

**IMPORTANT:** Wallet addresses must be configured in NOWPayments Dashboard, not in Wix Secrets.

### How to Configure Wallet Addresses

1. **Go to NOWPayments Dashboard:** https://nowpayments.io
2. **Settings** → **Payout Settings** or **Wallet Settings**
3. **Add Wallet Addresses** for each cryptocurrency:
   - Bitcoin (BTC)
   - Ethereum (ETH)
   - Solana (SOL)
   - Stellar (XLM)

### Query Database for Wallet Addresses

```sql
-- Get all wallet addresses from crypto_treasury
SELECT currency, wallet_address, wallet_type, network
FROM crypto_treasury
WHERE is_active = true
ORDER BY currency;

-- Get specific currency addresses
SELECT wallet_address FROM crypto_treasury 
WHERE currency = 'BTC' AND is_active = true;
SELECT wallet_address FROM crypto_treasury 
WHERE currency = 'ETH' AND is_active = true;
SELECT wallet_address FROM crypto_treasury 
WHERE currency = 'SOL' AND is_active = true;
SELECT wallet_address FROM crypto_treasury 
WHERE currency = 'XLM' AND is_active = true;
```

### Wallet Address Format Examples

- **Bitcoin (BTC):** `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` or `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
- **Ethereum (ETH):** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- **Solana (SOL):** `DxPvzLdQYcVj3Vx1qJ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F`
- **Stellar (XLM):** `GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUV`

### NOWPayments API Wallet Configuration

According to NOWPayments API documentation:
- Wallet addresses are configured in the NOWPayments Dashboard
- You specify the `pay_currency` parameter when creating invoices
- NOWPayments uses your configured payout wallet addresses automatically
- No need to pass wallet addresses in API calls (they're stored in your account)

### Extract Wallet Addresses Script

Run this to extract wallet addresses from your database:

```bash
node scripts/extract-wallet-addresses.js
```

This will:
- Query `crypto_treasury` table
- Query `wallets` table
- Query `secrets` table for wallet-related keys
- Generate formatted output for NOWPayments

---

## 💰 Crypto Wallet Addresses

**IMPORTANT:** Wallet addresses are configured in NOWPayments Dashboard, NOT in Wix Secrets.

### Quick Setup:
1. Go to NOWPayments Dashboard → Settings → Payout Settings
2. Add wallet addresses for: BTC, ETH, SOL, XLM
3. Verify addresses are correct
4. Save configuration

### Query Database for Wallet Addresses:
```sql
-- Get all wallet addresses
SELECT currency, wallet_address, wallet_type
FROM crypto_treasury
WHERE is_active = true
ORDER BY currency;

-- Or run extraction script
-- node scripts/extract-wallet-addresses.js
```

**See `WALLET_ADDRESSES_GUIDE.md` for complete wallet configuration guide.**

---

## 🔍 How to Find Your Secrets

### Method 1: Query PostgreSQL Database

**Step 1: Connect to your database**
```bash
psql -h localhost -U postgres -d hingecraft
```

**Step 2: Check if secrets table exists**
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'secrets'
);
```

**Step 3: Query all secrets**
```sql
-- See all secrets (value preview only for security)
SELECT key, name, service, 
       CASE WHEN encrypted THEN '[ENCRYPTED]' ELSE LEFT(value, 20) || '...' END as value_preview
FROM secrets
WHERE is_active = true
ORDER BY service, key;
```

**Step 4: Get specific secrets**
```sql
-- Stripe secrets
SELECT key, value FROM secrets WHERE key LIKE '%STRIPE%' AND is_active = true;

-- NOWPayments secrets
SELECT key, value FROM secrets WHERE key LIKE '%NOWPAYMENTS%' AND is_active = true;

-- SendGrid secrets
SELECT key, value FROM secrets WHERE key LIKE '%SENDGRID%' AND is_active = true;

-- Notion/CRM secrets
SELECT key, value FROM secrets WHERE (key LIKE '%NOTION%' OR key LIKE '%CRM%') AND is_active = true;
```

**Step 5: Use the query script**
```bash
# Run the SQL query file
psql -h localhost -U postgres -d hingecraft -f scripts/query-secrets-from-database.sql
```

### Method 2: Create Secrets Table (If It Doesn't Exist)

If you don't have a secrets table, create it:

```bash
psql -h localhost -U postgres -d hingecraft -f scripts/create-secrets-table.sql
```

Then insert your secrets:
```sql
INSERT INTO secrets (key, name, value, service, environment, description) VALUES
('STRIPE_SECRET_KEY_LIVE', 'Stripe Secret Key', 'YOUR_KEY_HERE', 'stripe', 'production', 'Stripe API secret key'),
('STRIPE_WEBHOOK_SECRET_LIVE', 'Stripe Webhook Secret', 'YOUR_SECRET_HERE', 'stripe', 'production', 'Stripe webhook signing secret'),
('NOWPAYMENTS_API_KEY', 'NOWPayments API Key', 'YOUR_KEY_HERE', 'nowpayments', 'production', 'NOWPayments API key'),
('NOWPAYMENTS_IPN_SECRET', 'NOWPayments IPN Secret', 'YOUR_SECRET_HERE', 'nowpayments', 'production', 'NOWPayments IPN secret');
```

### Method 3: Run Extraction Scripts
```bash
# Extract from database and config files
node scripts/extract-secrets-from-db.js

# Query database directly
node scripts/query-database-for-secrets.js
```

### Method 4: Check API Keys Directory
```bash
cd /path/to/hingecraft-global
ls -la api-keys/
cat api-keys/apikeys.v2.json | grep -i "stripe\|nowpayments\|sendgrid"
```

### Method 5: Check .env Files (If Accessible)
```bash
# Check for .env files (may be gitignored for security)
find . -name ".env*" -type f -exec grep -l "STRIPE\|NOWPAYMENTS\|SENDGRID" {} \;
```

### Method 6: Get from API Dashboards (If Not in Database)

If secrets aren't in your database, get them from:

- **Stripe:** https://dashboard.stripe.com → Developers → API keys
- **NOWPayments:** https://nowpayments.io → Settings → API Keys
- **SendGrid:** https://app.sendgrid.com → Settings → API Keys
- **Notion:** https://www.notion.so → Settings → Connections → API

---

## 🚀 Quick Input Steps

### Method 1: Wix Editor

1. Go to https://editor.wix.com
2. Open your site
3. Press `Ctrl/Cmd + Shift + D` (Dev Mode)
4. Click **Backend** → **Secrets**
5. For each secret above:
   - Click **"Add Secret"**
   - Copy **Secret Name** exactly (case-sensitive)
   - Paste **Secret Value**
   - Click **"Save"**

### Method 2: Wix CLI

```bash
# Login and link
wix login
wix link

# Set required secrets
wix secret set STRIPE_SECRET_KEY_LIVE "YOUR_STRIPE_SECRET_KEY"
wix secret set STRIPE_WEBHOOK_SECRET_LIVE "YOUR_STRIPE_WEBHOOK_SECRET"
wix secret set NOWPAYMENTS_API_KEY "YOUR_NOWPAYMENTS_API_KEY"
wix secret set NOWPAYMENTS_IPN_SECRET "YOUR_NOWPAYMENTS_IPN_SECRET"

# Set recommended secrets (optional)
wix secret set BASE_URL "https://hingecraft-global.ai"
wix secret set STRIPE_PUBLISHABLE_KEY_LIVE "YOUR_STRIPE_PUBLISHABLE_KEY"

# Set optional secrets (only if needed)
wix secret set NOWPAYMENTS_BASE_URL "https://api.nowpayments.io/v1"
wix secret set KYC_THRESHOLD_USD "1000"
wix secret set CRYPTO_CONFIRMATIONS_REQUIRED "3"
# ... continue for other optional secrets
```

---

## ✅ Verification Checklist

After inputting secrets:

- [ ] All 4 required secrets configured
- [ ] Secret names match exactly (case-sensitive)
- [ ] No typos in secret values
- [ ] Test using `scripts/test-secrets.jsw`
- [ ] Check Wix Editor → Monitoring → Logs for errors
- [ ] Test payment flow

---

## 📝 Notes

- **Secret names are case-sensitive** - must match exactly
- **Never commit secrets to Git** - use Wix Secrets Manager only
- **Test keys vs Live keys** - use test keys for development
- **Rotate keys regularly** - update if compromised

---

**Last Updated:** 2025-01-27  
**Status:** Ready for Input
