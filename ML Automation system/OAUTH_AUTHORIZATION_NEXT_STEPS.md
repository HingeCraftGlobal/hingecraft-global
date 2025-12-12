# 🚀 OAuth Authorization - Next Steps

**Status**: ✅ OAuth Consent Screen configured, Testing mode set, Test users added

---

## 🎯 Step 1: Complete OAuth Authorization

### Get Authorization URL:

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

### Authorize:

1. **Copy the ENTIRE `authUrl`** from the JSON response
2. **Paste it in your browser** (don't modify it)
3. **Sign in** with `marketinghingecraft@gmail.com`
4. **Review permissions** (all 7 scopes)
5. **Click "Allow"**
6. **Wait for redirect** to: `http://localhost:7101/oauth2callback?code=...`
7. **You should see**: "✅ Authorization Successful!"

---

## ✅ Step 2: Verify OAuth Status

After authorization, verify it worked:

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
docker-compose logs automation | grep -i "token\|oauth\|authorization"
```

Should show:
- `OAuth tokens obtained and saved`
- `Google Drive credentials updated`
- `Gmail service credentials updated`

---

## 🧪 Step 3: Test Google Drive Access

### Test File Detection:

```bash
curl -X POST http://localhost:7101/api/trigger-poll
```

**Expected**: No "No access token" errors. Should successfully scan folder.

### Check Logs:

```bash
docker-compose logs automation --tail=20 | grep -i "drive\|folder\|file"
```

Should show successful folder scanning (no auth errors).

---

## 📊 Step 4: Verify Dashboard

1. **Open Dashboard**: http://localhost:7080
2. **Check Status**: Should show system active
3. **Verify**: No OAuth errors displayed

---

## 🎯 Step 5: Test Complete Pipeline

### Drop a Test File:

1. **Create a test CSV file** with sample leads:
   ```csv
   name,email,company,title
   John Doe,john@example.com,Acme Corp,CEO
   Jane Smith,jane@example.com,Tech Inc,CTO
   ```

2. **Upload to Google Drive folder**: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`

3. **Wait 30 seconds** (or trigger manually):
   ```bash
   curl -X POST http://localhost:7101/api/trigger-poll
   ```

4. **Check Dashboard**: http://localhost:7080
   - Should show file detected
   - Pipeline should start
   - Stages should update in real-time

---

## ✅ Step 6: Verify Complete System

### Run Full Verification:

```bash
cd "ML Automation system"
./scripts/verify-everything.sh all
```

**Expected Results**:
- ✅ API health check
- ✅ OAuth authorized: true
- ✅ All 7 scopes present
- ✅ System watcher active
- ✅ Database connection
- ✅ File detection working

---

## 📋 Complete Checklist

After OAuth authorization:

- [ ] OAuth status: `authorized: true`
- [ ] Refresh token: Saved
- [ ] Google Drive access: Working (no auth errors)
- [ ] File detection: Polling successfully
- [ ] Dashboard: Accessible and showing status
- [ ] Test file: Can be detected and processed

---

## 🚀 System Ready When:

- ✅ OAuth authorized
- ✅ No "No access token" errors in logs
- ✅ File detection working
- ✅ Dashboard showing real-time updates
- ✅ Pipeline can process files end-to-end

---

**Next Action**: Complete OAuth authorization using the `authUrl` from `/auth/google` endpoint!


