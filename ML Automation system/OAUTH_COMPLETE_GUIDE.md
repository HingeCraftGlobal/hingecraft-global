# 🔐 Complete OAuth Authorization Guide

**Current Status**: ⚠️ **OAuth Authorization Required**

---

## ✅ System Configuration Verified

- ✅ **Redirect URI**: `http://localhost:7101/oauth2callback` (Correct)
- ✅ **Client ID**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej` (Configured)
- ✅ **All 7 Scopes**: Present in auth URL
- ✅ **Google Cloud Console**: Redirect URI added

---

## 🎯 Step-by-Step OAuth Authorization

### Step 1: Get Authorization URL

```bash
curl http://localhost:7101/auth/google
```

**Response will contain**:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "message": "Visit the authUrl to authorize..."
}
```

### Step 2: Copy the ENTIRE authUrl

**IMPORTANT**: Copy the **ENTIRE** `authUrl` from the JSON response. It's a very long URL starting with `https://accounts.google.com/o/oauth2/v2/auth?...`

**Do NOT**:
- ❌ Access `/oauth2callback` directly
- ❌ Modify the URL
- ❌ Remove any parameters

### Step 3: Open in Browser

1. **Paste the entire `authUrl`** in your browser's address bar
2. Press Enter
3. You'll be taken to Google's authorization page

### Step 4: Authorize

1. **Sign in** to your Google account (`aiguardian01@gmail.com`)
2. **Review permissions**:
   - Gmail (send, modify, metadata)
   - Google Sheets (read/write)
   - Google Drive (read, file management)
3. **Click "Allow"**

### Step 5: Automatic Redirect

After clicking "Allow":
- Google will **automatically redirect** you to: `http://localhost:7101/oauth2callback?code=...`
- The system will process the code
- You'll see: **"✅ Authorization Successful!"**

---

## ⚠️ Common Errors & Solutions

### Error: "Required parameter is missing: response_type"

**Cause**: Accessing the callback URL directly or URL was modified

**Solution**:
- Use the **ENTIRE** `authUrl` from `/auth/google` response
- Don't access `/oauth2callback` directly
- Don't modify the URL

### Error: "invalid_client" (401 Unauthorized)

**Cause**: Client ID or Client Secret mismatch

**Solution**:
1. Verify Client ID in `config/api_keys.js` matches Google Cloud Console
2. Verify Client Secret is correct
3. Ensure redirect URI in Google Cloud Console matches exactly: `http://localhost:7101/oauth2callback`

### Error: "redirect_uri_mismatch"

**Cause**: Redirect URI not added to Google Cloud Console

**Solution**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit OAuth Client ID
3. Add: `http://localhost:7101/oauth2callback`
4. Save and wait 2-3 minutes

---

## 🔍 Verification After Authorization

### Check OAuth Status:
```bash
curl http://localhost:7101/auth/status
```

**Expected Response**:
```json
{
  "authorized": true,
  "hasRefreshToken": true,
  "needsRefresh": false
}
```

### Check System Logs:
```bash
docker-compose logs automation | grep -i "token\|oauth"
```

Should show:
- `OAuth tokens obtained and saved`
- `Google Drive credentials updated`
- `Gmail service credentials updated`

### Test File Detection:
```bash
curl -X POST http://localhost:7101/api/trigger-poll
```

Should successfully scan Google Drive folder (no auth errors).

---

## 📋 Quick Reference

**Get Auth URL**:
```bash
curl http://localhost:7101/auth/google
```

**Check Status**:
```bash
curl http://localhost:7101/auth/status
```

**Manual Poll**:
```bash
curl -X POST http://localhost:7101/api/trigger-poll
```

**Dashboard**:
```
http://localhost:7080
```

---

## ✅ Success Indicators

After successful OAuth:
- ✅ `auth/status` returns `authorized: true`
- ✅ No more "No access token" errors in logs
- ✅ File detection works (polling succeeds)
- ✅ Dashboard shows active status
- ✅ Tokens saved in `/app/tokens.json` (inside container)

---

**Next Step**: Complete OAuth authorization using the `authUrl` from `/auth/google` endpoint!
