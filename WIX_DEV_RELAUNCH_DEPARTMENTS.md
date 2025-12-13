# 🔄 Wix Dev Relaunch - Departments Account
## Relaunching with Departments@hingecraft-global.ai

**Date:** December 10, 2025  
**Account:** `Departments@hingecraft-global.ai`  
**Status:** 🔄 **RELAUNCHING**

---

## 🔄 RELAUNCH STEPS

### **1. Stop Current Wix Dev**
```bash
pkill -f "wix dev"
```

### **2. Logout from Previous Account**
```bash
wix logout
```

### **3. Login with Departments Account**
```bash
wix login --email Departments@hingecraft-global.ai
```

**Note:** This will open Chrome browser for authentication. Make sure you're logged into Chrome with `Departments@hingecraft-global.ai`.

### **4. Start Wix Dev**
```bash
wix dev
```

---

## 🌐 CHROME BROWSER SETUP

### **For Departments@hingecraft-global.ai:**

1. **Open Chrome**
2. **Go to:** `chrome://settings/people`
3. **Add Person** (if not already added)
4. **Sign in with:** `Departments@hingecraft-global.ai`
5. **Switch to that profile** before running `wix login`

**OR:**

1. **Open Chrome**
2. **Click profile icon** (top right)
3. **Select or add:** `Departments@hingecraft-global.ai`
4. **Make it the active profile**

---

## ✅ VERIFICATION

After login, verify account:
```bash
wix whoami
```

**Expected output:**
```
Logged in as: Departments@hingecraft-global.ai
```

---

## 🚀 START WIX DEV

Once logged in:
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev
```

**What will happen:**
- ✅ Wix Dev will sync files to Wix Editor
- ✅ Files will be associated with `Departments@hingecraft-global.ai` account
- ✅ Local Editor will open
- ✅ All changes will sync automatically

---

## 📋 FILES READY FOR SYNC

**All files are ready:**
- ✅ `charter-page-integrated.html` - Complete integration
- ✅ `mission-support-form.html` - Updated
- ✅ All backend functions in `src/backend/`
- ✅ All web modules

---

## 🔧 TROUBLESHOOTING

### **If login fails:**

1. **Check Chrome profile:**
   - Make sure Chrome is using `Departments@hingecraft-global.ai` profile
   - Switch profiles if needed

2. **Manual login:**
   ```bash
   wix login
   ```
   - This will open browser
   - Select `Departments@hingecraft-global.ai` account
   - Authorize Wix CLI

3. **Verify account:**
   ```bash
   wix whoami
   ```

### **If Wix Dev doesn't start:**

1. **Check if already running:**
   ```bash
   ps aux | grep "wix dev"
   ```

2. **Kill existing process:**
   ```bash
   pkill -f "wix dev"
   ```

3. **Try again:**
   ```bash
   wix dev
   ```

---

## 📊 STATUS

| Step | Status |
|------|--------|
| Stop Wix Dev | ✅ Done |
| Logout | ✅ Done |
| Login with Departments | ⏳ In Progress |
| Start Wix Dev | ⏳ Pending |
| Files Syncing | ⏳ Pending |

---

**Last Updated:** December 10, 2025  
**Account:** `Departments@hingecraft-global.ai`  
**Status:** 🔄 **RELAUNCHING**
