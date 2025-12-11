# 🚀 Wix Deployment Instructions
## All Files Ready for Upload

**Date:** December 10, 2025  
**Status:** ✅ **ALL FILES PREPARED**

---

## 📁 FILE STRUCTURE

```
wix-deployment-ready/
├── backend/              # Backend Functions (Upload to: Dev Mode → Backend → Functions)
│   ├── nowpayments.api.jsw
│   ├── stripe.api.jsw
│   ├── hingecraft.api.web.jsw
│   ├── charter-page-middleware.jsw
│   ├── mission-support-middleware.jsw
│   ├── createNowPaymentsInvoice.jsw
│   └── nowpayments.jsw (from webhooks/)
│
├── web-modules/          # Web Modules (Upload to: Dev Mode → Backend → Web Modules)
│   ├── charter-page-middleware.web.js
│   └── mission-support-middleware.web.js
│
├── html-pages/           # HTML Pages (Embed in: Pages → Add HTML iframe)
│   ├── charter-page-final.html
│   └── mission-support-form.html
│
└── DEPLOYMENT_INSTRUCTIONS.md (this file)
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Open Wix Editor**

1. Go to: https://www.hingecraft-global.ai
2. Click: "Edit Site"
3. Click: "Dev Mode" toggle (top right)
4. Verify: Dev Mode badge appears

---

### **STEP 2: Upload Backend Functions**

**Location:** Dev Mode → Backend → Functions

**Upload these 7 files from `backend/` directory:**

1. **nowpayments.api.jsw**
   - Click: "+ Add Function"
   - Name: `nowpayments.api`
   - Type: HTTP Function
   - Copy content from: `backend/nowpayments.api.jsw`
   - Functions: `createNowPaymentsInvoice`, `getInvoiceStatus`, `handleNowPaymentsWebhook`

2. **stripe.api.jsw**
   - Click: "+ Add Function"
   - Name: `stripe.api`
   - Type: HTTP Function
   - Copy content from: `backend/stripe.api.jsw`
   - Functions: `getPublishableKey`, `createCheckoutSession`, `handleWebhook`

3. **hingecraft.api.web.jsw**
   - Click: "+ Add Function"
   - Name: `hingecraft.api`
   - Type: Web Module
   - Copy content from: `backend/hingecraft.api.web.jsw`
   - ⚠️ **IMPORTANT:** Update lines 1-3 with your database config
   - Functions: `getLatestDonation`, `saveDonation`, `logMissionSupportIntent`

4. **charter-page-middleware.jsw**
   - Click: "+ Add Function"
   - Name: `charter-page-middleware`
   - Type: HTTP Function
   - Copy content from: `backend/charter-page-middleware.jsw`
   - Functions: `onReady`, `cryptoButtonClick`, `fiatButtonClick`, `getCumulativeTotal`

5. **mission-support-middleware.jsw**
   - Click: "+ Add Function"
   - Name: `mission-support-middleware`
   - Type: HTTP Function
   - Copy content from: `backend/mission-support-middleware.jsw`
   - Functions: `onReady`, `handleUserInputDonation`, `goToCharterAfterPayment`

6. **createNowPaymentsInvoice.jsw**
   - Click: "+ Add Function"
   - Name: `createNowPaymentsInvoice`
   - Type: HTTP Function
   - Copy content from: `backend/createNowPaymentsInvoice.jsw`

7. **nowpayments.jsw** (Webhook)
   - Click: "+ Add Function"
   - Name: `webhooks/nowpayments`
   - Type: HTTP Function
   - Copy content from: `backend/nowpayments.jsw`
   - Functions: `handleNowPaymentsWebhook`

---

### **STEP 3: Upload Web Modules**

**Location:** Dev Mode → Backend → Web Modules

**Upload these 2 files from `web-modules/` directory:**

1. **charter-page-middleware.web.js**
   - Click: "+ Add Web Module"
   - Name: `charter-page-middleware`
   - Copy content from: `web-modules/charter-page-middleware.web.js`

2. **mission-support-middleware.web.js**
   - Click: "+ Add Web Module"
   - Name: `mission-support-middleware`
   - Copy content from: `web-modules/mission-support-middleware.web.js`

---

### **STEP 4: Embed HTML Pages**

**Location:** Pages → [Page Name] → Add → HTML iframe

#### **4.1 Charter Page**

1. Go to: Pages → Charter (or create new page)
2. Click: "+ Add" → "HTML iframe"
3. Click: "Enter Code"
4. Open: `html-pages/charter-page-final.html`
5. Copy entire content
6. Paste into HTML iframe
7. Click: Save

#### **4.2 Mission Support Form**

1. Go to: Pages → Mission Support (or create new page)
2. Click: "+ Add" → "HTML iframe"
3. Click: "Enter Code"
4. Open: `html-pages/mission-support-form.html`
5. Copy entire content
6. Paste into HTML iframe
7. Click: Save

---

### **STEP 5: Configure Secrets**

**Location:** Settings → Secrets Manager

**Add these 10 secrets:**

1. **NOWPAYMENTS_API_KEY**
   - Value: `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`

2. **NOWPAYMENTS_IPN_SECRET**
   - Value: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`

3. **NOWPAYMENTS_BASE_URL**
   - Value: `https://api.nowpayments.io/v1`

4. **BASE_URL**
   - Value: `https://www.hingecraft-global.ai`

5. **KYC_THRESHOLD_USD**
   - Value: `1000`

6. **CRYPTO_CONFIRMATIONS_REQUIRED**
   - Value: `3`

7. **STRIPE_SECRET_KEY_LIVE**
   - Value: `[YOUR_STRIPE_SECRET_KEY]`

8. **STRIPE_PUBLISHABLE_KEY_LIVE**
   - Value: `[YOUR_STRIPE_PUBLISHABLE_KEY]`

9. **EXTERNAL_DB_ENDPOINT** (if using external DB)
   - Value: `[YOUR_DB_ENDPOINT]`

10. **EXTERNAL_DB_SECRET_KEY** (if using external DB)
    - Value: `[YOUR_DB_SECRET_KEY]`

---

### **STEP 6: Create Database Collections**

**Location:** Database → Collections

#### **6.1 Donations Collection**

1. Click: "+ New Collection"
2. Name: `Donations`
3. Add Fields:
   - `amount` (Number)
   - `currency` (Text, default: 'USD')
   - `payment_status` (Text)
   - `payment_method` (Text)
   - `transaction_id` (Text)
   - `email` (Text)
   - `name` (Text)
   - `source` (Text)
   - `isOtherAmount` (Checkbox)
   - `metadata` (Text, JSON format)

#### **6.2 CryptoPayments Collection**

1. Click: "+ New Collection"
2. Name: `CryptoPayments`
3. Add Fields (see `MASTER_DEPLOYMENT_GUIDE.md` for full list)

#### **6.3 ContributionIntent Collection**

1. Click: "+ New Collection"
2. Name: `ContributionIntent`
3. Add Fields (see `MASTER_DEPLOYMENT_GUIDE.md` for full list)

---

### **STEP 7: Configure Webhooks**

#### **7.1 NOWPayments Webhook**

1. Log into NOWPayments Dashboard
2. Go to: Settings → Webhooks
3. Click: "+ Add Webhook"
4. URL: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
5. Events: Select "payment" and "payment_status_changed"
6. Click: Save

#### **7.2 Stripe Webhook**

1. Log into Stripe Dashboard
2. Go to: Developers → Webhooks
3. Click: "+ Add endpoint"
4. URL: `https://www.hingecraft-global.ai/_functions/stripe.api/handleWebhook`
5. Events: Select:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click: Add endpoint

---

### **STEP 8: Publish Site**

1. Click: **Publish** button (top right)
2. Wait for deployment to complete
3. Verify: Site is live

---

## ✅ POST-DEPLOYMENT TESTING

### **Test 1: Mission Support → Charter Redirect**
- [ ] Fill Mission Support form
- [ ] Select $20, Card Payment
- [ ] Click "Continue to Charter Page"
- [ ] Verify: Redirects to Charter page
- [ ] Verify: URL contains `donationAmount=20`
- [ ] Verify: Charter page shows "Donation Amount: $20.00"

### **Test 2: Crypto Buttons**
- [ ] Go to Charter page
- [ ] Click $20 preset amount
- [ ] Click each crypto button (Solana, Stellar, Bitcoin, Ethereum)
- [ ] Verify: QR code displays
- [ ] Verify: Wallet address displays

### **Test 3: Database Integration**
- [ ] Complete a test payment
- [ ] Check database: New record created
- [ ] Verify: Cumulative total updates

---

## 📚 REFERENCE DOCUMENTATION

For detailed information, see:
- `../MASTER_DEPLOYMENT_GUIDE.md` - Complete system flow
- `../WIX_DEV_PUSH_COMPLETE.md` - Detailed checklist
- `../START_HERE_DEPLOYMENT.md` - Quick start guide

---

**Last Updated:** December 10, 2025  
**Status:** ✅ **READY TO DEPLOY**
