# 🔐 Client Secret Verification Guide

**Error**: `invalid_client` during token exchange  
**Status**: ⚠️ **CLIENT SECRET MISMATCH LIKELY**

---

## 🔍 Problem

The `invalid_client` error means Google rejected the client ID/secret combination during token exchange. Since:
- ✅ OAuth client type is "Web application" (confirmed)
- ✅ Client ID matches: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
- ❌ **Client Secret likely doesn't match**

---

## ✅ Solution: Verify & Update Client Secret

### Step 1: Check Client Secret in Google Cloud Console

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Find your OAuth 2.0 Client ID: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
3. Click **"Edit"** (pencil icon)
4. Scroll to **"Client secret"** section
5. Check if you see:
   - **"Reset secret"** button → Secret may have been reset
   - **Secret shown** → Copy this value
   - **"Download JSON"** → Download and check the secret

### Step 2: Compare with Code

Current secret in code: `4B9IiBGxsKK8zkBXtzqMREO2hXNe` (28 characters)

**Does it match what's in Google Cloud Console?**

- ✅ **If YES**: The issue is elsewhere (see "Other Checks" below)
- ❌ **If NO**: Continue to Step 3

### Step 3: Update Client Secret

**Option A: Reset Secret in Google Cloud Console (Recommended)**

1. In Google Cloud Console, click **"Reset secret"**
2. **Copy the new secret immediately** (you can only see it once!)
3. Update `config/api_keys.js`:
   ```javascript
   clientSecret: 'YOUR_NEW_SECRET_HERE'
   ```
4. Restart Docker:
   ```bash
   docker-compose restart automation
   ```

**Option B: Use Existing Secret from Google Cloud Console**

1. Copy the secret from Google Cloud Console
2. Update `config/api_keys.js`:
   ```javascript
   clientSecret: 'SECRET_FROM_GOOGLE_CLOUD_CONSOLE'
   ```
3. Restart Docker:
   ```bash
   docker-compose restart automation
   ```

---

## 🔍 Other Checks

If the client secret matches, verify:

### 1. Redirect URI Exact Match

In Google Cloud Console OAuth client settings:
- **Authorized redirect URIs** must include:
  - `http://localhost:7101/oauth2callback`
- **No trailing slashes**
- **Exact match** (case-sensitive)

### 2. Client ID Format

The code uses: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com`

Both formats should work:
- With suffix: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com`
- Without suffix: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`

But verify the client ID in Google Cloud Console matches.

### 3. OAuth Consent Screen

Verify:
- ✅ Publishing status: **Testing**
- ✅ Test users added: `marketinghingecraft@gmail.com`
- ✅ All 7 scopes listed

---

## 🧪 Verification Script

Run the verification script:

```bash
docker-compose exec automation node scripts/verify-client-secret.js
```

This will show:
- Current client ID
- Client secret status (set/missing)
- Verification steps

---

## 📝 Quick Fix Checklist

- [ ] Go to Google Cloud Console → Credentials
- [ ] Find OAuth client: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
- [ ] Click "Edit"
- [ ] Check "Client secret"
- [ ] Compare with `config/api_keys.js`
- [ ] If different, update `config/api_keys.js`
- [ ] Restart Docker: `docker-compose restart automation`
- [ ] Retry OAuth authorization

---

## 🎯 Expected Result

After fixing the client secret:
1. Get fresh authUrl: `curl http://localhost:7101/auth/google`
2. Open the `authUrl` in browser
3. Sign in with test user
4. Click "Allow"
5. Should redirect to: `http://localhost:7101/oauth2callback?code=...`
6. Token exchange should succeed ✅

---

**Status**: ⚠️ **VERIFY CLIENT SECRET MATCHES GOOGLE CLOUD CONSOLE**  
**Action**: Check client secret in Google Cloud Console and update code if needed


