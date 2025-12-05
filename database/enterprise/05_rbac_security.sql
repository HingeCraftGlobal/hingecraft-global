-- Component 5: Advanced Security & RBAC
-- Oracle-Level Security (Oracle Database Vault equivalent)

-- ============================================
-- CREATE ROLES
-- ============================================

-- Super admin role
DO $$ BEGIN
    CREATE ROLE hingecraft_super_admin;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hingecraft_super_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hingecraft_super_admin;

-- Admin role (can read/write but not drop)
DO $$ BEGIN
    CREATE ROLE hingecraft_admin;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO hingecraft_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO hingecraft_admin;

-- User role (read/write own data)
DO $$ BEGIN
    CREATE ROLE hingecraft_user_role;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO hingecraft_user_role;
GRANT INSERT, UPDATE ON donations, members, chat_messages TO hingecraft_user_role;

-- Read-only role
DO $$ BEGIN
    CREATE ROLE hingecraft_readonly;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO hingecraft_readonly;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on donations table
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own donations
DROP POLICY IF EXISTS donations_user_policy ON donations;
CREATE POLICY donations_user_policy ON donations
    FOR SELECT
    USING (
        "_owner" = current_user
        OR current_user IN ('hingecraft_admin', 'hingecraft_super_admin')
    );

-- Policy: Users can insert their own donations
DROP POLICY IF EXISTS donations_insert_policy ON donations;
CREATE POLICY donations_insert_policy ON donations
    FOR INSERT
    WITH CHECK ("_owner" = current_user);

-- Policy: Users can update their own donations
DROP POLICY IF EXISTS donations_update_policy ON donations;
CREATE POLICY donations_update_policy ON donations
    FOR UPDATE
    USING ("_owner" = current_user)
    WITH CHECK ("_owner" = current_user);

-- Enable RLS on members table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see members from their country
DROP POLICY IF EXISTS members_country_policy ON members;
CREATE POLICY members_country_policy ON members
    FOR SELECT
    USING (
        country = (SELECT country FROM members WHERE "_owner" = current_user LIMIT 1)
        OR current_user IN ('hingecraft_admin', 'hingecraft_super_admin')
    );

-- Enable RLS on chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see messages from their room/country
DROP POLICY IF EXISTS chat_messages_room_policy ON chat_messages;
CREATE POLICY chat_messages_room_policy ON chat_messages
    FOR SELECT
    USING (
        room IN (SELECT DISTINCT room FROM chat_messages WHERE country = 
            (SELECT country FROM members WHERE "_owner" = current_user LIMIT 1))
        OR current_user IN ('hingecraft_admin', 'hingecraft_super_admin')
    );

-- ============================================
-- AUDIT LOGGING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    user_name VARCHAR(255) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_date 
ON audit_log(table_name, "_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user 
ON audit_log(user_name, "_createdDate" DESC);

-- ============================================
-- AUDIT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_json JSONB;
    new_json JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_json := row_to_json(OLD)::JSONB;
        INSERT INTO audit_log (
            table_name, operation, user_name, old_data
        ) VALUES (
            TG_TABLE_NAME, TG_OP, current_user, old_json
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_json := row_to_json(OLD)::JSONB;
        new_json := row_to_json(NEW)::JSONB;
        INSERT INTO audit_log (
            table_name, operation, user_name, old_data, new_data
        ) VALUES (
            TG_TABLE_NAME, TG_OP, current_user, old_json, new_json
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_json := row_to_json(NEW)::JSONB;
        INSERT INTO audit_log (
            table_name, operation, user_name, new_data
        ) VALUES (
            TG_TABLE_NAME, TG_OP, current_user, new_json
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- APPLY AUDIT TRIGGERS
-- ============================================

-- Audit trigger for donations
DROP TRIGGER IF EXISTS audit_donations ON donations;
CREATE TRIGGER audit_donations
    AFTER INSERT OR UPDATE OR DELETE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Audit trigger for members
DROP TRIGGER IF EXISTS audit_members ON members;
CREATE TRIGGER audit_members
    AFTER INSERT OR UPDATE OR DELETE ON members
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Audit trigger for chat_clubs
DROP TRIGGER IF EXISTS audit_chat_clubs ON chat_clubs;
CREATE TRIGGER audit_chat_clubs
    AFTER INSERT OR UPDATE OR DELETE ON chat_clubs
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Audit trigger for chat_messages
DROP TRIGGER IF EXISTS audit_chat_messages ON chat_messages;
CREATE TRIGGER audit_chat_messages
    AFTER INSERT OR UPDATE OR DELETE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- ============================================
-- SECURITY VIEWS
-- ============================================

-- View: Recent audit activity
CREATE OR REPLACE VIEW v_recent_audit_activity AS
SELECT
    table_name,
    operation,
    user_name,
    "_createdDate",
    CASE
        WHEN operation = 'DELETE' THEN old_data->>'_id'
        WHEN operation = 'INSERT' THEN new_data->>'_id'
        ELSE COALESCE(new_data->>'_id', old_data->>'_id')
    END as record_id
FROM audit_log
WHERE "_createdDate" > NOW() - INTERVAL '7 days'
ORDER BY "_createdDate" DESC;

-- View: User activity summary
CREATE OR REPLACE VIEW v_user_activity_summary AS
SELECT
    user_name,
    table_name,
    operation,
    COUNT(*) as operation_count,
    MAX("_createdDate") as last_activity
FROM audit_log
GROUP BY user_name, table_name, operation
ORDER BY last_activity DESC;

COMMENT ON TABLE audit_log IS 'Comprehensive audit log for all DML operations';
COMMENT ON VIEW v_recent_audit_activity IS 'Recent audit activity for security monitoring';
COMMENT ON VIEW v_user_activity_summary IS 'User activity summary for compliance reporting';

