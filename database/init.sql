-- HingeCraft Donations Database Schema
-- This file is automatically executed when PostgreSQL container starts
-- UPDATED: Added Wix required columns (_id, _createdDate, _updatedDate, _owner)

-- ============================================
-- TABLE: donations
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
    -- Wix Required Columns (for read-write access) - Must be quoted for case sensitivity
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    -- Custom Donation Fields
    id VARCHAR(255) UNIQUE,  -- Keep for backward compatibility
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_other_amount BOOLEAN DEFAULT FALSE,
    source VARCHAR(100) DEFAULT 'payment_page',
    payment_status VARCHAR(50) DEFAULT 'completed',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    member_email VARCHAR(255),
    member_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Keep for backward compatibility
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Keep for backward compatibility
    metadata JSONB
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations("_createdDate" DESC);
CREATE INDEX IF NOT EXISTS idx_donations_transaction_id ON donations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_member_email ON donations(member_email);
CREATE INDEX IF NOT EXISTS idx_donations_owner ON donations("_owner");

-- ============================================
-- FUNCTION: Update _updatedDate timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."_updatedDate" = CURRENT_TIMESTAMP;
    NEW.updated_at = CURRENT_TIMESTAMP;  -- Also update backward compatibility field
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGER: Auto-update _updatedDate
-- ============================================
DROP TRIGGER IF EXISTS update_donations_updated_date ON donations;
CREATE TRIGGER update_donations_updated_date
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- ============================================
-- FUNCTION: Auto-set _id from id if not provided
-- ============================================
CREATE OR REPLACE FUNCTION set_wix_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If _id is not set, use id (if exists) or generate UUID
    IF NEW."_id" IS NULL OR NEW."_id" = '' THEN
        -- Check if table has 'id' column (for donations table)
        BEGIN
            IF NEW.id IS NOT NULL AND NEW.id != '' THEN
                NEW."_id" := NEW.id;
            ELSE
                NEW."_id" := gen_random_uuid()::VARCHAR;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Table doesn't have 'id' column, just generate UUID
            NEW."_id" := gen_random_uuid()::VARCHAR;
        END;
    END IF;
    
    -- If table has 'id' column and it's not set, use _id
    BEGIN
        IF NEW.id IS NULL OR NEW.id = '' THEN
            NEW.id := NEW."_id";
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Table doesn't have 'id' column, skip
        NULL;
    END;
    
    -- Set _createdDate if not set
    IF NEW."_createdDate" IS NULL THEN
        NEW."_createdDate" := CURRENT_TIMESTAMP;
    END IF;
    
    -- Set _updatedDate if not set
    IF NEW."_updatedDate" IS NULL THEN
        NEW."_updatedDate" := CURRENT_TIMESTAMP;
    END IF;
    
    -- Set _owner if not set
    IF NEW."_owner" IS NULL OR NEW."_owner" = '' THEN
        NEW."_owner" := 'system';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGER: Auto-set _id
-- ============================================
DROP TRIGGER IF EXISTS set_donations_wix_id ON donations;
CREATE TRIGGER set_donations_wix_id
    BEFORE INSERT ON donations
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: members (registry)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',

    first_name VARCHAR(255),
    last_name VARCHAR(255),
    twin_name VARCHAR(255),
    membership_id VARCHAR(255) UNIQUE,
    city VARCHAR(255),
    region VARCHAR(255),
    country VARCHAR(255),
    registry_date VARCHAR(50),
    source_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_members_created_at ON members("_createdDate" DESC);
CREATE INDEX IF NOT EXISTS idx_members_membership_id ON members(membership_id);
CREATE INDEX IF NOT EXISTS idx_members_country ON members(country);
CREATE INDEX IF NOT EXISTS idx_members_owner ON members("_owner");

DROP TRIGGER IF EXISTS update_members_updated_date ON members;
CREATE TRIGGER update_members_updated_date
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_members_wix_id ON members;
CREATE TRIGGER set_members_wix_id
    BEFORE INSERT ON members
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: chat_clubs
-- ============================================
CREATE TABLE IF NOT EXISTS chat_clubs (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    club_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    description TEXT,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_clubs_category ON chat_clubs(category);
CREATE INDEX IF NOT EXISTS idx_chat_clubs_status ON chat_clubs(status);
CREATE INDEX IF NOT EXISTS idx_chat_clubs_created_at ON chat_clubs("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_chat_clubs_updated_date ON chat_clubs;
CREATE TRIGGER update_chat_clubs_updated_date
    BEFORE UPDATE ON chat_clubs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_chat_clubs_wix_id ON chat_clubs;
CREATE TRIGGER set_chat_clubs_wix_id
    BEFORE INSERT ON chat_clubs
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: chat_messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    member_name VARCHAR(255),
    twin_name VARCHAR(255),
    country VARCHAR(100),
    room VARCHAR(255),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room);
CREATE INDEX IF NOT EXISTS idx_chat_messages_country ON chat_messages(country);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_chat_messages_updated_date ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_date
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_chat_messages_wix_id ON chat_messages;
CREATE TRIGGER set_chat_messages_wix_id
    BEFORE INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();

-- ============================================
-- TABLE: ambassadors
-- ============================================
CREATE TABLE IF NOT EXISTS ambassadors (
    "_id" VARCHAR(255) PRIMARY KEY,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_owner" VARCHAR(255) DEFAULT 'system',
    
    ambassador_name VARCHAR(255),
    email VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(255),
    campaign_name VARCHAR(255),
    program_type VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    impact_metrics JSONB,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_ambassadors_country ON ambassadors(country);
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON ambassadors(status);
CREATE INDEX IF NOT EXISTS idx_ambassadors_created_at ON ambassadors("_createdDate" DESC);

DROP TRIGGER IF EXISTS update_ambassadors_updated_date ON ambassadors;
CREATE TRIGGER update_ambassadors_updated_date
    BEFORE UPDATE ON ambassadors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

DROP TRIGGER IF EXISTS set_ambassadors_wix_id ON ambassadors;
CREATE TRIGGER set_ambassadors_wix_id
    BEFORE INSERT ON ambassadors
    FOR EACH ROW
    EXECUTE FUNCTION set_wix_id();
