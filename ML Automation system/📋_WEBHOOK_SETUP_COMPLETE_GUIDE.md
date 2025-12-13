# 📋 Complete Webhook Setup Guide - AnyMail Auto-Population

## 🎯 Overview

This guide walks you through setting up the webhook system so that:
1. **AnyMail sends webhook** when a prospect is found/enriched
2. **System auto-fills prospect data** from AnyMail
3. **Template is auto-selected** from database based on lead type
4. **Email is sent** with proper personalization
5. **Lead is segmented** and synced to HubSpot

---

## ✅ What's Already Built

### 1. Webhook Handler Service ✅
- **File**: `src/services/anymailWebhookHandler.js`
- **Function**: Handles incoming AnyMail webhooks
- **Features**:
  - Auto-finds or creates lead
  - Enriches with AnyMail data
  - Classifies lead
  - Gets template from database
  - Personalizes email
  - Sends via Gmail
  - Segments lead
  - Syncs to HubSpot

### 2. Webhook Endpoint ✅
- **URL**: `POST /api/webhooks/anymail`
- **Location**: `src/index.js`
- **Status**: Ready to receive webhooks

### 3. Template System ✅
- **Database**: `email_templates` table
- **Selection**: Based on `lead_type` and `template_set`
- **Personalization**: Uses `templateRouter` service

---

## 🚀 Step-by-Step Setup

### STEP 1: Get Your Webhook URL

Your webhook URL will be:
```
https://your-domain.com/api/webhooks/anymail
```

**For Local Development:**
```
http://localhost:3001/api/webhooks/anymail
```

**For Production:**
- Deploy your application to a server
- Get your public URL
- Use: `https://your-domain.com/api/webhooks/anymail`

---

### STEP 2: Configure AnyMail Webhook

1. **Log into AnyMail Dashboard**
   - Go to your AnyMail account settings
   - Navigate to "Webhooks" or "Integrations"

2. **Add New Webhook**
   - Click "Add Webhook" or "Create Webhook"
   - Enter your webhook URL: `https://your-domain.com/api/webhooks/anymail`

3. **Configure Webhook Events**
   Select which events should trigger the webhook:
   - ✅ `contact.found` - When a contact is found/enriched
   - ✅ `contact.verified` - When email is verified
   - ✅ `contact.enriched` - When contact data is enriched

4. **Set Webhook Method**
   - Method: `POST`
   - Content-Type: `application/json`

5. **Configure Payload Format**
   The webhook expects this format:
   ```json
   {
     "event": "contact.found",
     "email": "prospect@example.com",
     "contact_data": {
       "first_name": "John",
       "last_name": "Doe",
       "company": "Acme Corp",
       "title": "Director",
       "phone": "+1234567890",
       "website": "https://acme.com",
       "city": "New York",
       "state": "NY",
       "country": "USA"
     },
     "metadata": {
       "source": "anymail",
       "confidence": 0.95
     }
   }
   ```

6. **Save Webhook Configuration**

---

### STEP 3: Verify Webhook Endpoint

Test your webhook endpoint:

```bash
curl -X POST http://localhost:3001/api/webhooks/anymail \
  -H "Content-Type: application/json" \
  -d '{
    "event": "contact.found",
    "email": "test@example.com",
    "contact_data": {
      "first_name": "Test",
      "last_name": "User",
      "company": "Test Corp"
    }
  }'
```

**Expected Response:**
```json
{
  "received": true
}
```

**Check Logs:**
- Should see: "AnyMail webhook received"
- Should see: "AnyMail webhook processed"

---

### STEP 4: Ensure Templates in Database

Verify templates exist:

```sql
SELECT * FROM email_templates 
WHERE is_active = true 
ORDER BY template_set, sequence_order;
```

**If no templates exist**, initialize them:

```bash
node scripts/init-email-templates.js
```

**Template Structure:**
- `template_set`: Matches lead's `template_set` (e.g., "ngo", "school", "student")
- `lead_type`: Matches lead's `lead_type` (e.g., "NGO", "School", "Student")
- `sequence_order`: Order in sequence (1, 2, 3, etc.)
- `subject`: Email subject with variables (e.g., "Hello {{first_name}}")
- `body`: Email body with variables (e.g., "Hi {{name}}, ...")

---

### STEP 5: Test Complete Flow

1. **Trigger AnyMail Webhook** (or use test endpoint):
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/anymail \
     -H "Content-Type: application/json" \
     -d '{
       "event": "contact.found",
       "email": "newprospect@example.com",
       "contact_data": {
         "first_name": "Jane",
         "last_name": "Smith",
         "company": "State University",
         "title": "Professor"
       }
     }'
   ```

2. **Verify Lead Created**:
   ```sql
   SELECT * FROM leads WHERE email = 'newprospect@example.com';
   ```

3. **Verify Email Sent**:
   ```sql
   SELECT * FROM email_logs 
   WHERE lead_id = (SELECT id FROM leads WHERE email = 'newprospect@example.com')
   ORDER BY created_at DESC LIMIT 1;
   ```

4. **Verify HubSpot Sync**:
   - Check HubSpot contacts
   - Verify contact has automation properties
   - Verify contact is in appropriate list

---

## 🔄 How It Works

### Flow Diagram:
```
AnyMail → Webhook → Handler → Database → Template → Email → HubSpot
```

### Detailed Flow:

1. **AnyMail Finds Contact**
   - AnyMail enriches contact data
   - Triggers webhook to your endpoint

2. **Webhook Handler Receives Data**
   - Extracts email and contact data
   - Finds or creates lead in database

3. **Lead Enrichment**
   - Merges AnyMail data with existing lead
   - Updates database with enriched data

4. **Lead Classification**
   - Classifies lead (NGO, School, Student, etc.)
   - Assigns template set

5. **Template Selection**
   - Queries database for template
   - Matches: `template_set` + `lead_type`
   - Gets first template in sequence

6. **Template Personalization**
   - Replaces variables: `{{first_name}}`, `{{name}}`, etc.
   - Adds tracking pixels
   - Adds unsubscribe links

7. **Email Sending**
   - Selects Gmail account (departments vs marketing)
   - Sends personalized email
   - Logs email send

8. **Sequence Initialization**
   - Creates sequence entry
   - Schedules next email

9. **Segmentation**
   - Creates segment entry
   - Syncs to HubSpot list

10. **HubSpot Sync**
    - Updates contact properties
    - Adds to appropriate list

---

## 📊 Webhook Payload Examples

### Contact Found Event:
```json
{
  "event": "contact.found",
  "email": "john@acme.com",
  "contact_data": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "Acme Corporation",
    "title": "Director of Operations",
    "phone": "+1-555-123-4567",
    "website": "https://acme.com",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "metadata": {
    "source": "anymail_api",
    "confidence": 0.92,
    "verified": true
  }
}
```

### Contact Enriched Event:
```json
{
  "event": "contact.enriched",
  "email": "jane@university.edu",
  "contact_data": {
    "first_name": "Jane",
    "last_name": "Smith",
    "company": "State University",
    "title": "Professor",
    "department": "Computer Science"
  }
}
```

---

## 🔧 Configuration

### Webhook Security (Optional but Recommended):

Add webhook signature verification:

```javascript
// In anymailWebhookHandler.js
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### Environment Variables:

Add to `.env`:
```
ANYMAIL_WEBHOOK_SECRET=your-secret-key-here
WEBHOOK_URL=https://your-domain.com/api/webhooks/anymail
```

---

## ✅ Verification Checklist

- [ ] Webhook endpoint accessible
- [ ] AnyMail webhook configured
- [ ] Templates in database
- [ ] Test webhook received
- [ ] Lead created in database
- [ ] Email sent successfully
- [ ] Lead synced to HubSpot
- [ ] Lead segmented correctly
- [ ] Template personalized correctly

---

## 🐛 Troubleshooting

### Webhook Not Receiving:
- Check webhook URL is correct
- Verify server is running
- Check firewall/security settings
- Verify AnyMail webhook is enabled

### Lead Not Created:
- Check database connection
- Verify email format is valid
- Check logs for errors

### Template Not Found:
- Verify templates exist in database
- Check `template_set` matches lead
- Check `lead_type` matches template
- Run: `node scripts/init-email-templates.js`

### Email Not Sent:
- Verify Gmail OAuth is complete
- Check Gmail account selection
- Verify email template is valid
- Check email logs for errors

---

## 🚀 Next Steps

1. **Configure AnyMail Webhook** (5 min)
   - Add webhook URL in AnyMail dashboard
   - Configure events

2. **Test Webhook** (2 min)
   - Send test webhook
   - Verify processing

3. **Verify Templates** (2 min)
   - Check templates in database
   - Initialize if needed

4. **Test Complete Flow** (5 min)
   - Trigger webhook with real data
   - Verify end-to-end flow

**Total Setup Time**: ~15 minutes

---

*Webhook system is ready! Follow the steps above to complete setup.* 🚀
