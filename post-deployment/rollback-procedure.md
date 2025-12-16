# 🔄 Rollback Procedure

**Purpose:** Step-by-step guide for rolling back deployment if issues occur  
**Last Updated:** January 27, 2025

---

## 🚨 When to Rollback

Rollback should be considered if:

- Critical errors preventing payment processing
- Database corruption or data loss
- Security vulnerabilities discovered
- System-wide failures
- Customer impact is severe

---

## 📋 Pre-Rollback Checklist

Before rolling back:

- [ ] Identify the issue clearly
- [ ] Document error messages
- [ ] Check system logs
- [ ] Verify backup availability
- [ ] Notify stakeholders
- [ ] Prepare rollback plan

---

## 🔄 Rollback Steps

### Step 1: Stop New Transactions

1. **Disable Payment Forms**
   - Remove or disable Mission Support form
   - Add maintenance message
   - Redirect users to contact page

2. **Disable Webhooks**
   - Temporarily disable NOWPayments webhook
   - Or add error handling to reject webhooks

**Time:** 2-5 minutes

---

### Step 2: Backup Current State

1. **Export Database**
   ```sql
   -- Export all tables
   pg_dump database_name > backup_before_rollback.sql
   ```

2. **Backup Wix Functions**
   - Export all backend functions
   - Save to backup folder
   - Document current versions

3. **Backup Frontend Pages**
   - Export current page code
   - Save HTML/JS files
   - Document current state

**Time:** 5-10 minutes

---

### Step 3: Rollback Backend Functions

1. **Remove New Functions**
   - Delete newly added functions:
     - `nowpayments.api.jsw`
     - `createNowPaymentsInvoice.jsw`
     - `email-templates.jsw`
     - `reconciliation-worker.jsw`
     - `notion-crm-sync.jsw`
     - `webhooks/nowpayments.jsw`

2. **Restore Previous Functions**
   - Restore previous version of `hingecraft.api.web.jsw`
   - Or remove NOWPayments-related code

3. **Verify Functions**
   - Check Functions list
   - Verify no errors
   - Test basic functions

**Time:** 10-15 minutes

---

### Step 4: Rollback Frontend Pages

1. **Restore Payment Page**
   - Remove Mission Support form
   - Restore previous payment page code
   - Or add maintenance message

2. **Restore Charter Page**
   - Remove new code
   - Restore previous version
   - Verify page displays

**Time:** 5-10 minutes

---

### Step 5: Rollback Database Changes

**⚠️ CAUTION: Only if necessary**

1. **Review Database Changes**
   - Check what tables were added
   - Verify no critical data in new tables

2. **Remove New Tables** (if safe)
   ```sql
   DROP TABLE IF EXISTS crypto_payments;
   DROP TABLE IF EXISTS webhook_logs;
   DROP TABLE IF EXISTS kyc_verifications;
   -- Keep contribution_intents if it has data
   ```

3. **Restore Previous Schema**
   - Run previous schema if available
   - Or manually remove new columns

**Time:** 10-15 minutes  
**Risk:** Medium - Only if no critical data

---

### Step 6: Remove Secrets

1. **Remove NOWPayments Secrets**
   - Remove `NOWPAYMENTS_API_KEY`
   - Remove `NOWPAYMENTS_IPN_SECRET`
   - Remove `NOWPAYMENTS_BASE_URL`
   - Keep other secrets if still needed

2. **Verify Secrets**
   - Check no functions reference removed secrets
   - Update functions if needed

**Time:** 5 minutes

---

### Step 7: Disable NOWPayments Webhook

1. **NOWPayments Dashboard**
   - Log into NOWPayments
   - Go to Settings → IPN Settings
   - Disable or remove webhook URL
   - Save changes

**Time:** 2-5 minutes

---

### Step 8: Verify Rollback

1. **Test Basic Functions**
   - Test donation retrieval
   - Test payment form (if restored)
   - Verify no errors in console

2. **Check Database**
   - Verify data integrity
   - Check no orphaned records
   - Verify backups available

3. **Monitor System**
   - Watch for errors
   - Check logs
   - Monitor for 30 minutes

**Time:** 15-30 minutes

---

## ✅ Post-Rollback Checklist

- [ ] System is stable
- [ ] No critical errors
- [ ] Basic functions working
- [ ] Database integrity verified
- [ ] Backups confirmed
- [ ] Stakeholders notified
- [ ] Issue documented
- [ ] Fix plan created

---

## 📝 Rollback Documentation

**Document the following:**

1. **Issue Description**
   - What went wrong
   - When it occurred
   - Impact assessment

2. **Rollback Actions**
   - What was rolled back
   - When rollback occurred
   - Who performed rollback

3. **Current State**
   - System status
   - What's working
   - What's not working

4. **Next Steps**
   - Fix plan
   - Timeline
   - Testing plan

---

## 🔧 Quick Rollback (Emergency)

**For critical issues only:**

1. Disable payment forms (2 min)
2. Disable webhooks (2 min)
3. Remove new backend functions (5 min)
4. Restore previous frontend (5 min)
5. Verify system (5 min)

**Total Time:** ~20 minutes

---

## 📞 Emergency Contacts

- **Technical Lead:** [Contact]
- **Database Admin:** [Contact]
- **NOWPayments Support:** support@nowpayments.io

---

## ⚠️ Important Notes

- **Always backup before rollback**
- **Document everything**
- **Test rollback in staging first** (if possible)
- **Notify stakeholders**
- **Create fix plan before rolling back**

---

**Status:** Ready for Use  
**Last Tested:** [Date]  
**Next Review:** [Date]





