-- Enterprise Functions for HingeCraft Database
-- High-performance, enterprise-grade functions

-- ============================================
-- PERFORMANCE FUNCTIONS
-- ============================================

-- Refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS TABLE(view_name TEXT, refreshed_at TIMESTAMPTZ) AS $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', view_record.matviewname);
        RETURN QUERY SELECT view_record.matviewname::TEXT, NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_materialized_views() IS 'Refresh all materialized views concurrently';

-- ============================================
-- PARTITIONING FUNCTIONS
-- ============================================

-- Create monthly partition for a table
CREATE OR REPLACE FUNCTION create_monthly_partition(
    parent_table TEXT,
    partition_date DATE
)
RETURNS TEXT AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := date_trunc('month', partition_date);
    end_date := start_date + INTERVAL '1 month';
    partition_name := parent_table || '_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        parent_table,
        start_date,
        end_date
    );
    
    RETURN partition_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_monthly_partition(TEXT, DATE) IS 'Create monthly partition for a table';

-- ============================================
-- FULL-TEXT SEARCH FUNCTIONS
-- ============================================

-- Search across multiple tables
CREATE OR REPLACE FUNCTION fulltext_search(
    search_query TEXT,
    table_names TEXT[] DEFAULT ARRAY['content_articles', 'design_projects', 'learning_courses']
)
RETURNS TABLE(
    table_name TEXT,
    record_id UUID,
    title TEXT,
    relevance REAL,
    snippet TEXT
) AS $$
DECLARE
    table_name TEXT;
    sql_query TEXT;
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        sql_query := format('
            SELECT 
                %L::TEXT as table_name,
                id::UUID as record_id,
                COALESCE(title, name, display_name)::TEXT as title,
                ts_rank_cd(
                    to_tsvector(''english'', COALESCE(title, '''') || '' '' || COALESCE(description, '''') || '' '' || COALESCE(content, '''')),
                    plainto_tsquery(''english'', %L)
                )::REAL as relevance,
                ts_headline(''english'', COALESCE(content, description, title), plainto_tsquery(''english'', %L))::TEXT as snippet
            FROM %I
            WHERE to_tsvector(''english'', COALESCE(title, '''') || '' '' || COALESCE(description, '''') || '' '' || COALESCE(content, ''''))
                @@ plainto_tsquery(''english'', %L)
            ORDER BY relevance DESC
            LIMIT 10
        ', table_name, search_query, search_query, search_query, table_name, search_query);
        
        RETURN QUERY EXECUTE sql_query;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fulltext_search(TEXT, TEXT[]) IS 'Full-text search across multiple tables';

-- ============================================
-- CACHING FUNCTIONS
-- ============================================

-- Get cached value with TTL
CREATE OR REPLACE FUNCTION get_cached_value(
    cache_key TEXT,
    ttl_seconds INTEGER DEFAULT 3600
)
RETURNS JSONB AS $$
DECLARE
    cached_data JSONB;
    cached_at TIMESTAMPTZ;
BEGIN
    -- This would integrate with Redis in production
    -- For now, return NULL to indicate cache miss
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cached_value(TEXT, INTEGER) IS 'Get cached value (Redis integration placeholder)';

-- Set cached value
CREATE OR REPLACE FUNCTION set_cached_value(
    cache_key TEXT,
    cache_value JSONB,
    ttl_seconds INTEGER DEFAULT 3600
)
RETURNS BOOLEAN AS $$
BEGIN
    -- This would integrate with Redis in production
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_cached_value(TEXT, JSONB, INTEGER) IS 'Set cached value (Redis integration placeholder)';

