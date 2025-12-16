# Secrets Input Template for Wix Secrets Manager

## 📋 Copy-Paste Ready Format

Use this template to input secrets into Wix Secrets Manager. Fill in the values from your database or API dashboards.

---

## ✅ REQUIRED SECRETS (Must Configure)

### 1. STRIPE_SECRET_KEY_LIVE
```
Secret Name: STRIPE_SECRET_KEY_LIVE
Secret Value: [🔍 CHECK: api-keys/stripe_keys.json or database secrets table]
```
**Where to Get:** 
- Stripe Dashboard → Developers → API keys → Secret key
- Or check: `api-keys/stripe_keys.json` in your project
- Or query database: `SELECT * FROM secrets WHERE key LIKE '%stripe%'`

---

### 2. STRIPE_WEBHOOK_SECRET_LIVE
```
Secret Name: STRIPE_WEBHOOK_SECRET_LIVE
Secret Value: [Paste your Stripe webhook signing secret here - starts with whsec_]
```
**Where to Get:** Stripe Dashboard → Developers → Webhooks → Signing secret  
**Webhook URL to Set:** `https://hingecraft-global.ai/_functions/webhooks/stripe`

---

### 3. NOWPAYMENTS_API_KEY
```
Secret Name: NOWPAYMENTS_API_KEY
Secret Value: [Paste your NOWPayments API key here]
```
**Where to Get:** NOWPayments Dashboard → Settings → API Keys

---

### 4. NOWPAYMENTS_IPN_SECRET
```
Secret Name: NOWPAYMENTS_IPN_SECRET
Secret Value: [Paste your NOWPayments IPN secret key here]
```
**Where to Get:** NOWPayments Dashboard → Settings → Store Settings → IPN Secret  
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
Secret Value: [Your SendGrid API key]
```
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
Secret Value: [Your Notion API endpoint URL]
```
**Note:** Only needed if syncing with Notion/CRM

---

### 15. CRM_API_KEY
```
Secret Name: CRM_API_KEY
Secret Value: [Your CRM/Notion API key]
```
**Note:** Only needed if syncing with Notion/CRM

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
