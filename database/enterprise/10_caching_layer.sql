-- Component 10: Caching Layer Integration
-- Oracle-Level Caching (Oracle In-Memory Database equivalent)

-- ============================================
-- CACHE METADATA TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS cache_metadata (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    collection_name VARCHAR(255) NOT NULL,
    cache_type VARCHAR(50) DEFAULT 'query_result', -- 'query_result', 'aggregation', 'full_collection'
    ttl_seconds INTEGER DEFAULT 3600,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hit_count INTEGER DEFAULT 0,
    size_bytes INTEGER,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_cache_metadata_key 
ON cache_metadata(cache_key);

CREATE INDEX IF NOT EXISTS idx_cache_metadata_collection 
ON cache_metadata(collection_name);

CREATE INDEX IF NOT EXISTS idx_cache_metadata_last_accessed 
ON cache_metadata(last_accessed DESC);

-- ============================================
-- CACHE MANAGEMENT FUNCTIONS
-- ============================================

-- Function: Record cache hit
CREATE OR REPLACE FUNCTION record_cache_hit(cache_key_param VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE cache_metadata
    SET 
        hit_count = hit_count + 1,
        last_accessed = CURRENT_TIMESTAMP
    WHERE cache_key = cache_key_param;
END;
$$ LANGUAGE plpgsql;

-- Function: Register cache entry
CREATE OR REPLACE FUNCTION register_cache_entry(
    p_cache_key VARCHAR,
    p_collection_name VARCHAR,
    p_cache_type VARCHAR DEFAULT 'query_result',
    p_ttl_seconds INTEGER DEFAULT 3600,
    p_size_bytes INTEGER DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO cache_metadata (
        cache_key, collection_name, cache_type, ttl_seconds, size_bytes
    ) VALUES (
        p_cache_key, p_collection_name, p_cache_type, p_ttl_seconds, p_size_bytes
    )
    ON CONFLICT (cache_key) DO UPDATE SET
        last_accessed = CURRENT_TIMESTAMP,
        hit_count = cache_metadata.hit_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Get expired cache keys
CREATE OR REPLACE FUNCTION get_expired_cache_keys()
RETURNS TABLE(cache_key VARCHAR, collection_name VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.cache_key,
        cm.collection_name
    FROM cache_metadata cm
    WHERE (CURRENT_TIMESTAMP - cm.last_accessed) > (cm.ttl_seconds || ' seconds')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function: Clear expired cache
CREATE OR REPLACE FUNCTION clear_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    cleared_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM cache_metadata
        WHERE (CURRENT_TIMESTAMP - last_accessed) > (ttl_seconds || ' seconds')::INTERVAL
        RETURNING *
    )
    SELECT COUNT(*) INTO cleared_count FROM deleted;
    
    RETURN cleared_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CACHE STATISTICS VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_cache_statistics AS
SELECT
    collection_name,
    COUNT(*) as total_cache_entries,
    SUM(hit_count) as total_hits,
    AVG(hit_count) as avg_hits_per_entry,
    SUM(size_bytes) as total_cache_size_bytes,
    COUNT(*) FILTER (WHERE (CURRENT_TIMESTAMP - last_accessed) > (ttl_seconds || ' seconds')::INTERVAL) as expired_entries
FROM cache_metadata
GROUP BY collection_name
ORDER BY total_hits DESC;

CREATE OR REPLACE VIEW v_cache_hit_ratio AS
SELECT
    collection_name,
    COUNT(*) as cache_entries,
    SUM(hit_count) as total_hits,
    MAX(last_accessed) as most_recent_access,
    MIN(last_accessed) as oldest_access
FROM cache_metadata
GROUP BY collection_name
ORDER BY total_hits DESC;

COMMENT ON TABLE cache_metadata IS 'Cache metadata and tracking for Redis/external cache';
COMMENT ON FUNCTION record_cache_hit IS 'Record a cache hit';
COMMENT ON FUNCTION register_cache_entry IS 'Register a new cache entry';
COMMENT ON FUNCTION get_expired_cache_keys IS 'Get expired cache keys for cleanup';
COMMENT ON FUNCTION clear_expired_cache IS 'Clear expired cache entries';
COMMENT ON VIEW v_cache_statistics IS 'Cache statistics by collection';


