# 🚀 NOWPayments Integration - Complete Deployment Guide

**Date:** January 27, 2025  
**Status:** ✅ **READY FOR DEPLOYMENT**

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Wix Secrets Configuration](#wix-secrets-configuration)
4. [Database Setup](#database-setup)
5. [Backend Functions](#backend-functions)
6. [Frontend Integration](#frontend-integration)
7. [Webhook Configuration](#webhook-configuration)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## 🎯 OVERVIEW

This guide covers the complete deployment of NOWPayments crypto payment integration for the HingeCraft Mission Support form. The integration allows donors to pay with Bitcoin, Ethereum, Solana, and other cryptocurrencies via NOWPayments invoices.

### Key Features
- ✅ Crypto payment option in Mission Support form
- ✅ NOWPayments invoice creation with idempotency
- ✅ Webhook signature verification
- ✅ Automatic invoice status reconciliation
- ✅ KYC/AML triggers for high-value payments
- ✅ Receipt email generation
- ✅ Notion/CRM sync integration

---

## 🔧 PREREQUISITES

### Required Accounts
1. **NOWPayments Account**
   - Sign up at https://nowpayments.io
   - Complete KYC verification
   - Get API key and IPN secret

2. **Wix Account**
   - Velo enabled
   - Secrets Manager access
   - Database access (Wix DB or External DB)

3. **Database**
   - PostgreSQL (recommended) or Wix Database
   - Tables: `crypto_payments`, `webhook_logs`, `kyc_verifications`

### Required Secrets
See `NOWPAYMENTS_CREDENTIALS_TEMPLATE.md` for complete list.

---

## 🔐 WIX SECRETS CONFIGURATION

### Step 1: Access Wix Secrets Manager

1. Go to **Wix Dashboard** → **Settings** → **Secrets**
2. Click **"Add Secret"**

### Step 2: Add Required Secrets

Add each secret with the exact name and value:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `NOWPAYMENTS_API_KEY` | `JEH3VG9-648MJPE-HPETPZ7-QVCSBES` | NOWPayments API key |
| `NOWPAYMENTS_IPN_SECRET` | `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9` | Webhook signature secret |
| `NOWPAYMENTS_BASE_URL` | `https://api.nowpayments.io/v1` | API base URL |
| `BASE_URL` | `https://www.hingecraft-global.ai` | Your site URL |
| `KYC_THRESHOLD_USD` | `1000` | KYC trigger threshold |
| `CRYPTO_CONFIRMATIONS_REQUIRED` | `3` | Blockchain confirmations |

### Step 3: Verify Secrets

After adding secrets, verify they're accessible in your backend code.

---

## 🗄️ DATABASE SETUP

### Step 1: Run Database Migration

The database schema is in `database/init.sql`. Run it to create:

- `crypto_payments` table
- `webhook_logs` table  
- `kyc_verifications` table

**For PostgreSQL:**
```bash
psql -U your_user -d hingecraft_db -f database/init.sql
```

**For Wix Database:**
- Manually create collections via Wix Dashboard
- Use the schema from `init.sql` as reference

### Step 2: Verify Tables

Check that all tables exist and have correct indexes.

---

## 🔧 BACKEND FUNCTIONS

### Files Created

1. **`src/backend/nowpayments.api.jsw`**
   - Main NOWPayments API integration
   - Invoice creation
   - Webhook handling
   - Status reconciliation

2. **`src/backend/createNowPaymentsInvoice.jsw`**
   - Wix backend function wrapper
   - Exposed as `/_functions/createNowPaymentsInvoice`

3. **`src/backend/webhooks/nowpayments.jsw`**
   - Webhook endpoint
   - Exposed as `/_functions/webhooks/nowpayments`

### Deployment Steps

1. **Upload Backend Files**
   - Upload `nowpayments.api.jsw` to `backend/` folder
   - Upload `createNowPaymentsInvoice.jsw` to `backend/` folder
   - Upload `webhooks/nowpayments.jsw` to `backend/webhooks/` folder

2. **Verify Functions**
   - Check that functions appear in Wix Dashboard
   - Test function visibility

---

## 🎨 FRONTEND INTEGRATION

### Files Updated

1. **`public/pages/mission-support-form.html`**
   - Added payment method selector (Card/Crypto)
   - Added crypto invoice creation flow
   - Added invoice redirect logic

### Deployment Steps

1. **Update Mission Support Form**
   - The form HTML is already updated
   - Verify payment method selector appears
   - Test crypto payment flow

2. **Test Form Submission**
   - Fill out form
   - Select "Crypto Payment"
   - Verify redirect to NOWPayments invoice

---

## 🔗 WEBHOOK CONFIGURATION

### Step 1: Configure NOWPayments Webhook

1. Log into NOWPayments Dashboard
2. Go to **Settings** → **IPN (Instant Payment Notifications)**
3. Set webhook URL:
   ```
   https://www.hingecraft-global.ai/_functions/webhooks/nowpayments
   ```
4. Set IPN Secret: `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
5. Enable events:
   - `invoice_paid`
   - `invoice_paid_unconfirmed`
   - `invoice_expired`
   - `invoice_waiting`
   - `invoice_partial`

### Step 2: Test Webhook

Use NOWPayments test mode to send test webhooks.

---

## 🧪 TESTING

### Test Plan

#### 1. Invoice Creation Test

**Test:** Create crypto invoice from Mission Support form

**Steps:**
1. Go to Mission Support form
2. Fill out all required fields
3. Select amount ($1 for testing)
4. Select "Crypto Payment"
5. Click "Continue to Crypto Payment"

**Expected Result:**
- Invoice created successfully
- Redirected to NOWPayments invoice page
- Invoice shows correct amount
- Invoice ID stored in database

#### 2. Webhook Test

**Test:** Receive and process webhook

**Steps:**
1. Create test invoice
2. Use NOWPayments test mode to simulate payment
3. Check webhook logs in database

**Expected Result:**
- Webhook received
- Signature verified
- Payment status updated
- Database records updated

#### 3. Idempotency Test

**Test:** Prevent duplicate invoices

**Steps:**
1. Submit form with same session ID twice
2. Check database

**Expected Result:**
- Only one invoice created
- Second request returns existing invoice

#### 4. KYC Trigger Test

**Test:** Trigger KYC for high-value payment

**Steps:**
1. Create invoice for $1,000+
2. Complete payment
3. Check KYC records

**Expected Result:**
- KYC verification record created
- Status set to 'pending'
- Email sent to donor

---

## 🚀 PRODUCTION DEPLOYMENT

### Pre-Deployment Checklist

- [ ] All secrets configured in Wix Secrets Manager
- [ ] Database tables created and indexed
- [ ] Backend functions uploaded and tested
- [ ] Frontend form updated
- [ ] Webhook URL configured in NOWPayments
- [ ] Test mode verified working

### Deployment Steps

1. **Switch to Production API Keys**
   - Update `NOWPAYMENTS_API_KEY` in Wix Secrets
   - Update `NOWPAYMENTS_IPN_SECRET` in Wix Secrets
   - Update webhook URL in NOWPayments dashboard

2. **Deploy Code**
   - Push all changes to Git
   - Sync with Wix dev
   - Verify functions are live

3. **Test Production Flow**
   - Create small test invoice ($1)
   - Complete test payment
   - Verify webhook received
   - Check database records

4. **Monitor**
   - Check webhook logs
   - Monitor invoice creation rate
   - Watch for errors

---

## 📊 MONITORING & TROUBLESHOOTING

### Key Metrics to Monitor

1. **Invoice Creation Rate**
   - Track successful invoice creations
   - Monitor failures

2. **Webhook Processing**
   - Signature verification success rate
   - Processing errors

3. **Payment Status Transitions**
   - pending_invoice → pending_payment → detected → confirmed
   - Track stuck payments

4. **KYC Triggers**
   - Number of KYC verifications triggered
   - Completion rate

### Common Issues

#### Issue: Invoice Creation Fails

**Symptoms:** Error when selecting crypto payment

**Solutions:**
- Check NOWPayments API key in secrets
- Verify API key is active
- Check NOWPayments account status
- Review backend logs

#### Issue: Webhook Not Received

**Symptoms:** Payment completed but status not updated

**Solutions:**
- Verify webhook URL in NOWPayments dashboard
- Check webhook logs in database
- Verify IPN secret matches
- Test webhook endpoint manually

#### Issue: Signature Verification Fails

**Symptoms:** Webhook received but signature invalid

**Solutions:**
- Verify IPN secret matches NOWPayments dashboard
- Check raw body is passed correctly
- Review signature verification code

#### Issue: Duplicate Invoices

**Symptoms:** Multiple invoices for same order_id

**Solutions:**
- Verify idempotency check is working
- Check order_id generation logic
- Review database constraints

---

## 📧 EMAIL TEMPLATES

### Crypto Payment Receipt Email

**Subject:** Thank you — your HingeCraft crypto contribution

**Body:**
```
Hi {{firstName}},

Thank you for your crypto contribution of {{cryptoAmount}} {{cryptoSymbol}} (~${{usdAmount}}) to HingeCraft Mission Support.

Payment Details:
- Amount: {{cryptoAmount}} {{cryptoSymbol}} (~${{usdAmount}} USD)
- Date: {{date}}
- Transaction Hash: {{txHash}}
- Invoice ID: {{invoiceId}}
- Status: Confirmed

View transaction: {{explorerLink}}

This contribution supports HingeCraft: building resilient communities, AI training for students, and sustainable furniture microfactories.

Important: At present, HingeCraft Global PBC is not a registered 501(c)(3); contributions may not be tax-deductible. Please save this receipt for your records.

If you have questions, reply to this email.

Sincerely,
HingeCraft Global
```

### KYC Request Email

**Subject:** Action required: Verify your identity to complete your HingeCraft contribution

**Body:**
```
Hi {{firstName}},

Thanks for contributing ${{amount}}. To finalize this contribution, we must verify your identity for compliance purposes.

Please follow this secure link to complete identity verification within 72 hours:

{{kycUrl}}

What you'll need:
- Government-issued ID (photo of passport or driver's license)
- Selfie (mobile photo)

We keep your documents secure and encrypted.

If you need help, reply to this email.

Sincerely,
HingeCraft Compliance Team
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Secrets configured in Wix Secrets Manager
- [ ] Database tables created
- [ ] Backend functions uploaded
- [ ] Frontend form updated
- [ ] Webhook configured in NOWPayments
- [ ] Test mode verified

### Deployment
- [ ] Switch to production API keys
- [ ] Update webhook URL
- [ ] Deploy code to production
- [ ] Test production flow

### Post-Deployment
- [ ] Monitor invoice creation
- [ ] Monitor webhook processing
- [ ] Check payment status updates
- [ ] Verify KYC triggers
- [ ] Test receipt emails

---

## 📚 ADDITIONAL RESOURCES

- **NOWPayments API Docs:** https://documenter.getpostman.com/view/7907941/2s93JusNJt
- **NOWPayments Dashboard:** https://nowpayments.io/dashboard
- **Wix Velo Docs:** https://www.wix.com/velo/reference
- **Credentials Template:** `NOWPAYMENTS_CREDENTIALS_TEMPLATE.md`

---

## 🆘 SUPPORT

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs in Wix Dashboard
3. Check NOWPayments dashboard for invoice status
4. Review webhook logs in database

---

**Last Updated:** January 27, 2025  
**Status:** ✅ Ready for Production Deployment

