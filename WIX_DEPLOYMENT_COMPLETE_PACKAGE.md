# 🚀 Wix Deployment Complete Package
## All Components Ready for Wix Dev

**Date:** December 10, 2025  
**Status:** ✅ **ALL FILES READY FOR DEPLOYMENT**

---

## 📋 DEPLOYMENT OVERVIEW

This package contains everything needed to deploy HingeCraft to Wix:
- ✅ HTML files (ready to embed)
- ✅ Velo backend functions (.jsw files)
- ✅ Web modules (.web.js files)
- ✅ Secrets configuration
- ✅ Webhook URLs
- ✅ Step-by-step instructions

---

## 📁 FILE STRUCTURE FOR WIX DEV

### Backend Functions (Velo)
Upload these to: **Wix Editor → Dev Mode → Backend → Functions**

```
backend/
├── nowpayments.api.jsw          ✅ NOWPayments API integration
├── stripe.api.jsw               ✅ Stripe API integration
├── hingecraft.api.web.jsw       ✅ Main HingeCraft API
├── charter-page-middleware.jsw  ✅ Charter page middleware
├── mission-support-middleware.jsw ✅ Mission support middleware
├── reconciliation-worker.jsw    ✅ Payment reconciliation
├── notion-crm-sync.jsw          ✅ Notion CRM sync
├── email-templates.jsw           ✅ Email templates
├── create-legal-pages.jsw       ✅ Legal pages generator
├── createNowPaymentsInvoice.jsw ✅ NOWPayments invoice creator
└── webhooks/
    └── nowpayments.jsw          ✅ NOWPayments webhook handler
```

### Web Modules (Frontend Accessible)
Upload these to: **Wix Editor → Dev Mode → Backend → Web Modules**

```
backend/
├── charter-page-middleware.web.js  ✅ Public charter middleware
└── mission-support-middleware.web.js ✅ Public mission support middleware
```

### HTML Pages (Embed in Wix Pages)
Embed these in: **Wix Editor → Pages → [Page Name] → Add → HTML iframe**

```
public/pages/
├── charter-page-final.html              ✅ Main charter page (USE THIS)
├── mission-support-form.html             ✅ Mission support form (USE THIS)
├── charter-live-mission-from-prompt-copy.html ✅ Live mission page (optional)
└── legal/
    ├── 01-corporate-formation-charter.html
    ├── 02-corporate-bylaws.html
    └── ... (32 legal pages total)
```

---

## 🔧 STEP 1: UPLOAD BACKEND FUNCTIONS

### 1.1 NOWPayments API (`nowpayments.api.jsw`)

**Location:** `./hingecraft-global/src/backend/nowpayments.api.jsw`

**Wix Path:** `backend/nowpayments.api.jsw`

**Functions Exported:**
- `createNowPaymentsInvoice(requestData)` - Create crypto invoice
- `handleNowPaymentsWebhook(webhookData, signatureHeader, rawBody)` - Handle webhooks

**Dependencies:**
- Requires secrets: `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `BASE_URL`

**Upload Steps:**
1. Open Wix Editor → Dev Mode
2. Go to Backend → Functions
3. Click "+ Add Function"
4. Name: `nowpayments.api`
5. Type: **HTTP Function** (or **Web Module**)
6. Copy entire content from `src/backend/nowpayments.api.jsw`
7. Paste into editor
8. Save and Publish

---

### 1.2 Stripe API (`stripe.api.jsw`)

**Location:** `./hingecraft-global/src/backend/stripe.api.jsw`

**Wix Path:** `backend/stripe.api.jsw`

**Functions Exported:**
- `getPublishableKey()` - Get Stripe publishable key
- `createCheckoutSession(requestData)` - Create Stripe checkout
- `handleWebhook(eventData)` - Handle Stripe webhooks
- `getPaymentStatus(sessionId)` - Check payment status

**Dependencies:**
- Requires secrets: `STRIPE_SECRET_KEY_LIVE`, `STRIPE_PUBLISHABLE_KEY_LIVE`

**Upload Steps:**
1. Open Wix Editor → Dev Mode
2. Go to Backend → Functions
3. Click "+ Add Function"
4. Name: `stripe.api`
5. Type: **HTTP Function**
6. Copy entire content from `src/backend/stripe.api.jsw`
7. Paste into editor
8. Save and Publish

---

### 1.3 HingeCraft API (`hingecraft.api.web.jsw`)

**Location:** `./hingecraft-global/src/backend/hingecraft.api.web.jsw`

**Wix Path:** `backend/hingecraft.api.web.jsw`

**Functions Exported:**
- `getLatestDonation()` - Get latest donation
- `saveDonation(donationData)` - Save donation
- `getAllDonations()` - Get all donations
- `getDonationById(id)` - Get donation by ID
- `updateDonationStatus(id, status)` - Update donation status
- `logContributionIntent(intentData)` - Log contribution intent
- `logMissionSupportIntent(intentData)` - Log mission support intent

**Dependencies:**
- Supports both Wix Database and External Database
- Requires secrets: `EXTERNAL_DB_ENDPOINT`, `EXTERNAL_DB_SECRET_KEY` (if using external DB)

**Upload Steps:**
1. Open Wix Editor → Dev Mode
2. Go to Backend → Functions
3. Click "+ Add Function"
4. Name: `hingecraft.api`
5. Type: **Web Module** (for frontend access)
6. Copy entire content from `src/backend/hingecraft.api.web.jsw`
7. **IMPORTANT:** Update `EXTERNAL_DB_ENDPOINT` and `EXTERNAL_DB_SECRET_KEY` at top of file
8. Paste into editor
9. Save and Publish

---

### 1.4 Charter Page Middleware (`charter-page-middleware.jsw`)

**Location:** `./hingecraft-global/src/backend/charter-page-middleware.jsw`

**Wix Path:** `backend/charter-page-middleware.jsw`

**Functions Exported:**
- `onReady()` - Initialize charter page
- `cryptoButtonClick(amount, coin)` - Handle crypto button click
- `fiatButtonClick(preset)` - Handle Stripe button click
- `afterPaymentWebhook(payload)` - Handle payment webhook
- `redirectBackToCharter(donationAmount, paymentMethod)` - Redirect after payment
- `getCumulativeTotal()` - Get cumulative donation total

**Dependencies:**
- Imports: `nowpayments.api`, `stripe.api`, `hingecraft.api.web`

**Upload Steps:**
1. Open Wix Editor → Dev Mode
2. Go to Backend → Functions
3. Click "+ Add Function"
4. Name: `charter-page-middleware`
5. Type: **HTTP Function**
6. Copy entire content from `src/backend/charter-page-middleware.jsw`
7. Paste into editor
8. Save and Publish

---

### 1.5 Charter Page Middleware (Web Module) (`charter-page-middleware.web.js`)

**Location:** `./hingecraft-global/src/backend/charter-page-middleware.web.js`

**Wix Path:** `backend/charter-page-middleware.web.js`

**Purpose:** Public web module accessible from frontend HTML

**Functions Exported:**
- Same as `.jsw` version but accessible from frontend

**Upload Steps:**
1. Open Wix Editor → Dev Mode
2. Go to Backend → Web Modules
3. Click "+ Add Web Module"
4. Name: `charter-page-middleware`
5. Copy entire content from `src/backend/charter-page-middleware.web.js`
6. Paste into editor
7. Save and Publish

---

### 1.6 Mission Support Middleware (`mission-support-middleware.jsw`)

**Location:** `./hingecraft-global/src/backend/mission-support-middleware.jsw`

**Wix Path:** `backend/mission-support-middleware.jsw`

**Upload Steps:**
1. Open Wix Editor → Dev Mode
2. Go to Backend → Functions
3. Click "+ Add Function"
4. Name: `mission-support-middleware`
5. Type: **HTTP Function**
6. Copy entire content from `src/backend/mission-support-middleware.jsw`
7. Paste into editor
8. Save and Publish

---

### 1.7 Additional Backend Functions

Upload these following the same pattern:

- `reconciliation-worker.jsw` - Payment reconciliation
- `notion-crm-sync.jsw` - Notion CRM synchronization
- `email-templates.jsw` - Email template management
- `create-legal-pages.jsw` - Legal pages generator
- `createNowPaymentsInvoice.jsw` - NOWPayments invoice creator
- `webhooks/nowpayments.jsw` - NOWPayments webhook handler

---

## 🔐 STEP 2: CONFIGURE WIX SECRETS

**Location:** Wix Editor → Settings → Secrets Manager

### Required Secrets:

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `NOWPAYMENTS_API_KEY` | `JEH3VG9-648MJPE-HPETPZ7-QVCSBES` | NOWPayments API authentication |
| `NOWPAYMENTS_IPN_SECRET` | `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9` | Webhook signature verification |
| `NOWPAYMENTS_BASE_URL` | `https://api.nowpayments.io/v1` | NOWPayments API endpoint |
| `BASE_URL` | `https://www.hingecraft-global.ai` | Your website base URL |
| `KYC_THRESHOLD_USD` | `1000` | KYC trigger threshold |
| `CRYPTO_CONFIRMATIONS_REQUIRED` | `3` | Required blockchain confirmations |
| `STRIPE_SECRET_KEY_LIVE` | `[YOUR_STRIPE_SECRET_KEY]` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY_LIVE` | `[YOUR_STRIPE_PUBLISHABLE_KEY]` | Stripe publishable key |
| `EXTERNAL_DB_ENDPOINT` | `[YOUR_DB_ENDPOINT]` | External database URL (if using) |
| `EXTERNAL_DB_SECRET_KEY` | `[YOUR_DB_SECRET_KEY]` | Database authentication (if using) |

**Steps:**
1. Go to Settings → Secrets Manager
2. Click "+ New Secret"
3. Enter Name and Value
4. Click Save
5. Repeat for each secret

---

## 📄 STEP 3: EMBED HTML PAGES

### 3.1 Charter Page (`charter-page-final.html`)

**File:** `./hingecraft-global/public/pages/charter-page-final.html`

**Wix Page:** Create or edit your Charter page

**Embed Steps:**
1. Open Wix Editor
2. Go to Pages → Charter (or create new page)
3. Click "+ Add" → "HTML iframe"
4. Click "Enter Code"
5. Copy entire content from `charter-page-final.html`
6. Paste into HTML iframe
7. **IMPORTANT:** Update API paths in the HTML:
   ```javascript
   BACKEND_API: '/_functions/hingecraft.api',
   NOWPAYMENTS_API: '/_functions/nowpayments.api',
   STRIPE_API: '/_functions/stripe.api',
   CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
   ```
8. Save and Publish

**Alternative Method (Custom Code):**
1. Go to Page Settings → Custom Code
2. Add to "Body - start of <body> tag"
3. Copy the `<script>` section from `charter-page-final.html`
4. Save

---

### 3.2 Mission Support Form (`mission-support-form.html`)

**File:** `./hingecraft-global/public/pages/mission-support-form.html`

**Wix Page:** Create or edit your Mission Support page

**Embed Steps:**
1. Open Wix Editor
2. Go to Pages → Mission Support (or create new page)
3. Click "+ Add" → "HTML iframe"
4. Click "Enter Code"
5. Copy entire content from `mission-support-form.html`
6. Paste into HTML iframe
7. Update API paths if needed
8. Save and Publish

---

### 3.3 Legal Pages (32 pages)

**Location:** `./hingecraft-global/public/pages/legal/`

**Files:**
- `01-corporate-formation-charter.html`
- `02-corporate-bylaws.html`
- `03-stakeholder-ethos-ethics-charter.html`
- ... (29 more files)

**Embed Steps:**
1. For each legal page:
   - Create new Wix page
   - Add HTML iframe
   - Copy content from corresponding HTML file
   - Add to navigation menu
   - Configure SEO

---

## 🔗 STEP 4: CONFIGURE WEBHOOKS

### 4.1 NOWPayments Webhook

**Webhook URL:** `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`

**Configuration:**
1. Log into NOWPayments dashboard
2. Go to Settings → Webhooks
3. Add webhook URL: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
4. Select events: `payment`, `payment_status_changed`
5. Save

**Wix Function:**
- File: `backend/webhooks/nowpayments.jsw`
- Should already be uploaded from Step 1

---

### 4.2 Stripe Webhook

**Webhook URL:** `https://www.hingecraft-global.ai/_functions/stripe.api/handleWebhook`

**Configuration:**
1. Log into Stripe Dashboard
2. Go to Developers → Webhooks
3. Click "+ Add endpoint"
4. Endpoint URL: `https://www.hingecraft-global.ai/_functions/stripe.api/handleWebhook`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Save and copy webhook signing secret
7. Add to Wix Secrets as `STRIPE_WEBHOOK_SECRET` (if needed)

---

## ✅ STEP 5: VERIFICATION CHECKLIST

### Backend Functions
- [ ] `nowpayments.api.jsw` uploaded and published
- [ ] `stripe.api.jsw` uploaded and published
- [ ] `hingecraft.api.web.jsw` uploaded and published
- [ ] `charter-page-middleware.jsw` uploaded and published
- [ ] `charter-page-middleware.web.js` uploaded and published
- [ ] `mission-support-middleware.jsw` uploaded and published
- [ ] `webhooks/nowpayments.jsw` uploaded and published

### Web Modules
- [ ] `charter-page-middleware.web.js` accessible from frontend
- [ ] `mission-support-middleware.web.js` accessible from frontend

### Secrets
- [ ] All 10 secrets configured in Secrets Manager
- [ ] Secrets accessible from backend functions

### HTML Pages
- [ ] Charter page embedded and functional
- [ ] Mission Support form embedded and functional
- [ ] Legal pages created (at least first 5)

### Webhooks
- [ ] NOWPayments webhook configured
- [ ] Stripe webhook configured
- [ ] Webhook URLs accessible

### Testing
- [ ] Test crypto payment button on Charter page
- [ ] Test Stripe payment button on Charter page
- [ ] Test Mission Support form submission
- [ ] Verify webhook processing
- [ ] Check browser console for errors

---

## 🔗 API ENDPOINT REFERENCE

### Frontend API Calls

All API calls from HTML should use these paths:

```javascript
// Main API
/_functions/hingecraft.api

// NOWPayments
/_functions/nowpayments.api

// Stripe
/_functions/stripe.api

// Charter Middleware
/_functions/charter-page-middleware

// Mission Support Middleware
/_functions/mission-support-middleware

// Webhooks
/_functions/webhooks/nowpayments
```

### Example Frontend Call

```javascript
// From charter-page-final.html
const response = await fetch('/_functions/charter-page-middleware/cryptoButtonClick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 20, coin: 'solana' })
});
```

---

## 📝 IMPORTANT NOTES

### File Paths in Wix Dev

- Backend functions: `backend/[filename].jsw`
- Web modules: `backend/[filename].web.js`
- Frontend calls: `/_functions/[function-name]`

### Import Statements

In Velo backend functions, use:
```javascript
import { functionName } from 'backend/nowpayments.api';
import { functionName } from 'backend/stripe.api';
```

### Permissions

- HTTP Functions: Can be called from frontend
- Web Modules: Publicly accessible
- Secrets: Only accessible from backend

---

## 🚨 TROUBLESHOOTING

### Function Not Found
- Check function name matches exactly
- Verify function is published
- Check Dev Mode is enabled

### Secrets Not Loading
- Verify secret names match exactly (case-sensitive)
- Check Secrets Manager permissions
- Restart Wix Editor

### Webhook Not Working
- Verify webhook URL is correct
- Check webhook function is published
- Test webhook endpoint manually

### HTML Not Loading
- Check HTML iframe settings
- Verify API paths are correct
- Check browser console for errors

---

## 📞 SUPPORT

For issues:
1. Check Wix Dev Mode console
2. Check browser console
3. Verify all files uploaded correctly
4. Test each component individually

---

**Status:** ✅ **READY FOR DEPLOYMENT**

All files are prepared and ready to upload to Wix Dev.
