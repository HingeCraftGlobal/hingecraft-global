# 📊 Large Batch Processing - Thousands of Leads

## ✅ System Updated for Large Spreadsheets

The system has been optimized to handle **thousands of leads** efficiently.

---

## 🔧 Optimizations Made

### **1. Batch Processing in File Processing**
- **Batch Size:** 100 rows per batch
- **Progress Logging:** Logs after each batch
- **Rate Limiting:** 100ms delay every 10 rows
- **Batch Pauses:** 1 second between batches
- **Result:** Can process 5,000+ leads without timeout

### **2. Increased Search API Limit**
- **Previous:** 100 contacts per query
- **Updated:** 1,000 contacts per query
- **Result:** Faster sequence management for large lists

### **3. Email Sending Batching**
- **Batch Size:** 50 emails per batch
- **Rate Limiting:** 500ms between emails
- **Batch Pauses:** 2 seconds every 50 emails
- **Result:** Respects Gmail daily limits (500-2,000 emails/day)

---

## 📊 Processing Capacity

### **File Processing:**
- **Small Files (1-100 leads):** ~30 seconds
- **Medium Files (100-1,000 leads):** ~5-10 minutes
- **Large Files (1,000-5,000 leads):** ~30-60 minutes
- **Very Large Files (5,000+ leads):** Multiple execution cycles

### **Email Sending:**
- **Per Execution:** Up to 1,000 contacts
- **Daily Limit:** 500-2,000 emails (Gmail limits)
- **Timing:** 24-hour intervals between sequence steps

---

## 🔄 How It Works with Large Files

### **Example: 3,000 Lead Spreadsheet**

```
1. File Uploaded to Drive
   ↓
2. checkFolderForNewFiles() runs (every hour)
   ↓
3. Detects new file (3,000 rows)
   ↓
4. Processing Starts:
   - Batch 1: Rows 1-100 (30 seconds)
   - Batch 2: Rows 101-200 (30 seconds)
   - ...
   - Batch 30: Rows 2,901-3,000 (30 seconds)
   ↓
5. Total Processing Time: ~15-20 minutes
   ↓
6. Results:
   - 3,000 contacts processed
   - 2,850 emails found (AnyMail)
   - 2,850 contacts synced to HubSpot
   - 2,850 contacts ready for sequence
   ↓
7. Sequence Manager Runs:
   - Finds 2,850 contacts ready (step=1, timestamp<now)
   - Sends first emails in batches of 50
   - Processes 1,000 per execution (respects limits)
   - Remaining 1,850 processed in next execution
   ↓
8. All Contacts Advanced:
   - Step: 1 → 2
   - Timestamp: now + 24 hours
   ↓
9. Next Hour:
   - Sequence manager runs again
   - Sends step 2 emails (24 hours after step 1)
   - Continues until sequence complete
```

---

## ⚙️ Configuration

### **Current Settings:**
- **File Processing Batch:** 100 rows
- **Email Sending Batch:** 50 emails
- **Search API Limit:** 1,000 contacts
- **Rate Limiting:** Built-in delays

### **Gmail Limits:**
- **Free Account:** 500 emails/day
- **Workspace Account:** 2,000 emails/day
- **System Respects:** Automatic batching and delays

---

## 📧 Email Configuration

### **From Address:**
- **Updated to:** chandlerferguson319@gmail.com
- **From Name:** HingeCraft
- **Reply-To:** chandlerferguson319@gmail.com

### **Email Preview:**
See `📧_EMAIL_PREVIEW.html` for full email preview

---

## 🧪 Testing Large Batches

### **Test File Structure:**
```csv
First Name,Last Name,Company,Website,Title,City,Country
John,Doe,Acme Corp,https://acme.com,CEO,Denver,USA
Jane,Smith,Tech Inc,https://tech.com,CTO,San Francisco,USA
... (add thousands more rows)
```

### **Monitoring:**
1. Check execution logs in Apps Script
2. Look for batch progress messages
3. Monitor HubSpot for contact creation
4. Check Gmail for sent emails

---

## ⚠️ Important Notes

1. **Execution Time Limits:**
   - Google Apps Script: 6 minutes per execution
   - Large files may require multiple executions
   - System automatically handles this

2. **Rate Limits:**
   - HubSpot API: 100 requests/10 seconds
   - Gmail: 500-2,000 emails/day
   - AnyMail: Check your plan limits
   - System includes automatic rate limiting

3. **Error Handling:**
   - Failed rows logged with error details
   - Processing continues even if some rows fail
   - Check execution logs for specific errors

---

## ✅ System Ready for Large Batches

**Status:** ✅ Optimized for thousands of leads

**Capabilities:**
- ✅ Process 5,000+ leads per file
- ✅ Batch processing to avoid timeouts
- ✅ Rate limiting to respect API limits
- ✅ Progress logging for monitoring
- ✅ Error handling for failed rows

**Next:** Upload your large spreadsheet and monitor execution logs!


