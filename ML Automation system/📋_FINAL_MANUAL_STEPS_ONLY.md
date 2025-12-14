# 📋 Final Manual Steps - What You Need to Do

## 🎯 Overview

**95% is automated!** This guide covers ONLY what you must do manually.

---

## ✅ STEP 1: HubSpot Private App (5 minutes)

### Navigate to:
**HubSpot Account → Settings → Integrations → Private Apps → Create Private App**

### Select ONLY These 6 Scopes:
```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.companies.read
crm.objects.companies.write
lists.read
lists.write
```

### After Creating:
1. Copy the **Access Token** (starts with `pat-`)
2. Paste it into `config/api_keys.js`:
   ```javascript
   hubspot: {
     personalAccessKey: 'pat-...' // Paste here
   }
   ```

**That's it for HubSpot setup!**

---

## ✅ STEP 2: Run Automated Setup (2 minutes)

```bash
cd "ML Automation system"
node scripts/automate-hubspot-setup.js
```

This will automatically:
- ✅ Push ALL 40+ properties to HubSpot
- ✅ Sync ALL database data to HubSpot
- ✅ Create ALL 10 list workflows
- ✅ Create ALL 10 lists

**No manual property creation needed!**

---

## ✅ STEP 3: Verify in HubSpot UI (5 minutes)

1. **Check Properties:**
   - Go to: Settings → Properties → Contacts
   - Verify properties starting with `automation_` exist
   - Should see 40+ properties

2. **Check Lists:**
   - Go to: Contacts → Lists
   - Verify these lists exist:
     - Ready to Send
     - New Google Drive Leads
     - Enriched Leads
     - NGO Leads
     - School Leads
     - Student Leads
     - High Score Leads
     - Active Sequences
     - Replied Leads
     - Suppressed Leads

3. **Check Workflows:**
   - Go to: Automation → Workflows
   - Verify 10 workflows exist (all starting with "List:")
   - Activate them if not already active

**Done!**

---

## ✅ STEP 4: External API Keys (Already in Backend)

**These are already configured in your backend:**
- ✅ AnyMail API Key: `config/api_keys.js`
- ✅ Google Service Account: For Drive access
- ✅ Gemini API Key: `config/api_keys.js`
- ✅ Gmail OAuth: Complete OAuth flow for `marketingecraft@gmail.com`

**No HubSpot secrets needed!** (Everything stored in backend)

---

## 🚀 That's It!

**Total Manual Time: ~15 minutes**

After running `automate-hubspot-setup.js`, the system is fully automated:

1. **Drop file in Google Drive** → System processes automatically
2. **AnyMail enriches** → Webhook receives results automatically
3. **Backend syncs to HubSpot** → Lists populate automatically
4. **Backend pulls from lists** → Sends emails via Gmail automatically
5. **HubSpot updates** → After email send automatically

**No further manual steps needed!**

---

## 📊 What's Automated vs Manual

### ✅ Fully Automated (95%)
- Property creation (40+ properties)
- Data sync (all leads)
- List creation (10 lists)
- Workflow creation (10 workflows)
- List population (automatic)
- Email sending (pulls from lists, sends via Gmail)
- HubSpot updates (after email send)
- Template selection (from database)
- Personalization (HubSpot + database data)

### 📝 Manual Only (5%)
- Private App creation (6 scopes)
- Access Token copy to config file
- Run automated setup script
- Verify in HubSpot UI

---

## 🎯 Quick Start

1. **Create Private App** (5 min)
2. **Copy Access Token** to `config/api_keys.js`
3. **Run:** `node scripts/automate-hubspot-setup.js`
4. **Verify** in HubSpot UI
5. **Done!** System is fully automated

---

**System is ready - HubSpot is ONLY for list maintenance!** 🚀
