# Complete System Flow - HingeCraft Payment & Membership System

## Overview

This document maps the **complete user journey** from Mission Support Form → Charter Page → Payment → Database → Membership Activation, including all redirect URLs and data synchronization.

---

## 🔄 Complete User Flow

### **FLOW 1: Mission Support Form → Charter Page (Preset Amount)**

```
1. User fills Mission Support Form
   └─> Page: /mission-support
   └─> Form fields: firstName, lastName, email, address, amount (preset: $1, $5, $20)
   
2. User submits form
   └─> Backend: handleUserInputDonation()
   └─> Database: ContributionIntent collection
      └─> Status: 'intent'
      └─> Stores: amount_entered, first_name, last_name, email, address
   
3. Redirect to Charter Page
   └─> URL: /charter?donationAmount={amount}&fromMissionSupport=true&paymentMethod=card
   └─> Function: goToCharterAfterPayment() → redirectBackToCharter()
   └─> Data passed via URL parameters
   
4. Charter Page loads
   └─> Reads: donationAmount from URL
   └─> Sets: selectedTier, years based on amount
   └─> Displays: Pre-filled amount and tier selection
```

**Redirect URLs:**
- `/charter?donationAmount=1&fromMissionSupport=true&paymentMethod=card`
- `/charter?donationAmount=5&fromMissionSupport=true&paymentMethod=card`
- `/charter?donationAmount=20&fromMissionSupport=true&paymentMethod=card`

---

### **FLOW 2: Mission Support Form → Charter Page (Other Amount)**

```
1. User fills Mission Support Form
   └─> Page: /mission-support
   └─> User selects "Other" amount
   └─> Enters custom amount (e.g., $15)
   
2. User submits form
   └─> Backend: otherAmount() function (MISSING - needs to be created)
   └─> Creates: Prefill token in ContributionIntent
      └─> prefill_id: Unique token (UUID)
      └─> expires_at: 24 hours from now
      └─> used: false
      └─> Stores: amount_entered, user info
   
3. Redirect to Charter Page with Prefill Token
   └─> URL: /charter?prefill={prefill_id}
   └─> Example: /charter?prefill=abc123-def456-ghi789
   
4. Charter Page loads
   └─> Reads: prefill parameter from URL
   └─> Backend: getPrefill(prefillId)
   └─> Retrieves: amount, firstName, lastName, email from ContributionIntent
   └─> Marks: prefill token as used (used: true, used_at: now)
   └─> Sets: selectedTier, years based on retrieved amount
   └─> Displays: Pre-filled amount and user info
```

**Redirect URLs:**
- `/charter?prefill={prefill_id}` (where prefill_id is a unique token)

**⚠️ ISSUE FOUND:** The `otherAmount()` function is referenced in the HTML but may not exist in the backend. Need to verify.

---

### **FLOW 3: Charter Page → Payment (Fiat - Card/ACH)**

```
1. User on Charter Page
   └─> Page: /charter
   └─> Selects: Tier (BASIC/PREMIER/VIP) and payment method (CARD/ACH)
   └─> Clicks: "Pay" button
   
2. Backend: fiatButtonClick()
   └─> Extracts: amount, tier, years, paymentMethod from preset object
   └─> Stripe: createCustomInvoice()
      └─> Creates: Instant Stripe invoice (no email sent)
      └─> Returns: invoiceId, invoiceUrl, invoicePdf
   
3. Database: StripePayments collection
   └─> Stores: invoice_id, customer_id, amount, status: 'open'
   └─> Stores: invoice_url, invoice_pdf, email, payment_method
   └─> Stores: metadata (tier, years, source: 'charter_page_membership')
   
4. Redirect to Stripe Invoice
   └─> URL: {invoiceUrl} (Stripe hosted invoice page)
   └─> Example: https://invoice.stripe.com/i/acct_1234/test_abc123
   
5. User pays on Stripe
   └─> Stripe processes payment
   └─> Webhook: invoice.paid event fires
   
6. Backend: handleInvoicePaid() (stripe.api.jsw)
   └─> Updates: StripePayments collection (status: 'paid', paid_at: now)
   └─> Updates: Donations collection (payment_status: 'completed')
   └─> Creates: Members collection record
      └─> member_id: Unique ID
      └─> tier: From metadata
      └─> years: From metadata
      └─> amount_paid: From invoice
      └─> start_at: Now
      └─> end_at: Calculated (start_at + years) or null for VIP
      └─> status: 'active'
      └─> email: From invoice
      └─> payment_id: invoice_id
   
7. User returns to Charter Page
   └─> URL: /charter (or success page)
   └─> Displays: Membership confirmation
```

**Redirect URLs:**
- `{invoiceUrl}` - Stripe hosted invoice page (external)
- `/charter` - Return after payment (or success page)

---

### **FLOW 4: Charter Page → Payment (Crypto)**

```
1. User on Charter Page
   └─> Page: /charter
   └─> Selects: Crypto payment method (SOL_USDC, XLM_USDC, BTC_LN)
   └─> Clicks: "Pay" button
   
2. Backend: cryptoButtonClick()
   └─> Extracts: amount, coin from data object
   └─> NOWPayments: createNowPaymentsInvoice()
      └─> Creates: Crypto invoice
      └─> Returns: invoiceId, paymentUrl, payAddress, payAmount
   
3. Database: CryptoPayments collection
   └─> Stores: invoice_id, price_amount, status: 'pending'
   └─> Stores: pay_currency, pay_address, pay_amount_crypto
   └─> Stores: payment_url, expires_at
   
4. Redirect to NOWPayments
   └─> URL: {paymentUrl} (NOWPayments payment page)
   └─> Example: https://nowpayments.io/payment/?iid=abc123
   
5. User pays with crypto
   └─> NOWPayments processes payment
   └─> Status updates: pending → confirmed
   
6. Backend: Polling or webhook (if configured)
   └─> Updates: CryptoPayments collection (status: 'confirmed')
   └─> Creates: Members collection record (same as fiat flow)
   
7. User returns to Charter Page
   └─> URL: /charter (or success page)
   └─> Displays: Membership confirmation
```

**Redirect URLs:**
- `{paymentUrl}` - NOWPayments payment page (external)
- `/charter` - Return after payment (or success page)

---

### **FLOW 5: Mission Support Form → Direct Payment (Micro Payment)**

```
1. User fills Mission Support Form
   └─> Page: /mission-support
   └─> User selects: Micro payment option (if available)
   
2. User submits form
   └─> Backend: handleUserInputDonation()
   └─> Stripe: createMicroPayment() (if amount < $1)
   └─> Creates: Stripe Checkout Session
   
3. Redirect to Stripe Checkout
   └─> URL: {checkoutUrl} (Stripe Checkout page)
   └─> Example: https://checkout.stripe.com/c/pay/cs_test_abc123
   
4. User pays
   └─> Stripe processes payment
   └─> Webhook: checkout.session.completed
   
5. Backend: handleCheckoutSessionCompleted()
   └─> Updates: StripePayments collection
   └─> Updates: Donations collection
   └─> Note: May not create Members record (micro payments are donations, not memberships)
   
6. User returns
   └─> URL: Success page or redirect URL from session
```

**Redirect URLs:**
- `{checkoutUrl}` - Stripe Checkout page (external)
- Success/Cancel URLs configured in checkout session

---

## 📊 Database Synchronization

### **Collections Used:**

1. **ContributionIntent**
   - Created: Mission Support Form submission
   - Updated: When prefill token is used
   - Fields: amount_entered, status, prefill_id, used, expires_at

2. **StripePayments**
   - Created: When fiatButtonClick() creates invoice
   - Updated: When webhook fires (invoice.paid)
   - Fields: invoice_id, status, invoice_url, metadata (tier, years)

3. **CryptoPayments**
   - Created: When cryptoButtonClick() creates invoice
   - Updated: When payment is confirmed
   - Fields: invoice_id, status, payment_url, pay_address

4. **Donations**
   - Created: When payment is completed
   - Updated: When webhook confirms payment
   - Fields: amount, payment_status, transaction_id

5. **Members**
   - Created: When invoice.paid webhook fires (for membership payments)
   - Fields: member_id, tier, years, amount_paid, start_at, end_at, status

6. **PaymentRoutes**
   - Read: When loading payment options
   - Fields: route_key, type, provider, enabled

---

## 🔗 All Redirect URLs Summary

### **Internal Redirects (Same Domain):**

1. **Mission Support → Charter (Preset Amount)**
   - `/charter?donationAmount={amount}&fromMissionSupport=true&paymentMethod=card`
   - Example: `/charter?donationAmount=5&fromMissionSupport=true&paymentMethod=card`

2. **Mission Support → Charter (Other Amount)**
   - `/charter?prefill={prefill_id}`
   - Example: `/charter?prefill=abc123-def456-ghi789`

3. **Charter → Success/Return**
   - `/charter` (after payment)
   - `/dashboard` (member dashboard - if implemented)

### **External Redirects (Payment Providers):**

1. **Stripe Invoice (Fiat)**
   - `https://invoice.stripe.com/i/acct_{account_id}/{invoice_id}`
   - Example: `https://invoice.stripe.com/i/acct_1234/test_abc123`

2. **Stripe Checkout (Micro Payment)**
   - `https://checkout.stripe.com/c/pay/{session_id}`
   - Example: `https://checkout.stripe.com/c/pay/cs_test_abc123`

3. **NOWPayments (Crypto)**
   - `https://nowpayments.io/payment/?iid={invoice_id}`
   - Example: `https://nowpayments.io/payment/?iid=abc123`

---

## ⚠️ Issues Found & Fixes Needed

### **Issue 1: Missing `otherAmount()` Function**

**Problem:** Mission Support Form HTML calls `/_functions/mission-support-middleware/otherAmount` but this function may not exist.

**Location:** `public/pages/mission-support-form.html` line 683

**Fix Required:**
- Add `export async function otherAmount(data)` to `mission-support-middleware.jsw`
- Add `export async function otherAmount(data)` to `mission-support-middleware.web.js`
- Function should:
  1. Create ContributionIntent record with prefill_id
  2. Set expires_at to 24 hours from now
  3. Return redirectUrl with prefill token

### **Issue 2: Prefill Token Expiration**

**Current:** Prefill tokens expire but expiration check may not be enforced everywhere.

**Fix:** Ensure `getPrefill()` always checks `expires_at` before returning data.

### **Issue 3: Database Sync Verification**

**Need to verify:**
- ✅ StripePayments created on invoice creation
- ✅ Members record created on invoice.paid webhook
- ✅ ContributionIntent marked as used when prefill is consumed
- ✅ Donations record created on payment completion
- ✅ CryptoPayments updated when payment confirmed

---

## ✅ Verification Checklist

### **Flow 1: Mission Support → Charter (Preset)**
- [ ] Mission Support form submits correctly
- [ ] ContributionIntent record created
- [ ] Redirect URL includes donationAmount parameter
- [ ] Charter page reads donationAmount from URL
- [ ] Charter page sets correct tier/years based on amount

### **Flow 2: Mission Support → Charter (Other Amount)**
- [ ] otherAmount() function exists and works
- [ ] Prefill token created in ContributionIntent
- [ ] Redirect URL includes prefill parameter
- [ ] Charter page calls getPrefill() correctly
- [ ] Prefill token marked as used after retrieval
- [ ] Charter page sets correct tier/years from prefill

### **Flow 3: Charter → Payment (Fiat)**
- [ ] fiatButtonClick() creates Stripe invoice
- [ ] StripePayments record created
- [ ] Redirect to Stripe invoice URL works
- [ ] Webhook fires on payment
- [ ] Members record created on payment
- [ ] Database updated correctly

### **Flow 4: Charter → Payment (Crypto)**
- [ ] cryptoButtonClick() creates NOWPayments invoice
- [ ] CryptoPayments record created
- [ ] Redirect to NOWPayments URL works
- [ ] Payment status updates correctly
- [ ] Members record created on confirmation

### **Database Sync**
- [ ] All collections have correct fields
- [ ] Indexes created on key fields
- [ ] Permissions set correctly
- [ ] Webhooks update collections
- [ ] Membership records created correctly

---

## 📝 Next Steps

1. **Verify `otherAmount()` function exists** - If not, create it
2. **Test all redirect URLs** - Ensure they work correctly
3. **Verify database sync** - Check all collections update correctly
4. **Test webhook handlers** - Ensure Members records are created
5. **Test prefill token flow** - Ensure tokens work and expire correctly

---

**Last Updated:** December 13, 2025  
**Status:** Complete flow mapping - Ready for verification
