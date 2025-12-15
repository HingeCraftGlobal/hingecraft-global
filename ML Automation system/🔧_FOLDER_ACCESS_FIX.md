# 🔧 Folder Access Fix - Resolving Drive Folder Error

## ❌ Error Encountered

```
Exception: No item with the given ID could be found. Possibly because you have not edited this item or you do not have permission to access it.
```

This error occurs when the script cannot access the monitored Drive folder.

---

## 🔍 Root Causes

1. **Incorrect Folder ID** - The folder ID in the code doesn't match an actual folder
2. **Permission Issue** - The script doesn't have access to the folder
3. **Folder Deleted** - The folder no longer exists
4. **Wrong Google Account** - Script is running under a different account

---

## ✅ Solutions

### **Solution 1: Get the Correct Folder ID**

1. **Open Google Drive**
2. **Navigate to your folder** (e.g., "HubSpot_Leads_Input")
3. **Click on the folder** to open it
4. **Look at the URL** in your browser:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```
5. **Copy the Folder ID** (the long string after `/folders/`)

### **Solution 2: Set Folder ID in Script Properties**

1. **Go to Google Apps Script Editor**
2. **Click on Project Settings** (gear icon ⚙️)
3. **Scroll to "Script Properties"**
4. **Click "Add script property"**
5. **Add:**
   - **Property:** `MONITORED_FOLDER_ID`
   - **Value:** Your folder ID (from Solution 1)
6. **Click "Save script properties"**

### **Solution 3: Share Folder with Script**

1. **Open the folder in Google Drive**
2. **Right-click** → **Share**
3. **Add the service account email** (found in Project Settings → Service Accounts)
4. **Give "Editor" permission**
5. **Click "Send"**

### **Solution 4: Create New Folder (If Needed)**

1. **Create a new folder** in Google Drive
2. **Name it:** "HubSpot_Leads_Input" (or your preferred name)
3. **Get the folder ID** (from URL)
4. **Set it in Script Properties** (Solution 2)
5. **Share it with the service account** (Solution 3)

---

## 🧪 Test the Fix

### **Step 1: Update Script Properties**
- Add `MONITORED_FOLDER_ID` with your folder ID

### **Step 2: Test Folder Access**
1. **Run function:** `checkFolderForNewFiles`
2. **Check execution log:**
   - Should see: `📁 Accessing folder: [Folder Name]`
   - Should see: `✅ No new files found in folder` (if folder is empty)
   - Should NOT see the error message

### **Step 3: Test with a File**
1. **Upload a test CSV** to the folder
2. **Run function:** `checkFolderForNewFiles`
3. **Check execution log:**
   - Should see: `📄 New file detected: [filename]`
   - Should see processing messages

---

## 📝 Quick Fix Script

If you want to test without a folder, you can temporarily modify the function to skip folder checking:

```javascript
function checkFolderForNewFiles() {
  try {
    Logger.log('🔍 Checking folder for new files...');
    
    // TEMPORARY: Skip folder check for testing
    Logger.log('⚠️ Folder check skipped for testing');
    
    // Still run sequence manager
    Logger.log('📧 Running sequence manager for follow-up emails...');
    sequenceManager();
    
  } catch (error) {
    Logger.log(`Error: ${error.toString()}`);
  }
}
```

**Note:** This is only for testing. You'll need to fix the folder access for production.

---

## ✅ Verification Checklist

- [ ] Folder ID is correct (matches URL)
- [ ] Folder ID set in Script Properties
- [ ] Folder shared with service account
- [ ] Script can access folder (no errors in log)
- [ ] Test file can be processed

---

## 🚀 After Fix

Once the folder access is fixed:

1. **The script will:**
   - ✅ Check for new files every hour (time-driven trigger)
   - ✅ Process new files automatically
   - ✅ Run sequence manager for follow-up emails

2. **To test:**
   - Upload a CSV file to the folder
   - Wait for the trigger to run (or run manually)
   - Check execution log for processing messages

---

**Status:** ✅ **Code updated with better error handling**

The script will now provide clearer error messages and continue running sequence manager even if folder access fails.


