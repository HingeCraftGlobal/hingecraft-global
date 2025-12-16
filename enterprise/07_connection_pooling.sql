-- Component 7: Connection Pooling & Load Balancing
-- Oracle-Level Connection Management

-- ============================================
-- CONNECTION STATISTICS VIEWS
-- ============================================

-- View: Active connections by database
CREATE OR REPLACE VIEW v_connection_stats AS
SELECT
    datname,
    COUNT(*) as total_connections,
    COUNT(*) FILTER (WHERE state = 'active') as active_connections,
    COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
    COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
    MAX(EXTRACT(EPOCH FROM (now() - state_change))) as max_idle_seconds
FROM pg_stat_activity
WHERE datname IS NOT NULL
GROUP BY datname;

-- View: Connection by application
CREATE OR REPLACE VIEW v_connection_by_app AS
SELECT
    application_name,
    COUNT(*) as connection_count,
    COUNT(*) FILTER (WHERE state = 'active') as active_count,
    MAX(EXTRACT(EPOCH FROM (now() - backend_start))) as max_connection_age_seconds
FROM pg_stat_activity
WHERE application_name IS NOT NULL
GROUP BY application_name
ORDER BY connection_count DESC;

-- View: Long-running queries
CREATE OR REPLACE VIEW v_long_running_queries AS
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    EXTRACT(EPOCH FROM (now() - query_start)) as query_duration_seconds,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE state != 'idle'
AND query_start IS NOT NULL
AND EXTRACT(EPOCH FROM (now() - query_start)) > 5
ORDER BY query_start;

-- ============================================
-- CONNECTION MANAGEMENT FUNCTIONS
-- ============================================

-- Function: Kill idle connections
CREATE OR REPLACE FUNCTION kill_idle_connections(idle_seconds INTEGER DEFAULT 3600)
RETURNS TABLE(pid INTEGER, killed BOOLEAN) AS $$
DECLARE
    conn_record RECORD;
BEGIN
    FOR conn_record IN
        SELECT pid
        FROM pg_stat_activity
        WHERE state = 'idle'
        AND state_change < now() - (idle_seconds || ' seconds')::INTERVAL
        AND pid != pg_backend_pid()
    LOOP
        BEGIN
            PERFORM pg_terminate_backend(conn_record.pid);
            RETURN QUERY SELECT conn_record.pid, true;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT conn_record.pid, false;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Get connection pool statistics
CREATE OR REPLACE FUNCTION get_connection_pool_stats()
RETURNS TABLE(
    max_connections INTEGER,
    current_connections INTEGER,
    available_connections INTEGER,
    connection_usage_percent NUMERIC
) AS $$
DECLARE
    max_conns INTEGER;
    current_conns INTEGER;
BEGIN
    SELECT setting::INTEGER INTO max_conns FROM pg_settings WHERE name = 'max_connections';
    SELECT COUNT(*) INTO current_conns FROM pg_stat_activity;
    
    RETURN QUERY SELECT
        max_conns,
        current_conns,
        max_conns - current_conns,
        ROUND((current_conns::NUMERIC / max_conns::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON VIEW v_connection_stats IS 'Monitor database connections';
COMMENT ON VIEW v_connection_by_app IS 'Monitor connections by application';
COMMENT ON VIEW v_long_running_queries IS 'Identify long-running queries';
COMMENT ON FUNCTION kill_idle_connections IS 'Kill idle connections older than specified seconds';
COMMENT ON FUNCTION get_connection_pool_stats IS 'Get connection pool statistics';







