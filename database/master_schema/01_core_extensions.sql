-- Core Extensions for HingeCraft Master Schema
-- Custom-built database with full control

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "ltree"; -- For hierarchical data

COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation for primary keys';
COMMENT ON EXTENSION pgcrypto IS 'Cryptographic functions for encryption';
COMMENT ON EXTENSION "btree_gin" IS 'GIN indexes for JSONB and arrays';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy search';
COMMENT ON EXTENSION "ltree" IS 'Labeled tree paths for hierarchies';




