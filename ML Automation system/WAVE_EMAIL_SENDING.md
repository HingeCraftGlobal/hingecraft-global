# Wave-Based Email Sending System

**Date**: January 27, 2025  
**Status**: ✅ Implemented & Live

---

## 🎯 Overview

The system now sends emails in **segmented waves of 50-100 emails** to reduce spam risk and improve deliverability. All emails from the lead sheet are collected via Anymail and sent in controlled batches.

---

## 📊 How It Works

### Wave Configuration

- **Wave Size**: 75 emails per wave (configurable: 50-100)
- **Wave Delay**: 1 minute between waves
- **Batch Concurrency**: 10 emails sent concurrently within a wave
- **Daily Limit**: 1,000 emails
- **Hourly Limit**: 100 emails

### Process Flow

```
1. File Dropped in Google Drive
   ↓
2. Leads Processed & Normalized
   ↓
3. Anymail Collects Missing Emails
   ↓
4. Leads Qualified (Score ≥ 65)
   ↓
5. Emails Collected from All Leads
   ↓
6. Emails Split into Waves (75 per wave)
   ↓
7. Wave 1 Sent (75 emails, 10 concurrent)
   ↓
8. Wait 1 Minute
   ↓
9. Wave 2 Sent (75 emails, 10 concurrent)
   ↓
10. Continue until all emails sent
```

---

## 🔧 Configuration

### Email Wave Settings (`config/api_keys.js`)

```javascript
email: {
  waveSize: 75,              // Emails per wave (50-100 recommended)
  waveDelay: 60000,           // Delay between waves (1 minute)
  batchConcurrency: 10,       // Concurrent sends within wave
  dailyLimit: 1000,           // Max emails per day
  hourlyLimit: 100           // Max emails per hour
}
```

---

## 📧 Email Collection

### Anymail Integration

The system uses Anymail to:

1. **Find Missing Emails**: If a lead sheet doesn't have an email, Anymail finds it using:
   - Domain (from website)
   - First name
   - Last name
   - Organization name

2. **Batch Enrichment**: Processes multiple leads at once for efficiency

3. **Email Verification**: Verifies email deliverability before sending

### Collection Process

```javascript
// Single lead enrichment
await leadProcessor.enrichLead(lead);

// Batch enrichment (more efficient)
await leadProcessor.batchEnrichLeads(leads);
```

---

## 🚀 Usage

### Automatic (File Processing)

When a file is dropped in Google Drive:

1. Leads are processed
2. Missing emails are found via Anymail
3. Qualified leads (score ≥ 65) are identified
4. Emails are collected from all leads
5. Emails are sent in waves automatically

### Manual Wave Sending

```javascript
const emailWaveSender = require('./services/emailWaveSender');

// Collect emails from leads
const emails = await emailWaveSender.collectEmailsFromLeads(leads, template);

// Send in waves
const results = await emailWaveSender.sendInWaves(emails);

// Results:
// {
//   success: true,
//   total: 250,
//   sent: 248,
//   failed: 2,
//   waves: 4,
//   waveResults: [...]
// }
```

---

## 📈 Benefits

### Spam Prevention
- ✅ **Segmented sending** reduces spam flags
- ✅ **Delays between waves** prevent rate limiting
- ✅ **Controlled concurrency** avoids overwhelming servers

### Deliverability
- ✅ **Better inbox placement** with wave-based sending
- ✅ **Reduced bounce rates** with email verification
- ✅ **Improved sender reputation** with controlled sending

### Scalability
- ✅ **Handles large lists** (1000+ emails)
- ✅ **Automatic retries** for failed sends
- ✅ **Progress tracking** per wave

---

## 🔍 Monitoring

### Wave Statistics

```javascript
// Get sending statistics
const stats = await emailWaveSender.getSendingStats();

// Returns:
// {
//   total_sent: 750,
//   sent: 745,
//   bounced: 3,
//   opened: 120,
//   clicked: 45
// }
```

### Logging

All wave sending is logged:
- Wave start/completion
- Emails sent per wave
- Failures and errors
- Timing information

---

## ⚙️ Customization

### Adjust Wave Size

```javascript
// In config/api_keys.js
email: {
  waveSize: 50,  // Smaller waves (more conservative)
  // or
  waveSize: 100  // Larger waves (faster)
}
```

### Adjust Wave Delay

```javascript
email: {
  waveDelay: 30000,  // 30 seconds (faster)
  // or
  waveDelay: 120000  // 2 minutes (more conservative)
}
```

---

## 📋 Example: Processing 250 Leads

```
File: new_leads.csv
Total Leads: 250
Qualified Leads: 230 (score ≥ 65)

Wave 1: 75 emails (sent)
  → Wait 1 minute
Wave 2: 75 emails (sent)
  → Wait 1 minute
Wave 3: 75 emails (sent)
  → Wait 1 minute
Wave 4: 5 emails (sent)

Total: 230 emails sent across 4 waves
Time: ~4 minutes
```

---

## ✅ Status

- ✅ Wave-based sending implemented
- ✅ Anymail email collection active
- ✅ Batch enrichment working
- ✅ Configuration live
- ✅ All updates committed to git

---

**System**: ✅ **LIVE**  
**Wave Size**: 75 emails  
**Wave Delay**: 1 minute  
**Status**: Production Ready
