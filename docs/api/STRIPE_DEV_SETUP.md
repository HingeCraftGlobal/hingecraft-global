# Stripe DEV Setup - Test Keys & Custom Invoices ✅

## Status: Complete

**Date:** December 13, 2025  
**Mode:** DEV (TEST keys prioritized)

---

## ✅ Stripe DEV Configuration

### Key Priority (DEV Mode)
1. **TEST Keys** (Prioritized for development)
   - `STRIPE_SECRET_KEY_TEST`
   - `STRIPE_PUBLISHABLE_KEY_TEST`

2. **LIVE Keys** (Fallback for production)
   - `STRIPE_SECRET_KEY_LIVE`
   - `STRIPE_PUBLISHABLE_KEY_LIVE`

### How It Works
- System tries TEST keys first
- If TEST keys not found, falls back to LIVE keys
- Automatically detects mode: `test` or `live`
- All functions work with both modes

---

## 🔧 Wix Secrets Configuration

### For Development (DEV Mode)
Go to: **Settings → Secrets Manager**

Add these secrets:
```
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
```

### For Production (PROD Mode)
Add these secrets:
```
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...
```

**Note:** If both are set, TEST keys are used (DEV mode).

---

## ✅ Available Functions

### 1. Create Checkout Session
**Endpoint:** `/_functions/stripe.api/createCheckoutSession`

**Request:**
```json
{
  "amount": 25.00,
  "email": "donor@example.com",
  "successUrl": "https://www.hingecraft-global.ai/payment-success",
  "cancelUrl": "https://www.hingecraft-global.ai/charter?canceled=true"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "paymentIntent": "pi_test_..."
}
```

### 2. Create Custom Invoice
**Endpoint:** `/_functions/stripe.api/createCustomInvoice`

**Request:**
```json
{
  "amount": 50.00,
  "email": "donor@example.com",
  "description": "Custom donation invoice",
  "customerName": "John Doe",
  "metadata": {
    "donationId": "don_123",
    "source": "mission_support"
  }
}
```

**Response:**
```json
{
  "success": true,
  "invoiceId": "in_test_...",
  "invoiceUrl": "https://invoice.stripe.com/i/acct_...",
  "invoicePdf": "https://pay.stripe.com/invoice/.../pdf",
  "customerId": "cus_test_...",
  "amount": 50.00,
  "status": "open",
  "mode": "test"
}
```

### 3. Get Payment Status
**Endpoint:** `/_functions/stripe.api/getPaymentStatus`

**Request:**
```json
{
  "sessionId": "cs_test_..."
}
```

### 4. Get Publishable Key
**Endpoint:** `/_functions/stripe.api/getPublishableKey`

**Response:**
```json
{
  "success": true,
  "publishableKey": "pk_test_..."
}
```

### 5. Get Stripe Mode
**Endpoint:** `/_functions/stripe.api/getStripeMode`

**Response:**
```json
{
  "success": true,
  "mode": "test",
  "isTestMode": true,
  "isLiveMode": false
}
```

---

## 🧪 Testing with DEV Keys

### Test Card Numbers (Stripe Test Mode)

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**Requires Authentication:**
- Card: `4000 0025 0000 3155`

### Test Invoice Flow

1. **Create Custom Invoice:**
   ```bash
   curl -X POST https://www.hingecraft-global.ai/_functions/stripe.api/createCustomInvoice \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 25.00,
       "email": "test@example.com",
       "description": "Test invoice"
     }'
   ```

2. **Check Invoice:**
   - Invoice URL will be returned
   - Customer receives email (if sent)
   - Invoice PDF available

3. **Pay Invoice:**
   - Use test card: `4242 4242 4242 4242`
   - Complete payment in Stripe hosted invoice page

---

## 📊 Database Storage

### StripePayments Collection
All payments and invoices are stored in `StripePayments` collection:

**Checkout Sessions:**
- `session_id` - Stripe session ID
- `amount` - Amount in USD
- `status` - Payment status
- `payment_method` - "stripe"
- `metadata.stripe_session_id` - Session ID
- `metadata.stripe_payment_intent` - Payment intent ID

**Custom Invoices:**
- `invoice_id` - Stripe invoice ID
- `customer_id` - Stripe customer ID
- `amount` - Amount in USD
- `status` - Invoice status (open, paid, void)
- `invoice_url` - Hosted invoice URL
- `invoice_pdf` - PDF download URL
- `metadata.stripe_invoice_id` - Invoice ID
- `metadata.mode` - "test" or "live"

---

## ✅ Verification Checklist

### DEV Mode Setup
- [x] TEST keys configured in Wix Secrets
- [x] System prioritizes TEST keys
- [x] Mode detection works (`test` or `live`)
- [x] All functions work with TEST keys

### Payment Functions
- [x] `createCheckoutSession` - Works with DEV keys
- [x] `createCustomInvoice` - Works with DEV keys
- [x] `getPaymentStatus` - Works with DEV keys
- [x] `getPublishableKey` - Returns TEST key
- [x] `getStripeMode` - Returns "test"

### Custom Invoice Flow
- [x] Creates customer (or finds existing)
- [x] Creates invoice item
- [x] Creates invoice
- [x] Finalizes invoice
- [x] Sends invoice to customer
- [x] Stores in database
- [x] Returns invoice URL and PDF

### Testing
- [x] Test card numbers work
- [x] Invoice creation works
- [x] Invoice payment works
- [x] Database storage works

---

## 🚀 Quick Start

### 1. Set TEST Keys in Wix Secrets
```
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
```

### 2. Test Checkout Session
```javascript
const response = await fetch('/_functions/stripe.api/createCheckoutSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 25.00,
    email: 'test@example.com'
  })
});
```

### 3. Test Custom Invoice
```javascript
const response = await fetch('/_functions/stripe.api/createCustomInvoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50.00,
    email: 'test@example.com',
    description: 'Test invoice'
  })
});
```

---

## 📝 Notes

- **DEV Mode:** Uses TEST keys (prioritized)
- **PROD Mode:** Uses LIVE keys (fallback)
- **Custom Invoices:** Fully functional with DEV keys
- **Test Cards:** Use Stripe test card numbers
- **Database:** All records stored with mode indicator

---

**Status:** ✅ Complete - Stripe DEV setup ready with custom invoice support





