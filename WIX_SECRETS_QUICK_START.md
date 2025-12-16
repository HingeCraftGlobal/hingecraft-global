# Wix Secrets Quick Start Guide

## ⚡ Fast Setup (5 Minutes)

### Step 1: Open Wix Secrets Manager

1. Go to https://editor.wix.com
2. Open your site
3. Press `Ctrl/Cmd + Shift + D` (Dev Mode)
4. Click **Backend** → **Secrets**

### Step 2: Add These 4 Secrets

Click **"Add Secret"** for each:

| Secret Name | Value Source |
|------------|--------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET_LIVE` | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `NOWPAYMENTS_API_KEY` | NOWPayments Dashboard → Settings → API Keys |
| `NOWPAYMENTS_IPN_SECRET` | NOWPayments Dashboard → Settings → Store Settings → IPN Secret |

⚠️ **IMPORTANT:** Secret names must match **exactly** (case-sensitive)

### Step 3: Verify

1. Check all 4 secrets are listed
2. Test using `test-secrets.jsw` (see below)

---

## 🧪 Test Your Secrets

### Option 1: Create Test Function

1. Create file: `src/backend/test-secrets.jsw`
2. Copy content from `scripts/test-secrets.jsw`
3. Call from frontend:

```javascript
import { testAllSecrets } from 'backend/test-secrets.jsw';

$w.onReady(async function() {
    const results = await testAllSecrets();
    console.log('Secrets Status:', results);
});
```

### Option 2: Check Logs

1. Submit Mission Support form
2. Go to **Monitoring** → **Logs**
3. Look for secret-related errors

---

## 🔗 Where to Get Each Secret

### Stripe Secret Key
1. https://dashboard.stripe.com
2. **Developers** → **API keys**
3. Copy **Secret key** (`sk_live_...`)

### Stripe Webhook Secret
1. https://dashboard.stripe.com
2. **Developers** → **Webhooks**
3. Click your webhook (or create one)
4. Click **Reveal** next to "Signing secret"
5. Copy secret (`whsec_...`)

**Webhook URL to set:** `https://hingecraft-global.ai/_functions/webhooks/stripe`

### NOWPayments API Key
1. https://nowpayments.io
2. Log in
3. **Settings** → **API Keys**
4. Click **"Add new key"** or copy existing
5. ⚠️ Save immediately (only shown once)

### NOWPayments IPN Secret
1. https://nowpayments.io
2. Log in
3. **Settings** → **Store Settings**
4. Find **"IPN Secret Key"**
5. Click **"Generate"** or copy existing
6. ⚠️ Save immediately (only shown once)

**IPN Callback URL to set:** `https://hingecraft-global.ai/_functions/webhooks/nowpayments`

---

## ✅ Verification Checklist

- [ ] All 4 secrets added to Wix Secrets Manager
- [ ] Secret names match exactly (case-sensitive)
- [ ] Stripe webhook URL configured
- [ ] NOWPayments IPN callback URL configured
- [ ] Test secrets using test function
- [ ] No errors in logs

---

## 🚨 Common Issues

**"Secret not found"**
→ Check secret name matches exactly (case-sensitive)

**"Invalid webhook signature"**
→ Verify webhook secret matches Stripe Dashboard

**"NOWPayments API error: 401"**
→ Check API key is correct and active

**"Invalid IPN signature"**
→ Verify IPN secret matches NOWPayments Dashboard

---

**Need more details?** See `WIX_SECRETS_CONFIGURATION.md` for complete guide.
