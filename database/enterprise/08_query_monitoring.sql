-- Component 8: Query Performance Monitoring
-- Oracle-Level Performance Monitoring (AWR equivalent)

-- ============================================
-- ENABLE QUERY STATISTICS
-- ============================================

-- Enable pg_stat_statements extension (requires superuser)
-- Run this manually: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================
-- QUERY PERFORMANCE VIEWS
-- ============================================

-- View: Top slow queries
CREATE OR REPLACE VIEW v_top_slow_queries AS
SELECT
    LEFT(query, 100) as query_preview,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    min_exec_time,
    stddev_exec_time,
    rows,
    100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- Queries taking > 100ms on average
ORDER BY mean_exec_time DESC
LIMIT 50;

-- View: Most frequently executed queries
CREATE OR REPLACE VIEW v_most_frequent_queries AS
SELECT
    LEFT(query, 100) as query_preview,
    calls,
    total_exec_time,
    mean_exec_time,
    (total_exec_time / SUM(total_exec_time) OVER ()) * 100 as percent_total_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 50;

-- View: Queries by table
CREATE OR REPLACE VIEW v_queries_by_table AS
SELECT
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    seq_tup_read as sequential_tuples_read,
    idx_scan as index_scans,
    idx_tup_fetch as index_tuples_fetched,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY seq_scan + idx_scan DESC;

-- View: Index usage statistics
CREATE OR REPLACE VIEW v_index_usage_stats AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================

-- Function: Reset query statistics
CREATE OR REPLACE FUNCTION reset_query_statistics()
RETURNS void AS $$
BEGIN
    PERFORM pg_stat_statements_reset();
    RAISE NOTICE 'Query statistics reset';
END;
$$ LANGUAGE plpgsql;

-- Function: Get table bloat information
CREATE OR REPLACE FUNCTION get_table_bloat()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    table_size TEXT,
    bloat_size TEXT,
    bloat_percent NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.schemaname::TEXT,
        t.tablename::TEXT,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))::TEXT,
        pg_size_pretty(
            (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename))
        )::TEXT,
        ROUND(
            ((pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename))::NUMERIC /
            NULLIF(pg_total_relation_size(schemaname||'.'||tablename), 0)) * 100,
            2
        )
    FROM pg_tables t
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON VIEW v_top_slow_queries IS 'Top slow queries for optimization';
COMMENT ON VIEW v_most_frequent_queries IS 'Most frequently executed queries';
COMMENT ON VIEW v_queries_by_table IS 'Query statistics by table';
COMMENT ON VIEW v_index_usage_stats IS 'Index usage statistics';

