# Troubleshooting Guide - Common Issues & Solutions

## 🔴 Critical Issues

### **1. "Function not accessible" Error**

**Symptoms:**
- Error: `Function not accessible. Check that 'functionName' is exported in the backend module.`
- HTTP 404 or 403 errors
- CloudFront errors

**Causes:**
- `.web.js` file not uploaded
- Function not exported
- Site not published
- Incorrect endpoint path

**Solutions:**
1. **Verify file uploaded:**
   - Go to Wix Dev Mode → Backend → Functions
   - Check that `.web.js` file exists
   - Verify file name matches endpoint path

2. **Check function export:**
   ```javascript
   // In .web.js file, ensure function is exported:
   export async function functionName(data) { ... }
   ```

3. **Publish site:**
   - Click Publish in Wix Editor
   - Wait for publish to complete
   - Clear browser cache

4. **Verify endpoint path:**
   ```
   Correct: /_functions/module-name/functionName
   Wrong:   /_functions/module-name.web/functionName
   ```

---

### **2. "Collection does not exist" Error**

**Symptoms:**
- Error: `WDE0025: The [Collection] collection does not exist.`
- Database queries fail
- Data sync fails

**Causes:**
- Collection not created in Wix Database
- Collection name misspelled
- Permissions not set

**Solutions:**
1. **Create collection:**
   - Go to Wix → Database → Collections
   - Click "Add Collection"
   - Use exact name from schema

2. **Verify collection name:**
   - Check `DATABASE_COLLECTIONS_SETUP.md`
   - Ensure exact match (case-sensitive)

3. **Set permissions:**
   - Read: Anyone
   - Write: Site Owner

4. **Run verification:**
   ```javascript
   GET /_functions/database-sync/verifyAllCollections
   ```

---

### **3. "API key not found" Error**

**Symptoms:**
- Error: `No Stripe keys found` or `NOWPayments configuration missing`
- API calls fail
- Health checks fail

**Causes:**
- Secret not added to Wix Secrets Manager
- Secret name misspelled
- Secret value incorrect

**Solutions:**
1. **Add secret:**
   - Go to Wix → Settings → Secrets Manager
   - Click "Add Secret"
   - Use exact name from documentation

2. **Verify secret names:**
   ```
   STRIPE_SECRET_KEY_TEST
   STRIPE_PUBLISHABLE_KEY_TEST
   NOWPAYMENTS_API_KEY
   SENDGRID_API_KEY
   ```

3. **Check secret values:**
   - Stripe: Starts with `sk_test_` or `pk_test_`
   - NOWPayments: UUID format
   - SendGrid: Starts with `SG.`

4. **Test API:**
   ```javascript
   GET /_functions/api-health-check/checkAllAPIs
   ```

---

## 🟡 Warning Issues

### **4. "Payment not syncing"**

**Symptoms:**
- Payments processed but not in database
- Members not created
- Donations not recorded

**Causes:**
- Webhook not configured
- Database sync not run
- Webhook handler errors

**Solutions:**
1. **Run manual sync:**
   ```javascript
   POST /_functions/database-sync/syncPaymentData
   ```

2. **Check webhooks:**
   - Stripe: Configure webhook URL in Stripe Dashboard
   - NOWPayments: Configure IPN in NOWPayments Dashboard

3. **Verify webhook handlers:**
   - Check `webhooks/stripe.jsw` uploaded
   - Check `webhooks/nowpayments.jsw` uploaded

4. **Check error logs:**
   - Wix Dev Mode → Backend → Logs
   - Look for webhook errors

---

### **5. "Crypto minimum validation failing"**

**Symptoms:**
- Crypto payments < $30 accepted
- Error message not showing

**Causes:**
- Validation not enforced
- Frontend not handling error
- Backend validation missing

**Solutions:**
1. **Verify backend validation:**
   ```javascript
   // In charter-page-middleware.jsw
   if (validatedAmount < 30) {
     throw new Error('Crypto contributions must be $30 or more...');
   }
   ```

2. **Check frontend error handling:**
   - Verify error message displays
   - Check console for errors

3. **Test validation:**
   ```javascript
   POST /_functions/comprehensive-testing/testCryptoMinimum
   ```

---

### **6. "Email notifications not sending"**

**Symptoms:**
- Form submissions succeed
- No email received
- Email errors in logs

**Causes:**
- SendGrid API key missing
- Email address not verified
- Email function errors

**Solutions:**
1. **Check SendGrid key:**
   ```javascript
   GET /_functions/api-health-check/checkAllAPIs
   ```

2. **Verify email address:**
   - Check `EMAIL_FROM` secret
   - Verify email in SendGrid

3. **Check email function:**
   - Verify `email-templates.jsw` uploaded
   - Check error logs

4. **Test email:**
   - Submit Mission Support form
   - Check logs for email errors

---

## 🟢 Minor Issues

### **7. "Cumulative total not updating"**

**Symptoms:**
- Total shows 0 or old value
- Not updating after payment

**Solutions:**
1. **Recalculate total:**
   ```javascript
   GET /_functions/charter-page-middleware/getCumulativeTotal
   ```

2. **Sync payment data:**
   ```javascript
   POST /_functions/database-sync/syncPaymentData
   ```

3. **Check database:**
   - Verify payments in StripePayments/CryptoPayments
   - Verify donations in Donations

---

### **8. "RAG system not finding content"**

**Symptoms:**
- Query returns no results
- Pages not indexed

**Solutions:**
1. **Index pages:**
   ```javascript
   POST /_functions/rag-system/autoIndexAllPages
   ```

2. **Check indexed pages:**
   ```javascript
   GET /_functions/rag-system/getAllIndexedPages
   ```

3. **Verify PageContent collection:**
   - Create if missing (optional collection)

---

## 🔍 Diagnostic Commands

### **System Health Check**
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

### **Database Verification**
```javascript
GET /_functions/database-sync/verifyAllCollections
```

### **API Health**
```javascript
GET /_functions/api-health-check/checkAllAPIs
```

---

## 📞 Getting Help

### **Check Documentation**
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Full setup guide
- `QUICK_REFERENCE.md` - Quick commands
- `EXAMPLE_USAGE.md` - Code examples

### **Review Logs**
- Wix Dev Mode → Backend → Logs
- Browser console (F12)
- Network tab for HTTP errors

### **Verify Configuration**
- Run `validateSystemSetup()`
- Check all secrets configured
- Verify all collections exist

---

**Last Updated:** December 13, 2025





