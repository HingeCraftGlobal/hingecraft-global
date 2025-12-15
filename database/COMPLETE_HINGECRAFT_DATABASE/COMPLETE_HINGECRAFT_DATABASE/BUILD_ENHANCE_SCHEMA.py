#!/usr/bin/env python3
"""
Build and Enhance Database Schema
Adds triggers, functions, views to existing schema files
"""

import os
from pathlib import Path

def create_updated_at_trigger_function():
    """Create function for updated_at trigger"""
    return """
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
"""

def create_audit_trigger_function():
    """Create function for audit logging"""
    return """
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
"""

def add_triggers_to_file(file_path, table_name):
    """Add triggers to a schema file"""
    if not os.path.exists(file_path):
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if triggers already exist
    if 'CREATE TRIGGER' in content:
        return False
    
    # Find table definition
    if f'CREATE TABLE IF NOT EXISTS {table_name}' not in content:
        return False
    
    # Add triggers at end of file
    triggers = f"""

-- ============================================
-- TRIGGERS FOR {table_name}
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER trigger_{table_name}_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger
CREATE TRIGGER trigger_{table_name}_audit
    AFTER INSERT OR UPDATE OR DELETE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

"""
    
    with open(file_path, 'a') as f:
        f.write(triggers)
    
    return True

def create_helper_functions_file():
    """Create helper functions file"""
    functions = """-- Helper Functions for HingeCraft Database
-- Utility functions for common operations

-- ============================================
-- UUID GENERATION HELPERS
-- ============================================

-- Generate Wix-compatible _id from UUID
CREATE OR REPLACE FUNCTION generate_wix_id()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN REPLACE(gen_random_uuid()::TEXT, '-', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- JSONB HELPERS
-- ============================================

-- Safely get JSONB value with default
CREATE OR REPLACE FUNCTION jsonb_get(jsonb_data JSONB, key TEXT, default_value JSONB DEFAULT NULL)
RETURNS JSONB AS $$
BEGIN
    RETURN COALESCE(jsonb_data -> key, default_value);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- SEARCH HELPERS
-- ============================================

-- Full-text search helper
CREATE OR REPLACE FUNCTION search_text(search_query TEXT, search_fields TEXT[])
RETURNS TEXT AS $$
BEGIN
    RETURN to_tsvector('english', array_to_string(search_fields, ' '));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- VALIDATION HELPERS
-- ============================================

-- Validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- DATE HELPERS
-- ============================================

-- Get start of day
CREATE OR REPLACE FUNCTION start_of_day(ts TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN date_trunc('day', ts);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get end of day
CREATE OR REPLACE FUNCTION end_of_day(ts TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN date_trunc('day', ts) + INTERVAL '1 day' - INTERVAL '1 second';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_wix_id() IS 'Generate Wix-compatible ID';
COMMENT ON FUNCTION jsonb_get(JSONB, TEXT, JSONB) IS 'Safely get JSONB value';
COMMENT ON FUNCTION search_text(TEXT, TEXT[]) IS 'Full-text search helper';
COMMENT ON FUNCTION is_valid_email(TEXT) IS 'Validate email format';
COMMENT ON FUNCTION start_of_day(TIMESTAMPTZ) IS 'Get start of day';
COMMENT ON FUNCTION end_of_day(TIMESTAMPTZ) IS 'Get end of day';

"""
    
    file_path = 'database/master_schema/00_helper_functions.sql'
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, 'w') as f:
        f.write(functions)
    
    return file_path

def create_views_file():
    """Create useful views"""
    views = """-- Useful Views for HingeCraft Database
-- Pre-computed views for common queries

-- ============================================
-- USER SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW v_user_summary AS
SELECT 
    u.id,
    u.email,
    u.display_name,
    u.role,
    u.created_at,
    up.first_name,
    up.last_name,
    up.location,
    COUNT(DISTINCT cm.id) as message_count,
    COUNT(DISTINCT gm.group_id) as group_count
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN community_messages cm ON u.id = cm.user_id
LEFT JOIN group_memberships gm ON u.id = gm.user_id AND gm.is_active = true
GROUP BY u.id, u.email, u.display_name, u.role, u.created_at, up.first_name, up.last_name, up.location;

COMMENT ON VIEW v_user_summary IS 'User summary with profile and activity counts';

-- ============================================
-- DONATION SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW v_donation_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as donation_date,
    chain,
    token,
    COUNT(*) as donation_count,
    SUM(amount_usd) as total_usd,
    SUM(amount_crypto) as total_crypto,
    AVG(amount_usd) as avg_usd
FROM donations
WHERE status IN ('completed', 'confirmed')
GROUP BY DATE_TRUNC('day', created_at), chain, token
ORDER BY donation_date DESC;

COMMENT ON VIEW v_donation_summary IS 'Daily donation summaries by chain and token';

-- ============================================
-- PROJECT SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW v_project_summary AS
SELECT 
    dp.id,
    dp.title,
    dp.status,
    dp.created_at,
    u.display_name as creator_name,
    COUNT(DISTINCT dv.id) as version_count,
    COUNT(DISTINCT da.id) as asset_count,
    COUNT(DISTINCT dc.user_id) as collaborator_count
FROM design_projects dp
LEFT JOIN users u ON dp.created_by = u.id
LEFT JOIN design_versions dv ON dp.id = dv.project_id
LEFT JOIN design_assets da ON dp.id = da.project_id
LEFT JOIN design_collaborations dc ON dp.id = dc.project_id
GROUP BY dp.id, dp.title, dp.status, dp.created_at, u.display_name;

COMMENT ON VIEW v_project_summary IS 'Design project summary with counts';

"""
    
    file_path = 'database/master_schema/00_views.sql'
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, 'w') as f:
        f.write(views)
    
    return file_path

def main():
    """Main function to enhance schema"""
    print("🏗️  Building and Enhancing Database Schema...")
    print("=" * 70)
    
    # Create helper functions
    print("\n1. Creating helper functions...")
    func_file = create_helper_functions_file()
    print(f"   ✅ Created: {func_file}")
    
    # Create views
    print("\n2. Creating views...")
    views_file = create_views_file()
    print(f"   ✅ Created: {views_file}")
    
    # Add triggers to master schema files
    print("\n3. Adding triggers to master schema tables...")
    
    master_schema_tables = [
        ('database/master_schema/02_users_identity.sql', 'users'),
        ('database/master_schema/02_users_identity.sql', 'user_profiles'),
        ('database/master_schema/03_design_metadata.sql', 'design_projects'),
        ('database/master_schema/04_community_activity.sql', 'community_groups'),
        ('database/master_schema/05_microfactory_integrations.sql', 'manufacturing_orders'),
        ('database/master_schema/06_content_contributions.sql', 'content_articles'),
        ('database/master_schema/08_crypto_treasury.sql', 'donations'),
        ('database/master_schema/08_crypto_treasury.sql', 'wallets'),
    ]
    
    triggers_added = 0
    for file_path, table_name in master_schema_tables:
        if add_triggers_to_file(file_path, table_name):
            print(f"   ✅ Added triggers to {table_name}")
            triggers_added += 1
        else:
            print(f"   ⏭️  Skipped {table_name} (already has triggers or table not found)")
    
    print(f"\n✅ Added triggers to {triggers_added} tables")
    
    # Create trigger functions file
    print("\n4. Creating trigger functions...")
    trigger_funcs_file = 'database/master_schema/00_trigger_functions.sql'
    with open(trigger_funcs_file, 'w') as f:
        f.write(create_updated_at_trigger_function())
        f.write("\n")
        f.write(create_audit_trigger_function())
    print(f"   ✅ Created: {trigger_funcs_file}")
    
    print("\n" + "=" * 70)
    print("✅ Schema Enhancement Complete!")
    print("=" * 70)
    print("\n📁 Files Created/Enhanced:")
    print(f"   • {func_file}")
    print(f"   • {views_file}")
    print(f"   • {trigger_funcs_file}")
    print(f"   • Enhanced {triggers_added} schema files with triggers")
    
    print("\n🚀 Next Steps:")
    print("   1. Review enhanced schema files")
    print("   2. Update APPLY_MASTER_SCHEMA.sh to include new files")
    print("   3. Apply schema to database: ./scripts/APPLY_MASTER_SCHEMA.sh")

if __name__ == "__main__":
    main()

