# Crypto Minimum ($30) Implementation - Complete

## ✅ Implementation Status

**Crypto Minimum:** $30  
**Status:** Fully implemented across all payment flows

---

## 📋 Implementation Details

### **1. Charter Page - Rail Selection** ✅

**Location:** `charter-page-final.html`

**Features:**
- Crypto rails (SOL_USDC, XLM_USDC, BTC_LN) are **disabled/greyed out** when `amount < $30`
- Visual feedback: Disabled buttons show "Minimum $30 required" message
- Auto-correction: If crypto rail is selected but amount drops below $30, defaults to card

**Code:**
```javascript
const CRYPTO_MINIMUM = 30;

const RAILS = [
  { key: "SOL_USDC", label: "Solana • USDC", hint: "Ultra-low fee (<$0.001)", disabled: false, isCrypto: true },
  { key: "XLM_USDC", label: "Stellar • USDC", hint: "Ultra-low fee (<$0.001)", disabled: false, isCrypto: true },
  { key: "BTC_LN", label: "Bitcoin • Lightning", hint: "Instant sats, ~1¢/$ multiplier", disabled: false, isCrypto: true },
  { key: "USD_CARD", label: "Card (Stripe)", hint: "Fee-included (≈$1.39)", isCrypto: false },
  { key: "USD_ACH", label: "ACH (Stripe)", hint: "Fee-included (≈$1.05)", isCrypto: false },
];

// In rail rendering:
const isCryptoDisabled = r.isCrypto && amount < CRYPTO_MINIMUM;
const isDisabled = r.disabled || isCryptoDisabled;
```

---

### **2. Charter Page - Payment Processing** ✅

**Location:** `charter-page-final.html` → `handleGoToPayment()`

**Features:**
- Double-checks minimum before processing crypto payment
- Shows error message if amount < $30

**Code:**
```javascript
// Handle crypto payments (with $30 minimum validation)
if (rail === "SOL_USDC" || rail === "XLM_USDC" || rail === "BTC_LN") {
  // Double-check minimum before processing
  if (amt < CRYPTO_MINIMUM) {
    setQuoteError(`Crypto payments require a minimum of $${CRYPTO_MINIMUM}. Please select Card or ACH payment.`);
    return;
  }
  await handleCryptoPayment(amt, rail);
  return;
}
```

---

### **3. Charter Page - URL Parameter Handling** ✅

**Location:** `charter-page-final.html` → `loadPrefillData()`

**Features:**
- If URL has `paymentMethod=crypto` but amount < $30, auto-corrects to card
- Logs warning for debugging

**Code:**
```javascript
if (urlPaymentMethod === 'crypto') {
  // Only set crypto rail if amount >= $30
  if (amt >= CRYPTO_MINIMUM) {
    setRail('SOL_USDC'); // Default to SOL for crypto
  } else {
    // Amount < $30, force card payment
    console.warn(`⚠️ Amount $${amt} is below crypto minimum $${CRYPTO_MINIMUM}. Defaulting to card payment.`);
    setRail('USD_CARD');
  }
}
```

---

### **4. Mission Support Form - Payment Method Selection** ✅

**Location:** `mission-support-form.html`

**Features:**
- Crypto button is **disabled/greyed out** when amount < $30
- Shows "Min $30" message on disabled button
- Validates minimum before processing crypto payment

**Code:**
```javascript
const CRYPTO_MINIMUM = 30; // Crypto payments require minimum $30

// In payment method button:
const finalAmount = selectedPreset || (showOtherInput && formData.otherAmount ? parseFloat(formData.otherAmount) : null);
const isCryptoDisabled = !finalAmount || finalAmount < CRYPTO_MINIMUM;

<button
  type="button"
  onClick={() => {
    if (!isCryptoDisabled) {
      setPaymentMethod('crypto');
    }
  }}
  className={isCryptoDisabled ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' : '...'}
  disabled={isCryptoDisabled}
  title={isCryptoDisabled ? `Crypto payments require a minimum of $${CRYPTO_MINIMUM}` : 'Pay with cryptocurrency'}
>
  ₿ Crypto Payment
  {isCryptoDisabled && (
    <div className="text-xs font-normal mt-1 text-rose-500">
      Min ${CRYPTO_MINIMUM}
    </div>
  )}
</button>
```

**Validation:**
```javascript
if (paymentMethod === 'crypto') {
  // Validate crypto minimum ($30)
  if (finalAmount < CRYPTO_MINIMUM) {
    setErrors(prev => ({ ...prev, amount: `Crypto payments require a minimum of $${CRYPTO_MINIMUM}. Please select Card payment or increase your donation amount.` }));
    setIsSubmitting(false);
    return;
  }
  // ... create crypto invoice
}
```

---

### **5. Backend Validation** ✅

**Location:** `charter-page-middleware.jsw` → `cryptoButtonClick()`

**Features:**
- Enforces $30 minimum at backend level
- Returns error if amount < $30

**Code:**
```javascript
// Validate amount - CRYPTO MINIMUM $30
const validatedAmount = validateAmount(amount);
if (!validatedAmount) {
    throw new Error('Invalid amount');
}

// Enforce $30 minimum for crypto payments
if (validatedAmount < 30) {
    throw new Error('Crypto contributions must be $30 or more. Please select a higher amount or use card/ACH payment.');
}
```

---

## 🔄 Complete Flow

### **Scenario 1: Amount < $30**
1. User selects amount: $15
2. **Charter Page:**
   - Crypto rails (SOL, XLM, BTC) are **greyed out**
   - Only Card and ACH are available
   - User can only select Card or ACH
3. **Mission Support Form:**
   - Crypto button is **disabled**
   - Shows "Min $30" message
   - User can only select Card

### **Scenario 2: Amount >= $30**
1. User selects amount: $50
2. **Charter Page:**
   - All payment methods available (including crypto)
   - User can select any rail
3. **Mission Support Form:**
   - Both Card and Crypto buttons are **enabled**
   - User can select either

### **Scenario 3: URL with crypto but amount < $30**
1. URL: `?donationAmount=15&paymentMethod=crypto`
2. **Charter Page:**
   - Detects amount < $30
   - Auto-corrects to Card payment
   - Logs warning
   - User sees Card selected (not crypto)

---

## ✅ Testing Checklist

- [x] Charter page: Crypto rails disabled when amount < $30
- [x] Charter page: Crypto rails enabled when amount >= $30
- [x] Charter page: Payment processing validates minimum
- [x] Charter page: URL parameter auto-correction works
- [x] Mission support form: Crypto button disabled when amount < $30
- [x] Mission support form: Crypto button enabled when amount >= $30
- [x] Mission support form: Validation prevents crypto payment < $30
- [x] Backend: Enforces $30 minimum
- [x] Visual feedback: Disabled buttons show clear message
- [x] All payment flows respect minimum

---

## 🚀 Status

**All implementations complete and tested.**

**Files Modified:**
- `charter-page-final.html` - Rail selection, payment processing, URL handling
- `mission-support-form.html` - Payment method selection, validation
- `charter-page-middleware.jsw` - Backend validation (already implemented)

**Ready for production!**

---

**Last Updated:** December 13, 2025  
**Status:** ✅ Complete





