# ✅ Final Deployment Checklist - T10 Implementation
## Complete Verification Before Pushing to Wix Dev

**Date:** January 27, 2025  
**Status:** Ready for Deployment

---

## 📋 PRE-PUSH VERIFICATION

### ✅ Backend Files (7 files)
- [x] `src/backend/charter-page-middleware.web.js` - Web module (public access)
- [x] `src/backend/mission-support-middleware.web.js` - Web module (public access)
- [x] `src/backend/nowpayments.api.jsw` - Internal module (with wallet addresses)
- [x] `src/backend/stripe.api.jsw` - Internal module (dev key ready)
- [x] `src/backend/hingecraft.api.web.jsw` - Web module (public access)
- [x] `src/backend/createNowPaymentsInvoice.jsw` - HTTP function wrapper
- [x] `src/backend/webhooks/nowpayments.jsw` - Webhook handler

### ✅ Frontend Files (2 files)
- [x] `public/pages/charter-page-final.html` - Charter page with active crypto buttons
- [x] `public/pages/mission-support-form.html` - Mission support form (updated)

### ✅ Velo Page Files (2 files)
- [x] `src/pages/Charter of Abundance Invitation.pa3z2.js` - Charter page Velo code
- [x] `src/pages/Mission Support.msup1.js` - Mission support page Velo code

### ✅ Configuration Files
- [x] `.wix/backend/permissions.json` - Function permissions configured

---

## 🔐 SECRETS CONFIGURATION CHECKLIST

Before pushing, ensure these secrets are configured in Wix Secrets Manager:

- [ ] `NOWPAYMENTS_API_KEY` = `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`
- [ ] `NOWPAYMENTS_IPN_SECRET` = `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
- [ ] `NOWPAYMENTS_BASE_URL` = `https://api.nowpayments.io/v1`
- [ ] `BASE_URL` = `https://www.hingecraft-global.ai`
- [ ] `STRIPE_SECRET_KEY_LIVE` = [Your Stripe Dev Key]
- [ ] `STRIPE_PUBLISHABLE_KEY_LIVE` = [Your Stripe Publishable Key]

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Push to Wix Dev
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
./scripts/push-to-wix-dev.sh
```

Or manually:
```bash
wix dev
# Then in another terminal:
wix push
```

### Step 2: Verify Files Uploaded
1. Open Wix Editor: https://editor.wix.com
2. Go to Dev Mode → Backend
3. Verify all backend functions are uploaded:
   - charter-page-middleware.web.js
   - mission-support-middleware.web.js
   - nowpayments.api.jsw
   - stripe.api.jsw
   - hingecraft.api.web.jsw
   - createNowPaymentsInvoice.jsw
   - webhooks/nowpayments.jsw

### Step 3: Configure Pages
1. **Charter Page:**
   - Add HTML element
   - Set ID: `charterPageContent`
   - Paste content from: `public/pages/charter-page-final.html`

2. **Mission Support Page:**
   - Add HTML element
   - Set ID: `missionSupportForm`
   - Paste content from: `public/pages/mission-support-form.html`

### Step 4: Configure Secrets
1. Go to Wix Editor → Dev Mode → Secrets Manager
2. Add all secrets listed above
3. Verify each secret is saved

### Step 5: Test
1. Visit Charter Page → Test preset buttons ($1, $5, $20)
2. Test crypto payment buttons (Solana, Stellar, Bitcoin, Ethereum)
3. Fill Mission Support form → Submit
4. Verify redirect to Charter Page
5. Check cumulative total updates

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Function Endpoints:
- [ ] `/_functions/charter-page-middleware.web/onReady` - Works
- [ ] `/_functions/charter-page-middleware.web/cryptoButtonClick` - Works
- [ ] `/_functions/charter-page-middleware.web/fiatButtonClick` - Works
- [ ] `/_functions/charter-page-middleware.web/getCumulativeTotal` - Works
- [ ] `/_functions/mission-support-middleware.web/handleUserInputDonation` - Works
- [ ] `/_functions/mission-support-middleware.web/goToCharterAfterPayment` - Works
- [ ] `/_functions/createNowPaymentsInvoice` - Works
- [ ] `/_functions/nowpayments.api/createInvoice` - Works
- [ ] `/_functions/stripe.api/getPublishableKey` - Works
- [ ] `/_functions/stripe.api/createCheckoutSession` - Works

### Database Collections:
- [ ] Donations collection exists
- [ ] CryptoPayments collection exists
- [ ] ContributionIntent collection exists
- [ ] WebhookLogs collection exists

### Frontend Integration:
- [ ] Charter page HTML embedded correctly
- [ ] Mission Support form HTML embedded correctly
- [ ] Velo page code active
- [ ] Crypto buttons display correctly
- [ ] Preset amount buttons work
- [ ] Cumulative total displays

---

## 🐛 TROUBLESHOOTING

### Issue: Functions not accessible
**Solution:** Check permissions in `.wix/backend/permissions.json`

### Issue: Secrets not loading
**Solution:** Verify secrets are added in Wix Secrets Manager

### Issue: Database queries fail
**Solution:** Verify collections exist and have correct schema

### Issue: Crypto buttons not working
**Solution:** Check NOWPayments API key and verify backend function is deployed

---

## 📊 DEPLOYMENT STATUS

**Files Ready:** ✅ All files verified  
**Secrets:** ⏳ Configure in Wix Secrets Manager  
**Pages:** ⏳ Embed HTML in Wix Editor  
**Testing:** ⏳ Run after deployment  

---

## 🎉 READY TO DEPLOY

All files are ready. Run the deployment script to push to Wix dev:

```bash
./scripts/push-to-wix-dev.sh
```

**Status:** ✅ **READY FOR DEPLOYMENT**
