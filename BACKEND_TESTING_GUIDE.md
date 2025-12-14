# Backend Testing Guide - Wix Dev Mode

## 🚀 Quick Start Testing

### **Step 1: End Old Wix Session**
1. Close all Wix Editor tabs
2. Clear browser cache (optional but recommended)
3. Open new Wix Editor session
4. Go to Dev Mode → Backend → Functions

### **Step 2: Upload Backend Files**
Upload all files from `src/backend/` to Wix:

**Required Files (18):**
```
✅ database-sync.jsw
✅ database-sync.web.js
✅ rag-system.jsw
✅ rag-system.web.js
✅ chat-integration.jsw
✅ api-health-check.jsw
✅ api-health-check.web.js
✅ comprehensive-testing.jsw
✅ data-initialization.jsw
✅ data-initialization.web.js
✅ master-initialization.jsw
✅ master-initialization.web.js
✅ system-utilities.jsw
✅ system-utilities.web.js
✅ webhooks/stripe.jsw
✅ charter-page-middleware.jsw (existing)
✅ charter-page-middleware.web.js (existing)
✅ mission-support-middleware.jsw (existing)
✅ mission-support-middleware.web.js (existing)
✅ stripe.api.jsw (existing)
✅ nowpayments.api.jsw (existing)
✅ email-templates.jsw (existing)
✅ hingecraft.api.web.jsw (existing)
```

### **Step 3: Configure Secrets**
Go to Wix → Settings → Secrets Manager

**Add these secrets:**
- `STRIPE_SECRET_KEY_TEST`
- `STRIPE_PUBLISHABLE_KEY_TEST`
- `NOWPAYMENTS_API_KEY`
- `SENDGRID_API_KEY`

### **Step 4: Publish Site**
1. Click **Publish** in Wix Editor
2. Select **Publish to Test Site**
3. Wait for publish to complete

---

## 🧪 Backend Testing Checklist

### **Test 1: Master Initialization**
```javascript
// In Wix Velo Console or browser console
fetch('/_functions/master-initialization/masterInitialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Master Init:', data);
    if (data.success) {
      console.log('All systems initialized successfully!');
    } else {
      console.error('❌ Errors:', data.errors);
    }
  });
```

**Expected Result:**
- ✅ All steps show `success: true`
- ✅ No errors in `errors` array
- ✅ Collections verified
- ✅ APIs healthy

---

### **Test 2: Quick Health Check**
```javascript
fetch('/_functions/master-initialization/quickHealthCheck')
  .then(r => r.json())
  .then(data => {
    console.log('Health:', data);
    if (data.success && data.checks.apis === 'healthy' && data.checks.database === 'healthy') {
      console.log('✅ System healthy!');
    } else {
      console.warn('⚠️ System degraded');
    }
  });
```

**Expected Result:**
- ✅ `success: true`
- ✅ `checks.apis: "healthy"`
- ✅ `checks.database: "healthy"`

---

### **Test 3: System Status**
```javascript
fetch('/_functions/system-utilities/getSystemStatus')
  .then(r => r.json())
  .then(data => {
    console.log('System Status:', data);
    console.log('Overall:', data.overall);
    console.log('APIs:', data.systems.apis);
    console.log('Database:', data.systems.database);
  });
```

**Expected Result:**
- ✅ `overall: "healthy"`
- ✅ All APIs accessible
- ✅ Database accessible

---

### **Test 4: Setup Validation**
```javascript
fetch('/_functions/system-utilities/validateSystemSetup')
  .then(r => r.json())
  .then(data => {
    console.log('Validation:', data);
    data.checks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${check.status}`);
    });
  });
```

**Expected Result:**
- ✅ All checks show `status: "pass"`
- ✅ API Keys: pass
- ✅ Database Collections: pass
- ✅ Backend Functions: pass

---

### **Test 5: Database Verification**
```javascript
fetch('/_functions/database-sync/verifyAllCollections')
  .then(r => r.json())
  .then(data => {
    console.log('Collections:', data);
    Object.keys(data.collections).forEach(name => {
      const coll = data.collections[name];
      const icon = coll.exists && coll.accessible ? '✅' : '❌';
      console.log(`${icon} ${name}: ${coll.exists ? 'exists' : 'missing'}`);
    });
  });
```

**Expected Result:**
- ✅ All 6 collections show `exists: true`
- ✅ All collections `accessible: true`

---

### **Test 6: API Health Check**
```javascript
fetch('/_functions/api-health-check/checkAllAPIs')
  .then(r => r.json())
  .then(data => {
    console.log('API Health:', data);
    Object.keys(data.apis).forEach(api => {
      const status = data.apis[api].status;
      const icon = status === 'healthy' ? '✅' : '⚠️';
      console.log(`${icon} ${api}: ${status}`);
    });
  });
```

**Expected Result:**
- ✅ Stripe: `status: "healthy"`
- ✅ NOWPayments: `status: "healthy"` (if key configured)
- ✅ SendGrid: `status: "healthy"` (if key configured)
- ✅ Database: `status: "healthy"`

---

### **Test 7: Payment Flow Tests**
```javascript
fetch('/_functions/comprehensive-testing/testAllPaymentFlows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(data => {
    console.log('Payment Tests:', data);
    data.tests.forEach(test => {
      const icon = test.success ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.success ? 'PASS' : 'FAIL'}`);
      if (test.error) console.log(`   Error: ${test.error}`);
    });
  });
```

**Expected Result:**
- ✅ All 6 payment flow tests pass
- ✅ No errors in `errors` array

---

### **Test 8: Database Stats**
```javascript
fetch('/_functions/database-sync/getDatabaseStats')
  .then(r => r.json())
  .then(data => {
    console.log('Database Stats:', data);
    console.log('Total Donations:', data.totals.donations);
    console.log('Total Crypto:', data.totals.cryptoPayments);
    console.log('Total Stripe:', data.totals.stripePayments);
    console.log('Grand Total:', data.amounts.grandTotal);
  });
```

**Expected Result:**
- ✅ Stats retrieved successfully
- ✅ All collections accessible
- ✅ Totals calculated correctly

---

### **Test 9: Individual Function Tests**

#### **Test Charter Middleware**
```javascript
// Test getCumulativeTotal
fetch('/_functions/charter-page-middleware/getCumulativeTotal')
  .then(r => r.json())
  .then(data => console.log('Cumulative Total:', data));
```

#### **Test Mission Support Middleware**
```javascript
// Test onReady
fetch('/_functions/mission-support-middleware/onReady', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
  .then(r => r.json())
  .then(data => console.log('Mission Support Ready:', data));
```

#### **Test Stripe API**
```javascript
// Test getPublishableKey
fetch('/_functions/stripe.api/getPublishableKey')
  .then(r => r.json())
  .then(data => {
    console.log('Stripe Key:', data);
    if (data.publishableKey) {
      console.log('✅ Stripe configured');
    }
  });
```

---

## 🔍 Testing in Wix Velo Console

### **Access Velo Console:**
1. Wix Editor → Dev Mode
2. Click **Backend** → **Functions**
3. Click any function file
4. Use console at bottom

### **Test Direct Import:**
```javascript
// In Velo Console
import { masterInitialize } from 'backend/master-initialization';
const result = await masterInitialize();
console.log(result);
```

---

## 📊 Testing Results Template

```javascript
// Copy this template to track test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: {
    masterInit: null,
    healthCheck: null,
    systemStatus: null,
    setupValidation: null,
    databaseVerification: null,
    apiHealth: null,
    paymentFlows: null,
    databaseStats: null
  },
  overall: 'pending'
};

// Run tests and fill in results
// Mark as ✅ pass or ❌ fail
```

---

## ⚠️ Common Testing Issues

### **"Function not accessible"**
- ✅ Verify `.web.js` file uploaded
- ✅ Check function is exported
- ✅ Publish site
- ✅ Clear cache

### **"Collection does not exist"**
- ✅ Create collection in Wix Database
- ✅ Verify exact name match
- ✅ Set permissions

### **"API key not found"**
- ✅ Add secret in Secrets Manager
- ✅ Verify exact name
- ✅ Check secret value

---

## ✅ Success Criteria

**Backend is ready when:**
- ✅ All files uploaded
- ✅ Master initialization succeeds
- ✅ Health check passes
- ✅ All APIs accessible
- ✅ All collections exist
- ✅ Payment flow tests pass
- ✅ No critical errors

---

## 🎯 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Re-run tests** to verify fixes
3. **Test on live site** (if test site passes)
4. **Monitor logs** for errors
5. **Test actual payments** (use test mode)

---

**Last Updated:** December 13, 2025  
**Status:** Ready for Testing ✅
