# 🧪 Testing Guide - Mission Support System

**Purpose:** Comprehensive testing guide for verifying deployment  
**Last Updated:** January 27, 2025

---

## 📋 Pre-Testing Checklist

Before running tests, ensure:

- [ ] All backend functions uploaded to Wix Editor
- [ ] All secrets configured in Wix Secrets Manager
- [ ] Database migration completed
- [ ] Frontend pages setup complete
- [ ] NOWPayments webhook configured

---

## 🧪 Test Scripts

### Location
All test scripts are located in: `test-scripts/`

### Available Tests

1. **Backend Functions Test** (`test-backend-functions.js`)
   - Tests all backend API functions
   - Verifies function responses
   - Checks error handling

2. **Secrets Access Test** (`test-secrets-access.js`)
   - Verifies all secrets are accessible
   - Checks secret values
   - Identifies missing secrets

3. **Database Connection Test** (`test-database-connection.js`)
   - Tests Wix Database connection
   - Tests External Database connection
   - Verifies table/collection existence

---

## 🚀 Running Tests

### Step 1: Upload Test Scripts

1. Open Wix Editor → Dev Mode
2. Navigate to Backend → Test Scripts (or create folder)
3. Upload test scripts:
   - `test-backend-functions.js`
   - `test-secrets-access.js`
   - `test-database-connection.js`

### Step 2: Run Individual Tests

#### Test Backend Functions

```javascript
// In Wix Editor → Backend → Functions
import { runAllTests } from 'backend/test-backend-functions';

// Run all tests
const results = await runAllTests();
console.log(results);

// Or run individual tests
import { testGetLatestDonation } from 'backend/test-backend-functions';
await testGetLatestDonation();
```

#### Test Secrets Access

```javascript
// In Wix Editor → Backend → Functions
import { testAllSecrets } from 'backend/test-secrets-access';

// Test all secrets
const results = await testAllSecrets();
console.log(results);

// Or test specific secret
import { testSecretByName } from 'backend/test-secrets-access';
await testSecretByName('NOWPAYMENTS_API_KEY');
```

#### Test Database Connection

```javascript
// In Wix Editor → Backend → Functions
import { testDatabaseConnection } from 'backend/test-database-connection';

// Test complete database connection
const results = await testDatabaseConnection();
console.log(results);
```

---

## ✅ Manual Testing Checklist

### 1. Backend Functions Testing

#### Test: Get Latest Donation
- [ ] Function returns latest donation
- [ ] Handles empty database gracefully
- [ ] Returns correct data structure

#### Test: Save Donation
- [ ] Saves donation successfully
- [ ] Returns donation ID
- [ ] Handles validation errors
- [ ] Stores metadata correctly

#### Test: Log Contribution Intent
- [ ] Creates intent record
- [ ] Validates required fields
- [ ] Returns intent ID
- [ ] Handles duplicate emails

#### Test: Log Mission Support Intent
- [ ] Creates mission support intent
- [ ] Validates all fields
- [ ] Triggers Notion sync (if configured)
- [ ] Triggers CRM tagging (if configured)

#### Test: Create NOWPayments Invoice
- [ ] Creates invoice successfully
- [ ] Returns invoice URL
- [ ] Stores invoice in database
- [ ] Handles API errors

---

### 2. Secrets Testing

#### Test: All Secrets Accessible
- [ ] `NOWPAYMENTS_API_KEY` accessible
- [ ] `NOWPAYMENTS_IPN_SECRET` accessible
- [ ] `NOWPAYMENTS_BASE_URL` accessible
- [ ] `BASE_URL` accessible
- [ ] `KYC_THRESHOLD_USD` accessible
- [ ] `CRYPTO_CONFIRMATIONS_REQUIRED` accessible
- [ ] `EXTERNAL_DB_ENDPOINT` accessible
- [ ] `EXTERNAL_DB_SECRET_KEY` accessible
- [ ] `SENDGRID_API_KEY` accessible
- [ ] `EMAIL_FROM` accessible

---

### 3. Database Testing

#### Test: Wix Database Connection
- [ ] Can query Donations collection
- [ ] Can insert records
- [ ] Can update records
- [ ] Can delete records

#### Test: External Database Connection
- [ ] Can connect to external database
- [ ] Can query tables
- [ ] Can insert records
- [ ] Can update records

#### Test: Table Existence
- [ ] `Donations` table/collection exists
- [ ] `ContributionIntents` table/collection exists
- [ ] `CryptoPayments` table/collection exists
- [ ] `WebhookLogs` table/collection exists
- [ ] `KYCVerifications` table/collection exists

---

### 4. Frontend Testing

#### Test: Mission Support Form (`/payment`)
- [ ] Form displays correctly
- [ ] All form fields visible
- [ ] Form validation works
- [ ] Payment method selector works
- [ ] Card payment redirects correctly
- [ ] Crypto payment creates invoice
- [ ] Error messages display correctly
- [ ] Success messages display correctly

#### Test: Charter Page (`/charter`)
- [ ] Page displays correctly
- [ ] Donation amount displays when URL parameter present
- [ ] Checkout button appears
- [ ] Redirects to payment page correctly

---

### 5. Payment Flow Testing

#### Test: Card Payment Flow
1. [ ] Visit `/payment` page
2. [ ] Fill out Mission Support form
3. [ ] Select card payment method
4. [ ] Submit form
5. [ ] Verify redirect to Charter page
6. [ ] Verify donation amount displayed
7. [ ] Click checkout button
8. [ ] Verify redirect to payment page
9. [ ] Complete test payment ($1)
10. [ ] Verify database record created
11. [ ] Verify receipt email sent
12. [ ] Verify contribution intent status updated

#### Test: Crypto Payment Flow
1. [ ] Visit `/payment` page
2. [ ] Fill out Mission Support form
3. [ ] Select crypto payment method
4. [ ] Submit form
5. [ ] Verify NOWPayments invoice created
6. [ ] Verify redirect to NOWPayments invoice page
7. [ ] Verify invoice displays correctly
8. [ ] Complete test crypto payment ($1)
9. [ ] Verify webhook received
10. [ ] Verify database record updated
11. [ ] Verify receipt email sent
12. [ ] Verify contribution intent status updated

---

### 6. Webhook Testing

#### Test: NOWPayments Webhook
- [ ] Webhook endpoint accessible: `/_functions/webhooks/nowpayments`
- [ ] Webhook signature verification works
- [ ] Webhook processes `invoice_paid` event
- [ ] Webhook processes `invoice_paid_unconfirmed` event
- [ ] Webhook processes `invoice_expired` event
- [ ] Webhook processes `invoice_waiting` event
- [ ] Webhook processes `invoice_partial` event
- [ ] Webhook updates database correctly
- [ ] Webhook logs events correctly

---

### 7. Email Testing

#### Test: Receipt Email
- [ ] Receipt email sent after card payment
- [ ] Receipt email sent after crypto payment
- [ ] Email contains correct donation amount
- [ ] Email contains correct donor information
- [ ] Email formatting correct
- [ ] Email delivered successfully

#### Test: KYC Email
- [ ] KYC email sent when threshold exceeded
- [ ] Email contains KYC verification link
- [ ] Email formatting correct
- [ ] Email delivered successfully

---

## 🐛 Troubleshooting

### Backend Functions Not Working

**Symptoms:**
- Functions return errors
- Functions not accessible from frontend

**Solutions:**
1. Check function names match exactly
2. Verify function exports are correct
3. Check for syntax errors in Wix Editor
4. Verify Dev Mode is enabled
5. Check function permissions

### Secrets Not Accessible

**Symptoms:**
- Secret retrieval fails
- Secrets return undefined

**Solutions:**
1. Verify secret names match exactly (case-sensitive)
2. Check secrets are saved in Secrets Manager
3. Verify secret values are not empty
4. Check secret permissions

### Database Connection Fails

**Symptoms:**
- Database queries fail
- Tables not found

**Solutions:**
1. Verify database migration completed
2. Check table/collection names match
3. Verify database credentials
4. Check database permissions
5. Verify external database endpoint is accessible

### Webhook Not Received

**Symptoms:**
- Webhooks not processing
- Webhook signature verification fails

**Solutions:**
1. Verify webhook URL is correct
2. Check IPN secret matches
3. Verify webhook events enabled in NOWPayments dashboard
4. Check webhook logs in database
5. Verify webhook endpoint is accessible

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Backend Functions
- [ ] getLatestDonation: ✅ / ❌
- [ ] saveDonation: ✅ / ❌
- [ ] logContributionIntent: ✅ / ❌
- [ ] logMissionSupportIntent: ✅ / ❌
- [ ] createNowPaymentsInvoice: ✅ / ❌

### Secrets
- [ ] All secrets accessible: ✅ / ❌
- Missing secrets: [list]

### Database
- [ ] Wix Database: ✅ / ❌
- [ ] External Database: ✅ / ❌
- [ ] All tables exist: ✅ / ❌

### Frontend
- [ ] Mission Support form: ✅ / ❌
- [ ] Charter page: ✅ / ❌

### Payment Flows
- [ ] Card payment flow: ✅ / ❌
- [ ] Crypto payment flow: ✅ / ❌

### Webhooks
- [ ] Webhook endpoint: ✅ / ❌
- [ ] Webhook processing: ✅ / ❌

### Email
- [ ] Receipt emails: ✅ / ❌
- [ ] KYC emails: ✅ / ❌

### Overall Status
✅ PASS / ❌ FAIL

### Issues Found
[List any issues]

### Next Steps
[List next steps]
```

---

## 🎯 Success Criteria

All tests must pass before going to production:

- ✅ All backend functions working
- ✅ All secrets accessible
- ✅ Database connection working
- ✅ All tables exist
- ✅ Frontend pages working
- ✅ Card payment flow working
- ✅ Crypto payment flow working
- ✅ Webhooks processing correctly
- ✅ Emails sending correctly

---

**Status:** Ready for Testing  
**Next Action:** Upload test scripts and run tests





