# Velo Backend Deployment Guide - Mission Support Form

## Overview

This guide covers deploying the updated Velo backend code for the Mission Support form via Wix CLI and Wix Editor.

## Wix Velo API Reference

**Official Documentation:** https://www.wix.com/velo/reference/api-overview/introduction

## Backend Functions to Deploy

### Mission Support Form Backend (Primary)

**File:** `src/backend/mission-support-middleware.jsw`

**Functions:**
- `submitMissionSupportForm(formData)` - Complete form submission
- `microPayment(amount, userInfo)` - $1/$2/$5 payments
- `otherAmount(amount, userInfo)` - Custom amounts with prefill
- `getPrefill(prefillId)` - Retrieve prefill data
- `sendPaymentReceiptEmail(email, paymentData)` - Send receipt emails

**HTTP Endpoints:**
- `POST /_functions/mission-support-middleware/submitMissionSupportForm`
- `POST /_functions/mission-support-middleware/microPayment`
- `POST /_functions/mission-support-middleware/otherAmount`
- `POST /_functions/mission-support-middleware/getPrefill`
- `POST /_functions/mission-support-middleware/sendPaymentReceiptEmail`

### Supporting Backend Functions

1. **`payment-info-service.jsw`** (NEW)
   - `getPaymentInfo(paymentId, source)` - Get payment info from any source
   - `formatPaymentInfoForEmail(paymentData)` - Format for emails
   - `getPaymentSummary(paymentData)` - Get concise summary

2. **`stripe.api.jsw`**
   - `createCheckoutSession(requestData)` - Stripe checkout
   - `getPublishableKey()` - Get Stripe key

3. **`nowpayments.api.jsw`**
   - `createNowPaymentsInvoice(invoiceData)` - Crypto invoices

4. **`charter-page-middleware.jsw`**
   - `cryptoButtonClick(requestData)` - Crypto payments
   - `fiatButtonClick(requestData)` - Stripe payments

5. **`chat-notifications.jsw`**
   - `notifyMarketingOnQuestion(chatData)` - Chat notifications

6. **`gpt-form-config.jsw`**
   - `configureFormFromPrompt(prompt, formId)` - GPT form config

7. **`receipts-hook.jsw`**
   - `saveReceipt()` - Save receipt to database
   - `getReceipt(receiptId)` - Get receipt

## Deployment Steps

### Step 1: Verify Wix CLI

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix whoami
# Should show: Logged in as departments@hingecraft-global.ai
```

### Step 2: Run Deployment Script

```bash
./DEPLOY_VELO_BACKEND.sh
```

This will:
- Verify all backend files exist
- Check Wix authentication
- Start Wix dev mode if needed
- Display deployment instructions

### Step 3: Open Wix Editor

1. Go to: https://editor.wix.com
2. Open your HingeCraft site
3. Enable **Dev Mode** (toggle in top bar)

### Step 4: Upload Backend Functions

1. Go to: **Backend → Functions**
2. For each backend function:
   - Click **"Add Function"** or **"Upload"**
   - Select the `.jsw` file from `src/backend/`
   - Function name should match filename (without `.jsw`)

**Upload these files in order:**

1. `payment-info-service.jsw` (NEW - must be first, others depend on it)
2. `mission-support-middleware.jsw` (Primary - Mission Support form)
3. `stripe.api.jsw`
4. `nowpayments.api.jsw`
5. `charter-page-middleware.jsw`
6. `chat-notifications.jsw`
7. `gpt-form-config.jsw`
8. `receipts-hook.jsw`

### Step 5: Verify Function Permissions

For each function:
1. Click on the function
2. Go to **Settings** or **Permissions**
3. Set to **"Anyone"** (for public access)
4. Save

### Step 6: Configure Secrets

Go to: **Settings → Secrets** and add:

1. `STRIPE_SECRET_KEY_LIVE`
2. `STRIPE_PUBLISHABLE_KEY_LIVE`
3. `NOWPAYMENTS_API_KEY`
4. `OPENAI_API_KEY`
5. `SENDGRID_API_KEY`
6. `MARKETING_EMAIL`
7. `BASE_URL` (optional)

### Step 7: Test Mission Support Form

1. Go to Mission Support page
2. Fill out form
3. Submit
4. Check:
   - Form submission works
   - Payment processing works
   - Database saves correctly
   - Email receipt sent

## File Structure

```
src/backend/
├── mission-support-middleware.jsw    ← PRIMARY (Mission Support form)
├── payment-info-service.jsw          ← NEW (Unified payment info)
├── stripe.api.jsw                    ← Stripe integration
├── nowpayments.api.jsw               ← Crypto payments
├── charter-page-middleware.jsw       ← Charter page
├── chat-notifications.jsw            ← Chat notifications
├── gpt-form-config.jsw               ← GPT form config
└── receipts-hook.jsw                 ← Receipts management
```

## Mission Support Middleware Details

### Key Features

1. **Complete Form Handling**
   - All fields: firstName, lastName, email, address, missionSupportName, amount
   - Validation for all fields
   - Amount validation: $1.00 - $25,000.00

2. **Database Integration**
   - Saves to `ContributionIntent` (primary)
   - Saves to `Donations` (payment tracking)
   - Saves to `CryptoPayments` (crypto payments)
   - Saves to `Receipts` (email receipts)

3. **Payment Processing**
   - Micro payments ($1, $2, $5) → Stripe checkout
   - Other amounts → Prefill token → Charter redirect
   - Crypto payments → NOWPayments invoice

4. **Email Receipts**
   - GPT-generated receipts (if OpenAI key available)
   - Template-based fallback
   - Automatic database saving

5. **Unified Payment Info**
   - Uses `payment-info-service.jsw` for consistent formatting
   - Works across all payment flows

### Function Parameters

#### submitMissionSupportForm

```javascript
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  address: "123 Main St",
  missionSupportName: "Education Initiative", // optional
  amount: 50.00,
  paymentMethod: "card", // or "crypto"
  sessionId: "session_123", // optional
  anonymousFingerprint: "fp_123", // optional
  referrerSource: "direct", // optional
  pageUrl: "https://...", // optional
  userAgent: "Mozilla/5.0..." // optional
}
```

#### microPayment

```javascript
{
  amount: 1, // or 2, or 5
  userInfo: {
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe"
  }
}
```

#### otherAmount

```javascript
{
  amount: 50.00,
  userInfo: {
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe"
  }
}
```

## Testing

### Test Form Submission

```javascript
// Via HTTP
POST /_functions/mission-support-middleware/submitMissionSupportForm
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "address": "123 Test St",
  "amount": 25.00,
  "paymentMethod": "card"
}
```

### Test Micro Payment

```javascript
POST /_functions/mission-support-middleware/microPayment
Content-Type: application/json

{
  "amount": 1,
  "userInfo": {
    "email": "test@example.com"
  }
}
```

### Test Other Amount

```javascript
POST /_functions/mission-support-middleware/otherAmount
Content-Type: application/json

{
  "amount": 50.00,
  "userInfo": {
    "email": "test@example.com"
  }
}
```

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

### Payment Errors

- Check Stripe/NOWPayments API keys in Secrets
- Verify keys are LIVE keys (not test)
- Check webhook URLs are configured

## Status

✅ **Ready for Deployment**

- All backend functions verified
- Mission Support middleware complete
- Payment Info Service integrated
- All dependencies identified
- Deployment script ready

**Next:** Run `./DEPLOY_VELO_BACKEND.sh` and follow instructions!

---

**Last Updated:** $(date)
**Wix Velo API:** https://www.wix.com/velo/reference/api-overview/introduction
