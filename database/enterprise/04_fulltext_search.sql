-- Component 4: Full-Text Search Engine
-- Oracle-Level Full-Text Search (Oracle Text equivalent)

-- ============================================
-- ENABLE FULL-TEXT SEARCH EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS unaccent; -- Remove accents for better search

-- ============================================
-- FULL-TEXT SEARCH CONFIGURATION
-- ============================================

-- Create custom text search configuration
DO $$ BEGIN
    CREATE TEXT SEARCH CONFIGURATION hingecraft_search (COPY = english);
EXCEPTION WHEN OTHERS THEN
    NULL; -- Configuration already exists
END $$;

-- Add unaccent to configuration
ALTER TEXT SEARCH CONFIGURATION hingecraft_search
    ALTER MAPPING FOR asciiword, word
    WITH unaccent, english_stem;

-- ============================================
-- SEARCH FUNCTIONS
-- ============================================

-- Function: Search members by name or twin name
CREATE OR REPLACE FUNCTION search_members(search_query TEXT)
RETURNS TABLE (
    "_id" VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    twin_name VARCHAR,
    country VARCHAR,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m."_id",
        m.first_name,
        m.last_name,
        m.twin_name,
        m.country,
        ts_rank(
            to_tsvector('hingecraft_search',
                COALESCE(m.first_name, '') || ' ' ||
                COALESCE(m.last_name, '') || ' ' ||
                COALESCE(m.twin_name, '')
            ),
            plainto_tsquery('hingecraft_search', search_query)
        ) as rank
    FROM members m
    WHERE
        to_tsvector('hingecraft_search',
            COALESCE(m.first_name, '') || ' ' ||
            COALESCE(m.last_name, '') || ' ' ||
            COALESCE(m.twin_name, '')
        ) @@ plainto_tsquery('hingecraft_search', search_query)
        OR
        similarity(
            COALESCE(m.first_name, '') || ' ' ||
            COALESCE(m.last_name, '') || ' ' ||
            COALESCE(m.twin_name, ''),
            search_query
        ) > 0.3
    ORDER BY rank DESC, similarity(
        COALESCE(m.first_name, '') || ' ' ||
        COALESCE(m.last_name, '') || ' ' ||
        COALESCE(m.twin_name, ''),
        search_query
    ) DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function: Search chat messages by content
CREATE OR REPLACE FUNCTION search_chat_messages(search_query TEXT, room_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    "_id" VARCHAR,
    member_name VARCHAR,
    twin_name VARCHAR,
    country VARCHAR,
    room VARCHAR,
    message TEXT,
    "_createdDate" TIMESTAMP,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm."_id",
        cm.member_name,
        cm.twin_name,
        cm.country,
        cm.room,
        cm.message,
        cm."_createdDate",
        ts_rank(
            to_tsvector('hingecraft_search', cm.message),
            plainto_tsquery('hingecraft_search', search_query)
        ) as rank
    FROM chat_messages cm
    WHERE
        (room_filter IS NULL OR cm.room = room_filter)
        AND
        (
            to_tsvector('hingecraft_search', cm.message) @@ plainto_tsquery('hingecraft_search', search_query)
            OR
            similarity(cm.message, search_query) > 0.2
        )
    ORDER BY rank DESC, cm."_createdDate" DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Function: Search chat clubs by name or description
CREATE OR REPLACE FUNCTION search_chat_clubs(search_query TEXT)
RETURNS TABLE (
    "_id" VARCHAR,
    club_name VARCHAR,
    category VARCHAR,
    member_count INTEGER,
    status VARCHAR,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc."_id",
        cc.club_name,
        cc.category,
        cc.member_count,
        cc.status,
        ts_rank(
            to_tsvector('hingecraft_search',
                COALESCE(cc.club_name, '') || ' ' ||
                COALESCE(cc.description, '') || ' ' ||
                COALESCE(cc.category, '')
            ),
            plainto_tsquery('hingecraft_search', search_query)
        ) as rank
    FROM chat_clubs cc
    WHERE
        to_tsvector('hingecraft_search',
            COALESCE(cc.club_name, '') || ' ' ||
            COALESCE(cc.description, '') || ' ' ||
            COALESCE(cc.category, '')
        ) @@ plainto_tsquery('hingecraft_search', search_query)
        OR
        similarity(cc.club_name, search_query) > 0.3
    ORDER BY rank DESC, cc.member_count DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UNIFIED SEARCH FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION unified_search(search_query TEXT)
RETURNS TABLE (
    result_type TEXT,
    "_id" VARCHAR,
    title TEXT,
    description TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    -- Search members
    SELECT
        'member'::TEXT as result_type,
        m."_id"::VARCHAR,
        (m.first_name || ' ' || m.last_name)::TEXT as title,
        (COALESCE(m.twin_name, '') || ' - ' || COALESCE(m.country, ''))::TEXT as description,
        ts_rank(
            to_tsvector('hingecraft_search',
                COALESCE(m.first_name, '') || ' ' ||
                COALESCE(m.last_name, '') || ' ' ||
                COALESCE(m.twin_name, '')
            ),
            plainto_tsquery('hingecraft_search', search_query)
        ) as rank
    FROM members m
    WHERE
        to_tsvector('hingecraft_search',
            COALESCE(m.first_name, '') || ' ' ||
            COALESCE(m.last_name, '') || ' ' ||
            COALESCE(m.twin_name, '')
        ) @@ plainto_tsquery('hingecraft_search', search_query)
    
    UNION ALL
    
    -- Search chat clubs
    SELECT
        'club'::TEXT,
        cc."_id"::VARCHAR,
        cc.club_name::TEXT,
        (cc.category || ' - ' || cc.member_count::TEXT || ' members')::TEXT,
        ts_rank(
            to_tsvector('hingecraft_search', cc.club_name),
            plainto_tsquery('hingecraft_search', search_query)
        )
    FROM chat_clubs cc
    WHERE
        to_tsvector('hingecraft_search', cc.club_name) @@ plainto_tsquery('hingecraft_search', search_query)
    
    UNION ALL
    
    -- Search chat messages
    SELECT
        'message'::TEXT,
        cm."_id"::VARCHAR,
        (cm.member_name || ' in ' || cm.room)::TEXT,
        LEFT(cm.message, 100)::TEXT,
        ts_rank(
            to_tsvector('hingecraft_search', cm.message),
            plainto_tsquery('hingecraft_search', search_query)
        )
    FROM chat_messages cm
    WHERE
        to_tsvector('hingecraft_search', cm.message) @@ plainto_tsquery('hingecraft_search', search_query)
    
    ORDER BY rank DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEARCH STATISTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW v_search_statistics AS
SELECT
    'members' as collection,
    COUNT(*) as total_records,
    COUNT(CASE WHEN first_name IS NOT NULL OR last_name IS NOT NULL THEN 1 END) as searchable_records
FROM members

UNION ALL

SELECT
    'chat_clubs',
    COUNT(*),
    COUNT(CASE WHEN club_name IS NOT NULL THEN 1 END)
FROM chat_clubs

UNION ALL

SELECT
    'chat_messages',
    COUNT(*),
    COUNT(CASE WHEN message IS NOT NULL THEN 1 END)
FROM chat_messages;

COMMENT ON FUNCTION search_members IS 'Full-text search members by name or twin name';
COMMENT ON FUNCTION search_chat_messages IS 'Full-text search chat messages by content';
COMMENT ON FUNCTION search_chat_clubs IS 'Full-text search chat clubs by name';
COMMENT ON FUNCTION unified_search IS 'Unified search across all collections';

