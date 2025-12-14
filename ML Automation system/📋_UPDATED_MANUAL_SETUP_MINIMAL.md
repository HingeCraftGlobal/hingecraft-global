# 📋 Updated HubSpot Manual Setup - Minimal (List Maintenance Only)

## 🎯 Overview

**HubSpot is ONLY for list maintenance** - All automation happens in backend.

This guide covers ONLY what cannot be automated via API.

---

## 🔑 PART 1: HubSpot Private App (Minimal Scopes)

Navigate to: **HubSpot Account → Settings → Integrations → Private Apps → Create Private App**

### **Required Scopes (Minimal - Only 6 scopes needed)**

```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.companies.read
crm.objects.companies.write
lists.read
lists.write
```

**That's it!** No marketing email scopes, no automation scopes needed.

**After creating:**
1. Copy the **Access Token** (starts with `pat-`)
2. Save it - you'll need it for the automated setup script

---

## 🧱 PART 2: Properties (AUTOMATED)

**✅ ALL properties are pushed automatically!**

Run this script to push all properties:
```bash
node scripts/automate-hubspot-setup.js
```

**No manual property creation needed!**

---

## 📋 PART 3: Lists (AUTOMATED)

**✅ ALL lists are created automatically!**

The automated script creates these lists:
- New Google Drive Leads
- Enriched Leads
- Ready to Send
- NGO Leads
- School Leads
- Student Leads
- High Score Leads
- Active Sequences
- Replied Leads
- Suppressed Leads

**No manual list creation needed!**

---

## ⚙️ PART 4: Workflows (AUTOMATED)

**✅ ALL list workflows are created automatically!**

The automated script creates 10 list maintenance workflows that automatically populate lists based on property values.

**No manual workflow creation needed!**

---

## 🔐 PART 5: External API Keys (Manual - Store in Backend)

**These are stored in your backend system, NOT in HubSpot:**

### **1. AnyMail API Key**
- Store in: `config/api_keys.js` or `.env`
- Key: `ANYMAIL_API_KEY`

### **2. Google Service Account JSON**
- Store in: `config/api_keys.js` or `.env`
- Key: `GOOGLE_SERVICE_ACCOUNT_JSON`
- Used for: Google Drive file access

### **3. Gemini AI API Key**
- Store in: `config/api_keys.js` or `.env`
- Key: `GEMINI_API_KEY`

### **4. Gmail OAuth Credentials**
- Complete OAuth flow for `marketingecraft@gmail.com`
- Store refresh token in backend
- Used for: Email sending via Gmail API

---

## 📧 PART 6: Email Templates (In Database, NOT HubSpot)

**✅ Email templates are stored in your database!**

No HubSpot email templates needed. Templates are:
- Stored in `email_templates` table
- Selected by backend based on `automation_template_set`
- Personalized by backend
- Sent via Gmail API

**No HubSpot email setup needed!**

---

## ✅ FINAL CHECKLIST (Minimal Manual Steps)

### **Before Running Automated Setup:**

- [ ] **Part 1:** Private App created with 6 minimal scopes
- [ ] **Part 1:** Access Token copied
- [ ] **Part 5:** AnyMail API key stored in backend
- [ ] **Part 5:** Google Service Account JSON stored in backend
- [ ] **Part 5:** Gemini API key stored in backend
- [ ] **Part 5:** Gmail OAuth completed for marketingecraft@gmail.com

### **After Running Automated Setup:**

- [ ] Verify properties created (check HubSpot UI)
- [ ] Verify lists created (check HubSpot UI)
- [ ] Verify workflows active (check HubSpot UI)
- [ ] Test: Drop file in Google Drive
- [ ] Test: Verify contacts appear in HubSpot
- [ ] Test: Verify lists populate
- [ ] Test: Verify emails send via Gmail

---

## 🚀 Automated Setup Command

```bash
node scripts/automate-hubspot-setup.js
```

This will:
1. ✅ Push ALL properties automatically
2. ✅ Sync ALL database data to HubSpot
3. ✅ Create ALL list workflows automatically
4. ✅ Create ALL lists automatically

**Everything else is automated!**

---

## 📊 What's Automated vs Manual

### ✅ Fully Automated (Via API)
- Property creation (40+ properties)
- Data sync (all leads)
- List creation (10 lists)
- Workflow creation (10 workflows)
- Email sending (pulls from lists, sends via Gmail)

### 📝 Manual Only
- Private App creation (6 scopes)
- Access Token copy
- External API keys (stored in backend, not HubSpot)
- Gmail OAuth (one-time setup)

---

## 🔄 Complete Flow (Automated)

1. **Google Drive** → File detected (automated)
2. **Backend** → Processes file (automated)
3. **AnyMail** → Enriches with email (automated)
4. **Backend** → Classifies lead (automated)
5. **Backend** → Syncs to HubSpot (automated)
6. **HubSpot** → Adds to lists (automatic via workflows)
7. **Backend** → Pulls from "Ready to Send" list (automated)
8. **Backend** → Sends via Gmail (automated)
9. **Backend** → Updates HubSpot (automated)

**No manual steps in daily operations!**

---

**System is 95% automated - only initial setup is manual!** 🚀
