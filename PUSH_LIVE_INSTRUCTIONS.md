# 🚀 Push Updates Live to Website
## Production Deployment Guide

**Date:** December 10, 2025  
**Status:** ✅ **READY TO PUSH LIVE**

---

## ✅ GIT PUSH COMPLETED

All updates have been pushed to GitHub:
- Repository: `git@github.com:departments-commits/hingecraft-global.git`
- Branch: `main`
- Status: ✅ **Pushed**

---

## 🚀 PUSH TO WIX PRODUCTION

### **Option 1: Wix CLI Publish (If Available)**

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix publish
```

**Note:** Wix CLI publish may require additional configuration or may not be available for all sites.

---

### **Option 2: Wix Editor (Recommended for Production)**

Since Wix CLI is primarily for local development, production deployment requires Wix Editor:

#### **Step 1: Open Wix Editor**
1. Go to: https://www.hingecraft-global.ai
2. Click: **"Edit Site"**
3. Enable: **Dev Mode** (top right)

#### **Step 2: Upload Backend Functions**

**Location:** Dev Mode → Backend → Functions

**Upload from:** `wix-deployment-ready/backend/`

1. **nowpayments.api.jsw**
   - Click: "+ Add Function"
   - Name: `nowpayments.api`
   - Type: HTTP Function
   - Copy content from: `wix-deployment-ready/backend/nowpayments.api.jsw`

2. **stripe.api.jsw**
   - Click: "+ Add Function"
   - Name: `stripe.api`
   - Type: HTTP Function
   - Copy content from: `wix-deployment-ready/backend/stripe.api.jsw`

3. **hingecraft.api.web.jsw**
   - Click: "+ Add Function"
   - Name: `hingecraft.api`
   - Type: Web Module
   - Copy content from: `wix-deployment-ready/backend/hingecraft.api.web.jsw`

4. **charter-page-middleware.jsw**
   - Click: "+ Add Function"
   - Name: `charter-page-middleware`
   - Type: HTTP Function
   - Copy content from: `wix-deployment-ready/backend/charter-page-middleware.jsw`

5. **mission-support-middleware.jsw**
   - Click: "+ Add Function"
   - Name: `mission-support-middleware`
   - Type: HTTP Function
   - Copy content from: `wix-deployment-ready/backend/mission-support-middleware.jsw`

6. **createNowPaymentsInvoice.jsw**
   - Click: "+ Add Function"
   - Name: `createNowPaymentsInvoice`
   - Type: HTTP Function
   - Copy content from: `wix-deployment-ready/backend/createNowPaymentsInvoice.jsw`

7. **nowpayments.jsw** (Webhook)
   - Click: "+ Add Function"
   - Name: `webhooks/nowpayments`
   - Type: HTTP Function
   - Copy content from: `wix-deployment-ready/backend/nowpayments.jsw`

#### **Step 3: Upload Web Modules**

**Location:** Dev Mode → Backend → Web Modules

1. **charter-page-middleware.web.js**
   - Click: "+ Add Web Module"
   - Name: `charter-page-middleware`
   - Copy content from: `wix-deployment-ready/web-modules/charter-page-middleware.web.js`

2. **mission-support-middleware.web.js**
   - Click: "+ Add Web Module"
   - Name: `mission-support-middleware`
   - Copy content from: `wix-deployment-ready/web-modules/mission-support-middleware.web.js`

#### **Step 4: Embed HTML Pages**

**Location:** Pages → [Page Name] → Add → HTML iframe

1. **Charter Page**
   - Go to: Pages → Charter
   - Click: "+ Add" → "HTML iframe"
   - Click: "Enter Code"
   - Copy entire content from: `wix-deployment-ready/html-pages/charter-page-final.html`
   - Paste and Save

2. **Mission Support Form**
   - Go to: Pages → Mission Support
   - Click: "+ Add" → "HTML iframe"
   - Click: "Enter Code"
   - Copy entire content from: `wix-deployment-ready/html-pages/mission-support-form.html`
   - Paste and Save

#### **Step 5: Configure Secrets**

**Location:** Settings → Secrets Manager

Add these secrets:
1. NOWPAYMENTS_API_KEY: `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`
2. NOWPAYMENTS_IPN_SECRET: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
3. NOWPAYMENTS_BASE_URL: `https://api.nowpayments.io/v1`
4. BASE_URL: `https://www.hingecraft-global.ai`
5. KYC_THRESHOLD_USD: `1000`
6. CRYPTO_CONFIRMATIONS_REQUIRED: `3`
7. STRIPE_SECRET_KEY_LIVE: `[YOUR_KEY]`
8. STRIPE_PUBLISHABLE_KEY_LIVE: `[YOUR_KEY]`
9. EXTERNAL_DB_ENDPOINT: `[YOUR_ENDPOINT]` (if using)
10. EXTERNAL_DB_SECRET_KEY: `[YOUR_KEY]` (if using)

#### **Step 6: Create Database Collections**

**Location:** Database → Collections

Create:
1. **Donations** (see `MASTER_DEPLOYMENT_GUIDE.md` for fields)
2. **CryptoPayments** (see `MASTER_DEPLOYMENT_GUIDE.md` for fields)
3. **ContributionIntent** (see `MASTER_DEPLOYMENT_GUIDE.md` for fields)

#### **Step 7: Configure Webhooks**

**NOWPayments:**
- Dashboard → Settings → Webhooks
- URL: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`

**Stripe:**
- Dashboard → Developers → Webhooks
- URL: `https://www.hingecraft-global.ai/_functions/stripe.api/handleWebhook`

#### **Step 8: Publish Site**

1. Click: **Publish** button (top right)
2. Wait for deployment
3. Verify: Site is live

---

## ✅ POST-DEPLOYMENT VERIFICATION

### **Test 1: Mission Support → Charter Redirect**
- [ ] Fill Mission Support form
- [ ] Select $20, Card Payment
- [ ] Click "Continue to Charter Page"
- [ ] Verify: Redirects to Charter page with amount

### **Test 2: Crypto Buttons**
- [ ] Go to Charter page
- [ ] Click $20 preset amount
- [ ] Click each crypto button
- [ ] Verify: QR code and wallet address display

### **Test 3: Database Integration**
- [ ] Complete a test payment
- [ ] Check database: New record created
- [ ] Verify: Cumulative total updates

---

## 📋 QUICK REFERENCE

**Deployment Files:**
- Location: `wix-deployment-ready/`
- Instructions: `wix-deployment-ready/DEPLOYMENT_INSTRUCTIONS.md`

**Git Repository:**
- ✅ Pushed to: `git@github.com:departments-commits/hingecraft-global.git`
- ✅ Branch: `main`

---

**Status:** ✅ **READY TO PUSH LIVE**
