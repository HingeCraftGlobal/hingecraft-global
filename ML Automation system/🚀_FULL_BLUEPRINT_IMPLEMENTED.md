# 🚀 Full Blueprint Implemented - Draft Tracking & Universal Sending

## ✅ What's Been Implemented

### **1. Draft Tracking System**
- ✅ `DraftTracking.gs` - Complete draft processing system
- ✅ `scanDraftsForOutbound()` - Main function (14-step process)
- ✅ Label-based draft identification
- ✅ Automatic tracking injection
- ✅ Automatic sending and cleanup

### **2. Tracking Endpoint**
- ✅ Web App deployed: `https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec`
- ✅ `doGet()` function handles pixel and clicks
- ✅ GA4 events integrated
- ✅ HubSpot updates integrated

### **3. Integration**
- ✅ `checkFolderForNewFiles()` now calls `scanDraftsForOutbound()`
- ✅ All tracking functions integrated
- ✅ Email sending updated with tracking

---

## 📊 14-Step Process (Automated)

### **Phase 1: Locating and Identifying the Draft**

1. ✅ **Find Label** - Identifies 'Tracked_Outbound' label
2. ✅ **Get Threads** - Retrieves all threads with label
3. ✅ **Access Draft** - Gets draft message from thread
4. ✅ **Pre-Checks** - Verifies draft status
5. ✅ **Get Recipient** - Extracts email address
6. ✅ **CRM Check** - Ensures contact exists in HubSpot

### **Phase 2: Injecting GA4 Tracking**

7. ✅ **Get HTML Body** - Retrieves draft content
8. ✅ **Link Wrapping** - Wraps all links with tracking URLs
9. ✅ **Create Click URL** - Builds tracking URLs with parameters
10. ✅ **Inject Pixel** - Adds 1x1 tracking pixel

### **Phase 3: Sending and Cleanup**

11. ✅ **Send Email** - Sends tracked email via Gmail
12. ✅ **Update Tracking** - Updates HubSpot properties
13. ✅ **Delete Draft** - Moves draft to trash
14. ✅ **Remove Label** - Removes label to prevent reprocessing

---

## ⚠️ Manual Tasks Remaining

### **Task 1: Add TRACKING_ENDPOINT_URL to Script Properties** ⏱️ 1 minute

**Action:**
1. Go to: https://script.google.com
2. Project Settings → Script Properties
3. Add property:
   - **Property:** `TRACKING_ENDPOINT_URL`
   - **Value:** `https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec`

**Status:** ✅ Web App deployed, just need to add URL to properties

---

### **Task 2: Add GA4 Properties (If Not Done)** ⏱️ 2 minutes

**Action:**
Add to Script Properties:
- `GA4_MEASUREMENT_ID` = `G-QF5H2Q291T`
- `GA4_API_SECRET` = `cJH76-IHQteQx6DKaiPkGA`
- `GA4_STREAM_ID` = `13142410458`
- `GA4_STREAM_URL` = `https://hingecraft-global.ai`

---

### **Task 3: Run createHubSpotProperties()** ⏱️ 2 minutes

**Action:**
1. Go to Apps Script
2. Run `createHubSpotProperties()` function
3. Creates all properties including 5 tracking properties

**Status:** ⚠️ Needs to be run once

---

### **Task 4: Set Up Time-Driven Trigger** ⏱️ 2 minutes

**Action:**
1. Apps Script → Triggers tab
2. Delete old `onNewFileAdded` triggers
3. Add trigger:
   - **Function:** `checkFolderForNewFiles`
   - **Event:** Time-driven
   - **Type:** Minutes timer
   - **Frequency:** Every 5 minutes
4. Save

**Why Every 5 Minutes:**
- Mimics "on file added" event
- Strictly enforces 24-hour sequence delay
- Processes drafts quickly

---

### **Task 5: Create Gmail Label** ⏱️ 1 minute

**Action:**
1. Go to Gmail
2. Create label: **"Tracked_Outbound"**
3. (Or the script will create it automatically on first run)

**Note:** Script will auto-create if it doesn't exist

---

## 🎯 How Draft Tracking Works

### **User Workflow:**
1. **Compose email** in Gmail
2. **Save as draft**
3. **Add label:** "Tracked_Outbound"
4. **Wait** (up to 5 minutes for trigger)
5. **Email sent automatically** with tracking

### **System Workflow:**
1. **Trigger fires** (every 5 minutes)
2. **Script finds** drafts with "Tracked_Outbound" label
3. **Injects tracking** (pixel + wrapped links)
4. **Sends email** via Gmail
5. **Updates HubSpot** with tracking data
6. **Deletes draft** and removes label

---

## 📊 Tracking Features

### **Email Opens:**
- ✅ Tracking pixel in every email
- ✅ Logs to GA4 as `email_opened`
- ✅ Updates HubSpot `total_emails_opened`

### **Link Clicks:**
- ✅ All links wrapped with tracking
- ✅ Logs to GA4 as `link_clicked`
- ✅ Updates HubSpot `total_clicks`
- ✅ Redirects to actual URL

### **Draft Processing:**
- ✅ Automatic label detection
- ✅ Contact creation if needed
- ✅ Template set detection
- ✅ Sequence step tracking

---

## ✅ What's Been Pushed

**Google Apps Script (clasp):**
- ✅ `Code.gs` - Updated with draft scanning
- ✅ `Tracking.gs` - Complete tracking system
- ✅ `DraftTracking.gs` - Draft processing system
- ✅ `HubSpotSetup.gs` - Updated with tracking properties
- ✅ `TEST_CONFIG.gs` - Test configuration

**Total Files:** 5 pushed

---

## 📋 Complete Setup Checklist

**Before System Works:**
- [x] Web App deployed (DONE)
- [ ] TRACKING_ENDPOINT_URL in Script Properties
- [ ] GA4 properties in Script Properties (4 properties)
- [ ] Run createHubSpotProperties()
- [ ] Set up time-driven trigger (Every 5 minutes)
- [ ] Create "Tracked_Outbound" label in Gmail (or auto-created)

---

## 🚀 Quick Start

### **To Use Draft Tracking:**
1. Compose email in Gmail
2. Save as draft
3. Add label: "Tracked_Outbound"
4. Wait up to 5 minutes
5. Email sent automatically with tracking

### **To Test:**
1. Create draft email
2. Add "Tracked_Outbound" label
3. Wait for trigger (or run `scanDraftsForOutbound()` manually)
4. Check email sent
5. Open email → Check GA4 Realtime
6. Click link → Check GA4 Realtime

---

## 📊 Deployment Info

**Web App URL:**
```
https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec
```

**Deployment ID:** `AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4`  
**Version:** 1  
**Deployed:** Dec 15, 2025, 7:45 AM  

---

**Status:** ✅ **BLUEPRINT FULLY IMPLEMENTED** | ⚠️ **4 MANUAL TASKS REMAINING**

**Next:** Add TRACKING_ENDPOINT_URL to Script Properties and complete remaining tasks!
