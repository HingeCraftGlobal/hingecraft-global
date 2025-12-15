# Wix Dev Mode - Step-by-Step Instructions

## 🚀 Opening Wix Dev Mode

### **Step 1: Access Wix Editor**
1. Go to: **https://editor.wix.com**
2. Sign in to your Wix account
3. Select your HingeCraft site

### **Step 2: Enable Dev Mode**
1. In the Wix Editor, look for **"Dev Mode"** button in the top right
2. Click **"Dev Mode"** to enable it
3. You should see a sidebar appear on the left

### **Step 3: Access Backend Functions**
1. In Dev Mode sidebar, click **"Backend"**
2. Click **"Functions"** (or "Backend Functions")
3. You'll see the list of backend files

---

## 📁 Upload Backend Files

### **Upload Process:**
1. In **Backend → Functions**, click **"Add"** or **"Upload File"**
2. Navigate to your local `src/backend/` folder
3. Upload files one by one, or select multiple files

### **Files to Upload (18 new files):**

**Priority 1 - Core Systems:**
```
✅ master-initialization.jsw
✅ master-initialization.web.js
✅ system-utilities.jsw
✅ system-utilities.web.js
```

**Priority 2 - Database & Sync:**
```
✅ database-sync.jsw
✅ database-sync.web.js
✅ data-initialization.jsw
✅ data-initialization.web.js
```

**Priority 3 - Additional Systems:**
```
✅ rag-system.jsw
✅ rag-system.web.js
✅ chat-integration.jsw
✅ api-health-check.jsw
✅ api-health-check.web.js
✅ comprehensive-testing.jsw
```

**Priority 4 - Webhooks:**
```
✅ webhooks/stripe.jsw
```

**Priority 5 - Verify Existing Files:**
```
✅ charter-page-middleware.jsw
✅ charter-page-middleware.web.js
✅ mission-support-middleware.jsw
✅ mission-support-middleware.web.js
✅ stripe.api.jsw
✅ nowpayments.api.jsw
✅ email-templates.jsw
✅ hingecraft.api.web.jsw
```

---

## ⚙️ Configure Secrets

### **Access Secrets Manager:**
1. In Wix Editor, click **"Settings"** (gear icon)
2. Click **"Secrets Manager"**
3. Click **"Add Secret"**

### **Add These Secrets:**
```
Name: STRIPE_SECRET_KEY_TEST
Value: [Your Stripe test secret key - starts with sk_test_]

Name: STRIPE_PUBLISHABLE_KEY_TEST
Value: [Your Stripe test publishable key - starts with pk_test_]

Name: NOWPAYMENTS_API_KEY
Value: [Your NOWPayments API key]

Name: SENDGRID_API_KEY
Value: [Your SendGrid API key - starts with SG.]
```

---

## 🧪 Test After Upload

### **Quick Test in Browser Console:**
1. After uploading files, click **"Publish"** → **"Publish to Test Site"**
2. Open your test site
3. Open browser console (F12)
4. Run this test:

```javascript
fetch('/_functions/master-initialization/quickHealthCheck')
  .then(r => r.json())
  .then(data => {
    console.log('Health Check:', data);
    if (data.success) {
      console.log('✅ System healthy!');
    }
  });
```

---

## 📋 Upload Checklist

### **Before Upload:**
- [ ] Wix Dev Mode enabled
- [ ] Backend → Functions section open
- [ ] Local files ready in `src/backend/`

### **During Upload:**
- [ ] Upload master-initialization files first
- [ ] Upload system-utilities files
- [ ] Upload database-sync files
- [ ] Upload remaining files
- [ ] Verify no red error indicators

### **After Upload:**
- [ ] Configure secrets
- [ ] Publish site
- [ ] Run health check
- [ ] Test master initialization

---

## 🔍 Verify Upload Success

### **Check File List:**
In Wix → Backend → Functions, you should see:
- ✅ All `.jsw` files listed
- ✅ All `.web.js` files listed
- ✅ No red error indicators
- ✅ File names match exactly

### **Test Function Access:**
```javascript
// Test if function is accessible
fetch('/_functions/master-initialization/quickHealthCheck')
  .then(r => {
    if (r.ok) {
      console.log('✅ Function accessible');
    } else {
      console.error('❌ Function not accessible:', r.status);
    }
  });
```

---

## ⚠️ Common Issues

### **"Can't find Dev Mode button"**
- Make sure you're in the Wix Editor (not site preview)
- Check if you have Dev Mode access (may need to enable in site settings)

### **"File upload fails"**
- Check file size (should be < 1MB per file)
- Verify file extension (.jsw or .web.js)
- Try uploading one file at a time

### **"Function not accessible after upload"**
- Make sure you published the site
- Check function is exported in file
- Verify file name matches endpoint path

---

## 🎯 Next Steps After Upload

1. **Configure Secrets** (if not done)
2. **Publish Site** (Test Site first)
3. **Run Health Check** (see test above)
4. **Run Master Initialization** (see BACKEND_TESTING_GUIDE.md)
5. **Test Payment Flows** (see testing guide)

---

## 📚 Related Documentation

- **[BACKEND_TESTING_GUIDE.md](./BACKEND_TESTING_GUIDE.md)** - Complete testing procedures
- **[WIX_TESTING_READY.md](./WIX_TESTING_READY.md)** - Quick testing start
- **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)** - Full deployment guide

---

**Last Updated:** December 13, 2025  
**Status:** Ready for Wix Dev Mode ✅





