-- Multi-Layer Data Model: Community Activity Layer
-- Chat clubs, messages, events, memberships

-- ============================================
-- COMMUNITY GROUPS (Chat Clubs Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS community_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE,
    category text,
    description text,
    member_count integer DEFAULT 0,
    status text DEFAULT 'active', -- 'active', 'archived', 'private'
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Wix compatibility (maps to chat_clubs)
    "_id" VARCHAR(255) UNIQUE,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_community_groups_category ON community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_status ON community_groups(status);
CREATE INDEX IF NOT EXISTS idx_community_groups_slug ON community_groups(slug);

-- ============================================
-- GROUP MEMBERSHIPS
-- ============================================
CREATE TABLE IF NOT EXISTS group_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role text DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at timestamptz DEFAULT now(),
    left_at timestamptz,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(group_id, user_id, is_active) WHERE is_active = true
);

CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);

-- ============================================
-- COMMUNITY MESSAGES (Enhanced Chat Messages)
-- ============================================
CREATE TABLE IF NOT EXISTS community_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    message text NOT NULL,
    message_type text DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    reply_to_id uuid REFERENCES community_messages(id) ON DELETE SET NULL,
    edited_at timestamptz,
    deleted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Wix compatibility (maps to chat_messages)
    "_id" VARCHAR(255) UNIQUE,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_community_messages_group_id ON community_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_reply_to ON community_messages(reply_to_id);

-- ============================================
-- COMMUNITY EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS community_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES community_groups(id) ON DELETE SET NULL,
    created_by uuid REFERENCES users(id),
    title text NOT NULL,
    description text,
    event_type text, -- 'meetup', 'workshop', 'webinar', 'hackathon'
    start_time timestamptz NOT NULL,
    end_time timestamptz,
    location jsonb DEFAULT '{}'::jsonb, -- {type: 'online'|'physical', url, address}
    max_attendees integer,
    attendee_count integer DEFAULT 0,
    status text DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_community_events_group_id ON community_events(group_id);
CREATE INDEX IF NOT EXISTS idx_community_events_start_time ON community_events(start_time);
CREATE INDEX IF NOT EXISTS idx_community_events_status ON community_events(status);

-- ============================================
-- EVENT ATTENDANCES
-- ============================================
CREATE TABLE IF NOT EXISTS event_attendances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES community_events(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status text DEFAULT 'registered', -- 'registered', 'attended', 'no_show', 'cancelled'
    registered_at timestamptz DEFAULT now(),
    checked_in_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendances_event_id ON event_attendances(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendances_user_id ON event_attendances(user_id);

COMMENT ON TABLE community_groups IS 'Community groups and chat clubs';
COMMENT ON TABLE group_memberships IS 'User memberships in groups';
COMMENT ON TABLE community_messages IS 'Messages within community groups';
COMMENT ON TABLE community_events IS 'Community events and meetups';
COMMENT ON TABLE event_attendances IS 'Event registration and attendance';








-- ============================================
-- TRIGGERS FOR community_groups
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER trigger_community_groups_updated_at
    BEFORE UPDATE ON community_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger
CREATE TRIGGER trigger_community_groups_audit
    AFTER INSERT OR UPDATE OR DELETE ON community_groups
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

