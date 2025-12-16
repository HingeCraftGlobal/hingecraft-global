# 🔍 Live Funnel Diagnosis Complete

## 🎯 Status: Testing Tools Ready

**Date:** December 16, 2025  
**Status:** ✅ **LIVE TESTING TOOLS CREATED**

---

## 🧪 Live Funnel Test Results

### **Test Summary:**
- ✅ **Passed:** 3 steps
- ❌ **Failed:** 6 steps
- ⚠️  **Warnings:** 2 steps

### **Critical Issues Found:**

1. **❌ Script Properties Missing (CRITICAL)**
   - `HUBSPOT_TOKEN` - Not set
   - `ANYMAIL_API_KEY` - Not set
   - `MONITORED_FOLDER_ID` - Not set
   - `GMAIL_FROM_ADDRESS` - Not set
   
   **Impact:** System cannot function without these properties
   
   **Fix:** Set in Apps Script UI → Project Settings → Script Properties

2. **❌ Drive Folder ID Missing**
   - Cannot locate files to process
   
   **Fix:** Set `MONITORED_FOLDER_ID` in Script Properties

3. **❌ HubSpot Connection Failed**
   - Cannot create/update contacts
   
   **Fix:** Set `HUBSPOT_TOKEN` in Script Properties

4. **❌ AnyMail API Key Missing**
   - Cannot enrich email addresses
   
   **Fix:** Set `ANYMAIL_API_KEY` in Script Properties

---

## 📋 Step-by-Step Diagnosis Process

### **Step 1: Check Apps Script Execution Logs**

**This is the MOST IMPORTANT step to diagnose why email didn't send.**

1. **Go to Apps Script:**
   ```
   https://script.google.com
   ```

2. **Open Your Project:**
   - Script ID: `AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4`

3. **Click Executions Tab:**
   - Look for clock icon ⏰ in left sidebar
   - Click "Executions"

4. **Find Latest Execution:**
   - Look for most recent execution of `checkFolderForNewFiles`
   - Click on it to see details

5. **Check Status:**
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed
   - ⏱️  Clock icon = Running

6. **Review Logs:**
   - Click "View logs" or expand execution
   - Look for error messages

### **Step 2: Common Errors and Solutions**

#### **Error: "No item with the given ID could be found"**
- **Cause:** `MONITORED_FOLDER_ID` is incorrect or folder doesn't exist
- **Solution:** 
  1. Get correct folder ID from Google Drive URL
  2. Update `MONITORED_FOLDER_ID` in Script Properties

#### **Error: "API key invalid"**
- **Cause:** `HUBSPOT_TOKEN` or `ANYMAIL_API_KEY` is incorrect
- **Solution:**
  1. Verify API keys are correct
  2. Check keys are active (not expired)
  3. Update in Script Properties

#### **Error: "Gmail permission denied"**
- **Cause:** Gmail API not authorized
- **Solution:**
  1. In Apps Script: Run → Review permissions
  2. Authorize Gmail access
  3. Re-run function

#### **Error: "Function not found"**
- **Cause:** Code not deployed or function name changed
- **Solution:**
  1. Run `clasp push` to deploy code
  2. Verify function exists in Code.gs

#### **Error: "Rate limit exceeded"**
- **Cause:** Too many API calls too quickly
- **Solution:**
  1. Add delays between API calls
  2. Reduce batch size

---

## ✅ What to Look For in Execution Logs

### **Success Indicators:**
- ✅ "File processed: X leads"
- ✅ "Contact created/updated in HubSpot"
- ✅ "Email sent successfully"
- ✅ "Sequence initialized"
- ✅ "AnyMail enrichment complete"

### **Failure Indicators:**
- ❌ Any "Exception:" messages
- ❌ "Error:" or "Failed:" messages
- ❌ API status codes: 400, 401, 403, 404, 500
- ❌ "Permission denied" messages
- ❌ "No item with the given ID"

---

## 🔧 Immediate Action Items

### **1. Set Script Properties (CRITICAL - 5 minutes)**

1. Go to: https://script.google.com
2. Open your project
3. Click **Project Settings** (⚙️ icon)
4. Scroll to **Script Properties**
5. Add these 4 properties:

   **Property 1:**
   - Name: `HUBSPOT_TOKEN`
   - Value: `[Your HubSpot Private App Token]`

   **Property 2:**
   - Name: `ANYMAIL_API_KEY`
   - Value: `[Your AnyMail API Key]`

   **Property 3:**
   - Name: `MONITORED_FOLDER_ID`
   - Value: `[Your Google Drive Folder ID]`
   - How to get: Open Drive folder → URL contains folder ID

   **Property 4:**
   - Name: `GMAIL_FROM_ADDRESS`
   - Value: `marketingecraft@gmail.com`

6. Click **Save**

### **2. Verify Trigger (2 minutes)**

1. In Apps Script, click **Triggers** tab (⏰)
2. Verify `checkFolderForNewFiles` is set:
   - Function: `checkFolderForNewFiles`
   - Event: Time-driven
   - Frequency: Every 5 minutes (or Every hour)
3. If not set, click **Add Trigger** and configure

### **3. Upload Test File (1 minute)**

1. Open Google Drive
2. Navigate to monitored folder (from `MONITORED_FOLDER_ID`)
3. Upload `test_chandler_tracking.csv`
4. Wait for trigger to fire (5 minutes)

### **4. Check Execution Logs (5 minutes)**

1. Go to Apps Script → Executions tab
2. Find latest execution
3. Review logs for errors
4. Note any error messages

### **5. Check HubSpot (2 minutes)**

1. Go to: https://app.hubspot.com
2. Search for: `chandlerferguson319@gmail.com`
3. Verify contact was created
4. Check `automation_*` properties are set

### **6. Check Gmail (1 minute)**

1. Check inbox: `chandlerferguson319@gmail.com`
2. Check spam folder
3. Verify email was received

---

## 📊 Testing Tools Available

### **1. Live Funnel Test:**
```bash
node scripts/live-test-entire-funnel.js
```
- Tests all 10 steps of the funnel
- Provides detailed error diagnosis
- Generates comprehensive report

### **2. Execution Logs Guide:**
```bash
node scripts/check-apps-script-execution.js
```
- Provides step-by-step guide
- Lists common errors and solutions
- Shows what to look for in logs

### **3. Email Funnel Diagnosis:**
```bash
node scripts/diagnose-email-funnel.js
```
- Diagnoses 8-step email flow
- Identifies bottlenecks
- Provides recommendations

---

## 🎯 Most Likely Causes of Email Not Sending

Based on test results, the most likely causes are:

1. **Script Properties Not Set (90% probability)**
   - System cannot function without these
   - **Fix:** Set all 4 properties in Apps Script UI

2. **Trigger Not Firing (5% probability)**
   - Trigger may not be set correctly
   - **Fix:** Verify trigger in Apps Script UI

3. **Execution Error (5% probability)**
   - Error in execution logs
   - **Fix:** Check execution logs for specific error

---

## 📄 Reports Generated

1. **live-funnel-test-report.json** - Complete test results
2. **apps-script-execution-guide.md** - Execution logs guide
3. **email-funnel-diagnosis-report.json** - Email flow diagnosis

---

## ✅ Next Steps

1. **Set Script Properties** (5 min) - CRITICAL
2. **Verify Trigger** (2 min)
3. **Upload Test File** (1 min)
4. **Check Execution Logs** (5 min)
5. **Review Results** (2 min)

**Total Time:** ~15 minutes

---

## 🔍 Debugging Checklist

- [ ] Script Properties set (all 4)
- [ ] Trigger configured correctly
- [ ] Test file uploaded to Drive folder
- [ ] Execution logs reviewed
- [ ] HubSpot contact created
- [ ] Email received in inbox/spam

---

**Last Updated:** December 16, 2025  
**Status:** Ready for Script Properties setup and testing
