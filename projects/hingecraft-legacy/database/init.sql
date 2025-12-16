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
    -- If _id is not set, use id or generate UUID
    IF NEW."_id" IS NULL OR NEW."_id" = '' THEN
        IF NEW.id IS NOT NULL AND NEW.id != '' THEN
            NEW."_id" := NEW.id;
        ELSE
            NEW."_id" := gen_random_uuid()::VARCHAR;
        END IF;
    END IF;
    
    -- If id is not set, use _id
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := NEW."_id";
    END IF;
    
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
