# 🚀 Deploy Now - Wix CLI Instructions
## Quick Deployment Guide

**Status:** ✅ **Wix CLI Ready - Logged in as: departments@hingecraft-global.ai**

---

## ✅ CURRENT STATUS

- ✅ Wix CLI installed: v1.1.141
- ✅ Logged in: departments@hingecraft-global.ai
- ✅ All files verified and ready
- ✅ Deployment package prepared

---

## 🚀 DEPLOYMENT OPTIONS

### **Option 1: Wix Editor (Manual - Recommended for Production)**

Since Wix CLI is primarily for local development, production deployment requires Wix Editor:

1. **Open Wix Editor**
   ```
   Go to: https://www.hingecraft-global.ai
   Click: "Edit Site"
   Enable: Dev Mode
   ```

2. **Upload Backend Functions**
   - Location: Dev Mode → Backend → Functions
   - Upload all 9 backend functions from `wix-deployment-ready/backend/`

3. **Upload Web Modules**
   - Location: Dev Mode → Backend → Web Modules
   - Upload 2 web modules from `wix-deployment-ready/web-modules/`

4. **Embed HTML Pages**
   - Location: Pages → Add HTML iframe
   - Copy content from `wix-deployment-ready/html-pages/`

5. **Configure Secrets**
   - Location: Settings → Secrets Manager
   - Add all 10 secrets (see checklist)

6. **Create Database Collections**
   - Location: Database → Collections
   - Create: Donations, CryptoPayments, ContributionIntent

7. **Configure Webhooks**
   - NOWPayments Dashboard → Webhooks
   - Stripe Dashboard → Webhooks

8. **Publish Site**

---

### **Option 2: Wix CLI (Local Development)**

For local development and testing:

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
npm run dev
# or
wix dev
```

This starts a local development server.

---

### **Option 3: Wix API (Automated - Requires API Key)**

If you have Wix API access, you can automate deployment via API calls.

---

## 📋 QUICK CHECKLIST

### **Backend Functions (Upload to Wix Editor)**
- [ ] `nowpayments.api.jsw`
- [ ] `stripe.api.jsw`
- [ ] `hingecraft.api.web.jsw`
- [ ] `charter-page-middleware.jsw`
- [ ] `charter-page-middleware.web.js` (Web Module)
- [ ] `mission-support-middleware.jsw`
- [ ] `mission-support-middleware.web.js` (Web Module)
- [ ] `createNowPaymentsInvoice.jsw`
- [ ] `webhooks/nowpayments.jsw`

### **HTML Pages (Embed in Wix Editor)**
- [ ] `charter-page-final.html`
- [ ] `mission-support-form.html`

### **Secrets (Configure in Wix Editor)**
- [ ] NOWPAYMENTS_API_KEY
- [ ] NOWPAYMENTS_IPN_SECRET
- [ ] NOWPAYMENTS_BASE_URL
- [ ] BASE_URL
- [ ] KYC_THRESHOLD_USD
- [ ] CRYPTO_CONFIRMATIONS_REQUIRED
- [ ] STRIPE_SECRET_KEY_LIVE
- [ ] STRIPE_PUBLISHABLE_KEY_LIVE
- [ ] EXTERNAL_DB_ENDPOINT (if using)
- [ ] EXTERNAL_DB_SECRET_KEY (if using)

### **Database Collections (Create in Wix Editor)**
- [ ] Donations
- [ ] CryptoPayments
- [ ] ContributionIntent

### **Webhooks (Configure in External Services)**
- [ ] NOWPayments webhook
- [ ] Stripe webhook

---

## 🎯 NEXT STEPS

1. **Review deployment package:**
   ```bash
   cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
   ls -la wix-deployment-ready/
   ```

2. **Open Wix Editor and follow checklist above**

3. **Test after deployment:**
   - Mission Support → Charter redirect
   - Crypto buttons
   - Database integration

---

**Last Updated:** December 10, 2025  
**Status:** ✅ **READY TO DEPLOY**
