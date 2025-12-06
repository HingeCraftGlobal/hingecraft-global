-- Unified RAG Knowledge Base (V1) - Internal Intelligence System
-- Pulls all documents, PDFs, web content, brand scripts, legal frameworks,
-- systems, and marketing copy into a structured, query-ready database

-- ============================================
-- KNOWLEDGE DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type text NOT NULL, -- 'pdf', 'markdown', 'html', 'text', 'legal', 'brand', 'system', 'marketing'
    title text NOT NULL,
    source text, -- 'internal', 'external', 'web', 'upload'
    source_url text,
    file_path text,
    storage_key text, -- MinIO/S3 key
    content_text text, -- Full text content
    content_html text, -- HTML version if applicable
    content_jsonb jsonb DEFAULT '{}'::jsonb, -- Structured content
    file_size_bytes bigint,
    mime_type text,
    language text DEFAULT 'en',
    tags text[],
    category text, -- 'legal', 'brand', 'system', 'marketing', 'technical', 'governance'
    author text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_indexed_at timestamptz,
    is_indexed boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_type ON knowledge_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_category ON knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tags ON knowledge_documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_indexed ON knowledge_documents(is_indexed);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_content_search ON knowledge_documents USING gin(to_tsvector('english', content_text));

-- ============================================
-- DOCUMENT CHUNKS (For Vector Search)
-- ============================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_number integer NOT NULL,
    content_text text NOT NULL,
    content_tokens integer, -- Token count for LLM context
    embedding vector(1536), -- OpenAI ada-002 or similar (adjust dimension as needed)
    chunk_type text DEFAULT 'paragraph', -- 'paragraph', 'section', 'page', 'table'
    page_number integer,
    section_title text,
    start_char_index integer,
    end_char_index integer,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(document_id, chunk_number)
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops); -- Requires pgvector extension
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_search ON document_chunks USING gin(to_tsvector('english', content_text));

-- ============================================
-- KNOWLEDGE QUERIES (RAG Query Log)
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_queries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text text NOT NULL,
    query_embedding vector(1536),
    user_id uuid REFERENCES users(id),
    agent_type text, -- 'legal', 'marketing', 'engineering', 'education', 'community', 'crypto'
    retrieved_chunks uuid[], -- Array of document_chunks.id
    retrieved_documents uuid[], -- Array of knowledge_documents.id
    response_text text,
    confidence_score numeric(3,2),
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_knowledge_queries_user_id ON knowledge_queries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_queries_agent_type ON knowledge_queries(agent_type);

-- ============================================
-- DOCUMENT RELATIONSHIPS
-- ============================================
CREATE TABLE IF NOT EXISTS document_relationships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_document_id uuid REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    target_document_id uuid REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    relationship_type text NOT NULL, -- 'references', 'supersedes', 'related_to', 'part_of', 'version_of'
    strength numeric(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(source_document_id, target_document_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_document_relationships_source ON document_relationships(source_document_id);
CREATE INDEX IF NOT EXISTS idx_document_relationships_target ON document_relationships(target_document_id);

-- ============================================
-- KNOWLEDGE CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name text UNIQUE NOT NULL,
    parent_category_id uuid REFERENCES knowledge_categories(id),
    description text,
    icon text,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_knowledge_categories_parent ON knowledge_categories(parent_category_id);

COMMENT ON TABLE knowledge_documents IS 'Master knowledge base documents - PDFs, web content, legal, brand, marketing';
COMMENT ON TABLE document_chunks IS 'Chunked documents for vector search and RAG';
COMMENT ON TABLE knowledge_queries IS 'RAG query log for analytics and improvement';
COMMENT ON TABLE document_relationships IS 'Relationships between documents';
COMMENT ON TABLE knowledge_categories IS 'Hierarchical knowledge categories';




