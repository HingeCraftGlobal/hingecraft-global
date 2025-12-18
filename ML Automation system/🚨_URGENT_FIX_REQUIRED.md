# 🚨 URGENT FIX REQUIRED

## 📋 **3 ERRORS STILL PRESENT**

From latest execution log:
1. ❌ Folder access error
2. ❌ HubSpot authentication error (401)
3. ❌ Gmail permissions error

---

## 🚀 **IMMEDIATE FIX (10 MINUTES)**

### **STEP 1: Get Correct Folder ID** (2 min)

1. Go to: https://drive.google.com
2. Open the monitored folder
3. Check URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`
4. Current folder ID in error: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
5. **Verify this matches your folder URL**
6. If different, copy the correct folder ID

### **STEP 2: Share Folder** (1 min)

1. Right-click folder → **Share**
2. Add: Your Google account email (same as Apps Script)
3. Permission: **Editor**
4. Click: **Share**

### **STEP 3: Fix Script Properties** (3 min)

**Option A: Use Fix Function (Recommended)**

1. Open `FIX_ALL_PROPERTIES.gs`
2. Update `MONITORED_FOLDER_ID` with correct folder ID
3. Copy function to Apps Script editor
4. Run: `fixAllScriptProperties()`
5. Check execution log

**Option B: Manual Update**

1. Go to: https://script.google.com
2. Open: **"AnyMail_HubSpot_Aut..."**
3. Project Settings → Script Properties
4. Set these properties:
   ```
   HUBSPOT_TOKEN = pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39
   ANYMAIL_API_KEY = pRUtyDRHSPageC2jHGbnWGpD
   MONITORED_FOLDER_ID = [correct folder ID from Drive URL]
   GMAIL_FROM_ADDRESS = marketingecraft@gmail.com
   ```
5. Save

### **STEP 4: Fix Gmail Permissions** (3 min)

1. Go to: https://script.google.com
2. Open: **"AnyMail_HubSpot_Aut..."**
3. Click: **Project Settings** (⚙️)
4. Scroll to: **OAuth scopes**
5. Click: **Show "appsscript.json" manifest file**
6. Copy updated `appsscript.json` content (from file in repo)
7. Paste and save
8. Run function: `checkFolderForNewFiles`
9. When prompted, click: **Review Permissions**
10. Grant all Gmail permissions

### **STEP 5: Test Again** (1 min)

1. Run function: `checkFolderForNewFiles`
2. Check execution log
3. Verify no errors

---

## 🔍 **DIAGNOSTIC FUNCTION**

Before fixing, run diagnostic:

1. Copy `DIAGNOSE_CURRENT_SETTINGS.gs` to Apps Script editor
2. Run function: `diagnoseCurrentSettings()`
3. Check execution log to see:
   - What Script Properties are currently set
   - Folder access test results
   - HubSpot token test results
   - OAuth scopes status

---

## 📋 **QUICK CHECKLIST**

- [ ] Get correct folder ID from Drive URL
- [ ] Share folder with your Google account
- [ ] Update Script Properties (use fix function or manual)
- [ ] Update appsscript.json for Gmail permissions
- [ ] Run function to request Gmail permissions
- [ ] Test again

---

## ⚠️ **CRITICAL NOTES**

1. **Folder ID**: Must match exactly from Drive URL
2. **HubSpot Token**: Must be `pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39`
3. **Gmail Permissions**: Must update appsscript.json AND grant permissions

---

**Status**: 🚨 **URGENT** | 🔧 **FIX REQUIRED** | ⏱️ **10 MINUTES**
