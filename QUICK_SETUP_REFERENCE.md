# Quick Setup Reference - Copy & Paste Ready

## 🔑 Secrets to Add to Wix Secrets Manager

Go to: **Wix Editor → Settings → Secrets Manager**

### Required Secrets:

```
STRIPE_SECRET_KEY_TEST
```
**Get from:** https://dashboard.stripe.com/test/apikeys (Secret key - starts with `sk_test_...`)

```
STRIPE_PUBLISHABLE_KEY_TEST
```
**Get from:** https://dashboard.stripe.com/test/apikeys (Publishable key - starts with `pk_test_...`)

```
NOWPAYMENTS_API_KEY
```
**Get from:** https://nowpayments.io/dashboard → API Keys (optional, but required for crypto)

---

## 📊 Database Collections - Quick Field List

### Collection 1: Donations

**Fields:**
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

### Collection 2: CryptoPayments

**Fields:**
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

### Collection 3: StripePayments

**Fields:**
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

**Indexes:** `invoice_id` (Unique), `customer_id`, `status`, `created_at`

---

### Collection 4: ContributionIntent

**Fields:**
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

### Collection 5: Members

**Fields:**
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

### Collection 6: PaymentRoutes

**Fields:**
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

## 📋 All Permissions

**For ALL collections:**
- **Read:** Anyone
- **Write:** Site Owner

---

## 🚀 Quick Setup Steps

1. **Add Secrets** (5 minutes)
   - Go to Settings → Secrets Manager
   - Add 3 secrets listed above

2. **Create Collections** (15 minutes)
   - Go to Database → Collections
   - Create 6 collections
   - Add all fields listed above
   - Create indexes
   - Set permissions

3. **Upload Backend Files** (10 minutes)
   - Go to Dev Mode → Backend → Functions
   - Upload 8 backend files
   - Publish site

**Total Time:** ~30 minutes

---

**See detailed guides:**
- `DATABASE_COLLECTIONS_SETUP.md` - Complete field-by-field setup
- `WIX_SECRETS_CONFIGURATION.md` - All secrets with sources
- `WIX_DEPLOYMENT_AUTOMATION.md` - Full deployment guide
