# Quick Fix: "Forbidden" Error

## Immediate Fix (2 minutes)

1. **Open Wix Editor:**
   - Go to your Wix site
   - Click **Dev Mode** (top right)

2. **Fix Permissions:**
   - Click **Backend** in left sidebar
   - Find `mission-support-middleware.web.js`
   - Click on it
   - Click **Permissions** tab
   - Change to: **Anyone**
   - Click **Save**
   - Click **Publish**

3. **Test:**
   - Go to Mission Support form
   - Fill form and click button
   - Should redirect (no forbidden error)

## Why This Happens

Wix backend functions default to "Site Members Only" permission. Since the Mission Support form is public, it needs "Anyone" permission.

## All Functions That Need "Anyone" Permission

- `mission-support-middleware.web.js`
- `charter-page-middleware.web.js`
- `createNowPaymentsInvoice.jsw` (if it's a web module)

## Verify It's Fixed

Open browser console and run:
```javascript
fetch('/_functions/mission-support-middleware.web/goToCharterAfterPayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 10 })
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

**Expected:** `{ success: true, redirectUrl: "..." }`

**If still forbidden:** Function not published or wrong file selected
