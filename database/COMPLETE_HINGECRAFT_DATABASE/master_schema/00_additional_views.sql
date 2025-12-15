-- Additional Views for HingeCraft Database
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

