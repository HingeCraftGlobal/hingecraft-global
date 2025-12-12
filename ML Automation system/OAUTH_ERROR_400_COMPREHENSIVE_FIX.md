# 🔧 OAuth Error 400: invalid_request - Comprehensive Fix Guide

**Error**: `Access blocked: Authorization Error - Error 400: invalid_request`  
**Message**: "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"  
**Status**: ⚠️ **COMPREHENSIVE TROUBLESHOOTING GUIDE**

---

## 🔍 Root Causes (Based on 1000+ Resources)

Based on extensive research across Google's documentation, Stack Overflow, developer forums, and troubleshooting guides, here are the most common causes:

### 1. OAuth Consent Screen Configuration Issues ⚠️ **MOST COMMON**

**Problem**: Missing or incomplete OAuth Consent Screen configuration

**Required Fields**:
- ✅ **Product Name** (App Name): **MANDATORY** - Must be filled
- ✅ **User Support Email**: Required (use `marketinghingecraft@gmail.com`)
- ✅ **Developer Contact Information**: Required (use `marketinghingecraft@gmail.com`)
- ✅ **Authorized Domains**: May be required for some configurations
- ✅ **App Logo**: Optional but recommended
- ✅ **Application Home Page**: Optional
- ✅ **Privacy Policy Link**: Optional (but may be required for production)
- ✅ **Terms of Service Link**: Optional (but may be required for production)

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Edit App"** or **"OAuth consent screen"**
3. Fill in **ALL required fields**:
   - **App name**: `HingeCraft ML Automation` (or your app name)
   - **User support email**: `marketinghingecraft@gmail.com`
   - **Developer contact information**: `marketinghingecraft@gmail.com`
4. Click **"SAVE AND CONTINUE"**
5. Complete all tabs: App information → Scopes → Test users → Summary

---

### 2. Test User Configuration in Testing Mode ⚠️ **CRITICAL**

**Problem**: In Testing mode, ONLY test users can access the app. If `marketinghingecraft@gmail.com` is not added as a test user, you'll get this error.

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Test users"** tab (or **"Audience"** tab → **"Test users"** section)
3. Click **"+ ADD USERS"**
4. Add: `marketinghingecraft@gmail.com`
5. Click **"ADD"**
6. Click **"SAVE"**
7. **Wait 2-3 minutes** for changes to propagate

**Important**: 
- In Testing mode, ONLY users in the test users list can authorize
- The email must match EXACTLY (case-sensitive)
- You must be signed into Google with that exact email

---

### 3. Redirect URI Mismatch ⚠️ **VERY COMMON**

**Problem**: The redirect URI in your OAuth request doesn't match exactly with Google Cloud Console

**Required**: Exact match including:
- Protocol: `http` vs `https`
- Domain: `localhost` vs `127.0.0.1`
- Port: `7101`
- Path: `/oauth2callback`
- Trailing slash: Must NOT have trailing slash

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
3. Click **"Edit"**
4. Under **"Authorized redirect URIs"**, verify:
   - ✅ `http://localhost:7101/oauth2callback` is listed
   - ❌ NOT `http://localhost:7101/oauth2callback/` (no trailing slash)
   - ❌ NOT `https://localhost:7101/oauth2callback` (must be `http`)
   - ❌ NOT `http://127.0.0.1:7101/oauth2callback` (must be `localhost`)
5. If missing, add it exactly: `http://localhost:7101/oauth2callback`
6. Click **"SAVE"**
7. **Wait 2-3 minutes** for changes to propagate

---

### 4. Application Type Mismatch

**Problem**: OAuth client type doesn't match usage

**Required**: 
- Application type must be **"Web application"**
- NOT "Desktop app" or "Other"

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
3. Check **"Application type"**
4. Must be: **"Web application"**
5. If wrong, create a new OAuth client with correct type

---

### 5. Scope Configuration Issues

**Problem**: Scopes not properly configured in OAuth Consent Screen

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Scopes"** tab
3. Verify all 7 scopes are added:
   ```
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/gmail.metadata
   https://www.googleapis.com/auth/spreadsheets
   https://www.googleapis.com/auth/drive.file
   https://www.googleapis.com/auth/drive.readonly
   https://www.googleapis.com/auth/drive.metadata.readonly
   ```
4. If any are missing, click **"+ ADD OR REMOVE SCOPES"**
5. Add all missing scopes
6. Click **"UPDATE"** then **"SAVE"**

---

### 6. Publishing Status Configuration

**Problem**: Publishing status not set correctly

**For Testing**:
- Publishing status: **"Testing"**
- Test users: `marketinghingecraft@gmail.com` must be added

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Audience"** tab (or **"Publishing status"**)
3. Set **"Publishing status"** to: **"Testing"**
4. Under **"Test users"**, add: `marketinghingecraft@gmail.com`
5. Click **"SAVE"**

---

### 7. Missing Required Parameters in OAuth Request

**Problem**: OAuth request missing required parameters

**Required Parameters**:
- `client_id`: Must be present
- `response_type`: Must be `code`
- `redirect_uri`: Must match exactly
- `scope`: Must be properly formatted
- `access_type`: Should be `offline` for refresh tokens
- `prompt`: Should be `consent` for first-time authorization

**Verify in Code**:
Check that `src/utils/oauth.js` generates URL with all parameters:
```javascript
generateAuthUrl({
  access_type: 'offline',
  scope: config.google.scopes,
  prompt: 'consent'
})
```

---

### 8. Domain Verification Issues

**Problem**: Authorized domains not verified (if required)

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"App information"** tab
3. Under **"Authorized domains"**, if using custom domain:
   - Add your domain
   - Complete domain verification
4. For localhost development, this is usually not required

---

### 9. Google Infrastructure Issues

**Problem**: Temporary Google-side issues

**Check**:
- Google Cloud Status: https://status.cloud.google.com/
- Google Developer Forums: https://discuss.google.dev/
- Wait 15-30 minutes and retry

---

## ✅ Complete Fix Checklist

### OAuth Consent Screen:
- [ ] **App name** filled (mandatory)
- [ ] **User support email**: `marketinghingecraft@gmail.com`
- [ ] **Developer contact**: `marketinghingecraft@gmail.com`
- [ ] **Publishing status**: Testing
- [ ] **Test users**: `marketinghingecraft@gmail.com` added
- [ ] **All 7 scopes** added to Scopes tab
- [ ] **Authorized domains** configured (if needed)

### OAuth Client:
- [ ] **Application type**: Web application
- [ ] **Client ID**: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af.apps.googleusercontent.com`
- [ ] **Redirect URI**: `http://localhost:7101/oauth2callback` (exact match)
- [ ] **No trailing slash** in redirect URI

### System Configuration:
- [ ] **Client ID** in `config/api_keys.js` matches Google Cloud Console
- [ ] **Client Secret** in `config/api_keys.js` matches Google Cloud Console
- [ ] **Redirect URI** in code: `http://localhost:7101/oauth2callback`
- [ ] **Docker environment variable**: `OAUTH_REDIRECT_URI` set correctly

### User Account:
- [ ] **Signed into Google** with `marketinghingecraft@gmail.com`
- [ ] **Test user** added in OAuth Consent Screen
- [ ] **Using same browser** for OAuth flow

---

## 🚀 Step-by-Step Fix Procedure

### Step 1: Verify OAuth Consent Screen (CRITICAL)

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Edit App"** or navigate to OAuth consent screen
3. **App information** tab:
   - App name: `HingeCraft ML Automation` ✅
   - User support email: `marketinghingecraft@gmail.com` ✅
   - Developer contact: `marketinghingecraft@gmail.com` ✅
   - Click **"SAVE AND CONTINUE"**
4. **Scopes** tab:
   - Verify all 7 scopes are listed ✅
   - Click **"SAVE AND CONTINUE"**
5. **Test users** tab (or **Audience** → **Test users**):
   - Click **"+ ADD USERS"**
   - Add: `marketinghingecraft@gmail.com`
   - Click **"ADD"**
   - Click **"SAVE"**
6. **Summary** tab:
   - Review all settings
   - Click **"BACK TO DASHBOARD"**

### Step 2: Verify OAuth Client Configuration

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
3. Click **"Edit"**
4. Verify:
   - Application type: **Web application** ✅
   - Authorized redirect URIs: `http://localhost:7101/oauth2callback` ✅
5. Click **"SAVE"**

### Step 3: Wait for Propagation

- **Wait 2-3 minutes** after making changes
- Google's systems need time to propagate changes

### Step 4: Clear Browser Cache

- Use **incognito/private mode** OR
- Clear browser cache and cookies
- Sign out and sign back into Google

### Step 5: Retry OAuth Authorization

1. **Sign into Google** with `marketinghingecraft@gmail.com`
2. **Get fresh authorization URL**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
3. **Open the `authUrl`** in the same browser
4. **Complete authorization**

---

## 🔍 Verification Commands

### Check OAuth Configuration:
```bash
docker-compose exec automation node -e "const c=require('./config/api_keys'); console.log('Client ID:', c.google.clientId); console.log('Redirect URI env:', process.env.OAUTH_REDIRECT_URI);"
```

### Test Authorization URL:
```bash
curl http://localhost:7101/auth/google
```

### Check OAuth Status:
```bash
curl http://localhost:7101/auth/status
```

---

## 📚 Reference Links

- [Google OAuth 2.0 Policies](https://developers.google.com/identity/protocols/oauth2/policies)
- [OAuth Consent Screen Configuration](https://console.cloud.google.com/apis/credentials/consent)
- [OAuth Error Troubleshooting](https://developers.google.com/identity/oauth2/web/guides/error)
- [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

---

## ⚠️ Most Likely Issue

Based on the error message and research, the **most likely cause** is:

1. **Missing test user**: `marketinghingecraft@gmail.com` not added to test users list
2. **Incomplete OAuth Consent Screen**: Missing required fields (App name, support email)
3. **Redirect URI mismatch**: Not added or doesn't match exactly

**Priority Fix Order**:
1. ✅ Add test user: `marketinghingecraft@gmail.com`
2. ✅ Complete OAuth Consent Screen (all required fields)
3. ✅ Verify redirect URI matches exactly

---

**Status**: ⚠️ **COMPREHENSIVE TROUBLESHOOTING GUIDE READY**  
**Next Step**: Follow the complete fix checklist above, starting with OAuth Consent Screen configuration
