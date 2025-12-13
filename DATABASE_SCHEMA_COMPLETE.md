# Complete Database Schema - Full System Integration ✅

## Status: Complete

**Date:** December 13, 2025  
**System:** HingeCraft Membership & Payment System

---

## 📊 Database Collections

### 1. StripePayments Collection

**Purpose:** Store all Stripe payment records and instant invoices

**Fields:**
- `invoice_id` (Text) - Stripe invoice ID (e.g., `in_test_...`)
- `customer_id` (Text) - Stripe customer ID (e.g., `cus_test_...`)
- `amount` (Number) - Payment amount in USD
- `currency` (Text) - Currency code (default: "usd")
- `status` (Text) - Invoice status: `open`, `paid`, `void`, `uncollectible`
- `invoice_url` (URL) - Instant payment link (hosted invoice page)
- `invoice_pdf` (URL) - PDF download link
- `email` (Email) - Customer email address
- `payment_method` (Text) - Payment method: `card`, `ACH`
- `created_at` (Date & Time) - Invoice creation timestamp
- `paid_at` (Date & Time) - Payment completion timestamp (optional)
- `metadata` (JSON) - Additional data:
  - `source` - Source of payment (`charter_page_membership`, `mission_support_form`)
  - `tier` - Membership tier (`BASIC`, `PREMIER`, `VIP`)
  - `years` - Membership years (1, 2-20, or null for lifetime)
  - `amount_entered` - Original amount entered
  - `stripe_mode` - Stripe mode (`test` or `live`)
  - `timestamp` - Creation timestamp

**Indexes:**
- `invoice_id` (Unique)
- `customer_id`
- `status`
- `created_at`

---

### 2. ContributionIntent Collection

**Purpose:** Store contribution intents and prefill tokens

**Fields:**
- `amount_entered` (Number) - Amount from form
- `status` (Text) - Status: `intent`, `completed`, `expired`
- `first_name` (Text) - First name
- `last_name` (Text) - Last name
- `email` (Email) - Email address
- `address` (Text) - Address
- `mission_support_name` (Text) - Mission support name (optional)
- `prefill_id` (Text) - Prefill token ID (unique)
- `expires_at` (Date & Time) - Token expiration
- `used` (Boolean) - Whether token has been used
- `used_at` (Date & Time) - When token was used (optional)
- `session_id` (Text) - Session tracking ID
- `anonymous_fingerprint` (Text) - Browser fingerprint
- `timestamp` (Date & Time) - Creation timestamp
- `metadata` (JSON) - Additional data

**Indexes:**
- `prefill_id` (Unique)
- `email`
- `status`
- `expires_at`

---

### 3. Donations Collection

**Purpose:** Store all donation records (fiat payments)

**Fields:**
- `amount` (Number) - Donation amount in USD
- `payment_status` (Text) - Status: `pending`, `completed`, `confirmed`, `failed`
- `payment_method` (Text) - Method: `stripe`, `card`, `ACH`
- `email` (Email) - Donor email
- `transaction_id` (Text) - Stripe transaction ID (optional)
- `invoice_id` (Text) - Stripe invoice ID (optional)
- `created_at` (Date & Time) - Creation timestamp
- `updated_at` (Date & Time) - Last update timestamp
- `metadata` (JSON) - Additional data

**Indexes:**
- `payment_status`
- `email`
- `created_at`

---

### 4. CryptoPayments Collection

**Purpose:** Store all crypto payment records (NOWPayments)

**Fields:**
- `price_amount` (Number) - Payment amount in USD
- `status` (Text) - Status: `pending`, `confirmed`, `failed`, `expired`
- `pay_currency` (Text) - Crypto currency: `BTC`, `ETH`, `SOL`, `XLM`
- `invoice_id` (Text) - NOWPayments invoice ID
- `payment_id` (Text) - NOWPayments payment ID (optional)
- `pay_address` (Text) - Wallet address for payment
- `pay_amount_crypto` (Text) - Amount in crypto currency
- `payment_url` (URL) - NOWPayments payment URL
- `expires_at` (Date & Time) - Invoice expiration
- `created_at` (Date & Time) - Creation timestamp
- `confirmed_at` (Date & Time) - Confirmation timestamp (optional)
- `metadata` (JSON) - Additional data

**Indexes:**
- `invoice_id` (Unique)
- `status`
- `pay_currency`
- `created_at`

---

### 5. Members Collection (NEW - For Membership System)

**Purpose:** Store membership records and entitlements

**Fields:**
- `member_id` (Text) - Unique member ID
- `tier` (Text) - Membership tier: `BASIC`, `PREMIER`, `VIP`
- `amount_paid` (Number) - Amount paid for membership
- `years` (Number) - Membership years (1 for BASIC, 2-20 for PREMIER, null for VIP/lifetime)
- `start_at` (Date & Time) - Membership start date
- `end_at` (Date & Time) - Membership end date (null for lifetime/VIP)
- `status` (Text) - Status: `active`, `expired`, `cancelled`
- `email` (Email) - Member email
- `first_name` (Text) - First name
- `last_name` (Text) - Last name
- `registry_handle` (Text) - Registry handle (optional)
- `payment_id` (Text) - Payment/invoice ID
- `payment_method` (Text) - Payment method used
- `created_at` (Date & Time) - Creation timestamp
- `metadata` (JSON) - Additional data

**Indexes:**
- `member_id` (Unique)
- `email`
- `tier`
- `status`
- `end_at`

---

### 6. PaymentRoutes Collection (NEW - For Dynamic Payment URLs)

**Purpose:** Store payment route configurations from database

**Fields:**
- `route_key` (Text) - Route identifier: `SOL_USDC`, `XLM_USDC`, `BTC_LN`, `CARD`, `ACH`
- `type` (Text) - Payment type: `crypto`, `fiat`
- `provider` (Text) - Provider: `nowpayments`, `stripe`
- `coin` (Text) - Crypto coin (for crypto routes): `solana`, `stellar`, `bitcoin`
- `currency` (Text) - Currency code: `SOL`, `XLM`, `BTC`, `USD`
- `method` (Text) - Payment method (for fiat): `card`, `ACH`
- `wallet_address` (Text) - Wallet address (for crypto, optional)
- `multiplier` (Number) - Fee multiplier (e.g., 1.001, 1.39, 1.05)
- `enabled` (Boolean) - Whether route is enabled
- `created_at` (Date & Time) - Creation timestamp
- `updated_at` (Date & Time) - Last update timestamp
- `metadata` (JSON) - Additional data

**Indexes:**
- `route_key` (Unique)
- `type`
- `enabled`

---

## 🔄 Data Flow

### Membership Payment Flow

```
User selects tier (BASIC/PREMIER/VIP)
    ↓
User selects payment method (SOL_USDC/XLM_USDC/BTC_LN/CARD/ACH)
    ↓
User clicks "Pay" button
    ↓
Backend: fiatButtonClick() or cryptoButtonClick()
    ↓
Stripe: createCustomInvoice() OR NOWPayments: createNowPaymentsInvoice()
    ↓
Invoice created instantly (no email)
    ↓
Invoice stored in StripePayments or CryptoPayments collection
    ↓
Invoice URL returned to frontend
    ↓
User pays via invoice URL
    ↓
Stripe/NOWPayments: Webhook fires (invoice.paid or payment.confirmed)
    ↓
Backend: Update database
    ↓
Members collection: Create membership record
    ↓
Status: Membership activated
```

---

## ✅ Database Setup Instructions

### Step 1: Create Collections in Wix

**Go to:** **Database → Collections**

**Create each collection with the fields listed above.**

### Step 2: Set Field Types

**Important Field Types:**
- `Text` - For IDs, status, methods
- `Number` - For amounts, years, multipliers
- `Email` - For email addresses
- `URL` - For invoice URLs, payment URLs
- `Date & Time` - For timestamps
- `Boolean` - For flags (used, enabled)
- `JSON` - For metadata objects

### Step 3: Create Indexes

**For each collection, create indexes on:**
- Unique fields (invoice_id, member_id, etc.)
- Frequently queried fields (status, email, created_at)
- Foreign key fields (customer_id, payment_id)

### Step 4: Set Permissions

**All Collections:**
- **Read:** Anyone (for public access)
- **Write:** Site Owner only (for security)

---

## 📝 Sample Data

### StripePayments Sample
```json
{
  "invoice_id": "in_test_abc123",
  "customer_id": "cus_test_xyz789",
  "amount": 30,
  "currency": "usd",
  "status": "open",
  "invoice_url": "https://invoice.stripe.com/i/acct_...",
  "invoice_pdf": "https://pay.stripe.com/invoice/.../pdf",
  "email": "member@example.com",
  "payment_method": "card",
  "created_at": "2025-12-13T21:00:00Z",
  "metadata": {
    "source": "charter_page_membership",
    "tier": "VIP",
    "years": null,
    "amount_entered": "30",
    "stripe_mode": "test"
  }
}
```

### Members Sample
```json
{
  "member_id": "mem_abc123",
  "tier": "VIP",
  "amount_paid": 30,
  "years": null,
  "start_at": "2025-12-13T21:00:00Z",
  "end_at": null,
  "status": "active",
  "email": "member@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "registry_handle": "johndoe",
  "payment_id": "in_test_abc123",
  "payment_method": "card",
  "created_at": "2025-12-13T21:00:00Z"
}
```

---

## ✅ Verification Checklist

### Collections Created
- [ ] StripePayments
- [ ] ContributionIntent
- [ ] Donations
- [ ] CryptoPayments
- [ ] Members
- [ ] PaymentRoutes

### Fields Configured
- [ ] All required fields added
- [ ] Field types correct
- [ ] Indexes created
- [ ] Permissions set

### Integration
- [ ] Backend functions can write to collections
- [ ] Frontend can read from collections
- [ ] Webhooks update collections
- [ ] Membership records created on payment

---

**Status:** ✅ Complete - Full database schema ready for deployment
