# 🚀 OAuth Authorization Steps - Ready to Complete

**Status**: ✅ Testing mode configured  
**Next Step**: Complete OAuth authorization

---

## 📋 Step-by-Step Authorization

### Step 1: Get Authorization URL

The authorization URL is ready. You can get it by running:

```bash
curl http://localhost:7101/auth/google
```

Or visit in your browser:
```
http://localhost:7101/auth/google
```

This will return a JSON response with an `authUrl` field.

### Step 2: Open Authorization URL

1. **Copy the `authUrl`** from the response
2. **Open it in your browser**
3. **Make sure you are signed into Google** with `marketinghingecraft@gmail.com`

### Step 3: Grant Permissions

1. You should see the **OAuth consent screen** (not an error)
2. The screen will show:
   - App name: "HingeCraft ML Automation"
   - Status: "Google hasn't verified this app" (normal for Testing mode)
   - Requested permissions (7 scopes)
3. **Click "Continue"** or **"Allow"** to grant permissions

### Step 4: Authorization Complete

1. After clicking "Allow", you'll be redirected to:
   ```
   http://localhost:7101/oauth2callback?code=...
   ```
2. The system will automatically:
   - Exchange the authorization code for tokens
   - Save refresh token for future use
   - Display a success message

### Step 5: Verify Authorization

Check authorization status:

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

## ✅ What to Expect

### Success Flow:
1. ✅ Authorization URL opens in browser
2. ✅ OAuth consent screen appears (not policy error)
3. ✅ You can click "Allow" to grant permissions
4. ✅ Redirected back to app with success message
5. ✅ System can now access Google APIs

### If You See Errors:

#### Error: "Access blocked: Authorization Error"
- **Fix**: Verify app is in **Testing mode** (not Production)
- **Check**: OAuth Consent Screen → Audience tab → Publishing status = "Testing"

#### Error: "redirect_uri_mismatch"
- **Fix**: Verify redirect URI in Google Cloud Console matches exactly:
  ```
  http://localhost:7101/oauth2callback
  ```
- **Check**: OAuth Client → Authorized redirect URIs

#### Error: "invalid_client"
- **Fix**: Verify Client ID and Client Secret in `config/api_keys.js` match Google Cloud Console
- **Check**: OAuth Client → Client ID and Client Secret

---

## 🔍 Quick Verification Commands

### Check Authorization Status:
```bash
curl http://localhost:7101/auth/status
```

### Get Fresh Authorization URL:
```bash
curl http://localhost:7101/auth/google
```

### Check System Health:
```bash
curl http://localhost:7101/health
```

### View System Logs:
```bash
docker-compose logs -f automation
```

---

## 📊 Expected OAuth Consent Screen

When you open the authorization URL, you should see:

```
┌─────────────────────────────────────────┐
│  Google hasn't verified this app        │
│                                         │
│  HingeCraft ML Automation               │
│  wants to access your Google Account    │
│                                         │
│  This app is currently being tested.    │
│  You should only continue if you know   │
│  the developer that invited you.       │
│                                         │
│  [Cancel]  [Continue]                  │
└─────────────────────────────────────────┘
```

**This is normal for Testing mode!** Click "Continue" to proceed.

---

## 🎯 After Authorization

Once authorization is complete:

1. ✅ **Google Drive Polling** will start automatically
2. ✅ **File detection** will work when files are uploaded
3. ✅ **Gmail sending** will be enabled
4. ✅ **Google Sheets** access will be available

### Test File Detection:

1. Upload a CSV/XLSX file to Google Drive folder:
   ```
   Folder ID: 1MpKKqjpabi10iDh1vWliaiLQsj8wktiz
   ```
2. System will detect it within 30 seconds
3. Check logs:
   ```bash
   docker-compose logs -f automation | grep -i "drive\|file"
   ```

---

## 🚨 Troubleshooting

### Issue: Still seeing policy error
- **Solution**: Wait 5-10 minutes after changing to Testing mode
- **Solution**: Clear browser cache and try again
- **Solution**: Use incognito/private browsing mode

### Issue: Authorization code exchange fails
- **Check**: Docker container logs for errors
- **Check**: Redirect URI matches exactly in Google Cloud Console
- **Check**: Client ID and Secret are correct

### Issue: Refresh token not saved
- **Check**: `tokens.json` file exists in project root
- **Check**: File permissions allow writing
- **Check**: Docker volume mounts are correct

---

**Status**: ✅ Ready to authorize  
**Next**: Open the authorization URL and complete the OAuth flow
