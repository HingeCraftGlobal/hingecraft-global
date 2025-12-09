# 📋 Wix Editor Upload Checklist

**Generated:** January 27, 2025  
**Status:** Ready for Upload

---

## 🚀 Backend Functions Upload

**Location:** Wix Editor → Dev Mode → Backend → Web Modules

### Step-by-Step Instructions:

1. Open Wix Editor
2. Enable Dev Mode (top right)
3. Navigate to: Backend → Web Modules
4. For each file below:
   - Click "Add" → "Web Module"
   - Name the file exactly as shown
   - Copy entire content from the file
   - Save

### Files to Upload:

#### Core API Functions

- [ ] **hingecraft.api.web.jsw**
  - Source: `backend-functions/hingecraft.api.web.jsw`
  - Destination: `backend/hingecraft.api.web.jsw`
  - Functions: `getLatestDonation`, `saveDonation`, `logContributionIntent`, `logMissionSupportIntent`
  - **Status:** ✅ Ready

- [ ] **nowpayments.api.jsw**
  - Source: `backend-functions/nowpayments.api.jsw`
  - Destination: `backend/nowpayments.api.jsw`
  - Functions: `createNowPaymentsInvoice`, `verifyNowPaymentsWebhookSignature`, `processNowPaymentsWebhookEvent`
  - **Status:** ✅ Ready

- [ ] **createNowPaymentsInvoice.jsw**
  - Source: `backend-functions/createNowPaymentsInvoice.jsw`
  - Destination: `backend/createNowPaymentsInvoice.jsw`
  - Purpose: Wrapper function exposed to frontend
  - **Status:** ✅ Ready

- [ ] **email-templates.jsw**
  - Source: `backend-functions/email-templates.jsw`
  - Destination: `backend/email-templates.jsw`
  - Purpose: Email template generation
  - **Status:** ✅ Ready

- [ ] **reconciliation-worker.jsw**
  - Source: `backend-functions/reconciliation-worker.jsw`
  - Destination: `backend/reconciliation-worker.jsw`
  - Purpose: Background reconciliation tasks
  - **Status:** ✅ Ready

- [ ] **notion-crm-sync.jsw**
  - Source: `backend-functions/notion-crm-sync.jsw`
  - Destination: `backend/notion-crm-sync.jsw`
  - Purpose: Notion and CRM synchronization
  - **Status:** ✅ Ready

#### Webhook Endpoint

- [ ] **nowpayments.jsw** (Webhook)
  - Source: `backend-functions/webhooks/nowpayments.jsw` OR `src/backend/webhooks/nowpayments.jsw`
  - Destination: `backend/webhooks/nowpayments.jsw`
  - Purpose: NOWPayments webhook endpoint
  - Note: Create `webhooks` folder in Backend if it doesn't exist
  - **Status:** ✅ Ready

---

## 🌐 Frontend Pages Setup

### Mission Support Page (`/payment`)

**Location:** Wix Editor → Pages → Payment Page

- [ ] Open Payment Page in Wix Editor
- [ ] Add HTML Element
- [ ] Set Element ID: `missionSupportForm` or `root`
- [ ] Copy entire content from: `frontend-pages/mission-support-form.html`
- [ ] Paste into HTML Element
- [ ] Save page
- [ ] Verify form displays correctly
- [ ] **Status:** ✅ Ready

### Charter Page (`/charter`)

**Location:** Wix Editor → Pages → Charter Page

- [ ] Open Charter Page in Wix Editor
- [ ] Add HTML Element (or use existing)
- [ ] Copy entire content from: `frontend-pages/charter-page.html`
- [ ] Paste into HTML Element
- [ ] Save page
- [ ] Verify page displays correctly
- [ ] **Status:** ✅ Ready

---

## 🔐 Wix Secrets Configuration

**Location:** Wix Editor → Dev Mode → Secrets Manager

- [ ] Open Secrets Manager
- [ ] Add each secret below:

| Secret Name | Value | Status |
|------------|-------|--------|
| `NOWPAYMENTS_API_KEY` | `JEH3VG9-648MJPE-HPETPZ7-QVCSBES` | [ ] |
| `NOWPAYMENTS_IPN_SECRET` | `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9` | [ ] |
| `NOWPAYMENTS_BASE_URL` | `https://api.nowpayments.io/v1` | [ ] |
| `BASE_URL` | `https://www.hingecraft-global.ai` | [ ] |
| `KYC_THRESHOLD_USD` | `1000` | [ ] |
| `CRYPTO_CONFIRMATIONS_REQUIRED` | `3` | [ ] |
| `EXTERNAL_DB_ENDPOINT` | (Your DB endpoint) | [ ] |
| `EXTERNAL_DB_SECRET_KEY` | (Your DB secret) | [ ] |
| `SENDGRID_API_KEY` | (Your SendGrid key) | [ ] |
| `EMAIL_FROM` | `no-reply@hingecraft-global.ai` | [ ] |

---

## 🗄️ Database Migration

**File:** `database-schema/init.sql`

- [ ] Connect to database (PostgreSQL or Wix Database)
- [ ] Open `database-schema/init.sql`
- [ ] Execute SQL script
- [ ] Verify tables created:
  - [ ] `contribution_intents`
  - [ ] `crypto_payments`
  - [ ] `webhook_logs`
  - [ ] `kyc_verifications`
- [ ] **Status:** ✅ Ready

---

## ✅ Verification Steps

### Backend Functions
- [ ] All functions visible in Functions list
- [ ] Functions can be called from frontend
- [ ] No syntax errors in Wix Editor
- [ ] Test function: `getLatestDonation()`

### Frontend Pages
- [ ] Mission Support form displays correctly
- [ ] Form validation works
- [ ] Payment method selector works
- [ ] Charter page displays correctly
- [ ] Donation amount displays when URL parameter present

### Secrets
- [ ] All secrets added
- [ ] Test secret retrieval in backend function
- [ ] Verify no errors accessing secrets

### Database
- [ ] All tables exist
- [ ] Indexes created
- [ ] Can insert test records
- [ ] Can query records

---

## 🧪 Testing Checklist

### Card Payment Flow
- [ ] Visit `/payment` page
- [ ] Fill out Mission Support form
- [ ] Select card payment
- [ ] Submit form
- [ ] Verify redirect to Charter page
- [ ] Verify redirect to Payment page
- [ ] Complete test payment
- [ ] Verify database record created
- [ ] Verify receipt email sent

### Crypto Payment Flow
- [ ] Visit `/payment` page
- [ ] Fill out Mission Support form
- [ ] Select crypto payment
- [ ] Submit form
- [ ] Verify NOWPayments invoice created
- [ ] Verify redirect to NOWPayments invoice page
- [ ] Complete test crypto payment
- [ ] Verify webhook received
- [ ] Verify database record updated
- [ ] Verify receipt email sent

---

## 📝 Notes

- Save this checklist and check off items as you complete them
- If you encounter issues, refer to `NEXT_STEPS_GUIDE.md` for troubleshooting
- All files are ready in their respective folders
- Backend functions must be uploaded before frontend pages can work
- Webhook endpoint must be accessible at: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`

---

## 🎯 Priority Order

1. **Upload Backend Functions** (Do First)
   - All 7 files must be uploaded
   - Verify no errors in Wix Editor

2. **Configure Secrets** (Do Second)
   - Add all 10 secrets
   - Test secret access

3. **Run Database Migration** (Do Third)
   - Execute init.sql
   - Verify tables created

4. **Setup Frontend Pages** (Do Fourth)
   - Mission Support form
   - Charter page

5. **Configure NOWPayments Webhook** (Do Fifth)
   - Set webhook URL
   - Configure IPN secret

6. **Test Everything** (Do Last)
   - Card payment flow
   - Crypto payment flow

---

**Status:** Ready for Upload  
**Next Action:** Start uploading backend functions

