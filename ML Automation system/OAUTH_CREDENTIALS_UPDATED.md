# ✅ OAuth Credentials Updated

**Date**: December 12, 2025  
**Status**: ✅ **ALL CREDENTIALS UPDATED**

---

## 🔑 New OAuth Credentials

### OAuth Client ID:
```
1038403103618-9khn47kou8vkop37b0kiq0autj0712af.apps.googleusercontent.com
```

### OAuth Client Secret:
```
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
```

### Account:
```
marketinghingecraft@gmail.com
```

---

## ✅ What Has Been Updated

### 1. Configuration Files:
- ✅ `config/api_keys.js`:
  - Updated `google.clientId` to new Client ID
  - Updated `google.clientSecret` to new Client Secret
  - Updated `email.fromAddress` to `marketinghingecraft@gmail.com`
  - Updated `email.replyTo` to `marketinghingecraft@gmail.com`

### 2. Email Configuration:
- ✅ From Address: `marketinghingecraft@gmail.com`
- ✅ Reply To: `marketinghingecraft@gmail.com`
- ✅ OAuth Account: `marketinghingecraft@gmail.com`

### 3. HubSpot Configuration:
- ✅ HubSpot API Key: `na2-e523-6348-4407-a23a-d0c00f2ed0ca` (unchanged)
- ✅ HubSpot Portal ID: `244560986` (unchanged)
- ℹ️ **Note**: HubSpot uses separate API credentials and doesn't require email changes

---

## 🔄 Redirect URI

**Redirect URI**: `http://localhost:7101/oauth2callback`

**Status**: ✅ Already configured correctly in:
- `docker-compose.yml`
- All OAuth service files
- All documentation

**Action Required**: Ensure this redirect URI is added to the new OAuth client in Google Cloud Console.

---

## 📋 OAuth Scopes (All 7 Required)

All scopes remain the same and are configured in `config/api_keys.js`:

```
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.metadata
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
```

---

## 🚀 Next Steps

### 1. Verify Google Cloud Console Configuration

Ensure the new OAuth client is configured:

1. **OAuth Client**:
   - Client ID: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af.apps.googleusercontent.com`
   - Redirect URI: `http://localhost:7101/oauth2callback` (must be added)
   - Application type: Web application

2. **OAuth Consent Screen**:
   - User support email: `marketinghingecraft@gmail.com`
   - Developer contact: `marketinghingecraft@gmail.com`
   - Test user: `marketinghingecraft@gmail.com`
   - All 7 scopes added

3. **APIs Enabled**:
   - Gmail API
   - Google Sheets API
   - Google Drive API
   - People API
   - Cloud Resource Manager API

### 2. Restart Docker

```bash
docker-compose restart automation
```

### 3. Complete OAuth Authorization

1. **Sign into Google** with `marketinghingecraft@gmail.com`
2. **Get authorization URL**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
3. **Open the `authUrl`** in browser
4. **Click "Allow"** to grant permissions
5. **Verify** successful authorization

---

## ✅ Verification Checklist

- [ ] OAuth Client ID updated in `config/api_keys.js`
- [ ] OAuth Client Secret updated in `config/api_keys.js`
- [ ] Email addresses updated to `marketinghingecraft@gmail.com`
- [ ] Redirect URI added to Google Cloud Console: `http://localhost:7101/oauth2callback`
- [ ] OAuth Consent Screen configured with `marketinghingecraft@gmail.com`
- [ ] All 7 scopes added to OAuth Consent Screen
- [ ] Test user added: `marketinghingecraft@gmail.com`
- [ ] All 5 APIs enabled
- [ ] Docker restarted
- [ ] OAuth authorization completed

---

## 📊 Current System Configuration

### Google OAuth:
- **Client ID**: `1038403103618-9khn47kou8vkop37b0kiq0autj0712af.apps.googleusercontent.com` ✅
- **Client Secret**: `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` ✅
- **Account**: `marketinghingecraft@gmail.com` ✅
- **Redirect URI**: `http://localhost:7101/oauth2callback` ✅

### Email:
- **From Address**: `marketinghingecraft@gmail.com` ✅
- **Reply To**: `marketinghingecraft@gmail.com` ✅

### HubSpot:
- **API Key**: `na2-e523-6348-4407-a23a-d0c00f2ed0ca` ✅ (unchanged)
- **Portal ID**: `244560986` ✅ (unchanged)
- **Note**: HubSpot uses separate API credentials

---

## 🔍 Verification Commands

### Check Current Configuration:
```bash
docker-compose exec automation node -e "const c=require('./config/api_keys'); console.log('Client ID:', c.google.clientId); console.log('Client Secret:', c.google.clientSecret ? 'SET' : 'MISSING'); console.log('From Address:', c.email.fromAddress);"
```

### Test OAuth Flow:
```bash
curl http://localhost:7101/auth/google
```

---

**Status**: ✅ **ALL CREDENTIALS UPDATED - READY FOR OAUTH AUTHORIZATION**  
**Next Step**: Restart Docker and complete OAuth authorization with new credentials
