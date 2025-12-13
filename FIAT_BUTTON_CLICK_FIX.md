# fiatButtonClick Function Fix ✅

## Issue

**Error:** `Failed to create Stripe invoice: Function not accessible. Check that 'fiatButtonClick' is exported in the backend module.`

## Root Cause

The function `fiatButtonClick` is correctly exported, but there are two possible issues:

1. **Backend file not uploaded to Wix** - The `.web.js` file must be uploaded to Wix Dev Mode
2. **Parameter extraction** - The function now properly extracts `tier`, `years`, and `paymentMethod` from the request

## Fix Applied

### Updated Parameter Extraction

**Before:**
```javascript
let amount, email, customerName, metadata;

if (typeof preset === 'object' && preset !== null) {
    amount = parseFloat(preset.amount || preset);
    email = preset.email || null;
    customerName = preset.customerName || preset.name || null;
    metadata = preset.metadata || {};
}
```

**After:**
```javascript
let amount, email, customerName, metadata, tier, years, paymentMethod;

if (typeof preset === 'object' && preset !== null) {
    amount = parseFloat(preset.amount || preset);
    email = preset.email || null;
    customerName = preset.customerName || preset.name || null;
    tier = preset.tier || null;
    years = preset.years || null;
    paymentMethod = preset.paymentMethod || 'card';
    metadata = preset.metadata || {};
}
```

### Removed Duplicate Metadata Assignment

**Before:**
```javascript
// Add metadata
metadata = {
    ...metadata,
    source: 'charter_page_button',
    amount_entered: amount.toString(),
    timestamp: new Date().toISOString()
};

// Add metadata with membership and database reference
metadata = {
    ...metadata,
    source: 'charter_page_membership',
    ...
};
```

**After:**
```javascript
// Add metadata with membership and database reference
metadata = {
    ...metadata,
    source: 'charter_page_membership',
    amount_entered: amount.toString(),
    timestamp: new Date().toISOString(),
    donation_type: 'membership',
    tier: tier || (amount === 1 ? 'BASIC' : amount >= 2 && amount <= 20 ? 'PREMIER' : amount >= 30 ? 'VIP' : null),
    years: years || (amount === 1 ? 1 : amount >= 2 && amount <= 20 ? amount : amount >= 30 ? null : null),
    payment_method: paymentMethod
};
```

## Verification Steps

### 1. Upload Backend File to Wix

**Go to:** **Dev Mode → Backend → Functions**

**Upload:**
- `src/backend/charter-page-middleware.web.js`

**Verify:**
- File appears in the Functions list
- File name is exactly `charter-page-middleware.web.js`
- Functions are listed: `onReady`, `cryptoButtonClick`, `fiatButtonClick`, `getCumulativeTotal`

### 2. Test HTTP Endpoint

**URL:** `/_functions/charter-page-middleware/fiatButtonClick`

**Method:** POST

**Body:**
```json
{
  "amount": 30,
  "paymentMethod": "card",
  "tier": "VIP",
  "years": null
}
```

**Expected Response:**
```json
{
  "success": true,
  "invoiceId": "in_test_...",
  "invoiceUrl": "https://invoice.stripe.com/...",
  "invoicePdf": "https://pay.stripe.com/...",
  "amount": 30,
  "status": "open"
}
```

### 3. Test from Frontend

1. Open Charter page
2. Select VIP tier ($30)
3. Select CARD payment method
4. Click "Pay with Card 💳"
5. Should create invoice and redirect to Stripe

## Common Issues

### Issue 1: 404 Error
**Cause:** Backend file not uploaded or wrong path  
**Fix:** Upload `charter-page-middleware.web.js` to Wix Dev Mode

### Issue 2: 403 Error
**Cause:** Permissions issue  
**Fix:** Check `permissions.json` allows anonymous access (already configured)

### Issue 3: Function not accessible
**Cause:** Function not exported or syntax error  
**Fix:** Verify function has `export async function fiatButtonClick(...)`

## Status

✅ **Fixed** - Parameter extraction updated  
✅ **Committed** - Changes pushed to git (commit `616299e`)  
✅ **Ready** - Upload to Wix and test

---

**Next Step:** Upload the updated `charter-page-middleware.web.js` file to Wix Dev Mode and test the fiat button click.
