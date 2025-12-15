# Velo HTTP Endpoint Path Fix ✅

## Issue Fixed

**Error:** `HTTP 404` when calling backend functions  
**Cause:** Incorrect module paths in page-level Velo files

---

## Problem

The page-level Velo files were using:
```javascript
CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware.web'
```

But Wix automatically strips `.web.js` from module names when creating HTTP endpoints.

**Correct path:**
```javascript
CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware'
```

---

## Files Fixed

### 1. Charter of Abundance Invitation.pa3z2.js
**Before:**
```javascript
CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware.web',
MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware.web',
```

**After:**
```javascript
CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware',
```

### 2. Mission Support.b6v8z.js
**Fixed:** Same as above

### 3. Payment.xf66z.js
**Fixed:** Same as above

---

## How Wix HTTP Endpoints Work

**Backend File:** `charter-page-middleware.web.js`  
**HTTP Endpoint:** `/_functions/charter-page-middleware` (no `.web`)

**Backend File:** `stripe.api.jsw`  
**HTTP Endpoint:** `/_functions/stripe.api` (no `.jsw`)

**Backend File:** `nowpayments.api.jsw`  
**HTTP Endpoint:** `/_functions/nowpayments.api` (no `.jsw`)

---

## Verification

After deploying, test these endpoints:

1. **Charter Page:**
   - `/_functions/charter-page-middleware/onReady` ✅
   - `/_functions/charter-page-middleware/cryptoButtonClick` ✅
   - `/_functions/charter-page-middleware/fiatButtonClick` ✅
   - `/_functions/charter-page-middleware/getCumulativeTotal` ✅

2. **Mission Support:**
   - `/_functions/mission-support-middleware/onReady` ✅
   - `/_functions/mission-support-middleware/getPrefill` ✅
   - `/_functions/mission-support-middleware/otherAmount` ✅

3. **Stripe:**
   - `/_functions/stripe.api/getPublishableKey` ✅
   - `/_functions/stripe.api/createCustomInvoice` ✅

4. **NOWPayments:**
   - `/_functions/nowpayments.api/createNowPaymentsInvoice` ✅
   - `/_functions/nowpayments.api/getInvoiceStatus` ✅

---

## Status

✅ **Fixed** - All page-level Velo files updated  
✅ **Committed** - Changes pushed to git  
✅ **Ready** - Deploy to Wix and test

---

**Note:** The embedded HTML files (`charter-page-final.html` and `mission-support-form.html`) already use the correct paths (without `.web`), so they don't need changes.





