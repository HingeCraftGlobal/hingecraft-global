-- ============================================================================
-- HINGECRAFT GLOBAL - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This file contains the complete database schema for HingeCraft Global
-- All database components are consolidated here for easy deployment
-- 
-- Generated: $(date)
-- Location: database/HINGECRAFT_COMPLETE_DATABASE.sql
-- ============================================================================

-- Master Schema
\i master_schema/00_master_schema_init.sql
\i master_schema/00_helper_functions.sql
\i master_schema/00_domain_functions.sql
\i master_schema/00_trigger_functions.sql
\i master_schema/00_views.sql
\i master_schema/00_additional_views.sql
\i master_schema/01_core_extensions.sql
\i master_schema/02_users_identity.sql
\i master_schema/03_design_metadata.sql
\i master_schema/04_community_activity.sql
\i master_schema/05_microfactory_integrations.sql
\i master_schema/06_content_contributions.sql
\i master_schema/07_environmental_impact.sql
\i master_schema/08_crypto_treasury.sql
\i master_schema/09_learning_skills.sql
\i master_schema/10_webhooks_assets_prompts.sql

-- Security
\i security/00_security_functions.sql
\i security/01_encryption_at_rest.sql
\i security/02_encryption_in_transit.sql
\i security/03_access_control.sql
\i security/04_intrusion_detection.sql
\i security/05_audit_logging.sql
\i security/06_data_loss_prevention.sql
\i security/07_vulnerability_management.sql
\i security/08_network_security.sql
\i security/09_incident_response.sql
\i security/10_security_monitoring.sql

-- Security Nano Modules
\i security/nano/01_rate_limiter.sql
\i security/nano/02_query_inspector.sql
\i security/nano/03_credential_guard.sql
\i security/nano/04_session_guard.sql
\i security/nano/05_data_guardian.sql
\i security/nano/06_threat_hunter.sql

-- Enterprise
\i enterprise/00_enterprise_functions.sql
\i enterprise/01_advanced_indexing.sql
\i enterprise/02_partitioning.sql
\i enterprise/03_materialized_views.sql
\i enterprise/04_fulltext_search.sql
\i enterprise/05_rbac_security.sql
\i enterprise/06_replication_ha.sql
\i enterprise/07_connection_pooling.sql
\i enterprise/08_query_monitoring.sql
\i enterprise/09_backup_recovery.sql
\i enterprise/10_caching_layer.sql

-- Governance
\i governance/00_governance_functions.sql
\i governance/01_rbac_permissions.sql
\i governance/02_access_rules.sql
\i governance/03_audit_compliance.sql

-- RAG Knowledge Base
\i rag_knowledge_base/00_rag_functions.sql
\i rag_knowledge_base/01_rag_schema.sql

-- Automation
\i automation/schema.sql
\i automation/init-data.sql
\i automation/migrate-existing-data.sql

-- Complete Schema
\i complete_schema.sql

-- Insert All Data
\i insert_all_hingecraft_data.sql

-- ============================================================================
-- END OF HINGECRAFT COMPLETE DATABASE
-- ============================================================================
