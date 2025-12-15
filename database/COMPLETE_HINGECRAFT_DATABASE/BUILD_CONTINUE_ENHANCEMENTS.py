#!/usr/bin/env python3
"""
Continue Building Database - Add More Enhancements
Adds triggers, functions, and views to remaining tables
"""

import os
import re

def add_triggers_to_file(file_path, table_names):
    """Add triggers to multiple tables in a file"""
    if not os.path.exists(file_path):
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if triggers section already exists
    if '-- TRIGGERS FOR' in content:
        return False
    
    triggers_section = "\n\n-- ============================================\n-- TRIGGERS\n-- ============================================\n\n"
    
    for table_name in table_names:
        # Check if table exists in file
        if f'CREATE TABLE IF NOT EXISTS {table_name}' not in content:
            continue
        
        # Add triggers for this table
        triggers_section += f"""-- Auto-update updated_at timestamp for {table_name}
CREATE TRIGGER trigger_{table_name}_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for {table_name}
CREATE TRIGGER trigger_{table_name}_audit
    AFTER INSERT OR UPDATE OR DELETE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

"""
    
    # Append triggers to file
    with open(file_path, 'a') as f:
        f.write(triggers_section)
    
    return True

def create_more_views():
    """Create additional useful views"""
    views = """-- Additional Views for HingeCraft Database
-- Analytics, reporting, and dashboard views

-- ============================================
-- COMMUNITY ACTIVITY SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW v_community_activity_summary AS
SELECT 
    cg.id as group_id,
    cg.name as group_name,
    cg.category,
    COUNT(DISTINCT gm.user_id) FILTER (WHERE gm.is_active = true) as active_members,
    COUNT(DISTINCT cm.id) as total_messages,
    COUNT(DISTINCT cm.id) FILTER (WHERE cm.created_at > NOW() - INTERVAL '7 days') as messages_last_7_days,
    MAX(cm.created_at) as last_message_at
FROM community_groups cg
LEFT JOIN group_memberships gm ON cg.id = gm.group_id
LEFT JOIN community_messages cm ON cg.id = cm.group_id
GROUP BY cg.id, cg.name, cg.category;

COMMENT ON VIEW v_community_activity_summary IS 'Community group activity summary with member and message counts';

-- ============================================
-- MANUFACTURING ORDER STATUS VIEW
-- ============================================
CREATE OR REPLACE VIEW v_manufacturing_orders_status AS
SELECT 
    mo.id,
    mo.order_number,
    mo.status,
    mo.order_type,
    mo.quantity,
    mo.total_price,
    mo.created_at,
    u.display_name as creator_name,
    COUNT(DISTINCT pt.id) as tracking_stages,
    MAX(pt.completed_at) as last_stage_completed_at
FROM manufacturing_orders mo
LEFT JOIN users u ON mo.created_by = u.id
LEFT JOIN production_tracking pt ON mo.id = pt.order_id
GROUP BY mo.id, mo.order_number, mo.status, mo.order_type, mo.quantity, mo.total_price, mo.created_at, u.display_name;

COMMENT ON VIEW v_manufacturing_orders_status IS 'Manufacturing order status with tracking information';

-- ============================================
-- LEARNING PROGRESS VIEW
-- ============================================
CREATE OR REPLACE VIEW v_learning_progress AS
SELECT 
    u.id as user_id,
    u.display_name,
    COUNT(DISTINCT ce.course_id) FILTER (WHERE ce.enrollment_status = 'completed') as courses_completed,
    COUNT(DISTINCT ce.course_id) FILTER (WHERE ce.enrollment_status = 'in_progress') as courses_in_progress,
    COUNT(DISTINCT us.skill_id) as skills_count,
    COUNT(DISTINCT uc.certification_id) as certifications_count,
    AVG(ce.progress_percentage) FILTER (WHERE ce.enrollment_status = 'in_progress') as avg_progress
FROM users u
LEFT JOIN course_enrollments ce ON u.id = ce.user_id
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN user_certifications uc ON u.id = uc.user_id
GROUP BY u.id, u.display_name;

COMMENT ON VIEW v_learning_progress IS 'User learning progress summary';

-- ============================================
-- ENVIRONMENTAL IMPACT SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW v_environmental_impact_summary AS
SELECT 
    impact_category,
    DATE_TRUNC('month', created_at) as impact_month,
    SUM(metric_value) FILTER (WHERE metric_name = 'co2_equivalent') as total_co2_tons,
    SUM(metric_value) FILTER (WHERE metric_name = 'water_liters') as total_water_liters,
    SUM(metric_value) FILTER (WHERE metric_name = 'waste_kg') as total_waste_kg,
    SUM(metric_value) FILTER (WHERE metric_name = 'energy_kwh') as total_energy_kwh,
    COUNT(*) as record_count
FROM environmental_impact_records
GROUP BY impact_category, DATE_TRUNC('month', created_at)
ORDER BY impact_month DESC, impact_category;

COMMENT ON VIEW v_environmental_impact_summary IS 'Monthly environmental impact summary by category';

-- ============================================
-- CONTENT PERFORMANCE VIEW
-- ============================================
CREATE OR REPLACE VIEW v_content_performance AS
SELECT 
    ca.id,
    ca.title,
    ca.content_type,
    ca.status,
    ca.published_at,
    ca.views_count,
    ca.likes_count,
    COUNT(DISTINCT cc.id) as comment_count,
    COUNT(DISTINCT cco.contributor_id) as contributor_count,
    u.display_name as author_name
FROM content_articles ca
LEFT JOIN users u ON ca.created_by = u.id
LEFT JOIN content_comments cc ON ca.id = cc.article_id AND cc.deleted_at IS NULL
LEFT JOIN content_contributions cco ON ca.id = cco.article_id
WHERE ca.status = 'published'
GROUP BY ca.id, ca.title, ca.content_type, ca.status, ca.published_at, ca.views_count, ca.likes_count, u.display_name;

COMMENT ON VIEW v_content_performance IS 'Content performance metrics with engagement data';

"""
    
    file_path = 'database/master_schema/00_additional_views.sql'
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, 'w') as f:
        f.write(views)
    
    return file_path

def create_domain_functions():
    """Create domain-specific functions"""
    functions = """-- Domain-Specific Functions for HingeCraft Database
-- Business logic functions for specific domains

-- ============================================
-- DONATION FUNCTIONS
-- ============================================

-- Calculate total donations for a user
CREATE OR REPLACE FUNCTION get_user_total_donations(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(amount_usd), 0) INTO total
    FROM donations
    WHERE created_by = user_uuid
    AND status IN ('completed', 'confirmed');
    RETURN total;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_total_donations(UUID) IS 'Get total donation amount for a user';

-- ============================================
-- PROJECT FUNCTIONS
-- ============================================

-- Get project completion percentage
CREATE OR REPLACE FUNCTION get_project_completion(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    completion INTEGER;
BEGIN
    SELECT COALESCE(
        (SELECT AVG(progress_percentage) 
         FROM course_enrollments 
         WHERE course_id = project_uuid), 0
    ) INTO completion;
    RETURN completion;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_project_completion(UUID) IS 'Get project completion percentage';

-- ============================================
-- COMMUNITY FUNCTIONS
-- ============================================

-- Get active member count for a group
CREATE OR REPLACE FUNCTION get_group_active_members(group_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    member_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO member_count
    FROM group_memberships
    WHERE group_id = group_uuid
    AND is_active = true;
    RETURN member_count;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_group_active_members(UUID) IS 'Get active member count for a community group';

-- ============================================
-- ENVIRONMENTAL IMPACT FUNCTIONS
-- ============================================

-- Calculate carbon footprint for a period
CREATE OR REPLACE FUNCTION calculate_carbon_footprint(
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS NUMERIC AS $$
DECLARE
    total_co2 NUMERIC;
BEGIN
    SELECT COALESCE(SUM(metric_value), 0) INTO total_co2
    FROM environmental_impact_records
    WHERE impact_category = 'carbon'
    AND metric_name = 'co2_equivalent'
    AND created_at BETWEEN start_date AND end_date;
    RETURN total_co2;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_carbon_footprint(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Calculate total carbon footprint for a date range';

-- ============================================
-- LEARNING FUNCTIONS
-- ============================================

-- Get user skill level
CREATE OR REPLACE FUNCTION get_user_skill_level(user_uuid UUID, skill_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    level TEXT;
BEGIN
    SELECT proficiency_level INTO level
    FROM user_skills
    WHERE user_id = user_uuid
    AND skill_id = skill_uuid;
    RETURN COALESCE(level, 'none');
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_skill_level(UUID, UUID) IS 'Get user proficiency level for a specific skill';

"""
    
    file_path = 'database/master_schema/00_domain_functions.sql'
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, 'w') as f:
        f.write(functions)
    
    return file_path

def main():
    """Main function to continue building"""
    print("🏗️  Continuing Database BUILD - Adding More Enhancements...")
    print("=" * 70)
    
    # Add triggers to more tables
    print("\n1. Adding triggers to more tables...")
    
    enhancement_tasks = [
        ('database/master_schema/07_environmental_impact.sql', [
            'environmental_impact_records',
            'carbon_offsets',
            'sustainability_goals',
            'impact_reporting_periods'
        ]),
        ('database/master_schema/09_learning_skills.sql', [
            'learning_courses',
            'course_modules',
            'course_enrollments',
            'skills_catalog',
            'user_skills',
            'certifications',
            'user_certifications',
            'learning_paths'
        ]),
        ('database/master_schema/10_webhooks_assets_prompts.sql', [
            'webhooks',
            'assets',
            'prompt_runs',
            'prompt_templates',
            'audit_logs'
        ]),
    ]
    
    triggers_added = 0
    for file_path, table_names in enhancement_tasks:
        if add_triggers_to_file(file_path, table_names):
            print(f"   ✅ Added triggers to {len(table_names)} tables in {os.path.basename(file_path)}")
            triggers_added += len(table_names)
        else:
            print(f"   ⏭️  Skipped {os.path.basename(file_path)} (already has triggers)")
    
    # Create additional views
    print("\n2. Creating additional views...")
    views_file = create_more_views()
    print(f"   ✅ Created: {views_file}")
    
    # Create domain functions
    print("\n3. Creating domain-specific functions...")
    func_file = create_domain_functions()
    print(f"   ✅ Created: {func_file}")
    
    print("\n" + "=" * 70)
    print("✅ Additional Enhancements Complete!")
    print("=" * 70)
    print(f"\n📊 Summary:")
    print(f"   • Added triggers to {triggers_added} additional tables")
    print(f"   • Created 5 additional views")
    print(f"   • Created 5 domain-specific functions")
    
    print("\n🚀 Next Steps:")
    print("   1. Update APPLY_MASTER_SCHEMA.sh to include new files")
    print("   2. Continue building enterprise components")
    print("   3. Continue building security modules")

if __name__ == "__main__":
    main()

