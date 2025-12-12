# 🔍 OAuth invalid_client Error - Deep Dive

**Error**: `invalid_client` during token exchange  
**Status**: ✅ Client Secret Confirmed Correct  
**Next**: Investigating other causes

---

## ✅ Confirmed

- ✅ OAuth client type: **Web application**
- ✅ Client secret: **Correct** (confirmed by user)
- ✅ Redirect URI in code: `http://localhost:7101/oauth2callback`
- ✅ Environment variable: `OAUTH_REDIRECT_URI` set correctly

---

## 🔍 Remaining Potential Causes

### 1. Redirect URI Mismatch in Google Cloud Console

**Check**: The redirect URI in Google Cloud Console must match **exactly** (case-sensitive, no trailing slashes).

**Verify**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
3. Click **"Edit"**
4. Under **"Authorized redirect URIs"**, verify:
   - `http://localhost:7101/oauth2callback` is listed
   - **No trailing slash**: NOT `http://localhost:7101/oauth2callback/`
   - **Exact match**: Case-sensitive

### 2. Client ID Format Issue

**Current**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com`

**Test**: Try without the `.apps.googleusercontent.com` suffix:
- `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`

**Action**: Update `config/api_keys.js`:
```javascript
clientId: '590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej', // Without suffix
```

### 3. Authorization Code Expired or Invalid

**Issue**: Authorization codes expire quickly (usually within 10 minutes).

**Check**: 
- How long between getting the code and token exchange?
- Was the code copied correctly (no truncation)?

**Solution**: Get a fresh authorization code immediately before token exchange.

### 4. Redirect URI Mismatch During Token Exchange

**Issue**: The redirect URI used during token exchange must match the one used in the authorization URL.

**Check**: The OAuth2Client must use the **same** redirect URI for both:
- Authorization URL generation
- Token exchange

**Current Code**: Uses `process.env.OAUTH_REDIRECT_URI` for both, which is correct.

### 5. OAuth Client Deleted/Recreated

**Issue**: If the OAuth client was deleted and recreated, the client ID might be different.

**Verify**: 
- Check Google Cloud Console
- Ensure client ID matches: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`

---

## 🧪 Diagnostic Steps

### Step 1: Verify Redirect URI in Google Cloud Console

```bash
# Check what redirect URI is configured
echo "Go to: https://console.cloud.google.com/apis/credentials"
echo "Find client: 590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej"
echo "Verify redirect URI: http://localhost:7101/oauth2callback"
```

### Step 2: Test Client ID Format

Try updating `config/api_keys.js` to use client ID without suffix:

```javascript
clientId: '590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej', // Remove .apps.googleusercontent.com
```

Then restart:
```bash
docker-compose restart automation
```

### Step 3: Get Fresh Authorization Code

1. Clear browser cache or use incognito
2. Get fresh authUrl:
   ```bash
   curl http://localhost:7101/auth/google
   ```
3. **Immediately** open the URL in browser
4. **Immediately** authorize
5. **Immediately** let it redirect (don't copy/paste the code manually)

### Step 4: Check Token Exchange Request

The token exchange should include:
- `client_id`: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
- `client_secret`: (your secret)
- `code`: (authorization code)
- `redirect_uri`: `http://localhost:7101/oauth2callback`
- `grant_type`: `authorization_code`

---

## 🔧 Quick Fixes to Try

### Fix 1: Remove Client ID Suffix

```javascript
// config/api_keys.js
clientId: '590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej', // Without .apps suffix
```

### Fix 2: Verify Redirect URI Exact Match

In Google Cloud Console:
- Must be: `http://localhost:7101/oauth2callback`
- NOT: `http://localhost:7101/oauth2callback/`
- NOT: `https://localhost:7101/oauth2callback`

### Fix 3: Create New OAuth Client (Last Resort)

If nothing works:
1. Create a new "Web application" OAuth client
2. Add redirect URI: `http://localhost:7101/oauth2callback`
3. Copy new Client ID and Secret
4. Update `config/api_keys.js`
5. Restart Docker

---

## 📊 Current Configuration

- **Client ID**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com`
- **Client Secret**: ✅ Correct (confirmed)
- **Redirect URI**: `http://localhost:7101/oauth2callback`
- **Client Type**: Web application ✅

---

## 🎯 Recommended Next Steps

1. **Verify redirect URI** in Google Cloud Console matches exactly
2. **Try client ID without suffix** (remove `.apps.googleusercontent.com`)
3. **Get fresh authorization code** immediately before token exchange
4. **Check logs** for exact error details during token exchange

---

**Status**: 🔍 **INVESTIGATING - CLIENT SECRET CONFIRMED CORRECT**  
**Action**: Verify redirect URI match and try client ID format fix

