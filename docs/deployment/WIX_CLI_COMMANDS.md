# Wix CLI Commands - Actual Usage

## ✅ Wix CLI Status

**Version:** 1.1.146  
**Logged in as:** departments@hingecraft-global.ai  
**Site ID:** 450f03ec-e8b6-4373-b1b4-5d44459a7e08

---

## 🚀 Available Commands

### **Check Wix CLI Help**
```bash
wix --help
wix help
```

### **Authentication**
```bash
wix whoami          # Check current user ✅ Works
wix login           # Login to Wix
wix logout          # Logout
```

### **Deployment Commands**
```bash
# Try these commands (Wix CLI syntax may vary by version):
wix push            # Push changes to Wix
wix publish         # Publish site
wix sync            # Sync files
wix upload          # Upload files
```

---

## 📋 Manual Deployment (Recommended)

Since Wix CLI commands vary, **manual upload via Wix Editor is recommended:**

### **Step 1: Open Wix Editor**
1. Go to: https://editor.wix.com
2. Sign in
3. Select your site

### **Step 2: Enable Dev Mode**
1. Click **"Dev Mode"** (top right)
2. Go to **Backend → Functions**

### **Step 3: Upload Files**
Upload all files from `src/backend/`:
- All `.jsw` files
- All `.web.js` files
- `webhooks/stripe.jsw`

### **Step 4: Publish**
Click **Publish → Publish to Test Site**

---

## 🔧 Alternative: Use Wix CLI for Publishing Only

If `wix push` or `wix publish` works:

```bash
# After manual file upload, publish via CLI:
wix publish
```

---

## 📊 Current Status

**Git:** ✅ All committed and pushed  
**Wix CLI:** ✅ Installed and logged in  
**Files:** ✅ Ready in `src/backend/`  
**Next:** Upload files manually or use CLI if commands work

---

**Last Updated:** December 13, 2025





