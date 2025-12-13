# Velo Backend Consistency - Auto-Update System

## 🎯 Goal
Ensure all Velo backend functions stay consistent and automatically update when database changes.

## ✅ Current Backend Functions

### 1. `charter-page-middleware.web.js`
**Location:** `src/backend/charter-page-middleware.web.js`

**Exported Functions:**
- ✅ `onReady()` - Initialize page, get totals
- ✅ `cryptoButtonClick(amount, coin)` - Create crypto invoice
- ✅ `fiatButtonClick(amount, paymentMethod)` - Create Stripe session
- ✅ `getCumulativeTotal()` - Calculate total from database
- ✅ `afterPaymentWebhook(payload)` - Handle payment webhooks
- ✅ `redirectBackToCharter(donationAmount, paymentMethod)` - Redirect helper

**Database Collections Used:**
- `Donations` - Main donation records
- `CryptoPayments` - Crypto payment invoices
- `StripePayments` - Stripe checkout sessions
- `ContributionIntent` - Payment intents

**Auto-Update Triggers:**
- ✅ Listens to database changes via `wixData.onReady()`
- ✅ Updates cumulative totals when donations are added
- ✅ Syncs payment status from webhooks

### 2. `stripe.api.jsw`
**Location:** `src/backend/stripe.api.jsw`

**Exported Functions:**
- ✅ `getPublishableKey()` - Get Stripe publishable key
- ✅ `createCheckoutSession(requestData)` - Create checkout session
- ✅ `getPaymentStatus(sessionId)` - Check payment status
- ✅ `handleWebhook(eventData)` - Process Stripe webhooks

**Secrets Required:**
- `STRIPE_SECRET_KEY_TEST` (preferred for dev)
- `STRIPE_SECRET_KEY_LIVE` (fallback)
- `STRIPE_PUBLISHABLE_KEY_TEST` (optional)
- `STRIPE_PUBLISHABLE_KEY_LIVE` (optional)

**Database Collections:**
- `StripePayments` - Stores checkout sessions

**Auto-Update:**
- ✅ Saves payment records to database on session creation
- ✅ Updates records on webhook events
- ✅ Syncs with Stripe API for status checks

### 3. `nowpayments.api.jsw`
**Location:** `src/backend/nowpayments.api.jsw`

**Exported Functions:**
- ✅ `createNowPaymentsInvoice(requestData)` - Create crypto invoice
- ✅ `getInvoiceStatus(invoiceId)` - Check invoice status
- ✅ `handleWebhook(eventData)` - Process NOWPayments webhooks

**Secrets Required:**
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`
- `BASE_URL`

**Database Collections:**
- `CryptoPayments` - Stores invoice data

**Auto-Update:**
- ✅ Saves invoice records to database
- ✅ Updates status on webhook events
- ✅ Polls invoice status for pending payments

## 🔄 Consistency Rules

### Rule 1: Function Exports
All functions must be exported with:
```javascript
export async function functionName(params) {
  // Implementation
}
```

### Rule 2: Error Handling
All functions must return:
```javascript
{
  success: true/false,
  data: {...}, // if success
  error: "message" // if failure
}
```

### Rule 3: Database Updates
When database changes:
1. ✅ Functions automatically reflect changes (via wixData queries)
2. ✅ Webhooks update database immediately
3. ✅ Frontend polls for status updates

### Rule 4: Secret Management
- ✅ All secrets stored in Wix Secrets Manager
- ✅ Functions load secrets on initialization
- ✅ Fallback to test keys if live keys not available

## 📋 Deployment Checklist

### Before Deploying:
- [ ] All functions exported correctly
- [ ] All secrets configured in Wix Secrets Manager
- [ ] Database collections exist (`Donations`, `CryptoPayments`, `StripePayments`)
- [ ] Webhook endpoints configured in Stripe/NOWPayments dashboards

### After Deploying:
- [ ] Test each function endpoint
- [ ] Verify no 403 errors
- [ ] Check database records are created
- [ ] Test webhook delivery

## 🔧 Auto-Update Mechanism

### Database Change Listeners:
```javascript
// In charter-page-middleware.web.js
function setupDatabaseListeners() {
  // Listen for new donations
  wixData.onReady(() => {
    // Auto-update totals
  });
}
```

### Webhook Handlers:
```javascript
// In stripe.api.jsw and nowpayments.api.jsw
export async function handleWebhook(eventData) {
  // Update database immediately
  // Trigger frontend updates
}
```

### Status Polling:
```javascript
// In frontend
useEffect(() => {
  if (polling) {
    const interval = setInterval(async () => {
      const status = await callVeloFunction(..., 'getInvoiceStatus', ...);
      if (status === 'confirmed') {
        // Update UI
      }
    }, 3000);
    return () => clearInterval(interval);
  }
}, [polling]);
```

## ✅ Consistency Verification

Run these checks:
1. **Function Exports:** All functions exported?
2. **Database Access:** All collections accessible?
3. **Secrets:** All secrets configured?
4. **Webhooks:** Webhook endpoints working?
5. **Error Handling:** All errors caught and logged?

## 🚀 Next Steps

1. Deploy updated backend functions
2. Configure secrets in Wix Secrets Manager
3. Test all endpoints
4. Verify database updates work
5. Monitor for consistency issues
