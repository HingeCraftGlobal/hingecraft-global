# Fill Secrets Template Guide

## 🎯 Complete Process: Apply Database & Fill SECRETS_INPUT_TEMPLATE.md

This guide walks you through applying your database and extracting all secrets to fill the template.

---

## 📋 Step 1: Apply Database Schema

### Create Secrets Table (If Not Exists)

```bash
# Connect to your PostgreSQL database
psql -h localhost -U postgres -d hingecraft

# Run the secrets table creation script
\i scripts/create-secrets-table.sql
```

Or manually:

```sql
-- Check if secrets table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'secrets'
);

-- If it doesn't exist, create it using scripts/create-secrets-table.sql
```

---

## 🔍 Step 2: Query Database for Secrets

### Option A: Run Query Script

```bash
psql -h localhost -U postgres -d hingecraft -f scripts/query-secrets-from-database.sql
```

### Option B: Manual SQL Queries

```sql
-- 1. Check if secrets table exists and has data
SELECT COUNT(*) FROM secrets;

-- 2. Get all secrets (value preview for security)
SELECT 
    key,
    name,
    service,
    CASE WHEN encrypted THEN '[ENCRYPTED]' ELSE LEFT(value, 20) || '...' END as value_preview
FROM secrets
WHERE is_active = true
ORDER BY service, key;

-- 3. Get specific secrets for Wix
SELECT key, value FROM secrets WHERE key IN (
    'STRIPE_SECRET_KEY_LIVE',
    'STRIPE_WEBHOOK_SECRET_LIVE',
    'NOWPAYMENTS_API_KEY',
    'NOWPAYMENTS_IPN_SECRET',
    'BASE_URL',
    'STRIPE_PUBLISHABLE_KEY_LIVE',
    'SENDGRID_API_KEY',
    'EMAIL_FROM',
    'NOTION_SYNC_URL',
    'CRM_API_KEY'
) AND is_active = true;
```

---

## 📝 Step 3: Fill SECRETS_INPUT_TEMPLATE.md

### For Each Secret:

1. **Query Database:**
   ```sql
   SELECT value FROM secrets WHERE key = 'SECRET_NAME_HERE';
   ```

2. **Copy the value** from the query result

3. **Paste into SECRETS_INPUT_TEMPLATE.md** replacing the placeholder

### Example:

**Before:**
```
Secret Name: STRIPE_SECRET_KEY_LIVE
Secret Value: [🔍 QUERY DATABASE: SELECT value FROM secrets WHERE key = 'STRIPE_SECRET_KEY_LIVE']
```

**After (with actual value):**
```
Secret Name: STRIPE_SECRET_KEY_LIVE
Secret Value: sk_live_51AbC123xyz789...
```

---

## 🔑 Step 4: Get Secrets from API Dashboards (If Not in Database)

If secrets aren't in your database, get them from:

### Stripe Secrets

1. Go to: https://dashboard.stripe.com
2. **Developers** → **API keys**
3. Copy **Secret key** → Paste as `STRIPE_SECRET_KEY_LIVE`
4. **Developers** → **Webhooks**
5. Click your webhook → **Reveal** signing secret → Paste as `STRIPE_WEBHOOK_SECRET_LIVE`

### NOWPayments Secrets

1. Go to: https://nowpayments.io
2. **Settings** → **API Keys** → Copy API key → Paste as `NOWPAYMENTS_API_KEY`
3. **Settings** → **Store Settings** → **IPN Secret Key** → Copy → Paste as `NOWPAYMENTS_IPN_SECRET`
   - ⚠️ **CRITICAL:** Save immediately - only shown once

### SendGrid Secrets (If Using)

1. Go to: https://app.sendgrid.com
2. **Settings** → **API Keys** → Create/View key → Copy → Paste as `SENDGRID_API_KEY`

### Notion/CRM Secrets (If Using)

1. Go to: https://www.notion.so
2. **Settings** → **Connections** → **API** → Copy keys → Paste as `NOTION_SYNC_URL` and `CRM_API_KEY`

---

## ✅ Step 5: Complete Template Checklist

After filling the template, verify:

- [ ] **STRIPE_SECRET_KEY_LIVE** - Value filled (starts with `sk_live_` or `sk_test_`)
- [ ] **STRIPE_WEBHOOK_SECRET_LIVE** - Value filled (starts with `whsec_`)
- [ ] **NOWPAYMENTS_API_KEY** - Value filled
- [ ] **NOWPAYMENTS_IPN_SECRET** - Value filled
- [ ] **BASE_URL** - Value filled (default: `https://hingecraft-global.ai`)
- [ ] **STRIPE_PUBLISHABLE_KEY_LIVE** - Value filled (optional, starts with `pk_live_`)
- [ ] **SENDGRID_API_KEY** - Value filled (if using email)
- [ ] **EMAIL_FROM** - Value filled (if using email)
- [ ] **NOTION_SYNC_URL** - Value filled (if using CRM)
- [ ] **CRM_API_KEY** - Value filled (if using CRM)

---

## 🚀 Step 6: Input into Wix Secrets Manager

Once template is filled:

### Method 1: Wix Editor

1. Go to https://editor.wix.com
2. Open your site
3. Press `Ctrl/Cmd + Shift + D` (Dev Mode)
4. Click **Backend** → **Secrets**
5. For each secret in the filled template:
   - Click **"Add Secret"**
   - Copy **Secret Name** exactly
   - Copy **Secret Value** from template
   - Click **"Save"**

### Method 2: Wix CLI

```bash
# Login and link
wix login
wix link

# Set each secret (copy from filled template)
wix secret set STRIPE_SECRET_KEY_LIVE "sk_live_YOUR_ACTUAL_KEY"
wix secret set STRIPE_WEBHOOK_SECRET_LIVE "whsec_YOUR_ACTUAL_SECRET"
# ... continue for all secrets
```

---

## 📊 Current Database Status

Based on extraction script results:

### ✅ Found in Database:
- `EXTERNAL_DB_ENDPOINT`: `http://localhost:3000`

### ❌ Not Found (Need to Get from API Dashboards):
- `STRIPE_SECRET_KEY_LIVE`
- `STRIPE_WEBHOOK_SECRET_LIVE`
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`
- `SENDGRID_API_KEY`
- `NOTION_SYNC_URL`
- `CRM_API_KEY`

### ⚠️ Recommended (Can Use Defaults):
- `BASE_URL`: Defaults to `https://www.hingecraft-global.ai` if not set
- `STRIPE_PUBLISHABLE_KEY_LIVE`: Auto-derived from secret key if not set

---

## 🔧 Quick Commands

### Query All Secrets from Database
```sql
SELECT key, LEFT(value, 30) || '...' as value_preview, service
FROM secrets
WHERE is_active = true
ORDER BY service, key;
```

### Export Secrets for Wix (Formatted)
```sql
SELECT 
    'Secret Name: ' || key || E'\n' ||
    'Secret Value: ' || value || E'\n' ||
    '---' AS wix_format
FROM secrets
WHERE is_active = true
ORDER BY service, key;
```

### Insert Secrets into Database (If You Have Them)
```sql
INSERT INTO secrets (key, name, value, service, environment, description) VALUES
('STRIPE_SECRET_KEY_LIVE', 'Stripe Secret Key', 'YOUR_KEY_HERE', 'stripe', 'production', 'Stripe API secret key'),
('STRIPE_WEBHOOK_SECRET_LIVE', 'Stripe Webhook Secret', 'YOUR_SECRET_HERE', 'stripe', 'production', 'Stripe webhook signing secret'),
('NOWPAYMENTS_API_KEY', 'NOWPayments API Key', 'YOUR_KEY_HERE', 'nowpayments', 'production', 'NOWPayments API key'),
('NOWPAYMENTS_IPN_SECRET', 'NOWPayments IPN Secret', 'YOUR_SECRET_HERE', 'nowpayments', 'production', 'NOWPayments IPN secret')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "_updatedDate" = CURRENT_TIMESTAMP;
```

---

## 📋 Final Template Format

After filling, your template should look like:

```markdown
### 1. STRIPE_SECRET_KEY_LIVE
```
Secret Name: STRIPE_SECRET_KEY_LIVE
Secret Value: sk_live_51AbC123xyz789...
```
**Where to Get:** From database query or Stripe Dashboard
```

---

## ✅ Verification

After filling template and inputting into Wix:

1. **Test Secrets:**
   ```javascript
   import { testAllSecrets } from 'backend/test-secrets.jsw';
   const results = await testAllSecrets();
   console.log(results);
   ```

2. **Check Logs:**
   - Wix Editor → **Monitoring** → **Logs**
   - Look for secret-related errors

3. **Test Payment Flow:**
   - Submit Mission Support form
   - Verify no "secret not found" errors

---

**Last Updated:** 2025-01-27  
**Status:** Ready to Fill Template
