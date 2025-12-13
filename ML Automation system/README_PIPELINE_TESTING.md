# 🧪 Pipeline Testing - Complete Guide
## Test Your Full Automation Pipeline After Google OAuth

---

## ⚡ Quick Start

**After Google OAuth is complete**, run:

```bash
node tests/pipeline-step-by-step-test.js
```

This automatically tests all 15 pipeline steps!

---

## 📋 What Gets Tested

The test script verifies each step of your automation:

1. **Google Drive File Detection** - Files detected from Drive
2. **File Parsing** - CSV/XLSX parsed into rows
3. **Lead Normalization** - Data cleaned and normalized
4. **AnyMail Enrichment** - Emails discovered
5. **HubSpot Sync** - Contacts created in HubSpot
6. **Lead Classification** - Leads classified by type
7. **Template Routing** - Templates assigned
8. **Sequence Init** - Email sequences started
9. **Email Sending** - Emails sent
10. **Email Tracking** - Tracking tokens generated
11. **Bounce Handling** - Bounce system ready
12. **Reply Detection** - Reply system ready
13. **Segment Reconciliation** - Segment system ready
14. **Audit Trail** - Audit system working
15. **Monitoring** - Dashboards accessible

---

## 🎯 Expected Results

When everything works, you'll see:

```
✅ Step 1: Google Drive File Detection: PASSED
✅ Step 2: File Parsing: PASSED
✅ Step 3: Lead Normalization: PASSED
... (all 15 steps)
✅ Step 15: Monitoring & Dashboards: PASSED

Success Rate: 100%
```

---

## 🔧 Setup Before Testing

1. **Run Database Migration**:
   ```bash
   docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation < database/004_bounce_thread_audit_tables.sql
   ```

2. **Verify OAuth**:
   ```bash
   curl http://localhost:7101/auth/status
   ```

3. **Upload Test File**:
   - Create CSV with: email, first_name, last_name, company, title
   - Upload to Google Drive folder
   - Wait 30 seconds

4. **Run Test**:
   ```bash
   node tests/pipeline-step-by-step-test.js
   ```

---

## 📊 Understanding Results

### ✅ Passed Steps
- Component is working correctly
- Data is flowing through pipeline
- Ready for production use

### ❌ Failed Steps
- Check error message
- Review troubleshooting guide
- Fix issue and re-test

### Common Issues

**No files detected**:
- Upload a file to Drive folder
- Check folder ID in config
- Manually trigger: `POST /api/trigger-poll`

**No leads created**:
- Check file parsing worked
- Verify email column exists
- Check database for errors

**No classification**:
- Verify classification rules exist
- Check lead has required fields
- Manually classify: `POST /api/leads/:id/classify`

---

## 🎉 Success!

When all steps pass, your pipeline is:
- ✅ Fully functional
- ✅ Production ready
- ✅ Fully tested
- ✅ Ready to scale

---

**Start testing now!** 🚀

```bash
node tests/pipeline-step-by-step-test.js
```
