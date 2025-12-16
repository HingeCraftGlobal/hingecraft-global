# Fix "Forbidden" Error - Backend Permissions

## Problem

When clicking the button on Mission Support form, you get a "forbidden" error. This is a **permissions issue** with Wix backend functions.

## Solution

### Option 1: Set Permissions in Wix Editor (Recommended)

1. **Open Wix Editor:**
   - Go to your Wix site
   - Click **Dev Mode** (top right)
   - Click **Backend** in left sidebar

2. **Select the Function:**
   - Find `mission-support-middleware.web.js`
   - Click on it

3. **Set Permissions:**
   - Click **Permissions** tab
   - Set to: **Anyone** (for public access)
   - Click **Save**

4. **Repeat for All Functions:**
   - `charter-page-middleware.web.js`
   - `createNowPaymentsInvoice.jsw` (if it's a web module)
   - Any other `.web.js` files

5. **Publish:**
   - Click **Publish** in top right
   - Changes take effect immediately

### Option 2: Use permissions.json File

The `permissions.json` file should allow anonymous access:

```json
{
  "web-methods": {
    "*": {
      "*": {
        "siteOwner": {"invoke": true},
        "siteMember": {"invoke": true},
        "anonymous": {"invoke": true}
      }
    }
  }
}
```

**Location:** `src/backend/permissions.json`

**Note:** This file may need to be manually uploaded to Wix if not syncing automatically.

### Option 3: Check Function Export

Ensure functions are exported correctly in `.web.js` files:

```javascript
// ✅ Correct
export async function goToCharterAfterPayment(value) {
  // ...
}

// ❌ Wrong (not exported)
async function goToCharterAfterPayment(value) {
  // ...
}
```

## Verification

After fixing permissions, test:

1. Open browser console (F12)
2. Navigate to Mission Support form
3. Fill form and click button
4. Check console for errors
5. Should see: `✅ Redirecting to: https://hingecraft-global.ai/charter...`

## Common Issues

### Issue: "Function not accessible"
**Fix:** Ensure `.web.js` file is uploaded and published

### Issue: "403 Forbidden"
**Fix:** Set permissions to "Anyone" in Wix Editor

### Issue: "Collection does not exist"
**Fix:** Create database collections (see `DATABASE_SETUP_INSTRUCTIONS.md`)

## Quick Test

Test the endpoint directly:

```javascript
// In browser console on your Wix site
fetch('/_functions/mission-support-middleware.web/goToCharterAfterPayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 10 })
})
.then(r => r.json())
.then(data => console.log('Result:', data));
```

**Expected:** Should return `{ success: true, redirectUrl: "..." }`

**If forbidden:** Permissions not set correctly
