# Complete HingeCraft Global Project Flow

## 🎯 Overview

This document explains the **complete flow** from button press to payment completion, including all backend functions, database operations, and API integrations.

---

## 📋 Table of Contents

1. [Mission Support Form Flow](#mission-support-form-flow)
2. [Charter Page Flow](#charter-page-flow)
3. [Payment Processing Flow](#payment-processing-flow)
4. [Database Collections](#database-collections)
5. [API Integrations](#api-integrations)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🔄 Mission Support Form Flow

### Step 1: User Fills Form
**Location:** `public/pages/mission-support-form.html`

**User Actions:**
1. Enters personal information (firstName, lastName, email, address)
2. Optionally enters mission support name
3. Selects payment method (Card or Crypto)
4. Selects amount (preset or custom "Other" amount)
5. Clicks "Continue to Charter Page" button

### Step 2: Form Submission (`handleSubmit`)
**Location:** `public/pages/mission-support-form.html` (line ~446)

**Process:**
```javascript
1. Validates all form fields
2. Stores form data in session storage
3. Calls backend to log intent (non-blocking)
4. Routes based on payment method:
   - Crypto → Creates NOWPayments invoice
   - Card → Redirects to Charter page
```

### Step 3: Backend Intent Logging
**Endpoint:** `/_functions/logMissionSupportIntent` (via `hingecraft.api.web.jsw`)

**Function:** `logMissionSupportIntent(requestData)`

**Process:**
```javascript
1. Validates form data server-side
2. Saves to ContributionIntent collection:
   - amount_entered
   - first_name, last_name, email, address
   - mission_support_name
   - session_id, anonymous_fingerprint
   - status: 'intent'
3. Triggers Notion sync (non-blocking)
4. Returns intentId
```

**Database Collection:** `ContributionIntent`

### Step 4A: Crypto Payment Flow
**If paymentMethod === 'crypto':**

**Endpoint:** `/_functions/createNowPaymentsInvoice`

**Backend Function:** `createNowPaymentsInvoice()` in `nowpayments.api.jsw`

**Process:**
```javascript
1. Validates amount ($1-$25,000)
2. Checks for existing invoice (idempotency via order_id)
3. Calls NOWPayments API:
   POST https://api.nowpayments.io/v1/payment
   {
     "price_amount": amount,
     "price_currency": "USD",
     "pay_currency": null, // All supported cryptos
     "order_id": intentId, // Custom invoice ID
     "order_description": "HingeCraft Mission Support",
     "ipn_callback_url": "https://hingecraft-global.ai/_functions/webhooks/nowpayments",
     "success_url": "https://hingecraft-global.ai/charter?payment=success",
     "cancel_url": "https://hingecraft-global.ai/charter?payment=cancelled"
   }
4. Saves to CryptoPayments collection:
   - invoice_id (from NOWPayments)
   - order_id (custom: intentId)
   - price_amount, price_currency
   - pay_address, pay_amount, pay_currency
   - payment_url
   - status: 'waiting'
5. Returns payment_url to frontend
6. Frontend redirects to payment_url
```

**Custom Invoice ID:** Uses `intentId` from `ContributionIntent` as `order_id`

**Database Collection:** `CryptoPayments`

### Step 4B: Card Payment Flow
**If paymentMethod === 'card':**

**Endpoint:** `/_functions/mission-support-middleware.web/goToCharterAfterPayment`

**Backend Function:** `goToCharterAfterPayment(value)` in `mission-support-middleware.web.js`

**Process:**
```javascript
1. Stores donation amount in session storage
2. Saves to ContributionIntent collection:
   - amount_entered
   - status: 'intent'
   - paymentMethod: 'card'
3. Generates redirect URL:
   https://hingecraft-global.ai/charter?donationAmount={amount}&paymentMethod=card&fromMissionSupport=true
4. Returns redirectUrl
5. Frontend redirects using window.location.href
```

**Database Collection:** `ContributionIntent`

---

## 🏛️ Charter Page Flow

### Step 1: Page Load
**Location:** `public/pages/charter-page-final.html`

**Process:**
```javascript
1. Calls backend: /_functions/charter-page-middleware.web/onReady
2. Loads cumulative total from database
3. Checks URL parameters:
   - donationAmount
   - paymentMethod
   - fromMissionSupport
4. Auto-matches tier/years based on amount
5. Pre-selects payment rail based on paymentMethod
```

### Step 2: User Selects Payment Option
**User Actions:**
1. Adjusts amount (if needed)
2. Selects membership tier
3. Selects payment rail:
   - USD_CARD (Stripe Card)
   - USD_ACH (Stripe ACH)
   - CRYPTO (NOWPayments) - only if amount >= $30

### Step 3: Payment Initiation
**Function:** `handleGoToPayment(rail, amount)`

**Process:**
```javascript
1. Validates amount
2. Enforces crypto minimum ($30)
3. Routes based on rail:
   - CRYPTO → Calls cryptoButtonClick()
   - USD_CARD/USD_ACH → Calls handleStripePayment()
```

### Step 4A: Crypto Payment (Charter Page)
**Endpoint:** `/_functions/charter-page-middleware.web/cryptoButtonClick`

**Backend Function:** `cryptoButtonClick(amount, coin)` in `charter-page-middleware.web.js`

**Process:**
```javascript
1. Validates amount >= $30
2. Creates NOWPayments invoice (same as Mission Support)
3. Returns payment_url
4. Frontend redirects to payment_url
```

### Step 4B: Stripe Payment (Charter Page)
**Endpoint:** `/_functions/stripe.api/createCheckoutSession`

**Backend Function:** `createCheckoutSession(requestData)` in `stripe.api.jsw`

**Process:**
```javascript
1. Validates amount
2. Creates Stripe Checkout Session:
   POST https://api.stripe.com/v1/checkout/sessions
   {
     "payment_method_types": ["card", "us_bank_account"], // ACH support
     "mode": "payment",
     "amount": amount * 100, // Convert to cents
     "currency": "usd",
     "success_url": "https://hingecraft-global.ai/charter?payment=success&session_id={CHECKOUT_SESSION_ID}",
     "cancel_url": "https://hingecraft-global.ai/charter?payment=cancelled",
     "metadata": {
       "donation_amount": amount,
       "source": "charter_page"
     }
   }
3. Saves to StripePayments collection:
   - invoice_id (Stripe session ID)
   - customer_id
   - amount, currency
   - status: 'pending'
   - payment_method
4. Returns checkout URL
5. Frontend redirects to Stripe Checkout
```

**Custom Invoice ID:** Stripe automatically generates `session_id` which we use as `invoice_id`

**Database Collection:** `StripePayments`

---

## 💳 Payment Processing Flow

### Stripe Payment Completion

**Webhook:** Stripe sends webhook to configured endpoint

**Process:**
```javascript
1. Stripe webhook received
2. Verifies webhook signature
3. Updates StripePayments collection:
   - status: 'completed'
   - transaction_id
4. Creates record in Donations collection:
   - amount
   - payment_status: 'completed'
   - payment_method: 'card' or 'ach'
   - transaction_id
   - source: 'charter_page'
5. Updates cumulative total
6. Creates/updates Member record (if applicable)
```

**Database Collections:** `StripePayments`, `Donations`, `Members`

### NOWPayments Payment Completion

**Webhook:** `/_functions/webhooks/nowpayments`

**Backend Function:** `handleNowPaymentsWebhook(webhookData)` in `webhooks/nowpayments.jsw`

**Process:**
```javascript
1. Verifies webhook signature (HMAC)
2. Checks payment status:
   - 'waiting' → Waiting for crypto payment
   - 'confirming' → Payment received, waiting confirmations
   - 'confirmed' → Payment confirmed
   - 'sending' → Sending to merchant
   - 'partially_paid' → Partial payment
   - 'finished' → Complete
   - 'failed' → Failed
3. Updates CryptoPayments collection:
   - status: 'confirmed'
   - transaction_hash
   - pay_invoice_id
4. Creates record in Donations collection:
   - amount (from price_amount)
   - payment_status: 'completed'
   - payment_method: 'crypto'
   - transaction_id (from invoice_id)
   - source: 'mission_support' or 'charter_page'
5. Updates cumulative total
6. Creates/updates Member record (if applicable)
```

**Database Collections:** `CryptoPayments`, `Donations`, `Members`

---

## 🗄️ Database Collections

### 1. ContributionIntent
**Purpose:** Track user intents before payment

**Key Fields:**
- `amount_entered` (number)
- `status` (text): 'intent' → 'pending' → 'completed'
- `source` (text): 'missionSupportForm' or 'charter_page'
- `first_name`, `last_name`, `email`, `address`
- `mission_support_name` (optional)
- `session_id`, `anonymous_fingerprint`
- `timestamp` (dateTime)
- `metadata` (object)

**Used By:**
- Mission Support form submission
- Charter page "Other Amount" flow
- Custom invoice ID generation (NOWPayments order_id)

### 2. Donations
**Purpose:** All completed donations (fiat + crypto)

**Key Fields:**
- `amount` (number)
- `currency` (text): 'USD'
- `payment_status` (text): 'completed', 'pending', 'failed'
- `payment_method` (text): 'card', 'ach', 'crypto'
- `transaction_id` (text)
- `source` (text): 'missionSupportForm', 'charter_page'
- `member_email`, `member_name`
- `metadata` (object)

**Used By:**
- Cumulative total calculation
- Member contribution tracking
- Reporting

### 3. CryptoPayments
**Purpose:** NOWPayments invoice tracking

**Key Fields:**
- `invoice_id` (text): NOWPayments invoice ID
- `order_id` (text): **Custom invoice ID** (from ContributionIntent)
- `price_amount` (number): USD amount
- `price_currency` (text): 'USD'
- `pay_amount` (number): Crypto amount
- `pay_currency` (text): 'BTC', 'ETH', 'SOL', etc.
- `pay_address` (text): Crypto address
- `payment_url` (text): NOWPayments payment page
- `status` (text): 'waiting', 'confirming', 'confirmed', 'finished'
- `email`, `first_name`, `last_name`
- `session_id`

**Custom Invoice ID:** `order_id` = `intentId` from `ContributionIntent`

### 4. StripePayments
**Purpose:** Stripe checkout session tracking

**Key Fields:**
- `invoice_id` (text): **Stripe session ID** (custom invoice ID)
- `customer_id` (text): Stripe customer ID
- `amount` (number): USD amount
- `currency` (text): 'USD'
- `status` (text): 'pending', 'completed', 'failed'
- `payment_method` (text): 'card', 'ach'
- `email`, `name`
- `metadata` (object)

**Custom Invoice ID:** `invoice_id` = Stripe `session_id`

### 5. Members
**Purpose:** Member registry

**Key Fields:**
- `email` (text)
- `first_name`, `last_name`
- `membership_tier` (text): 'BASIC', 'PREMIER', 'VIP'
- `membership_years` (number)
- `total_contributed` (number)
- `status` (text)

### 6. PaymentRoutes
**Purpose:** Payment method configuration

**Key Fields:**
- `route_key` (text): 'USD_CARD', 'USD_ACH', 'CRYPTO'
- `payment_method` (text)
- `enabled` (boolean)
- `min_amount` (number)
- `max_amount` (number)
- `config` (object)

### 7. PageContent
**Purpose:** RAG system content index

**Key Fields:**
- `page_url` (text)
- `page_title` (text)
- `content` (text)
- `content_type` (text)
- `indexed_at` (dateTime)

---

## 🔌 API Integrations

### Stripe API

**Base URL:** `https://api.stripe.com/v1`

**Required Secrets:**
- `STRIPE_SECRET_KEY_LIVE` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY_LIVE` - Stripe publishable key (optional, can be derived)

**Key Endpoints Used:**
1. **Create Checkout Session:**
   ```
   POST /checkout/sessions
   ```
   - Creates payment session
   - Returns `session_id` (used as custom invoice ID)
   - Supports card and ACH payments

2. **Webhook Verification:**
   - Verifies webhook signature
   - Processes payment completion events

**Custom Invoice ID:** Stripe `session_id` is stored as `invoice_id` in `StripePayments` collection

**File:** `src/backend/stripe.api.jsw`

### NOWPayments API

**Base URL:** `https://api.nowpayments.io/v1`

**Required Secrets:**
- `NOWPAYMENTS_API_KEY` - API key
- `NOWPAYMENTS_IPN_SECRET` - Webhook secret
- `BASE_URL` - Base URL for webhooks (default: https://hingecraft-global.ai)

**Key Endpoints Used:**
1. **Create Payment:**
   ```
   POST /payment
   ```
   - Creates crypto invoice
   - Uses `order_id` as **custom invoice ID** (from ContributionIntent)
   - Returns `payment_url` and `invoice_id`

2. **Get Payment Status:**
   ```
   GET /payment/{invoice_id}
   ```
   - Checks payment status
   - Used for reconciliation

3. **Webhook Verification:**
   - Verifies HMAC signature
   - Processes payment status updates

**Custom Invoice ID:** `order_id` parameter = `intentId` from `ContributionIntent` collection

**File:** `src/backend/nowpayments.api.jsw`

---

## 🧪 Testing Guide

### Test 1: Mission Support Form - Card Payment

**Steps:**
1. Navigate to: `https://hingecraft-global.ai/missionsupport`
2. Fill form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Address: 123 Test St
   - Mission Support Name: (optional)
   - Payment Method: Card
   - Amount: $10
3. Click "Continue to Charter Page"
4. **Expected:**
   - Redirects to: `https://hingecraft-global.ai/charter?donationAmount=10&paymentMethod=card&fromMissionSupport=true`
   - Charter page loads with amount pre-filled
   - Card payment option selected

**Verify:**
- Check `ContributionIntent` collection:
  - Record created with `amount_entered: 10`
  - `status: 'intent'`
  - `source: 'missionSupportForm'`
  - `paymentMethod: 'card'`

### Test 2: Mission Support Form - Crypto Payment

**Steps:**
1. Navigate to: `https://hingecraft-global.ai/missionsupport`
2. Fill form:
   - Payment Method: Crypto
   - Amount: $50 (must be >= $30)
3. Click "Continue to Charter Page"
4. **Expected:**
   - Creates NOWPayments invoice
   - Redirects to NOWPayments payment page
   - URL contains payment details

**Verify:**
- Check `CryptoPayments` collection:
  - Record created with `price_amount: 50`
  - `status: 'waiting'`
  - `order_id` matches `intentId` from `ContributionIntent`
  - `payment_url` populated

### Test 3: Charter Page - Stripe Card Payment

**Steps:**
1. Navigate to: `https://hingecraft-global.ai/charter`
2. Select amount: $25
3. Select payment rail: USD_CARD
4. Click payment button
5. **Expected:**
   - Creates Stripe checkout session
   - Redirects to Stripe Checkout page
   - Can complete test payment

**Verify:**
- Check `StripePayments` collection:
  - Record created with `amount: 25`
  - `status: 'pending'`
  - `invoice_id` = Stripe `session_id`
  - `payment_method: 'card'`

### Test 4: Charter Page - Crypto Payment

**Steps:**
1. Navigate to: `https://hingecraft-global.ai/charter`
2. Select amount: $100
3. Select payment rail: CRYPTO
4. Click payment button
5. **Expected:**
   - Creates NOWPayments invoice
   - Redirects to NOWPayments payment page

**Verify:**
- Check `CryptoPayments` collection:
  - Record created
  - `order_id` populated (custom invoice ID)

### Test 5: Payment Completion - Stripe

**Steps:**
1. Complete Stripe test payment
2. Wait for webhook (or manually trigger)
3. **Expected:**
   - `StripePayments` status → 'completed'
   - `Donations` record created
   - Cumulative total updated

**Verify:**
- Check `Donations` collection:
  - Record with `payment_status: 'completed'`
  - `payment_method: 'card'`
  - `transaction_id` populated

### Test 6: Payment Completion - NOWPayments

**Steps:**
1. Complete crypto payment on NOWPayments
2. Wait for webhook
3. **Expected:**
   - `CryptoPayments` status → 'confirmed'
   - `Donations` record created
   - Cumulative total updated

**Verify:**
- Check `Donations` collection:
  - Record with `payment_status: 'completed'`
  - `payment_method: 'crypto'`
  - `transaction_id` = `invoice_id`

---

## 🔧 Troubleshooting

### Error: "Forbidden" on Button Press

**Cause:** Backend function permissions not set correctly

**Fix:**
1. Go to Wix Editor → Dev Mode → Backend
2. Select the function (e.g., `mission-support-middleware.web.js`)
3. Click "Permissions"
4. Set to: **Anyone** (for public access)
5. Save and publish

**Alternative:** Check `permissions.json` file:
```json
{
  "web-methods": {
    "*": {
      "*": {
        "siteOwner": {"invoke": true},
        "siteMember": {"invoke": true},
        "anonymous": {"invoke": true}
      }
    }
  }
}
```

### Error: "Collection does not exist"

**Cause:** Database collections not created

**Fix:**
1. Go to Wix Editor → Database → Collections
2. Create all 7 collections (see `DATABASE_SETUP_INSTRUCTIONS.md`)
3. Add all required fields
4. Set permissions

### Error: "API key not found"

**Cause:** Secrets not configured in Wix Secrets Manager

**Fix:**
1. Go to Wix Editor → Settings → Secrets
2. Add required secrets:
   - `STRIPE_SECRET_KEY_LIVE`
   - `STRIPE_PUBLISHABLE_KEY_LIVE`
   - `NOWPAYMENTS_API_KEY`
   - `NOWPAYMENTS_IPN_SECRET`
   - `BASE_URL`

### Error: "Redirect not working"

**Cause:** URL format or CORS issue

**Fix:**
1. Ensure using full production URL: `https://hingecraft-global.ai/charter`
2. Check browser console for errors
3. Verify `window.location.href` is used (not `wixLocation.to`)

### Error: "Custom invoice ID not found"

**Cause:** `ContributionIntent` not created before payment

**Fix:**
1. Verify `logMissionSupportIntent` is called
2. Check `ContributionIntent` collection for record
3. Ensure `intentId` is passed to payment creation

---

## 📊 Flow Diagram

```
Mission Support Form
    ↓
[User fills form]
    ↓
[handleSubmit()]
    ↓
    ├─→ Crypto? → createNowPaymentsInvoice()
    │              ↓
    │         [NOWPayments API]
    │              ↓
    │         [CryptoPayments DB]
    │              ↓
    │         [Redirect to payment_url]
    │
    └─→ Card? → goToCharterAfterPayment()
                 ↓
            [ContributionIntent DB]
                 ↓
            [Redirect to Charter]
                 ↓
         Charter Page
                 ↓
         [User selects payment]
                 ↓
         [handleGoToPayment()]
                 ↓
         ├─→ Crypto? → cryptoButtonClick()
         │              ↓
         │         [NOWPayments API]
         │
         └─→ Card/ACH? → createCheckoutSession()
                          ↓
                     [Stripe API]
                          ↓
                     [StripePayments DB]
                          ↓
                     [Redirect to Stripe]
                          ↓
                     [Payment Complete]
                          ↓
                     [Webhook]
                          ↓
                     [Donations DB]
```

---

## ✅ Verification Checklist

- [ ] All 7 database collections created
- [ ] All backend functions have correct permissions
- [ ] All API secrets configured in Wix Secrets Manager
- [ ] Mission Support form redirects correctly
- [ ] Charter page loads with pre-filled data
- [ ] Stripe checkout session creates successfully
- [ ] NOWPayments invoice creates successfully
- [ ] Custom invoice IDs are generated correctly
- [ ] Webhooks are receiving and processing correctly
- [ ] Database records are created correctly
- [ ] Cumulative totals are calculating correctly

---

**Last Updated:** 2025-01-27  
**Status:** Complete Flow Documentation
