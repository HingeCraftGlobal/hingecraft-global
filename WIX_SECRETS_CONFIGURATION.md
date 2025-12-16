# Wix Secrets Configuration Guide

## 🔐 Complete Setup Process

This guide walks you through configuring all required API keys and secrets in Wix Secrets Manager.

---

## 📋 Required Secrets

You need to configure **4 secrets** in Wix:

1. **STRIPE_SECRET_KEY** - Stripe API secret key
2. **STRIPE_WEBHOOK_SECRET_LIVE** - Stripe webhook signing secret
3. **NOWPAYMENTS_API_KEY** - NOWPayments API key
4. **NOWPAYMENTS_IPN_SECRET** - NOWPayments IPN secret key

---

## 🚀 Step-by-Step Configuration

### Method 1: Wix Editor (Recommended)

#### Step 1: Access Secrets Manager

1. **Open Wix Editor:**
   - Go to https://editor.wix.com
   - Open your site: `hingecraft-global.ai`
   - Click **Dev Mode** in the top toolbar (or press `Ctrl/Cmd + Shift + D`)

2. **Navigate to Secrets:**
   - In the left sidebar, click **Backend**
   - Click **Secrets** (or go to **Settings** → **Secrets**)

#### Step 2: Add Stripe Secret Key

1. **Click "Add Secret"** or **"New Secret"**
2. **Secret Name:** `STRIPE_SECRET_KEY`
   - ⚠️ **IMPORTANT:** Use exact name (case-sensitive)
3. **Secret Value:** Your Stripe secret key
   - Format: `sk_live_...` (for production)
   - Or: `sk_test_...` (for testing)
4. **Click "Save"**

**Where to Find Stripe Secret Key:**
- Go to https://dashboard.stripe.com
- Click **Developers** → **API keys**
- Copy the **Secret key** (starts with `sk_live_` or `sk_test_`)

#### Step 3: Add Stripe Webhook Secret

1. **Click "Add Secret"** again
2. **Secret Name:** `STRIPE_WEBHOOK_SECRET_LIVE`
   - ⚠️ **IMPORTANT:** Use exact name (case-sensitive)
3. **Secret Value:** Your Stripe webhook signing secret
   - Format: `whsec_...`
4. **Click "Save"**

**Where to Find Stripe Webhook Secret:**
- Go to https://dashboard.stripe.com
- Click **Developers** → **Webhooks**
- Click on your webhook endpoint (or create one)
- Click **Reveal** next to "Signing secret"
- Copy the secret (starts with `whsec_`)

**Webhook Endpoint URL:**
- Set webhook URL to: `https://hingecraft-global.ai/_functions/webhooks/stripe`
- Events to listen for: `checkout.session.completed`, `payment_intent.succeeded`

#### Step 4: Add NOWPayments API Key

1. **Click "Add Secret"** again
2. **Secret Name:** `NOWPAYMENTS_API_KEY`
   - ⚠️ **IMPORTANT:** Use exact name (case-sensitive)
3. **Secret Value:** Your NOWPayments API key
4. **Click "Save"**

**Where to Find NOWPayments API Key:**
- Go to https://nowpayments.io
- Log in to your account
- Go to **Settings** → **API Keys**
- Click **"Add new key"** or copy existing key
- ⚠️ **Save it immediately** - it's only shown once

#### Step 5: Add NOWPayments IPN Secret

1. **Click "Add Secret"** again
2. **Secret Name:** `NOWPAYMENTS_IPN_SECRET`
   - ⚠️ **IMPORTANT:** Use exact name (case-sensitive)
3. **Secret Value:** Your NOWPayments IPN secret key
4. **Click "Save"**

**Where to Find NOWPayments IPN Secret:**
- Go to https://nowpayments.io
- Log in to your account
- Go to **Settings** → **Store Settings**
- Find **"IPN Secret Key"**
- Click **"Generate"** or copy existing key
- ⚠️ **CRITICAL:** Save it immediately - it's only shown once upon creation

**IPN Callback URL:**
- Set IPN callback URL to: `https://hingecraft-global.ai/_functions/webhooks/nowpayments`
- This must be configured in NOWPayments Dashboard → Store Settings

---

### Method 2: Wix CLI (Alternative)

If you prefer using the command line:

```bash
# Navigate to your project
cd /path/to/hingecraft-global

# Login to Wix CLI
wix login

# Link to your site
wix link

# Set secrets
wix secret set STRIPE_SECRET_KEY "sk_live_YOUR_KEY_HERE"
wix secret set STRIPE_WEBHOOK_SECRET_LIVE "whsec_YOUR_SECRET_HERE"
wix secret set NOWPAYMENTS_API_KEY "YOUR_NOWPAYMENTS_API_KEY"
wix secret set NOWPAYMENTS_IPN_SECRET "YOUR_NOWPAYMENTS_IPN_SECRET"
```

---

## ✅ Verification Checklist

After setting all secrets, verify they're configured:

### In Wix Editor:
- [ ] Go to **Dev Mode** → **Backend** → **Secrets**
- [ ] Confirm all 4 secrets are listed:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET_LIVE`
  - [ ] `NOWPAYMENTS_API_KEY`
  - [ ] `NOWPAYMENTS_IPN_SECRET`
- [ ] Verify secret names match **exactly** (case-sensitive)

### Test Secret Access:

Create a test backend function to verify secrets are accessible:

```javascript
// Test file: src/backend/test-secrets.jsw
import { secrets } from 'wix-secrets-backend';

export async function testSecrets() {
    try {
        const stripeKey = await secrets.getSecret('STRIPE_SECRET_KEY');
        const stripeWebhook = await secrets.getSecret('STRIPE_WEBHOOK_SECRET_LIVE');
        const nowPaymentsKey = await secrets.getSecret('NOWPAYMENTS_API_KEY');
        const nowPaymentsIPN = await secrets.getSecret('NOWPAYMENTS_IPN_SECRET');
        
        return {
            stripeKey: stripeKey ? '✅ Configured' : '❌ Missing',
            stripeWebhook: stripeWebhook ? '✅ Configured' : '❌ Missing',
            nowPaymentsKey: nowPaymentsKey ? '✅ Configured' : '❌ Missing',
            nowPaymentsIPN: nowPaymentsIPN ? '✅ Configured' : '❌ Missing'
        };
    } catch (error) {
        return { error: error.message };
    }
}
```

Call this function from your frontend to verify all secrets are accessible.

---

## 🔒 Security Best Practices

1. **Never commit secrets to Git:**
   - Secrets are stored securely in Wix Secrets Manager
   - Never hardcode secrets in your code
   - Never share secrets in documentation

2. **Use different keys for test/production:**
   - Test keys: `sk_test_...`, `whsec_test_...`
   - Production keys: `sk_live_...`, `whsec_live_...`

3. **Rotate keys regularly:**
   - Update secrets if compromised
   - Use Wix Secrets Manager to update values

4. **Restrict access:**
   - Only authorized developers should access Secrets Manager
   - Use Wix permissions to control access

---

## 🐛 Troubleshooting

### Secret Not Found Error

**Error:** `STRIPE_SECRET_KEY not configured`

**Solution:**
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is saved in Wix Secrets Manager
3. Try refreshing the page and checking again
4. Ensure you're in the correct Wix site

### Webhook Signature Verification Fails

**Error:** `Invalid webhook signature`

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET_LIVE` matches the webhook's signing secret
2. Check webhook URL is correct in Stripe Dashboard
3. Ensure webhook secret is from the correct environment (test vs live)

### NOWPayments API Errors

**Error:** `NOWPayments API error: 401`

**Solution:**
1. Verify `NOWPAYMENTS_API_KEY` is correct
2. Check API key hasn't expired or been revoked
3. Ensure you're using the correct environment (sandbox vs production)

### IPN Verification Fails

**Error:** `Invalid IPN signature`

**Solution:**
1. Verify `NOWPAYMENTS_IPN_SECRET` matches the IPN secret in NOWPayments Dashboard
2. Check IPN callback URL is set correctly
3. Ensure IPN secret was saved correctly (it's only shown once)

---

## 📝 Secret Reference Table

| Secret Name | Format | Example | Where to Get |
|------------|--------|---------|--------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | `sk_live_51AbC...` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET_LIVE` | `whsec_...` | `whsec_AbC123...` | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `NOWPAYMENTS_API_KEY` | Alphanumeric string | `abc123def456...` | NOWPayments Dashboard → Settings → API Keys |
| `NOWPAYMENTS_IPN_SECRET` | Alphanumeric string | `xyz789uvw012...` | NOWPayments Dashboard → Settings → Store Settings → IPN Secret |

---

## 🎯 Next Steps

After configuring all secrets:

1. **Test Payment Flow:**
   - Submit Mission Support form
   - Complete a test payment
   - Verify webhook receives and processes events

2. **Check Logs:**
   - Go to Wix Editor → **Monitoring** → **Logs**
   - Look for any secret-related errors
   - Verify webhook events are being received

3. **Verify Database:**
   - Check that payment records are created
   - Verify custom invoice IDs are stored correctly

---

## 📞 Support

If you encounter issues:

1. **Check Wix Documentation:**
   - https://www.wix.com/velo/reference/wix-secrets-backend

2. **Verify Secret Names:**
   - Ensure exact match (case-sensitive)
   - No extra spaces or characters

3. **Test in Development:**
   - Use test keys first
   - Verify everything works before switching to live keys

---

**Last Updated:** 2025-01-27  
**Status:** Complete Secrets Configuration Guide
