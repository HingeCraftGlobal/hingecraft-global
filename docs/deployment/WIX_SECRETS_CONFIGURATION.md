# Wix Secrets Manager Configuration

## Required Secrets for HingeCraft Payment System

---

## 🔑 Stripe Secrets (Required)

### 1. STRIPE_SECRET_KEY_TEST

**Purpose:** Stripe API secret key for test/development mode

**Where to Get:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** (starts with `sk_test_...`)
3. Add to Wix Secrets Manager

**Value Format:**
```
sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
```

**Usage:**
- Used by `stripe.api.jsw` to create invoices
- Used for development/testing
- Automatically selected when in test mode

---

### 2. STRIPE_SECRET_KEY_LIVE

**Purpose:** Stripe API secret key for production mode

**Where to Get:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Secret key** (starts with `sk_live_...`)
3. Add to Wix Secrets Manager

**Value Format:**
```
sk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
```

**Usage:**
- Used by `stripe.api.jsw` to create invoices
- Used for production/live payments
- Automatically selected when in live mode

**⚠️ Important:** Only add this when ready for production!

---

### 3. STRIPE_PUBLISHABLE_KEY_TEST

**Purpose:** Stripe publishable key for frontend (test mode)

**Where to Get:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_test_...`)
3. Add to Wix Secrets Manager

**Value Format:**
```
pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
```

**Usage:**
- Used by frontend HTML to initialize Stripe.js
- Used for development/testing
- Safe to expose (public key)

---

### 4. STRIPE_PUBLISHABLE_KEY_LIVE

**Purpose:** Stripe publishable key for frontend (production mode)

**Where to Get:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (starts with `pk_live_...`)
3. Add to Wix Secrets Manager

**Value Format:**
```
pk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
```

**Usage:**
- Used by frontend HTML to initialize Stripe.js
- Used for production/live payments
- Safe to expose (public key)

**⚠️ Important:** Only add this when ready for production!

---

## 🔑 NOWPayments Secrets (Optional)

### 5. NOWPAYMENTS_API_KEY

**Purpose:** NOWPayments API key for crypto payments

**Where to Get:**
1. Go to: https://nowpayments.io/dashboard
2. Navigate to **API Keys** section
3. Copy **API Key**
4. Add to Wix Secrets Manager

**Value Format:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Usage:**
- Used by `nowpayments.api.jsw` to create crypto invoices
- Required for crypto payment functionality
- If not set, crypto payments will fail gracefully

---

### 6. NOWPAYMENTS_IPN_SECRET

**Purpose:** NOWPayments IPN (Instant Payment Notification) secret

**Where to Get:**
1. Go to: https://nowpayments.io/dashboard
2. Navigate to **Settings** → **IPN Settings**
3. Copy **IPN Secret Key**
4. Add to Wix Secrets Manager

**Value Format:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Usage:**
- Used to verify webhook signatures from NOWPayments
- Required for secure webhook processing
- If not set, webhooks may not be verified

---

## 🔑 Email Secrets (Optional)

### 7. SENDGRID_API_KEY

**Purpose:** SendGrid API key for sending emails

**Where to Get:**
1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click **Create API Key**
3. Name it (e.g., "HingeCraft Email")
4. Select **Full Access** or **Mail Send** permissions
5. Copy the API key (shown only once!)
6. Add to Wix Secrets Manager

**Value Format:**
```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Usage:**
- Used by `email-templates.jsw` to send emails
- Required for email notifications to marketingcraft@gmail.com
- If not set, emails will not be sent (non-blocking)

---

### 8. EMAIL_FROM

**Purpose:** Email address to send from

**Value:**
```
no-reply@hingecraft-global.ai
```

**Or:**
```
marketingcraft@gmail.com
```

**Usage:**
- Used as the "From" address in emails
- Should be a verified email in SendGrid
- Defaults to `no-reply@hingecraft-global.ai` if not set

---

## 🔑 Other Secrets (Optional)

### 9. BASE_URL

**Purpose:** Base URL for redirects

**Value:**
```
https://www.hingecraft-global.ai
```

**Or your custom domain:**
```
https://yourdomain.com
```

**Usage:**
- Used for building redirect URLs
- Defaults to `https://www.hingecraft-global.ai` if not set

---

## 📋 Setup Instructions

### Step 1: Access Secrets Manager

1. Go to: https://editor.wix.com
2. Open your site
3. Click **Settings** (left sidebar)
4. Click **Secrets Manager**

### Step 2: Add Each Secret

For each secret above:

1. Click **Add Secret**
2. Enter **Name** (exactly as shown, case-sensitive)
3. Enter **Value** (copy from service dashboard)
4. Click **Save**

### Step 3: Verify Secrets

After adding secrets:

1. Check that all required secrets are listed
2. Verify names match exactly (case-sensitive)
3. Test functionality to ensure secrets are accessible

---

## ✅ Required vs Optional

### **Required for Basic Functionality:**
- ✅ `STRIPE_SECRET_KEY_TEST` - **REQUIRED**
- ✅ `STRIPE_PUBLISHABLE_KEY_TEST` - **REQUIRED**

### **Required for Crypto Payments:**
- ✅ `NOWPAYMENTS_API_KEY` - **REQUIRED** (if using crypto)

### **Required for Email Notifications:**
- ✅ `SENDGRID_API_KEY` - **REQUIRED** (if sending emails)
- ✅ `EMAIL_FROM` - **OPTIONAL** (has default)

### **Optional:**
- ⚪ `STRIPE_SECRET_KEY_LIVE` - Only for production
- ⚪ `STRIPE_PUBLISHABLE_KEY_LIVE` - Only for production
- ⚪ `NOWPAYMENTS_IPN_SECRET` - For webhook verification
- ⚪ `BASE_URL` - Has default value

---

## 🔒 Security Notes

1. **Never commit secrets to git**
   - Secrets are stored in Wix Secrets Manager only
   - Repository should never contain actual secret values

2. **Use test keys for development**
   - Always use `_TEST` keys during development
   - Only use `_LIVE` keys in production

3. **Rotate keys regularly**
   - Update secrets if compromised
   - Use different keys for dev/prod

4. **Limit access**
   - Only site owners should have access to Secrets Manager
   - Don't share secret values

---

## 🧪 Testing Secrets

After adding secrets, test in browser console:

```javascript
// Test Stripe configuration (should not error)
fetch('/_functions/charter-page-middleware/onReady', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
}).then(r => r.json()).then(console.log);

// Should return success (not "No Stripe keys found")
```

---

## 📝 Quick Reference

**Minimum Required Secrets:**
```
STRIPE_SECRET_KEY_TEST
STRIPE_PUBLISHABLE_KEY_TEST
```

**For Full Functionality:**
```
STRIPE_SECRET_KEY_TEST
STRIPE_PUBLISHABLE_KEY_TEST
NOWPAYMENTS_API_KEY
SENDGRID_API_KEY
```

**For Production:**
```
STRIPE_SECRET_KEY_LIVE
STRIPE_PUBLISHABLE_KEY_LIVE
(plus all test keys for fallback)
```

---

**Last Updated:** December 13, 2025  
**Status:** Ready for secrets configuration





