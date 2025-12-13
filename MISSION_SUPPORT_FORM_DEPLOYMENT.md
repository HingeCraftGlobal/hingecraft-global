# Mission Support Form - Wix Deployment Guide

## Overview

The Mission Support Form is a React-based form that handles:
- Micro-payments ($1, $2, $5) via Stripe
- Custom "Other" amounts that redirect to Charter page with prefill
- Crypto payments via NOWPayments
- Form validation and session storage
- Integration with Wix Velo backend functions

## Wix CLI Status

✅ **Wix CLI is installed and authenticated**
- User: `departments@hingecraft-global.ai`
- CLI Path: `/usr/local/bin/wix`
- Dev mode can be started with: `wix dev`

## Required Backend Functions

The Mission Support Form requires these `.jsw` backend functions:

1. **`mission-support-middleware.jsw`** ✅ (Updated)
   - `microPayment(amount, userInfo)` - Creates Stripe checkout for $1/$2/$5
   - `otherAmount(amountOrData, userInfo)` - Creates prefill token and redirect URL
   - `getPrefill(prefillIdOrData)` - Retrieves prefill data

2. **`stripe.api.jsw`** ✅
   - `createCheckoutSession(requestData)` - Creates Stripe checkout sessions

3. **`nowpayments.api.jsw`** ✅
   - `createNowPaymentsInvoice(invoiceData)` - Creates crypto invoices

4. **`hingecraft.api.web.jsw`** (if exists)
   - `logMissionSupportIntent(intentData)` - Logs mission support intents

## API Endpoints Used

The form makes direct HTTP calls to:

```javascript
// Micro payments ($1, $2, $5)
POST /_functions/mission-support-middleware/microPayment
Body: { amount: 1|2|5, userInfo: {...} }

// Other amount (redirects to Charter)
POST /_functions/mission-support-middleware/otherAmount
Body: { amount: number, userInfo: {...} }

// Crypto invoice creation
POST /_functions/createNowPaymentsInvoice
Body: { intentId, amount, payCurrency, email, ... }

// Intent logging (optional)
POST /_functions/hingecraft.api/logMissionSupportIntent
Body: { formData, amountEntered, timestamp, ... }
```

## Deployment Steps

### Step 1: Start Wix Dev Mode

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev
```

This will:
- Start the local development server
- Sync backend functions
- Enable hot-reload for changes

### Step 2: Deploy Backend Functions

**Via Wix Editor:**
1. Open Wix Editor: https://editor.wix.com
2. Enable Dev Mode (toggle in top bar)
3. Go to: **Backend → Functions**
4. Upload these files:
   - `src/backend/mission-support-middleware.jsw` ✅
   - `src/backend/stripe.api.jsw` ✅
   - `src/backend/nowpayments.api.jsw` ✅
   - `src/backend/charter-page-middleware.jsw` ✅ (for prefill retrieval)

**Via Wix CLI (if supported):**
```bash
wix deploy functions
```

### Step 3: Configure Secrets

Go to: **Settings → Secrets** and add:

- `STRIPE_SECRET_KEY_LIVE` - Your Stripe live secret key
- `STRIPE_PUBLISHABLE_KEY_LIVE` - Your Stripe live publishable key
- `NOWPAYMENTS_API_KEY` - Your NOWPayments API key
- `BASE_URL` (optional) - Default: `https://www.hingecraft-global.ai`

### Step 4: Embed Mission Support Form HTML

1. **Open Mission Support Page in Wix Editor**
   - Navigate to your Mission Support page
   - Or create a new page named "Mission Support"

2. **Add HTML Element**
   - Click "+" to add element
   - Search for "HTML" or "Embed Code"
   - Add HTML element to page

3. **Paste HTML Content**
   - Open: `public/pages/mission-support-form.html`
   - Copy entire file contents
   - Paste into HTML element
   - Click "Apply" or "Update"

4. **Configure HTML Element**
   - Set width: 100% (or desired width)
   - Set height: Auto (or min-height: 100vh)
   - Enable "Show on all devices"

### Step 5: Verify Database Collections

Go to: **Database → Collections** and ensure these exist:

- **Donations** - Stores payment records
- **CryptoPayments** - Stores crypto payment data
- **ContributionIntent** - Stores prefill tokens and intents
- **external_payments** (optional) - For payment routing

### Step 6: Test Functionality

1. **Test Micro Payments ($1, $2, $5)**
   - Select a preset amount
   - Fill in form fields
   - Click "Continue → Payment"
   - Should redirect to Stripe checkout

2. **Test "Other" Amount**
   - Click "Other"
   - Enter custom amount (e.g., $50)
   - Fill in form fields
   - Click "Continue → Payment"
   - Should redirect to Charter page with prefill

3. **Test Crypto Payment**
   - Select crypto payment method
   - Fill in form
   - Should create NOWPayments invoice

4. **Test Form Validation**
   - Try submitting with invalid data
   - Verify error messages appear
   - Verify session storage works

## Troubleshooting

### Issue: "Function not accessible" errors

**Solution:**
- Ensure `.jsw` files are uploaded (not `.web.js`)
- Check function names match exactly
- Verify HTTP endpoint paths: `/_functions/[module-name]/[function-name]`

### Issue: Stripe checkout not working

**Solution:**
- Verify `STRIPE_SECRET_KEY_LIVE` is set in Secrets
- Check Stripe keys are valid
- Ensure `createCheckoutSession` is exported in `stripe.api.jsw`

### Issue: Prefill not working

**Solution:**
- Verify `mission-support-middleware.jsw` has `otherAmount` function
- Check `ContributionIntent` collection exists
- Verify redirect URL includes `?prefill=[token]&donationAmount=[amount]`

### Issue: Form not saving to session

**Solution:**
- Check browser console for errors
- Verify `wixStorage` is available (Wix environment)
- Fallback to `sessionStorage` should work in non-Wix contexts

## File Locations

```
hingecraft-global/
├── public/pages/
│   └── mission-support-form.html          # Main form HTML (1429 lines)
├── src/backend/
│   ├── mission-support-middleware.jsw     # Backend functions (HTTP-accessible)
│   ├── stripe.api.jsw                     # Stripe integration
│   ├── nowpayments.api.jsw                # NOWPayments integration
│   └── charter-page-middleware.jsw       # For prefill retrieval
└── MISSION_SUPPORT_FORM_DEPLOYMENT.md     # This file
```

## Key Features

✅ **Micro Payments**: $1, $2, $5 instant Stripe checkout
✅ **Custom Amounts**: Redirects to Charter page with prefill token
✅ **Crypto Support**: NOWPayments invoice creation
✅ **Form Validation**: Real-time validation with error messages
✅ **Session Storage**: Saves form data to prevent loss
✅ **Responsive Design**: Works on all devices
✅ **Wix Integration**: Uses Wix Storage and Velo functions

## Next Steps After Deployment

1. **Test all payment flows**
2. **Verify redirects work correctly**
3. **Check console for errors**
4. **Test on mobile devices**
5. **Publish site when ready**

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend functions are deployed
3. Ensure secrets are configured
4. Test endpoints directly: `/_functions/mission-support-middleware/microPayment`

---

**Last Updated:** $(date)
**Status:** Ready for deployment ✅
