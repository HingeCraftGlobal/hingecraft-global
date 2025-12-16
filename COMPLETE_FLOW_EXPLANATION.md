# Complete Flow Explanation - HingeCraft Global

## 🎯 Overview

This document explains **exactly** how the entire system works from button press to payment completion, including all backend functions, database operations, and API integrations.

---

## 📍 Where Everything Lives

### Frontend Files
- **Mission Support Form:** `public/pages/mission-support-form.html`
- **Charter Page:** `public/pages/charter-page-final.html`

### Backend Files
- **Mission Support Middleware:** `src/backend/mission-support-middleware.jsw` (direct import) and `.web.js` (HTTP endpoint)
- **Charter Page Middleware:** `src/backend/charter-page-middleware.jsw` (direct import) and `.web.js` (HTTP endpoint)
- **Stripe API:** `src/backend/stripe.api.jsw`
- **NOWPayments API:** `src/backend/nowpayments.api.jsw`
- **Webhooks:** `src/backend/webhooks/nowpayments.jsw`

### Database Collections
All in Wix Database:
1. `ContributionIntent` - User intents before payment
2. `Donations` - All completed donations
3. `CryptoPayments` - NOWPayments invoices
4. `StripePayments` - Stripe checkout sessions
5. `Members` - Member registry
6. `PaymentRoutes` - Payment configuration
7. `PageContent` - RAG system content

---

## 🔄 Complete Flow: Button Press → Payment

### Scenario: User Submits Mission Support Form with Card Payment

#### Step 1: User Clicks Button
**Location:** `public/pages/mission-support-form.html`  
**Function:** `handleSubmit(e)` (line ~446)

**What Happens:**
```javascript
1. Form validation runs
2. Form data collected:
   - firstName, lastName, email, address
   - missionSupportName (optional)
   - amount: $10
   - paymentMethod: 'card'
3. Data stored in session storage
4. Backend logging called (non-blocking)
5. Routes to payment flow
```

#### Step 2: Backend Intent Logging (Non-Blocking)
**Endpoint:** `/_functions/logMissionSupportIntent`  
**Backend:** `hingecraft.api.web.jsw` → `logMissionSupportIntent()`

**What Happens:**
```javascript
1. Validates form data server-side
2. Creates record in ContributionIntent:
   {
     _id: "intent_abc123",  // ← This becomes custom invoice ID
     amount_entered: 10,
     first_name: "Test",
     last_name: "User",
     email: "test@example.com",
     address: "123 Test St",
     status: "intent",
     source: "missionSupportForm",
     timestamp: "2025-01-27T..."
   }
3. Returns intentId: "intent_abc123"
```

**Database:** `ContributionIntent` collection

#### Step 3: Redirect to Charter Page
**Endpoint:** `/_functions/mission-support-middleware.web/goToCharterAfterPayment`  
**Backend:** `mission-support-middleware.web.js` → `goToCharterAfterPayment()`

**What Happens:**
```javascript
1. Receives amount: 10
2. Stores in session storage
3. Creates redirect URL:
   "https://hingecraft-global.ai/charter?donationAmount=10&paymentMethod=card&fromMissionSupport=true"
4. Saves to ContributionIntent (if not already saved)
5. Returns redirectUrl
```

**Response:**
```json
{
  "success": true,
  "redirectUrl": "https://hingecraft-global.ai/charter?donationAmount=10&paymentMethod=card&fromMissionSupport=true",
  "amount": 10
}
```

**Frontend Action:**
```javascript
window.location.href = redirectUrl;
// User is redirected to Charter page
```

#### Step 4: Charter Page Loads
**Location:** `public/pages/charter-page-final.html`  
**Function:** `init()` (on page load)

**What Happens:**
```javascript
1. Reads URL parameters:
   - donationAmount: 10
   - paymentMethod: 'card'
   - fromMissionSupport: true
2. Pre-fills amount: $10
3. Selects payment rail: USD_CARD
4. Loads cumulative total from database
5. Displays contributions section
```

#### Step 5: User Clicks Payment Button
**Location:** `public/pages/charter-page-final.html`  
**Function:** `handleGoToPayment(rail, amount)`

**What Happens:**
```javascript
1. Validates amount
2. Checks crypto minimum ($30) if crypto selected
3. Routes based on rail:
   - USD_CARD/USD_ACH → handleStripePayment()
   - CRYPTO → cryptoButtonClick()
```

#### Step 6: Stripe Checkout Creation
**Endpoint:** `/_functions/stripe.api/createCheckoutSession`  
**Backend:** `stripe.api.jsw` → `createCheckoutSession()`

**What Happens:**
```javascript
1. Validates amount: $10
2. Calls Stripe API:
   POST https://api.stripe.com/v1/checkout/sessions
   {
     "payment_method_types": ["card"],
     "line_items": [{
       "price_data": {
         "currency": "usd",
         "unit_amount": 1000  // $10 in cents
       }
     }],
     "mode": "payment",
     "success_url": "https://hingecraft-global.ai/charter?payment=success&session_id={CHECKOUT_SESSION_ID}",
     "cancel_url": "https://hingecraft-global.ai/charter?payment=cancelled",
     "metadata": {
       "donationId": "",
       "source": "charter_page",
       "amount": "10"
     }
   }
3. Stripe returns:
   {
     "id": "cs_test_abc123",  // ← This is our custom invoice ID
     "url": "https://checkout.stripe.com/..."
   }
4. Saves to StripePayments:
   {
     _id: "cs_test_abc123",
     invoice_id: "cs_test_abc123",  // ← Custom invoice ID
     session_id: "cs_test_abc123",
     amount: 10,
     status: "pending",
     payment_method: "card",
     metadata: {
       custom_invoice_id: "cs_test_abc123",
       stripe_session_id: "cs_test_abc123"
     }
   }
5. Returns checkout URL
```

**Custom Invoice ID:** `cs_test_abc123` (Stripe session_id)

**Database:** `StripePayments` collection

#### Step 7: User Completes Payment
**Location:** Stripe Checkout page (external)

**What Happens:**
```javascript
1. User enters card details
2. Clicks "Pay"
3. Stripe processes payment
4. Redirects to success_url:
   "https://hingecraft-global.ai/charter?payment=success&session_id=cs_test_abc123"
```

#### Step 8: Stripe Webhook Processing
**Webhook Endpoint:** Configured in Stripe Dashboard  
**Backend:** `stripe.api.jsw` → `handleWebhook()`

**What Happens:**
```javascript
1. Stripe sends webhook event:
   {
     "type": "checkout.session.completed",
     "data": {
       "object": {
         "id": "cs_test_abc123",
         "amount_total": 1000,
         "payment_status": "paid",
         "customer_email": "test@example.com"
       }
     }
   }
2. Updates StripePayments:
   - status: "completed"
   - payment_status: "paid"
3. Creates Donations record:
   {
     amount: 10,
     payment_status: "completed",
     payment_method: "card",
     transaction_id: "cs_test_abc123",
     source: "charter_page",
     member_email: "test@example.com"
   }
4. Updates cumulative total
```

**Database:** `StripePayments` (updated), `Donations` (new record)

---

## 💰 Custom Invoice ID System

### Stripe Custom Invoice ID

**How It Works:**
1. Stripe creates checkout session
2. Stripe returns `session_id` (e.g., `cs_test_abc123`)
3. We store `session_id` as `invoice_id` in `StripePayments` collection
4. This `invoice_id` is our **custom invoice ID**

**Code Location:**
- `src/backend/stripe.api.jsw` (line ~161)
```javascript
const paymentRecord = {
    _id: session.id,
    invoice_id: session.id,  // ← Custom invoice ID
    session_id: session.id,
    // ...
};
```

**Database Field:** `StripePayments.invoice_id`

### NOWPayments Custom Invoice ID

**How It Works:**
1. User submits Mission Support form
2. Backend creates `ContributionIntent` record
3. `ContributionIntent._id` = `intentId` (e.g., `intent_abc123`)
4. When creating NOWPayments invoice, we use `intentId` as `order_id`
5. This `order_id` is our **custom invoice ID**

**Code Location:**
- `src/backend/nowpayments.api.jsw` (line ~112-113)
```javascript
const intentId = String(requestData.intentId);
const orderId = intentId; // Use intentId as order_id for idempotency
```

**API Call:**
```javascript
POST https://api.nowpayments.io/v1/invoice
{
  "price_amount": 50,
  "price_currency": "usd",
  "order_id": "intent_abc123",  // ← Custom invoice ID
  // ...
}
```

**Database Field:** `CryptoPayments.order_id`

---

## 🔗 URL Connections

### Stripe URLs

**API Base:**
```
https://api.stripe.com/v1
```

**Checkout Session Creation:**
```
POST https://api.stripe.com/v1/checkout/sessions
```

**Success URL:**
```
https://hingecraft-global.ai/charter?payment=success&session_id={CHECKOUT_SESSION_ID}
```

**Cancel URL:**
```
https://hingecraft-global.ai/charter?payment=cancelled
```

**Webhook URL:**
```
Configured in Stripe Dashboard → Webhooks
```

### NOWPayments URLs

**API Base:**
```
https://api.nowpayments.io/v1
```

**Invoice Creation:**
```
POST https://api.nowpayments.io/v1/invoice
```

**IPN Callback (Webhook):**
```
https://hingecraft-global.ai/_functions/webhooks/nowpayments
```

**Success URL:**
```
https://hingecraft-global.ai/charter?payment=success&intent={intentId}&source=crypto
```

**Cancel URL:**
```
https://hingecraft-global.ai/charter?payment=cancelled&intent={intentId}&source=crypto
```

---

## 🗄️ Database Flow

### Mission Support Form Submission

**Collections Updated:**
1. `ContributionIntent` - Intent record created
   - `_id`: `intent_abc123` (becomes custom invoice ID for crypto)
   - `amount_entered`: 10
   - `status`: 'intent'

### Card Payment Flow

**Collections Updated:**
1. `StripePayments` - Checkout session created
   - `invoice_id`: `cs_test_abc123` (custom invoice ID)
   - `status`: 'pending'
2. `StripePayments` - Updated on webhook
   - `status`: 'completed'
3. `Donations` - Created on webhook
   - `amount`: 10
   - `payment_method`: 'card'
   - `transaction_id`: `cs_test_abc123`

### Crypto Payment Flow

**Collections Updated:**
1. `CryptoPayments` - Invoice created
   - `order_id`: `intent_abc123` (custom invoice ID)
   - `invoice_id`: NOWPayments invoice ID
   - `status`: 'waiting'
2. `CryptoPayments` - Updated on webhook
   - `status`: 'confirmed'
3. `Donations` - Created on webhook
   - `amount`: 50
   - `payment_method`: 'crypto'
   - `transaction_id`: NOWPayments invoice_id

---

## 🔍 How to Verify Everything Works

### 1. Check Backend Permissions
```javascript
// In Wix Editor → Backend → mission-support-middleware.web.js
// Permissions tab → Should be "Anyone"
```

### 2. Test Redirect
```javascript
// In browser console
fetch('/_functions/mission-support-middleware.web/goToCharterAfterPayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 10 })
})
.then(r => r.json())
.then(data => console.log(data));
```

**Expected:** `{ success: true, redirectUrl: "..." }`

### 3. Check Database Records

**After Mission Support submission:**
- `ContributionIntent` should have new record

**After Stripe payment:**
- `StripePayments` should have record with `invoice_id`
- `Donations` should have record with `transaction_id`

**After NOWPayments payment:**
- `CryptoPayments` should have record with `order_id`
- `Donations` should have record with `transaction_id`

---

## 🚨 Fixing "Forbidden" Error

**The Problem:**
Backend functions default to "Site Members Only" permission, but Mission Support form is public.

**The Fix:**
1. Wix Editor → Dev Mode → Backend
2. Select `mission-support-middleware.web.js`
3. Permissions → Change to **"Anyone"**
4. Save & Publish

**Verify:**
- No more "forbidden" errors
- Redirect works correctly

---

## 📊 Complete Data Flow Diagram

```
Mission Support Form
    ↓
[User fills form]
    ↓
[handleSubmit()]
    ↓
    ├─→ logMissionSupportIntent()
    │       ↓
    │   [ContributionIntent DB]
    │       ↓
    │   intentId = "intent_abc123"
    │
    └─→ goToCharterAfterPayment()
            ↓
        [Returns redirectUrl]
            ↓
        [window.location.href]
            ↓
    Charter Page
            ↓
    [User clicks payment]
            ↓
    ├─→ Card? → createCheckoutSession()
    │              ↓
    │         [Stripe API]
    │              ↓
    │         session_id = "cs_test_abc123"
    │              ↓
    │         [StripePayments DB]
    │         invoice_id = "cs_test_abc123" ✅
    │              ↓
    │         [Stripe Checkout]
    │              ↓
    │         [Payment Complete]
    │              ↓
    │         [Webhook]
    │              ↓
    │         [Donations DB]
    │
    └─→ Crypto? → createNowPaymentsInvoice()
                   ↓
              [NOWPayments API]
                   ↓
              order_id = "intent_abc123" ✅
                   ↓
              [CryptoPayments DB]
              order_id = "intent_abc123" ✅
                   ↓
              [NOWPayments Payment]
                   ↓
              [Payment Complete]
                   ↓
              [Webhook]
                   ↓
              [Donations DB]
```

---

## ✅ Verification Checklist

- [ ] Backend permissions set to "Anyone"
- [ ] All 7 database collections created
- [ ] All API secrets configured
- [ ] Mission Support form redirects correctly
- [ ] Stripe checkout creates successfully
- [ ] NOWPayments invoice creates successfully
- [ ] Custom invoice IDs stored correctly
- [ ] Webhooks processing correctly
- [ ] Database records created correctly

---

**Last Updated:** 2025-01-27  
**Status:** Complete Flow Documentation
