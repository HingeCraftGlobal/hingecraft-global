# Secrets Extraction Guide

## 🔍 How to Extract Secrets from Your Database

This guide helps you extract all required secrets from your database and configuration files, then prepare them for input into Wix Secrets Manager.

---

## 📋 Step 1: Run Extraction Script

### Option A: Automated Extraction (Recommended)

```bash
cd /path/to/hingecraft-global
node scripts/extract-secrets-from-db.js
```

This script will:
- ✅ Check PostgreSQL database (if configured)
- ✅ Read `.env` files
- ✅ Parse JSON config files
- ✅ Generate Wix CLI commands
- ✅ Create formatted output

### Option B: Manual Extraction

Follow the steps below to manually extract secrets.

---

## 📊 Step 2: Check Your Database

### PostgreSQL Database

If you have a `secrets` table in PostgreSQL:

```sql
-- Query all secrets
SELECT key, value, name 
FROM secrets 
WHERE key IN (
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
```

### Wix Data Collection

If secrets are stored in a Wix Data collection:

1. Go to Wix Editor → Database → Collections
2. Find your `Secrets` or `Config` collection
3. Export or view records
4. Look for the secret names listed below

---

## 📄 Step 3: Check Configuration Files

### .env Files

Check these locations for `.env` files:

- `./.env`
- `./.env.local`
- `./notion/.env`
- `./projects/hingecraft-legacy/.env`

Look for lines like:
```
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_...
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_IPN_SECRET=...
```

### JSON Config Files

Check:
- `./wix.config.json`
- `./config.json`
- Any other config files

---

## 🔑 Step 4: Secret Name Mapping

Your database might use different names. Here's the mapping:

| Wix Secret Name | Alternative Names to Look For |
|----------------|-------------------------------|
| `STRIPE_SECRET_KEY_LIVE` | `STRIPE_SECRET_KEY`, `stripe_secret_key`, `STRIPE_API_KEY` |
| `STRIPE_WEBHOOK_SECRET_LIVE` | `STRIPE_WEBHOOK_SECRET`, `stripe_webhook_secret`, `STRIPE_WEBHOOK` |
| `NOWPAYMENTS_API_KEY` | `nowpayments_api_key`, `NOWPAYMENTS_KEY`, `NP_API_KEY` |
| `NOWPAYMENTS_IPN_SECRET` | `nowpayments_ipn_secret`, `NP_IPN_SECRET`, `NOWPAYMENTS_IPN` |
| `BASE_URL` | `base_url`, `BASEURL`, `SITE_URL` |
| `STRIPE_PUBLISHABLE_KEY_LIVE` | `STRIPE_PUBLISHABLE_KEY`, `stripe_publishable_key` |
| `SENDGRID_API_KEY` | `sendgrid_api_key`, `SENDGRID_KEY` |
| `EMAIL_FROM` | `email_from`, `FROM_EMAIL`, `SENDER_EMAIL` |
| `NOTION_SYNC_URL` | `notion_sync_url`, `NOTION_URL` |
| `CRM_API_KEY` | `crm_api_key`, `NOTION_API_KEY` |

---

## 📝 Step 5: Prepare Secrets for Wix

### Format: Secret Name → Secret Value

Create a list like this:

```
STRIPE_SECRET_KEY_LIVE=sk_live_51AbC123...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_AbC123...
NOWPAYMENTS_API_KEY=abc123def456...
NOWPAYMENTS_IPN_SECRET=xyz789uvw012...
BASE_URL=https://hingecraft-global.ai
```

---

## 🚀 Step 6: Input into Wix Secrets Manager

### Method 1: Wix Editor (Recommended)

1. Go to https://editor.wix.com
2. Open your site
3. Press `Ctrl/Cmd + Shift + D` (Dev Mode)
4. Click **Backend** → **Secrets**
5. For each secret:
   - Click **"Add Secret"**
   - Enter exact name (case-sensitive)
   - Paste the value
   - Click **"Save"**

### Method 2: Wix CLI

```bash
# Login to Wix
wix login

# Link to your site
wix link

# Set each secret
wix secret set STRIPE_SECRET_KEY_LIVE "sk_live_YOUR_KEY"
wix secret set STRIPE_WEBHOOK_SECRET_LIVE "whsec_YOUR_SECRET"
wix secret set NOWPAYMENTS_API_KEY "YOUR_API_KEY"
wix secret set NOWPAYMENTS_IPN_SECRET "YOUR_IPN_SECRET"
# ... continue for all secrets
```

---

## ✅ Step 7: Verification

After inputting secrets, verify they're configured:

1. **Use Test Script:**
   ```javascript
   import { testAllSecrets } from 'backend/test-secrets.jsw';
   const results = await testAllSecrets();
   console.log(results);
   ```

2. **Check Logs:**
   - Go to Wix Editor → **Monitoring** → **Logs**
   - Look for secret-related errors

3. **Test Payment Flow:**
   - Submit Mission Support form
   - Check for any "secret not found" errors

---

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- Never commit secrets to Git
- Never share secrets in documentation
- Use Wix Secrets Manager (secure storage)
- Rotate keys if compromised
- Use different keys for test/production

---

## 📞 Troubleshooting

### "Secret not found" Error

**Solution:**
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is saved in Wix Secrets Manager
3. Try refreshing the page
4. Check you're in the correct Wix site

### Secrets Not in Database

**Solution:**
1. Check if you need to create new API keys
2. Follow `WIX_SECRETS_CONFIGURATION.md` to get new keys
3. Some secrets might not exist yet (optional ones)

### Database Connection Failed

**Solution:**
1. Update `DB_CONFIG` in `extract-secrets-from-db.js`
2. Or manually check database
3. Or extract from `.env` files instead

---

## 📋 Quick Checklist

- [ ] Run extraction script or manually check database
- [ ] Find all required secrets (4 minimum)
- [ ] Map database names to Wix secret names
- [ ] Prepare secrets list
- [ ] Input into Wix Secrets Manager
- [ ] Verify using test script
- [ ] Test payment flow

---

**Last Updated:** 2025-01-27  
**Status:** Complete Extraction Guide
