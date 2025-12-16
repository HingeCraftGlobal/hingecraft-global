# Wix External Database Connection Details

## ✅ Current ngrok URL (Active)

**Base URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`

---

## Complete Wix Connection Settings

Use these exact values in Wix Content Manager:

```
Connection Name: HingeCraftDonationsDB
Base URL: https://multiracial-zavier-acculturative.ngrok-free.dev
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
Collection Name: donations
```

---

## Step-by-Step Connection Instructions

### 1. Open Wix Content Manager
- Go to your Wix site dashboard
- Click **Content Manager** in the left sidebar
- Click **External Databases**

### 2. Add External Database Connection
- Click **Add External Database Connection** or **+ New**
- Select **Custom Database** or **External Database**

### 3. Enter Connection Details
Fill in the form with these exact values:

| Field | Value |
|-------|-------|
| **Connection Name** | `HingeCraftDonationsDB` |
| **Base URL** | `https://multiracial-zavier-acculturative.ngrok-free.dev` |
| **Secret Key** | `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b` |
| **Collection Name** | `donations` |

**Important Notes**:
- Use the **HTTPS URL** (not HTTP)
- **Do NOT** include `/donations` in the Base URL
- Copy the Secret Key exactly as shown
- Collection Name is lowercase: `donations`

### 4. Connect
- Click **Connect** or **Save**
- Wait for connection to be established
- You should see a success message

### 5. ⚠️ REFRESH SCHEMA (CRITICAL)
After connecting, you **MUST** click **"Refresh Schema"**:

1. In the External Database connection settings
2. Look for **"Refresh Schema"** or **"Update Schema"** button
3. Click it to tell Wix to re-fetch the database schema
4. Wait for schema refresh to complete (may take 10-30 seconds)

**Why this is critical**: Wix caches the schema. Without refreshing, Wix won't recognize the Wix required columns (`_id`, `_createdDate`, `_updatedDate`, `_owner`), which will cause WDE0116 errors.

### 6. Verify Schema
After refreshing, verify the schema shows:

**Wix Required Fields** (must be present):
- ✅ `_id` (Text, Required, Primary Key)
- ✅ `_createdDate` (Date & Time)
- ✅ `_updatedDate` (Date & Time)
- ✅ `_owner` (Text)

**Custom Fields**:
- `id`, `amount`, `currency`, `is_other_amount`, `source`, `payment_status`, `payment_method`, `transaction_id`, `member_email`, `member_name`, `created_at`, `updated_at`, `metadata`

---

## Testing the Connection

### Test API via ngrok
```bash
curl -X GET "https://multiracial-zavier-acculturative.ngrok-free.dev/donations" \
  -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
```

### Test Health Endpoint
```bash
curl -X GET "https://multiracial-zavier-acculturative.ngrok-free.dev/health" \
  -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
```

---

## Important Notes

### ngrok URL Changes
⚠️ **Note**: Free ngrok URLs change each time you restart ngrok. If you restart ngrok, you'll need to:
1. Get the new URL: `curl http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'`
2. Update the Base URL in Wix Content Manager
3. Click "Refresh Schema" again

### Keep ngrok Running
- Keep the ngrok process running while using Wix
- If ngrok stops, Wix won't be able to connect
- To check if ngrok is running: `pgrep -f "ngrok http 3000"`

### Troubleshooting
If you see **WDE0116** error:
1. ✅ Verify ngrok is running
2. ✅ Check the Base URL is correct
3. ✅ Verify Secret Key matches exactly
4. ✅ **Click "Refresh Schema"** (most common fix)
5. ✅ Check API logs: `docker logs hingecraft-db-adaptor`

---

## Current Status

- ✅ **ngrok**: Running
- ✅ **API**: Healthy and accessible via ngrok
- ✅ **Database**: Ready with all Wix required columns
- ✅ **URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`

**Ready for Wix Connection!**

---

**Last Updated**: 2025-12-01  
**ngrok URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`













