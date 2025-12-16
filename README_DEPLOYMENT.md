# 🚀 HingeCraft Mission Support System - Quick Start Guide

**Complete Implementation Ready for Deployment**

---

## 🎯 What's Included

This system provides a complete Mission Support donation flow with:

- ✅ **Mission Support Form** - Collects donor information and amount
- ✅ **Card Payment** - Stripe integration for card payments
- ✅ **Crypto Payment** - NOWPayments integration for crypto payments
- ✅ **Charter Page** - Displays donation amount and redirects
- ✅ **Backend Logging** - Complete audit trail
- ✅ **Database Integration** - PostgreSQL/Wix Database support
- ✅ **Webhook Processing** - Automated payment status updates
- ✅ **KYC/AML** - Compliance triggers for high-value payments

---

## 📋 Quick Deployment Steps

### 1. Configure Secrets (5 minutes)

Add these to **Wix Secrets Manager**:

```
NOWPAYMENTS_API_KEY=JEH3VG9-648MJPE-HPETPZ7-QVCSBES
NOWPAYMENTS_IPN_SECRET=8TnzsveF28gelMuvXFMxgPW5YUXYkcL9
BASE_URL=https://www.hingecraft-global.ai
```

See `NOWPAYMENTS_CREDENTIALS_TEMPLATE.md` for complete list.

### 2. Setup Database (10 minutes)

Run `database/init.sql` to create tables:

```bash
psql -U your_user -d hingecraft_db -f database/init.sql
```

### 3. Upload Backend Functions (5 minutes)

Upload these files to Wix Editor → Backend:

- `src/backend/hingecraft.api.web.jsw`
- `src/backend/nowpayments.api.jsw`
- `src/backend/createNowPaymentsInvoice.jsw`
- `src/backend/webhooks/nowpayments.jsw`

### 4. Setup Pages (10 minutes)

**Payment Page (`/payment`):**
- Add HTML Element
- Paste `public/pages/mission-support-form.html`

**Charter Page (`/charter`):**
- Add HTML Element
- Paste `public/pages/charter-page.html`

### 5. Configure NOWPayments (5 minutes)

In NOWPayments Dashboard:
- Set Webhook URL: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
- Set IPN Secret: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`

---

## 🧪 Test It

1. Visit `/payment`
2. Fill form, select amount, choose payment method
3. Submit and verify redirects work
4. Check database for records

---

## 📚 Documentation

- **Full Deployment Guide:** `NOWPAYMENTS_DEPLOYMENT_GUIDE.md`
- **Deployment Checklist:** `FINAL_DEPLOYMENT_CHECKLIST.md`
- **Integration Verification:** `COMPLETE_SYSTEM_INTEGRATION_VERIFICATION.md`
- **Credentials Template:** `NOWPAYMENTS_CREDENTIALS_TEMPLATE.md`

---

## ✅ Status

**Implementation:** ✅ Complete  
**Testing:** ⏳ Ready for testing  
**Deployment:** ⏳ Ready for deployment

**All files committed to Git. Follow the deployment checklist to go live.**

---

**Questions?** Check the troubleshooting section in `FINAL_DEPLOYMENT_CHECKLIST.md`






