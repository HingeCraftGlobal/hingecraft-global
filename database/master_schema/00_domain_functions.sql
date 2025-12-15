-- Domain-Specific Functions for HingeCraft Database
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

