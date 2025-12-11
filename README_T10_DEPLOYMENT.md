# 🚀 T10 Deployment - Quick Start Guide

**Status:** ✅ Ready for Deployment

---

## ⚡ Quick Deploy (5 Minutes)

### 1. Upload Backend Functions
```bash
# Files to upload to Wix Editor → Dev Mode → Backend:
src/backend/charter-page-middleware.jsw
src/backend/mission-support-middleware.jsw
src/backend/nowpayments.api.jsw
src/backend/stripe.api.jsw
src/backend/hingecraft.api.web.jsw
```

### 2. Configure Secrets
Go to Wix Editor → Dev Mode → Secrets Manager, add:
- `NOWPAYMENTS_API_KEY` = `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`
- `NOWPAYMENTS_IPN_SECRET` = `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
- `NOWPAYMENTS_BASE_URL` = `https://api.nowpayments.io/v1`
- `BASE_URL` = `https://www.hingecraft-global.ai`
- `STRIPE_SECRET_KEY_LIVE` = [Your Stripe Dev Key]
- `STRIPE_PUBLISHABLE_KEY_LIVE` = [Your Stripe Publishable Key]

### 3. Embed HTML Pages
**Charter Page:**
- Add HTML element
- Set ID: `charterPageContent`
- Paste: `public/pages/charter-page-final.html`

**Mission Support Page:**
- Add HTML element
- Set ID: `missionSupportForm`
- Paste: `public/pages/mission-support-form.html`

### 4. Deploy Velo Code
Velo page code is already in:
- `src/pages/Charter of Abundance Invitation.pa3z2.js`
- `src/pages/Mission Support.msup1.js`

---

## ✅ Test Checklist

- [ ] Visit Charter Page → See preset buttons ($1, $5, $20)
- [ ] Click $1 → See crypto options
- [ ] Click Solana → See wallet address + QR code
- [ ] Fill Mission Support form → Submit
- [ ] Verify redirect to Charter Page with amount
- [ ] Check cumulative total displays correctly

---

## 📞 Need Help?

See full documentation:
- `DEPLOYMENT_GUIDE_T10.md` - Complete deployment guide
- `FINAL_INTEGRATION_CHECKLIST.md` - Verification checklist
- `QUICK_REFERENCE_T10.md` - Quick reference

---

**Ready to deploy!** 🚀
