# API Endpoint Fix - 403 CloudFront Error Resolution

## 🔴 Problem
All payment redirects fail with 403 CloudFront error:
```
403 ERROR - The request could not be satisfied.
This distribution is not configured to allow the HTTP request method that was used for this request.
```

## ✅ Root Cause
The frontend is calling Wix Velo functions incorrectly. The 403 error means:
1. The endpoint path is wrong
2. The HTTP method is incorrect
3. The function isn't exported/accessible

## 🔧 Fixes Applied

### 1. Created `callVeloFunction()` Helper
- Proper error handling for CloudFront errors
- Detects 403 errors and provides helpful messages
- Uses `wixFetch` when available, falls back to `fetch`
- Better logging for debugging

### 2. Updated All API Calls
- `onReady()` - Now uses helper
- `cryptoButtonClick()` - Now uses helper  
- `fiatButtonClick()` - Now uses helper
- `getCumulativeTotal()` - Now uses helper
- `getPublishableKey()` - Now uses helper
- `getInvoiceStatus()` - Now uses helper

### 3. Stripe Test Key Support
- Updated `stripe.api.jsw` to try TEST keys first
- Falls back to LIVE keys if TEST not found
- Logs which mode is being used

## 📋 Wix Velo Function Paths

### Correct Format:
```
/_functions/[module-name]/[function-name]
```

### Your Functions:
- `/_functions/charter-page-middleware/onReady`
- `/_functions/charter-page-middleware/cryptoButtonClick`
- `/_functions/charter-page-middleware/fiatButtonClick`
- `/_functions/charter-page-middleware/getCumulativeTotal`
- `/_functions/stripe.api/getPublishableKey`
- `/_functions/stripe.api/createCheckoutSession`
- `/_functions/nowpayments.api/getInvoiceStatus`

## ⚠️ Important Notes

### Module Names Must Match:
- File: `charter-page-middleware.web.js` → Path: `charter-page-middleware`
- File: `stripe.api.jsw` → Path: `stripe.api`
- File: `nowpayments.api.jsw` → Path: `nowpayments.api`

### Functions Must Be Exported:
All functions must use `export async function functionName()` in the backend files.

### Wix Secrets Required:
- `STRIPE_SECRET_KEY_TEST` (or `STRIPE_SECRET_KEY_LIVE`)
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`

## 🧪 Testing

After deploying, test each endpoint:
```javascript
// In browser console
fetch('/_functions/charter-page-middleware/onReady', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(console.log);
```

## ✅ Next Steps

1. **Deploy updated files to Wix**
2. **Verify functions are accessible** (no 403 errors)
3. **Test each payment method** (Solana, Stellar, Bitcoin, Card, ACH)
4. **Check browser console** for any remaining errors
5. **Verify Stripe test keys** are set in Wix Secrets Manager
