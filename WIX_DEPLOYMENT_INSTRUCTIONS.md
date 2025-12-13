# Wix Deployment Instructions - Velo Backend

## ⚠️ Important: Wix CLI `wix dev` vs Manual Upload

**Wix CLI `wix dev`** opens a local development environment but **does NOT automatically upload** backend functions to Wix.

**You must manually upload** the `.jsw` files via the Wix Editor.

## Git Status

✅ **Changes committed and pushed to git**

## Deployment Steps

### Step 1: Open Wix Editor

1. Go to: https://editor.wix.com
2. Open your HingeCraft site
3. **Enable Dev Mode** (toggle in top bar)

### Step 2: Upload Backend Functions

Go to: **Backend → Functions**

**Upload in this order:**

1. **`payment-info-service.jsw`** ⭐ (NEW - must be first)
   - File: `src/backend/payment-info-service.jsw`
   - Functions: `getPaymentInfo`, `formatPaymentInfoForEmail`, `getPaymentSummary`

2. **`mission-support-middleware.jsw`** ⭐ (PRIMARY - Mission Support form)
   - File: `src/backend/mission-support-middleware.jsw`
   - Functions: `submitMissionSupportForm`, `microPayment`, `otherAmount`, `getPrefill`, `sendPaymentReceiptEmail`

3. `stripe.api.jsw`
   - File: `src/backend/stripe.api.jsw`

4. `nowpayments.api.jsw`
   - File: `src/backend/nowpayments.api.jsw`

5. `charter-page-middleware.jsw`
   - File: `src/backend/charter-page-middleware.jsw`

6. `chat-notifications.jsw`
   - File: `src/backend/chat-notifications.jsw`

7. `gpt-form-config.jsw`
   - File: `src/backend/gpt-form-config.jsw`

8. `receipts-hook.jsw`
   - File: `src/backend/receipts-hook.jsw`

### Step 3: Set Function Permissions

For each function:
1. Click on the function name
2. Go to **Settings** or **Permissions**
3. Set to **"Anyone"** (for public HTTP access)
4. Save

### Step 4: Configure Secrets

Go to: **Settings → Secrets**

Add these secrets:

1. `STRIPE_SECRET_KEY_LIVE` - Your Stripe live secret key
2. `STRIPE_PUBLISHABLE_KEY_LIVE` - Your Stripe live publishable key
3. `NOWPAYMENTS_API_KEY` - Your NOWPayments API key
4. `OPENAI_API_KEY` - OpenAI API key (for GPT features)
5. `SENDGRID_API_KEY` - SendGrid API key (for emails)
6. `MARKETING_EMAIL` - Marketing team email (default: marketing@hingecraft-global.ai)
7. `BASE_URL` - Base URL (optional, default: https://www.hingecraft-global.ai)

### Step 5: Verify Functions

After uploading, verify:

1. All 8 functions appear in **Backend → Functions**
2. Function names match file names (without `.jsw`)
3. Permissions are set to "Anyone"
4. No import errors in function code

### Step 6: Test Mission Support Form

1. Go to Mission Support page
2. Fill out form with test data
3. Submit form
4. Verify:
   - Form submission works
   - Payment processing works
   - Database saves correctly
   - Email receipt sent (if configured)

## File Locations

All backend files are in:
```
/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/src/backend/
```

## Wix Velo API Reference

**Official Documentation:**  
https://www.wix.com/velo/reference/api-overview/introduction

## Troubleshooting

### Function Not Accessible

- Ensure function is `.jsw` file (not `.web.js`)
- Check permissions are set to "Anyone"
- Verify function is exported: `export async function functionName()`

### Import Errors

- Ensure `payment-info-service.jsw` is uploaded first
- Check import paths: `import { functionName } from 'backend/module-name'`
- Verify all dependencies are uploaded

### Database Errors

- Verify collections exist: ContributionIntent, Donations, CryptoPayments, Receipts
- Check collection field names match schema
- Verify permissions on collections

## Status

✅ **Git:** Committed and pushed  
✅ **Files:** Ready for deployment  
⏳ **Wix:** Manual upload required via Editor

---

**Note:** Wix CLI `wix dev` is for local development. For production deployment, upload files manually via Wix Editor.
