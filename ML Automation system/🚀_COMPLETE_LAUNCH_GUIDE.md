# 🚀 Complete Launch Guide - Execute All Remaining Tasks

## 📊 Current Status

**Code:** ✅ 100% Complete and Pushed  
**Verification:** ✅ 100% Score (31/31 checks passed)  
**Docker:** ⚠️ Not Running (needs to be started)  
**Database:** ⚠️ Not Applied (needs Docker or manual setup)  

---

## 🔴 CRITICAL TASKS - Execute Now

### **Task 1: Start Docker (If Not Running)** ⏱️ 1 minute

**Check if Docker is running:**
```bash
docker ps
```

**If error, start Docker Desktop:**
1. Open Docker Desktop application
2. Wait for it to start (whale icon in menu bar)
3. Verify: `docker ps` should work

**Then start services:**
```bash
cd "/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/ML Automation system"
docker-compose up -d
```

---

### **Task 2: Apply Database Schema** ⏱️ 5 minutes

**Option A: Using Docker (Recommended)**
```bash
# Start database
docker-compose up -d postgres

# Wait 10 seconds
sleep 10

# Apply schema
node scripts/apply-entire-database.js
```

**Option B: Manual PostgreSQL (If Docker unavailable)**
```bash
# Connect to your PostgreSQL instance
psql -U hingecraft -d hingecraft_automation -f database/schema.sql
```

**Option C: Using Script**
```bash
./scripts/apply-database-complete.sh
```

**Verify:**
```bash
# Check tables
docker exec -it hingecraft-postgres psql -U hingecraft -d hingecraft_automation -c "\dt"
# Should show 11 tables
```

---

### **Task 3: Run HubSpot Property Creation** ⏱️ 2 minutes

**Action:**
1. **Go to:** https://script.google.com
2. **Open:** HingeCraft Automation project
3. **Open file:** HubSpotSetup.gs
4. **Click inside:** `createHubSpotProperties` function (line 5)
5. **Click:** Run (▶️)
6. **Authorize** if prompted
7. **Check execution log**

**Expected Output:**
```
Starting HubSpot Property Creation...
✅ Created/Updated property: automation_next_email_step on contacts
✅ Created/Updated property: automation_next_send_timestamp on contacts
✅ Created/Updated property: automation_template_set on contacts
✅ Created/Updated property: automation_lead_type on contacts
✅ Created/Updated property: automation_emails_sent on contacts
✅ Created/Updated property: last_contact_sent_date on contacts
✅ Created/Updated property: automation_source on contacts
✅ Created/Updated property: automation_source_file_id on contacts
✅ Created/Updated property: automation_ingested_at on contacts
✅ Created/Updated property: automation_anymail_enriched on contacts
✅ Created/Updated property: automation_last_email_sent on contacts
✅ Created/Updated property: original_sheet_data_segment_1 on contacts
✅ Created/Updated property: original_sheet_data_segment_2 on contacts
✅ Created/Updated property: original_sheet_data_segment_3 on contacts
✅ Created/Updated property: original_sheet_data_segment_4 on contacts
✅ Created/Updated property: original_sheet_data_segment_5 on contacts
✅ Created/Updated property: anymail_source_type on contacts
✅ Created/Updated property: send_email_ready on contacts
✅ Created/Updated property: original_sheet_url on companies
✅ Created/Updated property: email_finder_status on companies
✅ HubSpot Property Creation complete.
```

**Verify in HubSpot:**
- Go to HubSpot → Settings → Properties → Contacts
- Should see all automation_* properties

---

### **Task 4: Configure Script Properties** ⏱️ 3 minutes

**Action:**
1. **Go to:** Apps Script → Project Settings (⚙️)
2. **Scroll to:** Script Properties
3. **Add these 4 properties:**

| Property | Value |
|----------|-------|
| `HUBSPOT_TOKEN` | `pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39` |
| `ANYMAIL_API_KEY` | `pRUtyDRHSPageC2jHGbnWGpD` |
| `MONITORED_FOLDER_ID` | `[Get from Drive folder URL - see below]` |
| `GMAIL_FROM_ADDRESS` | `marketingecraft@gmail.com` |

**Get MONITORED_FOLDER_ID:**
1. Open Google Drive
2. Create or navigate to folder: "HubSpot_Leads_Input"
3. Click on folder
4. Copy ID from URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
5. Paste into Script Properties

**Share Folder:**
1. Right-click folder → Share
2. Add service account email (from Project Settings → Service Accounts)
3. Give "Editor" permission
4. Click Send

---

### **Task 5: Set Up Time-Driven Trigger** ⏱️ 2 minutes

**Action:**
1. **Go to:** Apps Script → Triggers tab (⏰)
2. **DELETE** any `onNewFileAdded` triggers (if present)
3. **Click:** "+ Add Trigger" (bottom right)
4. **Configure:**
   - Function to run: `checkFolderForNewFiles`
   - Event source: `Time-driven`
   - Type of time based trigger: `Every hour`
   - Failure notification settings: `Notify me immediately`
5. **Click:** Save

**Verify:**
- Trigger appears in list
- Shows: `checkFolderForNewFiles` - Time-driven - Every hour

---

## 🟡 IMPORTANT TASKS - Do Next

### **Task 6: Test Email** ⏱️ 3 minutes

**Action:**
1. **Go to:** Apps Script
2. **Select function:** `testSingleEmail`
3. **Click:** Run (▶️)
4. **Authorize** if prompted
5. **Check email:** chandlerferguson319@gmail.com

**Expected:**
- From: marketingecraft@gmail.com
- Subject: "Partnership Opportunity: Let's Build Together"
- Personalized with your name and company

**Verify in Log:**
```
🧪 Starting live test with single email...
Test Email: chandlerferguson319@gmail.com
From Email: marketingecraft@gmail.com
Qualification Result:
  Lead Type: B2B
  Template Set: set_three_b2b
  Score: 75
✅ Test email sent successfully!
```

---

### **Task 7: Verify Database Connection** ⏱️ 1 minute

**After Docker is running:**
```bash
node scripts/comprehensive-database-crawler.js
```

**Expected:**
- Should connect to database
- Should show tables and data
- Should show email nodes

---

## ✅ Verification Summary

**Master Integration Verification Results:**
- ✅ Database Schema: 11/11 tables found
- ✅ Email Nodes: Complete
- ✅ GAS Files: 3/3 files found
- ✅ HubSpot: 6/6 properties found in code
- ✅ Overall Score: 100% (31/31 checks passed)

**Status:** ✅ **EXCELLENT**

---

## 📋 Quick Checklist

**Before Production:**
- [ ] Docker Desktop started
- [ ] Database schema applied (11 tables)
- [ ] HubSpot properties created (run createHubSpotProperties)
- [ ] Script Properties configured (4 properties)
- [ ] Time-driven trigger set up
- [ ] Test email sent successfully

**After Setup:**
- [ ] Database connection verified
- [ ] All services running
- [ ] Ready for production use

---

## 🚀 Quick Commands

**Start Everything:**
```bash
# Start Docker Desktop first, then:
docker-compose up -d
./scripts/apply-database-complete.sh
```

**Verify:**
```bash
node scripts/master-integration-verification.js
node scripts/comprehensive-database-crawler.js
```

**Test:**
```bash
# In Apps Script, run:
testSingleEmail()
```

---

## ⏱️ Time Estimate

- **Docker Start:** 1 minute
- **Database Setup:** 5 minutes
- **HubSpot Properties:** 2 minutes
- **Script Properties:** 3 minutes
- **Trigger Setup:** 2 minutes
- **Test Email:** 3 minutes
- **Verification:** 1 minute

**Total:** ~17 minutes to complete everything

---

## 🎯 Execution Order

1. ✅ **Start Docker Desktop** (if not running)
2. ✅ **Apply database schema** (./scripts/apply-database-complete.sh)
3. ✅ **Run createHubSpotProperties()** (in Apps Script)
4. ✅ **Configure Script Properties** (4 properties)
5. ✅ **Set up time-driven trigger** (Every hour)
6. ✅ **Test email** (testSingleEmail)
7. ✅ **Verify database** (comprehensive-database-crawler.js)

---

**Status:** ✅ **VERIFICATION COMPLETE** | ⚠️ **MANUAL SETUP PENDING**

**Next:** Complete the 7 tasks above to launch the system!
