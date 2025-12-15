-- HingeCraft Donations Database Schema
-- For External Database Adaptor (Custom)
-- This schema can be used with any SQL database (PostgreSQL, MySQL, etc.)

-- ============================================
-- TABLE: donations
-- ============================================
CREATE TABLE donations (
    id VARCHAR(255) PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_other_amount BOOLEAN DEFAULT FALSE,
    source VARCHAR(100) DEFAULT 'payment_page',
    payment_status VARCHAR(50) DEFAULT 'completed',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    member_email VARCHAR(255),
    member_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    metadata JSON
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_donations_transaction_id ON donations(transaction_id);
CREATE INDEX idx_donations_payment_status ON donations(payment_status);
CREATE INDEX idx_donations_member_email ON donations(member_email);

-- ============================================
-- API ENDPOINTS REQUIRED
-- ============================================
-- Your external database adaptor must implement these endpoints:

-- GET /donations/latest
-- Returns: { id, amount, currency, is_other_amount, created_at }

-- POST /donations
-- Body: { amount, currency, is_other_amount, source, payment_status, payment_method, transaction_id, member_email, member_name, metadata }
-- Returns: { id, amount, created_at }

-- GET /donations?limit={limit}
-- Returns: { donations: [...], total: number }

-- GET /donations/{id}
-- Returns: { id, amount, currency, is_other_amount, created_at, ... }

-- PATCH /donations/{id}
-- Body: { payment_status, updated_at }
-- Returns: { id, payment_status, updated_at }

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================
-- INSERT INTO donations (id, amount, currency, is_other_amount, source, payment_status, created_at) 
-- VALUES ('donation_001', 50.00, 'USD', TRUE, 'payment_page', 'completed', NOW());





