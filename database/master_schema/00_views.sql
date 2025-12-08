-- Useful Views for HingeCraft Database
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

