# ✅ Wix Dev Server Running
## Local Development Server Active

**Date:** December 10, 2025  
**Status:** ✅ **WIX DEV SERVER RUNNING**

---

## 🚀 SERVER STATUS

- ✅ **Wix Dev Server:** Running in background
- ✅ **Process ID:** Active
- ✅ **Logged in as:** departments@hingecraft-global.ai
- ✅ **Wix CLI Version:** 1.1.141

---

## 📋 WHAT'S RUNNING

The Wix Dev server provides:
- Local development environment
- Hot reload for code changes
- Local URL for testing
- Real-time code updates

---

## 🔧 EDITING FROM CURSOR

You can now edit files in Cursor, and the Wix Dev server will:
- ✅ Detect file changes
- ✅ Reload automatically
- ✅ Show updates in the local browser

---

## 📁 FILES TO EDIT

### **Backend Functions:**
- `src/backend/nowpayments.api.jsw`
- `src/backend/stripe.api.jsw`
- `src/backend/hingecraft.api.web.jsw`
- `src/backend/charter-page-middleware.jsw`
- `src/backend/mission-support-middleware.jsw`
- `src/backend/createNowPaymentsInvoice.jsw`
- `src/backend/webhooks/nowpayments.jsw`

### **Web Modules:**
- `src/backend/charter-page-middleware.web.js`
- `src/backend/mission-support-middleware.web.js`

### **HTML Pages:**
- `public/pages/charter-page-final.html`
- `public/pages/mission-support-form.html`

---

## 🛑 STOPPING THE SERVER

To stop the Wix Dev server:
```bash
# Find the process
ps aux | grep "wix dev"

# Kill the process
pkill -f "wix dev"
```

Or press `Ctrl+C` in the terminal where it's running.

---

## 🔄 RESTARTING THE SERVER

To restart:
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
./START_WIX_DEV.sh
# or
wix dev
```

---

## ✅ NEXT STEPS

1. **Edit files in Cursor** - Changes will auto-reload
2. **Test in local browser** - Check the local URL provided by Wix Dev
3. **Make changes** - All edits sync automatically
4. **Deploy when ready** - Follow `wix-deployment-ready/DEPLOYMENT_INSTRUCTIONS.md`

---

**Last Updated:** December 10, 2025  
**Server Status:** ✅ **RUNNING**
