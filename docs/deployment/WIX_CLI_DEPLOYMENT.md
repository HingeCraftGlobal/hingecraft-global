# Wix CLI Deployment Guide

## 🚀 Wix CLI Setup & Deployment

### **Step 1: Install Wix CLI (if not installed)**

```bash
npm install -g @wix/cli
```

Or using yarn:
```bash
yarn global add @wix/cli
```

### **Step 2: Login to Wix**

```bash
wix login
```

This will open your browser to authenticate with Wix.

### **Step 3: Initialize Wix Project (if needed)**

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix init
```

### **Step 4: Deploy Backend Files**

#### **Option A: Deploy All Backend Files**
```bash
wix deploy --source local
```

#### **Option B: Deploy Specific Directory**
```bash
wix deploy src/backend --source local
```

#### **Option C: Deploy Individual Files**
```bash
# Deploy specific files
wix deploy src/backend/master-initialization.jsw
wix deploy src/backend/master-initialization.web.js
# ... repeat for all files
```

### **Step 5: Publish Site**

```bash
wix publish --source remote
```

Or publish to test site:
```bash
wix publish --source remote --target test
```

---

## 📋 Complete Deployment Command Sequence

```bash
# 1. Navigate to project
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global

# 2. Ensure logged in
wix login

# 3. Deploy all backend files
wix deploy src/backend --source local

# 4. Deploy webhooks
wix deploy src/backend/webhooks --source local

# 5. Publish site
wix publish --source remote --target test
```

---

## 🔧 Wix CLI Commands Reference

### **Authentication**
```bash
wix login          # Login to Wix
wix logout         # Logout
wix whoami         # Check current user
```

### **Deployment**
```bash
wix deploy [path]  # Deploy files
wix publish        # Publish site
```

### **Project Management**
```bash
wix init           # Initialize Wix project
wix list           # List sites
wix select [site]  # Select site
```

### **Options**
```bash
--source local     # Deploy from local files
--source remote    # Use remote files
--target test      # Publish to test site
--target live      # Publish to live site
```

---

## 📁 Files to Deploy

### **Backend Files (src/backend/)**
```
✅ master-initialization.jsw
✅ master-initialization.web.js
✅ system-utilities.jsw
✅ system-utilities.web.js
✅ database-sync.jsw
✅ database-sync.web.js
✅ data-initialization.jsw
✅ data-initialization.web.js
✅ rag-system.jsw
✅ rag-system.web.js
✅ api-health-check.jsw
✅ api-health-check.web.js
✅ comprehensive-testing.jsw
✅ chat-integration.jsw
✅ webhooks/stripe.jsw
```

### **Existing Files (verify)**
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

## ⚠️ Common Wix CLI Issues

### **"Command not found: wix"**
**Solution:**
```bash
npm install -g @wix/cli
```

### **"Not logged in"**
**Solution:**
```bash
wix login
```

### **"Site not selected"**
**Solution:**
```bash
wix list           # List available sites
wix select [site]  # Select your site
```

### **"Deploy failed"**
**Solution:**
- Check file paths are correct
- Verify you have permissions
- Try deploying individual files
- Check Wix CLI version: `wix --version`

---

## 🔍 Verify Deployment

### **Check Deployed Files**
```bash
wix list files
```

### **Test Deployment**
After deployment, test in browser:
```javascript
fetch('/_functions/master-initialization/quickHealthCheck')
  .then(r => r.json())
  .then(data => console.log('Health:', data));
```

---

## 📊 Deployment Status

After running Wix CLI commands, you should see:
- ✅ Files uploaded successfully
- ✅ Site published
- ✅ No errors in output

---

## 🎯 Quick Deployment Script

Create a deployment script:

```bash
#!/bin/bash
# deploy.sh

cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global

echo "🚀 Starting Wix CLI Deployment..."

# Deploy backend files
echo "📤 Deploying backend files..."
wix deploy src/backend --source local

# Deploy webhooks
echo "📤 Deploying webhooks..."
wix deploy src/backend/webhooks --source local

# Publish site
echo "📢 Publishing site..."
wix publish --source remote --target test

echo "✅ Deployment complete!"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**Last Updated:** December 13, 2025  
**Status:** Ready for Wix CLI Deployment ✅





