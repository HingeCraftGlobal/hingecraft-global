-- Governance: Fine-Grained Access Rules
-- Row-level security, field-level access, time-based access

-- ============================================
-- ACCESS RULES (Dynamic Rules Engine)
-- ============================================
CREATE TABLE IF NOT EXISTS access_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name text UNIQUE NOT NULL,
    resource_type text NOT NULL,
    rule_type text NOT NULL, -- 'row_level', 'field_level', 'time_based', 'ip_based', 'custom'
    condition_sql text, -- SQL condition for row-level filtering
    allowed_fields text[], -- For field-level access
    denied_fields text[],
    allowed_roles text[],
    denied_roles text[],
    allowed_user_ids uuid[],
    denied_user_ids uuid[],
    ip_whitelist inet[],
    ip_blacklist inet[],
    time_window_start time,
    time_window_end time,
    days_of_week integer[], -- 0=Sunday, 6=Saturday
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0, -- Higher priority rules evaluated first
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES users(id),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_access_rules_resource_type ON access_rules(resource_type, is_active);
CREATE INDEX IF NOT EXISTS idx_access_rules_priority ON access_rules(priority DESC, is_active);

-- ============================================
-- FIELD-LEVEL ACCESS CONTROL
-- ============================================
CREATE TABLE IF NOT EXISTS field_access_control (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type text NOT NULL,
    field_name text NOT NULL,
    access_level text NOT NULL, -- 'public', 'authenticated', 'role', 'owner', 'admin'
    required_role text,
    encryption_required boolean DEFAULT false,
    masking_type text, -- 'full', 'partial', 'hash', 'none'
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(resource_type, field_name)
);

CREATE INDEX IF NOT EXISTS idx_field_access_control_resource ON field_access_control(resource_type);

-- ============================================
-- ACCESS LOG (Detailed Access Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS access_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    resource_type text NOT NULL,
    resource_id uuid,
    action text NOT NULL, -- 'read', 'write', 'delete', 'export'
    fields_accessed text[],
    access_granted boolean DEFAULT true,
    access_rule_id uuid REFERENCES access_rules(id),
    ip_address inet,
    user_agent text,
    accessed_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_access_log_user_id ON access_log(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_log_resource ON access_log(resource_type, resource_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_log_granted ON access_log(access_granted, accessed_at DESC);

-- ============================================
-- FUNCTION: Evaluate Access Rule
-- ============================================
CREATE OR REPLACE FUNCTION evaluate_access_rule(
    p_user_id uuid,
    p_resource_type text,
    p_resource_id uuid DEFAULT NULL,
    p_action text DEFAULT 'read'
)
RETURNS jsonb AS $$
DECLARE
    rule_record RECORD;
    user_record RECORD;
    result jsonb := jsonb_build_object('granted', false, 'reason', 'no_rule_matched');
    user_roles_array text[];
    user_ip inet;
BEGIN
    -- Get user roles
    SELECT array_agg(r.role_name) INTO user_roles_array
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND ur.is_active = true;
    
    -- Get user IP (from session or request context)
    -- This would be set by application layer
    -- user_ip := current_setting('app.user_ip', true)::inet;
    
    -- Evaluate rules in priority order
    FOR rule_record IN
        SELECT * FROM access_rules
        WHERE resource_type = p_resource_type
        AND is_active = true
        ORDER BY priority DESC
    LOOP
        -- Check role restrictions
        IF rule_record.denied_roles IS NOT NULL AND rule_record.denied_roles && user_roles_array THEN
            CONTINUE; -- Skip this rule, user is denied
        END IF;
        
        IF rule_record.allowed_roles IS NOT NULL AND NOT (rule_record.allowed_roles && user_roles_array) THEN
            CONTINUE; -- Skip this rule, user doesn't have required role
        END IF;
        
        -- Check user ID restrictions
        IF rule_record.denied_user_ids IS NOT NULL AND p_user_id = ANY(rule_record.denied_user_ids) THEN
            CONTINUE;
        END IF;
        
        IF rule_record.allowed_user_ids IS NOT NULL AND p_user_id != ALL(rule_record.allowed_user_ids) THEN
            CONTINUE;
        END IF;
        
        -- Time-based checks
        IF rule_record.time_window_start IS NOT NULL AND rule_record.time_window_end IS NOT NULL THEN
            IF CURRENT_TIME NOT BETWEEN rule_record.time_window_start AND rule_record.time_window_end THEN
                CONTINUE;
            END IF;
        END IF;
        
        -- If we get here, rule matches
        result := jsonb_build_object(
            'granted', true,
            'rule_id', rule_record.id,
            'rule_name', rule_record.rule_name,
            'allowed_fields', rule_record.allowed_fields,
            'denied_fields', rule_record.denied_fields
        );
        RETURN result;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE access_rules IS 'Dynamic access control rules engine';
COMMENT ON TABLE field_access_control IS 'Field-level access control definitions';
COMMENT ON TABLE access_log IS 'Detailed access logging';
COMMENT ON FUNCTION evaluate_access_rule IS 'Evaluate access rules for user and resource';




