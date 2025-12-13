# Velo Function Accessibility Fix

## Problem Identified

The errors:
- `Failed to create Stripe checkout: Function not accessible. Check that 'createCheckoutSession' is exported in the backend module.`
- `Failed to create crypto payment: Function not accessible. Check that 'cryptoButtonClick' is exported in the backend module.`

## Root Cause

In Wix Velo:
- **`.jsw` files** are HTTP-accessible backend functions (can be called via `/_functions/[filename]/[function]`)
- **`.web.js` files** are web modules that can be imported but are **NOT directly HTTP-accessible**

The frontend was calling:
- `/_functions/charter-page-middleware/cryptoButtonClick`
- `/_functions/stripe.api/createCheckoutSession`

But the latest code was in `.web.js` files, which are not HTTP-accessible.

## Solution

Updated the `.jsw` files with the latest code from `.web.js` files:

### 1. `charter-page-middleware.jsw` ✅
- Updated with latest code from `charter-page-middleware.web.js`
- Supports object parameters: `{ amount, coin }` or `{ amount, paymentMethod }`
- All functions exported and HTTP-accessible:
  - `onReady()`
  - `cryptoButtonClick(requestData)`
  - `fiatButtonClick(requestData)`
  - `getCumulativeTotal()`
  - `afterPaymentWebhook(payload)`
  - `redirectBackToCharter(donationAmount, paymentMethod)`

### 2. `mission-support-middleware.jsw` ✅
- Updated with latest code from `mission-support-middleware.web.js`
- All functions exported and HTTP-accessible:
  - `microPayment(amount, userInfo)`
  - `otherAmount(amountOrData, userInfo)`
  - `getPrefill(prefillIdOrData)`

### 3. `stripe.api.jsw` ✅
- Already correct (was already a `.jsw` file)
- Functions exported:
  - `createCheckoutSession(requestData)`
  - `getPublishableKey()`
  - `handleWebhook(eventData)`
  - `getPaymentStatus(sessionId)`

## File Structure

```
src/backend/
├── charter-page-middleware.jsw          ✅ HTTP-accessible (UPDATED)
├── charter-page-middleware.web.js        ⚠️  Not HTTP-accessible (can be imported)
├── mission-support-middleware.jsw        ✅ HTTP-accessible (UPDATED)
├── mission-support-middleware.web.js     ⚠️  Not HTTP-accessible (can be imported)
├── stripe.api.jsw                        ✅ HTTP-accessible
└── nowpayments.api.jsw                   ✅ HTTP-accessible
```

## Frontend Configuration

The frontend `VELO_CONFIG` in `charter-page-wix-ready.html` is correct:
```javascript
const VELO_CONFIG = {
  CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',  // ✅ Points to .jsw
  NOWPAYMENTS_API: '/_functions/nowpayments.api',             // ✅ Points to .jsw
  STRIPE_API: '/_functions/stripe.api',                      // ✅ Points to .jsw
  MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware' // ✅ Points to .jsw
};
```

## Parameter Format Support

All functions now support both:
1. **Object parameters** (preferred):
   ```javascript
   await callVeloFunction(CHARTER_MIDDLEWARE, 'cryptoButtonClick', { amount: 10, coin: 'solana' });
   ```

2. **Positional parameters** (backward compatibility):
   ```javascript
   await callVeloFunction(CHARTER_MIDDLEWARE, 'cryptoButtonClick', 10, 'solana');
   ```

## Deployment Checklist

- [x] Updated `charter-page-middleware.jsw` with latest code
- [x] Updated `mission-support-middleware.jsw` with latest code
- [x] Verified all functions are exported
- [x] Verified parameter format support (object + positional)
- [x] Frontend paths are correct
- [ ] Deploy to Wix Dev
- [ ] Test all payment flows
- [ ] Verify HTTP endpoints work

## Next Steps

1. **Deploy the updated `.jsw` files to Wix:**
   - Upload `charter-page-middleware.jsw` to Wix Editor → Backend → Functions
   - Upload `mission-support-middleware.jsw` to Wix Editor → Backend → Functions
   - Ensure `stripe.api.jsw` and `nowpayments.api.jsw` are also deployed

2. **Test the endpoints:**
   - Test crypto payment button click
   - Test Stripe checkout creation
   - Test Mission Support micro payments
   - Test "Other" amount redirect

3. **Verify in browser console:**
   - Check for 403 errors (should be gone)
   - Check for successful function calls
   - Verify payment URLs are returned

## Notes

- The `.web.js` files are kept for reference but are not used for HTTP endpoints
- All HTTP-accessible functions must be in `.jsw` files
- The frontend correctly calls `/_functions/[module-name]/[function-name]`
- All functions support both object and positional parameters for backward compatibility
