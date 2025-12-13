# Backend File Upload Instructions - CRITICAL ⚠️

## Issue: HTTP 404 Errors

**Error:** `❌ Error calling /_functions/charter-page-middleware/onReady: Error: HTTP 404`

**Cause:** Backend files are **NOT uploaded** to Wix Dev Mode

---

## ✅ REQUIRED: Upload Backend Files to Wix

The backend files must be manually uploaded to Wix Dev Mode. They are **NOT** automatically deployed via git.

### Step-by-Step Instructions

#### Step 1: Open Wix Dev Mode

1. Go to: **https://editor.wix.com**
2. Open your site: **HingeCraft Global**
3. Click: **Dev Mode** (top right)
4. Click: **Backend** (left sidebar)
5. Click: **Functions** (submenu)

#### Step 2: Upload Backend Files

**You need to upload these files:**

1. **`charter-page-middleware.web.js`**
   - Location: `src/backend/charter-page-middleware.web.js`
   - **Action:** Click "Add" → "Upload File" → Select the file
   - **Verify:** File appears in Functions list

2. **`mission-support-middleware.web.js`**
   - Location: `src/backend/mission-support-middleware.web.js`
   - **Action:** Click "Add" → "Upload File" → Select the file

3. **`stripe.api.jsw`**
   - Location: `src/backend/stripe.api.jsw`
   - **Action:** Click "Add" → "Upload File" → Select the file

4. **`nowpayments.api.jsw`**
   - Location: `src/backend/nowpayments.api.jsw`
   - **Action:** Click "Add" → "Upload File" → Select the file

5. **`hingecraft.api.web.jsw`**
   - Location: `src/backend/hingecraft.api.web.jsw`
   - **Action:** Click "Add" → "Upload File" → Select the file

#### Step 3: Verify Functions Are Exported

After uploading `charter-page-middleware.web.js`, you should see these functions listed:

- ✅ `onReady`
- ✅ `cryptoButtonClick`
- ✅ `fiatButtonClick`
- ✅ `getCumulativeTotal`
- ✅ `afterPaymentWebhook`
- ✅ `redirectBackToCharter`

**If functions don't appear:**
- Check file name is exactly `charter-page-middleware.web.js`
- Check file has `export async function` for each function
- Check for syntax errors (red indicators in Wix Editor)

#### Step 4: Test HTTP Endpoints

After uploading, test these endpoints:

1. **Open Browser Console** (F12)
2. **Test onReady:**
   ```javascript
   fetch('/_functions/charter-page-middleware/onReady', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({})
   }).then(r => r.json()).then(console.log)
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "cumulativeTotal": 0,
     "donationAmount": null
   }
   ```

#### Step 5: Publish Site

After uploading all backend files:

1. Click: **Publish** (top right)
2. Select: **Publish to Test Site** or **Publish to Live Site**
3. Wait for publish to complete
4. Test the Charter page again

---

## File Locations in Repository

All backend files are located in:
```
hingecraft-global/
└── src/
    └── backend/
        ├── charter-page-middleware.web.js      ← REQUIRED
        ├── mission-support-middleware.web.js   ← REQUIRED
        ├── stripe.api.jsw                      ← REQUIRED
        ├── nowpayments.api.jsw                 ← REQUIRED
        └── hingecraft.api.web.jsw              ← REQUIRED
```

---

## Common Issues

### Issue 1: 404 Error After Upload
**Cause:** File not saved or not published  
**Fix:** 
1. Make sure file is saved in Wix Editor
2. Click "Publish" to deploy changes
3. Wait 1-2 minutes for deployment

### Issue 2: Functions Not Listed
**Cause:** Syntax error or missing exports  
**Fix:**
1. Check Wix Editor for red error indicators
2. Verify all functions have `export async function`
3. Check console for syntax errors

### Issue 3: Still Getting 404
**Cause:** Wrong file name or path  
**Fix:**
1. Verify file name is exactly: `charter-page-middleware.web.js`
2. Verify it's in the `Functions` folder (not `Pages` or `Public`)
3. Check the URL path matches: `/_functions/charter-page-middleware/onReady`

---

## Quick Checklist

- [ ] Opened Wix Dev Mode
- [ ] Navigated to Backend → Functions
- [ ] Uploaded `charter-page-middleware.web.js`
- [ ] Uploaded `mission-support-middleware.web.js`
- [ ] Uploaded `stripe.api.jsw`
- [ ] Uploaded `nowpayments.api.jsw`
- [ ] Uploaded `hingecraft.api.web.jsw`
- [ ] Verified functions appear in Functions list
- [ ] Published site
- [ ] Tested HTTP endpoint in browser console
- [ ] Tested Charter page - no more 404 errors

---

## Status

⚠️ **CRITICAL:** Backend files must be uploaded manually to Wix Dev Mode  
✅ **Code:** All backend files are ready in repository  
✅ **Git:** All changes committed and pushed  
⏳ **Waiting:** User to upload files to Wix

---

**Next Action:** Upload all 5 backend files to Wix Dev Mode → Backend → Functions
