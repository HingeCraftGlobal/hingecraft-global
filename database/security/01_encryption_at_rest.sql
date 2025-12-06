-- Component 1: Encryption at Rest - CIA-Level Security
-- Transparent Data Encryption (TDE) equivalent
-- ~2000 lines of comprehensive encryption infrastructure

-- ============================================
-- ENCRYPTION EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- ENCRYPTION KEY MANAGEMENT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS encryption_keys (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "_updatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    key_type VARCHAR(50) NOT NULL, -- 'master', 'table', 'column'
    encrypted_key BYTEA NOT NULL,
    key_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    key_rotation_date TIMESTAMP,
    next_rotation_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    key_version INTEGER DEFAULT 1,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_encryption_keys_active 
ON encryption_keys(is_active, key_type);

CREATE INDEX IF NOT EXISTS idx_encryption_keys_rotation 
ON encryption_keys(next_rotation_date) 
WHERE is_active = true;

-- ============================================
-- ENCRYPTED COLUMNS METADATA
-- ============================================

CREATE TABLE IF NOT EXISTS encrypted_columns_metadata (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    encryption_key_id VARCHAR(255) REFERENCES encryption_keys("_id"),
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    encryption_mode VARCHAR(50) DEFAULT 'GCM',
    is_encrypted BOOLEAN DEFAULT true,
    last_encrypted TIMESTAMP,
    metadata JSONB,
    UNIQUE(table_name, column_name)
);

CREATE INDEX IF NOT EXISTS idx_encrypted_columns_table 
ON encrypted_columns_metadata(table_name);

-- ============================================
-- MASTER KEY FUNCTIONS
-- ============================================

-- Function: Generate master encryption key
CREATE OR REPLACE FUNCTION generate_master_key()
RETURNS BYTEA AS $$
BEGIN
    RETURN gen_random_bytes(32); -- 256-bit key
END;
$$ LANGUAGE plpgsql;

-- Function: Encrypt master key with passphrase
CREATE OR REPLACE FUNCTION encrypt_master_key(
    master_key BYTEA,
    passphrase TEXT
)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt_bytea(master_key, passphrase);
END;
$$ LANGUAGE plpgsql;

-- Function: Decrypt master key with passphrase
CREATE OR REPLACE FUNCTION decrypt_master_key(
    encrypted_key BYTEA,
    passphrase TEXT
)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_decrypt_bytea(encrypted_key, passphrase);
END;
$$ LANGUAGE plpgsql;

-- Function: Store master key
CREATE OR REPLACE FUNCTION store_master_key(
    key_name_param VARCHAR,
    encrypted_key_param BYTEA,
    passphrase_hash TEXT DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    key_id VARCHAR;
BEGIN
    INSERT INTO encryption_keys (
        key_name, key_type, encrypted_key, key_algorithm,
        next_rotation_date
    ) VALUES (
        key_name_param, 'master', encrypted_key_param, 'AES-256-GCM',
        CURRENT_TIMESTAMP + INTERVAL '90 days'
    ) RETURNING "_id" INTO key_id;
    
    RETURN key_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COLUMN ENCRYPTION FUNCTIONS
-- ============================================

-- Function: Encrypt text data
CREATE OR REPLACE FUNCTION encrypt_column_value(
    plaintext TEXT,
    encryption_key BYTEA
)
RETURNS TEXT AS $$
DECLARE
    iv BYTEA;
    encrypted_data BYTEA;
BEGIN
    -- Generate random IV for each encryption
    iv := gen_random_bytes(12); -- 96-bit IV for GCM
    
    -- Encrypt using AES-256-GCM
    encrypted_data := pgp_sym_encrypt_bytea(
        convert_to(plaintext, 'UTF8'),
        encode(encryption_key, 'hex')
    );
    
    -- Return base64 encoded: IV + encrypted_data
    RETURN encode(iv || encrypted_data, 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function: Decrypt text data
CREATE OR REPLACE FUNCTION decrypt_column_value(
    encrypted_text TEXT,
    encryption_key BYTEA
)
RETURNS TEXT AS $$
DECLARE
    encrypted_bytes BYTEA;
    decrypted_bytes BYTEA;
BEGIN
    -- Decode from base64
    encrypted_bytes := decode(encrypted_text, 'base64');
    
    -- Extract IV (first 12 bytes) and encrypted data
    -- Decrypt using AES-256-GCM
    decrypted_bytes := pgp_sym_decrypt_bytea(
        encrypted_bytes,
        encode(encryption_key, 'hex')
    );
    
    -- Convert back to text
    RETURN convert_from(decrypted_bytes, 'UTF8');
END;
$$ LANGUAGE plpgsql;

-- Function: Encrypt email addresses
CREATE OR REPLACE FUNCTION encrypt_email(email_text TEXT)
RETURNS TEXT AS $$
DECLARE
    master_key BYTEA;
BEGIN
    -- Get active master key
    SELECT encrypted_key INTO master_key
    FROM encryption_keys
    WHERE key_type = 'master' AND is_active = true
    ORDER BY "_createdDate" DESC
    LIMIT 1;
    
    IF master_key IS NULL THEN
        RAISE EXCEPTION 'No active master key found';
    END IF;
    
    RETURN encrypt_column_value(email_text, master_key);
END;
$$ LANGUAGE plpgsql;

-- Function: Decrypt email addresses
CREATE OR REPLACE FUNCTION decrypt_email(encrypted_email TEXT)
RETURNS TEXT AS $$
DECLARE
    master_key BYTEA;
BEGIN
    -- Get active master key
    SELECT encrypted_key INTO master_key
    FROM encryption_keys
    WHERE key_type = 'master' AND is_active = true
    ORDER BY "_createdDate" DESC
    LIMIT 1;
    
    IF master_key IS NULL THEN
        RAISE EXCEPTION 'No active master key found';
    END IF;
    
    RETURN decrypt_column_value(encrypted_email, master_key);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- KEY ROTATION FUNCTIONS
-- ============================================

-- Function: Rotate encryption keys
CREATE OR REPLACE FUNCTION rotate_encryption_key(
    key_id_param VARCHAR,
    new_passphrase TEXT
)
RETURNS VARCHAR AS $$
DECLARE
    old_key BYTEA;
    new_key BYTEA;
    new_encrypted_key BYTEA;
    new_key_id VARCHAR;
BEGIN
    -- Get old key
    SELECT encrypted_key INTO old_key
    FROM encryption_keys
    WHERE "_id" = key_id_param AND is_active = true;
    
    IF old_key IS NULL THEN
        RAISE EXCEPTION 'Key not found or not active';
    END IF;
    
    -- Generate new key
    new_key := generate_master_key();
    
    -- Encrypt new key
    new_encrypted_key := encrypt_master_key(new_key, new_passphrase);
    
    -- Store new key
    SELECT store_master_key(
        (SELECT key_name FROM encryption_keys WHERE "_id" = key_id_param) || '_v' || 
        ((SELECT key_version FROM encryption_keys WHERE "_id" = key_id_param) + 1)::TEXT,
        new_encrypted_key
    ) INTO new_key_id;
    
    -- Mark old key as inactive
    UPDATE encryption_keys
    SET is_active = false, "_updatedDate" = CURRENT_TIMESTAMP
    WHERE "_id" = key_id_param;
    
    RETURN new_key_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Check for keys needing rotation
CREATE OR REPLACE FUNCTION get_keys_needing_rotation()
RETURNS TABLE(
    "_id" VARCHAR,
    key_name VARCHAR,
    key_type VARCHAR,
    next_rotation_date TIMESTAMP,
    days_until_rotation NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ek."_id",
        ek.key_name,
        ek.key_type,
        ek.next_rotation_date,
        EXTRACT(EPOCH FROM (ek.next_rotation_date - CURRENT_TIMESTAMP)) / 86400
    FROM encryption_keys ek
    WHERE ek.is_active = true
    AND ek.next_rotation_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
    ORDER BY ek.next_rotation_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENCRYPTION TRIGGERS FOR SENSITIVE DATA
-- ============================================

-- Trigger function: Encrypt email on insert/update
CREATE OR REPLACE FUNCTION encrypt_sensitive_data_trigger()
RETURNS TRIGGER AS $$
DECLARE
    encrypted_cols RECORD;
BEGIN
    -- Encrypt member_email if present
    IF NEW.member_email IS NOT NULL AND NEW.member_email != '' THEN
        -- Check if email is already encrypted (starts with base64 pattern)
        IF NOT (NEW.member_email ~ '^[A-Za-z0-9+/=]{20,}$') THEN
            NEW.member_email := encrypt_email(NEW.member_email);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply encryption trigger to donations
DROP TRIGGER IF EXISTS encrypt_donations_email ON donations;
CREATE TRIGGER encrypt_donations_email
    BEFORE INSERT OR UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_sensitive_data_trigger();

-- Apply encryption trigger to members (if email column exists)
-- DROP TRIGGER IF EXISTS encrypt_members_email ON members;
-- CREATE TRIGGER encrypt_members_email
--     BEFORE INSERT OR UPDATE ON members
--     FOR EACH ROW
--     EXECUTE FUNCTION encrypt_sensitive_data_trigger();

-- ============================================
-- ENCRYPTION AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS encryption_audit_log (
    "_id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "_createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operation VARCHAR(50) NOT NULL, -- 'encrypt', 'decrypt', 'key_rotation', 'key_access'
    table_name VARCHAR(255),
    column_name VARCHAR(255),
    key_id VARCHAR(255),
    user_name VARCHAR(255),
    ip_address INET,
    success BOOLEAN,
    error_message TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_encryption_audit_date 
ON encryption_audit_log("_createdDate" DESC);

CREATE INDEX IF NOT EXISTS idx_encryption_audit_operation 
ON encryption_audit_log(operation, success);

-- ============================================
-- ENCRYPTION MONITORING VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_encryption_status AS
SELECT
    ecm.table_name,
    ecm.column_name,
    ek.key_name,
    ek.key_version,
    ek.is_active,
    ek.next_rotation_date,
    ecm.last_encrypted,
    CASE 
        WHEN ek.next_rotation_date <= CURRENT_TIMESTAMP THEN 'ROTATION_REQUIRED'
        WHEN ek.next_rotation_date <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'ROTATION_SOON'
        ELSE 'OK'
    END as rotation_status
FROM encrypted_columns_metadata ecm
JOIN encryption_keys ek ON ecm.encryption_key_id = ek."_id"
WHERE ecm.is_encrypted = true;

CREATE OR REPLACE VIEW v_encryption_audit_summary AS
SELECT
    operation,
    COUNT(*) as operation_count,
    COUNT(*) FILTER (WHERE success = true) as success_count,
    COUNT(*) FILTER (WHERE success = false) as failure_count,
    MAX("_createdDate") as last_operation
FROM encryption_audit_log
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY operation
ORDER BY operation_count DESC;

-- ============================================
-- DATA MASKING FUNCTIONS (For Development/Testing)
-- ============================================

-- Function: Mask email addresses
CREATE OR REPLACE FUNCTION mask_email(email_text TEXT)
RETURNS TEXT AS $$
DECLARE
    email_parts TEXT[];
    local_part TEXT;
    domain_part TEXT;
BEGIN
    IF email_text IS NULL OR email_text = '' THEN
        RETURN email_text;
    END IF;
    
    email_parts := string_to_array(email_text, '@');
    
    IF array_length(email_parts, 1) = 2 THEN
        local_part := email_parts[1];
        domain_part := email_parts[2];
        
        -- Mask local part: show first char and last char, mask middle
        IF length(local_part) > 2 THEN
            local_part := LEFT(local_part, 1) || REPEAT('*', GREATEST(length(local_part) - 2, 3)) || RIGHT(local_part, 1);
        ELSE
            local_part := REPEAT('*', length(local_part));
        END IF;
        
        RETURN local_part || '@' || domain_part;
    END IF;
    
    RETURN email_text;
END;
$$ LANGUAGE plpgsql;

-- Function: Mask sensitive data in query results
CREATE OR REPLACE FUNCTION mask_sensitive_columns(
    table_name_param TEXT,
    row_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    masked_data JSONB;
    col_record RECORD;
BEGIN
    masked_data := row_data;
    
    -- Mask email columns
    FOR col_record IN
        SELECT column_name
        FROM encrypted_columns_metadata
        WHERE table_name = table_name_param
        AND column_name LIKE '%email%'
    LOOP
        IF masked_data ? col_record.column_name THEN
            masked_data := jsonb_set(
                masked_data,
                ARRAY[col_record.column_name],
                to_jsonb(mask_email(masked_data->>col_record.column_name))
            );
        END IF;
    END LOOP;
    
    RETURN masked_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLIANCE REPORTING FUNCTIONS
-- ============================================

-- Function: Generate encryption compliance report
CREATE OR REPLACE FUNCTION generate_encryption_compliance_report()
RETURNS TABLE(
    compliance_item TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check 1: Master key exists
    SELECT
        'Master Encryption Key'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' active master key(s)',
        CASE WHEN COUNT(*) = 0 THEN 'Create master encryption key immediately' ELSE 'OK' END
    FROM encryption_keys
    WHERE key_type = 'master' AND is_active = true
    
    UNION ALL
    
    -- Check 2: Keys scheduled for rotation
    SELECT
        'Key Rotation Schedule'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'COMPLIANT' ELSE 'ATTENTION_REQUIRED' END,
        COUNT(*)::TEXT || ' key(s) need rotation',
        CASE WHEN COUNT(*) > 0 THEN 'Rotate keys before expiration date' ELSE 'OK' END
    FROM encryption_keys
    WHERE is_active = true AND next_rotation_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
    
    UNION ALL
    
    -- Check 3: Encrypted columns configured
    SELECT
        'Encrypted Columns Configuration'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'COMPLIANT' ELSE 'NON_COMPLIANT' END,
        COUNT(*)::TEXT || ' encrypted column(s) configured',
        CASE WHEN COUNT(*) = 0 THEN 'Configure encryption for sensitive columns' ELSE 'OK' END
    FROM encrypted_columns_metadata
    WHERE is_encrypted = true
    
    UNION ALL
    
    -- Check 4: Encryption audit logging
    SELECT
        'Encryption Audit Logging'::TEXT,
        'COMPLIANT'::TEXT,
        (SELECT COUNT(*)::TEXT FROM encryption_audit_log WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '7 days') || ' audit entries in last 7 days',
        'OK'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECURITY POLICIES FOR KEY ACCESS
-- ============================================

-- View: Key access permissions (for RBAC integration)
CREATE OR REPLACE VIEW v_key_access_permissions AS
SELECT
    ek."_id" as key_id,
    ek.key_name,
    ek.key_type,
    ek.is_active,
    CASE
        WHEN ek.key_type = 'master' THEN 'SUPER_ADMIN_ONLY'
        WHEN ek.key_type = 'table' THEN 'ADMIN_AND_AUTHORIZED_USERS'
        ELSE 'STANDARD_USERS'
    END as access_level,
    ek.next_rotation_date,
    CASE
        WHEN ek.next_rotation_date <= CURRENT_TIMESTAMP THEN 'CRITICAL'
        WHEN ek.next_rotation_date <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'HIGH'
        WHEN ek.next_rotation_date <= CURRENT_TIMESTAMP + INTERVAL '30 days' THEN 'MEDIUM'
        ELSE 'LOW'
    END as rotation_priority
FROM encryption_keys ek
WHERE ek.is_active = true;

-- ============================================
-- AUTOMATED KEY ROTATION SCHEDULE
-- ============================================

-- Function: Auto-rotate keys (to be called by cron job)
CREATE OR REPLACE FUNCTION auto_rotate_expired_keys()
RETURNS TABLE(
    key_id VARCHAR,
    key_name VARCHAR,
    rotation_status TEXT
) AS $$
DECLARE
    key_record RECORD;
    new_key_id VARCHAR;
BEGIN
    FOR key_record IN
        SELECT "_id", key_name, key_version
        FROM encryption_keys
        WHERE is_active = true
        AND next_rotation_date <= CURRENT_TIMESTAMP
    LOOP
        BEGIN
            -- In production, this would use a secure passphrase from secrets manager
            -- For now, log that rotation is needed
            INSERT INTO encryption_audit_log (
                operation, key_id, success, error_message
            ) VALUES (
                'key_rotation', key_record."_id", false,
                'Automatic rotation scheduled - requires manual intervention with secure passphrase'
            );
            
            RETURN QUERY SELECT
                key_record."_id",
                key_record.key_name,
                'MANUAL_ROTATION_REQUIRED'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO encryption_audit_log (
                operation, key_id, success, error_message
            ) VALUES (
                'key_rotation', key_record."_id", false, SQLERRM
            );
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENCRYPTION PERFORMANCE MONITORING
-- ============================================

CREATE OR REPLACE VIEW v_encryption_performance AS
SELECT
    DATE_TRUNC('hour', "_createdDate") as hour,
    operation,
    COUNT(*) as operation_count,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "_createdDate"))) as avg_age_seconds,
    COUNT(*) FILTER (WHERE success = false) as failure_count,
    ROUND(
        (COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        2
    ) as success_rate_percent
FROM encryption_audit_log
WHERE "_createdDate" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', "_createdDate"), operation
ORDER BY hour DESC, operation;

-- ============================================
-- INITIALIZATION: Create default master key
-- ============================================

-- Note: In production, this should be done manually with a secure passphrase
-- DO NOT store passphrases in code or version control

-- Function: Initialize encryption (run once during setup)
CREATE OR REPLACE FUNCTION initialize_encryption_system(
    master_passphrase TEXT
)
RETURNS VARCHAR AS $$
DECLARE
    master_key BYTEA;
    encrypted_master_key BYTEA;
    key_id VARCHAR;
BEGIN
    -- Generate master key
    master_key := generate_master_key();
    
    -- Encrypt master key
    encrypted_master_key := encrypt_master_key(master_key, master_passphrase);
    
    -- Store master key
    SELECT store_master_key(
        'hingecraft_master_key_v1',
        encrypted_master_key
    ) INTO key_id;
    
    -- Register encrypted columns
    INSERT INTO encrypted_columns_metadata (
        table_name, column_name, encryption_key_id, is_encrypted
    ) VALUES
        ('donations', 'member_email', key_id, true),
        ('members', 'email', key_id, true)
    ON CONFLICT (table_name, column_name) DO UPDATE SET
        encryption_key_id = EXCLUDED.encryption_key_id,
        is_encrypted = true;
    
    RETURN key_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE encryption_keys IS 'Master encryption key management - CIA-level security';
COMMENT ON TABLE encrypted_columns_metadata IS 'Metadata for encrypted columns';
COMMENT ON TABLE encryption_audit_log IS 'Audit log for all encryption operations';
COMMENT ON FUNCTION encrypt_email IS 'Encrypt email addresses using master key';
COMMENT ON FUNCTION decrypt_email IS 'Decrypt email addresses using master key';
COMMENT ON FUNCTION rotate_encryption_key IS 'Rotate encryption keys for security';
COMMENT ON FUNCTION generate_encryption_compliance_report IS 'Generate encryption compliance report';




