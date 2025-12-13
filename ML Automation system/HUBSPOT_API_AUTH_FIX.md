# 🔐 HubSpot API Authentication Fix

## ⚠️ Issue: 401 Unauthorized

The HubSpot API returned a 401 error, which means authentication failed.

---

## 🔍 Possible Causes

1. **Invalid API Key** - The API key may be expired or incorrect
2. **Missing Scopes** - The API key may not have required permissions
3. **Wrong API Key Format** - HubSpot uses private app access tokens

---

## ✅ How to Fix

### Step 1: Verify Your API Key

1. Go to HubSpot: https://app-na2.hubspot.com/developer-overview/244560986
2. Navigate to **Private Apps** or **API Keys**
3. Verify your API key is active
4. Check it has these scopes:
   - `crm.objects.contacts.write`
   - `crm.objects.contacts.read`
   - `crm.schemas.custom.write`
   - `crm.schemas.custom.read`
   - `crm.objects.custom.write`
   - `crm.objects.custom.read`

### Step 2: Get a New Private App Access Token

1. Go to **Settings** → **Integrations** → **Private Apps**
2. Create a new private app (or edit existing)
3. Name it: "Automation System"
4. Grant these scopes:
   - **CRM** → Read & Write
   - **Custom Objects** → Read & Write
   - **Schemas** → Read & Write
5. Copy the **Private App Access Token** (starts with `pat-`)

### Step 3: Update Your API Key

Update `config/api_keys.js`:

```javascript
hubspot: {
  apiKey: 'pat-your-new-token-here', // Private App Access Token
  portalId: '244560986',
  baseUrl: 'https://api.hubapi.com',
  developerOverviewUrl: 'https://app-na2.hubspot.com/developer-overview/244560986'
}
```

### Step 4: Test Connection

```bash
# Test the connection
curl -X GET "https://api.hubapi.com/crm/v3/objects/contacts?limit=1" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Should return 200 OK with contact data.

---

## 🚀 Alternative: Use Contact Properties Only

If custom objects aren't working, you can still sync data using **contact properties**:

```bash
# This will update contact properties (doesn't require custom object permissions)
curl -X POST http://localhost:7101/api/hubspot/sync-all-contacts \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}'
```

---

## 📊 What Works Without Custom Objects

Even without custom objects, you can:
- ✅ Update contact properties with automation data
- ✅ Create timeline events
- ✅ Sync pipeline metrics to contact properties
- ✅ Track email engagement

---

## 🔧 Quick Fix Script

Run this to test your API key:

```bash
node -e "
const axios = require('axios');
const config = require('./config/api_keys');
axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
  headers: {
    'Authorization': 'Bearer ' + config.hubspot.apiKey,
    'Content-Type': 'application/json'
  }
}).then(r => console.log('✅ API Key Valid:', r.status))
  .catch(e => console.error('❌ API Key Invalid:', e.response?.status, e.response?.data));
"
```

---

## ✅ Next Steps

1. **Get valid API key** from HubSpot
2. **Update config/api_keys.js**
3. **Test connection** using script above
4. **Re-run sync**: `node scripts/sync-to-hubspot.js`

---

*Once API key is fixed, the sync will work!* 🔐
