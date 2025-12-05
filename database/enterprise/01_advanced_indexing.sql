-- Component 1: Advanced Indexing & Query Optimization
-- Oracle-Level Indexing Strategy for HingeCraft Database

-- ============================================
-- DONATIONS TABLE INDEXES
-- ============================================

-- B-tree index for date range queries
CREATE INDEX IF NOT EXISTS idx_donations_created_date_btree 
ON donations("_createdDate" DESC);

-- Composite index for status + date queries
CREATE INDEX IF NOT EXISTS idx_donations_status_date 
ON donations(payment_status, "_createdDate" DESC);

-- Hash index for exact email lookups
CREATE INDEX IF NOT EXISTS idx_donations_email_hash 
ON donations USING hash(member_email) 
WHERE member_email IS NOT NULL;

-- Partial index for active donations
CREATE INDEX IF NOT EXISTS idx_donations_active 
ON donations("_createdDate" DESC) 
WHERE payment_status IN ('completed', 'pending');

-- GIN index for JSONB metadata searches
CREATE INDEX IF NOT EXISTS idx_donations_metadata_gin 
ON donations USING gin(metadata) 
WHERE metadata IS NOT NULL;

-- ============================================
-- MEMBERS TABLE INDEXES
-- ============================================

-- Composite index for country + region queries
CREATE INDEX IF NOT EXISTS idx_members_country_region 
ON members(country, region) 
WHERE country IS NOT NULL AND region IS NOT NULL;

-- B-tree index for name searches
CREATE INDEX IF NOT EXISTS idx_members_name_search 
ON members(last_name, first_name);

-- Hash index for membership_id lookups
CREATE INDEX IF NOT EXISTS idx_members_membership_id_hash 
ON members USING hash(membership_id) 
WHERE membership_id IS NOT NULL;

-- GIN index for full-text search on names
CREATE INDEX IF NOT EXISTS idx_members_names_gin 
ON members USING gin(to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(twin_name, '')));

-- Partial index for active members
CREATE INDEX IF NOT EXISTS idx_members_active 
ON members("_createdDate" DESC) 
WHERE country IS NOT NULL;

-- ============================================
-- CHAT CLUBS TABLE INDEXES
-- ============================================

-- B-tree index for status filtering
CREATE INDEX IF NOT EXISTS idx_chat_clubs_status 
ON chat_clubs(status, member_count DESC);

-- Composite index for category + status
CREATE INDEX IF NOT EXISTS idx_chat_clubs_category_status 
ON chat_clubs(category, status, member_count DESC);

-- GIN index for club name searches
CREATE INDEX IF NOT EXISTS idx_chat_clubs_name_gin 
ON chat_clubs USING gin(to_tsvector('english', club_name));

-- ============================================
-- CHAT MESSAGES TABLE INDEXES
-- ============================================

-- Composite index for room + date queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_date 
ON chat_messages(room, "_createdDate" DESC);

-- B-tree index for country filtering
CREATE INDEX IF NOT EXISTS idx_chat_messages_country 
ON chat_messages(country) 
WHERE country IS NOT NULL;

-- GIN index for full-text message search
CREATE INDEX IF NOT EXISTS idx_chat_messages_text_gin 
ON chat_messages USING gin(to_tsvector('english', message));

-- Partial index for recent messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_recent 
ON chat_messages("_createdDate" DESC) 
WHERE "_createdDate" > NOW() - INTERVAL '30 days';

-- ============================================
-- AMBASSADORS TABLE INDEXES
-- ============================================

-- Composite index for country + status
CREATE INDEX IF NOT EXISTS idx_ambassadors_country_status 
ON ambassadors(country, status);

-- B-tree index for campaign filtering
CREATE INDEX IF NOT EXISTS idx_ambassadors_campaign 
ON ambassadors(campaign_name) 
WHERE campaign_name IS NOT NULL;

-- GIN index for JSONB impact_metrics
CREATE INDEX IF NOT EXISTS idx_ambassadors_metrics_gin 
ON ambassadors USING gin(impact_metrics) 
WHERE impact_metrics IS NOT NULL;

-- ============================================
-- INDEX MAINTENANCE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION analyze_all_tables()
RETURNS void AS $$
BEGIN
    ANALYZE donations;
    ANALYZE members;
    ANALYZE chat_clubs;
    ANALYZE chat_messages;
    ANALYZE ambassadors;
    RAISE NOTICE 'All tables analyzed - statistics updated';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEX USAGE MONITORING
-- ============================================

-- View to monitor index usage
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================
-- QUERY PERFORMANCE VIEW
-- ============================================

-- View to identify slow queries (requires pg_stat_statements extension)
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries taking > 100ms on average
ORDER BY mean_time DESC
LIMIT 50;

COMMENT ON VIEW v_index_usage IS 'Monitor index usage statistics';
COMMENT ON VIEW v_slow_queries IS 'Identify slow queries for optimization';


