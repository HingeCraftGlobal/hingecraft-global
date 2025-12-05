-- Component 3: Materialized Views & Aggregations
-- Oracle-Level Materialized Views for Analytics

-- ============================================
-- MEMBER STATISTICS MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_member_statistics AS
SELECT
    country,
    COUNT(*) as total_members,
    COUNT(DISTINCT region) as regions_count,
    COUNT(DISTINCT city) as cities_count,
    MIN("_createdDate") as first_member_date,
    MAX("_createdDate") as latest_member_date,
    COUNT(CASE WHEN twin_name IS NOT NULL AND twin_name != '' THEN 1 END) as members_with_twins
FROM members
GROUP BY country;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_member_statistics_country 
ON mv_member_statistics(country);

-- ============================================
-- DONATION SUMMARY MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_donation_summary AS
SELECT
    DATE_TRUNC('month', "_createdDate") as donation_month,
    payment_status,
    currency,
    COUNT(*) as donation_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount,
    COUNT(DISTINCT member_email) as unique_donors
FROM donations
GROUP BY DATE_TRUNC('month', "_createdDate"), payment_status, currency;

CREATE INDEX IF NOT EXISTS idx_mv_donation_summary_month 
ON mv_donation_summary(donation_month DESC, payment_status);

-- ============================================
-- CHAT CLUBS ACTIVITY MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_chat_clubs_activity AS
SELECT
    cc.club_name,
    cc.category,
    cc.member_count,
    cc.status,
    COUNT(cm."_id") as total_messages,
    COUNT(DISTINCT cm.member_name) as active_members,
    MAX(cm."_createdDate") as last_message_date,
    MIN(cm."_createdDate") as first_message_date
FROM chat_clubs cc
LEFT JOIN chat_messages cm ON cm.room = cc.club_name
GROUP BY cc.club_name, cc.category, cc.member_count, cc.status;

CREATE INDEX IF NOT EXISTS idx_mv_chat_clubs_activity_club 
ON mv_chat_clubs_activity(club_name);

-- ============================================
-- MEMBER ACTIVITY TIMELINE MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_member_activity_timeline AS
SELECT
    DATE_TRUNC('day', "_createdDate") as activity_date,
    'member_signup' as activity_type,
    country,
    COUNT(*) as activity_count
FROM members
GROUP BY DATE_TRUNC('day', "_createdDate"), country

UNION ALL

SELECT
    DATE_TRUNC('day', "_createdDate") as activity_date,
    'donation' as activity_type,
    'All' as country,
    COUNT(*) as activity_count
FROM donations
GROUP BY DATE_TRUNC('day', "_createdDate")

UNION ALL

SELECT
    DATE_TRUNC('day', "_createdDate") as activity_date,
    'chat_message' as activity_type,
    country,
    COUNT(*) as activity_count
FROM chat_messages
WHERE country IS NOT NULL
GROUP BY DATE_TRUNC('day', "_createdDate"), country;

CREATE INDEX IF NOT EXISTS idx_mv_member_activity_timeline_date 
ON mv_member_activity_timeline(activity_date DESC);

-- ============================================
-- REFRESH FUNCTIONS
-- ============================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_member_statistics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_donation_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_chat_clubs_activity;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_member_activity_timeline;
    RAISE NOTICE 'All materialized views refreshed';
END;
$$ LANGUAGE plpgsql;

-- Function to refresh specific materialized view
CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name TEXT)
RETURNS void AS $$
BEGIN
    EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', view_name);
    RAISE NOTICE 'Refreshed materialized view: %', view_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTOMATED REFRESH SCHEDULE (via pg_cron)
-- ============================================

-- Note: Requires pg_cron extension
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily refresh at 2 AM
-- SELECT cron.schedule('refresh-materialized-views', '0 2 * * *', 
--     'SELECT refresh_all_materialized_views();');

-- ============================================
-- MATERIALIZED VIEW MONITORING
-- ============================================

CREATE OR REPLACE VIEW v_materialized_view_info AS
SELECT
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size,
    pg_total_relation_size(schemaname||'.'||matviewname) AS size_bytes,
    (SELECT COUNT(*) FROM pg_stat_user_tables WHERE relname = matviewname) AS row_count
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||matviewname) DESC;

COMMENT ON VIEW v_materialized_view_info IS 'Monitor materialized view sizes and row counts';

