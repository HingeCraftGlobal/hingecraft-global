# 🚀 HubSpot Sync - Ready to Launch

## ✅ Integration Complete!

All HubSpot integration code is built and ready. The Personal Access Key needs to be refreshed.

---

## ⚠️ Current Status

**Personal Access Key**: Expired (needs refresh)

**Integration Code**: ✅ Complete
- Custom Objects Service
- Contact Properties Sync
- Pipeline Metrics Sync
- CLI Integration
- API Endpoints
- Full Sync Scripts

---

## 🔐 Step 1: Generate New Personal Access Key

### Option A: Using HubSpot CLI

```bash
# Initialize (if first time)
hs init

# Generate new Personal Access Key
hs auth personal-access-key
```

This will display a new key. Copy it.

### Option B: Using HubSpot UI

1. Go to: https://app-na2.hubspot.com/settings/integrations/private-apps
2. Create/Edit private app: "Automation System"
3. Go to **Auth** tab
4. Click **Generate token**
5. Copy the Personal Access Token

---

## 📝 Step 2: Update Config

Edit `config/api_keys.js`:

```javascript
hubspot: {
  personalAccessKey: 'pat-YOUR-NEW-TOKEN-HERE', // ← Update this
  apiKey: 'na2-e523-6348-4407-a23a-d0c00f2ed0ca',
  portalId: '244560986',
  baseUrl: 'https://api.hubapi.com'
}
```

---

## ✅ Step 3: Test Connection

```bash
node scripts/test-hubspot-connection.js
```

Should show: ✅ API CONNECTION: VALID

---

## 🚀 Step 4: Launch Full Sync

Once connection is valid:

```bash
# Full sync (all features)
DB_HOST=localhost DB_PORT=7543 node scripts/hubspot-full-sync.js

# OR via API
curl -X POST http://localhost:7101/api/hubspot/cli/full-sync
```

---

## 📊 What Gets Synced

1. **Custom Properties** (8 properties)
   - automation_lead_type
   - automation_template_set
   - automation_lead_score
   - automation_sequence_status
   - automation_emails_sent/opened/clicked/replied

2. **All Leads** → HubSpot Contacts
   - Creates/updates all contacts
   - Syncs all lead data

3. **Contact Properties**
   - Updates all contacts with automation data
   - Sequence status, email stats, etc.

4. **Custom Objects** (if permissions allow)
   - Pipeline Run objects
   - Pipeline Metrics objects

5. **Timeline Events**
   - Pipeline activities logged

---

## 🎯 Quick Commands

```bash
# Test connection
node scripts/test-hubspot-connection.js

# Full sync
DB_HOST=localhost DB_PORT=7543 node scripts/hubspot-full-sync.js

# Sync contacts only (fallback)
DB_HOST=localhost DB_PORT=7543 node scripts/sync-contacts-only.js

# Via API
curl -X POST http://localhost:7101/api/hubspot/cli/full-sync
```

---

## 📚 Documentation

- **HUBSPOT_PERSONAL_ACCESS_KEY_SETUP.md** - How to get new key
- **HUBSPOT_DASHBOARD_INTEGRATION.md** - Full integration guide
- **HUBSPOT_API_AUTH_FIX.md** - Troubleshooting

---

## ✅ Summary

**Status**: Integration code complete, waiting for valid API key

**Next Step**: Generate new Personal Access Key and update config

**Then**: Run full sync to push all data to HubSpot

---

*All code is ready. Just need a valid API key to launch!* 🚀
