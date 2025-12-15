# 🚀 Live Test Email Execution Guide

## 📧 Ready to Send Live Test Email

**FROM:** marketingecraft@gmail.com  
**TO:** chandlerferguson319@gmail.com  
**Template:** B2B Step 1 (set_three_b2b)  
**Subject:** Partnership Opportunity: Let's Build Together

---

## ⚡ Quick Execution (2 minutes)

### **Step 1: Open Google Apps Script**
1. Go to: **https://script.google.com**
2. Sign in with your Google account (marketingecraft@gmail.com)
3. Open your **HingeCraft Automation** project

### **Step 2: Select and Run Function**
1. In the function dropdown (top center), select: **`testSingleEmail`**
2. Click the **"Run"** button (▶️ play icon)
3. If prompted, click **"Review Permissions"**
4. Select your Google account
5. Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
6. Click **"Allow"** to grant permissions

### **Step 3: Check Execution Log**
1. Look at the execution log (bottom panel)
2. You should see:
   ```
   🧪 Starting live test with single email...
   Test Email: chandlerferguson319@gmail.com
   From Email: marketingecraft@gmail.com
   Qualification Result:
     Lead Type: B2B
     Template Set: set_three_b2b
     Score: 75
   ✅ Email sent successfully!
   ```

### **Step 4: Verify Email**
1. Check inbox: **chandlerferguson319@gmail.com**
2. Look for email from: **marketingecraft@gmail.com**
3. Subject: **"Partnership Opportunity: Let's Build Together"**
4. Verify personalized content

---

## ✅ Expected Results

### **Email Details:**
- **From:** marketingecraft@gmail.com
- **To:** chandlerferguson319@gmail.com
- **Subject:** Partnership Opportunity: Let's Build Together
- **Template:** B2B Step 1
- **Personalization:** Yes (name, company, etc.)

### **Execution Log:**
- ✅ Function executed successfully
- ✅ Qualification completed (B2B, set_three_b2b)
- ✅ Email sent via Gmail
- ✅ No errors

### **HubSpot (if applicable):**
- ✅ Contact created/updated
- ✅ Properties set:
  - `automation_template_set`: set_three_b2b
  - `automation_lead_type`: B2B
  - `automation_next_email_step`: 1
  - `automation_next_send_timestamp`: Current time

---

## 🔧 Troubleshooting

### **Issue: Function not found**
**Solution:**
- Make sure `TEST_CONFIG.gs` is in your project
- Run `clasp push` to sync files

### **Issue: Permission denied**
**Solution:**
- Click "Review Permissions" again
- Make sure you're signed in with the correct account
- Grant all requested permissions

### **Issue: Email not received**
**Solution:**
- Check spam folder
- Verify email address: chandlerferguson319@gmail.com
- Check execution log for errors
- Wait 1-2 minutes (Gmail delivery time)

### **Issue: Error in execution**
**Solution:**
- Check execution log for specific error
- Verify Script Properties are set:
  - `HUBSPOT_TOKEN`
  - `ANYMAIL_API_KEY`
  - `MONITORED_FOLDER_ID`
  - `GMAIL_FROM_ADDRESS`

---

## 📊 Test Verification Checklist

- [ ] Function `testSingleEmail` exists
- [ ] Function executed without errors
- [ ] Execution log shows success
- [ ] Email received at chandlerferguson319@gmail.com
- [ ] Email from: marketingecraft@gmail.com
- [ ] Subject line correct
- [ ] Content personalized
- [ ] No errors in log

---

## 🎯 Next Steps After Test

1. **Verify Email Received:**
   - Check inbox
   - Verify content
   - Check personalization

2. **Check HubSpot (if applicable):**
   - Verify contact created
   - Check properties set
   - Verify sequence started

3. **Review Logs:**
   - Check execution log
   - Verify no errors
   - Note any warnings

4. **Ready for Production:**
   - If test successful, system is ready
   - If issues found, fix and retest

---

## 📝 Manual Execution Command

If you prefer command line:

```bash
cd "/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/ML Automation system"
node scripts/send-live-test-email.js
```

Then follow the instructions provided.

---

**Status:** ✅ **READY FOR LIVE TEST**

**Execute the test now to verify the complete email system!**


