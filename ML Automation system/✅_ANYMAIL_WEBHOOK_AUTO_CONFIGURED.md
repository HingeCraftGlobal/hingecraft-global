# ✅ AnyMail Webhook Auto-Configured

## 🎯 System Configuration

### Email Sending
- **Single Account**: `marketingecraft@gmail.com` only
- All emails sent from this account

### AnyMail Webhook
- **Auto-Configured**: All AnyMail API calls include `x-webhook-url` header
- **Webhook URL**: `http://localhost:3001/api/webhooks/anymail` (or production URL)
- **Automatic**: No manual configuration needed

---

## ✅ How It Works

### AnyMail API Calls with Webhook

When you call AnyMail API endpoints, the system **automatically** includes the webhook URL:

```javascript
// AnyMail automatically includes this header:
headers: {
  'x-webhook-url': 'http://localhost:3001/api/webhooks/anymail'
}
```

### Supported Endpoints (Auto-Webhook Enabled)

1. **Find a Person's Email** (`/find`)
   - Auto-includes webhook URL
   - Results sent to webhook when ready

2. **Email Verification** (`/verify`)
   - Auto-includes webhook URL
   - Results sent to webhook when ready

3. **Batch Find Emails** (`/batch/find`)
   - Auto-includes webhook URL
   - Results sent to webhook when ready

---

## 🔄 Complete Flow

### When File Dropped in Google Drive:

1. **File Detected** → System processes file
2. **AnyMail API Called** → With `x-webhook-url` header
3. **Request Queued** → AnyMail processes (5-15 seconds)
4. **Webhook Receives Results** → `/api/webhooks/anymail`
5. **Auto-Fill Data** → From AnyMail results
6. **Select Template** → From database
7. **Send Email** → From `marketingecraft@gmail.com`
8. **Segment & Sync** → To HubSpot

---

## 📊 Configuration

### Environment Variables

Add to `.env`:
```
ANYMAIL_WEBHOOK_URL=http://localhost:3001/api/webhooks/anymail
# OR for production:
ANYMAIL_WEBHOOK_URL=https://your-domain.com/api/webhooks/anymail

ANYMAIL_WEBHOOK_SECRET=your-secret-key-here
```

### Webhook URL

The system automatically uses:
- Development: `http://localhost:3001/api/webhooks/anymail`
- Production: Set `ANYMAIL_WEBHOOK_URL` in `.env`

---

## ✅ What's Auto-Configured

- ✅ All AnyMail API calls include `x-webhook-url` header
- ✅ Webhook endpoint receives results automatically
- ✅ Results processed through complete flow
- ✅ No manual webhook configuration needed in AnyMail dashboard

---

## 🚀 Usage

### Normal Usage (Webhook Auto-Configured):

```javascript
// Just call AnyMail API - webhook is automatic
const anymail = require('./services/anymail');
const result = await anymail.findEmail('example.com', 'John', 'Doe', 'Acme Corp');
// Results will arrive via webhook automatically
```

### Webhook Receives Results:

The webhook handler automatically:
1. Receives AnyMail API results
2. Auto-fills prospect data
3. Selects template
4. Sends email
5. Syncs to HubSpot

---

*AnyMail webhook is fully auto-configured!* 🚀
