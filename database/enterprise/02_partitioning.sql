-- Component 2: Partitioning & Sharding
-- Oracle-Level Partitioning Strategy

-- ============================================
-- PARTITION MEMBERS BY COUNTRY
-- ============================================

-- Create partitioned table structure
CREATE TABLE IF NOT EXISTS members_partitioned (
    LIKE members INCLUDING ALL
) PARTITION BY LIST (country);

-- Create partitions for major countries
CREATE TABLE IF NOT EXISTS members_australia PARTITION OF members_partitioned
    FOR VALUES IN ('Australia');

CREATE TABLE IF NOT EXISTS members_usa PARTITION OF members_partitioned
    FOR VALUES IN ('United States', 'U.S.');

CREATE TABLE IF NOT EXISTS members_canada PARTITION OF members_partitioned
    FOR VALUES IN ('Canada');

CREATE TABLE IF NOT EXISTS members_uk PARTITION OF members_partitioned
    FOR VALUES IN ('United Kingdom', 'UK');

CREATE TABLE IF NOT EXISTS members_other PARTITION OF members_partitioned
    DEFAULT;

-- ============================================
-- PARTITION DONATIONS BY DATE (Monthly)
-- ============================================

CREATE TABLE IF NOT EXISTS donations_partitioned (
    LIKE donations INCLUDING ALL
) PARTITION BY RANGE ("_createdDate");

-- Create monthly partitions for current and future months
CREATE TABLE IF NOT EXISTS donations_2024_q4 PARTITION OF donations_partitioned
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

CREATE TABLE IF NOT EXISTS donations_2025_q1 PARTITION OF donations_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE IF NOT EXISTS donations_2025_q2 PARTITION OF donations_partitioned
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS donations_2025_q3 PARTITION OF donations_partitioned
    FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');

CREATE TABLE IF NOT EXISTS donations_2025_q4 PARTITION OF donations_partitioned
    FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');

-- ============================================
-- PARTITION CHAT MESSAGES BY DATE (Weekly)
-- ============================================

CREATE TABLE IF NOT EXISTS chat_messages_partitioned (
    LIKE chat_messages INCLUDING ALL
) PARTITION BY RANGE ("_createdDate");

-- Create weekly partitions for last 12 weeks
DO $$
DECLARE
    week_start DATE;
    week_end DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..11 LOOP
        week_start := DATE_TRUNC('week', CURRENT_DATE - (i * INTERVAL '1 week'));
        week_end := week_start + INTERVAL '1 week';
        partition_name := 'chat_messages_' || TO_CHAR(week_start, 'YYYY_MM_DD');
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF chat_messages_partitioned
            FOR VALUES FROM (%L) TO (%L)',
            partition_name, week_start, week_end);
    END LOOP;
END $$;

-- ============================================
-- PARTITION MANAGEMENT FUNCTIONS
-- ============================================

-- Function to create next month's donation partition
CREATE OR REPLACE FUNCTION create_next_donation_partition()
RETURNS void AS $$
DECLARE
    next_month_start DATE;
    next_month_end DATE;
    partition_name TEXT;
BEGIN
    next_month_start := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    next_month_end := next_month_start + INTERVAL '1 month';
    partition_name := 'donations_' || TO_CHAR(next_month_start, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF donations_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, next_month_start, next_month_end);
    
    RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to drop old partitions (older than retention period)
CREATE OR REPLACE FUNCTION drop_old_partitions(retention_months INTEGER DEFAULT 12)
RETURNS void AS $$
DECLARE
    partition_record RECORD;
    cutoff_date DATE;
BEGIN
    cutoff_date := CURRENT_DATE - (retention_months || ' months')::INTERVAL;
    
    FOR partition_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename LIKE 'donations_%'
        AND tablename != 'donations_partitioned'
    LOOP
        -- Extract date from partition name and drop if old
        -- This is a simplified version - implement date extraction logic
        RAISE NOTICE 'Checking partition: %', partition_record.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTITION MONITORING VIEW
-- ============================================

CREATE OR REPLACE VIEW v_partition_info AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes,
    (SELECT COUNT(*) FROM pg_stat_user_tables WHERE relname = tablename) AS row_estimate
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%_partitioned' OR tablename LIKE '%_20%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

COMMENT ON VIEW v_partition_info IS 'Monitor partition sizes and usage';





