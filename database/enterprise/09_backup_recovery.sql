-- Component 9: Automated Backup & Point-in-Time Recovery
-- Oracle-Level Backup (RMAN equivalent)

-- ============================================
-- BACKUP METADATA TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS backup_metadata (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'wal'
    backup_path TEXT NOT NULL,
    backup_size_bytes BIGINT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'completed', 'failed', 'in_progress'
    wal_start_lsn TEXT,
    wal_end_lsn TEXT,
    checksum TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_backup_metadata_date 
ON backup_metadata("_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_backup_metadata_status 
ON backup_metadata(status);

-- ============================================
-- BACKUP FUNCTIONS
-- ============================================

-- Function: Record backup metadata
CREATE OR REPLACE FUNCTION record_backup(
    p_backup_type VARCHAR,
    p_backup_path TEXT,
    p_start_time TIMESTAMP,
    p_end_time TIMESTAMP,
    p_status VARCHAR,
    p_size_bytes BIGINT DEFAULT NULL,
    p_wal_start_lsn TEXT DEFAULT NULL,
    p_wal_end_lsn TEXT DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    backup_id VARCHAR;
BEGIN
    INSERT INTO backup_metadata (
        backup_type, backup_path, start_time, end_time, status,
        backup_size_bytes, wal_start_lsn, wal_end_lsn
    ) VALUES (
        p_backup_type, p_backup_path, p_start_time, p_end_time, p_status,
        p_size_bytes, p_wal_start_lsn, p_wal_end_lsn
    ) RETURNING "_id" INTO backup_id;
    
    RETURN backup_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get latest backup info
CREATE OR REPLACE FUNCTION get_latest_backup(backup_type_filter VARCHAR DEFAULT NULL)
RETURNS TABLE(
    "_id" VARCHAR,
    backup_type VARCHAR,
    backup_path TEXT,
    backup_size TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR,
    duration_seconds NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bm."_id",
        bm.backup_type,
        bm.backup_path,
        pg_size_pretty(bm.backup_size_bytes)::TEXT,
        bm.start_time,
        bm.end_time,
        bm.status,
        EXTRACT(EPOCH FROM (bm.end_time - bm.start_time))
    FROM backup_metadata bm
    WHERE (backup_type_filter IS NULL OR bm.backup_type = backup_type_filter)
    ORDER BY bm."_createdDate" DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RECOVERY POINT OBJECTIVES (RPO) VIEW
-- ============================================

CREATE OR REPLACE VIEW v_recovery_point_objectives AS
SELECT
    backup_type,
    COUNT(*) as backup_count,
    MAX(end_time) as latest_backup,
    MIN(end_time) as oldest_backup,
    EXTRACT(EPOCH FROM (NOW() - MAX(end_time))) / 3600 as hours_since_last_backup,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_backup_duration_seconds,
    SUM(backup_size_bytes) as total_backup_size_bytes
FROM backup_metadata
WHERE status = 'completed'
GROUP BY backup_type;

-- ============================================
-- BACKUP SCHEDULE VIEW
-- ============================================

CREATE OR REPLACE VIEW v_backup_schedule AS
SELECT
    backup_type,
    DATE_TRUNC('day', start_time) as backup_date,
    COUNT(*) as backups_per_day,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration_seconds,
    SUM(backup_size_bytes) as total_size_bytes
FROM backup_metadata
WHERE status = 'completed'
GROUP BY backup_type, DATE_TRUNC('day', start_time)
ORDER BY backup_date DESC;

COMMENT ON TABLE backup_metadata IS 'Backup metadata and tracking';
COMMENT ON FUNCTION record_backup IS 'Record backup operation metadata';
COMMENT ON FUNCTION get_latest_backup IS 'Get latest backup information';
COMMENT ON VIEW v_recovery_point_objectives IS 'Recovery Point Objectives monitoring';

