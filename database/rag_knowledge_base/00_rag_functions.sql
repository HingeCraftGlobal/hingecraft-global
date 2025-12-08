-- RAG Knowledge Base Functions
-- Functions for querying and managing the RAG knowledge base

-- ============================================
-- SEARCH FUNCTIONS
-- ============================================

-- Search knowledge documents by text
CREATE OR REPLACE FUNCTION search_knowledge_documents(
    search_query TEXT,
    document_types TEXT[] DEFAULT NULL,
    categories TEXT[] DEFAULT NULL,
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    document_id UUID,
    title TEXT,
    document_type TEXT,
    category TEXT,
    relevance REAL,
    snippet TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kd.id as document_id,
        kd.title,
        kd.document_type,
        kd.category,
        ts_rank_cd(
            to_tsvector('english', kd.title || ' ' || COALESCE(kd.content_text, '')),
            plainto_tsquery('english', search_query)
        )::REAL as relevance,
        ts_headline(
            'english',
            COALESCE(kd.content_text, kd.title),
            plainto_tsquery('english', search_query),
            'MaxWords=30, MinWords=10'
        )::TEXT as snippet
    FROM knowledge_documents kd
    WHERE to_tsvector('english', kd.title || ' ' || COALESCE(kd.content_text, ''))
        @@ plainto_tsquery('english', search_query)
    AND (document_types IS NULL OR kd.document_type = ANY(document_types))
    AND (categories IS NULL OR kd.category = ANY(categories))
    AND kd.is_indexed = TRUE
    ORDER BY relevance DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_knowledge_documents(TEXT, TEXT[], TEXT[], INTEGER) IS 'Search knowledge documents by text query';

-- ============================================
-- VECTOR SEARCH FUNCTIONS (Requires pgvector)
-- ============================================

-- Vector similarity search (requires pgvector extension)
CREATE OR REPLACE FUNCTION vector_search_knowledge(
    query_embedding vector(1536),
    similarity_threshold NUMERIC DEFAULT 0.7,
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    chunk_id UUID,
    document_id UUID,
    title TEXT,
    content_text TEXT,
    similarity NUMERIC,
    chunk_number INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunk_id,
        dc.document_id,
        kd.title,
        dc.content_text,
        (1 - (dc.embedding <=> query_embedding))::NUMERIC as similarity,
        dc.chunk_number
    FROM document_chunks dc
    JOIN knowledge_documents kd ON dc.document_id = kd.id
    WHERE dc.embedding IS NOT NULL
    AND (1 - (dc.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION vector_search_knowledge(vector, NUMERIC, INTEGER) IS 'Vector similarity search for RAG (requires pgvector extension)';

-- ============================================
-- DOCUMENT MANAGEMENT FUNCTIONS
-- ============================================

-- Get document with chunks
CREATE OR REPLACE FUNCTION get_document_with_chunks(document_uuid UUID)
RETURNS TABLE(
    document JSONB,
    chunks JSONB[]
) AS $$
DECLARE
    doc_record RECORD;
    chunk_record RECORD;
    chunks_array JSONB[] := ARRAY[]::JSONB[];
BEGIN
    -- Get document
    SELECT 
        to_jsonb(kd.*) as doc
    INTO doc_record
    FROM knowledge_documents kd
    WHERE kd.id = document_uuid;
    
    -- Get chunks
    FOR chunk_record IN
        SELECT to_jsonb(dc.*) as chunk
        FROM document_chunks dc
        WHERE dc.document_id = document_uuid
        ORDER BY dc.chunk_number
    LOOP
        chunks_array := array_append(chunks_array, chunk_record.chunk);
    END LOOP;
    
    RETURN QUERY
    SELECT 
        doc_record.doc as document,
        chunks_array as chunks;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_document_with_chunks(UUID) IS 'Get document with all its chunks';

-- ============================================
-- RAG QUERY FUNCTIONS
-- ============================================

-- Log RAG query
CREATE OR REPLACE FUNCTION log_rag_query(
    query_text TEXT,
    user_uuid UUID DEFAULT NULL,
    agent_type TEXT DEFAULT NULL,
    retrieved_chunks UUID[] DEFAULT ARRAY[]::UUID[],
    retrieved_documents UUID[] DEFAULT ARRAY[]::UUID[],
    response_text TEXT DEFAULT NULL,
    confidence_score NUMERIC DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    query_id UUID;
BEGIN
    INSERT INTO knowledge_queries (
        query_text,
        user_id,
        agent_type,
        retrieved_chunks,
        retrieved_documents,
        response_text,
        confidence_score
    ) VALUES (
        query_text,
        user_uuid,
        agent_type,
        retrieved_chunks,
        retrieved_documents,
        response_text,
        confidence_score
    )
    RETURNING id INTO query_id;
    
    RETURN query_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_rag_query(TEXT, UUID, TEXT, UUID[], UUID[], TEXT, NUMERIC) IS 'Log a RAG query for analytics';

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Get query statistics
CREATE OR REPLACE FUNCTION get_rag_query_stats(
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
    agent_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
    total_queries BIGINT,
    unique_users BIGINT,
    avg_confidence NUMERIC,
    top_agent_type TEXT,
    top_queries TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_queries,
        COUNT(DISTINCT user_id)::BIGINT as unique_users,
        AVG(confidence_score)::NUMERIC as avg_confidence,
        MODE() WITHIN GROUP (ORDER BY agent_type)::TEXT as top_agent_type,
        ARRAY_AGG(DISTINCT query_text ORDER BY query_text)::TEXT[] as top_queries
    FROM knowledge_queries
    WHERE (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at <= end_date)
    AND (agent_type_filter IS NULL OR agent_type = agent_type_filter);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_rag_query_stats(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) IS 'Get RAG query statistics';

-- ============================================
-- INDEXING FUNCTIONS
-- ============================================

-- Mark document as indexed
CREATE OR REPLACE FUNCTION mark_document_indexed(document_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE knowledge_documents
    SET is_indexed = TRUE,
        last_indexed_at = NOW()
    WHERE id = document_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_document_indexed(UUID) IS 'Mark a document as indexed';

-- Get documents needing indexing
CREATE OR REPLACE FUNCTION get_documents_needing_indexing(limit_count INTEGER DEFAULT 100)
RETURNS TABLE(
    document_id UUID,
    title TEXT,
    document_type TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kd.id as document_id,
        kd.title,
        kd.document_type,
        kd.created_at
    FROM knowledge_documents kd
    WHERE kd.is_indexed = FALSE
    OR kd.last_indexed_at IS NULL
    OR kd.updated_at > kd.last_indexed_at
    ORDER BY kd.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_documents_needing_indexing(INTEGER) IS 'Get documents that need indexing';

