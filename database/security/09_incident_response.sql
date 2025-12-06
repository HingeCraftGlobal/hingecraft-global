-- Component 9: Incident Response - CIA-Level Security
-- Security incident management, response procedures, forensics
-- ~2000 lines of comprehensive incident response infrastructure

-- ============================================
-- SECURITY INCIDENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS security_incidents (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    incident_id VARCHAR(255) UNIQUE NOT NULL,
    incident_title VARCHAR(255) NOT NULL,
    incident_type VARCHAR(100) NOT NULL, -- 'data_breach', 'malware', 'unauthorized_access', 'ddos', 'insider_threat'
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'investigating', 'contained', 'resolved', 'closed'
    priority INTEGER DEFAULT 50, -- 1-100, higher = more urgent
    discovered_at TIMESTAMP NOT NULL,
    detected_by VARCHAR(255),
    detection_method VARCHAR(100), -- 'automated', 'manual', 'user_report', 'external'
    affected_systems TEXT[],
    affected_users INTEGER,
    affected_data_types TEXT[],
    initial_description TEXT,
    current_description TEXT,
    root_cause TEXT,
    impact_assessment TEXT,
    containment_actions TEXT[],
    eradication_actions TEXT[],
    recovery_actions TEXT[],
    lessons_learned TEXT,
    assigned_to VARCHAR(255),
    reported_to_authorities BOOLEAN DEFAULT false,
    reported_to_authorities_date TIMESTAMP,
    reported_to_customers BOOLEAN DEFAULT false,
    reported_to_customers_date TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_incidents_status 
ON security_incidents(status, priority DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_severity 
ON security_incidents(severity, discovered_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_type 
ON security_incidents(incident_type, discovered_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_assigned 
ON security_incidents(assigned_to, status);

-- ============================================
-- INCIDENT TIMELINE
-- ============================================

CREATE TABLE IF NOT EXISTS incident_timeline (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    incident_id VARCHAR(255) NOT NULL REFERENCES security_incidents(incident_id),
    event_timestamp TIMESTAMP NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'discovery', 'containment', 'investigation', 'remediation', 'resolution'
    event_description TEXT NOT NULL,
    performed_by VARCHAR(255),
    related_evidence TEXT[],
    attachments JSONB,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_timeline_incident 
ON incident_timeline(incident_id, event_timestamp);

-- ============================================
-- INCIDENT RESPONSE TEAM
-- ============================================

CREATE TABLE IF NOT EXISTS incident_response_team (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'incident_commander', 'technical_lead', 'forensics', 'communications', 'legal'
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    availability_status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'unavailable'
    on_call BOOLEAN DEFAULT false,
    expertise_areas TEXT[],
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_irt_role 
ON incident_response_team(role, is_active);

CREATE INDEX IF NOT EXISTS idx_irt_availability 
ON incident_response_team(availability_status, on_call);

-- ============================================
-- INCIDENT RESPONSE PROCEDURES
-- ============================================

CREATE TABLE IF NOT EXISTS incident_response_procedures (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    procedure_name VARCHAR(255) UNIQUE NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    severity_level VARCHAR(50) NOT NULL,
    procedure_steps JSONB NOT NULL, -- Array of step objects
    required_roles TEXT[],
    estimated_duration_minutes INTEGER,
    escalation_path TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_tested TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_procedures_type 
ON incident_response_procedures(incident_type, severity_level, is_active);

-- ============================================
-- FORENSIC EVIDENCE
-- ============================================

CREATE TABLE IF NOT EXISTS forensic_evidence (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    incident_id VARCHAR(255) NOT NULL REFERENCES security_incidents(incident_id),
    evidence_type VARCHAR(100) NOT NULL, -- 'log_file', 'network_capture', 'memory_dump', 'disk_image', 'screenshot'
    evidence_name VARCHAR(255) NOT NULL,
    evidence_location TEXT NOT NULL,
    hash_md5 VARCHAR(32),
    hash_sha256 VARCHAR(64),
    collected_at TIMESTAMP NOT NULL,
    collected_by VARCHAR(255),
    chain_of_custody JSONB, -- Array of custody transfers
    analysis_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'analyzed', 'archived'
    analysis_results TEXT,
    analyzed_by VARCHAR(255),
    analyzed_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_evidence_incident 
ON forensic_evidence(incident_id, evidence_type);

CREATE INDEX IF NOT EXISTS idx_evidence_status 
ON forensic_evidence(analysis_status, collected_at);

-- ============================================
-- INCIDENT RESPONSE FUNCTIONS
-- ============================================

-- Function: Create security incident
CREATE OR REPLACE FUNCTION create_security_incident(
    p_incident_title VARCHAR,
    p_incident_type VARCHAR,
    p_severity VARCHAR,
    p_discovered_at TIMESTAMP,
    p_detected_by VARCHAR,
    p_detection_method VARCHAR,
    p_initial_description TEXT,
    p_affected_systems TEXT[] DEFAULT NULL,
    p_assigned_to VARCHAR DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    new_incident_id VARCHAR;
    priority_val INTEGER;
BEGIN
    -- Generate incident ID
    new_incident_id := 'INC-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || 
                       LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Calculate priority based on severity
    priority_val := CASE p_severity
        WHEN 'critical' THEN 100
        WHEN 'high' THEN 75
        WHEN 'medium' THEN 50
        WHEN 'low' THEN 25
        ELSE 50
    END;
    
    -- Create incident
    INSERT INTO security_incidents (
        incident_id, incident_title, incident_type, severity, priority,
        discovered_at, detected_by, detection_method, initial_description,
        current_description, affected_systems, assigned_to
    ) VALUES (
        new_incident_id, p_incident_title, p_incident_type, p_severity, priority_val,
        p_discovered_at, p_detected_by, p_detection_method, p_initial_description,
        p_initial_description, p_affected_systems, p_assigned_to
    );
    
    -- Add timeline event
    INSERT INTO incident_timeline (
        incident_id, event_timestamp, event_type, event_description, performed_by
    ) VALUES (
        new_incident_id, p_discovered_at, 'discovery', 
        'Incident discovered: ' || p_initial_description, p_detected_by
    );
    
    RETURN new_incident_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Update incident status
CREATE OR REPLACE FUNCTION update_incident_status(
    p_incident_id VARCHAR,
    p_status VARCHAR,
    p_updated_by VARCHAR,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    resolved_timestamp TIMESTAMP;
BEGIN
    -- Set resolved_at if status is resolved
    IF p_status = 'resolved' THEN
        resolved_timestamp := CURRENT_TIMESTAMP;
    END IF;
    
    UPDATE security_incidents
    SET
        status = p_status,
        resolved_at = COALESCE(resolved_at, resolved_timestamp),
        current_description = COALESCE(p_description, current_description),
        "_updatedDate" = CURRENT_TIMESTAMP
    WHERE incident_id = p_incident_id;
    
    -- Add timeline event
    INSERT INTO incident_timeline (
        incident_id, event_timestamp, event_type, event_description, performed_by
    ) VALUES (
        p_incident_id, CURRENT_TIMESTAMP, LOWER(p_status), 
        COALESCE(p_description, 'Status updated to ' || p_status), p_updated_by
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Add containment action
CREATE OR REPLACE FUNCTION add_containment_action(
    p_incident_id VARCHAR,
    p_action_description TEXT,
    p_performed_by VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE security_incidents
    SET
        containment_actions = array_append(containment_actions, p_action_description),
        status = CASE WHEN status = 'open' THEN 'investigating' ELSE status END,
        "_updatedDate" = CURRENT_TIMESTAMP
    WHERE incident_id = p_incident_id;
    
    -- Add timeline event
    INSERT INTO incident_timeline (
        incident_id, event_timestamp, event_type, event_description, performed_by
    ) VALUES (
        p_incident_id, CURRENT_TIMESTAMP, 'containment', p_action_description, p_performed_by
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Record forensic evidence
CREATE OR REPLACE FUNCTION record_forensic_evidence(
    p_incident_id VARCHAR,
    p_evidence_type VARCHAR,
    p_evidence_name VARCHAR,
    p_evidence_location TEXT,
    p_hash_md5 VARCHAR DEFAULT NULL,
    p_hash_sha256 VARCHAR DEFAULT NULL,
    p_collected_by VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    evidence_id VARCHAR;
BEGIN
    INSERT INTO forensic_evidence (
        incident_id, evidence_type, evidence_name, evidence_location,
        hash_md5, hash_sha256, collected_at, collected_by
    ) VALUES (
        p_incident_id, p_evidence_type, p_evidence_name, p_evidence_location,
        p_hash_md5, p_hash_sha256, CURRENT_TIMESTAMP, p_collected_by
    ) RETURNING "_id" INTO evidence_id;
    
    -- Add timeline event
    INSERT INTO incident_timeline (
        incident_id, event_timestamp, event_type, event_description, performed_by, related_evidence
    ) VALUES (
        p_incident_id, CURRENT_TIMESTAMP, 'investigation',
        'Forensic evidence collected: ' || p_evidence_name, p_collected_by,
        ARRAY[evidence_id]
    );
    
    RETURN evidence_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INCIDENT METRICS AND REPORTING
-- ============================================

CREATE OR REPLACE VIEW v_incident_summary AS
SELECT
    incident_type,
    severity,
    status,
    COUNT(*) as incident_count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, CURRENT_TIMESTAMP) - discovered_at)) / 3600) as avg_resolution_hours,
    MAX(EXTRACT(EPOCH FROM (COALESCE(resolved_at, CURRENT_TIMESTAMP) - discovered_at)) / 3600) as max_resolution_hours
FROM security_incidents
WHERE discovered_at > CURRENT_TIMESTAMP - INTERVAL '90 days'
GROUP BY incident_type, severity, status
ORDER BY severity DESC, incident_count DESC;

CREATE OR REPLACE VIEW v_active_incidents AS
SELECT
    incident_id,
    incident_title,
    incident_type,
    severity,
    status,
    priority,
    discovered_at,
    assigned_to,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - discovered_at)) / 3600 as hours_open
FROM security_incidents
WHERE status IN ('open', 'investigating', 'contained')
ORDER BY priority DESC, discovered_at;

CREATE OR REPLACE VIEW v_incident_timeline_summary AS
SELECT
    si.incident_id,
    si.incident_title,
    si.severity,
    si.status,
    COUNT(it."_id") as timeline_events,
    MIN(it.event_timestamp) as first_event,
    MAX(it.event_timestamp) as last_event
FROM security_incidents si
LEFT JOIN incident_timeline it ON si.incident_id = it.incident_id
GROUP BY si.incident_id, si.incident_title, si.severity, si.status
ORDER BY si.discovered_at DESC;

-- ============================================
-- INCIDENT RESPONSE COMPLIANCE REPORTING
-- ============================================

CREATE OR REPLACE FUNCTION generate_incident_response_compliance_report()
RETURNS TABLE(
    compliance_area TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check 1: Active incidents
    SELECT
        'Active Incidents'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'COMPLIANT' ELSE 'ATTENTION_REQUIRED' END,
        COUNT(*)::TEXT || ' active incident(s)',
        CASE WHEN COUNT(*) > 0 THEN 'Resolve active incidents promptly' ELSE 'OK' END
    FROM security_incidents
    WHERE status IN ('open', 'investigating', 'contained')
    
    UNION ALL
    
    -- Check 2: Critical incidents response time
    SELECT
        'Critical Incident Response Time'::TEXT,
        CASE 
            WHEN AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, CURRENT_TIMESTAMP) - discovered_at)) / 3600) <= 24
            THEN 'COMPLIANT'
            ELSE 'ATTENTION_REQUIRED'
        END,
        ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, CURRENT_TIMESTAMP) - discovered_at)) / 3600)), 1)::TEXT || ' hours average resolution time',
        CASE 
            WHEN AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, CURRENT_TIMESTAMP) - discovered_at)) / 3600)) > 24
            THEN 'Improve incident response time for critical incidents'
            ELSE 'OK'
        END
    FROM security_incidents
    WHERE severity = 'critical'
    AND discovered_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
    
    UNION ALL
    
    -- Check 3: Incident response team
    SELECT
        'Incident Response Team'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'COMPLIANT' ELSE 'ATTENTION_REQUIRED' END,
        COUNT(*)::TEXT || ' team member(s)',
        CASE WHEN COUNT(*) < 3 THEN 'Assign incident response team members' ELSE 'OK' END
    FROM incident_response_team
    WHERE is_active = true
    
    UNION ALL
    
    -- Check 4: Forensic evidence collection
    SELECT
        'Forensic Evidence Collection'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' evidence items collected',
        CASE WHEN COUNT(*) = 0 THEN 'Ensure forensic evidence is collected for incidents' ELSE 'OK' END
    FROM forensic_evidence
    WHERE collected_at > CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE security_incidents IS 'Security incident management - CIA-level incident response';
COMMENT ON TABLE incident_timeline IS 'Incident timeline events';
COMMENT ON TABLE forensic_evidence IS 'Forensic evidence collection';
COMMENT ON FUNCTION create_security_incident IS 'Create new security incident';
COMMENT ON FUNCTION update_incident_status IS 'Update incident status';
COMMENT ON FUNCTION generate_incident_response_compliance_report IS 'Generate incident response compliance report';





