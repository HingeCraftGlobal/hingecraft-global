# 🚀 Quick Start Deployment Guide

## One-Command Deployment

```bash
cd "hingecraft-global/ML Automation system"
./scripts/deploy.sh
```

That's it! The script will:
1. ✅ Run database migration
2. ✅ Verify tables created
3. ✅ Run verification tests
4. ✅ Check environment variables
5. ✅ Display deployment summary

---

## Manual Deployment (If Needed)

### 1. Run Database Migration

```bash
docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation < database/004_bounce_thread_audit_tables.sql
```

### 2. Verify Tables

```bash
docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -c "\dt" | grep -E "(email_bounces|email_threads|email_replies|email_tracking|lead_segments|segment_conflicts|audit_trace|domain_suppression)"
```

### 3. Restart Services

```bash
docker-compose restart
```

### 4. Test Endpoints

```bash
# Health check
curl http://localhost:7101/health

# Monitoring dashboard
curl http://localhost:7101/api/monitoring/dashboard
```

---

## ✅ Verification

After deployment, verify everything is working:

```bash
# Run test suite
node tests/verification-test-harness.js all

# Check specific sections
node tests/verification-test-harness.js bounce
node tests/verification-test-harness.js thread
node tests/verification-test-harness.js segment
```

---

## 🎯 What's Now Available

### New API Endpoints
- `/api/webhooks/bounce` - Process bounces
- `/api/webhooks/reply` - Process replies
- `/track/open` - Open tracking pixel
- `/track/click` - Click tracking
- `/api/unsubscribe` - Unsubscribe
- `/api/monitoring/dashboard` - Dashboard
- `/api/gdpr/access` - GDPR access
- `/api/gdpr/erase` - GDPR erasure

### New Services
- Bounce handling with suppression
- Reply detection with auto-pause
- Segment reconciliation
- Full audit traceback
- Enhanced HubSpot integration
- Email tracking
- Monitoring & alerts

---

## 📚 Full Documentation

- **Deployment**: `DEPLOYMENT_COMPLETE.md`
- **Implementation**: `FINAL_IMPLEMENTATION_SUMMARY.md`
- **Compliance**: `docs/COMPLIANCE_GDPR_CANSPAM.md`

---

**🎉 System is ready!**
