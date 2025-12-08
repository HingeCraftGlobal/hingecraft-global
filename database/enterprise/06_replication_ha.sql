-- Component 6: Replication & High Availability
-- Oracle-Level HA (Oracle Data Guard equivalent)

-- ============================================
-- REPLICATION SETUP (Streaming Replication)
-- ============================================

-- Note: This requires configuration in postgresql.conf and pg_hba.conf
-- These are setup instructions, not executable SQL

-- Enable WAL archiving (add to postgresql.conf):
-- wal_level = replica
-- max_wal_senders = 3
-- wal_keep_size = 1GB
-- archive_mode = on
-- archive_command = 'test ! -f /path/to/archive/%f && cp %p /path/to/archive/%f'

-- ============================================
-- REPLICATION MONITORING VIEWS
-- ============================================

-- View: Replication status
CREATE OR REPLACE VIEW v_replication_status AS
SELECT
    application_name,
    client_addr,
    state,
    sync_state,
    sync_priority,
    pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn) as replication_lag_bytes,
    EXTRACT(EPOCH FROM (now() - reply_time)) as replication_lag_seconds
FROM pg_stat_replication;

-- View: WAL statistics
CREATE OR REPLACE VIEW v_wal_statistics AS
SELECT
    pg_size_pretty(pg_current_wal_lsn() - '0/0') as current_wal_size,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), pg_last_wal_replay_lsn())) as replication_lag,
    pg_last_wal_replay_lsn() as last_replay_lsn,
    pg_last_wal_replay_lsn() is not null as is_replica;

COMMENT ON VIEW v_replication_status IS 'Monitor streaming replication status';
COMMENT ON VIEW v_wal_statistics IS 'Monitor WAL and replication statistics';

-- ============================================
-- HIGH AVAILABILITY FUNCTIONS
-- ============================================

-- Function: Check if database is primary
CREATE OR REPLACE FUNCTION is_primary()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN pg_is_in_recovery() = false;
END;
$$ LANGUAGE plpgsql;

-- Function: Promote standby to primary (run on standby)
CREATE OR REPLACE FUNCTION promote_standby()
RETURNS TEXT AS $$
BEGIN
    IF pg_is_in_recovery() THEN
        PERFORM pg_promote();
        RETURN 'Standby promoted to primary';
    ELSE
        RETURN 'Already primary';
    END IF;
END;
$$ LANGUAGE plpgsql;







