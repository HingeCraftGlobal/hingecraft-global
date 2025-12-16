# ✅ CLI Enhanced - Script Properties Automation

## 🎯 Status: Enhanced CLI Scripts Ready

**Date:** December 15, 2025  
**Status:** ✅ **CLI ENHANCED** | ✅ **AUTOMATION IMPROVED**

---

## ✅ What's New

### **1. Enhanced Script Properties CLI**
- ✅ `set-script-properties-cli.js` - New enhanced script
- ✅ Creates Apps Script function to set properties
- ✅ Generates `SET_PROPERTIES_SCRIPT.gs` for easy copy-paste
- ✅ Attempts clasp push if directory exists
- ✅ Provides manual instructions as fallback

### **2. Master CLI Orchestrator**
- ✅ `master-cli.js` - Orchestrates all operations
- ✅ Checks prerequisites
- ✅ Runs all steps in sequence
- ✅ Generates comprehensive report
- ✅ Handles errors gracefully

### **3. Improved Automation**
- ✅ Better error handling
- ✅ Prerequisites checking
- ✅ Step-by-step execution
- ✅ Comprehensive reporting

---

## 🚀 Usage

### **Option 1: Master CLI (Recommended)**
```bash
cd "ML Automation system"
node scripts/master-cli.js
```

**This runs:**
1. Comprehensive email diagnosis
2. Set Script Properties (creates Apps Script function)
3. Push HubSpot Properties (if token set)
4. Verify all CLIs
5. Sync to Git

---

### **Option 2: Individual Scripts**

**Set Script Properties:**
```bash
node scripts/set-script-properties-cli.js
```

**This creates:**
- `SET_PROPERTIES_SCRIPT.gs` - Copy to Apps Script and run

**Push HubSpot Properties:**
```bash
export HUBSPOT_TOKEN="your-token"
node scripts/push-hubspot-properties-cli.js
```

---

## 📋 Script Properties Setup (3 Methods)

### **Method 1: Apps Script Function (Easiest)**

1. Run: `node scripts/set-script-properties-cli.js`
2. Open: `SET_PROPERTIES_SCRIPT.gs`
3. Copy the `setAllScriptProperties()` function
4. Paste into Apps Script editor
5. Run the function
6. Check execution log
7. Delete function after use

**Advantage:** Sets all properties at once

---

### **Method 2: Clasp Push (If Available)**

1. Run: `node scripts/set-script-properties-cli.js`
2. If `google-apps-script` directory exists, it will:
   - Create `TEMP_SET_PROPERTIES.gs`
   - Push via `clasp push`
3. Run function in Apps Script
4. Delete temporary file

**Advantage:** Automated if clasp is configured

---

### **Method 3: Manual Setup**

1. Run: `node scripts/set-script-properties-cli.js`
2. Follow manual instructions
3. Add properties one by one in Apps Script UI

**Advantage:** Most reliable, full control

---

## 📋 Script Properties (Complete List)

**Required:**
- `HUBSPOT_TOKEN` = [Your token]
- `ANYMAIL_API_KEY` = [Your key]
- `MONITORED_FOLDER_ID` = [Your folder ID]
- `GMAIL_FROM_ADDRESS` = `marketingecraft@gmail.com`

**Tracking (GA4):**
- `TRACKING_ENDPOINT_URL` = `https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec`
- `GA4_MEASUREMENT_ID` = `G-QF5H2Q291T`
- `GA4_API_SECRET` = `cJH76-IHQteQx6DKaiPkGA`
- `GA4_STREAM_ID` = `13142410458`
- `GA4_STREAM_URL` = `https://hingecraft-global.ai`

---

## 🔧 Master CLI Features

### **Prerequisites Checking:**
- ✅ Node.js availability
- ✅ Git availability
- ✅ clasp availability (optional)
- ✅ HUBSPOT_TOKEN (for HubSpot operations)

### **Step Execution:**
- ✅ Runs all steps in sequence
- ✅ Handles errors gracefully
- ✅ Skips steps if prerequisites missing
- ✅ Provides detailed feedback

### **Reporting:**
- ✅ Generates comprehensive report
- ✅ Shows success/failure for each step
- ✅ Lists prerequisites status
- ✅ Saves to `master-cli-report.json`

---

## 🎯 Quick Start

```bash
# Run master CLI (does everything)
cd "ML Automation system"
node scripts/master-cli.js

# Or run individual scripts
node scripts/set-script-properties-cli.js
node scripts/push-hubspot-properties-cli.js
```

---

## ✅ Status

**CLI Scripts:** ✅ **ENHANCED**  
**Script Properties:** ✅ **AUTOMATED** (via Apps Script function)  
**HubSpot Properties:** ✅ **READY** (via CLI)  
**Master CLI:** ✅ **READY** (orchestrates everything)  
**All Files:** ✅ **IN REPO**  

---

**Next:** Run `node scripts/master-cli.js` to execute everything!
