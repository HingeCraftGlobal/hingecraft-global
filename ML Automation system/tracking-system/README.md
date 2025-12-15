# 📊 Tracking System - GA4 Email Analytics

## Overview

Complete email tracking system integrated with Google Analytics 4 (GA4) and HubSpot for comprehensive email analytics.

---

## 🔑 Configuration

### **Environment Variables (.env)**

All tracking secrets are stored in `.env` file:

```env
GA4_MEASUREMENT_ID=G-QF5H2Q291T
GA4_STREAM_ID=13142410458
GA4_STREAM_URL=https://hingecraft-global.ai
GA4_API_SECRET=cJH76-IHQteQx6DKaiPkGA
TRACKING_ENDPOINT_URL=[Set after Web App deployment]
```

**⚠️ Security:** `.env` file is in `.gitignore` - never commit secrets!

---

## 📊 Tracking Metrics

### **1. Email Open Rate**
- **Method:** 1x1 transparent tracking pixel
- **GA4 Event:** `email_opened`
- **HubSpot Property:** `total_emails_opened` (incremented)
- **HubSpot Property:** `last_email_opened_at` (timestamp)

### **2. Click-Through Rate (CTR)**
- **Method:** Link wrapping with redirect
- **GA4 Event:** `link_clicked`
- **HubSpot Property:** `total_clicks` (incremented)
- **HubSpot Property:** `last_link_clicked_at` (timestamp)

### **3. Response Rate**
- **Method:** Gmail scanner (`scanGmailForResponses()`)
- **HubSpot Property:** `sequence_replied` (boolean)
- **GA4 Event:** `email_replied`

---

## 🚀 Setup Instructions

### **Step 1: Add GA4 Configuration to Script Properties**

1. Go to Apps Script → Project Settings → Script Properties
2. Add these properties:

| Property | Value |
|----------|-------|
| `GA4_MEASUREMENT_ID` | `G-QF5H2Q291T` |
| `GA4_API_SECRET` | `cJH76-IHQteQx6DKaiPkGA` |
| `GA4_STREAM_ID` | `13142410458` |
| `GA4_STREAM_URL` | `https://hingecraft-global.ai` |

### **Step 2: Deploy Web App (CRITICAL)**

1. In Apps Script, click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Configure:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL**
6. Add to Script Properties:
   - **Property:** `TRACKING_ENDPOINT_URL`
   - **Value:** [Pasted Web App URL]

### **Step 3: Create HubSpot Tracking Properties**

Run `createHubSpotProperties()` in Apps Script - it now includes:
- `total_emails_opened` (number)
- `total_clicks` (number)
- `sequence_replied` (boolean)
- `last_email_opened_at` (date)
- `last_link_clicked_at` (date)

### **Step 4: Push Tracking Code**

```bash
cd google-apps-script
clasp push
```

---

## 🔄 How It Works

### **Email Open Tracking:**
1. Email sent with tracking pixel: `<img src="[TRACKING_URL]?t=o&c=[CONTACT_ID]&s=[TEMPLATE]&step=[STEP]">`
2. When email opened, pixel loads
3. `doGet()` function called with type='o'
4. GA4 event `email_opened` sent
5. HubSpot `total_emails_opened` incremented
6. Returns 1x1 transparent GIF

### **Link Click Tracking:**
1. All links in email wrapped: `href="[TRACKING_URL]?t=l&c=[CONTACT_ID]&url=[ACTUAL_URL]">`
2. User clicks link
3. `doGet()` function called with type='l'
4. GA4 event `link_clicked` sent
5. HubSpot `total_clicks` incremented
6. User redirected to actual URL

### **Response Detection:**
1. `scanGmailForResponses()` runs periodically
2. Scans Gmail threads for replies
3. Updates HubSpot `sequence_replied` property
4. Logs GA4 `email_replied` event

---

## 📊 GA4 Events

### **Events Tracked:**

1. **email_opened**
   - Parameters: `template_set`, `email_step`, `engagement_time_msec`

2. **link_clicked**
   - Parameters: `link_url`, `template_set`, `email_step`

3. **email_replied**
   - Parameters: `reply_timestamp`

---

## 🔧 Functions

### **Tracking.gs Functions:**

- `doGet(e)` - Web App endpoint (pixel & clicks)
- `sendGa4Event()` - Sends events to GA4
- `updateHubSpotTrackingProperty()` - Updates HubSpot properties
- `wrapLinksWithTracking()` - Wraps email links
- `addTrackingPixel()` - Adds tracking pixel to email
- `scanGmailForResponses()` - Detects email replies
- `logEmailEvent()` - Logs events to database

---

## ✅ Verification

### **Test Open Tracking:**
1. Send test email
2. Open email
3. Check GA4 → Realtime → Events (should see `email_opened`)
4. Check HubSpot contact → `total_emails_opened` should be 1

### **Test Click Tracking:**
1. Click any link in email
2. Check GA4 → Realtime → Events (should see `link_clicked`)
3. Check HubSpot contact → `total_clicks` should be 1
4. Should redirect to actual URL

---

## 📄 Files

- `Tracking.gs` - Complete tracking implementation
- `.env` - Configuration (not committed)
- `README.md` - This file

---

**Status:** ✅ **TRACKING SYSTEM READY**

**Next:** Deploy Web App and configure Script Properties!
