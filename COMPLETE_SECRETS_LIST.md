# Complete Secrets List for HingeCraft Global

## 🔐 All Required Secrets

This document lists **ALL** secrets required for the HingeCraft Global payment system, pulled from the codebase.

---

## 📋 Core Payment Secrets (Required)

### 1. Stripe Secrets

| Secret Name | Code Reference | Required | Format | Where to Get |
|------------|----------------|----------|--------|--------------|
| `STRIPE_SECRET_KEY_LIVE` | `stripe.api.jsw` | ✅ **REQUIRED** | `sk_live_...` or `sk_test_...` | Stripe Dashboard → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET_LIVE` | `webhooks/stripe.jsw` | ✅ **REQUIRED** | `whsec_...` | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `STRIPE_PUBLISHABLE_KEY_LIVE` | `stripe.api.jsw` | ⚠️ Optional | `pk_live_...` | Stripe Dashboard → Developers → API keys → Publishable key (or auto-derived) |

**Fallback Names:**
- `STRIPE_SECRET_KEY` (works as fallback for `STRIPE_SECRET_KEY_LIVE`)
- `STRIPE_WEBHOOK_SECRET` (works as fallback for `STRIPE_WEBHOOK_SECRET_LIVE`)

### 2. NOWPayments Secrets

| Secret Name | Code Reference | Required | Format | Where to Get |
|------------|----------------|----------|--------|--------------|
| `NOWPAYMENTS_API_KEY` | `nowpayments.api.jsw` | ✅ **REQUIRED** | Alphanumeric string | NOWPayments Dashboard → Settings → API Keys |
| `NOWPAYMENTS_IPN_SECRET` | `nowpayments.api.jsw`, `webhooks/nowpayments.jsw` | ✅ **REQUIRED** | Alphanumeric string | NOWPayments Dashboard → Settings → Store Settings → IPN Secret |
| `NOWPAYMENTS_BASE_URL` | `nowpayments.api.jsw` | ⚠️ Optional | URL | Default: `https://api.nowpayments.io/v1` |

---

## 🔧 Configuration Secrets (Optional but Recommended)

### 3. Base URL Configuration

| Secret Name | Code Reference | Required | Default Value | Purpose |
|------------|----------------|----------|--------------|---------|
| `BASE_URL` | `nowpayments.api.jsw`, `charter-page-middleware.jsw` | ⚠️ Optional | `https://www.hingecraft-global.ai` | Base URL for redirects and callbacks |

### 4. Crypto Payment Configuration

| Secret Name | Code Reference | Required | Default Value | Purpose |
|------------|----------------|----------|--------------|---------|
| `KYC_THRESHOLD_USD` | `nowpayments.api.jsw` | ⚠️ Optional | `1000` | KYC threshold in USD |
| `CRYPTO_CONFIRMATIONS_REQUIRED` | `nowpayments.api.jsw` | ⚠️ Optional | `3` | Number of blockchain confirmations required |

---

## 🗄️ External Database Secrets (If Using External DB)

| Secret Name | Code Reference | Required | Format | Purpose |
|------------|----------------|----------|--------|---------|
| `EXTERNAL_DB_ENDPOINT` | `nowpayments.api.jsw`, `reconciliation-worker.jsw`, `notion-crm-sync.jsw` | ⚠️ Optional | URL | External database API endpoint |
| `EXTERNAL_DB_SECRET_KEY` | `nowpayments.api.jsw`, `reconciliation-worker.jsw`, `notion-crm-sync.jsw` | ⚠️ Optional | String | API key for external database |

**Note:** These are only needed if you're using an external PostgreSQL database instead of Wix Data.

---

## 📧 Email Service Secrets (If Using SendGrid)

| Secret Name | Code Reference | Required | Format | Purpose |
|------------|----------------|----------|--------|---------|
| `SENDGRID_API_KEY` | `email-templates.jsw` | ⚠️ Optional | String | SendGrid API key for sending emails |
| `EMAIL_FROM` | `email-templates.jsw` | ⚠️ Optional | Email address | Default sender email address |

**Note:** These are only needed if you're using SendGrid for email notifications.

---

## 🔗 CRM Integration Secrets (If Using Notion/CRM)

| Secret Name | Code Reference | Required | Format | Purpose |
|------------|----------------|----------|--------|---------|
| `NOTION_SYNC_URL` | `notion-crm-sync.jsw` | ⚠️ Optional | URL | Notion API endpoint for CRM sync |
| `CRM_API_KEY` | `notion-crm-sync.jsw` | ⚠️ Optional | String | API key for CRM/Notion integration |

**Note:** These are only needed if you're syncing data with Notion or another CRM system.

---

## 📊 Summary Table

### ✅ **MUST CONFIGURE** (Required for Payment System)

1. `STRIPE_SECRET_KEY_LIVE` - Stripe API secret key
2. `STRIPE_WEBHOOK_SECRET_LIVE` - Stripe webhook signing secret
3. `NOWPAYMENTS_API_KEY` - NOWPayments API key
4. `NOWPAYMENTS_IPN_SECRET` - NOWPayments IPN secret key

### ⚠️ **RECOMMENDED** (Optional but Useful)

5. `BASE_URL` - Base URL for redirects (defaults to `https://www.hingecraft-global.ai`)
6. `STRIPE_PUBLISHABLE_KEY_LIVE` - Stripe publishable key (auto-derived if not set)

### 🔧 **OPTIONAL** (Advanced Configuration)

7. `NOWPAYMENTS_BASE_URL` - NOWPayments API base URL (defaults to `https://api.nowpayments.io/v1`)
8. `KYC_THRESHOLD_USD` - KYC threshold (defaults to `1000`)
9. `CRYPTO_CONFIRMATIONS_REQUIRED` - Crypto confirmations (defaults to `3`)
10. `EXTERNAL_DB_ENDPOINT` - External database endpoint (only if using external DB)
11. `EXTERNAL_DB_SECRET_KEY` - External database API key (only if using external DB)
12. `SENDGRID_API_KEY` - SendGrid API key (only if using email notifications)
13. `EMAIL_FROM` - Default sender email (only if using email notifications)
14. `NOTION_SYNC_URL` - Notion API endpoint (only if using CRM sync)
15. `CRM_API_KEY` - CRM/Notion API key (only if using CRM sync)

---

## 🚀 Quick Setup Checklist

### Minimum Required (4 Secrets)

- [ ] `STRIPE_SECRET_KEY_LIVE`
- [ ] `STRIPE_WEBHOOK_SECRET_LIVE`
- [ ] `NOWPAYMENTS_API_KEY`
- [ ] `NOWPAYMENTS_IPN_SECRET`

### Recommended (2 Additional)

- [ ] `BASE_URL` (if different from default)
- [ ] `STRIPE_PUBLISHABLE_KEY_LIVE` (if not auto-deriving)

### Advanced (5 Additional - Only if needed)

- [ ] `NOWPAYMENTS_BASE_URL` (if using custom endpoint)
- [ ] `KYC_THRESHOLD_USD` (if different from $1000)
- [ ] `CRYPTO_CONFIRMATIONS_REQUIRED` (if different from 3)
- [ ] `EXTERNAL_DB_ENDPOINT` (if using external database)
- [ ] `EXTERNAL_DB_SECRET_KEY` (if using external database)

---

## 📝 Where Each Secret is Used

### `STRIPE_SECRET_KEY_LIVE`
- **File:** `src/backend/stripe.api.jsw`
- **Function:** `initStripeConfig()`
- **Usage:** Creating Stripe checkout sessions, API calls

### `STRIPE_WEBHOOK_SECRET_LIVE`
- **File:** `src/backend/webhooks/stripe.jsw`
- **Function:** `verifyStripeSignature()`
- **Usage:** Verifying webhook authenticity

### `NOWPAYMENTS_API_KEY`
- **File:** `src/backend/nowpayments.api.jsw`
- **Function:** `initNowPaymentsConfig()`
- **Usage:** Creating NOWPayments invoices, API calls

### `NOWPAYMENTS_IPN_SECRET`
- **File:** `src/backend/webhooks/nowpayments.jsw`
- **Function:** `verifyWebhookSignature()`
- **Usage:** Verifying IPN/webhook authenticity (HMAC-SHA512)

### `BASE_URL`
- **Files:** `src/backend/nowpayments.api.jsw`, `src/backend/charter-page-middleware.jsw`
- **Usage:** Constructing redirect URLs, webhook callbacks

---

## 🔍 How to Check Your Database for Existing Secrets

If you have secrets stored in a database or config file, check for:

1. **PostgreSQL Database:**
   - Table: `secrets` or `config`
   - Look for columns: `key`, `value`, `name`

2. **Environment Files:**
   - `.env` files
   - `config.json` files
   - `secrets.json` files

3. **Wix Data Collections:**
   - Collection: `Secrets` or `Config`
   - Fields: `name`, `value`

**⚠️ Security Note:** Never commit secrets to Git. Always use Wix Secrets Manager.

---

## ✅ Verification Script

Use `scripts/test-secrets.jsw` to verify all secrets are configured:

```javascript
import { testAllSecrets } from 'backend/test-secrets.jsw';

const results = await testAllSecrets();
console.log(results);
```

---

## 📞 Next Steps

1. **Configure Required Secrets:**
   - Follow `WIX_SECRETS_QUICK_START.md` for fast setup
   - Or `WIX_SECRETS_CONFIGURATION.md` for detailed guide

2. **Test Configuration:**
   - Use `test-secrets.jsw` to verify
   - Check Wix Editor → Monitoring → Logs for errors

3. **Configure Webhooks:**
   - Stripe: `https://hingecraft-global.ai/_functions/webhooks/stripe`
   - NOWPayments: `https://hingecraft-global.ai/_functions/webhooks/nowpayments`

---

**Last Updated:** 2025-01-27  
**Total Required Secrets:** 4 (minimum) | 6 (recommended) | 15 (all including optional)
