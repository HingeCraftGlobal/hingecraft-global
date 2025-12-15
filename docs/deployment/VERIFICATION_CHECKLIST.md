# Verification Checklist - Pre-Deployment

## ✅ Pre-Deployment Verification

### **1. Backend Files Uploaded**
- [ ] `database-sync.jsw`
- [ ] `database-sync.web.js`
- [ ] `rag-system.jsw`
- [ ] `rag-system.web.js`
- [ ] `chat-integration.jsw`
- [ ] `api-health-check.jsw`
- [ ] `api-health-check.web.js`
- [ ] `comprehensive-testing.jsw`
- [ ] `data-initialization.jsw`
- [ ] `data-initialization.web.js`
- [ ] `master-initialization.jsw`
- [ ] `master-initialization.web.js`
- [ ] `system-utilities.jsw`
- [ ] `system-utilities.web.js`
- [ ] `webhooks/stripe.jsw`
- [ ] `charter-page-middleware.jsw`
- [ ] `charter-page-middleware.web.js`
- [ ] `mission-support-middleware.jsw`
- [ ] `mission-support-middleware.web.js`
- [ ] `stripe.api.jsw`
- [ ] `nowpayments.api.jsw`
- [ ] `email-templates.jsw`
- [ ] `hingecraft.api.web.jsw`

### **2. Secrets Configured (Wix Secrets Manager)**
- [ ] `STRIPE_SECRET_KEY_TEST`
- [ ] `STRIPE_PUBLISHABLE_KEY_TEST`
- [ ] `NOWPAYMENTS_API_KEY`
- [ ] `SENDGRID_API_KEY`
- [ ] `EMAIL_FROM` (optional)

### **3. Database Collections Created**
- [ ] `Donations` (9 fields)
- [ ] `CryptoPayments` (12 fields)
- [ ] `StripePayments` (12 fields)
- [ ] `ContributionIntent` (15 fields)
- [ ] `Members` (15 fields)
- [ ] `PaymentRoutes` (12 fields)

### **4. Frontend Pages**
- [ ] `charter-page-final.html` uploaded
- [ ] `mission-support-form.html` uploaded
- [ ] Pages embedded in Wix

### **5. Initialization**
- [ ] Master initialization run
- [ ] Health check passed
- [ ] Database sync verified

---

## 🧪 Post-Deployment Testing

### **Payment Flows**
- [ ] Mission Support Preset Amount ($1, $5, $20)
- [ ] Mission Support Other Amount
- [ ] Charter Fiat Payment (Card)
- [ ] Charter Fiat Payment (ACH)
- [ ] Charter Crypto Payment ($30+)
- [ ] Crypto Minimum Validation (reject < $30)

### **System Functions**
- [ ] Database sync works
- [ ] Cumulative total calculates correctly
- [ ] Webhooks process payments
- [ ] Members created on payment
- [ ] Email notifications sent

### **API Health**
- [ ] Stripe API accessible
- [ ] NOWPayments API accessible
- [ ] SendGrid API accessible
- [ ] Database accessible

---

## 🔍 Verification Commands

### **Quick Health Check**
```javascript
GET /_functions/master-initialization/quickHealthCheck
```

### **Full System Status**
```javascript
GET /_functions/system-utilities/getSystemStatus
```

### **Setup Validation**
```javascript
GET /_functions/system-utilities/validateSystemSetup
```

### **Database Stats**
```javascript
GET /_functions/database-sync/getDatabaseStats
```

### **Test All Flows**
```javascript
POST /_functions/comprehensive-testing/testAllPaymentFlows
```

---

## ⚠️ Common Issues & Solutions

### **Issue: "Function not accessible"**
**Solution:**
1. Verify `.web.js` file is uploaded
2. Check function is exported
3. Publish site
4. Clear browser cache

### **Issue: "Collection does not exist"**
**Solution:**
1. Go to Wix → Database → Collections
2. Create missing collection
3. Add required fields
4. Run `verifyAllCollections()`

### **Issue: "API key not found"**
**Solution:**
1. Go to Wix → Settings → Secrets Manager
2. Add missing secret
3. Verify exact name matches
4. Run `checkAllAPIs()`

### **Issue: "Payment not syncing"**
**Solution:**
1. Run `syncPaymentData()`
2. Check database permissions
3. Verify webhook handlers active
4. Check error logs

---

## 📊 Success Criteria

**System is ready when:**
- ✅ All files uploaded
- ✅ All secrets configured
- ✅ All collections created
- ✅ Master initialization succeeds
- ✅ Health check passes
- ✅ All payment flows work
- ✅ Database syncs correctly
- ✅ Webhooks create members

---

**Last Updated:** December 13, 2025





