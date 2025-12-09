# ✅ Deployment Verification Checklist

**Purpose:** Verify all components are deployed and working correctly  
**Last Updated:** January 27, 2025

---

## 📋 Pre-Deployment Verification

### Backend Functions Upload
- [ ] `hingecraft.api.web.jsw` uploaded to `backend/`
- [ ] `nowpayments.api.jsw` uploaded to `backend/`
- [ ] `createNowPaymentsInvoice.jsw` uploaded to `backend/`
- [ ] `email-templates.jsw` uploaded to `backend/`
- [ ] `reconciliation-worker.jsw` uploaded to `backend/`
- [ ] `notion-crm-sync.jsw` uploaded to `backend/`
- [ ] `nowpayments.jsw` uploaded to `backend/webhooks/`
- [ ] All functions visible in Functions list
- [ ] No syntax errors in Wix Editor

### Secrets Configuration
- [ ] `NOWPAYMENTS_API_KEY` configured
- [ ] `NOWPAYMENTS_IPN_SECRET` configured
- [ ] `NOWPAYMENTS_BASE_URL` configured
- [ ] `BASE_URL` configured
- [ ] `KYC_THRESHOLD_USD` configured
- [ ] `CRYPTO_CONFIRMATIONS_REQUIRED` configured
- [ ] `EXTERNAL_DB_ENDPOINT` configured
- [ ] `EXTERNAL_DB_SECRET_KEY` configured
- [ ] `SENDGRID_API_KEY` configured
- [ ] `EMAIL_FROM` configured
- [ ] All secrets accessible (test with test script)

### Database Migration
- [ ] `init.sql` executed successfully
- [ ] `contribution_intents` table exists
- [ ] `crypto_payments` table exists
- [ ] `webhook_logs` table exists
- [ ] `kyc_verifications` table exists
- [ ] All indexes created
- [ ] All triggers created
- [ ] Can insert test records
- [ ] Can query records

### Frontend Pages
- [ ] Mission Support form added to `/payment` page
- [ ] Element ID set correctly (`missionSupportForm` or `root`)
- [ ] Charter page updated with new code
- [ ] Pages display correctly
- [ ] No console errors

### NOWPayments Configuration
- [ ] Webhook URL configured: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
- [ ] IPN Secret configured: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
- [ ] Webhook events enabled:
  - [ ] `invoice_paid`
  - [ ] `invoice_paid_unconfirmed`
  - [ ] `invoice_expired`
  - [ ] `invoice_waiting`
  - [ ] `invoice_partial`
- [ ] Test webhook sent successfully

---

## 🧪 Automated Testing

### Run Test Scripts
- [ ] Backend functions test passed
- [ ] Secrets access test passed
- [ ] Database connection test passed
- [ ] All tests show ✅ PASS

**Test Scripts Location:** `test-scripts/`

---

## ✅ Manual Verification

### Backend Functions
- [ ] `getLatestDonation()` returns data
- [ ] `saveDonation()` creates record
- [ ] `logContributionIntent()` creates intent
- [ ] `logMissionSupportIntent()` creates intent
- [ ] `createNowPaymentsInvoice()` creates invoice

### Frontend Pages
- [ ] Mission Support form displays
- [ ] Form validation works
- [ ] Payment method selector works
- [ ] Card payment redirects correctly
- [ ] Crypto payment creates invoice
- [ ] Charter page displays correctly
- [ ] Donation amount displays correctly

### Payment Flows
- [ ] Card payment flow works end-to-end
- [ ] Crypto payment flow works end-to-end
- [ ] Database records created correctly
- [ ] Receipt emails sent
- [ ] Contribution intent status updated

### Webhooks
- [ ] Webhook endpoint accessible
- [ ] Webhook signature verification works
- [ ] Webhook processes events correctly
- [ ] Database updated from webhooks
- [ ] Webhook logs created

### Email
- [ ] Receipt emails sent
- [ ] KYC emails sent (if threshold exceeded)
- [ ] Email formatting correct
- [ ] Email delivery successful

---

## 🐛 Issue Tracking

### Known Issues
[List any known issues]

### Resolved Issues
[List resolved issues]

---

## 📊 Verification Status

### Overall Status
- [ ] ✅ All components verified
- [ ] ✅ All tests passing
- [ ] ✅ Ready for production

### Component Status
- [ ] Backend Functions: ✅ / ❌
- [ ] Secrets: ✅ / ❌
- [ ] Database: ✅ / ❌
- [ ] Frontend Pages: ✅ / ❌
- [ ] NOWPayments: ✅ / ❌
- [ ] Payment Flows: ✅ / ❌
- [ ] Webhooks: ✅ / ❌
- [ ] Email: ✅ / ❌

---

## 🎯 Sign-Off

### Verified By
- Name: _________________
- Date: _________________
- Signature: _________________

### Approved For Production
- [ ] ✅ Approved
- [ ] ❌ Not Approved

**Reason:** _________________

---

## 📝 Notes

[Add any additional notes or observations]

---

**Status:** Ready for Verification  
**Next Action:** Run automated tests and manual verification

