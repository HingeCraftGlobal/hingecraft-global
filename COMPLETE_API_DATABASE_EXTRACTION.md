# Complete API & Database Extraction - All Required Information

## 🔑 ALL API KEYS NEEDED

### **1. Stripe API Keys (REQUIRED)**

#### STRIPE_SECRET_KEY_TEST
- **Where to Get:** https://dashboard.stripe.com/test/apikeys
- **What to Copy:** Secret key (starts with `sk_test_`)
- **Example:** `sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz`
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `STRIPE_SECRET_KEY_TEST`
- **Used In:** `src/backend/stripe.api.jsw` (line 36)

#### STRIPE_PUBLISHABLE_KEY_TEST
- **Where to Get:** https://dashboard.stripe.com/test/apikeys
- **What to Copy:** Publishable key (starts with `pk_test_`)
- **Example:** `pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz`
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `STRIPE_PUBLISHABLE_KEY_TEST`
- **Used In:** `src/backend/stripe.api.jsw` (line 53)

#### STRIPE_SECRET_KEY_LIVE (Optional - Production)
- **Where to Get:** https://dashboard.stripe.com/apikeys
- **What to Copy:** Secret key (starts with `sk_live_`)
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `STRIPE_SECRET_KEY_LIVE`
- **Used In:** `src/backend/stripe.api.jsw` (line 42) - Fallback

#### STRIPE_PUBLISHABLE_KEY_LIVE (Optional - Production)
- **Where to Get:** https://dashboard.stripe.com/apikeys
- **What to Copy:** Publishable key (starts with `pk_live_`)
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `STRIPE_PUBLISHABLE_KEY_LIVE`
- **Used In:** `src/backend/stripe.api.jsw` (line 55) - Fallback

---

### **2. NOWPayments API Keys (REQUIRED for Crypto)**

#### NOWPAYMENTS_API_KEY
- **Where to Get:** https://nowpayments.io/dashboard → API Keys
- **What to Copy:** API Key
- **Format:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `NOWPAYMENTS_API_KEY`
- **Used In:** `src/backend/nowpayments.api.jsw` (line 33)

#### NOWPAYMENTS_IPN_SECRET (Optional)
- **Where to Get:** https://nowpayments.io/dashboard → Settings → IPN Settings
- **What to Copy:** IPN Secret Key
- **Format:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `NOWPAYMENTS_IPN_SECRET`
- **Used In:** `src/backend/nowpayments.api.jsw` (line 34)

---

### **3. Email API Keys (REQUIRED for Email Notifications)**

#### SENDGRID_API_KEY
- **Where to Get:** https://app.sendgrid.com/settings/api_keys
- **Steps:**
  1. Click "Create API Key"
  2. Name it (e.g., "HingeCraft Email")
  3. Select "Full Access" or "Mail Send" permissions
  4. Copy the key (shown only once!)
- **Format:** `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `SENDGRID_API_KEY`
- **Used In:** `src/backend/email-templates.jsw` (line 17)

#### EMAIL_FROM (Optional)
- **Value:** `no-reply@hingecraft-global.ai` or `marketingcraft@gmail.com`
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `EMAIL_FROM`
- **Used In:** `src/backend/email-templates.jsw` (line 18)
- **Default:** `no-reply@hingecraft-global.ai`

---

### **4. Other Secrets (Optional)**

#### BASE_URL
- **Value:** `https://www.hingecraft-global.ai`
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `BASE_URL`
- **Used In:** Multiple backend files
- **Default:** `https://www.hingecraft-global.ai`

#### EXTERNAL_DB_ENDPOINT (Optional)
- **Used For:** External database connections
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `EXTERNAL_DB_ENDPOINT`
- **Used In:** `nowpayments.api.jsw`, `notion-crm-sync.jsw`

#### EXTERNAL_DB_SECRET_KEY (Optional)
- **Used For:** External database authentication
- **Add to Wix:** Settings → Secrets Manager → Add Secret
- **Name:** `EXTERNAL_DB_SECRET_KEY`
- **Used In:** `nowpayments.api.jsw`, `notion-crm-sync.jsw`, `hingecraft.api.web.jsw`

---

## 📊 ALL DATABASE COLLECTIONS

### **Collection 1: Donations**

**Create in Wix:** Database → Collections → Add Collection

**Collection Name:** `Donations`

**Fields to Add:**
1. `amount` - Type: **Number** - Required: Yes
2. `payment_status` - Type: **Text** - Required: Yes
3. `payment_method` - Type: **Text** - Required: Yes
4. `email` - Type: **Email** - Required: No
5. `transaction_id` - Type: **Text** - Required: No
6. `invoice_id` - Type: **Text** - Required: No
7. `created_at` - Type: **Date & Time** - Required: Yes
8. `updated_at` - Type: **Date & Time** - Required: No
9. `metadata` - Type: **JSON** - Required: No

**Indexes to Create:**
- `payment_status`
- `email`
- `created_at`

**Permissions:**
- Read: **Anyone**
- Write: **Site Owner**

---

### **Collection 2: CryptoPayments**

**Create in Wix:** Database → Collections → Add Collection

**Collection Name:** `CryptoPayments`

**Fields to Add:**
1. `price_amount` - Type: **Number** - Required: Yes
2. `status` - Type: **Text** - Required: Yes
3. `pay_currency` - Type: **Text** - Required: Yes
4. `invoice_id` - Type: **Text** - Required: Yes, **Unique**
5. `payment_id` - Type: **Text** - Required: No
6. `pay_address` - Type: **Text** - Required: Yes
7. `pay_amount_crypto` - Type: **Text** - Required: Yes
8. `payment_url` - Type: **URL** - Required: Yes
9. `expires_at` - Type: **Date & Time** - Required: No
10. `created_at` - Type: **Date & Time** - Required: Yes
11. `confirmed_at` - Type: **Date & Time** - Required: No
12. `metadata` - Type: **JSON** - Required: No

**Indexes to Create:**
- `invoice_id` (Unique)
- `status`
- `pay_currency`
- `created_at`

**Permissions:**
- Read: **Anyone**
- Write: **Site Owner**

---

### **Collection 3: StripePayments**

**Create in Wix:** Database → Collections → Add Collection

**Collection Name:** `StripePayments`

**Fields to Add:**
1. `invoice_id` - Type: **Text** - Required: Yes, **Unique**
2. `customer_id` - Type: **Text** - Required: No
3. `amount` - Type: **Number** - Required: Yes
4. `currency` - Type: **Text** - Required: Yes
5. `status` - Type: **Text** - Required: Yes
6. `invoice_url` - Type: **URL** - Required: Yes
7. `invoice_pdf` - Type: **URL** - Required: No
8. `email` - Type: **Email** - Required: No
9. `payment_method` - Type: **Text** - Required: Yes
10. `created_at` - Type: **Date & Time** - Required: Yes
11. `paid_at` - Type: **Date & Time** - Required: No
12. `metadata` - Type: **JSON** - Required: No

**Indexes to Create:**
- `invoice_id` (Unique)
- `customer_id`
- `status`
- `created_at`

**Permissions:**
- Read: **Anyone**
- Write: **Site Owner**

---

### **Collection 4: ContributionIntent**

**Create in Wix:** Database → Collections → Add Collection

**Collection Name:** `ContributionIntent`

**Fields to Add:**
1. `amount_entered` - Type: **Number** - Required: Yes
2. `status` - Type: **Text** - Required: Yes
3. `first_name` - Type: **Text** - Required: No
4. `last_name` - Type: **Text** - Required: No
5. `email` - Type: **Email** - Required: No
6. `address` - Type: **Text** - Required: No
7. `mission_support_name` - Type: **Text** - Required: No
8. `prefill_id` - Type: **Text** - Required: No, **Unique**
9. `expires_at` - Type: **Date & Time** - Required: No
10. `used` - Type: **Boolean** - Required: No
11. `used_at` - Type: **Date & Time** - Required: No
12. `session_id` - Type: **Text** - Required: No
13. `anonymous_fingerprint` - Type: **Text** - Required: No
14. `timestamp` - Type: **Date & Time** - Required: Yes
15. `metadata` - Type: **JSON** - Required: No

**Indexes to Create:**
- `prefill_id` (Unique)
- `email`
- `status`
- `expires_at`

**Permissions:**
- Read: **Anyone**
- Write: **Site Owner**

---

### **Collection 5: Members**

**Create in Wix:** Database → Collections → Add Collection

**Collection Name:** `Members`

**Fields to Add:**
1. `member_id` - Type: **Text** - Required: Yes, **Unique**
2. `tier` - Type: **Text** - Required: Yes
3. `amount_paid` - Type: **Number** - Required: Yes
4. `years` - Type: **Number** - Required: No
5. `start_at` - Type: **Date & Time** - Required: Yes
6. `end_at` - Type: **Date & Time** - Required: No
7. `status` - Type: **Text** - Required: Yes
8. `email` - Type: **Email** - Required: Yes
9. `first_name` - Type: **Text** - Required: No
10. `last_name` - Type: **Text** - Required: No
11. `registry_handle` - Type: **Text** - Required: No
12. `payment_id` - Type: **Text** - Required: No
13. `payment_method` - Type: **Text** - Required: No
14. `created_at` - Type: **Date & Time** - Required: Yes
15. `metadata` - Type: **JSON** - Required: No

**Indexes to Create:**
- `member_id` (Unique)
- `email`
- `tier`
- `status`
- `end_at`

**Permissions:**
- Read: **Anyone**
- Write: **Site Owner**

---

### **Collection 6: PaymentRoutes**

**Create in Wix:** Database → Collections → Add Collection

**Collection Name:** `PaymentRoutes`

**Fields to Add:**
1. `route_key` - Type: **Text** - Required: Yes, **Unique**
2. `type` - Type: **Text** - Required: Yes
3. `provider` - Type: **Text** - Required: Yes
4. `coin` - Type: **Text** - Required: No
5. `currency` - Type: **Text** - Required: Yes
6. `method` - Type: **Text** - Required: No
7. `wallet_address` - Type: **Text** - Required: No
8. `multiplier` - Type: **Number** - Required: No
9. `enabled` - Type: **Boolean** - Required: Yes
10. `created_at` - Type: **Date & Time** - Required: Yes
11. `updated_at` - Type: **Date & Time** - Required: No
12. `metadata` - Type: **JSON** - Required: No

**Indexes to Create:**
- `route_key` (Unique)
- `type`
- `enabled`

**Permissions:**
- Read: **Anyone**
- Write: **Site Owner**

---

## 🔄 How Data Flows Through Database

### **Payment Flow:**
```
User Payment
  ↓
StripePayments/CryptoPayments (invoice created)
  ↓
Webhook fires (invoice.paid / payment.confirmed)
  ↓
Donations (payment record)
  ↓
Members (if membership payment)
```

### **Mission Support Flow:**
```
Form Submission
  ↓
ContributionIntent (intent created)
  ↓
Redirect to Charter
  ↓
Prefill token used
  ↓
Payment created
  ↓
StripePayments/CryptoPayments
```

---

## 📝 Complete Setup Checklist

### **Step 1: Add Secrets (5 minutes)**
- [ ] STRIPE_SECRET_KEY_TEST
- [ ] STRIPE_PUBLISHABLE_KEY_TEST
- [ ] NOWPAYMENTS_API_KEY
- [ ] SENDGRID_API_KEY
- [ ] EMAIL_FROM (optional)

### **Step 2: Create Collections (15 minutes)**
- [ ] Donations (9 fields)
- [ ] CryptoPayments (12 fields)
- [ ] StripePayments (12 fields)
- [ ] ContributionIntent (15 fields)
- [ ] Members (15 fields)
- [ ] PaymentRoutes (12 fields)

### **Step 3: Upload Backend Files (10 minutes)**
- [ ] charter-page-middleware.jsw
- [ ] charter-page-middleware.web.js
- [ ] mission-support-middleware.jsw
- [ ] mission-support-middleware.web.js
- [ ] stripe.api.jsw
- [ ] nowpayments.api.jsw
- [ ] email-templates.jsw
- [ ] hingecraft.api.web.jsw

### **Step 4: Publish Site (2 minutes)**
- [ ] Publish to Test Site or Live Site

---

**Total Setup Time:** ~30 minutes

---

**Last Updated:** December 13, 2025  
**Status:** Complete extraction of all API keys and database requirements
