# Complete Testing Guide - HingeCraft Global

## 🧪 End-to-End Testing Procedures

### Prerequisites

1. **Database Collections Created:**
   - All 7 collections exist in Wix Database
   - See `DATABASE_SETUP_INSTRUCTIONS.md`

2. **Secrets Configured:**
   - `STRIPE_SECRET_KEY_LIVE`
   - `STRIPE_PUBLISHABLE_KEY_LIVE`
   - `NOWPAYMENTS_API_KEY`
   - `NOWPAYMENTS_IPN_SECRET`
   - `BASE_URL`

3. **Backend Functions Published:**
   - All `.web.js` files uploaded
   - Permissions set to "Anyone"
   - Functions published

---

## Test 1: Mission Support Form - Card Payment Flow

### Steps:

1. **Navigate to Mission Support:**
   ```
   https://hingecraft-global.ai/missionsupport
   ```

2. **Fill Form:**
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Address: `123 Test Street, City, State 12345`
   - Mission Support Name: `Test Mission` (optional)
   - Payment Method: **Card**
   - Amount: Select `$10` or enter custom amount

3. **Click "Continue to Charter Page"**

4. **Expected Results:**
   - ✅ No "forbidden" error
   - ✅ Redirects to: `https://hingecraft-global.ai/charter?donationAmount=10&paymentMethod=card&fromMissionSupport=true`
   - ✅ Charter page loads
   - ✅ Amount pre-filled: $10
   - ✅ Card payment option selected

5. **Verify Database:**
   - Open Wix Editor → Database → Collections → `ContributionIntent`
   - Should see new record:
     - `amount_entered: 10`
     - `status: 'intent'`
     - `source: 'missionSupportForm'`
     - `first_name: 'Test'`
     - `last_name: 'User'`
     - `email: 'test@example.com'`

### Troubleshooting:

**If "forbidden" error:**
- Check backend function permissions (see `FIX_FORBIDDEN_ERROR.md`)
- Verify function is published
- Check browser console for detailed error

**If redirect doesn't work:**
- Check browser console for JavaScript errors
- Verify `window.location.href` is being called
- Check network tab for failed requests

---

## Test 2: Mission Support Form - Crypto Payment Flow

### Steps:

1. **Navigate to Mission Support:**
   ```
   https://hingecraft-global.ai/missionsupport
   ```

2. **Fill Form:**
   - Payment Method: **Crypto**
   - Amount: **$50** (must be >= $30)
   - Fill other required fields

3. **Click "Continue to Charter Page"**

4. **Expected Results:**
   - ✅ Creates NOWPayments invoice
   - ✅ Redirects to NOWPayments payment page
   - ✅ Payment page shows:
     - Amount: $50 USD
     - Crypto options (BTC, ETH, SOL, etc.)
     - Payment address

5. **Verify Database:**
   - Check `ContributionIntent` collection:
     - Record with `amount_entered: 50`
     - `status: 'intent'`
   - Check `CryptoPayments` collection:
     - Record with `price_amount: 50`
     - `status: 'waiting'`
     - `order_id` matches `intentId` from `ContributionIntent`
     - `payment_url` populated
     - `invoice_id` from NOWPayments

### Custom Invoice ID Verification:

The `order_id` in `CryptoPayments` should match the `_id` from `ContributionIntent`. This is your **custom invoice ID**.

**Example:**
- `ContributionIntent._id` = `"abc123"`
- `CryptoPayments.order_id` = `"abc123"` ✅

### Troubleshooting:

**If invoice creation fails:**
- Check `NOWPAYMENTS_API_KEY` in Secrets Manager
- Verify API key is valid
- Check NOWPayments dashboard for errors

**If redirect doesn't work:**
- Check `payment_url` in `CryptoPayments` record
- Verify URL is valid
- Check browser console for errors

---

## Test 3: Charter Page - Stripe Card Payment

### Steps:

1. **Navigate to Charter:**
   ```
   https://hingecraft-global.ai/charter
   ```

2. **Select Payment:**
   - Amount: $25
   - Payment Rail: **USD_CARD**
   - Click payment button

3. **Expected Results:**
   - ✅ Creates Stripe checkout session
   - ✅ Redirects to Stripe Checkout page
   - ✅ Checkout page shows:
     - Amount: $25.00
     - Payment form (card number, etc.)

4. **Complete Test Payment:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Click "Pay"

5. **Expected Results:**
   - ✅ Redirects back to: `https://hingecraft-global.ai/charter?payment=success&session_id={SESSION_ID}`
   - ✅ Payment completed

6. **Verify Database:**
   - Check `StripePayments` collection:
     - Record with `amount: 25`
     - `status: 'completed'`
     - `invoice_id` = Stripe `session_id` (custom invoice ID)
     - `payment_method: 'card'`
   - Check `Donations` collection:
     - Record with `amount: 25`
     - `payment_status: 'completed'`
     - `payment_method: 'card'`
     - `transaction_id` = Stripe `session_id`

### Custom Invoice ID Verification:

The `invoice_id` in `StripePayments` is the Stripe `session_id`. This is your **custom invoice ID**.

**Example:**
- Stripe `session_id` = `"cs_test_abc123"`
- `StripePayments.invoice_id` = `"cs_test_abc123"` ✅

### Troubleshooting:

**If checkout creation fails:**
- Check `STRIPE_SECRET_KEY_LIVE` in Secrets Manager
- Verify key is valid (starts with `sk_live_`)
- Check Stripe dashboard for errors

**If payment doesn't complete:**
- Check Stripe webhook configuration
- Verify webhook endpoint is accessible
- Check webhook logs in Stripe dashboard

---

## Test 4: Charter Page - Stripe ACH Payment

### Steps:

1. **Navigate to Charter:**
   ```
   https://hingecraft-global.ai/charter
   ```

2. **Select Payment:**
   - Amount: $25
   - Payment Rail: **USD_ACH**
   - Click payment button

3. **Expected Results:**
   - ✅ Creates Stripe checkout session with ACH support
   - ✅ Redirects to Stripe Checkout
   - ✅ Checkout shows ACH payment option

4. **Complete Test Payment:**
   - Select "Bank account" option
   - Use test bank account details
   - Complete payment

5. **Verify Database:**
   - Check `StripePayments` collection:
     - `payment_method: 'ach'`
     - `status: 'completed'`

---

## Test 5: Charter Page - Crypto Payment

### Steps:

1. **Navigate to Charter:**
   ```
   https://hingecraft-global.ai/charter
   ```

2. **Select Payment:**
   - Amount: **$100** (must be >= $30)
   - Payment Rail: **CRYPTO**
   - Click payment button

3. **Expected Results:**
   - ✅ Creates NOWPayments invoice
   - ✅ Redirects to NOWPayments payment page
   - ✅ Shows crypto payment options

4. **Verify Database:**
   - Check `CryptoPayments` collection:
     - `price_amount: 100`
     - `order_id` populated (custom invoice ID)
     - `status: 'waiting'`

---

## Test 6: Crypto Minimum Enforcement

### Test 6A: Amount < $30 - Crypto Disabled

1. **Mission Support Form:**
   - Amount: $10
   - Payment Method: Crypto
   - **Expected:** Crypto button should be disabled/greyed out

2. **Charter Page:**
   - Amount: $10
   - **Expected:** Crypto payment rail should be disabled
   - **Expected:** Error if trying to select crypto

### Test 6B: Amount >= $30 - Crypto Enabled

1. **Mission Support Form:**
   - Amount: $50
   - Payment Method: Crypto
   - **Expected:** Crypto button enabled

2. **Charter Page:**
   - Amount: $50
   - **Expected:** Crypto payment rail enabled

---

## Test 7: Data Persistence

### Test 7A: Mission Support → Charter

1. Fill Mission Support form with amount $15
2. Select Card payment
3. Click button
4. **Verify on Charter Page:**
   - Amount pre-filled: $15
   - Card payment selected
   - URL contains: `donationAmount=15&paymentMethod=card`

### Test 7B: Session Storage

1. Fill Mission Support form
2. Check browser console:
   ```javascript
   sessionStorage.getItem('hingecraft_donation')
   ```
3. **Expected:** JSON with amount and payment method

---

## Test 8: Cumulative Total

### Steps:

1. **Check Initial Total:**
   - Navigate to Charter page
   - Check contributions section
   - Note the total

2. **Complete a Payment:**
   - Complete a test Stripe payment for $10

3. **Verify Total Updated:**
   - Refresh Charter page
   - **Expected:** Total increased by $10

4. **Verify Database:**
   - Check `Donations` collection
   - Count all records with `payment_status: 'completed'`
   - Sum all `amount` values
   - Should match displayed total

---

## Test 9: Webhook Processing

### Test 9A: Stripe Webhook

1. **Complete Stripe Payment:**
   - Complete a test payment

2. **Check Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Check webhook delivery logs
   - **Expected:** Webhook sent successfully

3. **Verify Processing:**
   - Check `StripePayments` collection:
     - `status: 'completed'`
   - Check `Donations` collection:
     - New record created
     - `payment_status: 'completed'`

### Test 9B: NOWPayments Webhook

1. **Complete Crypto Payment:**
   - Complete a crypto payment on NOWPayments

2. **Check Webhook:**
   - Go to NOWPayments Dashboard → Webhooks
   - Check webhook delivery logs
   - **Expected:** Webhook sent successfully

3. **Verify Processing:**
   - Check `CryptoPayments` collection:
     - `status: 'confirmed'`
   - Check `Donations` collection:
     - New record created
     - `payment_method: 'crypto'`

---

## Test 10: Error Handling

### Test 10A: Invalid Amount

1. **Mission Support Form:**
   - Try to submit with amount $0
   - **Expected:** Validation error, form doesn't submit

2. **Charter Page:**
   - Try to select amount < $1
   - **Expected:** Validation error

### Test 10B: Missing Required Fields

1. **Mission Support Form:**
   - Leave email field empty
   - Try to submit
   - **Expected:** Validation error, form doesn't submit

### Test 10C: API Failure

1. **Disconnect Internet:**
   - Fill form and submit
   - **Expected:** Error message displayed
   - **Expected:** Form doesn't break

---

## 🔍 Debugging Commands

### Check Backend Function Access

```javascript
// In browser console
fetch('/_functions/mission-support-middleware.web/goToCharterAfterPayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 10 })
})
.then(r => r.json())
.then(data => console.log('Result:', data))
.catch(err => console.error('Error:', err));
```

### Check Database Collections

```javascript
// In Wix Velo backend function
import wixData from 'wix-data';

// Check ContributionIntent
const intents = await wixData.query('ContributionIntent').find();
console.log('ContributionIntents:', intents.items);

// Check Donations
const donations = await wixData.query('Donations').find();
console.log('Donations:', donations.items);
```

### Check Secrets

```javascript
// In Wix Velo backend function
import { secrets } from 'wix-secrets-backend';

const stripeKey = await secrets.getSecret('STRIPE_SECRET_KEY_LIVE');
console.log('Stripe key exists:', !!stripeKey);
```

---

## ✅ Testing Checklist

- [ ] Mission Support form loads correctly
- [ ] Form validation works
- [ ] Card payment redirects to Charter page
- [ ] Crypto payment creates invoice and redirects
- [ ] Charter page loads with pre-filled data
- [ ] Stripe checkout session creates successfully
- [ ] NOWPayments invoice creates successfully
- [ ] Custom invoice IDs are generated correctly
- [ ] Payments complete successfully
- [ ] Webhooks process correctly
- [ ] Database records created correctly
- [ ] Cumulative totals calculate correctly
- [ ] Crypto minimum ($30) enforced
- [ ] Error handling works correctly
- [ ] No "forbidden" errors

---

**Last Updated:** 2025-01-27  
**Status:** Complete Testing Guide
