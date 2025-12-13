# 🔐 HubSpot Personal Access Key Setup

## ⚠️ Current Issue: Personal Access Key Expired

The provided Personal Access Key has expired. You need to generate a new one.

---

## ✅ How to Get a New Personal Access Key

### Step 1: Generate New Key via HubSpot CLI

1. **Install HubSpot CLI** (if not already installed):
   ```bash
   npm install -g @hubspot/cli
   ```

2. **Initialize HubSpot CLI**:
   ```bash
   hs init
   ```
   This will open a browser to authenticate.

3. **Get Personal Access Key**:
   ```bash
   hs auth personal-access-key
   ```
   This will generate and display a new Personal Access Key.

### Step 2: Alternative - Generate via HubSpot UI

1. Go to: https://app-na2.hubspot.com/settings/integrations/private-apps
2. Click **Create a private app**
3. Name it: "Automation System"
4. Go to **Scopes** tab and grant:
   - **CRM** → Read & Write
   - **Custom Objects** → Read & Write  
   - **Schemas** → Read & Write
   - **Contacts** → Read & Write
5. Go to **Auth** tab
6. Click **Generate token**
7. Copy the **Personal Access Token** (starts with `pat-`)

### Step 3: Update Config

Edit `config/api_keys.js`:

```javascript
hubspot: {
  personalAccessKey: 'pat-YOUR-NEW-TOKEN-HERE', // Replace with new token
  apiKey: 'na2-e523-6348-4407-a23a-d0c00f2ed0ca', // Keep as fallback
  portalId: '244560986',
  baseUrl: 'https://api.hubapi.com',
  developerOverviewUrl: 'https://app-na2.hubspot.com/developer-overview/244560986'
}
```

### Step 4: Test Connection

```bash
node -e "
const axios = require('axios');
const config = require('./config/api_keys');
const apiKey = config.hubspot.personalAccessKey || config.hubspot.apiKey;
axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
  headers: {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  }
}).then(r => console.log('✅ API Key Valid - Status:', r.status))
  .catch(e => console.error('❌ API Key Invalid:', e.response?.status));
"
```

---

## 🚀 Once Key is Updated, Run Full Sync

```bash
# Full sync with all features
DB_HOST=localhost DB_PORT=7543 node scripts/hubspot-full-sync.js

# OR via API
curl -X POST http://localhost:7101/api/hubspot/cli/full-sync
```

---

## 📊 What Will Sync

Once you have a valid key, the sync will:

1. ✅ **Create Custom Properties** (automation_*)
2. ✅ **Sync All Leads** to HubSpot Contacts
3. ✅ **Update Contact Properties** with automation data
4. ✅ **Create Custom Objects** (Pipeline Run, Pipeline Metrics)
5. ✅ **Sync Pipeline Metrics** to HubSpot
6. ✅ **Create Timeline Events** for pipeline activities

---

## 🔧 Quick Setup Script

After updating your key, run:

```bash
./scripts/setup-hubspot-cli.sh
```

This will:
- Test API connection
- Create custom properties
- Sync all leads
- Sync pipeline metrics

---

## 📚 Documentation

- **HUBSPOT_DASHBOARD_INTEGRATION.md** - Full integration guide
- **HUBSPOT_API_AUTH_FIX.md** - Authentication troubleshooting

---

*Once you have a valid Personal Access Key, everything will sync automatically!* 🔐
