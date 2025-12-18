# ✅ Test Verification Checklist

## Pre-Test Verification

### ✅ Backend Components
- [x] **Router:** `velo-router.jsw` - Properly parsing request body
- [x] **Charter Middleware:** All functions exported:
  - [x] `onReady()` - Line 23
  - [x] `cryptoButtonClick()` - Line 71
  - [x] `fiatButtonClick()` - Line 195
  - [x] `getCumulativeTotal()` - Line 367
- [x] **Wix CLI:** Running (Process ID: 4087)
- [x] **Auto-sync:** Active via `wix dev`

### ✅ Frontend Components
- [x] **VELO_CONFIG:** Uses module names (not paths)
  ```javascript
  CHARTER_MIDDLEWARE: 'charter-page-middleware' ✅
  NOWPAYMENTS_API: 'nowpayments.api' ✅
  STRIPE_API: 'stripe.api' ✅
  ```
- [x] **callVeloFunction:** Routes to `/_functions/velo-router` ✅
- [x] **Request Format:** Sends `{ module, function, ...data }` ✅

### ✅ API Keys
- [x] Stripe keys configured in Wix Secrets Manager
- [x] NOWPayments keys configured in Wix Secrets Manager
- [x] External DB keys configured in Wix Secrets Manager

### ✅ Database
- [x] PostgreSQL schema applied (6 tables created)
- [ ] Wix Collections created (pending - follow `WIX_COLLECTIONS_QUICK_SETUP.md`)

---

## Test Scenarios

### Test 1: Page Initialization
**Expected Behavior:**
1. Page loads without errors
2. `onReady()` is called automatically
3. Cumulative total displays (if available)
4. No console errors

**Test Steps:**
1. Open Charter Page in Wix Editor preview/live
2. Open browser console (F12)
3. Check for:
   - `📞 Calling via router: charter-page-middleware.onReady`
   - `✅ Router response: { success: true, ... }`
   - No `TypeError` or `onReady is not a function` errors

**Pass Criteria:**
- ✅ No errors in console
- ✅ `onReady` called successfully
- ✅ Cumulative total displays (if data exists)

---

### Test 2: Fiat Payment Button (Card)
**Expected Behavior:**
1. Click "Pay with Card 💳" button
2. Stripe checkout session created
3. Redirect to Stripe checkout page

**Test Steps:**
1. Select a tier (Basic/Premier/VIP)
2. Select "Card (Stripe)" payment method
3. Click "Pay with Card 💳" button
4. Check browser console for:
   - `📞 Calling via router: charter-page-middleware.fiatButtonClick`
   - `✅ Router response: { success: true, url: '...' }`
5. Should redirect to Stripe checkout

**Pass Criteria:**
- ✅ No errors in console
- ✅ `fiatButtonClick` called successfully
- ✅ Stripe checkout URL returned
- ✅ Redirect to Stripe works

**Expected Console Output:**
```
💳 Creating Stripe payment for amount: 1 rail: CARD
📞 Calling via router: charter-page-middleware.fiatButtonClick {module: "charter-page-middleware", function: "fiatButtonClick", amount: 1, paymentMethod: "card", tier: "BASIC", years: 1}
✅ Router response: {success: true, sessionId: "...", url: "https://checkout.stripe.com/..."}
🔄 Redirecting to Stripe checkout: https://checkout.stripe.com/...
```

---

### Test 3: Fiat Payment Button (ACH)
**Expected Behavior:**
1. Click "Pay with ACH 🏦" button
2. Stripe ACH checkout session created
3. Redirect to Stripe checkout page

**Test Steps:**
1. Select a tier
2. Select "ACH (Stripe)" payment method
3. Click "Pay with ACH 🏦" button
4. Check console for successful call
5. Should redirect to Stripe ACH checkout

**Pass Criteria:**
- ✅ No errors
- ✅ `fiatButtonClick` called with `paymentMethod: 'ACH'`
- ✅ Stripe ACH checkout URL returned
- ✅ Redirect works

---

### Test 4: Crypto Payment Button (Solana)
**Expected Behavior:**
1. Click "Pay with Solana ⚡" button
2. NOWPayments invoice created
3. Payment URL and wallet address displayed

**Test Steps:**
1. Select a tier (minimum $30 for crypto)
2. Select "Solana • USDC" payment method
3. Click "Pay with Solana ⚡" button
4. Check console for:
   - `📞 Calling via router: charter-page-middleware.cryptoButtonClick`
   - `✅ Router response: { success: true, paymentUrl: '...', payAddress: '...' }`
5. Should display payment QR code and address

**Pass Criteria:**
- ✅ No errors
- ✅ `cryptoButtonClick` called successfully
- ✅ NOWPayments invoice created
- ✅ Payment URL and wallet address displayed
- ✅ QR code generated

**Expected Console Output:**
```
💰 Creating crypto payment: {amount: 30, rail: "SOL_USDC"}
📞 Calling via router: charter-page-middleware.cryptoButtonClick {module: "charter-page-middleware", function: "cryptoButtonClick", amount: 30, coin: "solana"}
✅ Router response: {success: true, invoiceId: "...", paymentUrl: "...", payAddress: "...", payAmountCrypto: 0.123, payCurrency: "SOL"}
✅ Crypto invoice created: {...}
```

---

### Test 5: Get Cumulative Total
**Expected Behavior:**
1. Cumulative total loads on page init
2. Displays total contributions from database

**Test Steps:**
1. Page loads
2. Check for cumulative total display
3. Check console for:
   - `📞 Calling via router: charter-page-middleware.getCumulativeTotal`
   - `✅ Router response: { success: true, total: 0, ... }`

**Pass Criteria:**
- ✅ No errors
- ✅ `getCumulativeTotal` called successfully
- ✅ Total displays (even if 0)

---

### Test 6: Error Handling
**Expected Behavior:**
1. Errors are caught and displayed
2. User-friendly error messages
3. No crashes

**Test Steps:**
1. Try invalid operations
2. Check error messages are clear
3. Verify page doesn't crash

**Pass Criteria:**
- ✅ Errors caught gracefully
- ✅ Error messages displayed
- ✅ Page remains functional

---

## Common Issues & Solutions

### Issue: "Function not accessible"
**Solution:**
- Check module name matches exactly (case-sensitive)
- Verify function is exported in backend module
- Check router logs in Wix backend

### Issue: "onReady is not a function"
**Solution:**
- Remove any page code that imports web module directly
- Use only HTML code with `callVeloFunction`
- Clear browser cache

### Issue: "Module not found"
**Solution:**
- Verify module name in VELO_CONFIG matches router
- Check router has handler for that module
- Verify backend module exists

### Issue: Payment buttons not working
**Solution:**
- Check browser console for errors
- Verify API keys are configured
- Check router is receiving requests
- Verify backend functions are exported

---

## Test Results Template

```
Date: ___________
Tester: ___________

Test 1: Page Initialization
[ ] Pass [ ] Fail
Notes: _________________________

Test 2: Fiat Payment (Card)
[ ] Pass [ ] Fail
Notes: _________________________

Test 3: Fiat Payment (ACH)
[ ] Pass [ ] Fail
Notes: _________________________

Test 4: Crypto Payment (Solana)
[ ] Pass [ ] Fail
Notes: _________________________

Test 5: Get Cumulative Total
[ ] Pass [ ] Fail
Notes: _________________________

Test 6: Error Handling
[ ] Pass [ ] Fail
Notes: _________________________

Overall Status: [ ] Ready [ ] Needs Fixes
```

---

## Next Steps After Testing

1. **If all tests pass:**
   - ✅ System is ready for production
   - Create Wix database collections
   - Test with real payments (test mode)

2. **If tests fail:**
   - Check browser console for errors
   - Check Wix backend logs
   - Verify all components are synced
   - Review error messages and fix issues

---

**Status:** Ready for Testing  
**Last Verified:** $(date)


