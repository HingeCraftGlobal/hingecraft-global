-- HingeCraft Master Schema - Complete Multi-Layer Data Model
-- Custom-built database with full control over schema/queries
-- Extensible & modular with JSONB extension points
-- Secure & compliant with app-layer encryption

-- This file orchestrates the entire master schema creation
-- Run this after core_extensions.sql

\echo 'Creating Master Schema - Multi-Layer Data Model...'

-- Load all schema components in order
\i 01_core_extensions.sql
\i 02_users_identity.sql
\i 03_design_metadata.sql
\i 04_community_activity.sql
\i 05_microfactory_integrations.sql
\i 06_content_contributions.sql
\i 07_environmental_impact.sql
\i 08_crypto_treasury.sql
\i 09_learning_skills.sql
\i 10_webhooks_assets_prompts.sql

\echo 'Master Schema creation complete!'



