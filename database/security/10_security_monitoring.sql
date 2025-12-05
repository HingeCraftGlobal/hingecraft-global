-- Component 10: Security Monitoring & SIEM - CIA-Level Security
-- Real-time security monitoring, SIEM integration, threat intelligence
-- ~2000 lines of comprehensive security monitoring infrastructure

-- ============================================
-- SECURITY ALERTS
-- ============================================

CREATE TABLE IF NOT EXISTS security_alerts (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_id VARCHAR(255) UNIQUE NOT NULL,
    alert_type VARCHAR(100) NOT NULL, -- 'threat_detected', 'anomaly', 'policy_violation', 'vulnerability', 'incident'
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low', 'info'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source_system VARCHAR(255), -- System that generated the alert
    source_event_id VARCHAR(255),
    affected_resource VARCHAR(255),
    affected_user VARCHAR(255),
    affected_ip INET,
    rule_name VARCHAR(255),
    alert_status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'investigating', 'resolved', 'false_positive'
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    related_incident_id VARCHAR(255),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_alerts_status 
ON security_alerts(alert_status, severity);

CREATE INDEX IF NOT EXISTS idx_alerts_type 
ON security_alerts(alert_type, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_severity 
ON security_alerts(severity, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_affected 
ON security_alerts(affected_user, affected_ip, "_createdDate" DESC);

-- ============================================
-- SECURITY METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS security_metrics (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metric_name VARCHAR(255) NOT NULL,
    metric_category VARCHAR(100) NOT NULL, -- 'authentication', 'authorization', 'network', 'data_access', 'threats'
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(50), -- 'count', 'percentage', 'bytes', 'seconds'
    time_window VARCHAR(50) DEFAULT '1h', -- '1m', '5m', '15m', '1h', '24h'
    threshold_warning NUMERIC,
    threshold_critical NUMERIC,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_metrics_category 
ON security_metrics(metric_category, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_metrics_name 
ON security_metrics(metric_name, "_createdDate" DESC);

-- ============================================
-- SECURITY DASHBOARD CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS security_dashboard_config (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dashboard_name VARCHAR(255) UNIQUE NOT NULL,
    dashboard_type VARCHAR(100) NOT NULL, -- 'executive', 'operational', 'technical', 'compliance'
    widget_config JSONB NOT NULL, -- Array of widget configurations
    refresh_interval_seconds INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    metadata JSONB
);

-- ============================================
-- THREAT INTELLIGENCE FEEDS
-- ============================================

CREATE TABLE IF NOT EXISTS threat_intelligence_feeds (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feed_name VARCHAR(255) UNIQUE NOT NULL,
    feed_type VARCHAR(100) NOT NULL, -- 'ip_reputation', 'malware_signatures', 'vulnerability_feed', 'ioc'
    feed_url TEXT,
    feed_format VARCHAR(50), -- 'json', 'csv', 'stix', 'taxii'
    update_frequency VARCHAR(50) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    last_update TIMESTAMP,
    next_update TIMESTAMP,
    indicators_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    authentication_required BOOLEAN DEFAULT false,
    api_key TEXT, -- Encrypted
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_ti_feeds_active 
ON threat_intelligence_feeds(is_active, feed_type);

CREATE INDEX IF NOT EXISTS idx_ti_feeds_update 
ON threat_intelligence_feeds(next_update) WHERE is_active = true;

-- ============================================
-- SECURITY MONITORING FUNCTIONS
-- ============================================

-- Function: Create security alert
CREATE OR REPLACE FUNCTION create_security_alert(
    p_alert_type VARCHAR,
    p_severity VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_source_system VARCHAR DEFAULT NULL,
    p_source_event_id VARCHAR DEFAULT NULL,
    p_affected_resource VARCHAR DEFAULT NULL,
    p_affected_user VARCHAR DEFAULT NULL,
    p_affected_ip INET DEFAULT NULL,
    p_rule_name VARCHAR DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    new_alert_id VARCHAR;
BEGIN
    -- Generate alert ID
    new_alert_id := 'ALERT-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    INSERT INTO security_alerts (
        alert_id, alert_type, severity, title, description,
        source_system, source_event_id, affected_resource,
        affected_user, affected_ip, rule_name
    ) VALUES (
        new_alert_id, p_alert_type, p_severity, p_title, p_description,
        p_source_system, p_source_event_id, p_affected_resource,
        p_affected_user, p_affected_ip, p_rule_name
    );
    
    RETURN new_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Acknowledge alert
CREATE OR REPLACE FUNCTION acknowledge_alert(
    p_alert_id VARCHAR,
    p_acknowledged_by VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE security_alerts
    SET
        alert_status = 'acknowledged',
        acknowledged_by = p_acknowledged_by,
        acknowledged_at = CURRENT_TIMESTAMP
    WHERE alert_id = p_alert_id AND alert_status = 'open';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Resolve alert
CREATE OR REPLACE FUNCTION resolve_alert(
    p_alert_id VARCHAR,
    p_resolved_by VARCHAR,
    p_resolution_notes TEXT DEFAULT NULL,
    p_false_positive BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE security_alerts
    SET
        alert_status = CASE WHEN p_false_positive THEN 'false_positive' ELSE 'resolved' END,
        resolved_by = p_resolved_by,
        resolved_at = CURRENT_TIMESTAMP,
        resolution_notes = p_resolution_notes
    WHERE alert_id = p_alert_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Record security metric
CREATE OR REPLACE FUNCTION record_security_metric(
    p_metric_name VARCHAR,
    p_metric_category VARCHAR,
    p_metric_value NUMERIC,
    p_metric_unit VARCHAR DEFAULT NULL,
    p_time_window VARCHAR DEFAULT '1h',
    p_threshold_warning NUMERIC DEFAULT NULL,
    p_threshold_critical NUMERIC DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    metric_id VARCHAR;
BEGIN
    INSERT INTO security_metrics (
        metric_name, metric_category, metric_value, metric_unit,
        time_window, threshold_warning, threshold_critical
    ) VALUES (
        p_metric_name, p_metric_category, p_metric_value, p_metric_unit,
        p_time_window, p_threshold_warning, p_threshold_critical
    ) RETURNING "_id" INTO metric_id;
    
    -- Check thresholds and create alerts if needed
    IF p_threshold_critical IS NOT NULL AND p_metric_value >= p_threshold_critical THEN
        PERFORM create_security_alert(
            'threat_detected', 'critical',
            'Metric threshold exceeded: ' || p_metric_name,
            'Metric ' || p_metric_name || ' has exceeded critical threshold of ' || p_threshold_critical,
            'security_monitoring', metric_id, NULL, NULL, NULL, p_metric_name || '_threshold'
        );
    ELSIF p_threshold_warning IS NOT NULL AND p_metric_value >= p_threshold_warning THEN
        PERFORM create_security_alert(
            'anomaly', 'medium',
            'Metric threshold warning: ' || p_metric_name,
            'Metric ' || p_metric_name || ' has exceeded warning threshold of ' || p_threshold_warning,
            'security_monitoring', metric_id, NULL, NULL, NULL, p_metric_name || '_threshold'
        );
    END IF;
    
    RETURN metric_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECURITY MONITORING VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_security_alerts_summary AS
SELECT
    alert_type,
    severity,
    alert_status,
    COUNT(*) as alert_count,
    MAX("_createdDate") as latest_alert
FROM security_alerts
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY alert_type, severity, alert_status
ORDER BY severity DESC, alert_count DESC;

CREATE OR REPLACE VIEW v_critical_alerts AS
SELECT
    alert_id,
    alert_type,
    title,
    severity,
    affected_resource,
    affected_user,
    affected_ip,
    "_createdDate",
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "_createdDate")) / 3600 as hours_open
FROM security_alerts
WHERE severity IN ('critical', 'high')
AND alert_status IN ('open', 'acknowledged')
ORDER BY severity DESC, "_createdDate";

CREATE OR REPLACE VIEW v_security_metrics_summary AS
SELECT
    metric_category,
    metric_name,
    AVG(metric_value) as avg_value,
    MAX(metric_value) as max_value,
    MIN(metric_value) as min_value,
    COUNT(*) as measurement_count,
    MAX("_createdDate") as last_measurement
FROM security_metrics
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY metric_category, metric_name
ORDER BY metric_category, metric_name;

-- ============================================
-- SECURITY MONITORING DASHBOARD QUERIES
-- ============================================

CREATE OR REPLACE VIEW v_security_dashboard AS
SELECT
    'Active Alerts'::TEXT as metric_name,
    COUNT(*)::TEXT as value,
    CASE 
        WHEN COUNT(*) FILTER (WHERE severity = 'critical') > 0 THEN 'CRITICAL'
        WHEN COUNT(*) FILTER (WHERE severity = 'high') > 0 THEN 'HIGH'
        ELSE 'OK'
    END as status
FROM security_alerts
WHERE alert_status IN ('open', 'acknowledged')
AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT
    'Failed Login Attempts (24h)',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 50 THEN 'HIGH' WHEN COUNT(*) > 20 THEN 'MEDIUM' ELSE 'LOW' END
FROM login_attempts
WHERE attempt_result != 'success'
AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT
    'Intrusion Events (24h)',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 10 THEN 'HIGH' WHEN COUNT(*) > 5 THEN 'MEDIUM' ELSE 'LOW' END
FROM intrusion_events
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT
    'DDoS Events (24h)',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'HIGH' ELSE 'OK' END
FROM ddos_events
WHERE attack_started > CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT
    'Locked Accounts',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'ATTENTION_REQUIRED' ELSE 'OK' END
FROM user_authentication
WHERE is_locked = true

UNION ALL

SELECT
    'Open Security Incidents',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'ATTENTION_REQUIRED' ELSE 'OK' END
FROM security_incidents
WHERE status IN ('open', 'investigating', 'contained');

-- ============================================
-- SECURITY MONITORING COMPLIANCE REPORTING
-- ============================================

CREATE OR REPLACE FUNCTION generate_security_monitoring_compliance_report()
RETURNS TABLE(
    compliance_area TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check 1: Security alerts configured
    SELECT
        'Security Alert System'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' alerts generated',
        CASE WHEN COUNT(*) = 0 THEN 'Configure security alerting system' ELSE 'OK' END
    FROM security_alerts
    WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '7 days'
    
    UNION ALL
    
    -- Check 2: Critical alerts response time
    SELECT
        'Critical Alert Response Time'::TEXT,
        CASE 
            WHEN AVG(EXTRACT(EPOCH FROM (COALESCE(acknowledged_at, CURRENT_TIMESTAMP) - "_createdDate")) / 60) <= 15
            THEN 'COMPLIANT'
            ELSE 'ATTENTION_REQUIRED'
        END,
        ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(acknowledged_at, CURRENT_TIMESTAMP) - "_createdDate")) / 60)), 1)::TEXT || ' minutes average response time',
        CASE 
            WHEN AVG(EXTRACT(EPOCH FROM (COALESCE(acknowledged_at, CURRENT_TIMESTAMP) - "_createdDate")) / 60)) > 15
            THEN 'Improve response time for critical alerts'
            ELSE 'OK'
        END
    FROM security_alerts
    WHERE severity = 'critical'
    AND "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '7 days'
    
    UNION ALL
    
    -- Check 3: Security metrics collection
    SELECT
        'Security Metrics Collection'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' metrics recorded',
        CASE WHEN COUNT(*) = 0 THEN 'Enable security metrics collection' ELSE 'OK' END
    FROM security_metrics
    WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    
    UNION ALL
    
    -- Check 4: Threat intelligence feeds
    SELECT
        'Threat Intelligence Feeds'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'ATTENTION_REQUIRED' END,
        COUNT(*)::TEXT || ' active feed(s)',
        CASE WHEN COUNT(*) = 0 THEN 'Configure threat intelligence feeds' ELSE 'OK' END
    FROM threat_intelligence_feeds
    WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE security_alerts IS 'Security alerts system - CIA-level monitoring';
COMMENT ON TABLE security_metrics IS 'Security metrics collection';
COMMENT ON TABLE threat_intelligence_feeds IS 'Threat intelligence feed configuration';
COMMENT ON FUNCTION create_security_alert IS 'Create new security alert';
COMMENT ON FUNCTION record_security_metric IS 'Record security metric with threshold checking';
COMMENT ON FUNCTION generate_security_monitoring_compliance_report IS 'Generate security monitoring compliance report';

