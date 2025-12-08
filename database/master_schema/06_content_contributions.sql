-- Multi-Layer Data Model: Content Contributions Layer
-- Articles, tutorials, documentation, media

-- ============================================
-- CONTENT ARTICLES
-- ============================================
CREATE TABLE IF NOT EXISTS content_articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by uuid REFERENCES users(id),
    title text NOT NULL,
    slug text UNIQUE,
    content text NOT NULL,
    excerpt text,
    content_type text DEFAULT 'article', -- 'article', 'tutorial', 'documentation', 'blog', 'news'
    category text,
    tags text[],
    status text DEFAULT 'draft', -- 'draft', 'review', 'published', 'archived'
    published_at timestamptz,
    views_count integer DEFAULT 0,
    likes_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_content_articles_created_by ON content_articles(created_by);
CREATE INDEX IF NOT EXISTS idx_content_articles_status ON content_articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_articles_slug ON content_articles(slug);
CREATE INDEX IF NOT EXISTS idx_content_articles_tags ON content_articles USING gin(tags);

-- ============================================
-- CONTENT MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS content_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id uuid REFERENCES content_articles(id) ON DELETE CASCADE,
    media_type text NOT NULL, -- 'image', 'video', 'audio', 'document', 'embed'
    url text,
    storage_key text,
    filename text,
    mime_type text,
    size_bytes bigint,
    alt_text text,
    caption text,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_content_media_article_id ON content_media(article_id);
CREATE INDEX IF NOT EXISTS idx_content_media_type ON content_media(media_type);

-- ============================================
-- CONTENT REVISIONS
-- ============================================
CREATE TABLE IF NOT EXISTS content_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id uuid REFERENCES content_articles(id) ON DELETE CASCADE,
    revision_number integer NOT NULL,
    content text NOT NULL,
    changed_by uuid REFERENCES users(id),
    change_summary text,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(article_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_content_revisions_article_id ON content_revisions(article_id);

-- ============================================
-- CONTENT COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS content_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id uuid REFERENCES content_articles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    parent_comment_id uuid REFERENCES content_comments(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_approved boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_content_comments_article_id ON content_comments(article_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_comments_user_id ON content_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent ON content_comments(parent_comment_id);

-- ============================================
-- CONTENT CONTRIBUTIONS (Attribution)
-- ============================================
CREATE TABLE IF NOT EXISTS content_contributions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id uuid REFERENCES content_articles(id) ON DELETE CASCADE,
    contributor_id uuid REFERENCES users(id) ON DELETE CASCADE,
    contribution_type text NOT NULL, -- 'author', 'editor', 'reviewer', 'translator', 'illustrator'
    contribution_percentage integer DEFAULT 0, -- For revenue sharing
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(article_id, contributor_id, contribution_type)
);

CREATE INDEX IF NOT EXISTS idx_content_contributions_article_id ON content_contributions(article_id);
CREATE INDEX IF NOT EXISTS idx_content_contributions_contributor_id ON content_contributions(contributor_id);

COMMENT ON TABLE content_articles IS 'Content articles and documentation';
COMMENT ON TABLE content_media IS 'Media assets for content';
COMMENT ON TABLE content_revisions IS 'Version history for content';
COMMENT ON TABLE content_comments IS 'Comments on content';
COMMENT ON TABLE content_contributions IS 'Contributor attribution and revenue sharing';








-- ============================================
-- TRIGGERS FOR content_articles
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER trigger_content_articles_updated_at
    BEFORE UPDATE ON content_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger
CREATE TRIGGER trigger_content_articles_audit
    AFTER INSERT OR UPDATE OR DELETE ON content_articles
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

