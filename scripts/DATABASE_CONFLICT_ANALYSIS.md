# Database Conflict Analysis & Resolution

## 🔍 Current Situation Analysis

### Found Docker Setups:
1. **Root `docker-compose.yml`**: PostgreSQL for chat system
   - Port: 5432
   - Database: `hingecraft_chat`
   - User: `hingecraft`
   - Purpose: Chat/messaging system

2. **ML Automation `docker-compose.yml`**: PostgreSQL for automation
   - Port: 7543 (external)
   - Database: `hingecraft_automation`
   - User: `hingecraft_user`
   - Purpose: ML automation system

### Wix Database System:
- **Wix uses `wixData` API** - NOT direct database connections
- Collections: `Donations`, `CryptoPayments`, `StripePayments`, `ContributionIntent`
- Access via: `wixData.query()`, `wixData.insert()`, etc.
- **NO direct SQL/MongoDB access from Wix Velo code**

### Conflict Identified:
The extraction scripts I created assume:
- Direct MongoDB connection (`mongodb://localhost:27017/hingecraft`)
- Direct PostgreSQL connection (via `psql`)
- But Wix payment data is in **Wix's managed database**, not Docker

---

## ❓ Critical Questions (Please Answer)

### Question 1: Where is the payment data stored?
- [ ] **A)** Wix managed database (via wixData API) - **This is what Wix uses**
- [ ] **B)** Local Docker PostgreSQL database
- [ ] **C)** Local MongoDB database
- [ ] **D)** External database (cloud-hosted)
- [ ] **E)** Multiple locations (sync between Wix and local)

### Question 2: Do you have a local copy/sync of Wix payment data?
- [ ] **A)** Yes, I sync Wix data to local Docker PostgreSQL
- [ ] **B)** Yes, I sync Wix data to local MongoDB
- [ ] **C)** No, payment data only exists in Wix
- [ ] **D)** I want to set up a sync

### Question 3: Which database should the extraction scripts target?
- [ ] **A)** Wix database (via wixData API - requires different approach)
- [ ] **B)** Docker PostgreSQL (port 7543, `hingecraft_automation`)
- [ ] **C)** Docker PostgreSQL (port 5432, `hingecraft_chat`)
- [ ] **D)** MongoDB (if you have one running)
- [ ] **E)** Create new Docker container for payment data

### Question 4: What is the purpose of extracting payment URLs?
- [ ] **A)** Populate `payment-currency-map.json` for the currency router
- [ ] **B)** Backup/archive payment data
- [ ] **C)** Migrate from Wix to local database
- [ ] **D)** Reconcile payment records
- [ ] **E)** Other: _______________

### Question 5: Do the Docker databases contain payment data?
- [ ] **A)** Yes, `hingecraft_automation` has payment tables
- [ ] **B)** Yes, `hingecraft_chat` has payment tables
- [ ] **C)** No, Docker databases are for other systems only
- [ ] **D)** I'm not sure

---

## 🔧 Proposed Solutions

### Solution A: Wix-Only Approach (Most Likely)
If payment data only exists in Wix:
- **Remove** direct database connection scripts
- **Create** Wix Velo functions to export data via wixData API
- **Update** extraction scripts to call Wix functions instead

### Solution B: Docker Sync Approach
If you sync Wix data to Docker:
- **Update** extraction scripts to connect to correct Docker database
- **Verify** database schema matches Wix collections
- **Add** connection details from docker-compose.yml

### Solution C: Hybrid Approach
If you want both:
- **Keep** Wix extraction functions (for live data)
- **Add** Docker extraction scripts (for local backup)
- **Document** which to use when

---

## 🚨 Immediate Actions Needed

1. **Answer the 5 questions above**
2. **Verify** which database contains payment data
3. **Decide** on extraction approach (Wix API vs direct DB)
4. **Update** scripts accordingly
5. **Test** extraction with your actual setup

---

## 📝 Next Steps After Answers

Once you answer the questions, I will:
1. Update extraction scripts to match your setup
2. Remove conflicting assumptions
3. Create Wix Velo export functions (if needed)
4. Update documentation
5. Test with your actual database configuration

---

**Status**: ⏸️ **WAITING FOR YOUR ANSWERS**
