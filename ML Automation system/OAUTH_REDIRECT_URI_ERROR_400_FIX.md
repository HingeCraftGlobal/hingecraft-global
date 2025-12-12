# 🔧 OAuth Error 400: invalid_request - Redirect URI Fix

**Error**: `Error 400: invalid_request`  
**Request details**: `redirect_uri=http://localhost:7101/oauth2callback`  
**Flow**: `GeneralOAuthFlow`  
**Status**: ⚠️ **REDIRECT URI CONFIGURATION ISSUE**

---

## 🔍 Problem Analysis

The error indicates that Google is rejecting the redirect URI `http://localhost:7101/oauth2callback`. This typically means:

1. **Redirect URI not added** to OAuth client in Google Cloud Console
2. **Redirect URI mismatch** - doesn't match exactly
3. **OAuth client type** doesn't allow localhost redirects
4. **Redirect URI format** issues (trailing slash, protocol, etc.)

---

## ✅ Step-by-Step Fix

### Step 1: Verify Redirect URI in Google Cloud Console

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Sign in** with `marketinghingecraft@gmail.com`
3. **Select your project**
4. **Find OAuth 2.0 Client ID**: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
5. **Click "Edit"** (pencil icon)
6. **Scroll to "Authorized redirect URIs"** section
7. **Check if this URI is listed**:
   ```
   http://localhost:7101/oauth2callback
   ```

### Step 2: Add Redirect URI (If Missing)

If the redirect URI is **NOT** in the list:

1. **Click "+ ADD URI"** (or the add button)
2. **Enter exactly**:
   ```
   http://localhost:7101/oauth2callback
   ```
3. **Important**: 
   - ✅ Must be `http` (not `https`)
   - ✅ Must be `localhost` (not `127.0.0.1`)
   - ✅ Must be port `7101`
   - ✅ Must be path `/oauth2callback`
   - ❌ NO trailing slash (not `/oauth2callback/`)
4. **Click "SAVE"**
5. **Wait 2-3 minutes** for changes to propagate

### Step 3: Verify OAuth Client Type

1. **In the same OAuth client settings**, check **"Application type"**
2. **Must be**: **"Web application"**
3. **NOT**: "Desktop app" or "Other"
4. If wrong type:
   - Create a new OAuth client
   - Application type: **"Web application"**
   - Add redirect URI: `http://localhost:7101/oauth2callback`
   - Update `config/api_keys.js` with new Client ID and Secret

### Step 4: Verify Exact Match

The redirect URI must match **EXACTLY** (case-sensitive, character-for-character):

**Correct**:
```
http://localhost:7101/oauth2callback
```

**Incorrect** (will cause error):
```
http://localhost:7101/oauth2callback/    (trailing slash)
https://localhost:7101/oauth2callback     (https instead of http)
http://127.0.0.1:7101/oauth2callback      (127.0.0.1 instead of localhost)
http://localhost:3001/oauth2callback      (wrong port)
http://LOCALHOST:7101/oauth2callback      (uppercase)
```

---

## 🔧 System Configuration Check

### Verify Code Configuration:

```bash
docker-compose exec automation node -e "console.log('Redirect URI env:', process.env.OAUTH_REDIRECT_URI);"
```

**Should output**: `http://localhost:7101/oauth2callback`

### Verify OAuth URL Generation:

```bash
curl http://localhost:7101/auth/google
```

**Check the `authUrl`** - the `redirect_uri` parameter should be:
```
redirect_uri=http%3A%2F%2Flocalhost%3A7101%2Foauth2callback
```

(URL encoded version of `http://localhost:7101/oauth2callback`)

---

## 🚨 Common Issues and Fixes

### Issue 1: Redirect URI Not Added

**Symptom**: Error 400: invalid_request with redirect_uri in request details

**Fix**: 
1. Add redirect URI to Google Cloud Console
2. Wait 2-3 minutes
3. Retry authorization

### Issue 2: Trailing Slash

**Symptom**: Redirect URI has trailing slash in Google Cloud Console

**Fix**:
1. Remove trailing slash from Google Cloud Console
2. Ensure it's exactly: `http://localhost:7101/oauth2callback`
3. Save and retry

### Issue 3: Wrong Protocol (https vs http)

**Symptom**: Using `https://localhost` instead of `http://localhost`

**Fix**:
1. Localhost must use `http` (not `https`)
2. Update in Google Cloud Console to `http://localhost:7101/oauth2callback`

### Issue 4: Wrong Domain (127.0.0.1 vs localhost)

**Symptom**: Using `127.0.0.1` instead of `localhost`

**Fix**:
1. Must use `localhost` (not `127.0.0.1`)
2. Update in Google Cloud Console to use `localhost`

### Issue 5: Wrong Port

**Symptom**: Using different port (e.g., 3001 instead of 7101)

**Fix**:
1. Verify Docker port mapping: `7101:3001`
2. External port is `7101`
3. Redirect URI must use external port: `7101`

### Issue 6: OAuth Client Type Wrong

**Symptom**: Using "Desktop app" type which may restrict localhost

**Fix**:
1. Must be "Web application" type
2. Create new client if needed
3. Update credentials in code

---

## ✅ Complete Verification Checklist

### Google Cloud Console:
- [ ] OAuth client: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
- [ ] Application type: **Web application**
- [ ] Redirect URI added: `http://localhost:7101/oauth2callback`
- [ ] No trailing slash
- [ ] Using `http` (not `https`)
- [ ] Using `localhost` (not `127.0.0.1`)
- [ ] Port is `7101`
- [ ] Changes saved
- [ ] Waited 2-3 minutes after saving

### System Configuration:
- [ ] `docker-compose.yml` has `OAUTH_REDIRECT_URI=http://localhost:7101/oauth2callback`
- [ ] Docker container restarted after changes
- [ ] `config/api_keys.js` has correct Client ID
- [ ] `config/api_keys.js` has correct Client Secret

### OAuth URL:
- [ ] Authorization URL contains correct redirect_uri
- [ ] Redirect URI is URL encoded in authUrl
- [ ] Client ID matches Google Cloud Console

---

## 🧪 Testing Steps

### 1. Verify Redirect URI in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client
3. Check "Authorized redirect URIs"
4. Verify: `http://localhost:7101/oauth2callback` is listed

### 2. Test Authorization URL:

```bash
curl http://localhost:7101/auth/google
```

**Expected response**:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=http%3A%2F%2Flocalhost%3A7101%2Foauth2callback&...",
  "message": "Visit the authUrl to authorize Google Drive and Gmail access"
}
```

### 3. Decode and Verify Redirect URI:

The `redirect_uri` in the URL should decode to:
```
http://localhost:7101/oauth2callback
```

### 4. Try Authorization:

1. Open the `authUrl` in browser
2. Should NOT get Error 400: invalid_request
3. Should see OAuth consent screen

---

## 🔄 If Still Getting Error

### Option 1: Create New OAuth Client

If the current client has issues:

1. **Create new OAuth client**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `HingeCraft ML Automation`
   - Authorized redirect URIs: `http://localhost:7101/oauth2callback`
   - Click "CREATE"
2. **Copy new Client ID and Secret**
3. **Update `config/api_keys.js`**:
   ```javascript
   google: {
     clientId: 'NEW_CLIENT_ID',
     clientSecret: 'NEW_CLIENT_SECRET',
   }
   ```
4. **Restart Docker**: `docker-compose restart automation`
5. **Retry authorization**

### Option 2: Check OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Verify:
   - App name is set
   - Test user: `marketinghingecraft@gmail.com` is added
   - Publishing status: Testing
3. Save all changes

---

## 📊 Current Configuration

**Expected Redirect URI**: `http://localhost:7101/oauth2callback`

**Where Configured**:
- ✅ `docker-compose.yml`: `OAUTH_REDIRECT_URI=http://localhost:7101/oauth2callback`
- ✅ `src/utils/oauth.js`: Uses environment variable
- ⚠️ **Google Cloud Console**: Must be added manually

---

## 🎯 Quick Fix Summary

**Most Likely Issue**: Redirect URI not added to Google Cloud Console

**Quick Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
3. Click "Edit"
4. Add redirect URI: `http://localhost:7101/oauth2callback`
5. Click "SAVE"
6. Wait 2-3 minutes
7. Retry authorization

---

**Status**: ⚠️ **REDIRECT URI MUST BE ADDED TO GOOGLE CLOUD CONSOLE**  
**Action**: Add `http://localhost:7101/oauth2callback` to OAuth client's authorized redirect URIs
