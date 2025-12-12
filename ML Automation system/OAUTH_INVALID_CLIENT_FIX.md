# 🔧 OAuth invalid_client Error Fix

**Error**: `invalid_client` during token exchange  
**Status**: ⚠️ **INVESTIGATING CLIENT CONFIGURATION**

---

## 🔍 Error Analysis

The `invalid_client` error during token exchange typically means:

1. **Client ID mismatch** - The client ID in code doesn't match Google Cloud Console
2. **Client Secret incorrect** - The secret is wrong or doesn't match
3. **OAuth Client Type wrong** - Using wrong client type (Web vs Desktop)
4. **Redirect URI mismatch** - Redirect URI doesn't match exactly

---

## ✅ Verification Steps

### Step 1: Verify Client ID in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Verify the Client ID matches: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
4. Click **Edit** to view details

### Step 2: Verify Client Type

**CRITICAL**: The OAuth client must be **"Web application"** type, NOT "Desktop app" or "Other".

1. In OAuth client settings, check **"Application type"**
2. Must be: **"Web application"**
3. If it's "Desktop app" or "Other", create a new "Web application" client

### Step 3: Verify Client Secret

1. In OAuth client settings, check if **Client secret** is shown
2. If you see "Reset secret" or "Download JSON", the secret exists
3. Verify the secret in `config/api_keys.js` matches

### Step 4: Verify Redirect URI

1. Under **"Authorized redirect URIs"**, verify:
   - `http://localhost:7101/oauth2callback` is listed
   - No trailing slashes
   - Exact match (case-sensitive)

---

## 🔧 Potential Fixes

### Fix 1: Create New Web Application Client

If the client type is wrong:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"** as Application type
4. Name it: `HingeCraft ML Automation Web Client`
5. Under **"Authorized redirect URIs"**, add:
   - `http://localhost:7101/oauth2callback`
6. Click **"CREATE"**
7. **Copy the new Client ID and Client Secret**
8. Update `config/api_keys.js` with new credentials

### Fix 2: Verify Client Secret

1. In Google Cloud Console, click **"Reset secret"** if needed
2. Copy the new secret
3. Update `config/api_keys.js`:
   ```javascript
   clientSecret: 'YOUR_NEW_SECRET_HERE'
   ```
4. Restart Docker: `docker-compose restart automation`

### Fix 3: Check for Client ID Format

The Client ID should be in format:
```
590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com
```

Or just:
```
590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej
```

Both formats should work, but verify consistency.

---

## 🔍 Debug Commands

### Check Current Configuration:
```bash
docker-compose exec automation node -e "const c=require('./config/api_keys'); console.log('ID:', c.google.clientId); console.log('Secret:', c.google.clientSecret ? 'SET' : 'MISSING');"
```

### Check OAuth Status:
```bash
curl http://localhost:7101/auth/status
```

### Test Token Exchange (after getting code):
```bash
# This will show the actual error
docker-compose logs automation | grep -i "invalid_client"
```

---

## ⚠️ Common Issues

### Issue: Client ID has `.apps.googleusercontent.com` suffix

**Solution**: Both formats work:
- `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
- `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com`

### Issue: Client Secret was reset

**Solution**: 
1. Get new secret from Google Cloud Console
2. Update `config/api_keys.js`
3. Restart Docker container

### Issue: Wrong OAuth Client Type

**Solution**: 
- Must be **"Web application"** type
- NOT "Desktop app" or "Other"
- Create new client if needed

---

## ✅ Verification Checklist

After fixing:

- [ ] Client ID matches Google Cloud Console exactly
- [ ] Client Secret is correct and matches
- [ ] OAuth Client Type is "Web application"
- [ ] Redirect URI: `http://localhost:7101/oauth2callback` added
- [ ] `config/api_keys.js` updated with correct credentials
- [ ] Docker container restarted
- [ ] OAuth authorization retried

---

## 🎯 Next Steps

1. **Verify OAuth Client Type** in Google Cloud Console
2. **Check Client Secret** is correct
3. **Update config/api_keys.js** if needed
4. **Restart Docker**: `docker-compose restart automation`
5. **Retry OAuth** authorization

---

**Status**: ⚠️ **INVALID_CLIENT ERROR - CHECK CLIENT TYPE AND SECRET**  
**Action**: Verify OAuth client is "Web application" type and credentials match
