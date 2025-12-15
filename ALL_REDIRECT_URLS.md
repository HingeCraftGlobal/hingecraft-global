# All Redirect URLs - Complete Reference

## Overview

This document lists **all redirect URLs** used in the HingeCraft payment and membership system, organized by flow.

---

## 🔗 Internal Redirects (Same Domain)

### **Mission Support → Charter Page**

#### **1. Preset Amount Redirect**
```
/charter?donationAmount={amount}&fromMissionSupport=true&paymentMethod=card
```

**Examples:**
- `/charter?donationAmount=1&fromMissionSupport=true&paymentMethod=card`
- `/charter?donationAmount=5&fromMissionSupport=true&paymentMethod=card`
- `/charter?donationAmount=20&fromMissionSupport=true&paymentMethod=card`

**Used When:**
- User selects preset amount ($1, $5, $20) on Mission Support Form
- Function: `goToCharterAfterPayment()` → `redirectBackToCharter()`

---

#### **2. Other Amount Redirect (Prefill Token)**
```
/charter?prefill={prefill_id}
```

**Example:**
- `/charter?prefill=prefill_1702500000_abc123def456`

**Used When:**
- User enters custom "Other" amount on Mission Support Form
- Function: `otherAmount()` creates prefill token
- Token expires in 24 hours
- Token marked as `used` when consumed

---

### **Charter Page → Success/Return**

#### **3. After Payment Success**
```
/charter
```

**Used When:**
- User returns after completing payment
- May include success parameters in future

---

#### **4. Member Dashboard (Future)**
```
/dashboard
```

**Used When:**
- User has active membership
- Shows membership details and entitlements

---

## 🌐 External Redirects (Payment Providers)

### **Stripe Invoice (Fiat Payments)**

#### **5. Stripe Hosted Invoice Page**
```
https://invoice.stripe.com/i/acct_{account_id}/{invoice_id}
```

**Example:**
- `https://invoice.stripe.com/i/acct_1234abcd/test_in_abc123def456`

**Used When:**
- User clicks "Pay" button for fiat payment (Card/ACH)
- Function: `fiatButtonClick()` → `createCustomInvoice()`
- Invoice created instantly (no email sent)
- User pays directly on Stripe's hosted page

**Parameters:**
- `account_id`: Stripe account identifier
- `invoice_id`: Stripe invoice ID (e.g., `in_test_...`)

---

#### **6. Stripe Invoice PDF**
```
https://pay.stripe.com/invoice/{invoice_id}/pdf
```

**Example:**
- `https://pay.stripe.com/invoice/test_in_abc123def456/pdf`

**Used When:**
- User wants to download invoice PDF
- Available after invoice creation

---

### **Stripe Checkout (Micro Payments)**

#### **7. Stripe Checkout Session**
```
https://checkout.stripe.com/c/pay/{session_id}
```

**Example:**
- `https://checkout.stripe.com/c/pay/cs_test_abc123def456`

**Used When:**
- Micro payment (< $1) from Mission Support Form
- Function: `createMicroPayment()` (if implemented)
- Full checkout flow with success/cancel URLs

---

### **NOWPayments (Crypto Payments)**

#### **8. NOWPayments Payment Page**
```
https://nowpayments.io/payment/?iid={invoice_id}
```

**Example:**
- `https://nowpayments.io/payment/?iid=12345678`

**Used When:**
- User clicks "Pay" button for crypto payment (SOL, XLM, BTC, ETH)
- Function: `cryptoButtonClick()` → `createNowPaymentsInvoice()`
- User pays with cryptocurrency on NOWPayments platform

**Parameters:**
- `iid`: NOWPayments invoice ID

---

## 📋 Redirect Flow Summary

### **Flow 1: Mission Support (Preset) → Charter → Stripe**
```
Mission Support Form
  ↓ (submit)
/charter?donationAmount=5&fromMissionSupport=true&paymentMethod=card
  ↓ (click Pay)
https://invoice.stripe.com/i/acct_1234/test_in_abc123
  ↓ (pay)
/charter (return)
```

### **Flow 2: Mission Support (Other) → Charter → Stripe**
```
Mission Support Form (Other Amount)
  ↓ (submit)
/charter?prefill=prefill_1702500000_abc123
  ↓ (click Pay)
https://invoice.stripe.com/i/acct_1234/test_in_abc123
  ↓ (pay)
/charter (return)
```

### **Flow 3: Charter (Crypto) → NOWPayments**
```
Charter Page
  ↓ (click Pay Crypto)
https://nowpayments.io/payment/?iid=12345678
  ↓ (pay)
/charter (return)
```

---

## 🔍 URL Parameter Reference

### **Charter Page Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `donationAmount` | Number | Preset amount from Mission Support | `5` |
| `amount` | Number | Alternative amount parameter | `5` |
| `prefill` | String | Prefill token ID | `prefill_1702500000_abc123` |
| `fromMissionSupport` | Boolean | Indicates redirect from Mission Support | `true` |
| `paymentMethod` | String | Payment method selected | `card`, `ACH` |

### **Prefill Token Format**

```
prefill_{timestamp}_{random_string}
```

**Example:**
- `prefill_1702500000_abc123def456`

**Components:**
- `prefill_`: Prefix
- `1702500000`: Unix timestamp (milliseconds)
- `abc123def456`: Random alphanumeric string

---

## ✅ Verification Checklist

### **Internal Redirects**
- [ ] Mission Support → Charter (preset) works
- [ ] Mission Support → Charter (other amount) works
- [ ] Prefill token created correctly
- [ ] Prefill token retrieved correctly
- [ ] Prefill token expires after 24 hours
- [ ] Prefill token marked as used

### **External Redirects**
- [ ] Stripe invoice URL works
- [ ] Stripe invoice PDF accessible
- [ ] NOWPayments payment URL works
- [ ] Return to Charter after payment works

### **Database Sync**
- [ ] ContributionIntent created on Mission Support submit
- [ ] Prefill token stored in ContributionIntent
- [ ] StripePayments created on invoice creation
- [ ] CryptoPayments created on invoice creation
- [ ] Members record created on payment completion

---

## 🚨 Common Issues

### **Issue 1: Prefill Token Not Found**

**Error:** `Prefill token not found or expired`

**Causes:**
- Token expired (> 24 hours)
- Token already used
- Token ID incorrect

**Fix:**
- Check token expiration
- Verify token hasn't been used
- Ensure token ID matches exactly

---

### **Issue 2: Redirect URL Not Working**

**Error:** 404 or redirect fails

**Causes:**
- URL path incorrect
- Missing parameters
- Wix routing not configured

**Fix:**
- Verify URL path matches Wix page slug
- Check all required parameters present
- Ensure Charter page exists in Wix

---

### **Issue 3: External Payment Redirect Fails**

**Error:** Payment provider URL not accessible

**Causes:**
- Invoice not created
- Invoice ID incorrect
- Payment provider error

**Fix:**
- Verify invoice creation succeeded
- Check invoice ID format
- Check payment provider status

---

## 📝 Notes

1. **Prefill Tokens:**
   - Expire after 24 hours
   - Can only be used once
   - Stored in ContributionIntent collection

2. **Stripe Invoices:**
   - Created instantly (no email sent)
   - Status: `open` → `paid` (via webhook)
   - PDF available immediately

3. **NOWPayments:**
   - Invoice created on backend
   - User redirected to payment page
   - Status updates via polling or webhook

4. **Database Sync:**
   - All redirects trigger database writes
   - Webhooks update payment status
   - Members records created on payment

---

**Last Updated:** December 13, 2025  
**Status:** Complete - All redirect URLs documented





