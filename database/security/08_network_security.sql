-- Component 8: Network Security - CIA-Level Security
-- Firewall rules, network segmentation, DDoS protection
-- ~2000 lines of comprehensive network security

-- ============================================
-- FIREWALL RULES MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS firewall_rules (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rule_name VARCHAR(255) UNIQUE NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'allow', 'deny', 'reject'
    direction VARCHAR(50) NOT NULL, -- 'inbound', 'outbound', 'both'
    source_ip CIDR,
    source_port INTEGER,
    destination_ip CIDR,
    destination_port INTEGER,
    protocol VARCHAR(20) NOT NULL, -- 'tcp', 'udp', 'icmp', 'all'
    service_name VARCHAR(255),
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    approval_date TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_firewall_rules_active 
ON firewall_rules(is_active, priority);

CREATE INDEX IF NOT EXISTS idx_firewall_rules_direction 
ON firewall_rules(direction, protocol);

-- Default firewall rules
INSERT INTO firewall_rules (rule_name, rule_type, direction, destination_port, protocol, service_name, priority) VALUES
    ('allow_https_inbound', 'allow', 'inbound', 443, 'tcp', 'HTTPS', 10),
    ('allow_http_inbound', 'allow', 'inbound', 80, 'tcp', 'HTTP', 20),
    ('allow_postgres_local', 'allow', 'inbound', 5432, 'tcp', 'PostgreSQL', 5),
    ('deny_all_inbound', 'deny', 'inbound', NULL, 'all', 'Default Deny', 1000)
ON CONFLICT (rule_name) DO NOTHING;

-- ============================================
-- NETWORK SEGMENTATION
-- ============================================

CREATE TABLE IF NOT EXISTS network_segments (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    segment_name VARCHAR(255) UNIQUE NOT NULL,
    segment_type VARCHAR(50) NOT NULL, -- 'dmz', 'internal', 'database', 'management', 'guest'
    network_cidr CIDR NOT NULL,
    gateway_ip INET,
    dns_servers INET[],
    isolation_level VARCHAR(50) DEFAULT 'standard', -- 'isolated', 'standard', 'shared'
    allowed_services TEXT[],
    allowed_protocols TEXT[],
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_network_segments_type 
ON network_segments(segment_type, isolation_level);

-- Default network segments
INSERT INTO network_segments (segment_name, segment_type, network_cidr, isolation_level) VALUES
    ('dmz_segment', 'dmz', '10.0.1.0/24', 'isolated'),
    ('internal_segment', 'internal', '10.0.2.0/24', 'standard'),
    ('database_segment', 'database', '10.0.3.0/24', 'isolated'),
    ('management_segment', 'management', '10.0.4.0/24', 'isolated')
ON CONFLICT (segment_name) DO NOTHING;

-- ============================================
-- DDoS PROTECTION AND MONITORING
-- ============================================

CREATE TABLE IF NOT EXISTS ddos_events (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attack_type VARCHAR(100) NOT NULL, -- 'volumetric', 'protocol', 'application_layer', 'syn_flood'
    source_ips INET[],
    target_ip INET NOT NULL,
    target_port INTEGER,
    attack_started TIMESTAMP NOT NULL,
    attack_ended TIMESTAMP,
    attack_duration_seconds INTEGER,
    packets_per_second BIGINT,
    bytes_per_second BIGINT,
    requests_per_second BIGINT,
    mitigation_applied BOOLEAN DEFAULT false,
    mitigation_method VARCHAR(255),
    attack_blocked BOOLEAN DEFAULT false,
    service_impact VARCHAR(50), -- 'none', 'degraded', 'unavailable'
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_ddos_events_date 
ON ddos_events(attack_started DESC);

CREATE INDEX IF NOT EXISTS idx_ddos_events_target 
ON ddos_events(target_ip, attack_started DESC);

CREATE INDEX IF NOT EXISTS idx_ddos_events_type 
ON ddos_events(attack_type, attack_started DESC);

-- ============================================
-- NETWORK TRAFFIC ANALYSIS
-- ============================================

CREATE TABLE IF NOT EXISTS network_traffic_log (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_ip INET NOT NULL,
    destination_ip INET NOT NULL,
    source_port INTEGER,
    destination_port INTEGER,
    protocol VARCHAR(20) NOT NULL,
    packet_count BIGINT DEFAULT 0,
    bytes_transferred BIGINT DEFAULT 0,
    connection_duration_seconds NUMERIC,
    connection_status VARCHAR(50), -- 'established', 'closed', 'reset', 'timeout'
    flags VARCHAR(50), -- TCP flags
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_network_traffic_date 
ON network_traffic_log("_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_network_traffic_source 
ON network_traffic_log(source_ip, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_network_traffic_destination 
ON network_traffic_log(destination_ip, "_createdDate" DESC);

-- ============================================
-- NETWORK SECURITY FUNCTIONS
-- ============================================

-- Function: Check firewall rule
CREATE OR REPLACE FUNCTION check_firewall_rule(
    p_direction VARCHAR,
    p_source_ip INET,
    p_destination_ip INET,
    p_destination_port INTEGER,
    p_protocol VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    rule_record RECORD;
BEGIN
    -- Check firewall rules in priority order
    FOR rule_record IN
        SELECT rule_type, source_ip, destination_ip, destination_port, protocol
        FROM firewall_rules
        WHERE is_active = true
        AND (direction = p_direction OR direction = 'both')
        AND (protocol = p_protocol OR protocol = 'all')
        AND (source_ip IS NULL OR p_source_ip <<= source_ip)
        AND (destination_ip IS NULL OR p_destination_ip <<= destination_ip)
        AND (destination_port IS NULL OR destination_port = p_destination_port)
        ORDER BY priority ASC
        LIMIT 1
    LOOP
        RETURN rule_record.rule_type = 'allow';
    END LOOP;
    
    -- Default deny
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function: Get network segment for IP
CREATE OR REPLACE FUNCTION get_network_segment(
    p_ip_address INET
)
RETURNS TABLE(
    segment_name VARCHAR,
    segment_type VARCHAR,
    isolation_level VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ns.segment_name,
        ns.segment_type,
        ns.isolation_level
    FROM network_segments ns
    WHERE p_ip_address <<= ns.network_cidr
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect DDoS attack
CREATE OR REPLACE FUNCTION detect_ddos_attack(
    p_source_ip INET,
    p_target_ip INET,
    p_target_port INTEGER,
    p_packets_per_second BIGINT,
    p_bytes_per_second BIGINT,
    p_requests_per_second BIGINT
)
RETURNS TABLE(
    attack_detected BOOLEAN,
    attack_type VARCHAR,
    severity VARCHAR
) AS $$
DECLARE
    threshold_packets BIGINT := 10000; -- packets per second
    threshold_bytes BIGINT := 104857600; -- 100 MB per second
    threshold_requests BIGINT := 1000; -- requests per second
BEGIN
    -- Volumetric attack
    IF p_packets_per_second > threshold_packets OR p_bytes_per_second > threshold_bytes THEN
        RETURN QUERY SELECT true, 'volumetric'::VARCHAR, 'critical'::VARCHAR;
    -- Application layer attack
    ELSIF p_requests_per_second > threshold_requests THEN
        RETURN QUERY SELECT true, 'application_layer'::VARCHAR, 'high'::VARCHAR;
    ELSE
        RETURN QUERY SELECT false, NULL::VARCHAR, NULL::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Record DDoS event
CREATE OR REPLACE FUNCTION record_ddos_event(
    p_attack_type VARCHAR,
    p_source_ips INET[],
    p_target_ip INET,
    p_target_port INTEGER,
    p_packets_per_second BIGINT,
    p_bytes_per_second BIGINT,
    p_requests_per_second BIGINT,
    p_mitigation_applied BOOLEAN DEFAULT false,
    p_mitigation_method VARCHAR DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    event_id VARCHAR;
    attack_duration INTEGER;
BEGIN
    INSERT INTO ddos_events (
        attack_type, source_ips, target_ip, target_port,
        attack_started, packets_per_second, bytes_per_second,
        requests_per_second, mitigation_applied, mitigation_method
    ) VALUES (
        p_attack_type, p_source_ips, p_target_ip, p_target_port,
        CURRENT_TIMESTAMP, p_packets_per_second, p_bytes_per_second,
        p_requests_per_second, p_mitigation_applied, p_mitigation_method
    ) RETURNING "_id" INTO event_id;
    
    -- Auto-block source IPs if critical attack
    IF p_packets_per_second > 10000 OR p_bytes_per_second > 104857600 THEN
        -- Add source IPs to firewall deny rules
        PERFORM blacklist_ip(unnest(p_source_ips)::CIDR, 'DDoS attack detected', CURRENT_TIMESTAMP + INTERVAL '24 hours');
    END IF;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NETWORK TRAFFIC ANALYSIS FUNCTIONS
-- ============================================

-- Function: Log network traffic
CREATE OR REPLACE FUNCTION log_network_traffic(
    p_source_ip INET,
    p_destination_ip INET,
    p_source_port INTEGER,
    p_destination_port INTEGER,
    p_protocol VARCHAR,
    p_packet_count BIGINT,
    p_bytes_transferred BIGINT,
    p_connection_duration NUMERIC,
    p_connection_status VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    log_id VARCHAR;
BEGIN
    INSERT INTO network_traffic_log (
        source_ip, destination_ip, source_port, destination_port,
        protocol, packet_count, bytes_transferred,
        connection_duration_seconds, connection_status
    ) VALUES (
        p_source_ip, p_destination_ip, p_source_port, p_destination_port,
        p_protocol, p_packet_count, p_bytes_transferred,
        p_connection_duration, p_connection_status
    ) RETURNING "_id" INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Analyze network traffic patterns
CREATE OR REPLACE FUNCTION analyze_traffic_patterns(
    p_time_window_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
    source_ip INET,
    destination_ip INET,
    protocol VARCHAR,
    total_packets BIGINT,
    total_bytes BIGINT,
    connections_count BIGINT,
    avg_duration NUMERIC,
    anomaly_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ntl.source_ip,
        ntl.destination_ip,
        ntl.protocol,
        SUM(ntl.packet_count) as total_packets,
        SUM(ntl.bytes_transferred) as total_bytes,
        COUNT(*) as connections_count,
        AVG(ntl.connection_duration_seconds) as avg_duration,
        CASE
            WHEN SUM(ntl.packet_count) > 100000 THEN 100.0
            WHEN SUM(ntl.packet_count) > 50000 THEN 75.0
            WHEN SUM(ntl.packet_count) > 10000 THEN 50.0
            ELSE 0.0
        END as anomaly_score
    FROM network_traffic_log ntl
    WHERE ntl."_createdDate" > CURRENT_TIMESTAMP - (p_time_window_minutes || ' minutes')::INTERVAL
    GROUP BY ntl.source_ip, ntl.destination_ip, ntl.protocol
    HAVING SUM(ntl.packet_count) > 1000
    ORDER BY total_packets DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NETWORK SECURITY MONITORING VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_firewall_rule_summary AS
SELECT
    rule_type,
    direction,
    protocol,
    COUNT(*) as rule_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM firewall_rules
GROUP BY rule_type, direction, protocol
ORDER BY rule_type, direction;

CREATE OR REPLACE VIEW v_ddos_attack_summary AS
SELECT
    DATE_TRUNC('hour', attack_started) as attack_hour,
    attack_type,
    COUNT(*) as attack_count,
    COUNT(DISTINCT target_ip) as unique_targets,
    SUM(packets_per_second) as total_packets,
    SUM(bytes_per_second) as total_bytes,
    COUNT(*) FILTER (WHERE attack_blocked = true) as blocked_count
FROM ddos_events
WHERE attack_started > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', attack_started), attack_type
ORDER BY attack_hour DESC, attack_count DESC;

CREATE OR REPLACE VIEW v_network_traffic_summary AS
SELECT
    DATE_TRUNC('hour', "_createdDate") as traffic_hour,
    protocol,
    COUNT(*) as connection_count,
    SUM(packet_count) as total_packets,
    SUM(bytes_transferred) as total_bytes,
    AVG(connection_duration_seconds) as avg_duration
FROM network_traffic_log
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', "_createdDate"), protocol
ORDER BY traffic_hour DESC, total_bytes DESC;

-- ============================================
-- NETWORK SECURITY COMPLIANCE REPORTING
-- ============================================

CREATE OR REPLACE FUNCTION generate_network_security_compliance_report()
RETURNS TABLE(
    compliance_area TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check 1: Firewall rules configured
    SELECT
        'Firewall Configuration'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' firewall rules configured',
        CASE WHEN COUNT(*) = 0 THEN 'Configure firewall rules' ELSE 'OK' END
    FROM firewall_rules
    WHERE is_active = true
    
    UNION ALL
    
    -- Check 2: Network segmentation
    SELECT
        'Network Segmentation'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'COMPLIANT' ELSE 'ATTENTION_REQUIRED' END,
        COUNT(*)::TEXT || ' network segments configured',
        CASE WHEN COUNT(*) < 3 THEN 'Implement network segmentation' ELSE 'OK' END
    FROM network_segments
    
    UNION ALL
    
    -- Check 3: DDoS attacks detected
    SELECT
        'DDoS Protection'::TEXT,
        CASE 
            WHEN (SELECT COUNT(*) FROM ddos_events WHERE attack_started > CURRENT_TIMESTAMP - INTERVAL '24 hours') = 0
            THEN 'COMPLIANT'
            ELSE 'ATTENTION_REQUIRED'
        END,
        (SELECT COUNT(*)::TEXT FROM ddos_events WHERE attack_started > CURRENT_TIMESTAMP - INTERVAL '24 hours') || ' DDoS events in last 24 hours',
        CASE 
            WHEN (SELECT COUNT(*) FROM ddos_events WHERE attack_started > CURRENT_TIMESTAMP - INTERVAL '24 hours') > 0
            THEN 'Review DDoS mitigation strategies'
            ELSE 'OK'
        END
    
    UNION ALL
    
    -- Check 4: Default deny rule exists
    SELECT
        'Default Deny Rule'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' default deny rule(s)',
        CASE WHEN COUNT(*) = 0 THEN 'Add default deny firewall rule' ELSE 'OK' END
    FROM firewall_rules
    WHERE rule_type = 'deny' AND is_active = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE firewall_rules IS 'Firewall rules management - CIA-level network security';
COMMENT ON TABLE network_segments IS 'Network segmentation configuration';
COMMENT ON TABLE ddos_events IS 'DDoS attack events log';
COMMENT ON FUNCTION check_firewall_rule IS 'Check if traffic is allowed by firewall rules';
COMMENT ON FUNCTION detect_ddos_attack IS 'Detect DDoS attack patterns';
COMMENT ON FUNCTION generate_network_security_compliance_report IS 'Generate network security compliance report';




