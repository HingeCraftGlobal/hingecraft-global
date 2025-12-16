# Active Testing Checklist - HingeCraft Global

## 🎯 Current Status: Testing in Progress

**Date:** 2025-01-27  
**Focus:** Fix "forbidden" error and verify complete flow

---

## ✅ Immediate Fixes Applied

### 1. Fixed Redirect URLs
- ✅ Stripe success/cancel URLs: `https://hingecraft-global.ai/charter?...`
- ✅ NOWPayments callback URLs: `https://hingecraft-global.ai/_functions/webhooks/nowpayments`
- ✅ All URLs use production domain

### 2. Enhanced Custom Invoice IDs
- ✅ **Stripe:** `session_id` → `invoice_id` in `StripePayments` collection
- ✅ **NOWPayments:** `intentId` → `order_id` in `CryptoPayments` collection
- ✅ Both stored in database with metadata

### 3. Fixed Backend Permissions
- ✅ `permissions.json` allows anonymous access
- ⚠️ **ACTION REQUIRED:** Set permissions in Wix Editor to "Anyone"

---

## 🔧 Fix "Forbidden" Error - Step by Step

### Step 1: Open Wix Editor
1. Go to: https://editor.wix.com
2. Open your site
3. Click **Dev Mode** (top right)

### Step 2: Fix Backend Permissions
1. Click **Backend** in left sidebar
2. Find `mission-support-middleware.web.js`
3. Click on it
4. Click **Permissions** tab
5. Change from "Site Members Only" to **"Anyone"**
6. Click **Save**
7. Click **Publish** (top right)

### Step 3: Repeat for All Functions
Do the same for:
- `charter-page-middleware.web.js`
- `createNowPaymentsInvoice.jsw` (if it's a web module)
- Any other `.web.js` files

### Step 4: Test
1. Go to Mission Support form
2. Fill form and click button
3. **Expected:** No "forbidden" error, redirects to Charter page

---

## 🧪 Active Testing Procedures

### Test 1: Mission Support → Charter Redirect

**Steps:**
1. Navigate to: `https://hingecraft-global.ai/missionsupport`
2. Fill form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Address: 123 Test St
   - Payment Method: **Card**
   - Amount: $10
3. Click "Continue to Charter Page"
4. **Check Browser Console:**
   ```javascript
   // Should see:
   ✅ Redirecting to: https://hingecraft-global.ai/charter?donationAmount=10&paymentMethod=card&fromMissionSupport=true
   ```

**Expected Results:**
- ✅ No "forbidden" error
- ✅ Redirects to Charter page
- ✅ Amount pre-filled: $10
- ✅ Card payment selected

**Verify Database:**
- Open Wix Editor → Database → `ContributionIntent`
- Should see record with:
  - `amount_entered: 10`
  - `status: 'intent'`
  - `source: 'missionSupportForm'`

---

### Test 2: Stripe Custom Invoice Creation

**Steps:**
1. On Charter page, select amount: $25
2. Select payment rail: **USD_CARD**
3. Click payment button
4. **Check Browser Console:**
   ```javascript
   // Should see:
   ✅ Stripe checkout session created
   ✅ Session ID: cs_test_...
   ```

**Expected Results:**
- ✅ Redirects to Stripe Checkout
- ✅ Checkout shows amount: $25.00

**Verify Database:**
- Open Wix Editor → Database → `StripePayments`
- Should see record with:
  - `invoice_id: "cs_test_..."` (custom invoice ID = session_id)
  - `amount: 25`
  - `status: 'pending'`
  - `payment_method: 'card'`

**Custom Invoice ID Verification:**
- `StripePayments.invoice_id` = Stripe `session_id` ✅

---

### Test 3: NOWPayments Custom Invoice Creation

**Steps:**
1. On Mission Support form:
   - Payment Method: **Crypto**
   - Amount: $50 (>= $30)
2. Click "Continue to Charter Page"
3. **Check Browser Console:**
   ```javascript
   // Should see:
   ✅ NOWPayments invoice created
   ✅ Invoice ID: ...
   ✅ Order ID: ... (custom invoice ID)
   ```

**Expected Results:**
- ✅ Redirects to NOWPayments payment page
- ✅ Payment page shows amount: $50 USD

**Verify Database:**
- Open Wix Editor → Database → `ContributionIntent`
  - Record with `_id: "abc123"` (this is intentId)
- Open Wix Editor → Database → `CryptoPayments`
  - Should see record with:
    - `order_id: "abc123"` (custom invoice ID = intentId)
    - `invoice_id: "..."` (NOWPayments invoice ID)
    - `price_amount: 50`
    - `status: 'waiting'`

**Custom Invoice ID Verification:**
- `CryptoPayments.order_id` = `ContributionIntent._id` ✅

---

## 🔍 Debugging Commands

### Test Backend Function Access

```javascript
// In browser console on your Wix site
fetch('/_functions/mission-support-middleware.web/goToCharterAfterPayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 10 })
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => {
  console.log('✅ Success:', data);
})
.catch(err => {
  console.error('❌ Error:', err);
});
```

**Expected Response:**
```json
{
  "success": true,
  "redirectUrl": "https://hingecraft-global.ai/charter?donationAmount=10&paymentMethod=card&fromMissionSupport=true",
  "amount": 10
}
```

**If 403 Forbidden:**
- Permissions not set correctly
- See "Fix Forbidden Error" section above

---

### Test Stripe Checkout Creation

```javascript
// In browser console
fetch('/_functions/stripe.api/createCheckoutSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 25,
    successUrl: 'https://hingecraft-global.ai/charter?payment=success',
    cancelUrl: 'https://hingecraft-global.ai/charter?payment=cancelled'
  })
})
.then(r => r.json())
.then(data => console.log('Stripe Session:', data));
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

### Test NOWPayments Invoice Creation

```javascript
// In browser console
fetch('/_functions/createNowPaymentsInvoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    intentId: 'test_intent_123',
    amount: 50,
    email: 'test@example.com'
  })
})
.then(r => r.json())
.then(data => console.log('NOWPayments Invoice:', data));
```

**Expected Response:**
```json
{
  "success": true,
  "invoiceId": "...",
  "paymentUrl": "https://nowpayments.io/...",
  "orderId": "test_intent_123"
}
```

---

## 📊 Complete Flow Verification

### Flow 1: Mission Support → Card Payment

```
1. User fills Mission Support form
   ↓
2. Clicks "Continue to Charter Page"
   ↓
3. Backend: goToCharterAfterPayment()
   - Saves to ContributionIntent
   - Returns redirect URL
   ↓
4. Frontend: window.location.href = redirectUrl
   ↓
5. Charter page loads
   - Amount pre-filled
   - Card payment selected
   ↓
6. User clicks payment button
   ↓
7. Backend: createCheckoutSession()
   - Creates Stripe session
   - Saves to StripePayments (invoice_id = session_id)
   - Returns checkout URL
   ↓
8. Frontend: Redirects to Stripe Checkout
   ↓
9. User completes payment
   ↓
10. Stripe webhook → Updates Donations collection
```

**Database Records Created:**
- `ContributionIntent` (step 3)
- `StripePayments` (step 7) - **Custom Invoice ID: session_id**
- `Donations` (step 10)

---

### Flow 2: Mission Support → Crypto Payment

```
1. User fills Mission Support form
   - Payment Method: Crypto
   - Amount: $50
   ↓
2. Clicks "Continue to Charter Page"
   ↓
3. Backend: createNowPaymentsInvoice()
   - Gets intentId from ContributionIntent
   - Calls NOWPayments API with order_id = intentId
   - Saves to CryptoPayments (order_id = intentId)
   - Returns payment_url
   ↓
4. Frontend: Redirects to NOWPayments
   ↓
5. User completes crypto payment
   ↓
6. NOWPayments webhook → Updates Donations collection
```

**Database Records Created:**
- `ContributionIntent` (before step 3)
- `CryptoPayments` (step 3) - **Custom Invoice ID: order_id = intentId**
- `Donations` (step 6)

---

## 🔗 URL Connections Verified

### Stripe URLs
- ✅ **API Base:** `https://api.stripe.com/v1`
- ✅ **Checkout Creation:** `POST /checkout/sessions`
- ✅ **Success URL:** `https://hingecraft-global.ai/charter?payment=success&session_id={CHECKOUT_SESSION_ID}`
- ✅ **Cancel URL:** `https://hingecraft-global.ai/charter?payment=cancelled`
- ✅ **Webhook:** Configured in Stripe Dashboard

### NOWPayments URLs
- ✅ **API Base:** `https://api.nowpayments.io/v1`
- ✅ **Invoice Creation:** `POST /invoice`
- ✅ **IPN Callback:** `https://hingecraft-global.ai/_functions/webhooks/nowpayments`
- ✅ **Success URL:** `https://hingecraft-global.ai/charter?payment=success&intent={intentId}&source=crypto`
- ✅ **Cancel URL:** `https://hingecraft-global.ai/charter?payment=cancelled&intent={intentId}&source=crypto`

---

## ✅ Verification Checklist

### Backend Functions
- [ ] All `.web.js` files have "Anyone" permission
- [ ] Functions are published
- [ ] No "forbidden" errors in console

### Database Collections
- [ ] All 7 collections created
- [ ] All required fields added
- [ ] Permissions set correctly

### API Secrets
- [ ] `STRIPE_SECRET_KEY_LIVE` configured
- [ ] `STRIPE_PUBLISHABLE_KEY_LIVE` configured
- [ ] `NOWPAYMENTS_API_KEY` configured
- [ ] `NOWPAYMENTS_IPN_SECRET` configured
- [ ] `BASE_URL` configured

### Custom Invoice IDs
- [ ] Stripe: `session_id` → `invoice_id` ✅
- [ ] NOWPayments: `intentId` → `order_id` ✅
- [ ] Both stored in database ✅

### Flow Testing
- [ ] Mission Support form loads
- [ ] Form submission works
- [ ] Redirect to Charter works
- [ ] Stripe checkout creates
- [ ] NOWPayments invoice creates
- [ ] Payments complete
- [ ] Webhooks process
- [ ] Database records created

---

## 🚨 Common Issues & Fixes

### Issue: "403 Forbidden"
**Fix:** Set backend function permissions to "Anyone"

### Issue: "Collection does not exist"
**Fix:** Create collections (see `DATABASE_SETUP_INSTRUCTIONS.md`)

### Issue: "API key not found"
**Fix:** Add secrets in Wix Secrets Manager

### Issue: "Redirect not working"
**Fix:** Check browser console, verify `window.location.href` is called

### Issue: "Custom invoice ID not found"
**Fix:** Verify `ContributionIntent` is created before payment

---

**Last Updated:** 2025-01-27  
**Status:** Active Testing in Progress
