# Upload Checklist - Wix Dev Mode

## 📋 Complete File Upload Checklist

### **New Files to Upload (18)**

#### **Master Initialization (2 files)**
- [ ] `src/backend/master-initialization.jsw`
- [ ] `src/backend/master-initialization.web.js`

#### **System Utilities (2 files)**
- [ ] `src/backend/system-utilities.jsw`
- [ ] `src/backend/system-utilities.web.js`

#### **Database Sync (2 files)**
- [ ] `src/backend/database-sync.jsw`
- [ ] `src/backend/database-sync.web.js`

#### **Data Initialization (2 files)**
- [ ] `src/backend/data-initialization.jsw`
- [ ] `src/backend/data-initialization.web.js`

#### **RAG System (2 files)**
- [ ] `src/backend/rag-system.jsw`
- [ ] `src/backend/rag-system.web.js`

#### **API Health Check (2 files)**
- [ ] `src/backend/api-health-check.jsw`
- [ ] `src/backend/api-health-check.web.js`

#### **Comprehensive Testing (1 file)**
- [ ] `src/backend/comprehensive-testing.jsw`

#### **Chat Integration (1 file)**
- [ ] `src/backend/chat-integration.jsw`

#### **Webhooks (1 file)**
- [ ] `src/backend/webhooks/stripe.jsw`

#### **Additional (3 files)**
- [ ] Verify `charter-page-middleware.jsw` exists
- [ ] Verify `charter-page-middleware.web.js` exists
- [ ] Verify `mission-support-middleware.jsw` exists
- [ ] Verify `mission-support-middleware.web.js` exists
- [ ] Verify `stripe.api.jsw` exists
- [ ] Verify `nowpayments.api.jsw` exists
- [ ] Verify `email-templates.jsw` exists
- [ ] Verify `hingecraft.api.web.jsw` exists

---

## 🔑 Secrets Configuration Checklist

- [ ] `STRIPE_SECRET_KEY_TEST` - Stripe test secret key
- [ ] `STRIPE_PUBLISHABLE_KEY_TEST` - Stripe test publishable key
- [ ] `NOWPAYMENTS_API_KEY` - NOWPayments API key
- [ ] `SENDGRID_API_KEY` - SendGrid API key
- [ ] `EMAIL_FROM` (optional) - Email from address

---

## ✅ Post-Upload Verification

### **Step 1: Publish Site**
- [ ] Click "Publish" in Wix Editor
- [ ] Select "Publish to Test Site"
- [ ] Wait for publish to complete

### **Step 2: Quick Health Check**
```javascript
// Run in browser console on test site
fetch('/_functions/master-initialization/quickHealthCheck')
  .then(r => r.json())
  .then(data => console.log('Health:', data));
```
- [ ] Health check returns `success: true`
- [ ] APIs show as healthy
- [ ] Database shows as healthy

### **Step 3: Master Initialization**
```javascript
// Run in browser console
fetch('/_functions/master-initialization/masterInitialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(data => console.log('Init:', data));
```
- [ ] All steps show `success: true`
- [ ] No errors in response
- [ ] Collections verified

---

## 🎯 Upload Order (Recommended)

1. **First:** Master initialization files
2. **Second:** System utilities files
3. **Third:** Database sync files
4. **Fourth:** Remaining system files
5. **Last:** Webhook files

---

## 📍 File Locations

**Local Path:** `src/backend/`  
**Wix Path:** Backend → Functions

**Webhook Files:** `src/backend/webhooks/`  
**Wix Path:** Backend → Functions → webhooks (create folder if needed)

---

**Status:** Ready for Upload ✅





