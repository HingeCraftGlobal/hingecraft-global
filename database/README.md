# HingeCraft Global - Complete Database

This directory contains the **complete database** for HingeCraft Global, including all schemas, security modules, enterprise features, and data.

## 📁 Directory Structure

```
database/
├── HINGECRAFT_COMPLETE_DATABASE.sql    # Master file - includes all components
├── complete_schema.sql                  # Complete schema definition
├── init.sql                            # Database initialization
├── insert_all_hingecraft_data.sql      # All HingeCraft data inserts
│
├── master_schema/                       # Core database schema (10 layers)
│   ├── 00_master_schema_init.sql
│   ├── 00_helper_functions.sql
│   ├── 00_domain_functions.sql
│   ├── 00_trigger_functions.sql
│   ├── 00_views.sql
│   ├── 00_additional_views.sql
│   ├── 01_core_extensions.sql
│   ├── 02_users_identity.sql
│   ├── 03_design_metadata.sql
│   ├── 04_community_activity.sql
│   ├── 05_microfactory_integrations.sql
│   ├── 06_content_contributions.sql
│   ├── 07_environmental_impact.sql
│   ├── 08_crypto_treasury.sql
│   ├── 09_learning_skills.sql
│   └── 10_webhooks_assets_prompts.sql
│
├── security/                            # Security modules (16 components)
│   ├── 00_security_functions.sql
│   ├── 01_encryption_at_rest.sql
│   ├── 02_encryption_in_transit.sql
│   ├── 03_access_control.sql
│   ├── 04_intrusion_detection.sql
│   ├── 05_audit_logging.sql
│   ├── 06_data_loss_prevention.sql
│   ├── 07_vulnerability_management.sql
│   ├── 08_network_security.sql
│   ├── 09_incident_response.sql
│   ├── 10_security_monitoring.sql
│   └── nano/                            # Nano security modules
│       ├── 01_rate_limiter.sql
│       ├── 02_query_inspector.sql
│       ├── 03_credential_guard.sql
│       ├── 04_session_guard.sql
│       ├── 05_data_guardian.sql
│       └── 06_threat_hunter.sql
│
├── enterprise/                          # Enterprise features (11 modules)
│   ├── 00_enterprise_functions.sql
│   ├── 01_advanced_indexing.sql
│   ├── 02_partitioning.sql
│   ├── 03_materialized_views.sql
│   ├── 04_fulltext_search.sql
│   ├── 05_rbac_security.sql
│   ├── 06_replication_ha.sql
│   ├── 07_connection_pooling.sql
│   ├── 08_query_monitoring.sql
│   ├── 09_backup_recovery.sql
│   └── 10_caching_layer.sql
│
├── governance/                          # Governance & RBAC (4 modules)
│   ├── 00_governance_functions.sql
│   ├── 01_rbac_permissions.sql
│   ├── 02_access_rules.sql
│   └── 03_audit_compliance.sql
│
├── rag_knowledge_base/                  # RAG integration (2 modules)
│   ├── 00_rag_functions.sql
│   └── 01_rag_schema.sql
│
├── automation/                          # Automation pipeline database
│   ├── schema.sql
│   ├── init-data.sql
│   ├── migrate-existing-data.sql
│   └── setup.js
│
├── consolidated/                        # Consolidated files
│   ├── schema_init.sql                  # Schema initialization
│   └── hingecraft_database_data.json    # Complete data export
│
├── deployments/                         # Deployment-specific files
│   ├── deployment_ready_init.sql       # Deployment-ready init
│   └── wix_deployment_init.sql          # Wix deployment init
│
└── api/                                 # API database connections
    └── database_connection.py           # Database connection utilities
```

## 🚀 Quick Start

### Option 1: Use Complete Database File
```bash
# Run the complete database file (includes everything)
psql -U hingecraft_user -d hingecraft_db -f database/HINGECRAFT_COMPLETE_DATABASE.sql
```

### Option 2: Initialize Step by Step
```bash
# 1. Initialize database
psql -U hingecraft_user -d hingecraft_db -f database/init.sql

# 2. Run master schema
psql -U hingecraft_user -d hingecraft_db -f database/master_schema/00_master_schema_init.sql

# 3. Add security
psql -U hingecraft_user -d hingecraft_db -f database/security/00_security_functions.sql

# 4. Add enterprise features
psql -U hingecraft_user -d hingecraft_db -f database/enterprise/00_enterprise_functions.sql

# 5. Insert data
psql -U hingecraft_user -d hingecraft_db -f database/insert_all_hingecraft_data.sql
```

## 📊 Database Components

### Master Schema (10 Layers)
- Core extensions and helper functions
- Users and identity management
- Design metadata
- Community activity tracking
- Microfactory integrations
- Content contributions
- Environmental impact
- Crypto treasury
- Learning and skills
- Webhooks, assets, and prompts

### Security (16 Components)
- Encryption at rest and in transit
- Access control and RBAC
- Intrusion detection
- Audit logging
- Data loss prevention
- Vulnerability management
- Network security
- Incident response
- Security monitoring
- 6 Nano security modules

### Enterprise (11 Modules)
- Advanced indexing
- Partitioning
- Materialized views
- Full-text search
- RBAC security
- Replication and HA
- Connection pooling
- Query monitoring
- Backup and recovery
- Caching layer

### Governance (4 Modules)
- Governance functions
- RBAC permissions
- Access rules
- Audit compliance

### RAG Knowledge Base (2 Modules)
- RAG functions
- RAG schema

## 🔧 Database Connection

**PostgreSQL Configuration:**
- **Host:** localhost (Docker) / postgres (container)
- **Port:** 5432
- **Database:** `hingecraft`
- **User:** `hcuser`
- **Password:** `hcpass`
- **Connection String:** `postgresql://hcuser:hcpass@localhost:5432/hingecraft`

## 📦 Docker Setup

The database runs in Docker. See `docker-compose.yml` in the root directory.

```bash
# Start database
docker-compose up -d postgres

# Access database
docker-compose exec postgres psql -U hcuser -d hingecraft
```

## 📝 Data Files

- **CSV Imports:** `registry_import.csv`, `registry_wix_import.csv`, `donations_export.csv`
- **JSON Exports:** `COMPLETE_DATABASE_EXPORT.json`, `hingecraft_database_data.json`
- **Data Scripts:** `insert_all_hingecraft_data.sql`

## 🔐 Security Notes

- All `.env` files are excluded from git
- Use environment variables for database credentials
- Never commit sensitive data
- See `.gitignore` for excluded files

## 📚 Additional Resources

- **Build Scripts:** `GENERATE_*.py`, `RUN_*.py`, `BUILD_*.py`
- **Documentation:** `*_SUMMARY.md`, `*_ROADMAP.md`, `*_VERIFICATION.md`
- **Blueprints:** `*_BLUEPRINT.json`
- **Troubleshooting:** `DATABASE_TROUBLESHOOTING_*.json`, `TROUBLESHOOTING_RESULTS.json`

## ✅ Verification

All database files are tracked in git:
- **62 SQL files** tracked
- **5 Docker files** tracked
- **All database components** verified and committed

---

**Last Updated:** December 15, 2024  
**Status:** ✅ All database files consolidated and organized



