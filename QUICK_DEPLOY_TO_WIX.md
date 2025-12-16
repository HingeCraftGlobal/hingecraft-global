# ⚡ QUICK DEPLOY TO WIX - Charter & Payment Pages
## Simple 5-Step Deployment Guide

**Status:** ✅ Code Verified - Ready to Deploy  
**Estimated Time:** 15-30 minutes

---

## ✅ PRE-FLIGHT CHECKLIST

### Verified ✅
- ✅ Payment page code exists (`public/pages/payment-page.js`)
- ✅ Charter page code exists (`public/pages/charter-page.html`)
- ✅ Wix page files exist (`src/pages/Payment.xf66z.js`, `src/pages/Charter of Abundance Invitation.pa3z2.js`)
- ✅ All functions verified (13/13 critical functions exist)
- ✅ Wix CLI authenticated (`departments@hingecraft-global.ai`)

### Pending ⏳
- ⏳ Wix dev needs to be started
- ⏳ Pages need to be verified in Wix Editor
- ⏳ Code needs to be embedded
- ⏳ Pages need to be published

---

## 🚀 5-STEP DEPLOYMENT PROCESS

### Step 1: Start Wix Dev Mode (2 minutes)

```bash
cd [PROJECT_ROOT]/hingecraft-global
wix dev
```

**What happens:**
- Wix dev starts and syncs pages
- Local pages sync to Wix Editor
- You'll see sync progress in terminal

**Expected output:**
```
✓ Syncing pages...
✓ Pages synced successfully
```

**Keep this terminal open** - Wix dev needs to keep running.

---

### Step 2: Verify Pages in Wix Editor (5 minutes)

1. **Open Wix Editor:**
   - Go to: https://editor.wix.com
   - Login if needed

2. **Check Pages Menu:**
   - Click "Pages" in left sidebar
   - Look for:
     - **Payment** page
     - **Charter of Abundance Invitation** page

3. **Verify Pages Exist:**
   - ✅ If pages appear → Continue to Step 3
   - ❌ If pages don't appear → See Troubleshooting below

---

### Step 3: Embed Code in Pages (10 minutes)

#### For Payment Page:

1. **Open Payment Page** in Wix Editor
2. **Add HTML Element:**
   - Click "+ Add" → "Embed" → "HTML Code"
   - Or use existing HTML element
3. **Add Code:**
   - Copy code from `public/pages/payment-page.js`
   - Paste into HTML element
   - Wrap in `<script>` tags if needed:
   ```html
   <script>
   // Paste payment-page.js code here
   </script>
   ```
4. **Save** the page

#### For Charter Page:

1. **Open Charter Page** in Wix Editor
2. **Add HTML Element:**
   - Click "+ Add" → "Embed" → "HTML Code"
   - Or use existing HTML element
3. **Add Code:**
   - Copy code from `public/pages/charter-page.html`
   - Paste into HTML element
   - The HTML already includes `<script>` tags
4. **Save** the page

**Note:** If pages already have code embedded, verify it matches the latest code.

---

### Step 4: Test Functionality (5 minutes)

#### Test Payment Page:

1. **Preview Site:**
   - Click "Preview" button in Wix Editor
   - Or open: https://www.hingecraft-global.ai/payment

2. **Test Form:**
   - Enter donation amount (e.g., $25.50)
   - Submit form
   - **Expected:** Redirects to charter page

3. **Verify Redirect:**
   - Should land on charter page
   - Should see amount displayed

#### Test Charter Page:

1. **Verify Amount Display:**
   - Amount should appear in green box
   - Contributions section should update

2. **Test Checkout Button:**
   - Click "Proceed to Checkout"
   - **Expected:** Redirects to checkout page

3. **Verify Complete Flow:**
   - Payment → Charter → Checkout
   - Amount persists through flow

---

### Step 5: Publish to Live (3 minutes)

#### Option A: Publish from Wix Editor

1. **Click "Publish"** button (top right)
2. **Review Changes**
3. **Click "Publish"** to confirm
4. **Wait for confirmation**

#### Option B: Publish from CLI

```bash
# In a new terminal (keep wix dev running)
cd [PROJECT_ROOT]/hingecraft-global
wix publish --source local
```

**Expected output:**
```
✓ Publishing changes...
✓ Published successfully
```

---

## ✅ VERIFICATION CHECKLIST

After publishing, verify:

- [ ] Payment page is live: https://www.hingecraft-global.ai/payment
- [ ] Charter page is live: https://www.hingecraft-global.ai/charter
- [ ] Payment form works
- [ ] Redirect to charter works
- [ ] Amount displays on charter
- [ ] Checkout button works
- [ ] Complete flow works end-to-end

---

## 🐛 TROUBLESHOOTING

### Pages Don't Appear in Wix Editor

**Solution:**
1. Check Wix dev is running: `ps aux | grep "wix dev"`
2. Restart Wix dev: Stop and run `wix dev` again
3. Check sync logs in terminal
4. Manually create pages if needed:
   - Click "+ Add Page" in Wix Editor
   - Name: "Payment" and "Charter of Abundance Invitation"

### Code Not Working

**Solution:**
1. Verify code is wrapped in `<script>` tags
2. Check browser console for errors (F12)
3. Verify page URLs match configuration:
   - `CHARTER_PAGE_URL: '/charter'`
   - `CHECKOUT_PAGE_URL: '/checkout'`
4. Update URLs in code if different

### Redirect Not Working

**Solution:**
1. Check page URLs/slugs in Wix Editor
2. Update `CHARTER_PAGE_URL` in payment-page.js if different
3. Update `CHECKOUT_PAGE_URL` in both files if different
4. Test URLs manually in browser

### Amount Not Displaying

**Solution:**
1. Check browser console for errors
2. Verify storage is working:
   - Open DevTools → Application → Storage
   - Check sessionStorage for `hingecraft_donation`
3. Verify amount is being passed in URL
4. Check contributions section selectors match page structure

---

## 📊 DEPLOYMENT STATUS

### Current Status:
- ✅ **Code Verified:** 13/13 functions exist
- ✅ **Files Verified:** 4/4 files exist
- ✅ **Wix CLI:** Authenticated
- ⏳ **Wix Dev:** Not running (needs start)
- ⏳ **Pages:** Need verification in Wix Editor
- ⏳ **Code:** Need embedding
- ⏳ **Publishing:** Pending

### Progress: 38.2% Complete

---

## 🎯 NEXT ACTIONS

1. **Start Wix Dev:** `wix dev`
2. **Verify Pages:** Check Wix Editor
3. **Embed Code:** Add code to pages
4. **Test:** Test complete flow
5. **Publish:** Publish to production

---

## 📁 RELATED FILES

- `WIX_DEPLOYMENT_STATUS_REPORT.md` - Detailed status report
- `CHARTER_PAYMENT_WIX_LIVE_1000_TASKS.json` - Complete task list
- `WIX_DEPLOYMENT_TASK_RESULTS.json` - Task execution results
- `public/pages/payment-page.js` - Payment page code
- `public/pages/charter-page.html` - Charter page code

---

**Status:** ✅ Ready to Deploy  
**Next:** Start `wix dev` and follow 5-step process  
**Estimated Time:** 15-30 minutes

