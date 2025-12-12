# 🔐 Google OAuth Setup Guide

**Status**: ⚠️ **OAuth Authorization Required**

---

## 🚀 Quick Start

### Step 1: Get Authorization URL

Visit this endpoint to get your authorization URL:
```
http://localhost:7101/auth/google
```

Or use curl:
```bash
curl http://localhost:7101/auth/google
```

### Step 2: Authorize Access

1. **Open the `authUrl`** from Step 1 in your browser
2. **Sign in** to your Google account
3. **Review permissions**:
   - Google Drive (read-only)
   - Google Sheets (read-only)
   - Gmail (send and modify)
4. **Click "Allow"** to grant access

### Step 3: Verify Authorization

After authorization, you'll be redirected to:
```
http://localhost:3001/oauth2callback
```

You should see: **"✅ Authorization Successful!"**

### Step 4: Check Status

Verify OAuth is complete:
```bash
curl http://localhost:7101/auth/status
```

Should return:
```json
{
  "authorized": true,
  "needsRefresh": false,
  "hasRefreshToken": true
}
```

---

## ✅ After Authorization

Once OAuth is complete:

- ✅ **File detection** will work automatically
- ✅ **Polling** will access Google Drive every 30 seconds
- ✅ **New files** will be detected and processed
- ✅ **Dashboard** will show real-time updates

---

## 🔍 Troubleshooting

### Issue: Redirect URI mismatch

If you see "redirect_uri_mismatch":
- The redirect URI must be: `http://localhost:3001/oauth2callback`
- Make sure this is configured in Google Cloud Console

### Issue: Tokens not saving

Check if tokens.json was created:
```bash
docker-compose exec automation ls -la /app/tokens.json
```

### Issue: Still getting "No access token"

1. Check OAuth status: `curl http://localhost:7101/auth/status`
2. Restart the automation container: `docker-compose restart automation`
3. Try the authorization flow again

---

## 📝 Manual Token Check

Check if tokens exist:
```bash
docker-compose exec automation cat /app/tokens.json
```

---

**Next Step**: Complete OAuth authorization to enable file detection!


