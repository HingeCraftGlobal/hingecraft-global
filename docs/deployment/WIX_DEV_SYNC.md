# Wix Dev - Local Editor Sync

## 🚀 Wix Dev Command

### **Start Wix Local Editor**
```bash
wix dev
```

This command:
- Opens Wix Local Editor in your browser
- Syncs local backend files (`src/backend/`) to Wix
- Allows you to test locally before publishing
- Automatically syncs changes as you edit files

---

## 📁 Files Synced by `wix dev`

### **Backend Files (Auto-synced)**
When you run `wix dev`, it syncs:
- All files in `src/backend/` directory
- `.jsw` files (direct import modules)
- `.web.js` files (HTTP-callable modules)
- Files in subdirectories (like `webhooks/`)

### **What Gets Synced:**
```
src/backend/
├── *.jsw          ✅ Synced
├── *.web.js       ✅ Synced
└── webhooks/      ✅ Synced
```

---

## 🔄 Using Wix Dev

### **Step 1: Start Local Editor**
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev
```

This will:
1. Open browser to Local Editor
2. Sync all backend files
3. Start local development server

### **Step 2: Files Are Synced**
- All files in `src/backend/` are automatically available
- Changes to local files sync automatically
- Test functions in Local Editor

### **Step 3: Publish When Ready**
After testing in Local Editor:
- Click **"Publish"** in Local Editor
- Or use: `wix publish` (after closing dev)

---

## ⚙️ Wix Dev Options

### **Start with HTTPS**
```bash
wix dev --https
```

### **Stop Wix Dev**
- Press `Ctrl+C` in terminal
- Or close the Local Editor browser tab

---

## 📊 Current Status

**Command:** `wix dev`  
**Status:** Starting...  
**Files to Sync:** All in `src/backend/`  
**Result:** Local Editor opens with synced files

---

## 🎯 After Wix Dev Starts

1. **Local Editor opens** in browser
2. **Backend files synced** automatically
3. **Test functions** in Local Editor
4. **Make changes** locally (auto-syncs)
5. **Publish** when ready

---

## ⚠️ Notes

- `wix dev` syncs files automatically
- No manual upload needed when using `wix dev`
- Changes to local files reflect immediately
- Close `wix dev` before using `wix publish`

---

**Last Updated:** December 13, 2025  
**Status:** Wix Dev Starting ✅





