# ✅ Wix Deployment Checklist

## 🚀 Complete Deployment Steps

### Step 1: Deploy Payment Page (2 minutes)

- [ ] Open Wix Editor
- [ ] Navigate to Payment Page
- [ ] Click Settings (gear icon)
- [ ] Click Custom Code tab
- [ ] Click JavaScript section
- [ ] DELETE all existing code
- [ ] Copy ENTIRE content from: `PAYMENT_PAGE_READY_TO_COPY.js`
- [ ] Paste into JavaScript editor
- [ ] Update `CHARTER_PAGE_URL` if needed (line 21)
- [ ] Click Save
- [ ] Click Publish (if needed)

**✅ Payment Page Deployed**

### Step 2: Deploy Charter Page (2 minutes)

- [ ] Navigate to Charter Page
- [ ] Click Settings (gear icon)
- [ ] Click Custom Code tab
- [ ] Click HTML section
- [ ] DELETE all existing code
- [ ] Copy ENTIRE content from: `CHARTER_PAGE_READY_TO_COPY.html`
- [ ] Paste into HTML editor
- [ ] Update `CHECKOUT_PAGE_URL` if needed (line 21)
- [ ] Click Save
- [ ] Click Publish (if needed)

**✅ Charter Page Deployed**

### Step 3: Test Flow (5 minutes)

- [ ] Go to Payment Page (preview or published)
- [ ] Enter "Other" amount: $50.00
- [ ] Click submit/pay button
- [ ] ✅ Verify: Redirects to Charter Page immediately
- [ ] ✅ Verify: See "Donation Amount: $50.00"
- [ ] ✅ Verify: Contributions section shows updated amount
- [ ] ✅ Verify: See "Proceed to Checkout" button
- [ ] Click "Proceed to Checkout" button
- [ ] ✅ Verify: Goes to Checkout Page
- [ ] ✅ Verify: URL has `?donationAmount=50`
- [ ] ✅ Verify: Payment processes correctly

**✅ Flow Tested and Working**

---

## ✅ Deployment Complete When:

- [x] Payment Page code deployed
- [x] Charter Page code deployed
- [x] Flow tested: Payment → Charter → Checkout
- [x] All verifications passed
- [x] Site is LIVE and working

**Status**: ✅ **DEPLOYMENT COMPLETE**
