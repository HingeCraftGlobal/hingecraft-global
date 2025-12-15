# Database Collections Setup - Complete Field List

## Use this document to create all database collections in Wix

---

## Collection 1: Donations

**Purpose:** Store all donation records (fiat payments)

### Fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `amount` | Number | Yes | Donation amount in USD |
| `payment_status` | Text | Yes | Status: `pending`, `completed`, `confirmed`, `failed` |
| `payment_method` | Text | Yes | Method: `stripe`, `card`, `ACH` |
| `email` | Email | No | Donor email |
| `transaction_id` | Text | No | Stripe transaction ID |
| `invoice_id` | Text | No | Stripe invoice ID |
| `created_at` | Date & Time | Yes | Creation timestamp |
| `updated_at` | Date & Time | No | Last update timestamp |
| `metadata` | JSON | No | Additional data |

### Indexes:
- `payment_status`
- `email`
- `created_at`

### Permissions:
- **Read:** Anyone
- **Write:** Site Owner

---

## Collection 2: CryptoPayments

**Purpose:** Store all crypto payment records (NOWPayments)

### Fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `price_amount` | Number | Yes | Payment amount in USD |
| `status` | Text | Yes | Status: `pending`, `confirmed`, `failed`, `expired` |
| `pay_currency` | Text | Yes | Crypto currency: `BTC`, `ETH`, `SOL`, `XLM` |
| `invoice_id` | Text | Yes | NOWPayments invoice ID (Unique) |
| `payment_id` | Text | No | NOWPayments payment ID |
| `pay_address` | Text | Yes | Wallet address for payment |
| `pay_amount_crypto` | Text | Yes | Amount in crypto currency |
| `payment_url` | URL | Yes | NOWPayments payment URL |
| `expires_at` | Date & Time | No | Invoice expiration |
| `created_at` | Date & Time | Yes | Creation timestamp |
| `confirmed_at` | Date & Time | No | Confirmation timestamp |
| `metadata` | JSON | No | Additional data |

### Indexes:
- `invoice_id` (Unique)
- `status`
- `pay_currency`
- `created_at`

### Permissions:
- **Read:** Anyone
- **Write:** Site Owner

---

## Collection 3: StripePayments

**Purpose:** Store all Stripe payment records and instant invoices

### Fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `invoice_id` | Text | Yes | Stripe invoice ID (Unique) |
| `customer_id` | Text | No | Stripe customer ID |
| `amount` | Number | Yes | Payment amount in USD |
| `currency` | Text | Yes | Currency code (default: "usd") |
| `status` | Text | Yes | Invoice status: `open`, `paid`, `void`, `uncollectible` |
| `invoice_url` | URL | Yes | Instant payment link (hosted invoice page) |
| `invoice_pdf` | URL | No | PDF download link |
| `email` | Email | No | Customer email address |
| `payment_method` | Text | Yes | Payment method: `card`, `ACH` |
| `created_at` | Date & Time | Yes | Invoice creation timestamp |
| `paid_at` | Date & Time | No | Payment completion timestamp |
| `metadata` | JSON | No | Additional data (see below) |

### Metadata Fields (JSON):
- `source` - Source of payment (`charter_page_membership`, `mission_support_form`)
- `tier` - Membership tier (`BASIC`, `PREMIER`, `VIP`)
- `years` - Membership years (1, 2-20, or null for lifetime)
- `amount_entered` - Original amount entered
- `stripe_mode` - Stripe mode (`test` or `live`)
- `timestamp` - Creation timestamp

### Indexes:
- `invoice_id` (Unique)
- `customer_id`
- `status`
- `created_at`

### Permissions:
- **Read:** Anyone
- **Write:** Site Owner

---

## Collection 4: ContributionIntent

**Purpose:** Store contribution intents and prefill tokens

### Fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `amount_entered` | Number | Yes | Amount from form |
| `status` | Text | Yes | Status: `intent`, `completed`, `expired` |
| `first_name` | Text | No | First name |
| `last_name` | Text | No | Last name |
| `email` | Email | No | Email address |
| `address` | Text | No | Address |
| `mission_support_name` | Text | No | Mission support name (optional) |
| `prefill_id` | Text | No | Prefill token ID (unique) |
| `expires_at` | Date & Time | No | Token expiration |
| `used` | Boolean | No | Whether token has been used |
| `used_at` | Date & Time | No | When token was used |
| `session_id` | Text | No | Session tracking ID |
| `anonymous_fingerprint` | Text | No | Browser fingerprint |
| `timestamp` | Date & Time | Yes | Creation timestamp |
| `metadata` | JSON | No | Additional data |

### Indexes:
- `prefill_id` (Unique)
- `email`
- `status`
- `expires_at`

### Permissions:
- **Read:** Anyone
- **Write:** Site Owner

---

## Collection 5: Members

**Purpose:** Store membership records and entitlements

### Fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `member_id` | Text | Yes | Unique member ID (Unique) |
| `tier` | Text | Yes | Membership tier: `BASIC`, `PREMIER`, `VIP` |
| `amount_paid` | Number | Yes | Amount paid for membership |
| `years` | Number | No | Membership years (1 for BASIC, 2-20 for PREMIER, null for VIP/lifetime) |
| `start_at` | Date & Time | Yes | Membership start date |
| `end_at` | Date & Time | No | Membership end date (null for lifetime/VIP) |
| `status` | Text | Yes | Status: `active`, `expired`, `cancelled` |
| `email` | Email | Yes | Member email |
| `first_name` | Text | No | First name |
| `last_name` | Text | No | Last name |
| `registry_handle` | Text | No | Registry handle (optional) |
| `payment_id` | Text | No | Payment/invoice ID |
| `payment_method` | Text | No | Payment method used |
| `created_at` | Date & Time | Yes | Creation timestamp |
| `metadata` | JSON | No | Additional data |

### Indexes:
- `member_id` (Unique)
- `email`
- `tier`
- `status`
- `end_at`

### Permissions:
- **Read:** Anyone
- **Write:** Site Owner

---

## Collection 6: PaymentRoutes

**Purpose:** Store payment route configurations from database

### Fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `route_key` | Text | Yes | Route identifier: `SOL_USDC`, `XLM_USDC`, `BTC_LN`, `CARD`, `ACH` (Unique) |
| `type` | Text | Yes | Payment type: `crypto`, `fiat` |
| `provider` | Text | Yes | Provider: `nowpayments`, `stripe` |
| `coin` | Text | No | Crypto coin (for crypto routes): `solana`, `stellar`, `bitcoin` |
| `currency` | Text | Yes | Currency code: `SOL`, `XLM`, `BTC`, `USD` |
| `method` | Text | No | Payment method (for fiat): `card`, `ACH` |
| `wallet_address` | Text | No | Wallet address (for crypto, optional) |
| `multiplier` | Number | No | Fee multiplier (e.g., 1.001, 1.39, 1.05) |
| `enabled` | Boolean | Yes | Whether route is enabled |
| `created_at` | Date & Time | Yes | Creation timestamp |
| `updated_at` | Date & Time | No | Last update timestamp |
| `metadata` | JSON | No | Additional data |

### Indexes:
- `route_key` (Unique)
- `type`
- `enabled`

### Permissions:
- **Read:** Anyone
- **Write:** Site Owner

---

## Setup Instructions

### Step-by-Step:

1. **Go to Wix Editor:**
   - Navigate to: https://editor.wix.com
   - Open your site

2. **Access Database:**
   - Click **Database** (left sidebar)
   - Click **Collections**

3. **Create Each Collection:**
   - Click **Add Collection**
   - Enter collection name (exactly as shown above)
   - Click **Create**

4. **Add Fields:**
   - For each field in the table above:
     - Click **Add Field**
     - Enter field name (exactly as shown)
     - Select field type (Number, Text, Email, URL, Date & Time, Boolean, JSON)
     - Mark as required if indicated
     - Click **Save**

5. **Create Indexes:**
   - Click on collection
   - Go to **Indexes** tab
   - For each index listed:
     - Click **Add Index**
     - Select field(s)
     - Mark as unique if indicated
     - Click **Save**

6. **Set Permissions:**
   - Click on collection
   - Go to **Permissions** tab
   - Set **Read:** Anyone
   - Set **Write:** Site Owner
   - Click **Save**

7. **Repeat for All Collections:**
   - Donations
   - CryptoPayments
   - StripePayments
   - ContributionIntent
   - Members
   - PaymentRoutes

---

## Verification

After creating all collections:

1. **Check Collection Count:**
   - Should see 6 collections in Database → Collections

2. **Verify Fields:**
   - Open each collection
   - Verify all fields are present
   - Verify field types are correct

3. **Test Query:**
   - Try querying each collection
   - Should return empty results (no errors)

---

## Sample Data (Optional)

You can add sample data to test:

### StripePayments Sample:
```json
{
  "invoice_id": "in_test_sample123",
  "amount": 30,
  "currency": "usd",
  "status": "open",
  "payment_method": "card",
  "email": "test@example.com",
  "created_at": "2025-12-13T00:00:00Z"
}
```

### Members Sample:
```json
{
  "member_id": "mem_sample123",
  "tier": "VIP",
  "amount_paid": 30,
  "years": null,
  "status": "active",
  "email": "test@example.com",
  "start_at": "2025-12-13T00:00:00Z",
  "end_at": null
}
```

---

**Last Updated:** December 13, 2025  
**Status:** Ready for Wix Database setup





