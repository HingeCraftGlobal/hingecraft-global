# Verify Backend Upload - Troubleshooting Guide

## Current Error

**Error:** `Failed to create Stripe invoice: Function not accessible. Check that 'fiatButtonClick' is exported in the backend module.`

## Root Cause Analysis

The function `fiatButtonClick` **IS** properly exported in the code:
```javascript
export async function fiatButtonClick(preset) {
    // ... function code
}
```

**The issue is:** The backend file is **NOT uploaded to Wix Dev Mode**.

---

## Verification Steps

### Step 1: Check if File is Uploaded

1. Go to: **https://editor.wix.com**
2. Open your site
3. Click: **Dev Mode** (top right)
4. Click: **Backend** (left sidebar)
5. Click: **Functions** (submenu)

**Check for:**
- [ ] `charter-page-middleware.web.js` appears in the Functions list
- [ ] File shows no red error indicators
- [ ] Functions are listed when you click on the file

### Step 2: Verify Function Exports

When you click on `charter-page-middleware.web.js`, you should see these functions:

- ✅ `onReady`
- ✅ `cryptoButtonClick`
- ✅ `fiatButtonClick` ← **This must be visible**
- ✅ `getCumulativeTotal`
- ✅ `afterPaymentWebhook`
- ✅ `redirectBackToCharter`

**If `fiatButtonClick` is NOT listed:**
- The file has a syntax error
- Check Wix Editor for red error indicators
- Verify the function has `export async function fiatButtonClick(...)`

### Step 3: Test HTTP Endpoint Directly

Open browser console on your Wix site and run:

```javascript
// Test fiatButtonClick endpoint
fetch('/_functions/charter-page-middleware/fiatButtonClick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 30,
    paymentMethod: 'card',
    tier: 'VIP',
    years: null
  })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ Function is accessible!');
  } else {
    console.error('❌ Error:', data.error);
  }
})
.catch(err => {
  console.error('❌ Request failed:', err);
  if (err.message.includes('404')) {
    console.error('⚠️  Backend file not uploaded!');
  }
});
```

**Expected Results:**

✅ **If function is accessible:**
```json
{
  "success": true,
  "invoiceId": "in_test_...",
  "invoiceUrl": "https://invoice.stripe.com/...",
  "amount": 30
}
```

❌ **If file not uploaded:**
```
Error: HTTP 404
```

❌ **If function not exported:**
```json
{
  "success": false,
  "error": "Function not accessible..."
}
```

---

## Common Issues & Solutions

### Issue 1: File Not Uploaded

**Symptom:** HTTP 404 error  
**Solution:**
1. Upload `charter-page-middleware.web.js` to Wix Dev Mode
2. Go to: **Backend → Functions → Add → Upload File**
3. Select: `src/backend/charter-page-middleware.web.js`
4. Click **Publish**

### Issue 2: Function Not Listed

**Symptom:** File uploaded but function doesn't appear  
**Solution:**
1. Check for syntax errors in Wix Editor (red indicators)
2. Verify function has `export async function fiatButtonClick(...)`
3. Check for missing imports or dependencies
4. Save file and republish

### Issue 3: Permissions Error

**Symptom:** 403 Forbidden error  
**Solution:**
1. Check `permissions.json` file
2. Verify it allows anonymous access:
   ```json
   {
     "web-methods": {
       "*": {
         "*": {
           "siteOwner": { "invoke": true },
           "siteMember": { "invoke": true },
           "anonymous": { "invoke": true }
         }
       }
     }
   }
   ```
3. Upload `permissions.json` to Wix if not already uploaded

### Issue 4: Wrong File Name

**Symptom:** File uploaded but wrong name  
**Solution:**
1. File must be exactly: `charter-page-middleware.web.js`
2. Not: `charter-page-middleware.js` (missing `.web`)
3. Not: `charterPageMiddleware.web.js` (wrong naming)
4. Delete old file and upload with correct name

---

## Quick Fix Checklist

- [ ] File `charter-page-middleware.web.js` is uploaded to Wix
- [ ] File appears in **Backend → Functions** list
- [ ] Function `fiatButtonClick` is listed when clicking the file
- [ ] No red error indicators in Wix Editor
- [ ] `permissions.json` is uploaded (allows anonymous access)
- [ ] Site is published after uploading
- [ ] Test endpoint returns success (not 404)

---

## File Locations

**Repository:**
```
hingecraft-global/
└── src/
    └── backend/
        ├── charter-page-middleware.web.js      ← Upload this
        └── permissions.json                     ← Upload this too
```

**Wix Dev Mode:**
```
Backend → Functions → charter-page-middleware.web.js
```

---

## Still Not Working?

If you've verified all steps and still getting errors:

1. **Check Wix Editor Console:**
   - Open Dev Mode
   - Check for any error messages
   - Look for red indicators on files

2. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Network tab for failed requests
   - Look for exact error messages

3. **Verify File Content:**
   - Open `charter-page-middleware.web.js` in Wix Editor
   - Search for `fiatButtonClick`
   - Verify it has `export async function fiatButtonClick(...)`

4. **Test Other Functions:**
   - Try calling `onReady` first
   - If that works, the file is uploaded
   - If `onReady` also fails, file is not uploaded

---

**Status:** ⚠️ Backend file must be uploaded to Wix Dev Mode manually





