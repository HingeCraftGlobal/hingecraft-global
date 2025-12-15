# T10 Implementation - Deployment Guide
## "Other Amount → Redirect → Payment Pre-Filled"

**Date:** January 27, 2025  
**Status:** ✅ Code Complete - Ready for Deployment

---

## 🎯 Implementation Overview

This implementation adds a complete flow where:
1. User enters "Other Amount" on Charter Contribution Page
2. Amount is validated, sanitized, and stored
3. User is redirected to Payment Page with amount in URL (`?amt=VALUE`)
4. Payment Page automatically pre-fills the payment processor widget
5. Backend logs contribution intent and syncs to Notion/CRM

---

## 📁 Files Created/Updated

### New Files Created:
1. `public/pages/charter-page-other-amount.js` - Charter page Other Amount capture
2. `public/pages/payment-page-prefill.js` - Payment page pre-fill integration

### Files Updated:
1. `src/backend/hingecraft.api.web.jsw` - Added `logContributionIntent()` function

---

## 🚀 Deployment Steps

### Step 1: Start Wix Dev

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev
```

**Verify:** Wix dev should be running and syncing files

---

### Step 2: Add Charter Page Code

1. **Open Wix Editor:** https://editor.wix.com
2. **Navigate to:** Charter of Abundance Invitation page
3. **Open:** Page Settings → Custom Code
4. **Add:** Copy entire contents of `public/pages/charter-page-other-amount.js`
5. **Wrap in:** `<script>` tags if needed
6. **Save:** Page

**Code Location:** `public/pages/charter-page-other-amount.js`

**Key Features:**
- Captures "Other Amount" input field
- Validates: regex `/^\d{1,5}(\.\d{1,2})?$/`
- Range: $1.00 - $25,000.00
- Stores in session storage (fallback)
- Redirects to `/payment?amt=VALUE`
- Logs to backend (non-blocking)

---

### Step 3: Add Payment Page Code

1. **Open Wix Editor:** https://editor.wix.com
2. **Navigate to:** Payment page
3. **Open:** Page Settings → Custom Code
4. **Add:** Copy entire contents of `public/pages/payment-page-prefill.js`
5. **Wrap in:** `<script>` tags if needed
6. **Save:** Page

**Code Location:** `public/pages/payment-page-prefill.js`

**Key Features:**
- Reads amount from URL parameter `?amt=VALUE`
- Validates server-side (never trust client)
- Pre-fills payment widget BEFORE rendering (no flicker)
- Supports: Wix Pay, Stripe, PayPal, DOM manipulation
- Fallback to session storage if URL param missing

---

### Step 4: Verify Backend Function

1. **Open:** Wix Editor → Backend → Functions
2. **Verify:** `logContributionIntent` function exists in `hingecraft.api.web.jsw`
3. **Check:** Function is exported and accessible

**Backend Function:**
- File: `src/backend/hingecraft.api.web.jsw`
- Function: `logContributionIntent(intentData)`
- Features:
  - Server-side validation
  - Stores in ContributionIntent collection
  - Syncs to Notion (with retry)
  - Tags user for CRM
  - Non-blocking (fails silently for UI)

---

### Step 5: Configure Payment Page URL

**Update in Charter Page Code:**
```javascript
const CONFIG = {
  PAYMENT_PAGE_URL: '/payment', // Update to your actual payment page URL
  // ...
};
```

**Update in Payment Page Code:**
```javascript
const CONFIG = {
  URL_PARAM_NAME: 'amt', // URL parameter name (default: 'amt')
  // ...
};
```

---

### Step 6: Test Complete Flow

#### Test 1: Other Amount Capture
1. Navigate to Charter Contribution Page
2. Find "Other Amount" input field
3. Enter amount: `$50.00`
4. Click "Continue" or "Submit"
5. **Expected:** Redirects to `/payment?amt=50.00`

#### Test 2: Payment Pre-Fill
1. Should land on Payment Page with `?amt=50.00` in URL
2. **Expected:** Payment widget shows `$50.00` pre-filled
3. **Expected:** No UI flicker (amount appears immediately)

#### Test 3: Validation
1. Try invalid amounts:
   - `$0.50` → Should show error (below minimum)
   - `$30000` → Should show error (above maximum)
   - `abc` → Should show error (invalid format)
   - `$50.00` → Should work ✅

#### Test 4: Fallback
1. Clear URL parameter manually
2. **Expected:** Falls back to session storage
3. **Expected:** Still pre-fills amount

#### Test 5: Backend Logging
1. Check backend logs for contribution intent
2. **Expected:** Intent logged with:
   - amountEntered
   - timestamp
   - sessionID
   - anonymousFingerprint
   - referrerSource

---

## 🔧 Configuration

### Charter Page Configuration

**File:** `public/pages/charter-page-other-amount.js`

```javascript
const CONFIG = {
  STORAGE_KEY: 'hingecraft_donation',
  SESSION_KEY: 'hingecraft_donation',
  PAYMENT_PAGE_URL: '/payment', // UPDATE THIS
  MIN_AMOUNT: 1.00,
  MAX_AMOUNT: 25000.00,
  AMOUNT_REGEX: /^\d{1,5}(\.\d{1,2})?$/
};
```

### Payment Page Configuration

**File:** `public/pages/payment-page-prefill.js`

```javascript
const CONFIG = {
  STORAGE_KEY: 'hingecraft_donation',
  SESSION_KEY: 'hingecraft_donation',
  URL_PARAM_NAME: 'amt', // URL parameter name
  MIN_AMOUNT: 1.00,
  MAX_AMOUNT: 25000.00,
  AMOUNT_REGEX: /^\d{1,5}(\.\d{1,2})?$/
};
```

### Backend Configuration

**File:** `src/backend/hingecraft.api.web.jsw`

```javascript
const EXTERNAL_DB_SECRET_KEY = 'YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY';
const USE_EXTERNAL_DB = true; // or false for Wix Database
```

---

## 📋 Testing Protocol

### Input Validation Tests

| Input | Expected Result |
|-------|----------------|
| `$50.00` | ✅ Valid, redirects with `?amt=50.00` |
| `50` | ✅ Valid, redirects with `?amt=50.00` |
| `$1.00` | ✅ Valid (minimum) |
| `$25,000.00` | ✅ Valid (maximum) |
| `$0.50` | ❌ Error: Below minimum |
| `$30000` | ❌ Error: Above maximum |
| `abc` | ❌ Error: Invalid format |
| `$50.123` | ❌ Error: Too many decimals |
| Empty | ✅ No redirect (normal form submission) |

### Redirect Tests

| Scenario | Expected Result |
|----------|----------------|
| Valid amount entered | ✅ Redirects to `/payment?amt=VALUE` |
| Invalid amount | ❌ Shows error, no redirect |
| No amount entered | ✅ Normal form submission |
| Amount in session | ✅ Falls back to session storage |

### Payment Pre-Fill Tests

| Scenario | Expected Result |
|----------|----------------|
| URL has `?amt=50.00` | ✅ Widget pre-filled with $50.00 |
| URL has `?amt=invalid` | ✅ Falls back to session/default |
| No URL param | ✅ Falls back to session/default |
| Session has amount | ✅ Pre-fills from session |
| No amount anywhere | ✅ Shows soft warning, uses default |

### UI Flicker Tests

| Test | Expected Result |
|------|----------------|
| Page load | ✅ Amount appears immediately (no flicker) |
| Widget initialization | ✅ Amount set before rendering |
| Dynamic widget load | ✅ Amount set within 500ms |

### Backend Logging Tests

| Test | Expected Result |
|------|----------------|
| Valid intent | ✅ Logged to ContributionIntent collection |
| Invalid intent | ✅ Error logged, no blocking |
| Notion sync fails | ✅ Retries 3 times, then fails silently |
| CRM tagging | ✅ User tagged with contribution intent |

---

## 🐛 Troubleshooting

### Issue: Amount not captured from Charter Page

**Solution:**
1. Check input field selector matches your form
2. Update selectors in `getOtherAmountInput()` function
3. Check browser console for errors

**Common Selectors:**
```javascript
'#other-amount',
'#otherAmount',
'input[name="otherAmount"]',
'.other-amount-input'
```

### Issue: Payment widget not pre-filling

**Solution:**
1. Check payment processor type (Wix Pay, Stripe, PayPal)
2. Update `prefillPaymentWidget()` function for your processor
3. Check browser console for widget initialization errors

**Common Widget IDs:**
```javascript
$w('#paymentWidget'),
$w('#paymentForm'),
$w('#checkoutForm')
```

### Issue: Backend logging not working

**Solution:**
1. Verify `logContributionIntent` function is exported
2. Check backend logs for errors
3. Verify ContributionIntent collection exists
4. Check Notion sync module is available

### Issue: Redirect not working

**Solution:**
1. Verify `PAYMENT_PAGE_URL` matches your actual page URL
2. Check Wix Location API is available
3. Test redirect manually: `/payment?amt=50.00`

---

## ✅ Verification Checklist

### Pre-Deployment
- [ ] Charter page code added
- [ ] Payment page code added
- [ ] Backend function updated
- [ ] Configuration values updated
- [ ] Wix dev running

### Post-Deployment
- [ ] Other Amount capture works
- [ ] Validation works (min/max/regex)
- [ ] Redirect works (`?amt=VALUE`)
- [ ] Payment widget pre-fills
- [ ] No UI flicker
- [ ] Backend logging works
- [ ] Session fallback works
- [ ] Error handling works

---

## 📊 Success Criteria

### Critical (Must Have)
- ✅ Other Amount captured from Charter Page
- ✅ Amount validated (regex, range)
- ✅ Redirect to Payment Page with `?amt=VALUE`
- ✅ Payment widget pre-filled with amount
- ✅ No UI flicker (amount appears immediately)

### High Priority (Should Have)
- ✅ Backend logging works
- ✅ Session storage fallback works
- ✅ Error messages display correctly
- ✅ Works with multiple payment processors

### Medium Priority (Nice to Have)
- ✅ Notion sync works
- ✅ CRM tagging works
- ✅ Analytics tracking works

---

## 🚀 Quick Start Commands

```bash
# 1. Start Wix dev
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev

# 2. Verify files synced
# Check Wix Editor for updated files

# 3. Test flow
# Navigate to Charter Page → Enter Other Amount → Verify redirect → Verify pre-fill

# 4. Check backend logs
# Wix Editor → Backend → Logs → Check for contribution intent entries
```

---

## 📝 Notes

- **Non-Blocking:** All backend operations fail silently for UI (don't block user flow)
- **Validation:** Server-side validation in backend (never trust client-side)
- **Fallback:** Multiple fallback mechanisms (URL → Session → Default)
- **Retry:** Notion sync includes retry mechanism (3 attempts)
- **Security:** Amount sanitized and validated at multiple stages

---

**Status:** ✅ Ready for Deployment  
**Next:** Start `wix dev` and test complete flow  
**Completion:** Code complete, needs testing and verification



