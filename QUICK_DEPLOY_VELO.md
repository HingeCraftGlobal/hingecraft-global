# Quick Deploy Velo Backend - Mission Support Form

## ✅ Status: Ready to Deploy

**Wix CLI:** Authenticated as `departments@hingecraft-global.ai`  
**Wix Dev Mode:** Running  
**Backend Files:** Verified and ready

## 🚀 Quick Deployment Steps

### 1. Open Wix Editor
https://editor.wix.com

### 2. Enable Dev Mode
- Click **"Dev Mode"** toggle in top bar

### 3. Upload Backend Functions
Go to: **Backend → Functions**

**Upload in this order:**

1. **`payment-info-service.jsw`** ⭐ (NEW - must be first)
   - Path: `src/backend/payment-info-service.jsw`
   - Functions: `getPaymentInfo`, `formatPaymentInfoForEmail`, `getPaymentSummary`

2. **`mission-support-middleware.jsw`** ⭐ (PRIMARY - Mission Support form)
   - Path: `src/backend/mission-support-middleware.jsw`
   - Functions: `submitMissionSupportForm`, `microPayment`, `otherAmount`, `getPrefill`, `sendPaymentReceiptEmail`
   - **This is the main backend for the Mission Support form**

3. `stripe.api.jsw`
   - Path: `src/backend/stripe.api.jsw`

4. `nowpayments.api.jsw`
   - Path: `src/backend/nowpayments.api.jsw`

5. `charter-page-middleware.jsw`
   - Path: `src/backend/charter-page-middleware.jsw`

6. `chat-notifications.jsw`
   - Path: `src/backend/chat-notifications.jsw`

7. `gpt-form-config.jsw`
   - Path: `src/backend/gpt-form-config.jsw`

8. `receipts-hook.jsw`
   - Path: `src/backend/receipts-hook.jsw`

### 4. Set Permissions
For each function:
- Click function → Settings → Permissions
- Set to **"Anyone"** (for public access)

### 5. Configure Secrets
Go to: **Settings → Secrets**

Add:
- `STRIPE_SECRET_KEY_LIVE`
- `STRIPE_PUBLISHABLE_KEY_LIVE`
- `NOWPAYMENTS_API_KEY`
- `OPENAI_API_KEY`
- `SENDGRID_API_KEY`
- `MARKETING_EMAIL`
- `BASE_URL` (optional)

## 📋 Mission Support Middleware Details

**File:** `src/backend/mission-support-middleware.jsw`

**Key Features:**
- ✅ Complete form handling (all fields)
- ✅ Database sync (ContributionIntent, Donations, CryptoPayments, Receipts)
- ✅ Payment processing (micro, other, crypto)
- ✅ GPT email receipts
- ✅ Unified payment info integration

**HTTP Endpoints:**
- `POST /_functions/mission-support-middleware/submitMissionSupportForm`
- `POST /_functions/mission-support-middleware/microPayment`
- `POST /_functions/mission-support-middleware/otherAmount`
- `POST /_functions/mission-support-middleware/getPrefill`
- `POST /_functions/mission-support-middleware/sendPaymentReceiptEmail`

## 🔗 Wix Velo API Reference

**Official Documentation:**  
https://www.wix.com/velo/reference/api-overview/introduction

## ✅ Verification

After deployment, test:
1. Form submission works
2. Payments process correctly
3. Database saves properly
4. Email receipts sent

---

**Status:** ✅ Ready for Deployment  
**Last Updated:** $(date)
