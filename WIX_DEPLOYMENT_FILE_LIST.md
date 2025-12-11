# 📋 Wix Deployment File List
## Complete File Inventory for Wix Dev Upload

**Date:** December 10, 2025  
**Status:** ✅ **ALL FILES IDENTIFIED**

---

## 🔧 BACKEND FUNCTIONS (.jsw)

Upload to: **Wix Editor → Dev Mode → Backend → Functions**

### Core Payment Functions

1. **`nowpayments.api.jsw`**
   - Path: `./hingecraft-global/src/backend/nowpayments.api.jsw`
   - Wix Path: `backend/nowpayments.api.jsw`
   - Functions: `createNowPaymentsInvoice`, `handleNowPaymentsWebhook`
   - Dependencies: NOWPayments secrets

2. **`stripe.api.jsw`**
   - Path: `./hingecraft-global/src/backend/stripe.api.jsw`
   - Wix Path: `backend/stripe.api.jsw`
   - Functions: `getPublishableKey`, `createCheckoutSession`, `handleWebhook`
   - Dependencies: Stripe secrets

3. **`hingecraft.api.web.jsw`**
   - Path: `./hingecraft-global/src/backend/hingecraft.api.web.jsw`
   - Wix Path: `backend/hingecraft.api.web.jsw`
   - Functions: `getLatestDonation`, `saveDonation`, `getAllDonations`, etc.
   - Dependencies: External DB secrets (if using)

### Middleware Functions

4. **`charter-page-middleware.jsw`**
   - Path: `./hingecraft-global/src/backend/charter-page-middleware.jsw`
   - Wix Path: `backend/charter-page-middleware.jsw`
   - Functions: `onReady`, `cryptoButtonClick`, `fiatButtonClick`, `getCumulativeTotal`
   - Dependencies: nowpayments.api, stripe.api, hingecraft.api.web

5. **`mission-support-middleware.jsw`**
   - Path: `./hingecraft-global/src/backend/mission-support-middleware.jsw`
   - Wix Path: `backend/mission-support-middleware.jsw`
   - Functions: Mission support form handlers
   - Dependencies: Payment APIs

### Worker Functions

6. **`reconciliation-worker.jsw`**
   - Path: `./hingecraft-global/src/backend/reconciliation-worker.jsw`
   - Wix Path: `backend/reconciliation-worker.jsw`
   - Purpose: Payment reconciliation

7. **`notion-crm-sync.jsw`**
   - Path: `./hingecraft-global/src/backend/notion-crm-sync.jsw`
   - Wix Path: `backend/notion-crm-sync.jsw`
   - Purpose: Notion CRM synchronization

8. **`email-templates.jsw`**
   - Path: `./hingecraft-global/src/backend/email-templates.jsw`
   - Wix Path: `backend/email-templates.jsw`
   - Purpose: Email template management

9. **`create-legal-pages.jsw`**
   - Path: `./hingecraft-global/src/backend/create-legal-pages.jsw`
   - Wix Path: `backend/create-legal-pages.jsw`
   - Purpose: Legal pages generator

10. **`createNowPaymentsInvoice.jsw`**
    - Path: `./hingecraft-global/src/backend/createNowPaymentsInvoice.jsw`
    - Wix Path: `backend/createNowPaymentsInvoice.jsw`
    - Purpose: NOWPayments invoice creation

### Webhook Functions

11. **`webhooks/nowpayments.jsw`**
    - Path: `./hingecraft-global/src/backend/webhooks/nowpayments.jsw`
    - Wix Path: `backend/webhooks/nowpayments.jsw`
    - Purpose: NOWPayments webhook handler

---

## 🌐 WEB MODULES (.web.js)

Upload to: **Wix Editor → Dev Mode → Backend → Web Modules**

1. **`charter-page-middleware.web.js`**
   - Path: `./hingecraft-global/src/backend/charter-page-middleware.web.js`
   - Wix Path: `backend/charter-page-middleware.web.js`
   - Purpose: Public access to charter middleware from frontend

2. **`mission-support-middleware.web.js`**
   - Path: `./hingecraft-global/src/backend/mission-support-middleware.web.js`
   - Wix Path: `backend/mission-support-middleware.web.js`
   - Purpose: Public access to mission support middleware from frontend

---

## 📄 HTML PAGES

Embed in: **Wix Editor → Pages → [Page Name] → Add → HTML iframe**

### Main Pages

1. **`charter-page-final.html`** ⭐ **USE THIS**
   - Path: `./hingecraft-global/public/pages/charter-page-final.html`
   - Size: 32,632 bytes
   - Last Updated: Dec 10, 2025 18:34
   - Purpose: Main charter page with crypto + Stripe payments
   - Features: Preset amounts, crypto buttons, dynamic totals

2. **`mission-support-form.html`** ⭐ **USE THIS**
   - Path: `./hingecraft-global/public/pages/mission-support-form.html`
   - Size: 49,102 bytes
   - Last Updated: Dec 10, 2025 18:34
   - Purpose: Mission support form with payment options

3. **`charter-live-mission-from-prompt-copy.html`** (Optional)
   - Path: `./hingecraft-global/public/pages/charter-live-mission-from-prompt-copy.html`
   - Size: 6,061,087 bytes
   - Last Updated: Dec 10, 2025 16:53
   - Purpose: Full live mission page with chat, gallery, etc.

### Legal Pages (32 files)

**Location:** `./hingecraft-global/public/pages/legal/`

1. `01-corporate-formation-charter.html`
2. `02-corporate-bylaws.html`
3. `03-stakeholder-ethos-ethics-charter.html`
4. `04-board-member-agreement.html`
5. `05-corporate-risk-register-mitigation-protocol.html`
6. `06-corporate-social-responsibility-compliance.html`
7. `07-cookie-tracking-policy.html`
8. `07-universal-terms-of-service.html`
9. `08-end-user-license-agreement.html`
10. `09-acceptable-use-safety-policy.html`
11. `09-export-compliance-itar-ear.html`
12. `10-service-level-agreement.html`
13. `11-refunds-warranty-return-policy.html`
14. `12-privacy-policy-gdpr-ccpa-coppa.html`
15. `13-data-processing-agreement.html`
16. `14-ai-training-use-consent.html`
17. `15-sensitive-data-youth-consent.html`
18. `16-algorithmic-transparency-accountability.html`
19. `17-ai-safety-bias-governance.html`
20. `18-creator-licensing-ip-agreement.html`
21. `19-marketplace-merchant-agreement.html`
22. `20-manufacturing-production-agreement.html`
23. `21-attribution-distribution-derivative-rights.html`
24. `22-digital-asset-nft-ownership.html`
25. `23-product-liability-safety-disclosure.html`
26. `24-warranty-repair-policy.html`
27. `25-materials-sourcing-ethical-compliance.html`
28. `26-membership-terms-rights.html`
29. `27-community-code-of-conduct.html`
30. `28-academic-integrity-institutional-use.html`
31. `29-global-compliance-framework.html`
32. `30-cross-border-data-transfer-hosting.html`
33. `31-charter-of-abundance-resilience-governance.html`
34. `32-pledge-participation-collective-impact.html`

---

## 🔐 SECRETS CONFIGURATION

**Location:** Wix Editor → Settings → Secrets Manager

### Required Secrets (10 total)

1. `NOWPAYMENTS_API_KEY` = `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`
2. `NOWPAYMENTS_IPN_SECRET` = `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
3. `NOWPAYMENTS_BASE_URL` = `https://api.nowpayments.io/v1`
4. `BASE_URL` = `https://www.hingecraft-global.ai`
5. `KYC_THRESHOLD_USD` = `1000`
6. `CRYPTO_CONFIRMATIONS_REQUIRED` = `3`
7. `STRIPE_SECRET_KEY_LIVE` = `[YOUR_STRIPE_SECRET_KEY]`
8. `STRIPE_PUBLISHABLE_KEY_LIVE` = `[YOUR_STRIPE_PUBLISHABLE_KEY]`
9. `EXTERNAL_DB_ENDPOINT` = `[YOUR_DB_ENDPOINT]` (if using external DB)
10. `EXTERNAL_DB_SECRET_KEY` = `[YOUR_DB_SECRET_KEY]` (if using external DB)

---

## 🔗 WEBHOOK URLS

### NOWPayments Webhook
- **URL:** `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
- **Events:** `payment`, `payment_status_changed`
- **Function:** `backend/webhooks/nowpayments.jsw`

### Stripe Webhook
- **URL:** `https://www.hingecraft-global.ai/_functions/stripe.api/handleWebhook`
- **Events:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
- **Function:** `backend/stripe.api.jsw`

---

## 📊 DEPLOYMENT SUMMARY

### Backend Functions: 11 files
- ✅ Core payment APIs (2)
- ✅ Main API (1)
- ✅ Middleware (2)
- ✅ Workers (4)
- ✅ Webhooks (1)
- ✅ Utilities (1)

### Web Modules: 2 files
- ✅ Charter middleware (public)
- ✅ Mission support middleware (public)

### HTML Pages: 35+ files
- ✅ Main pages (3)
- ✅ Legal pages (32)

### Secrets: 10 required
- ✅ NOWPayments (3)
- ✅ Stripe (2)
- ✅ Database (2, if using external)
- ✅ Configuration (3)

### Webhooks: 2 endpoints
- ✅ NOWPayments
- ✅ Stripe

---

## ✅ QUICK UPLOAD CHECKLIST

### Phase 1: Backend Functions
- [ ] Upload `nowpayments.api.jsw`
- [ ] Upload `stripe.api.jsw`
- [ ] Upload `hingecraft.api.web.jsw`
- [ ] Upload `charter-page-middleware.jsw`
- [ ] Upload `mission-support-middleware.jsw`
- [ ] Upload `webhooks/nowpayments.jsw`
- [ ] Upload remaining worker functions (5 files)

### Phase 2: Web Modules
- [ ] Upload `charter-page-middleware.web.js`
- [ ] Upload `mission-support-middleware.web.js`

### Phase 3: Secrets
- [ ] Configure all 10 secrets in Secrets Manager

### Phase 4: HTML Pages
- [ ] Embed `charter-page-final.html` in Charter page
- [ ] Embed `mission-support-form.html` in Mission Support page
- [ ] Create and embed legal pages (start with first 5)

### Phase 5: Webhooks
- [ ] Configure NOWPayments webhook
- [ ] Configure Stripe webhook

### Phase 6: Testing
- [ ] Test crypto payment flow
- [ ] Test Stripe payment flow
- [ ] Test Mission Support form
- [ ] Verify webhook processing

---

**Total Files to Upload:** 48 files
- Backend Functions: 11
- Web Modules: 2
- HTML Pages: 35+

**Estimated Time:** 2-3 hours for complete deployment

---

**Status:** ✅ **READY FOR WIX DEV UPLOAD**
