# Complete Database Application Guide

## 🎯 Overview

This guide ensures all database collections are created correctly in Wix and all data flows properly from frontend → backend → database.

---

## 📋 Required Database Collections

### Collection 1: ContributionIntent
**Purpose:** Middleware - Stores initial form data and links to payment records

**Fields:**
- `_id` (text) - Auto-generated, becomes intentId
- `_createdDate` (dateTime) - Auto-generated
- `_updatedDate` (dateTime) - Auto-generated
- `_owner` (text) - Auto-generated
- `donationAmount` (number) - Decimal amount
- `paymentMethod` (text) - 'card' or 'crypto'
- `intentStatus` (text) - 'pending', 'paid', 'cancelled'
- `name` (text) - Full name
- `email` (text) - Email address
- `phone` (text) - Phone number
- `first_name` (text) - First name
- `last_name` (text) - Last name
- `address` (text) - Address
- `mission_support_name` (text) - Optional dedication
- `isSubscription` (boolean) - Subscription vs one-time
- `session_id` (text) - Session tracking
- `anonymous_fingerprint` (text) - Anonymous tracking
- `source` (text) - 'missionSupportForm' or 'charter_page'
- `timestamp` (dateTime) - Creation timestamp
- `wix_user_id` (text) - User ID if logged in
- `metadata` (object) - Additional data

**Permissions:** Read: Anyone, Write: Site Members

---

### Collection 2: StripePayments
**Purpose:** Logs all Stripe transactions

**Fields:**
- `_id` (text) - Auto-generated
- `_createdDate` (dateTime) - Auto-generated
- `_updatedDate` (dateTime) - Auto-generated
- `_owner` (text) - Auto-generated
- `intentId` (text) - Reference to ContributionIntent._id
- `invoice_id` (text) - **CUSTOM INVOICE ID** = Stripe session_id
- `session_id` (text) - Stripe session_id
- `customer_id` (text) - Stripe customer ID
- `amount` (number) - USD amount
- `currency` (text) - 'usd'
- `status` (text) - 'pending', 'complete', 'expired'
- `payment_method` (text) - 'card', 'ach'
- `email` (text) - Customer email
- `name` (text) - Customer name
- `is_subscription` (boolean) - Subscription flag
- `metadata` (object) - Stripe-specific data

**Permissions:** Read: Anyone, Write: Site Members

**Custom Invoice ID:** `invoice_id` = Stripe `session_id`

---

### Collection 3: CryptoPayments
**Purpose:** Logs all NOWPayments transactions

**Fields:**
- `_id` (text) - Auto-generated
- `_createdDate` (dateTime) - Auto-generated
- `_updatedDate` (dateTime) - Auto-generated
- `_owner` (text) - Auto-generated
- `intent_id` (text) - Reference to ContributionIntent._id
- `order_id` (text) - **CUSTOM INVOICE ID** = intentId from ContributionIntent
- `invoice_id` (text) - NOWPayments invoice ID
- `payment_id` (text) - NOWPayments payment ID
- `price_amount` (number) - USD amount
- `price_currency` (text) - 'usd'
- `pay_amount` (number) - Crypto amount
- `pay_currency` (text) - 'BTC', 'ETH', 'SOL', etc.
- `pay_address` (text) - Crypto address
- `payment_url` (text) - NOWPayments payment page
- `status` (text) - 'waiting', 'confirming', 'confirmed', 'finished'
- `nowpayments_status` (text) - Raw NOWPayments status
- `email` (text) - Customer email
- `first_name` (text) - First name
- `last_name` (text) - Last name
- `mission_support_name` (text) - Optional dedication
- `session_id` (text) - Session tracking
- `invoice_created_at` (dateTime) - Invoice creation time
- `invoice_expires_at` (dateTime) - Invoice expiration
- `metadata` (object) - Additional data
- `raw_response` (object) - Full NOWPayments response

**Permissions:** Read: Anyone, Write: Site Members

**Custom Invoice ID:** `order_id` = `intentId` from `ContributionIntent`

---

### Collection 4: Donations
**Purpose:** Final record - Source of truth for all successful contributions

**Fields:**
- `_id` (text) - Auto-generated
- `_createdDate` (dateTime) - Auto-generated
- `_updatedDate` (dateTime) - Auto-generated
- `_owner` (text) - Auto-generated
- `intentId` (text) - Reference to ContributionIntent._id
- `paymentType` (text) - 'card' or 'crypto'
- `amount` (number) - Final confirmed amount
- `currency` (text) - 'USD'
- `datePaid` (dateTime) - Payment completion timestamp
- `isSubscription` (boolean) - **CRITICAL SPLIT** - true for membership, false for donation
- `transaction_id` (text) - Stripe session_id or NOWPayments invoice_id
- `payment_status` (text) - 'completed', 'pending', 'failed'
- `payment_method` (text) - 'card', 'ach', 'crypto'
- `source` (text) - 'missionSupportForm', 'charter_page'
- `is_other_amount` (boolean) - Custom amount flag
- `member_email` (text) - Member email
- `member_name` (text) - Member name
- `wix_user_id` (text) - User ID if logged in
- `metadata` (object) - Payment gateway references

**Permissions:** Read: Anyone, Write: Site Members

---

### Collection 5: Members
**Purpose:** Member registry

**Fields:**
- `_id` (text) - Auto-generated
- `_createdDate` (dateTime) - Auto-generated
- `_updatedDate` (dateTime) - Auto-generated
- `_owner` (text) - Auto-generated
- `email` (text) - Member email
- `first_name` (text) - First name
- `last_name` (text) - Last name
- `membership_tier` (text) - 'BASIC', 'PREMIER', 'VIP'
- `membership_years` (number) - Years of membership
- `total_contributed` (number) - Total contributions
- `status` (text) - 'active', 'inactive', 'cancelled'
- `wix_user_id` (text) - User ID if logged in
- `metadata` (object) - Additional data

**Permissions:** Read: Site Members, Write: Site Members

---

### Collection 6: PaymentRoutes
**Purpose:** Payment method configuration

**Fields:**
- `_id` (text) - Auto-generated
- `_createdDate` (dateTime) - Auto-generated
- `_updatedDate` (dateTime) - Auto-generated
- `_owner` (text) - Auto-generated
- `route_key` (text) - 'USD_CARD', 'USD_ACH', 'CRYPTO'
- `payment_method` (text) - Payment method name
- `enabled` (boolean) - Route enabled flag
- `min_amount` (number) - Minimum amount
- `max_amount` (number) - Maximum amount
- `config` (object) - Route configuration

**Permissions:** Read: Anyone, Write: Site Members

---

### Collection 7: PageContent
**Purpose:** RAG system content index

**Fields:**
- `_id` (text) - Auto-generated
- `_createdDate` (dateTime) - Auto-generated
- `_updatedDate` (dateTime) - Auto-generated
- `_owner` (text) - Auto-generated
- `page_url` (text) - Page URL
- `page_title` (text) - Page title
- `content` (text) - Page content
- `content_type` (text) - Content type
- `indexed_at` (dateTime) - Index timestamp
- `metadata` (object) - Additional data

**Permissions:** Read: Anyone, Write: Site Members

---

## 🔧 How to Create Collections in Wix

### Method 1: Wix Editor (Recommended)

1. **Open Wix Editor:**
   - Go to https://editor.wix.com
   - Open your site
   - Click **Database** in left sidebar

2. **Create Each Collection:**
   - Click **+ Add Collection**
   - Name it exactly as shown above
   - Click **Add Field** for each field
   - Set field type exactly as specified
   - Set field as required if needed

3. **Set Permissions:**
   - Click **Permissions** tab
   - Set Read/Write permissions as specified
   - Save

4. **Repeat for All 7 Collections**

### Method 2: Wix CLI (If Available)

```bash
# Create ContributionIntent
wix data collections create \
  --name "ContributionIntent" \
  --fields "donationAmount:number,paymentMethod:text,intentStatus:text,..."

# Repeat for all collections
```

---

## 🔗 Data Flow Verification

### Flow 1: Mission Support → Card Payment

**Step 1: Form Submission**
- User fills form → clicks button
- Frontend calls: `goToCharterAfterPayment()`

**Step 2: ContributionIntent Created**
- Backend creates record in `ContributionIntent`
- `_id` = `intentId` (e.g., `"abc123"`)
- `donationAmount` = 10
- `paymentMethod` = 'card'
- `intentStatus` = 'pending'

**Step 3: Redirect to Charter**
- URL: `https://hingecraft-global.ai/charter?intentId=abc123&donationAmount=10&paymentMethod=card`

**Step 4: Stripe Checkout Created**
- Backend calls: `createCheckoutSession()`
- Stripe returns: `session_id` = `"cs_test_xyz789"`
- Backend saves to `StripePayments`:
  - `intentId` = `"abc123"`
  - `invoice_id` = `"cs_test_xyz789"` ← **CUSTOM INVOICE ID**
  - `session_id` = `"cs_test_xyz789"`

**Step 5: Payment Complete**
- Stripe webhook → `webhooks/stripe.jsw`
- Updates `StripePayments` status → 'complete'
- Creates `Donations` record:
  - `intentId` = `"abc123"`
  - `transaction_id` = `"cs_test_xyz789"`
  - `amount` = 10
- Updates `ContributionIntent` status → 'paid'

---

### Flow 2: Mission Support → Crypto Payment

**Step 1: Form Submission**
- User selects Crypto, amount $50
- Frontend calls: `createNowPaymentsInvoice()`

**Step 2: ContributionIntent Created**
- Backend creates record in `ContributionIntent`
- `_id` = `intentId` (e.g., `"def456"`)
- `donationAmount` = 50
- `paymentMethod` = 'crypto'

**Step 3: NOWPayments Invoice Created**
- Backend calls NOWPayments API:
  ```json
  {
    "price_amount": 50,
    "order_id": "def456"  ← CUSTOM INVOICE ID (intentId)
  }
  ```
- NOWPayments returns: `payment_id` = `"np_xyz123"`
- Backend saves to `CryptoPayments`:
  - `intent_id` = `"def456"`
  - `order_id` = `"def456"` ← **CUSTOM INVOICE ID**
  - `invoice_id` = `"np_xyz123"` (NOWPayments ID)

**Step 4: Payment Complete**
- NOWPayments webhook → `webhooks/nowpayments.jsw`
- Webhook contains: `order_id` = `"def456"`
- Updates `CryptoPayments` status → 'confirmed'
- Creates `Donations` record:
  - `intentId` = `"def456"`
  - `transaction_id` = `"np_xyz123"`
  - `amount` = 50
- Updates `ContributionIntent` status → 'paid'

---

## ✅ Verification Checklist

### Database Collections
- [ ] All 7 collections created
- [ ] All fields added with correct types
- [ ] Permissions set correctly
- [ ] Collections accessible from backend

### Custom Invoice IDs
- [ ] Stripe: `session_id` → `invoice_id` in `StripePayments` ✅
- [ ] NOWPayments: `intentId` → `order_id` in `CryptoPayments` ✅
- [ ] Both tracked correctly in database ✅

### Data Flow
- [ ] Mission Support form creates `ContributionIntent` ✅
- [ ] `intentId` passed to Charter page ✅
- [ ] Stripe checkout uses `intentId` as `client_reference_id` ✅
- [ ] NOWPayments invoice uses `intentId` as `order_id` ✅
- [ ] Webhooks update all collections correctly ✅

### API Connections
- [ ] Stripe API keys configured
- [ ] NOWPayments API keys configured
- [ ] Webhook secrets configured
- [ ] Webhook URLs set correctly

---

## 🧪 Test Data Flow

### Test 1: Create ContributionIntent

```javascript
// In Wix Velo backend
import wixData from 'wix-data';

const testIntent = await wixData.save('ContributionIntent', {
    donationAmount: 25,
    paymentMethod: 'card',
    intentStatus: 'pending',
    source: 'missionSupportForm',
    email: 'test@example.com',
    name: 'Test User',
    timestamp: new Date()
});

console.log('Intent ID:', testIntent._id); // This is the custom invoice ID
```

### Test 2: Verify Custom Invoice ID

```javascript
// Check StripePayments
const stripePayments = await wixData.query('StripePayments')
    .eq('intentId', testIntent._id)
    .find();

console.log('Stripe Invoice ID:', stripePayments.items[0]?.invoice_id);

// Check CryptoPayments
const cryptoPayments = await wixData.query('CryptoPayments')
    .eq('order_id', testIntent._id)
    .find();

console.log('NOWPayments Order ID:', cryptoPayments.items[0]?.order_id);
```

---

**Last Updated:** 2025-01-27  
**Status:** Complete Database Application Guide
