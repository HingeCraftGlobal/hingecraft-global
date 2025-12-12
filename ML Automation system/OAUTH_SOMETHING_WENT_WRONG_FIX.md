# 🔧 OAuth "Something went wrong" Error Fix

**Error**: "Something went wrong. Sorry, something went wrong there. Try again."  
**Status**: ⚠️ **GOOGLE-SIDE ERROR - CHECK CONFIGURATION**

---

## 🔍 Problem

This error appears on Google's authorization page, indicating a configuration issue in Google Cloud Console.

---

## ✅ Most Common Causes & Fixes

### 1. Redirect URI Mismatch (Most Likely)

**Issue**: The redirect URI in Google Cloud Console doesn't match exactly.

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
3. Click **"Edit"**
4. Under **"Authorized redirect URIs"**, verify:
   - ✅ `http://localhost:7101/oauth2callback` is listed
   - ❌ NOT `http://localhost:7101/oauth2callback/` (no trailing slash)
   - ❌ NOT `https://localhost:7101/oauth2callback` (must be `http`)
   - ❌ NOT `http://127.0.0.1:7101/oauth2callback` (must be `localhost`)
5. If missing or incorrect, add the exact URI: `http://localhost:7101/oauth2callback`
6. Click **"SAVE"**
7. Wait 2-3 minutes for changes to propagate

### 2. OAuth Consent Screen Configuration

**Issue**: Missing required fields in OAuth Consent Screen.

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Check **"App information"** tab:
   - ✅ App name is set
   - ✅ User support email: `marketinghingecraft@gmail.com`
   - ✅ Developer contact: your email
3. Check **"Scopes"** tab:
   - ✅ All 7 scopes are listed
4. Check **"Test users"** tab:
   - ✅ `marketinghingecraft@gmail.com` is added
   - ✅ `aiguardian01@gmail.com` is added
5. Click **"SAVE"** after any changes

### 3. Client ID Format Issue

**Current**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej` (without suffix)

**Test**: Try with the `.apps.googleusercontent.com` suffix in Google Cloud Console.

**Verify**:
1. In Google Cloud Console, check the Client ID format
2. It should match what's in `config/api_keys.js`
3. Both formats should work, but verify consistency

### 4. OAuth Client Type

**Verify**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
3. Check **"Application type"**:
   - Must be: **"Web application"**
   - NOT "Desktop app" or "Other"

### 5. API Not Enabled

**Verify**:
1. Go to: https://console.cloud.google.com/apis/library
2. Ensure these APIs are **enabled**:
   - ✅ Gmail API
   - ✅ Google Sheets API
   - ✅ Google Drive API
   - ✅ People API
   - ✅ Cloud Resource Manager API

---

## 🧪 Step-by-Step Verification

### Step 1: Verify Redirect URI (CRITICAL)

```bash
# Check what redirect URI is configured in code
docker-compose exec automation node -e "console.log('Redirect URI:', process.env.OAUTH_REDIRECT_URI);"
```

**Should output**: `http://localhost:7101/oauth2callback`

**Then verify in Google Cloud Console**:
- Must match exactly: `http://localhost:7101/oauth2callback`

### Step 2: Clear Browser Cache

1. Use **incognito/private mode** OR
2. Clear browser cache and cookies
3. Try authorization again

### Step 3: Get Fresh Authorization URL

```bash
curl http://localhost:7101/auth/google
```

Copy the entire `authUrl` and open in **incognito mode**.

### Step 4: Check URL Parameters

The authUrl should contain:
- `client_id=590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
- `redirect_uri=http%3A%2F%2Flocalhost%3A7101%2Foauth2callback` (URL encoded)
- `response_type=code`
- All 7 scopes

---

## 🔧 Quick Fix Checklist

- [ ] Redirect URI in Google Cloud Console: `http://localhost:7101/oauth2callback` (exact match)
- [ ] OAuth Consent Screen: App name, support email, developer contact set
- [ ] OAuth Consent Screen: All 7 scopes listed
- [ ] OAuth Consent Screen: Test users added (`marketinghingecraft@gmail.com`, `aiguardian01@gmail.com`)
- [ ] OAuth Client Type: "Web application"
- [ ] All required APIs enabled
- [ ] Browser cache cleared or using incognito mode
- [ ] Fresh authorization URL obtained

---

## 🎯 Recommended Actions

1. **Verify redirect URI** in Google Cloud Console matches exactly
2. **Clear browser cache** or use incognito mode
3. **Get fresh authUrl** and try again
4. **Check OAuth Consent Screen** configuration

---

## 📊 Current Configuration

- **Client ID**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej` ✅
- **Client Secret**: Set ✅
- **Redirect URI**: `http://localhost:7101/oauth2callback` ✅
- **Client Type**: Web application ✅

---

**Status**: ⚠️ **VERIFY REDIRECT URI IN GOOGLE CLOUD CONSOLE**  
**Action**: Check redirect URI matches exactly and retry authorization
