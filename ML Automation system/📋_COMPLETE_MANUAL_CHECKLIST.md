# 📋 Complete Manual Setup Checklist

## ✅ Code Status: ALL DEPLOYED

All code has been pushed to Google Apps Script. The following manual tasks MUST be completed in the Apps Script UI.

---

## 🔴 CRITICAL TASKS (Must Complete First)

### **Task 1: Add TRACKING_ENDPOINT_URL to Script Properties** ⏱️ 1 minute

**Steps:**
1. Go to: https://script.google.com
2. Open your project
3. Click **Project Settings** (⚙️ icon in left sidebar)
4. Scroll to **Script Properties** section
5. Click **Add script property**
6. Enter:
   - **Property:** `TRACKING_ENDPOINT_URL`
   - **Value:** `https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec`
7. Click **Save script property**

**Why:** This URL is required for email tracking (pixel and link clicks) to work.

---

### **Task 2: Add GA4 Properties to Script Properties** ⏱️ 2 minutes

**Steps:**
1. Same location: **Project Settings → Script Properties**
2. Add these 4 properties (one at a time):

   **Property 1:**
   - **Property:** `GA4_MEASUREMENT_ID`
   - **Value:** `G-QF5H2Q291T`
   - Click **Save script property**

   **Property 2:**
   - **Property:** `GA4_API_SECRET`
   - **Value:** `cJH76-IHQteQx6DKaiPkGA`
   - Click **Save script property**

   **Property 3:**
   - **Property:** `GA4_STREAM_ID`
   - **Value:** `13142410458`
   - Click **Save script property**

   **Property 4:**
   - **Property:** `GA4_STREAM_URL`
   - **Value:** `https://hingecraft-global.ai`
   - Click **Save script property**

**Why:** Required for GA4 Measurement Protocol to send tracking events.

---

### **Task 3: Run createHubSpotProperties() Function** ⏱️ 2 minutes

**Steps:**
1. In Apps Script Editor, go to **Editor** tab
2. Open `HubSpotSetup.gs` file (or it may be visible in the file list)
3. In the function dropdown (top toolbar), select: **`createHubSpotProperties`**
4. Click the **Run** button (▶️)
5. Wait for execution to complete
6. Check the **Execution log** (View → Execution log) for:
   - ✅ "Created/Updated property: [property name]"
   - ✅ "HubSpot Property Creation complete."

**What it creates:**
- 23 total properties including:
  - `total_emails_opened` (number)
  - `total_clicks` (number)
  - `sequence_replied` (boolean)
  - `last_email_opened_at` (datetime)
  - `last_link_clicked_at` (datetime)
  - Plus all automation properties

**Why:** Creates all required HubSpot custom properties for tracking and automation.

---

### **Task 4: Set Up Time-Driven Trigger** ⏱️ 2 minutes

**Steps:**
1. In Apps Script Editor, click **Triggers** tab (⏰ icon in left sidebar)
2. **Delete old triggers** (if any):
   - Find any `onNewFileAdded` triggers
   - Click the 3-dot menu → **Delete**
3. Click **Add Trigger** (bottom right)
4. Configure:
   - **Function:** `checkFolderForNewFiles`
   - **Deployment:** Head
   - **Event source:** Time-driven
   - **Type of time-based trigger:** Minutes timer
   - **Minutes interval:** Every 5 minutes
5. Click **Save**

**Why:** 
- Processes new files in Drive folder
- Runs sequence manager for follow-up emails
- Scans drafts for outbound tracking
- Enforces 24-hour sequence timing

---

## 🟡 OPTIONAL TASKS

### **Task 5: Create Gmail Label** ⏱️ 1 minute (Optional)

**Steps:**
1. Go to Gmail: https://mail.google.com
2. In left sidebar, scroll to **Labels** section
3. Click **Create new label**
4. Enter: `Tracked_Outbound`
5. Click **Create**

**Note:** The script will auto-create this label on first run if it doesn't exist, so this is optional.

---

## ✅ Verification Steps

### **Verify Script Properties:**
1. Go to **Project Settings → Script Properties**
2. Verify you see:
   - ✅ `TRACKING_ENDPOINT_URL`
   - ✅ `GA4_MEASUREMENT_ID`
   - ✅ `GA4_API_SECRET`
   - ✅ `GA4_STREAM_ID`
   - ✅ `GA4_STREAM_URL`
   - ✅ `HUBSPOT_TOKEN` (should already exist)
   - ✅ `ANYMAIL_API_KEY` (should already exist)
   - ✅ `MONITORED_FOLDER_ID` (should already exist)
   - ✅ `GMAIL_FROM_ADDRESS` (should already exist)

### **Verify HubSpot Properties:**
1. Go to HubSpot: https://app.hubspot.com
2. Navigate to **Settings → Properties → Contact Properties**
3. Search for and verify these exist:
   - ✅ `total_emails_opened`
   - ✅ `total_clicks`
   - ✅ `sequence_replied`
   - ✅ `last_email_opened_at`
   - ✅ `last_link_clicked_at`

### **Verify Trigger:**
1. In Apps Script, go to **Triggers** tab
2. Verify you see:
   - ✅ One trigger for `checkFolderForNewFiles`
   - ✅ Event: Time-driven
   - ✅ Frequency: Every 5 minutes
   - ✅ Status: Enabled

---

## 🧪 Test the System

### **Test 1: Draft Tracking**
1. Compose an email in Gmail
2. Save as draft
3. Add label: `Tracked_Outbound`
4. Wait up to 5 minutes (or run `scanDraftsForOutbound()` manually)
5. Check:
   - ✅ Email was sent
   - ✅ Draft was deleted
   - ✅ Label was removed

### **Test 2: Email Tracking**
1. Send a test email (via `testSingleEmail()` or draft tracking)
2. Open the email
3. Check GA4 Realtime:
   - ✅ Event: `email_opened` appears
4. Click a link in the email
5. Check GA4 Realtime:
   - ✅ Event: `link_clicked` appears
6. Check HubSpot contact:
   - ✅ `total_emails_opened` incremented
   - ✅ `total_clicks` incremented

---

## 📊 Quick Reference

### **Script Properties (5 required):**
```
TRACKING_ENDPOINT_URL = https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec
GA4_MEASUREMENT_ID = G-QF5H2Q291T
GA4_API_SECRET = cJH76-IHQteQx6DKaiPkGA
GA4_STREAM_ID = 13142410458
GA4_STREAM_URL = https://hingecraft-global.ai
```

### **HubSpot Properties (5 tracking):**
- `total_emails_opened` (number)
- `total_clicks` (number)
- `sequence_replied` (boolean)
- `last_email_opened_at` (datetime)
- `last_link_clicked_at` (datetime)

### **Trigger Configuration:**
- **Function:** `checkFolderForNewFiles`
- **Event:** Time-driven
- **Frequency:** Every 5 minutes

---

## ⚠️ Common Issues

### **Issue: Script Properties not saving**
- **Solution:** Make sure you click "Save script property" after each entry

### **Issue: createHubSpotProperties() not in dropdown**
- **Solution:** 
  1. Open `HubSpotSetup.gs` file
  2. Type `createHubSpotProperties` in the function dropdown
  3. Or use `runHubSpotSetup()` from `Code.gs`

### **Issue: Trigger not running**
- **Solution:**
  1. Check trigger is enabled (green status)
  2. Check execution log for errors
  3. Verify function name is correct: `checkFolderForNewFiles`

### **Issue: Web App URL not working**
- **Solution:**
  1. Verify Web App is deployed (Deploy → Manage deployments)
  2. Verify URL matches exactly in Script Properties
  3. Test URL directly in browser (should show "Tracking successful")

---

## ✅ Completion Checklist

- [ ] TRACKING_ENDPOINT_URL added to Script Properties
- [ ] GA4_MEASUREMENT_ID added to Script Properties
- [ ] GA4_API_SECRET added to Script Properties
- [ ] GA4_STREAM_ID added to Script Properties
- [ ] GA4_STREAM_URL added to Script Properties
- [ ] createHubSpotProperties() function executed
- [ ] Time-driven trigger set up (Every 5 minutes)
- [ ] Gmail label created (optional)
- [ ] All properties verified in HubSpot
- [ ] Test email sent and tracking verified

---

**Status:** ⚠️ **MANUAL TASKS REQUIRED** | ✅ **ALL CODE DEPLOYED**

**Estimated Time:** 7-10 minutes for all critical tasks
