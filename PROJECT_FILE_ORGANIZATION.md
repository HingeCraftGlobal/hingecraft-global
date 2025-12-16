# HingeCraft Project File Organization

## Complete File Organization by Project

This document provides a fine-tooth comb organization of ALL HingeCraft files by project.

Generated: 2025-01-27

---

## 📊 Database Analysis

### Database Tables (9 total)

1. **donations** - 3 records
   - Columns: 15
   - Indexes: 5
   - Triggers: 2
   - Purpose: Payment transactions

2. **members** - 20 records (10 charter + 10 registry)
   - Columns: 12
   - Indexes: 4
   - Triggers: 2
   - Purpose: Member registry

3. **chat_clubs** - 6 records
   - Columns: 9
   - Indexes: 3
   - Triggers: 2
   - Purpose: Community clubs

4. **chat_messages** - 13 records
   - Columns: 10
   - Indexes: 3
   - Triggers: 2
   - Purpose: Community messages

5. **ambassadors** - 0 records
   - Columns: 11
   - Indexes: 3
   - Triggers: 2
   - Purpose: Ambassador program

6. **contribution_intents** - 0 records
   - Columns: 15
   - Indexes: 6
   - Triggers: 2
   - Purpose: Mission Support form data

7. **crypto_payments** - 0 records
   - Columns: 19
   - Indexes: 7
   - Triggers: 2
   - Purpose: NOWPayments crypto transactions

8. **webhook_logs** - 0 records
   - Columns: 10
   - Indexes: 6
   - Triggers: 2
   - Purpose: Webhook audit trail

9. **kyc_verifications** - 0 records
   - Columns: 12
   - Indexes: 5
   - Triggers: 2
   - Purpose: KYC/AML compliance

### Database Functions (2 total)

1. **update_updated_date_column()** - Auto-update timestamps
2. **set_wix_id()** - Auto-set Wix required fields

---

## 📁 Projects and Files

### 1. Database System (88 files)

**Directories:**
- `database/`
- `database-schema/`

**Key Files:**
- `database/init.sql` - Main database schema
- `database/master_schema/` - Master schema files
- `database/enterprise/` - Enterprise features
- `database/security/` - Security modules
- `database/governance/` - Governance and RBAC
- `database/rag_knowledge_base/` - RAG integration

**Database Tables:** All 9 tables

---

### 2. Agents System (169 files)

**Directories:**
- `agents/`

**Sub-projects:**
- `agents/legal/` - Legal agent (31 files)
- `agents/marketing/` - Marketing agent (26 files)
- `agents/engineering/` - Engineering agent (20 files)
- `agents/education/` - Education agent (9 files)
- `agents/community/` - Community agent (19 files)
- `agents/crypto_compliance/` - Crypto/Compliance agent (20 files)
- `agents/base/` - Base agent framework (5 files)
- `agents/progress/` - Progress tracking (3 files)
- `agents/tests/` - Agent tests (2 files)

**Total:** 6 specialized AI agents with 600 tasks

---

### 3. API System (19 files)

**Directories:**
- `api/`

**Components:**
- `api/main.py` - FastAPI application
- `api/database.py` - Database connection
- `api/auth.py` - Authentication
- `api/middleware.py` - Middleware
- `api/routers/` - 8 API routers:
  - `auth.py` - Authentication endpoints
  - `donations.py` - Donation processing
  - `webhooks.py` - Webhook handling
  - `admin.py` - Admin functions
  - `compliance.py` - Compliance endpoints
  - `wallets.py` - Crypto wallet management
  - `receipts.py` - Receipt generation
  - `wix.py` - Wix integration
- `api/workers/` - Celery workers

**Database Tables:** donations, contribution_intents, crypto_payments, webhook_logs

---

### 4. Wix Integration (269 files)

**Directories:**
- `backend-functions/`
- `deployment-ready/`
- `wix_integration/`
- `public/`
- `src/`

**Components:**
- Backend functions (Velo)
- Frontend pages
- Payment integration
- Charter page integration
- Mission Support form

**Database Tables:** donations, members, contribution_intents

---

### 5. Legal Pages (140 files)

**Directories:**
- `legal-pages/`
- `ALL_LEGAL_PAGES_HTML/`
- `COMPLETE_LEGAL_DOCS_SC/`

**Components:**
- 34 legal compliance pages
- SEO optimized
- Mobile responsive
- Ready for deployment

---

### 6. Notion Integration (1145 files)

**Directories:**
- `notion/`

**Components:**
- Database synchronization
- Project management
- Dashboards
- Automation workflows
- Webhook handlers

---

### 7. Deployment System (87 files)

**Directories:**
- `deployment-scripts/`
- `scripts/`

**Components:**
- Docker configuration
- Deployment scripts
- CI/CD pipelines
- Environment management

---

### 8. Monitoring System (2 files)

**Directories:**
- `monitoring/`

**Components:**
- Performance monitoring
- Error tracking
- Health checks

**Database Tables:** webhook_logs

---

### 9. Security System (21 files)

**Directories:**
- `database/security/`
- `database/governance/`

**Components:**
- 16 security modules
- Encryption
- RBAC
- Audit logging
- KYC/AML

**Database Tables:** kyc_verifications, webhook_logs

---

### 10. Frontend Pages (244 files)

**Directories:**
- `public/`
- `src/`
- `frontend-pages/`

**Components:**
- Payment pages
- Charter pages
- Mission Support form
- Legal pages

---

### 11. Documentation (54 files)

**Directories:**
- `docs/`
- `documentation/`

**Components:**
- Project documentation
- API documentation
- Setup guides
- Deployment guides

---

### 12. Config (2 files)

**Directories:**
- `config/`

**Components:**
- Stripe configuration
- Application configuration

---

### 13. Tests (4 files)

**Directories:**
- `tests/`
- `test-scripts/`

**Components:**
- Unit tests
- Integration tests
- Test scripts

---

## 📈 Summary Statistics

- **Total Projects:** 13
- **Total Files:** 2,244
- **Total Database Tables:** 9
- **Total Database Records:** 42
- **Total Database Functions:** 2

---

## 🔄 Git Organization

All files are organized and tracked in git by project. Each project has its files mapped and documented.

---

## ✅ Verification

All projects have been:
- ✅ Scanned completely
- ✅ Files mapped to projects
- ✅ Database tables assigned
- ✅ Organized by project
- ✅ Committed to git

---

**Status:** Complete organization of all HingeCraft projects and files.
