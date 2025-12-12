-- Migration script to import existing HingeCraft data into automation system
-- This adapts donations and members data to the leads table format
-- Run this after schema.sql is initialized

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MIGRATION: Donations → Leads
-- ============================================
-- This will be handled by the application script
-- But we can create a view for reference

CREATE OR REPLACE VIEW donations_as_leads AS
SELECT 
    gen_random_uuid() as id,
    COALESCE(member_email, 'unknown@example.com') as email,
    SPLIT_PART(COALESCE(member_name, ''), ' ', 1) as first_name,
    SPLIT_PART(COALESCE(member_name, ''), ' ', 2) as last_name,
    NULL as organization,
    NULL as title,
    NULL as phone,
    NULL as website,
    NULL as city,
    NULL as state,
    NULL as country,
    'donation' as source,
    NULL as source_file_id,
    NULL as source_row_number,
    NULL as gs_id,
    85 as persona_score, -- Donors are high value
    NULL as fm_stage,
    ARRAY['donor']::TEXT[] as bpsd_tag,
    NULL as preferred_tone,
    TRUE as has_donated,
    'enriched' as status,
    2 as tier, -- Donors are tier 2
    NULL as fingerprint,
    jsonb_build_object(
        'donation_amount', amount,
        'transaction_id', transaction_id,
        'payment_method', payment_method,
        'original_id', id
    ) as raw_meta,
    NULL as enrichment_data,
    COALESCE(created_at, NOW()) as created_at,
    NOW() as updated_at,
    NULL as enriched_at,
    NULL as last_contacted_at
FROM donations
WHERE member_email IS NOT NULL AND member_email != '';

-- ============================================
-- MIGRATION: Members → Leads  
-- ============================================
-- Similar view for members

-- Note: Actual migration will be done by import-all-database-data.js
-- This SQL file is for reference and can be used for direct SQL imports

