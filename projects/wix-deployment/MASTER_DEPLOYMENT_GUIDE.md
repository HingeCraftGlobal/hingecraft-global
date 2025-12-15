# 🚀 Master Deployment Guide

**Status:** All Files Prepared for Deployment  
**Generated:** $(date)

---

## 📋 Deployment Checklist

### Phase 1: Backend Functions ✅ Ready
- [ ] Upload all backend functions (see `DEPLOYMENT_MANIFEST.md`)
- [ ] Verify functions appear in Functions list
- [ ] Test function accessibility

**Files:** `backend-functions/` → Upload to Wix Editor → Backend → Web Modules

---

### Phase 2: Secrets Configuration ✅ Ready
- [ ] Add all secrets to Wix Secrets Manager (see `SECRETS_CONFIG.md`)
- [ ] Verify all secrets are accessible
- [ ] Test secret retrieval

**Guide:** `SECRETS_CONFIG.md`

---

### Phase 3: Database Migration ✅ Ready
- [ ] Execute `database/init.sql`
- [ ] Verify tables created
- [ ] Test database connection

**File:** `database/init.sql`

---

### Phase 4: Frontend Pages ✅ Ready
- [ ] Add Mission Support form to `/payment` page
- [ ] Update Charter page
- [ ] Verify pages display correctly

**Guide:** `frontend-pages/DEPLOYMENT_INSTRUCTIONS.md`

---

### Phase 5: NOWPayments Configuration
- [ ] Configure webhook URL
- [ ] Set IPN secret
- [ ] Enable webhook events
- [ ] Test webhook

**Webhook URL:** `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`  
**IPN Secret:** `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`

---

### Phase 6: Testing ✅ Ready
- [ ] Upload test scripts to Wix Editor
- [ ] Run backend functions test
- [ ] Run secrets access test
- [ ] Run database connection test
- [ ] Test card payment flow
- [ ] Test crypto payment flow

**Scripts:** `test-scripts/`

---

## 📁 File Structure

```
deployment-ready/
├── backend-functions/          # Backend functions to upload
│   ├── *.jsw                  # Core functions
│   └── webhooks/              # Webhook endpoint
├── frontend-pages/            # Frontend pages
│   ├── *.html                 # HTML files
│   └── DEPLOYMENT_INSTRUCTIONS.md
├── database/                  # Database schema
│   └── init.sql              # Migration script
├── test-scripts/              # Test scripts
│   ├── test-backend-functions.js
│   ├── test-secrets-access.js
│   └── test-database-connection.js
├── SECRETS_CONFIG.md          # Secrets configuration guide
├── DEPLOYMENT_MANIFEST.md     # Backend functions manifest
└── MASTER_DEPLOYMENT_GUIDE.md # This file
```

---

## 🎯 Quick Start

1. **Backend Functions** (15 min)
   - Upload all `.jsw` files
   - Verify no errors

2. **Secrets** (10 min)
   - Add all 10 secrets
   - Test access

3. **Database** (5 min)
   - Run `init.sql`
   - Verify tables

4. **Frontend** (10 min)
   - Add HTML elements
   - Verify display

5. **Webhook** (5 min)
   - Configure NOWPayments
   - Test webhook

6. **Testing** (30 min)
   - Run all tests
   - Test payment flows

**Total Time:** ~75 minutes

---

## 📚 Reference Documents

- **Backend Functions:** `DEPLOYMENT_MANIFEST.md`
- **Secrets:** `SECRETS_CONFIG.md`
- **Frontend:** `frontend-pages/DEPLOYMENT_INSTRUCTIONS.md`
- **Testing:** `../TESTING_GUIDE.md`
- **Verification:** `../DEPLOYMENT_VERIFICATION_CHECKLIST.md`

---

## ✅ Success Criteria

- [ ] All backend functions uploaded
- [ ] All secrets configured
- [ ] Database migration complete
- [ ] Frontend pages deployed
- [ ] NOWPayments webhook configured
- [ ] All tests passing
- [ ] Payment flows working

---

**Status:** Ready for Deployment  
**Next Action:** Start with Phase 1 (Backend Functions)
