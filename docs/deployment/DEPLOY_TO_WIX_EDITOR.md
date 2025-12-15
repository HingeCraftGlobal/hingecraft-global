# 🚀 Deploy to Wix Editor - Step by Step

## ✅ Files Ready

All files are committed to GitHub and ready for deployment.

---

## 📋 STEP 1: Payment Page

### Location in Repository:
`public/pages/payment-page.js`

### Deployment Steps:

1. **Open Wix Editor**
   - Go to your Wix site
   - Click "Edit Site"

2. **Navigate to Payment Page**
   - Find your payment page
   - Click on it

3. **Open Custom Code**
   - Click **Settings** (gear icon) on the page
   - Click **"Custom Code"** tab
   - Click **"JavaScript"** section

4. **Copy Code**
   - Open file: `public/pages/payment-page.js` from GitHub
   - **Select ALL** content (Cmd+A / Ctrl+A)
   - **Copy** (Cmd+C / Ctrl+C)

5. **Paste in Wix**
   - **DELETE** all existing code in Wix editor
   - **Paste** copied code (Cmd+V / Ctrl+V)

6. **Update Configuration** (if needed)
   - Find line 21: `CHARTER_PAGE_URL: '/charter'`
   - Update to your actual charter page URL if different
   - Common URLs: `/charter`, `/membership`, `/contributions`

7. **Save**
   - Click **"Save"** button
   - Code is now active

8. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Payment Page is now LIVE!**

---

## 📋 STEP 2: Charter Page

### Location in Repository:
`public/pages/charter-page.html`

### Deployment Steps:

1. **Navigate to Charter Page**
   - Find your charter/contributions page
   - Click on it

2. **Open Custom Code**
   - Click **Settings** (gear icon) on the page
   - Click **"Custom Code"** tab
   - Click **"HTML"** section

3. **Copy Code**
   - Open file: `public/pages/charter-page.html` from GitHub
   - **Select ALL** content (Cmd+A / Ctrl+A)
   - **Copy** (Cmd+C / Ctrl+C)

4. **Paste in Wix**
   - **DELETE** all existing code in Wix editor
   - **Paste** copied code (Cmd+V / Ctrl+V)

5. **Update Configuration** (if needed)
   - Find line 21: `CHECKOUT_PAGE_URL: '/checkout'`
   - Update to your actual checkout page URL if different

6. **Save**
   - Click **"Save"** button
   - Code is now active

7. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Charter Page is now LIVE!**

---

## 🧪 STEP 3: Test the Flow

### Test Steps:

1. **Preview Site**
   - Click **Preview** or **Publish** in Wix Editor
   - Navigate to Payment Page

2. **Enter Donation Amount**
   - Find "Other" amount field
   - Enter amount: `50.00` or `$50.00`

3. **Click Submit**
   - Click submit/pay button
   - **✅ Should redirect to Charter Page IMMEDIATELY**

4. **Verify Charter Page**
   - ✅ Should see: **"Donation Amount: $50.00"**
   - ✅ Contributions section should show: **"$50.00"**
   - ✅ Should see: **"Proceed to Checkout" button**

5. **Click Checkout**
   - Click "Proceed to Checkout" button
   - **✅ Should redirect to Checkout Page**

6. **Verify Checkout**
   - ✅ Should be on checkout page
   - ✅ URL should have: `?donationAmount=50`
   - ✅ Payment should process correctly

**✅ Flow is working!**

---

## ✅ Verification Checklist

### Payment Page
- [ ] Code deployed to Wix Editor
- [ ] `CHARTER_PAGE_URL` updated if needed (line 21)
- [ ] No form submission errors
- [ ] Redirects to charter page immediately
- [ ] Amount captured correctly

### Charter Page
- [ ] Code deployed to Wix Editor
- [ ] `CHECKOUT_PAGE_URL` updated if needed (line 21)
- [ ] Donation amount displays prominently
- [ ] Contributions section updates automatically
- [ ] Checkout button appears
- [ ] Redirects to checkout correctly

### Complete Flow
- [ ] Payment → Charter → Checkout flow works
- [ ] All verifications passed
- [ ] Site is LIVE and working

---

## 📦 Files on GitHub

**Repository**: `https://github.com/departments-commits/hingecraft-global`

**Files to Copy**:
- `public/pages/payment-page.js` → Payment Page → Custom Code → JavaScript
- `public/pages/charter-page.html` → Charter Page → Custom Code → HTML

---

**Status**: ✅ **READY FOR DEPLOYMENT**

**Follow steps above to deploy to Wix Editor!**
