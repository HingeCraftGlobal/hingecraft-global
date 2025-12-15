# Complete API Keys & Database Configuration Summary

## 🔑 All API Keys Required

### **Stripe API Keys**

**Location in Code:** `src/backend/stripe.api.jsw` (lines 36-55)

**Secrets to Add to Wix:**
1. **STRIPE_SECRET_KEY_TEST**
   - **Source:** https://dashboard.stripe.com/test/apikeys
   - **Format:** `sk_test_51...`
   - **Priority:** First (DEV mode)
   - **Used For:** Creating invoices, processing payments

2. **STRIPE_SECRET_KEY_LIVE**
   - **Source:** https://dashboard.stripe.com/apikeys
   - **Format:** `sk_live_51...`
   - **Priority:** Fallback (PROD mode)
   - **Used For:** Production payments

3. **STRIPE_PUBLISHABLE_KEY_TEST**
   - **Source:** https://dashboard.stripe.com/test/apikeys
   - **Format:** `pk_test_51...`
   - **Priority:** First (DEV mode)
   - **Used For:** Frontend Stripe.js initialization

4. **STRIPE_PUBLISHABLE_KEY_LIVE**
   - **Source:** https://dashboard.stripe.com/apikeys
   - **Format:** `pk_live_51...`
   - **Priority:** Fallback (PROD mode)
   - **Used For:** Production frontend

**Code Retrieval:**
```javascript
// In stripe.api.jsw
STRIPE_SECRET_KEY = await secrets.getSecret('STRIPE_SECRET_KEY_TEST');
STRIPE_PUBLISHABLE_KEY = await secrets.getSecret('STRIPE_PUBLISHABLE_KEY_TEST');
```

---

### **NOWPayments API Keys**

**Location in Code:** `src/backend/nowpayments.api.jsw` (lines 33-34)

**Secrets to Add to Wix:**
1. **NOWPAYMENTS_API_KEY**
   - **Source:** https://nowpayments.io/dashboard → API Keys
   - **Format:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Required:** Yes (for crypto payments)
   - **Used For:** Creating crypto invoices

2. **NOWPAYMENTS_IPN_SECRET**
   - **Source:** https://nowpayments.io/dashboard → Settings → IPN Settings
   - **Format:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Required:** Optional (for webhook verification)
   - **Used For:** Verifying webhook signatures

3. **NOWPAYMENTS_BASE_URL** (Optional)
   - **Default:** `https://api.nowpayments.io/v1`
   - **Used For:** API endpoint override

**Code Retrieval:**
```javascript
// In nowpayments.api.jsw
NOWPAYMENTS_API_KEY = await secrets.getSecret('NOWPAYMENTS_API_KEY');
NOWPAYMENTS_IPN_SECRET = await secrets.getSecret('NOWPAYMENTS_IPN_SECRET');
```

---

### **Email API Keys**

**Location in Code:** `src/backend/email-templates.jsw` (lines 17-18)

**Secrets to Add to Wix:**
1. **SENDGRID_API_KEY**
   - **Source:** https://app.sendgrid.com/settings/api_keys
   - **Format:** `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Required:** Yes (for email notifications)
   - **Used For:** Sending emails to marketingcraft@gmail.com

2. **EMAIL_FROM**
   - **Default:** `no-reply@hingecraft-global.ai`
   - **Or:** `marketingcraft@gmail.com`
   - **Used For:** "From" address in emails

**Code Retrieval:**
```javascript
// In email-templates.jsw
SENDGRID_API_KEY = await secrets.getSecret('SENDGRID_API_KEY');
EMAIL_FROM = await secrets.getSecret('EMAIL_FROM');
```

---

### **Other API Keys**

**Location in Code:** Various backend files

**Secrets to Add to Wix:**
1. **BASE_URL**
   - **Default:** `https://www.hingecraft-global.ai`
   - **Used For:** Building redirect URLs

2. **EXTERNAL_DB_ENDPOINT** (Optional)
   - **Used For:** External database connections
   - **Location:** `nowpayments.api.jsw`, `notion-crm-sync.jsw`

3. **EXTERNAL_DB_SECRET_KEY** (Optional)
   - **Used For:** External database authentication
   - **Location:** `nowpayments.api.jsw`, `notion-crm-sync.jsw`

4. **CRM_API_KEY** (Optional)
   - **Used For:** CRM integration
   - **Location:** `notion-crm-sync.jsw`

5. **NOTION_SYNC_URL** (Optional)
   - **Used For:** Notion synchronization
   - **Location:** `notion-crm-sync.jsw`

6. **KYC_THRESHOLD_USD** (Optional)
   - **Default:** `1000`
   - **Used For:** KYC verification threshold

7. **CRYPTO_CONFIRMATIONS_REQUIRED** (Optional)
   - **Default:** `3`
   - **Used For:** Crypto payment confirmations

---

## 📊 Database Collections - Complete List

### **Collection 1: Donations**

**Fields (9 total):**
- `amount` (Number) - Required
- `payment_status` (Text) - Required
- `payment_method` (Text) - Required
- `email` (Email)
- `transaction_id` (Text)
- `invoice_id` (Text)
- `created_at` (Date & Time) - Required
- `updated_at` (Date & Time)
- `metadata` (JSON)

**Indexes:** `payment_status`, `email`, `created_at`

---

### **Collection 2: CryptoPayments**

**Fields (12 total):**
- `price_amount` (Number) - Required
- `status` (Text) - Required
- `pay_currency` (Text) - Required
- `invoice_id` (Text) - Required, Unique
- `payment_id` (Text)
- `pay_address` (Text) - Required
- `pay_amount_crypto` (Text) - Required
- `payment_url` (URL) - Required
- `expires_at` (Date & Time)
- `created_at` (Date & Time) - Required
- `confirmed_at` (Date & Time)
- `metadata` (JSON)

**Indexes:** `invoice_id` (Unique), `status`, `pay_currency`, `created_at`

---

### **Collection 3: StripePayments**

**Fields (12 total):**
- `invoice_id` (Text) - Required, Unique
- `customer_id` (Text)
- `amount` (Number) - Required
- `currency` (Text) - Required
- `status` (Text) - Required
- `invoice_url` (URL) - Required
- `invoice_pdf` (URL)
- `email` (Email)
- `payment_method` (Text) - Required
- `created_at` (Date & Time) - Required
- `paid_at` (Date & Time)
- `metadata` (JSON)

**Metadata Fields:**
- `source` - `charter_page_membership` or `mission_support_form`
- `tier` - `BASIC`, `PREMIER`, `VIP`
- `years` - 1, 2-20, or null
- `amount_entered` - Original amount
- `stripe_mode` - `test` or `live`
- `timestamp` - Creation timestamp

**Indexes:** `invoice_id` (Unique), `customer_id`, `status`, `created_at`

---

### **Collection 4: ContributionIntent**

**Fields (15 total):**
- `amount_entered` (Number) - Required
- `status` (Text) - Required
- `first_name` (Text)
- `last_name` (Text)
- `email` (Email)
- `address` (Text)
- `mission_support_name` (Text)
- `prefill_id` (Text) - Unique
- `expires_at` (Date & Time)
- `used` (Boolean)
- `used_at` (Date & Time)
- `session_id` (Text)
- `anonymous_fingerprint` (Text)
- `timestamp` (Date & Time) - Required
- `metadata` (JSON)

**Indexes:** `prefill_id` (Unique), `email`, `status`, `expires_at`

---

### **Collection 5: Members**

**Fields (14 total):**
- `member_id` (Text) - Required, Unique
- `tier` (Text) - Required
- `amount_paid` (Number) - Required
- `years` (Number)
- `start_at` (Date & Time) - Required
- `end_at` (Date & Time)
- `status` (Text) - Required
- `email` (Email) - Required
- `first_name` (Text)
- `last_name` (Text)
- `registry_handle` (Text)
- `payment_id` (Text)
- `payment_method` (Text)
- `created_at` (Date & Time) - Required
- `metadata` (JSON)

**Indexes:** `member_id` (Unique), `email`, `tier`, `status`, `end_at`

---

### **Collection 6: PaymentRoutes**

**Fields (12 total):**
- `route_key` (Text) - Required, Unique
- `type` (Text) - Required
- `provider` (Text) - Required
- `coin` (Text)
- `currency` (Text) - Required
- `method` (Text)
- `wallet_address` (Text)
- `multiplier` (Number)
- `enabled` (Boolean) - Required
- `created_at` (Date & Time) - Required
- `updated_at` (Date & Time)
- `metadata` (JSON)

**Indexes:** `route_key` (Unique), `type`, `enabled`

---

## 🔍 How API Keys Are Retrieved

### **Stripe Keys:**
```javascript
// Priority: TEST keys first, then LIVE
STRIPE_SECRET_KEY = await secrets.getSecret('STRIPE_SECRET_KEY_TEST');
// Falls back to: STRIPE_SECRET_KEY_LIVE
```

### **NOWPayments Keys:**
```javascript
NOWPAYMENTS_API_KEY = await secrets.getSecret('NOWPAYMENTS_API_KEY');
NOWPAYMENTS_IPN_SECRET = await secrets.getSecret('NOWPAYMENTS_IPN_SECRET');
```

### **Email Keys:**
```javascript
SENDGRID_API_KEY = await secrets.getSecret('SENDGRID_API_KEY');
EMAIL_FROM = await secrets.getSecret('EMAIL_FROM');
```

---

## 📋 Complete Secrets Checklist

### **Required for Basic Functionality:**
- [ ] `STRIPE_SECRET_KEY_TEST`
- [ ] `STRIPE_PUBLISHABLE_KEY_TEST`

### **Required for Crypto Payments:**
- [ ] `NOWPAYMENTS_API_KEY`

### **Required for Email Notifications:**
- [ ] `SENDGRID_API_KEY`
- [ ] `EMAIL_FROM` (optional, has default)

### **Optional:**
- [ ] `STRIPE_SECRET_KEY_LIVE` (production)
- [ ] `STRIPE_PUBLISHABLE_KEY_LIVE` (production)
- [ ] `NOWPAYMENTS_IPN_SECRET` (webhook verification)
- [ ] `BASE_URL` (has default)
- [ ] `EXTERNAL_DB_ENDPOINT` (external database)
- [ ] `EXTERNAL_DB_SECRET_KEY` (external database)
- [ ] `CRM_API_KEY` (CRM integration)
- [ ] `NOTION_SYNC_URL` (Notion sync)
- [ ] `KYC_THRESHOLD_USD` (default: 1000)
- [ ] `CRYPTO_CONFIRMATIONS_REQUIRED` (default: 3)

---

## 🗄️ Database Collections Checklist

### **Required Collections:**
- [ ] **StripePayments** - For invoice storage
- [ ] **ContributionIntent** - For prefill tokens
- [ ] **Members** - For membership records

### **Optional Collections (Code handles if missing):**
- [ ] **Donations** - For donation tracking
- [ ] **CryptoPayments** - For crypto payment tracking
- [ ] **PaymentRoutes** - For dynamic payment routing

---

## 📝 Quick Setup Order

1. **Add Secrets** (5 minutes)
   - STRIPE_SECRET_KEY_TEST
   - STRIPE_PUBLISHABLE_KEY_TEST
   - NOWPAYMENTS_API_KEY (if using crypto)
   - SENDGRID_API_KEY (if sending emails)

2. **Create Collections** (15 minutes)
   - StripePayments
   - ContributionIntent
   - Members
   - (Optional: Donations, CryptoPayments, PaymentRoutes)

3. **Upload Backend Files** (10 minutes)
   - All .jsw and .web.js files

4. **Publish Site** (2 minutes)

**Total:** ~30 minutes

---

**Last Updated:** December 13, 2025  
**Status:** Complete API and Database reference





