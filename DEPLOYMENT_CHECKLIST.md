# 🚀 Deployment Checklist - Fix 403 Errors

## ✅ Files Updated

### Frontend:
- ✅ `public/pages/charter-page-wix-ready.html` - Fixed all API calls with `callVeloFunction()` helper

### Backend:
- ✅ `src/backend/stripe.api.jsw` - Added TEST key support
- ✅ `src/backend/charter-page-middleware.web.js` - Already has correct exports
- ✅ `src/backend/nowpayments.api.jsw` - Already has correct exports

## 📋 Deployment Steps

### 1. Upload Backend Functions to Wix

**In Wix Editor → Dev Mode → Backend:**

1. **Upload `charter-page-middleware.web.js`:**
   - Go to Backend → Web Modules
   - Upload or update `charter-page-middleware.web.js`
   - Verify it shows: `onReady`, `cryptoButtonClick`, `fiatButtonClick`, `getCumulativeTotal`

2. **Upload `stripe.api.jsw`:**
   - Go to Backend → Backend Functions
   - Upload or update `stripe.api.jsw`
   - Verify it shows: `getPublishableKey`, `createCheckoutSession`

3. **Upload `nowpayments.api.jsw`:**
   - Go to Backend → Backend Functions
   - Upload or update `nowpayments.api.jsw`
   - Verify it shows: `createNowPaymentsInvoice`, `getInvoiceStatus`

### 2. Configure Wix Secrets

**In Wix Editor → Settings → Secrets:**

Add these secrets (use TEST keys for development):

```
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
NOWPAYMENTS_API_KEY=your_nowpayments_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret
BASE_URL=https://www.hingecraft-global.ai
```

**To find your Stripe test keys:**
1. Go to Stripe Dashboard → Developers → API keys
2. Toggle to "Test mode"
3. Copy "Secret key" (starts with `sk_test_`)
4. Copy "Publishable key" (starts with `pk_test_`)

### 3. Update HTML Page

**In Wix Editor → Pages → Charter Page:**

1. Replace the embedded HTML with `charter-page-wix-ready.html`
2. Or update the existing HTML element with the new code

### 4. Test Each Endpoint

**Open browser console on Charter page and test:**

```javascript
// Test onReady
fetch('/_functions/charter-page-middleware/onReady', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Test crypto button
fetch('/_functions/charter-page-middleware/cryptoButtonClick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1, coin: 'stellar' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Test Stripe
fetch('/_functions/stripe.api/getPublishableKey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 5. Verify No 403 Errors

After deployment:
- ✅ All endpoints return JSON (not HTML error pages)
- ✅ No CloudFront 403 errors in console
- ✅ Payment buttons work for all currencies

## 🐛 Troubleshooting

### Still Getting 403 Errors?

1. **Check function names match:**
   - File: `charter-page-middleware.web.js`
   - Path: `/_functions/charter-page-middleware/[function-name]`
   - Function must be exported: `export async function functionName()`

2. **Check function is deployed:**
   - Wix Editor → Backend → Check if file appears
   - Verify "Published" status

3. **Check browser console:**
   - Look for exact error message
   - Check network tab for failed requests
   - Verify request URL is correct

4. **Test with curl:**
   ```bash
   curl -X POST https://your-site.wixsite.com/_functions/charter-page-middleware/onReady \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

### Functions Not Found?

- Ensure file names match exactly (case-sensitive)
- Ensure functions are exported with `export async function`
- Ensure file is in correct location (Backend → Web Modules for `.web.js`)

### Stripe Keys Not Working?

- Verify keys are in Wix Secrets Manager
- Check key format: `sk_test_...` or `sk_live_...`
- Test keys in Stripe Dashboard first
- Check console logs for "Using Stripe TEST keys" message

## ✅ Success Criteria

- [ ] No 403 CloudFront errors
- [ ] All payment buttons redirect correctly
- [ ] Crypto payments create invoices
- [ ] Stripe payments create checkout sessions
- [ ] Console shows successful API calls
- [ ] Payment URLs are valid and accessible
