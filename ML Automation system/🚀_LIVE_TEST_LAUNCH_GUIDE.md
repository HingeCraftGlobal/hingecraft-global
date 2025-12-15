# 🚀 Live Test Launch Guide - Single Email Test

## 🎯 Test Configuration

**Test Email (Recipient):** chandlerferguson319@gmail.com  
**From Email (Sender):** marketingecraft@gmail.com  
**Test Lead:** Chandler Ferguson, HingeCraft Global  
**Qualification:** B2B → set_three_b2b (5-step sequence)

---

## 📋 Pre-Launch Checklist

### **Step 1: Docker Setup** ⏱️ 5 minutes

**Prerequisites:**
- Docker installed
- Docker Compose installed
- At least 2GB free memory

**Action:**
```bash
# Navigate to project directory
cd "/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/ML Automation system"

# Make launch script executable
chmod +x launch-live-test.sh

# Launch Docker services
./launch-live-test.sh
```

**Verification:**
- ✅ All containers running
- ✅ Memory usage within limits
- ✅ Health checks passing

---

### **Step 2: Google Apps Script Setup** ⏱️ 3 minutes

**Action:**
1. Go to [Google Apps Script Editor](https://script.google.com)
2. Open your project
3. Copy `TEST_CONFIG.gs` content into a new file in Apps Script
4. Ensure `Code.gs` has the latest version (from email: marketingecraft@gmail.com)

**Verify:**
- ✅ `testSingleEmail()` function available
- ✅ `qualifyAndGetTemplateSet()` function available
- ✅ Email from address set to marketingecraft@gmail.com

---

### **Step 3: Script Properties** ⏱️ 2 minutes

**Action:**
1. Apps Script → Project Settings → Script Properties
2. Verify these properties exist:
   - `HUBSPOT_TOKEN`: pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39
   - `ANYMAIL_API_KEY`: pRUtyDRHSPageC2jHGbnWGpD
   - `MONITORED_FOLDER_ID`: 1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF
   - `GMAIL_FROM_ADDRESS`: marketingecraft@gmail.com

---

### **Step 4: Run Live Test** ⏱️ 2 minutes

**Action:**
1. In Apps Script editor, select function: `testSingleEmail`
2. Click **"Run"** (▶️)
3. Authorize if prompted
4. Check execution log

**Expected Output:**
```
🧪 Starting live test with single email...
Test Email: chandlerferguson319@gmail.com
From Email: marketingecraft@gmail.com
Qualification Result:
  Lead Type: B2B
  Template Set: set_three_b2b
  Qualification Score: 75
  Indicators: B2B company detected
✅ Test email sent successfully!
Message ID: [message-id]
Subject: Partnership Opportunity: Let's Build Together
To: chandlerferguson319@gmail.com
From: marketingecraft@gmail.com
```

---

## 🔍 Qualification Process

### **How Qualification Works:**

1. **Profile Analysis:**
   - Company name: "HingeCraft Global"
   - Title: "Founder"
   - Website: "https://hingecraft.global"
   - Email: "chandlerferguson319@gmail.com"

2. **Indicator Matching:**
   - Checks for Student indicators (school, university, etc.)
   - Checks for NGO indicators (ngo, nonprofit, etc.)
   - Checks for B2B indicators (corp, company, business, etc.)

3. **Scoring:**
   - Student: 85-90 points
   - NGO: 80 points
   - B2B: 75 points (default)

4. **Result:**
   - Lead Type: B2B
   - Template Set: set_three_b2b
   - Sequence Steps: 5
   - First Email: "Partnership Opportunity: Let's Build Together"

---

## 📧 Email Sequence

### **B2B Sequence (set_three_b2b) - 5 Steps:**

1. **Step 1 (Immediate):** Partnership Opportunity: Let's Build Together
2. **Step 2 (24 hours):** Why HingeCraft? The Value Proposition
3. **Step 3 (48 hours):** Success Stories: What Partners Are Saying
4. **Step 4 (72 hours):** Next Steps: How to Get Started
5. **Step 5 (96 hours):** Final Call: Don't Miss This Opportunity

---

## 🐳 Docker Memory Management

### **Memory Limits:**

| Service | Memory Limit | Reservation |
|---------|-------------|-------------|
| PostgreSQL | 512 MB | 256 MB |
| API Server | 1 GB | 512 MB |
| Redis | 256 MB | 128 MB |
| Monitoring | 128 MB | 64 MB |
| **Total** | **~1.9 GB** | **~960 MB** |

### **Memory Monitoring:**

```bash
# Check memory usage
docker stats

# Check specific service
docker stats hingecraft-api

# View logs
docker-compose logs -f api
```

### **Memory Optimization Features:**

- ✅ Node.js memory limit: 512 MB
- ✅ Redis max memory: 256 MB
- ✅ Automatic garbage collection
- ✅ Request size limits (10 MB)
- ✅ Rate limiting (100 req/15 min)

---

## ✅ Verification Steps

### **1. Email Received:**
- ✅ Check inbox: chandlerferguson319@gmail.com
- ✅ From: marketingecraft@gmail.com
- ✅ Subject: "Partnership Opportunity: Let's Build Together"
- ✅ HTML content renders correctly
- ✅ Personalization working ({{first_name}} → Chandler)

### **2. HubSpot Contact:**
- ✅ Contact created in HubSpot
- ✅ Properties set:
  - `automation_template_set`: set_three_b2b
  - `automation_lead_type`: B2B
  - `automation_next_email_step`: 1
  - `automation_next_send_timestamp`: [current timestamp]
  - `automation_emails_sent`: 0

### **3. Sequence Started:**
- ✅ Contact ready for step 2 (24 hours later)
- ✅ Timestamp set correctly
- ✅ Sequence will continue automatically

### **4. Docker Services:**
- ✅ All containers healthy
- ✅ Memory usage within limits
- ✅ No errors in logs

---

## 🔄 Next Steps After Test

### **If Test Successful:**

1. **Monitor Sequence:**
   - Wait 24 hours
   - Check for step 2 email
   - Verify sequence continues

2. **Production Launch:**
   - Upload production spreadsheet
   - System processes automatically
   - Monitor execution logs

3. **Scale Up:**
   - Increase Docker memory if needed
   - Adjust batch sizes
   - Monitor performance

### **If Test Fails:**

1. **Check Execution Logs:**
   - Apps Script → Executions
   - Look for error messages
   - Check authorization

2. **Verify Configuration:**
   - Script Properties correct
   - Email permissions granted
   - HubSpot token valid

3. **Check Docker:**
   - Containers running
   - Memory available
   - No errors in logs

---

## 📊 Test Results Template

```
Test Date: [DATE]
Test Email: chandlerferguson319@gmail.com
From Email: marketingecraft@gmail.com

Results:
[ ] Email sent successfully
[ ] Email received in inbox
[ ] HubSpot contact created
[ ] Properties set correctly
[ ] Qualification working
[ ] Sequence started
[ ] Docker services healthy
[ ] Memory within limits

Issues:
[Any issues encountered]

Next Steps:
[What to do next]
```

---

## 🎯 System Status

**Docker:** ✅ Configured and ready  
**Google Apps Script:** ✅ Test function ready  
**Qualification:** ✅ Process implemented  
**Email:** ✅ From marketingecraft@gmail.com  
**Memory:** ✅ Optimized and limited  

**Status:** ✅ **READY FOR LIVE TEST**

---

**Launch Command:** `./launch-live-test.sh`  
**Test Function:** `testSingleEmail()` in Apps Script  
**Expected Time:** 2-3 minutes for email delivery


