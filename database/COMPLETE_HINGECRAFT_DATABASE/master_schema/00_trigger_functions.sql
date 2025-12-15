
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW."_updatedDate" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at and _updatedDate columns';


-- Function to log changes to audit_logs table
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[];
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Detect changed fields
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(to_jsonb(NEW))
        WHERE value IS DISTINCT FROM (to_jsonb(OLD) -> key);
        
        INSERT INTO audit_logs (
            actor_id, action, resource_type, resource_id,
            old_values, new_values, changed_fields, timestamp
        ) VALUES (
            current_setting('app.user_id', true)::uuid,
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            changed_fields,
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            actor_id, action, resource_type, resource_id,
            old_values, timestamp
        ) VALUES (
            current_setting('app.user_id', true)::uuid,
            TG_OP,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            actor_id, action, resource_type, resource_id,
            new_values, timestamp
        ) VALUES (
            current_setting('app.user_id', true)::uuid,
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW),
            NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_audit_event() IS 'Automatically logs all changes to audit_logs table';
