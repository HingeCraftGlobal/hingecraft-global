# 🚀 HingeCraft Wix Deployment - Complete Guide

**Date:** December 10, 2025  
**Status:** ✅ **ALL COMPONENTS READY FOR WIX DEV**

---

## 📚 DOCUMENTATION INDEX

1. **`WIX_QUICK_DEPLOY.md`** ⚡ - Fast copy-paste instructions (30-45 min)
2. **`WIX_DEPLOYMENT_COMPLETE_PACKAGE.md`** 📦 - Complete deployment guide with all details
3. **`WIX_DEPLOYMENT_FILE_LIST.md`** 📋 - Complete file inventory

---

## 🎯 QUICK START (Choose One)

### Option 1: Quick Deploy (30-45 min)
👉 **Read:** `WIX_QUICK_DEPLOY.md`
- Step-by-step copy-paste instructions
- Minimal setup for core functionality
- Perfect for getting started fast

### Option 2: Complete Deployment (2-3 hours)
👉 **Read:** `WIX_DEPLOYMENT_COMPLETE_PACKAGE.md`
- Full deployment with all features
- All 48+ files
- Complete testing checklist

### Option 3: File Reference
👉 **Read:** `WIX_DEPLOYMENT_FILE_LIST.md`
- Complete file inventory
- File paths and locations
- Upload checklist

---

## 📁 WHAT YOU NEED

### Backend Functions (7 core files)
1. `nowpayments.api.jsw` - Crypto payments
2. `stripe.api.jsw` - Stripe payments
3. `hingecraft.api.web.jsw` - Main API
4. `charter-page-middleware.jsw` - Charter page logic
5. `charter-page-middleware.web.js` - Public charter middleware
6. `mission-support-middleware.jsw` - Mission support logic
7. `webhooks/nowpayments.jsw` - Webhook handler

### HTML Pages (2 main files)
1. `charter-page-final.html` - Main charter page ⭐
2. `mission-support-form.html` - Mission support form ⭐

### Secrets (10 required)
- NOWPayments (3 secrets)
- Stripe (2 secrets)
- Database (2 secrets, if using external)
- Configuration (3 secrets)

---

## 🔗 API ENDPOINTS

All frontend HTML files use these Wix Dev paths:

```javascript
/_functions/hingecraft.api          // Main API
/_functions/nowpayments.api          // Crypto payments
/_functions/stripe.api               // Stripe payments
/_functions/charter-page-middleware // Charter middleware
/_functions/mission-support-middleware // Mission support
/_functions/webhooks/nowpayments     // Webhooks
```

---

## ✅ DEPLOYMENT CHECKLIST

### Phase 1: Backend (15 min)
- [ ] Upload 7 backend functions
- [ ] Upload 2 web modules
- [ ] Verify all functions published

### Phase 2: Secrets (5 min)
- [ ] Configure 10 secrets in Secrets Manager
- [ ] Verify secrets accessible

### Phase 3: HTML (10 min)
- [ ] Embed charter-page-final.html
- [ ] Embed mission-support-form.html
- [ ] Verify API paths correct

### Phase 4: Webhooks (5 min)
- [ ] Configure NOWPayments webhook
- [ ] Configure Stripe webhook

### Phase 5: Testing (10 min)
- [ ] Test crypto payment flow
- [ ] Test Stripe payment flow
- [ ] Test Mission Support form
- [ ] Check browser console

---

## 📂 FILE LOCATIONS

### Backend Functions
```
./hingecraft-global/src/backend/
├── nowpayments.api.jsw
├── stripe.api.jsw
├── hingecraft.api.web.jsw
├── charter-page-middleware.jsw
├── charter-page-middleware.web.js
├── mission-support-middleware.jsw
└── webhooks/
    └── nowpayments.jsw
```

### HTML Pages
```
./hingecraft-global/public/pages/
├── charter-page-final.html ⭐ USE THIS
└── mission-support-form.html ⭐ USE THIS
```

---

## 🔐 SECRETS CONFIGURATION

**Location:** Wix Editor → Settings → Secrets Manager

| Secret Name | Value |
|------------|-------|
| `NOWPAYMENTS_API_KEY` | `JEH3VG9-648MJPE-HPETPZ7-QVCSBES` |
| `NOWPAYMENTS_IPN_SECRET` | `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9` |
| `NOWPAYMENTS_BASE_URL` | `https://api.nowpayments.io/v1` |
| `BASE_URL` | `https://www.hingecraft-global.ai` |
| `KYC_THRESHOLD_USD` | `1000` |
| `CRYPTO_CONFIRMATIONS_REQUIRED` | `3` |
| `STRIPE_SECRET_KEY_LIVE` | `[YOUR_KEY]` |
| `STRIPE_PUBLISHABLE_KEY_LIVE` | `[YOUR_KEY]` |
| `EXTERNAL_DB_ENDPOINT` | `[YOUR_ENDPOINT]` (if using) |
| `EXTERNAL_DB_SECRET_KEY` | `[YOUR_KEY]` (if using) |

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

### HTML Not Loading
- Check HTML iframe settings
- Verify API paths are correct
- Check browser console for errors

---

## 📞 SUPPORT

For detailed instructions, see:
- **Quick Deploy:** `WIX_QUICK_DEPLOY.md`
- **Complete Guide:** `WIX_DEPLOYMENT_COMPLETE_PACKAGE.md`
- **File List:** `WIX_DEPLOYMENT_FILE_LIST.md`

---

## 🎉 NEXT STEPS

After deployment:
1. ✅ Test all payment flows
2. ✅ Configure legal pages (32 files available in `public/pages/legal/`)
3. ✅ Set up monitoring
4. ✅ Test webhook processing

---

**Status:** ✅ **READY FOR WIX DEV DEPLOYMENT**

All components are prepared and linked for Wix Dev.
