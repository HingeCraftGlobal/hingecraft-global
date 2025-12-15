-- Helper Functions for HingeCraft Database
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
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
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

