# Wix Deployment Automation Guide

## Quick Deployment Checklist

### ✅ Step 1: Upload Backend Files

**Files to Upload:**
1. `src/backend/charter-page-middleware.jsw`
2. `src/backend/charter-page-middleware.web.js`
3. `src/backend/mission-support-middleware.jsw`
4. `src/backend/mission-support-middleware.web.js`
5. `src/backend/stripe.api.jsw`
6. `src/backend/nowpayments.api.jsw`
7. `src/backend/email-templates.jsw`
8. `src/backend/hingecraft.api.web.jsw`

**Steps:**
1. Go to: https://editor.wix.com
2. Open your site → Click **Dev Mode** (top right)
3. Click **Backend** → **Functions** (left sidebar)
4. For each file:
   - Click **Add** → **Upload File**
   - Select file from repository
   - Wait for upload
   - Verify no red error indicators

**After Upload:**
- Click **Publish** (top right)
- Select **Publish to Test Site** or **Publish to Live Site**
- Wait for publish to complete (1-2 minutes)

---

### ✅ Step 2: Create Database Collections

See `DATABASE_COLLECTIONS_SETUP.md` for complete field-by-field setup.

**Quick List:**
1. **Donations**
2. **CryptoPayments**
3. **StripePayments**
4. **ContributionIntent**
5. **Members**
6. **PaymentRoutes**

**Steps:**
1. Go to: Wix Editor → **Database** → **Collections**
2. Click **Add Collection**
3. For each collection, add fields as specified in schema document
4. Set permissions: **Read: Anyone**, **Write: Site Owner**
5. Create indexes on key fields (see schema)

---

### ✅ Step 3: Set Up Secrets

See `WIX_SECRETS_CONFIGURATION.md` for complete secrets list.

**Required Secrets:**
- `STRIPE_SECRET_KEY_TEST`
- `STRIPE_PUBLISHABLE_KEY_TEST`
- `NOWPAYMENTS_API_KEY` (optional)

**Steps:**
1. Go to: Wix Editor → **Settings** → **Secrets Manager**
2. Click **Add Secret**
3. For each secret:
   - Enter name (exactly as shown)
   - Enter value
   - Click **Save**

---

## Automated Verification Script

After deployment, test these endpoints:

```javascript
// Test 1: Charter onReady
fetch('/_functions/charter-page-middleware/onReady', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
}).then(r => r.json()).then(console.log);

// Test 2: Get Cumulative Total
fetch('/_functions/charter-page-middleware/getCumulativeTotal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
}).then(r => r.json()).then(console.log);

// Test 3: Mission Support onReady
fetch('/_functions/mission-support-middleware/onReady', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
}).then(r => r.json()).then(console.log);
```

---

**Status:** Ready for deployment
