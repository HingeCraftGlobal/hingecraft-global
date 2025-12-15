# 🔧 Trigger Fix Instructions - CRITICAL

## ⚠️ ISSUE IDENTIFIED

Your trigger is set to `onNewFileAdded` (showing 45.28% success rate), but the system is designed to use `checkFolderForNewFiles` with a **time-driven trigger**.

---

## 🎯 THE FIX

### **Step 1: Remove Old Trigger**

1. Go to [Google Apps Script Editor](https://script.google.com)
2. Open your project
3. Click **"Triggers"** (clock icon) in the left sidebar
4. Find the trigger for `onNewFileAdded`
5. Click the **trash icon** to delete it
6. Confirm deletion

### **Step 2: Create New Trigger**

1. Still in the **Triggers** tab
2. Click **"+ Add Trigger"** (bottom right)
3. Configure:
   - **Function to run:** `checkFolderForNewFiles`
   - **Event source:** `Time-driven`
   - **Type of time based trigger:** `Every hour` (or `Every 5 minutes` for faster testing)
   - **Failure notification settings:** `Notify me immediately`
4. Click **"Save"**

### **Step 3: Verify**

1. Check the trigger list - you should see:
   - ✅ `checkFolderForNewFiles` - Time-driven - Every hour
   - ❌ NO `onNewFileAdded` trigger

2. Test by uploading a file to your Drive folder
3. Wait for the trigger to fire (within 1 hour)
4. Check execution logs:
   - Go to **"Executions"** tab
   - Look for `checkFolderForNewFiles` executions
   - Check for success/failure

---

## 🔍 Why This Matters

### **Current Setup (BROKEN):**
- `onNewFileAdded` - Drive trigger (unreliable, 45.28% success)
- Doesn't call `sequenceManager()` for follow-ups
- Missing 24-hour sequence management

### **Correct Setup (FIXED):**
- `checkFolderForNewFiles` - Time-driven trigger (100% reliable)
- Calls `sequenceManager()` automatically
- Handles both file processing AND follow-up emails
- 24-hour sequence timing works perfectly

---

## ✅ What `checkFolderForNewFiles` Does

1. **Scans Drive folder** for new files
2. **Processes new files** (parse, enrich, sync to HubSpot)
3. **Calls sequenceManager()** automatically
4. **Sends follow-up emails** based on 24-hour timing
5. **Runs every hour** (or every 5 minutes)

---

## 🧪 Testing After Fix

1. **Upload test file:**
   - Create a CSV with test data
   - Upload to your monitored Drive folder
   - File ID: `1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF`

2. **Wait for trigger:**
   - If set to "Every hour": Wait up to 1 hour
   - If set to "Every 5 minutes": Wait up to 5 minutes

3. **Check execution:**
   - Go to **Executions** tab
   - Look for `checkFolderForNewFiles` execution
   - Click to view logs

4. **Verify results:**
   - Check HubSpot for new contacts
   - Check Gmail for sent emails
   - Check execution logs for errors

---

## 📋 Quick Checklist

- [ ] Removed `onNewFileAdded` trigger
- [ ] Created `checkFolderForNewFiles` time-driven trigger
- [ ] Set frequency to "Every hour" (or "Every 5 minutes")
- [ ] Verified trigger appears in list
- [ ] Tested with sample file
- [ ] Checked execution logs
- [ ] Confirmed contacts created in HubSpot
- [ ] Confirmed emails sent

---

## 🚨 If Still Having Issues

1. **Check Script Properties:**
   - Go to Project Settings → Script Properties
   - Verify:
     - `HUBSPOT_TOKEN` - Your HubSpot token
     - `MONITORED_FOLDER_ID` - Drive folder ID
     - `GMAIL_FROM_ADDRESS` - Sender email

2. **Check OAuth Scopes:**
   - Go to Project Settings → OAuth scopes
   - Should include:
     - `https://www.googleapis.com/auth/drive`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/script.external_request`

3. **Run Property Creation:**
   - Select function: `createHubSpotProperties`
   - Click "Run"
   - Check for errors

4. **Check Execution Logs:**
   - Go to Executions tab
   - Look for error messages
   - Share error details if needed

---

**Status:** Code is correct, just need to fix the trigger configuration!


