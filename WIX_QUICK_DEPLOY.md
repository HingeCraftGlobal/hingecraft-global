# ⚡ Wix Quick Deploy Guide
## Copy-Paste Ready Instructions

**Date:** December 10, 2025  
**Time Estimate:** 30-45 minutes

---

## 🎯 QUICK START

### Step 1: Upload Backend Functions (15 min)

#### 1.1 NOWPayments API
```
Wix Editor → Dev Mode → Backend → Functions → + Add Function
Name: nowpayments.api
Type: HTTP Function
File to Copy: ./hingecraft-global/src/backend/nowpayments.api.jsw
```

#### 1.2 Stripe API
```
Wix Editor → Dev Mode → Backend → Functions → + Add Function
Name: stripe.api
Type: HTTP Function
File to Copy: ./hingecraft-global/src/backend/stripe.api.jsw
```

#### 1.3 HingeCraft API
```
Wix Editor → Dev Mode → Backend → Functions → + Add Function
Name: hingecraft.api
Type: Web Module
File to Copy: ./hingecraft-global/src/backend/hingecraft.api.web.jsw
⚠️ IMPORTANT: Update EXTERNAL_DB_ENDPOINT and EXTERNAL_DB_SECRET_KEY at top of file
```

#### 1.4 Charter Middleware
```
Wix Editor → Dev Mode → Backend → Functions → + Add Function
Name: charter-page-middleware
Type: HTTP Function
File to Copy: ./hingecraft-global/src/backend/charter-page-middleware.jsw
```

#### 1.5 Charter Middleware (Web Module)
```
Wix Editor → Dev Mode → Backend → Web Modules → + Add Web Module
Name: charter-page-middleware
File to Copy: ./hingecraft-global/src/backend/charter-page-middleware.web.js
```

#### 1.6 Mission Support Middleware
```
Wix Editor → Dev Mode → Backend → Functions → + Add Function
Name: mission-support-middleware
Type: HTTP Function
File to Copy: ./hingecraft-global/src/backend/mission-support-middleware.jsw
```

#### 1.7 NOWPayments Webhook
```
Wix Editor → Dev Mode → Backend → Functions → + Add Function
Name: webhooks/nowpayments
Type: HTTP Function
File to Copy: ./hingecraft-global/src/backend/webhooks/nowpayments.jsw
```

---

### Step 2: Configure Secrets (5 min)

```
Wix Editor → Settings → Secrets Manager → + New Secret
```

**Add these 10 secrets:**

1. **NOWPAYMENTS_API_KEY**
   - Value: `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`

2. **NOWPAYMENTS_IPN_SECRET**
   - Value: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`

3. **NOWPAYMENTS_BASE_URL**
   - Value: `https://api.nowpayments.io/v1`

4. **BASE_URL**
   - Value: `https://www.hingecraft-global.ai`

5. **KYC_THRESHOLD_USD**
   - Value: `1000`

6. **CRYPTO_CONFIRMATIONS_REQUIRED**
   - Value: `3`

7. **STRIPE_SECRET_KEY_LIVE**
   - Value: `[YOUR_STRIPE_SECRET_KEY]`

8. **STRIPE_PUBLISHABLE_KEY_LIVE**
   - Value: `[YOUR_STRIPE_PUBLISHABLE_KEY]`

9. **EXTERNAL_DB_ENDPOINT** (if using external DB)
   - Value: `[YOUR_DB_ENDPOINT]`

10. **EXTERNAL_DB_SECRET_KEY** (if using external DB)
    - Value: `[YOUR_DB_SECRET_KEY]`

---

### Step 3: Embed HTML Pages (10 min)

#### 3.1 Charter Page
```
Wix Editor → Pages → Charter (or create new) → + Add → HTML iframe → Enter Code
File to Copy: ./hingecraft-global/public/pages/charter-page-final.html
```

**After pasting, verify these API paths in the HTML:**
```javascript
BACKEND_API: '/_functions/hingecraft.api',
NOWPAYMENTS_API: '/_functions/nowpayments.api',
STRIPE_API: '/_functions/stripe.api',
CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
```

#### 3.2 Mission Support Form
```
Wix Editor → Pages → Mission Support (or create new) → + Add → HTML iframe → Enter Code
File to Copy: ./hingecraft-global/public/pages/mission-support-form.html
```

---

### Step 4: Configure Webhooks (5 min)

#### 4.1 NOWPayments Webhook
```
NOWPayments Dashboard → Settings → Webhooks → Add Webhook
URL: https://www.hingecraft-global.ai/_functions/webhooks/nowpayments
Events: payment, payment_status_changed
```

#### 4.2 Stripe Webhook
```
Stripe Dashboard → Developers → Webhooks → + Add endpoint
URL: https://www.hingecraft-global.ai/_functions/stripe.api/handleWebhook
Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed
```

---

## ✅ VERIFICATION

### Test Checklist

1. **Charter Page**
   - [ ] Page loads without errors
   - [ ] Preset amount buttons ($1, $5, $20) appear
   - [ ] Crypto buttons (Solana, Stellar, Bitcoin, Ethereum) appear
   - [ ] Stripe payment button appears
   - [ ] Browser console shows no errors

2. **Crypto Payment**
   - [ ] Click preset amount ($20)
   - [ ] Click crypto button (Solana)
   - [ ] QR code and wallet address display
   - [ ] Payment status shows "Pending"

3. **Stripe Payment**
   - [ ] Click preset amount ($20)
   - [ ] Click Stripe button
   - [ ] Redirects to Stripe checkout
   - [ ] Can complete test payment

4. **Mission Support Form**
   - [ ] Form loads
   - [ ] Can enter donation amount
   - [ ] Can select payment method
   - [ ] Form submission works

---

## 🔗 API ENDPOINT REFERENCE

All frontend calls use these paths:

```javascript
// Main API
/_functions/hingecraft.api

// NOWPayments
/_functions/nowpayments.api

// Stripe
/_functions/stripe.api

// Charter Middleware
/_functions/charter-page-middleware

// Mission Support Middleware
/_functions/mission-support-middleware

// Webhooks
/_functions/webhooks/nowpayments
```

---

## 📁 FILE LOCATIONS

### Backend Functions
- `./hingecraft-global/src/backend/nowpayments.api.jsw`
- `./hingecraft-global/src/backend/stripe.api.jsw`
- `./hingecraft-global/src/backend/hingecraft.api.web.jsw`
- `./hingecraft-global/src/backend/charter-page-middleware.jsw`
- `./hingecraft-global/src/backend/charter-page-middleware.web.js`
- `./hingecraft-global/src/backend/mission-support-middleware.jsw`
- `./hingecraft-global/src/backend/webhooks/nowpayments.jsw`

### HTML Pages
- `./hingecraft-global/public/pages/charter-page-final.html` ⭐
- `./hingecraft-global/public/pages/mission-support-form.html` ⭐

---

## 🚨 COMMON ISSUES

### Function Not Found
- ✅ Check function name matches exactly
- ✅ Verify function is published
- ✅ Check Dev Mode is enabled

### Secrets Not Loading
- ✅ Verify secret names match exactly (case-sensitive)
- ✅ Check Secrets Manager permissions
- ✅ Restart Wix Editor

### HTML Not Loading
- ✅ Check HTML iframe settings
- ✅ Verify API paths are correct
- ✅ Check browser console for errors

---

## 📞 NEXT STEPS

After deployment:
1. Test all payment flows
2. Configure legal pages (32 files available)
3. Set up monitoring
4. Test webhook processing

---

**Status:** ✅ **READY TO DEPLOY**

All files are prepared and instructions are copy-paste ready.
