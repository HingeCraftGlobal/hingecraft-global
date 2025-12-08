# 📋 Wix Deployment Todo List

**Status:** Ready for Manual Deployment Steps  
**Last Updated:** January 27, 2025

---

## ✅ Completed Tasks

- [x] Organize all files into deployment folders
- [x] Push all files to Git repository
- [x] Start Wix dev and sync files
- [x] Generate 1000 nano tasks breakdown
- [x] Execute all 1000 nano tasks (100% complete)

---

## 🚀 In Progress

- [ ] **Upload Backend Functions to Wix Editor**
  - [ ] Upload `hingecraft.api.web.jsw` to `backend/` folder
  - [ ] Upload `nowpayments.api.jsw` to `backend/` folder
  - [ ] Upload `createNowPaymentsInvoice.jsw` to `backend/` folder
  - [ ] Upload `email-templates.jsw` to `backend/` folder
  - [ ] Upload `reconciliation-worker.jsw` to `backend/` folder
  - [ ] Upload `notion-crm-sync.jsw` to `backend/` folder
  - [ ] Upload `webhooks/nowpayments.jsw` to `backend/webhooks/` folder
  - [ ] Verify all functions appear in Wix Functions list

---

## ⏳ Pending Tasks

### 1. Frontend Pages Setup

- [ ] **Mission Support Page (`/payment`)**
  - [ ] Add HTML Element to page
  - [ ] Set Element ID: `missionSupportForm` or `root`
  - [ ] Paste content from `frontend-pages/mission-support-form.html`
  - [ ] Verify form displays correctly
  - [ ] Test form validation

- [ ] **Charter Page (`/charter`)**
  - [ ] Add HTML Element to page (or use existing)
  - [ ] Paste content from `frontend-pages/charter-page.html`
  - [ ] Verify page displays correctly
  - [ ] Test donation amount display
  - [ ] Test checkout button

### 2. Wix Secrets Configuration

- [ ] **Add Required Secrets:**
  - [ ] `NOWPAYMENTS_API_KEY` = `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`
  - [ ] `NOWPAYMENTS_IPN_SECRET` = `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
  - [ ] `NOWPAYMENTS_BASE_URL` = `https://api.nowpayments.io/v1`
  - [ ] `BASE_URL` = `https://www.hingecraft-global.ai`
  - [ ] `KYC_THRESHOLD_USD` = `1000`
  - [ ] `CRYPTO_CONFIRMATIONS_REQUIRED` = `3`
  - [ ] `EXTERNAL_DB_ENDPOINT` = (Your database endpoint)
  - [ ] `EXTERNAL_DB_SECRET_KEY` = (Your database secret key)
  - [ ] `SENDGRID_API_KEY` = (Your SendGrid API key)
  - [ ] `EMAIL_FROM` = `no-reply@hingecraft-global.ai`
  - [ ] `NOTION_SYNC_URL` = (Your Notion sync URL, if applicable)
  - [ ] `CRM_API_KEY` = (Your CRM API key, if applicable)

- [ ] **Verify Secrets:**
  - [ ] Test secret retrieval in backend function
  - [ ] Verify secrets are accessible
  - [ ] Check for any missing secrets

### 3. Database Migration

- [ ] **Run Database Migration:**
  - [ ] Connect to database (PostgreSQL/Wix Database)
  - [ ] Execute `database-schema/init.sql`
  - [ ] Verify tables created:
    - [ ] `contribution_intents`
    - [ ] `crypto_payments`
    - [ ] `webhook_logs`
    - [ ] `kyc_verifications`
  - [ ] Verify indexes created
  - [ ] Test CRUD operations

### 4. NOWPayments Configuration

- [ ] **Configure Webhook:**
  - [ ] Log into NOWPayments Dashboard
  - [ ] Navigate to Settings → IPN Settings
  - [ ] Set Webhook URL: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
  - [ ] Set IPN Secret: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
  - [ ] Enable webhook events:
    - [ ] `invoice_paid`
    - [ ] `invoice_paid_unconfirmed`
    - [ ] `invoice_expired`
    - [ ] `invoice_waiting`
    - [ ] `invoice_partial`

- [ ] **Verify Configuration:**
  - [ ] Test webhook URL accessibility
  - [ ] Send test webhook event
  - [ ] Verify webhook received

### 5. Testing

- [ ] **Card Payment Flow:**
  - [ ] Visit `/payment` page
  - [ ] Fill out Mission Support form
  - [ ] Select card payment
  - [ ] Submit form
  - [ ] Verify redirect to Charter page
  - [ ] Verify redirect to Payment page
  - [ ] Complete test payment
  - [ ] Verify database record created
  - [ ] Verify receipt email sent

- [ ] **Crypto Payment Flow:**
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

- [ ] **Database Verification:**
  - [ ] Check `contribution_intents` table for records
  - [ ] Check `crypto_payments` table for records
  - [ ] Check `webhook_logs` table for records
  - [ ] Verify all data is correct

- [ ] **Email Testing:**
  - [ ] Test crypto receipt email
  - [ ] Test KYC request email
  - [ ] Verify email delivery
  - [ ] Verify email formatting

### 6. Monitoring & Alerts

- [ ] **Setup Monitoring:**
  - [ ] Configure monitoring dashboards
  - [ ] Setup alerts for errors
  - [ ] Monitor invoice creation rate
  - [ ] Monitor webhook processing rate
  - [ ] Monitor email delivery rate

- [ ] **Setup Logging:**
  - [ ] Configure error logging
  - [ ] Setup log aggregation
  - [ ] Create log retention policy

---

## 📝 Notes

### File Locations

**Backend Functions:**
- `backend-functions/hingecraft.api.web.jsw`
- `backend-functions/nowpayments.api.jsw`
- `backend-functions/createNowPaymentsInvoice.jsw`
- `backend-functions/email-templates.jsw`
- `backend-functions/reconciliation-worker.jsw`
- `backend-functions/notion-crm-sync.jsw`
- `backend-functions/webhooks/nowpayments.jsw`

**Frontend Pages:**
- `frontend-pages/mission-support-form.html`
- `frontend-pages/charter-page.html`
- `frontend-pages/charter-page-other-amount.js`

**Database Schema:**
- `database-schema/init.sql`

**Documentation:**
- `documentation/FINAL_DEPLOYMENT_CHECKLIST.md`
- `documentation/NOWPAYMENTS_DEPLOYMENT_GUIDE.md`
- `documentation/COMPLETE_SYSTEM_INTEGRATION_VERIFICATION.md`

### Quick Reference

**Wix Editor:**
- Backend Functions: Dev Mode → Backend → Web Modules
- Frontend Pages: Pages → [Page Name] → Add HTML Element
- Secrets: Dev Mode → Secrets Manager

**NOWPayments Dashboard:**
- Webhook URL: Settings → IPN Settings
- API Key: Settings → API Keys

---

## 🎯 Priority Order

1. **High Priority (Do First):**
   - Upload backend functions
   - Configure Wix Secrets
   - Run database migration

2. **Medium Priority (Do Next):**
   - Setup frontend pages
   - Configure NOWPayments webhook
   - Test payment flows

3. **Low Priority (Do Last):**
   - Setup monitoring
   - Performance optimization
   - Additional documentation

---

**Status:** Ready for manual deployment steps  
**Next Action:** Upload backend functions to Wix Editor

