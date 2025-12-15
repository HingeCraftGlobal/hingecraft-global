# 📋 Manual Tasks Required - Cannot Be Done via CLI

## ⚠️ These tasks MUST be done manually in the Apps Script UI

---

## 🔴 CRITICAL MANUAL TASKS

### **Task 1: Add GA4 Properties to Script Properties** ⏱️ 2 minutes

**Why Manual:** Script Properties can only be set via Apps Script UI, not CLI.

**Action:**
1. Go to: https://script.google.com
2. Open your HingeCraft Automation project
3. Click **Project Settings** (⚙️ gear icon)
4. Scroll to **Script Properties**
5. Click **"Add script property"** for each:

| Property | Value |
|----------|-------|
| `GA4_MEASUREMENT_ID` | `G-QF5H2Q291T` |
| `GA4_API_SECRET` | `cJH76-IHQteQx6DKaiPkGA` |
| `GA4_STREAM_ID` | `13142410458` |
| `GA4_STREAM_URL` | `https://hingecraft-global.ai` |

6. Click **"Save script properties"**

---

### **Task 2: Deploy Web App (CRITICAL)** ⏱️ 3 minutes

**Why Manual:** Web App deployment requires UI interaction and generates a unique URL that cannot be predicted.

**Action:**
1. In Apps Script, click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description:** "Email Tracking Endpoint"
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy**
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/AKfycby.../exec`)
7. **IMPORTANT:** Add to Script Properties:
   - **Property:** `TRACKING_ENDPOINT_URL`
   - **Value:** [Pasted Web App URL]

**⚠️ CRITICAL:** Without this URL, tracking pixels and link wrapping won't work!

---

### **Task 3: Create HubSpot Tracking Properties** ⏱️ 2 minutes

**Why Manual:** HubSpot property creation requires API call execution, which must be done manually in Apps Script.

**Action:**
1. Go to Apps Script
2. Open **HubSpotSetup.gs**
3. Select function: `createHubSpotProperties`
4. Click **Run** (▶️)
5. This now creates 5 additional tracking properties:
   - `total_emails_opened` (number)
   - `total_clicks` (number)
   - `sequence_replied` (boolean)
   - `last_email_opened_at` (date)
   - `last_link_clicked_at` (date)

**Verify:**
- Check execution log for "✅ Created/Updated property"
- Go to HubSpot → Settings → Properties → Contacts
- Should see all new tracking properties

---

### **Task 4: Test Tracking** ⏱️ 3 minutes

**Why Manual:** Requires actual email interaction to verify tracking works.

**Action:**
1. Run `testSingleEmail()` in Apps Script
2. Open email at chandlerferguson319@gmail.com
3. **Check GA4:**
   - Go to: https://analytics.google.com
   - Select property: HingeCraft Global
   - Go to: Realtime → Events
   - Should see `email_opened` event appear
4. **Click a link** in the email
5. **Check GA4:**
   - Should see `link_clicked` event appear
6. **Check HubSpot:**
   - Find contact: chandlerferguson319@gmail.com
   - Should show: `total_emails_opened: 1`
   - Should show: `total_clicks: 1`

---

## 📊 What CLI Can't Do

### **Cannot Be Automated:**
1. ❌ **Script Properties** - Must be set in Apps Script UI
2. ❌ **Web App Deployment** - Requires UI interaction and generates unique URL
3. ❌ **HubSpot Property Creation** - Requires running function in Apps Script
4. ❌ **GA4 Configuration** - Properties must be set manually
5. ❌ **Testing** - Requires actual email interaction

### **Can Be Automated:**
1. ✅ **Code Push** - `clasp push` (already done)
2. ✅ **Code Updates** - All tracking code written
3. ✅ **Integration** - Email sending updated
4. ✅ **Documentation** - All guides created

---

## 🚀 Quick Setup Checklist

**Before Tracking Works:**
- [ ] GA4 properties added (4 properties)
- [ ] Web App deployed
- [ ] TRACKING_ENDPOINT_URL added to Script Properties
- [ ] HubSpot tracking properties created
- [ ] Test email sent and opened
- [ ] GA4 events visible
- [ ] HubSpot properties updating

---

## ⏱️ Total Time: ~10 minutes

**All manual tasks can be completed in the Apps Script UI.**

---

**Status:** ✅ **CODE COMPLETE** | ⚠️ **MANUAL SETUP REQUIRED**
