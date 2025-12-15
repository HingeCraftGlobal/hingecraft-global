# Troubleshooting: "Function not accessible" Error

## Error Message
```
Failed to create Stripe invoice: Function not accessible. 
Check that 'fiatButtonClick' is exported in the backend module.
```

---

## Root Cause

This error occurs when:
1. **The `.web.js` file is NOT uploaded to Wix** (most common)
2. **The file has syntax errors** preventing it from loading
3. **The file name is incorrect** (must match exactly)
4. **The site hasn't been published** after uploading

---

## ✅ Step-by-Step Fix

### Step 1: Verify File Exists in Repository

**File Location:** `src/backend/charter-page-middleware.web.js`

**Verify it exists:**
```bash
ls -la src/backend/charter-page-middleware.web.js
```

**Verify function is exported:**
```bash
grep "export.*fiatButtonClick" src/backend/charter-page-middleware.web.js
```

Should show:
```javascript
export async function fiatButtonClick(preset) {
```

---

### Step 2: Upload to Wix Dev Mode

**CRITICAL:** The `.web.js` file MUST be manually uploaded to Wix.

1. **Open Wix Editor:**
   - Go to: https://editor.wix.com
   - Open your site: **HingeCraft Global**
   - Click: **Dev Mode** (top right)

2. **Navigate to Backend Functions:**
   - Click: **Backend** (left sidebar)
   - Click: **Functions** (submenu)

3. **Upload the File:**
   - Click: **Add** → **Upload File**
   - Select: `src/backend/charter-page-middleware.web.js`
   - **IMPORTANT:** File name must be exactly: `charter-page-middleware.web.js`
   - Wait for upload to complete

4. **Verify Upload:**
   - File should appear in the Functions list
   - Click on the file to open it
   - Check for red error indicators

---

### Step 3: Check for Syntax Errors

**In Wix Editor, look for:**
- ❌ Red error indicators on the file
- ❌ Red squiggly lines under code
- ❌ Error messages in the console

**Common syntax errors:**
- Missing closing braces `}`
- Missing semicolons
- Incorrect import paths
- Duplicate variable declarations

**If you see errors:**
1. Copy the error message
2. Check the file in the repository
3. Fix the syntax error
4. Re-upload the file

---

### Step 4: Verify Function Export

**In Wix Editor, after uploading:**

1. **Open the file:** `charter-page-middleware.web.js`
2. **Search for:** `fiatButtonClick`
3. **Verify it shows:**
   ```javascript
   export async function fiatButtonClick(preset) {
   ```

4. **Check Functions List:**
   - In the Functions sidebar, you should see:
     - ✅ `onReady`
     - ✅ `cryptoButtonClick`
     - ✅ `fiatButtonClick`
     - ✅ `getCumulativeTotal`
     - ✅ `afterPaymentWebhook`
     - ✅ `redirectBackToCharter`

**If `fiatButtonClick` is NOT listed:**
- The function is not exported correctly
- Check for syntax errors
- Verify the `export` keyword is present

---

### Step 5: Publish the Site

**CRITICAL:** After uploading, you MUST publish:

1. Click: **Publish** (top right)
2. Select: **Publish to Test Site** (or Live Site)
3. Wait for publish to complete (1-2 minutes)
4. **DO NOT skip this step!**

**Why:** Uploading the file doesn't make it live. Publishing deploys it.

---

### Step 6: Test the Endpoint

**After publishing, test in browser console:**

```javascript
fetch('/_functions/charter-page-middleware/fiatButtonClick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1, paymentMethod: 'card' })
})
.then(r => r.json())
.then(console.log)
```

**Expected Response:**
```json
{
  "success": true,
  "invoiceId": "in_...",
  "invoiceUrl": "https://invoice.stripe.com/...",
  ...
}
```

**If you get 404:**
- File not uploaded correctly
- File name is wrong
- Site not published

**If you get 500:**
- Syntax error in the file
- Check Wix Editor for error messages

---

## 🔍 Verification Checklist

- [ ] File exists in repository: `src/backend/charter-page-middleware.web.js`
- [ ] Function is exported: `export async function fiatButtonClick`
- [ ] File uploaded to Wix Dev Mode → Backend → Functions
- [ ] File name is exactly: `charter-page-middleware.web.js`
- [ ] No red error indicators in Wix Editor
- [ ] Function appears in Functions list
- [ ] Site has been published
- [ ] Test endpoint returns success (not 404)

---

## 🚨 Common Issues

### Issue 1: "File uploaded but still getting 404"

**Cause:** Site not published after upload

**Fix:**
1. Click **Publish** in Wix Editor
2. Wait for publish to complete
3. Test again

---

### Issue 2: "Function not in Functions list"

**Cause:** Syntax error preventing file from loading

**Fix:**
1. Check Wix Editor for red error indicators
2. Fix syntax errors
3. Re-upload file
4. Publish site

---

### Issue 3: "File name mismatch"

**Cause:** File name doesn't match exactly

**Required name:** `charter-page-middleware.web.js`

**NOT:**
- `charter-page-middleware.web.js.js` ❌
- `charter_page_middleware.web.js` ❌
- `charter-page-middleware.js` ❌

---

### Issue 4: "Still getting error after all steps"

**Possible causes:**
1. Browser cache - Clear cache and hard refresh (Ctrl+Shift+R)
2. Wix cache - Wait 2-3 minutes, try again
3. Wrong environment - Make sure you're testing on the published site, not preview

---

## 📋 Quick Reference

**File to Upload:**
```
src/backend/charter-page-middleware.web.js
```

**Wix Location:**
```
Dev Mode → Backend → Functions
```

**HTTP Endpoint:**
```
/_functions/charter-page-middleware/fiatButtonClick
```

**Required Actions:**
1. Upload file
2. Verify no errors
3. Publish site
4. Test endpoint

---

## ✅ Success Indicators

When everything is working:
- ✅ No "Function not accessible" errors
- ✅ HTTP endpoint returns JSON response
- ✅ Invoice is created successfully
- ✅ Payment button works on Charter page

---

**Last Updated:** After fixing parameter handling and duplicate imports
**Status:** Ready for upload and testing





