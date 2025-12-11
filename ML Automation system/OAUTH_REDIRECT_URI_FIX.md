# 🔧 OAuth Redirect URI Fix

**Issue**: `Error 400: redirect_uri_mismatch`

## ✅ Solution Applied

Updated all OAuth redirect URIs from `http://localhost:3001/oauth2callback` to `http://localhost:7101/oauth2callback` to match the external Docker port.

---

## 📋 Steps to Complete OAuth Setup

### Step 1: Update Google Cloud Console

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project

2. **Edit OAuth 2.0 Client ID**:
   - Find your OAuth 2.0 Client ID: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
   - Click **Edit**

3. **Add Authorized Redirect URIs**:
   - Click **+ ADD URI**
   - Add: `http://localhost:7101/oauth2callback`
   - Click **SAVE**

4. **Also add** (for development):
   - `http://localhost:3001/oauth2callback` (internal Docker port)
   - `http://127.0.0.1:7101/oauth2callback` (alternative)

---

### Step 2: Restart Docker Containers

```bash
cd "ML Automation system"
docker-compose down
docker-compose up -d
```

Wait for containers to start (about 10 seconds).

---

### Step 3: Verify Redirect URI

```bash
curl http://localhost:7101/auth/google | jq .authUrl
```

Check that the `redirect_uri` parameter in the URL is:
```
redirect_uri=http%3A%2F%2Flocalhost%3A7101%2Foauth2callback
```

---

### Step 4: Complete OAuth Authorization

1. **Get Authorization URL**:
   ```bash
   curl http://localhost:7101/auth/google
   ```

2. **Open the `authUrl`** in your browser

3. **Sign in** and click **Allow**

4. **You should be redirected** to:
   ```
   http://localhost:7101/oauth2callback?code=...
   ```

5. **Success page** should appear: "✅ Authorization Successful!"

---

## 🔍 Troubleshooting

### Issue: Still getting redirect_uri_mismatch

**Solution**: 
- Double-check Google Cloud Console has `http://localhost:7101/oauth2callback` added
- Wait 5-10 minutes after saving (Google may cache)
- Clear browser cache and try again

### Issue: localhost refused to connect

**Solution**:
- Ensure Docker containers are running: `docker-compose ps`
- Check automation container is healthy: `docker-compose logs automation`
- Verify port 7101 is accessible: `curl http://localhost:7101/health`

### Issue: OAuth callback not working

**Solution**:
- Verify the callback endpoint exists: `curl http://localhost:7101/oauth2callback`
- Check Docker logs: `docker-compose logs automation | grep oauth`
- Ensure the redirect URI matches exactly (no trailing slashes)

---

## ✅ Verification

After completing OAuth:

```bash
# Check OAuth status
curl http://localhost:7101/auth/status

# Should return:
# {
#   "authorized": true,
#   "hasRefreshToken": true,
#   "needsRefresh": false
# }
```

---

## 📝 Summary

- ✅ **Updated**: All redirect URIs to use port 7101
- ✅ **Added**: Environment variable `OAUTH_REDIRECT_URI` in docker-compose
- ⚠️ **Action Required**: Update Google Cloud Console with new redirect URI
- ⚠️ **Action Required**: Restart Docker containers
- ⚠️ **Action Required**: Complete OAuth authorization again

---

**Next Step**: Update Google Cloud Console, then retry OAuth authorization!
