# 🔧 OAuth 2.0 Policy Compliance - Complete Fix Guide

**Error**: `Error 400: invalid_request - App doesn't comply with Google's OAuth 2.0 policy`  
**Status**: ⚠️ **POLICY COMPLIANCE ISSUES IDENTIFIED**

---

## 🔍 Policy Compliance Analysis

Based on Google's OAuth 2.0 Policies (October 27, 2025), the following requirements must be met:

### Critical Requirements for Web Applications:

1. **Use secure JavaScript origins and redirect URIs**
   - **Issue**: Policy states "OAuth 2.0 clients for web apps must use redirect URIs and JavaScript origins that are compliant with Google's validation rules, including using the HTTPS scheme"
   - **Current**: Using `http://localhost:7101/oauth2callback`
   - **Status**: ⚠️ **LOCALHOST ALLOWED FOR TESTING, BUT MUST BE IN TESTING MODE**

2. **Only use domains you own**
   - **Current**: Using `localhost` (allowed for development/testing)
   - **Status**: ✅ OK for testing

3. **Accurately represent your identity**
   - **Requirement**: Valid app name, support email, developer contact
   - **Status**: ⚠️ **MUST BE COMPLETE**

4. **Only request scopes that you need**
   - **Requirement**: Scopes in Consent Screen must match app requests
   - **Status**: ⚠️ **MUST VERIFY MATCH**

5. **OAuth Consent Screen Configuration**
   - **Requirement**: Complete all required fields
   - **Status**: ⚠️ **MUST BE FULLY CONFIGURED**

---

## ✅ Required Fixes

### Fix 1: Verify OAuth Consent Screen is Complete

**Location**: https://console.cloud.google.com/apis/credentials/consent

#### App Information Tab (REQUIRED):
- ✅ **App name**: `HingeCraft ML Automation` (MANDATORY)
- ✅ **User support email**: `marketinghingecraft@gmail.com` (REQUIRED)
- ✅ **App logo**: Optional but recommended
- ✅ **Application home page**: Optional (but may be required for production)
- ✅ **Application privacy policy link**: Optional (but recommended)
- ✅ **Application terms of service link**: Optional (but recommended)
- ✅ **Authorized domains**: Optional for localhost testing
- ✅ **Developer contact information**: `marketinghingecraft@gmail.com` (REQUIRED)

**Action**: 
1. Go to OAuth Consent Screen
2. Click "Edit App"
3. Fill in **ALL** required fields
4. Click "SAVE AND CONTINUE"

#### Scopes Tab:
- ✅ **All 7 scopes must be listed**:
  ```
  https://www.googleapis.com/auth/gmail.send
  https://www.googleapis.com/auth/gmail.modify
  https://www.googleapis.com/auth/gmail.metadata
  https://www.googleapis.com/auth/spreadsheets
  https://www.googleapis.com/auth/drive.file
  https://www.googleapis.com/auth/drive.readonly
  https://www.googleapis.com/auth/drive.metadata.readonly
  ```
- ✅ **Scopes must match** what's requested in code

**Action**:
1. Go to "Scopes" tab
2. Verify all 7 scopes are listed
3. If missing, add them
4. Click "SAVE AND CONTINUE"

#### Test Users Tab:
- ✅ **Publishing status**: Must be **"Testing"**
- ✅ **Test users**: `marketinghingecraft@gmail.com` must be added

**Action**:
1. Go to "Test users" tab (or "Audience" → "Test users")
2. Verify publishing status is "Testing"
3. Add `marketinghingecraft@gmail.com` if not listed
4. Click "SAVE"

---

### Fix 2: Verify OAuth Client Configuration

**Location**: https://console.cloud.google.com/apis/credentials

**Requirements**:
- ✅ **Application type**: Must be **"Web application"**
- ✅ **Authorized redirect URIs**: `http://localhost:7101/oauth2callback`
- ✅ **Authorized JavaScript origins**: (Optional, but may help)
  - Can add: `http://localhost:7101`

**Action**:
1. Find OAuth client: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
2. Click "Edit"
3. Verify application type is "Web application"
4. Under "Authorized redirect URIs", ensure:
   - `http://localhost:7101/oauth2callback` is listed
   - No trailing slash
5. Under "Authorized JavaScript origins" (optional):
   - Add: `http://localhost:7101`
6. Click "SAVE"

---

### Fix 3: Verify Project Configuration

**Location**: https://console.cloud.google.com

**Requirements**:
- ✅ **Project contacts**: Must be up-to-date
- ✅ **Project owners/editors**: Must be valid email addresses
- ✅ **Project associated with organization**: Recommended (but not required)

**Action**:
1. Go to: https://console.cloud.google.com
2. Select your project
3. Go to "IAM & Admin" → "Settings"
4. Verify project contacts are current
5. Ensure `marketinghingecraft@gmail.com` has appropriate permissions

---

### Fix 4: Verify App is in Testing Mode

**Critical**: For localhost redirect URIs to work, the app **MUST** be in Testing mode.

**Location**: https://console.cloud.google.com/apis/credentials/consent

**Action**:
1. Go to OAuth Consent Screen
2. Click "Audience" tab (or check publishing status)
3. Verify **"Publishing status"** is set to **"Testing"**
4. If it's "In production", change it to "Testing"
5. Add test user: `marketinghingecraft@gmail.com`
6. Click "SAVE"

**Important**: 
- In Testing mode, only test users can authorize
- Localhost redirect URIs are allowed in Testing mode
- Production mode requires HTTPS and verified domains

---

### Fix 5: Verify Scope Configuration Matches

**Requirement**: Scopes in OAuth Consent Screen must **exactly match** scopes requested in code.

**Current Scopes in Code** (`config/api_keys.js`):
```javascript
scopes: [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
]
```

**Action**:
1. Go to OAuth Consent Screen → "Scopes" tab
2. Verify all 7 scopes listed above are present
3. Ensure no additional scopes are listed that aren't in code
4. Ensure no scopes in code are missing from Consent Screen
5. Click "SAVE"

---

## 🔒 Security Requirements Compliance

### Token Storage (Already Compliant):
- ✅ Tokens stored in `tokens.json` file
- ✅ File is in `.gitignore` (not committed)
- ⚠️ **Recommendation**: Encrypt tokens at rest (future enhancement)

### Client Credentials (Already Compliant):
- ✅ `config/api_keys.js` is in `.gitignore`
- ✅ Credentials not committed to repository
- ⚠️ **Recommendation**: Use environment variables or secret manager in production

---

## ✅ Complete Compliance Checklist

### OAuth Consent Screen:
- [ ] **App name**: `HingeCraft ML Automation` (filled)
- [ ] **User support email**: `marketinghingecraft@gmail.com` (filled)
- [ ] **Developer contact**: `marketinghingecraft@gmail.com` (filled)
- [ ] **Publishing status**: **Testing** (not Production)
- [ ] **Test users**: `marketinghingecraft@gmail.com` (added)
- [ ] **All 7 scopes**: Listed and match code
- [ ] **App logo**: (optional but recommended)
- [ ] **Privacy policy**: (optional for testing, required for production)
- [ ] **Terms of service**: (optional for testing, required for production)

### OAuth Client:
- [ ] **Application type**: **Web application**
- [ ] **Redirect URI**: `http://localhost:7101/oauth2callback` (added)
- [ ] **JavaScript origins**: `http://localhost:7101` (optional but recommended)
- [ ] **Client ID**: Matches code
- [ ] **Client Secret**: Matches code

### Project Configuration:
- [ ] **Project contacts**: Up-to-date
- [ ] **Project owners**: Valid email addresses
- [ ] **Project associated with organization**: (recommended)

### System Configuration:
- [ ] **Scopes in code**: Match Consent Screen exactly
- [ ] **Redirect URI in code**: Matches Google Cloud Console
- [ ] **Client ID/Secret**: Match Google Cloud Console

---

## 🚀 Step-by-Step Fix Procedure

### Step 1: Complete OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Edit App"** or navigate to OAuth consent screen
3. **App information** tab:
   - App name: `HingeCraft ML Automation` ✅
   - User support email: `marketinghingecraft@gmail.com` ✅
   - Developer contact: `marketinghingecraft@gmail.com` ✅
   - Fill in any other optional fields
   - Click **"SAVE AND CONTINUE"**
4. **Scopes** tab:
   - Verify all 7 scopes are listed
   - Click **"SAVE AND CONTINUE"**
5. **Test users** tab:
   - Publishing status: **Testing** ✅
   - Test users: `marketinghingecraft@gmail.com` ✅
   - Click **"SAVE"**
6. **Summary** tab:
   - Review all settings
   - Click **"BACK TO DASHBOARD"**

### Step 2: Verify OAuth Client

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af`
3. Click **"Edit"**
4. Verify:
   - Application type: **Web application** ✅
   - Authorized redirect URIs: `http://localhost:7101/oauth2callback` ✅
5. Optionally add JavaScript origins: `http://localhost:7101`
6. Click **"SAVE"**

### Step 3: Wait for Propagation

- **Wait 2-5 minutes** after making changes
- Google's systems need time to propagate changes

### Step 4: Clear Browser Cache

- Use **incognito/private mode** OR
- Clear browser cache and cookies
- Sign out and sign back into Google

### Step 5: Retry OAuth Authorization

1. **Sign into Google** with `marketinghingecraft@gmail.com`
2. **Get authorization URL**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
3. **Open the `authUrl`** in browser
4. **Should see OAuth consent screen** (not policy error)
5. **Complete authorization**

---

## ⚠️ Important Notes

### Localhost and HTTPS:

According to Google's policy:
- **Testing mode**: `http://localhost` is allowed
- **Production mode**: Must use `https://` with verified domain
- **Current status**: App is in Testing mode ✅

### Production Requirements (Future):

If moving to production:
1. Must use HTTPS redirect URI
2. Must have verified domain
3. Must have privacy policy and terms of service
4. Must submit for verification if using sensitive/restricted scopes
5. Must have publicly accessible homepage

### Current Status:

- ✅ App is in Testing mode (allows localhost)
- ⚠️ Must ensure OAuth Consent Screen is fully configured
- ⚠️ Must ensure all required fields are filled

---

## 🔍 Verification Commands

### Check OAuth Configuration:
```bash
docker-compose exec automation node -e "const c=require('./config/api_keys'); console.log('Client ID:', c.google.clientId); console.log('Scopes count:', c.google.scopes.length);"
```

### Test Authorization URL:
```bash
curl http://localhost:7101/auth/google
```

### Verify Redirect URI:
```bash
curl -s http://localhost:7101/auth/google | python3 -c "import sys, json, urllib.parse; data=json.load(sys.stdin); url=data['authUrl']; params=urllib.parse.parse_qs(urllib.parse.urlparse(url).query); print('Redirect URI:', params.get('redirect_uri', ['MISSING'])[0])"
```

---

## 📚 Policy References

- [Google OAuth 2.0 Policies](https://developers.google.com/identity/protocols/oauth2/policies)
- [OAuth Consent Screen Configuration](https://console.cloud.google.com/apis/credentials/consent)
- [Google APIs Terms of Service](https://developers.google.com/terms)
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)

---

## 🎯 Most Likely Issue

Based on the policy error, the **most likely causes** are:

1. **OAuth Consent Screen incomplete** - Missing required fields (App name, support email, developer contact)
2. **Publishing status wrong** - Not set to "Testing" mode
3. **Test user not added** - `marketinghingecraft@gmail.com` not in test users list
4. **Scopes mismatch** - Scopes in Consent Screen don't match code

**Priority Fix Order**:
1. ✅ Complete OAuth Consent Screen (all required fields)
2. ✅ Set publishing status to "Testing"
3. ✅ Add test user: `marketinghingecraft@gmail.com`
4. ✅ Verify all 7 scopes are listed

---

**Status**: ⚠️ **POLICY COMPLIANCE FIX REQUIRED**  
**Action**: Complete OAuth Consent Screen configuration and verify Testing mode
