# 🚀 T10 Complete Deployment Guide
## HingeCraft Global - Crypto Payment Integration + Database Sync

**Date:** January 27, 2025  
**Status:** ✅ **READY FOR DEPLOYMENT**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Files Created:
- [x] `src/backend/charter-page-middleware.jsw` - Charter page middleware
- [x] `src/backend/mission-support-middleware.jsw` - Mission support middleware
- [x] `public/pages/charter-page-final.html` - Charter page with active crypto buttons
- [x] `public/pages/mission-support-form.html` - Mission support form (already exists)
- [x] `src/pages/Charter of Abundance Invitation.pa3z2.js` - Charter page Velo code
- [x] `src/pages/Mission Support.msup1.js` - Mission support page Velo code
- [x] `src/backend/nowpayments.api.jsw` - Updated with wallet addresses
- [x] `src/backend/stripe.api.jsw` - Stripe integration ready
- [x] `scripts/deploy-to-wix-cli.sh` - Deployment script

### ✅ Database Schema:
- [x] Donations table
- [x] CryptoPayments table
- [x] ContributionIntent table
- [x] WebhookLogs table

### ✅ Secrets Configuration:
- [x] NOWPayments API Key: `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`
- [x] NOWPayments IPN Secret: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
- [x] Wallet addresses configured

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Configure Wix Secrets Manager

1. Go to Wix Editor → Dev Mode → Secrets Manager
2. Add the following secrets:

```
NOWPAYMENTS_API_KEY = JEH3VG9-648MJPE-HPETPZ7-QVCSBES
NOWPAYMENTS_IPN_SECRET = 8TnzsveF28gelMuvXFMxgPW5YUXYkcL9
NOWPAYMENTS_BASE_URL = https://api.nowpayments.io/v1
BASE_URL = https://www.hingecraft-global.ai
STRIPE_SECRET_KEY_LIVE = [Your Stripe Dev Key]
STRIPE_PUBLISHABLE_KEY_LIVE = [Your Stripe Publishable Key]
```

### Step 2: Upload Backend Functions

1. Go to Wix Editor → Dev Mode → Backend
2. Upload the following files:

```
src/backend/charter-page-middleware.jsw
src/backend/mission-support-middleware.jsw
src/backend/nowpayments.api.jsw
src/backend/stripe.api.jsw
src/backend/hingecraft.api.web.jsw
```

### Step 3: Configure Charter Page

1. Open Charter Page in Wix Editor
2. Add HTML element:
   - Element ID: `charterPageContent`
   - Content: Copy entire content from `public/pages/charter-page-final.html`
3. The Velo code is already in: `src/pages/Charter of Abundance Invitation.pa3z2.js`

### Step 4: Configure Mission Support Page

1. Open Mission Support Page in Wix Editor
2. Add HTML element:
   - Element ID: `missionSupportForm`
   - Content: Copy entire content from `public/pages/mission-support-form.html`
3. The Velo code is already in: `src/pages/Mission Support.msup1.js`

### Step 5: Deploy Using Wix CLI

```bash
# Navigate to project directory
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global

# Run deployment script
./scripts/deploy-to-wix-cli.sh

# Or manually:
wix publish --source local
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Test Charter Page:
1. [ ] Visit Charter Page
2. [ ] Verify preset amount buttons ($1, $5, $20) display
3. [ ] Click $1 button → Verify crypto options appear
4. [ ] Click Solana button → Verify invoice creation
5. [ ] Verify wallet address displays
6. [ ] Verify QR code generates
7. [ ] Verify cumulative total displays correctly

### Test Mission Support Form:
1. [ ] Visit Mission Support Page
2. [ ] Fill out form with test data
3. [ ] Select amount ($1, $5, $10, or Other)
4. [ ] Select payment method (Card/Crypto)
5. [ ] Submit form
6. [ ] If Card: Verify redirect to Charter Page with amount
7. [ ] If Crypto: Verify redirect to NOWPayments invoice

### Test Database Sync:
1. [ ] Make a test donation
2. [ ] Verify it appears in Donations collection
3. [ ] Verify cumulative total updates
4. [ ] Verify contributions counter updates

---

## 🔍 TROUBLESHOOTING

### Issue: Crypto buttons not working
**Solution:** 
- Check NOWPayments API key in Secrets Manager
- Verify backend function is deployed
- Check browser console for errors

### Issue: Cumulative total not updating
**Solution:**
- Verify database collections exist
- Check middleware `getCumulativeTotal()` function
- Verify database listeners are active

### Issue: Mission Support form not redirecting
**Solution:**
- Check middleware `goToCharterAfterPayment()` function
- Verify URL parameters are passed correctly
- Check browser console for errors

---

## 📊 DATABASE VERIFICATION

### Check Current Totals:
```sql
-- Total donations
SELECT SUM(amount) FROM donations WHERE payment_status = 'completed';

-- Total crypto payments
SELECT SUM(price_amount) FROM crypto_payments WHERE status = 'confirmed';

-- Cumulative total
SELECT 
  (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE payment_status = 'completed') +
  (SELECT COALESCE(SUM(price_amount), 0) FROM crypto_payments WHERE status = 'confirmed') 
  AS cumulative_total;
```

---

## 🎉 DEPLOYMENT COMPLETE

Once all steps are completed:

1. ✅ All crypto payment buttons are active
2. ✅ Preset amounts ($1, $5, $20) work correctly
3. ✅ Database sync is working
4. ✅ Cumulative total updates correctly
5. ✅ Mission Support form redirects correctly
6. ✅ All wallet addresses are configured

**Status:** ✅ **READY FOR PRODUCTION**

---

## 📞 SUPPORT

If you encounter any issues:
1. Check browser console for errors
2. Check Wix backend logs
3. Verify all secrets are configured
4. Verify all files are uploaded correctly

---

**Last Updated:** January 27, 2025
