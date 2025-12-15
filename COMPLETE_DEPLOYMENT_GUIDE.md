# Complete Deployment Guide - All Systems

## 🚀 Quick Start (5 Minutes)

### Step 1: Upload Backend Files (2 minutes)

**Go to:** Wix Editor → Dev Mode → Backend → Functions

**Upload these files:**
```
src/backend/database-sync.jsw
src/backend/database-sync.web.js
src/backend/rag-system.jsw
src/backend/rag-system.web.js
src/backend/chat-integration.jsw
src/backend/api-health-check.jsw
src/backend/api-health-check.web.js
src/backend/comprehensive-testing.jsw
src/backend/data-initialization.jsw
src/backend/data-initialization.web.js
src/backend/master-initialization.jsw
src/backend/master-initialization.web.js
src/backend/webhooks/stripe.jsw
```

**Also ensure these existing files are uploaded:**
```
src/backend/charter-page-middleware.jsw
src/backend/charter-page-middleware.web.js
src/backend/mission-support-middleware.jsw
src/backend/mission-support-middleware.web.js
src/backend/stripe.api.jsw
src/backend/nowpayments.api.jsw
src/backend/email-templates.jsw
src/backend/hingecraft.api.web.jsw
```

---

### Step 2: Run Master Initialization (1 minute)

**Via HTTP endpoint:**
```bash
POST https://your-site.wixsite.com/_functions/master-initialization/masterInitialize
```

**Or via Wix Velo Console:**
```javascript
import { masterInitialize } from 'backend/master-initialization';
const result = await masterInitialize();
console.log(result);
```

**What it does:**
1. ✅ Checks API health (Stripe, NOWPayments, SendGrid)
2. ✅ Verifies all 6 database collections
3. ✅ Initializes PaymentRoutes with default routes
4. ✅ Syncs payment data between collections
5. ✅ Indexes pages for RAG system
6. ✅ Gets database statistics

---

### Step 3: Verify Setup (1 minute)

**Quick health check:**
```bash
GET /_functions/master-initialization/quickHealthCheck
```

**Expected response:**
```json
{
  "success": true,
  "checks": {
    "apis": "healthy",
    "database": "healthy"
  }
}
```

---

### Step 4: Publish Site (1 minute)

1. Click **Publish** in Wix Editor
2. Select **Publish to Test Site** or **Publish to Live Site**
3. Wait for publish to complete

---

## 📋 Complete Setup Checklist

### **Backend Files (13 new + existing)**
- [ ] database-sync.jsw
- [ ] database-sync.web.js
- [ ] rag-system.jsw
- [ ] rag-system.web.js
- [ ] chat-integration.jsw
- [ ] api-health-check.jsw
- [ ] api-health-check.web.js
- [ ] comprehensive-testing.jsw
- [ ] data-initialization.jsw
- [ ] data-initialization.web.js
- [ ] master-initialization.jsw
- [ ] master-initialization.web.js
- [ ] webhooks/stripe.jsw
- [ ] All existing backend files

### **Database Collections (6 required)**
- [ ] Donations
- [ ] CryptoPayments
- [ ] StripePayments
- [ ] ContributionIntent
- [ ] Members
- [ ] PaymentRoutes
- [ ] PageContent (optional - for RAG)

### **Secrets (Required)**
- [ ] STRIPE_SECRET_KEY_TEST
- [ ] STRIPE_PUBLISHABLE_KEY_TEST
- [ ] NOWPAYMENTS_API_KEY
- [ ] SENDGRID_API_KEY
- [ ] EMAIL_FROM (optional)

### **Initialization**
- [ ] Run masterInitialize()
- [ ] Verify health check passes
- [ ] Test payment flows

---

## 🔧 System Endpoints

### **Database Sync**
```
POST /_functions/database-sync/verifyAllCollections
POST /_functions/database-sync/syncPaymentData
GET  /_functions/database-sync/getDatabaseStats
POST /_functions/database-sync/cleanupExpiredPrefills
```

### **RAG System**
```
POST /_functions/rag-system/indexPageContent
POST /_functions/rag-system/queryRAG
GET  /_functions/rag-system/getAllIndexedPages
POST /_functions/rag-system/autoIndexAllPages
```

### **API Health**
```
GET  /_functions/api-health-check/checkAllAPIs
GET  /_functions/api-health-check/getSystemMetrics
```

### **Testing**
```
POST /_functions/comprehensive-testing/testAllPaymentFlows
POST /_functions/comprehensive-testing/testDatabaseSync
POST /_functions/comprehensive-testing/testCumulativeTotal
```

### **Data Initialization**
```
POST /_functions/data-initialization/initializeAllCollections
POST /_functions/data-initialization/createSampleData
GET  /_functions/data-initialization/verifyCollectionStructure?collectionName=Donations
```

### **Master Initialization**
```
POST /_functions/master-initialization/masterInitialize
GET  /_functions/master-initialization/quickHealthCheck
```

---

## 🧪 Testing All Systems

### **1. Test Payment Flows**
```javascript
POST /_functions/comprehensive-testing/testAllPaymentFlows
```

**Tests:**
- ✅ Mission Support Preset Amount
- ✅ Mission Support Other Amount
- ✅ Charter Fiat Payment
- ✅ Charter Crypto Payment
- ✅ Crypto Minimum ($30)
- ✅ ACH Routing

### **2. Test Database Sync**
```javascript
POST /_functions/comprehensive-testing/testDatabaseSync
```

### **3. Test Cumulative Total**
```javascript
POST /_functions/comprehensive-testing/testCumulativeTotal
```

### **4. Test RAG System**
```javascript
POST /_functions/rag-system/queryRAG
Body: {
  "query": "membership tiers",
  "limit": 5
}
```

---

## 📊 Monitoring & Maintenance

### **Daily Checks**
```javascript
GET /_functions/master-initialization/quickHealthCheck
```

### **Weekly Sync**
```javascript
POST /_functions/database-sync/syncPaymentData
POST /_functions/database-sync/cleanupExpiredPrefills
```

### **Monthly Stats**
```javascript
GET /_functions/database-sync/getDatabaseStats
GET /_functions/api-health-check/getSystemMetrics
```

---

## 🔍 Troubleshooting

### **Issue: "Collection does not exist"**
**Solution:**
1. Go to Wix → Database → Collections
2. Create missing collection
3. Add required fields (see DATABASE_COLLECTIONS_SETUP.md)
4. Run `verifyAllCollections()` again

### **Issue: "API key not found"**
**Solution:**
1. Go to Wix → Settings → Secrets Manager
2. Add missing secret
3. Run `checkAllAPIs()` again

### **Issue: "Function not accessible"**
**Solution:**
1. Verify `.web.js` file is uploaded
2. Check function is exported
3. Publish site
4. Clear browser cache

### **Issue: "Payment data not syncing"**
**Solution:**
1. Run `syncPaymentData()`
2. Check database permissions
3. Verify webhook handlers are active

---

## 📈 System Architecture

```
User Action
    ↓
Frontend (HTML/React)
    ↓
HTTP Endpoint (.web.js) OR Direct Import (.jsw)
    ↓
Backend Function
    ↓
API Integration (Stripe/NOWPayments/SendGrid)
    ↓
Database (Wix Collections)
    ↓
Webhook Handler
    ↓
Data Sync
    ↓
Member Creation
```

---

## 🎯 Success Criteria

**System is ready when:**
- ✅ All API health checks pass
- ✅ All database collections exist
- ✅ Master initialization completes successfully
- ✅ All payment flows work
- ✅ Data syncs correctly between collections
- ✅ Webhooks create member records

---

## 📞 Support

**Documentation:**
- `SYSTEM_BUILD_COMPLETE.md` - System overview
- `DATABASE_COLLECTIONS_SETUP.md` - Database setup
- `WIX_SECRETS_CONFIGURATION.md` - API keys
- `COMPLETE_SYSTEM_FLOW.md` - User flows

**Testing:**
- `comprehensive-testing.jsw` - All test functions
- `api-health-check.jsw` - Health monitoring

---

**Last Updated:** December 13, 2025  
**Status:** Complete deployment guide ready





