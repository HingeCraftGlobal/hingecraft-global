# 🎯 Next Steps Guide - Wix Deployment

**Current Status:** All automated tasks complete, ready for manual deployment  
**Last Updated:** January 27, 2025

---

## 🚀 Immediate Next Steps

### Step 1: Upload Backend Functions (Priority: HIGH)

**Location:** Wix Editor → Dev Mode → Backend → Web Modules

**Files to Upload:**
1. `backend-functions/hingecraft.api.web.jsw` → `backend/hingecraft.api.web.jsw`
2. `backend-functions/nowpayments.api.jsw` → `backend/nowpayments.api.jsw`
3. `backend-functions/createNowPaymentsInvoice.jsw` → `backend/createNowPaymentsInvoice.jsw`
4. `backend-functions/email-templates.jsw` → `backend/email-templates.jsw`
5. `backend-functions/reconciliation-worker.jsw` → `backend/reconciliation-worker.jsw`
6. `backend-functions/notion-crm-sync.jsw` → `backend/notion-crm-sync.jsw`
7. `backend-functions/webhooks/nowpayments.jsw` → `backend/webhooks/nowpayments.jsw`

**Instructions:**
1. Open Wix Editor
2. Enable Dev Mode
3. Navigate to Backend → Web Modules
4. Create new `.jsw` files or upload existing ones
5. Copy content from files in `backend-functions/` folder
6. Verify functions appear in Functions list

**Verification:**
- [ ] All functions visible in Functions list
- [ ] Functions can be called from frontend
- [ ] No syntax errors in Wix Editor

---

### Step 2: Configure Wix Secrets (Priority: HIGH)

**Location:** Wix Editor → Dev Mode → Secrets Manager

**Secrets to Add:**

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `NOWPAYMENTS_API_KEY` | `JEH3VG9-648MJPE-HPETPZ7-QVCSBES` | NOWPayments API authentication |
| `NOWPAYMENTS_IPN_SECRET` | `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9` | Webhook signature verification |
| `NOWPAYMENTS_BASE_URL` | `https://api.nowpayments.io/v1` | NOWPayments API endpoint |
| `BASE_URL` | `https://www.hingecraft-global.ai` | Your website base URL |
| `KYC_THRESHOLD_USD` | `1000` | KYC trigger threshold |
| `CRYPTO_CONFIRMATIONS_REQUIRED` | `3` | Required blockchain confirmations |
| `EXTERNAL_DB_ENDPOINT` | (Your DB endpoint) | External database URL |
| `EXTERNAL_DB_SECRET_KEY` | (Your DB secret) | Database authentication |
| `SENDGRID_API_KEY` | (Your SendGrid key) | Email sending |
| `EMAIL_FROM` | `no-reply@hingecraft-global.ai` | Email sender address |

**Instructions:**
1. Open Wix Editor → Dev Mode → Secrets Manager
2. Click "Add New Secret"
3. Enter secret name and value
4. Repeat for all secrets
5. Verify secrets are saved

**Verification:**
- [ ] All secrets added
- [ ] Test secret retrieval in backend function
- [ ] Verify no errors accessing secrets

---

### Step 3: Run Database Migration (Priority: HIGH)

**File:** `database-schema/init.sql`

**Instructions:**
1. Connect to your database (PostgreSQL or Wix Database)
2. Open `database-schema/init.sql`
3. Execute the SQL script
4. Verify tables created

**Tables to Verify:**
- [ ] `contribution_intents`
- [ ] `crypto_payments`
- [ ] `webhook_logs`
- [ ] `kyc_verifications`

**Verification:**
- [ ] All tables exist
- [ ] Indexes created
- [ ] Can insert test records
- [ ] Can query records

---

### Step 4: Setup Frontend Pages (Priority: MEDIUM)

#### Mission Support Page (`/payment`)

**File:** `frontend-pages/mission-support-form.html`

**Instructions:**
1. Open Wix Editor → Pages → Payment Page
2. Add HTML Element
3. Set Element ID: `missionSupportForm` or `root`
4. Paste content from `frontend-pages/mission-support-form.html`
5. Save page

**Verification:**
- [ ] Form displays correctly
- [ ] All form fields visible
- [ ] Payment method selector works
- [ ] Form validation works

#### Charter Page (`/charter`)

**File:** `frontend-pages/charter-page.html`

**Instructions:**
1. Open Wix Editor → Pages → Charter Page
2. Add HTML Element (or use existing)
3. Paste content from `frontend-pages/charter-page.html`
4. Save page

**Verification:**
- [ ] Page displays correctly
- [ ] Donation amount displays when URL parameter present
- [ ] Checkout button appears

---

### Step 5: Configure NOWPayments Webhook (Priority: MEDIUM)

**Location:** NOWPayments Dashboard → Settings → IPN Settings

**Configuration:**
- **Webhook URL:** `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
- **IPN Secret:** `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
- **Events to Enable:**
  - `invoice_paid`
  - `invoice_paid_unconfirmed`
  - `invoice_expired`
  - `invoice_waiting`
  - `invoice_partial`

**Instructions:**
1. Log into NOWPayments Dashboard
2. Navigate to Settings → IPN Settings
3. Enter webhook URL
4. Enter IPN secret
5. Enable required events
6. Save configuration

**Verification:**
- [ ] Webhook URL configured
- [ ] IPN secret matches Wix secret
- [ ] Events enabled
- [ ] Test webhook sent successfully

---

### Step 6: Testing (Priority: MEDIUM)

#### Test Card Payment Flow

1. Visit `/payment` page
2. Fill out form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Address: 123 Test St
   - Select amount: $1
   - Select "Card Payment"
3. Submit form
4. Verify redirects work
5. Complete test payment
6. Verify database record created
7. Verify receipt email sent

#### Test Crypto Payment Flow

1. Visit `/payment` page
2. Fill out form:
   - All required fields
   - Select amount: $1
   - Select "Crypto Payment"
3. Submit form
4. Verify NOWPayments invoice created
5. Verify redirect to NOWPayments invoice page
6. Complete test crypto payment
7. Verify webhook received
8. Verify database record updated
9. Verify receipt email sent

---

## 📋 Checklist Summary

### High Priority (Do First)
- [ ] Upload backend functions to Wix Editor
- [ ] Configure Wix Secrets Manager
- [ ] Run database migration

### Medium Priority (Do Next)
- [ ] Setup frontend pages
- [ ] Configure NOWPayments webhook
- [ ] Test payment flows

### Low Priority (Do Last)
- [ ] Setup monitoring
- [ ] Performance optimization
- [ ] Additional documentation

---

## 🆘 Troubleshooting

### Backend Functions Not Appearing
- Check file extensions (.jsw)
- Verify Dev Mode is enabled
- Check for syntax errors
- Refresh Wix Editor

### Secrets Not Accessible
- Verify secret names match exactly
- Check secret values are correct
- Test secret retrieval in backend function
- Verify Secrets Manager permissions

### Database Migration Fails
- Check database connection
- Verify SQL syntax
- Check table permissions
- Review error messages

### Webhook Not Received
- Verify webhook URL is accessible
- Check IPN secret matches
- Verify events are enabled
- Check webhook logs in NOWPayments dashboard

---

## 📚 Reference Documents

- **Deployment Guide:** `documentation/FINAL_DEPLOYMENT_CHECKLIST.md`
- **NOWPayments Setup:** `documentation/NOWPAYMENTS_DEPLOYMENT_GUIDE.md`
- **Integration Verification:** `documentation/COMPLETE_SYSTEM_INTEGRATION_VERIFICATION.md`
- **Todo List:** `WIX_DEPLOYMENT_TODO.md`

---

**Status:** Ready for manual deployment steps  
**Next Action:** Upload backend functions to Wix Editor

