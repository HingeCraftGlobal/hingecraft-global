#!/usr/bin/env python3
"""
Master script to load ALL HingeCraft data into the database.
Loads:
- Donations from COMPLETE_DATABASE_EXPORT.json and donations_wix_import.csv
- Members from registry_import.csv
"""

import os
import sys
import json
import csv
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from uuid import uuid4

# Database connection defaults (match docker-compose.yml)
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'hingecraft_db'),
    'user': os.getenv('DB_USER', 'hingecraft_user'),
    'password': os.getenv('DB_PASSWORD', 'hingecraft_secure_password_123')
}

def get_conn():
    """Get database connection"""
    try:
        return psycopg2.connect(**DB_CONFIG)
    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)

def ensure_members_table(conn):
    """Ensure members table exists with correct schema"""
    cur = conn.cursor()
    
    # Check if table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'members'
        );
    """)
    
    if not cur.fetchone()[0]:
        print("📋 Creating members table...")
        cur.execute("""
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
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create indexes
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_members_membership_id ON members(membership_id);
            CREATE INDEX IF NOT EXISTS idx_members_created_date ON members("_createdDate" DESC);
            CREATE INDEX IF NOT EXISTS idx_members_country ON members(country);
        """)
        
        # Create trigger for _updatedDate
        cur.execute("""
            CREATE OR REPLACE FUNCTION update_members_updated_date()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW."_updatedDate" = CURRENT_TIMESTAMP;
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        """)
        
        cur.execute("""
            DROP TRIGGER IF EXISTS update_members_updated_date_trigger ON members;
            CREATE TRIGGER update_members_updated_date_trigger
                BEFORE UPDATE ON members
                FOR EACH ROW
                EXECUTE FUNCTION update_members_updated_date();
        """)
        
        conn.commit()
        print("✅ Members table created")
    else:
        print("✅ Members table already exists")

def load_donations_from_json(conn, json_path):
    """Load donations from JSON export"""
    if not os.path.exists(json_path):
        print(f"⚠️  JSON file not found: {json_path}")
        return 0
    
    print(f"📥 Loading donations from {json_path}...")
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    if not data.get('ok') or not data.get('data', {}).get('donations'):
        print("⚠️  No donations found in JSON")
        return 0
    
    donations = data['data']['donations']
    cur = conn.cursor()
    loaded = 0
    
    for donation in donations:
        try:
            # Use existing _id or generate new one
            _id = donation.get('_id') or donation.get('id') or str(uuid4())
            
            # Check if already exists
            cur.execute('SELECT "_id" FROM donations WHERE "_id" = %s', (_id,))
            if cur.fetchone():
                continue  # Skip duplicates
            
            cur.execute("""
                INSERT INTO donations (
                    "_id", "_createdDate", "_updatedDate", "_owner",
                    id, amount, currency, is_other_amount, source,
                    payment_status, payment_method, transaction_id,
                    member_email, member_name, created_at, updated_at, metadata
                ) VALUES (
                    %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s, %s, %s
                ) ON CONFLICT ("_id") DO NOTHING
            """, (
                _id,
                donation.get('_createdDate') or donation.get('created_at') or datetime.now().isoformat(),
                donation.get('_updatedDate') or donation.get('updated_at') or datetime.now().isoformat(),
                donation.get('_owner', 'system'),
                donation.get('id') or _id,
                donation.get('amount'),
                donation.get('currency', 'USD'),
                donation.get('is_other_amount', False),
                donation.get('source', 'payment_page'),
                donation.get('payment_status', 'completed'),
                donation.get('payment_method'),
                donation.get('transaction_id'),
                donation.get('member_email'),
                donation.get('member_name'),
                donation.get('created_at') or donation.get('_createdDate'),
                donation.get('updated_at') or donation.get('_updatedDate'),
                json.dumps(donation.get('metadata')) if donation.get('metadata') else None
            ))
            loaded += 1
        except Exception as e:
            print(f"⚠️  Error loading donation {donation.get('_id', 'unknown')}: {e}")
            continue
    
    conn.commit()
    print(f"✅ Loaded {loaded} donations from JSON")
    return loaded

def load_donations_from_csv(conn, csv_path):
    """Load donations from CSV"""
    if not os.path.exists(csv_path):
        print(f"⚠️  CSV file not found: {csv_path}")
        return 0
    
    print(f"📥 Loading donations from {csv_path}...")
    
    cur = conn.cursor()
    loaded = 0
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                _id = row.get('_id') or row.get('id') or str(uuid4())
                
                # Check if already exists
                cur.execute('SELECT "_id" FROM donations WHERE "_id" = %s', (_id,))
                if cur.fetchone():
                    continue
                
                cur.execute("""
                    INSERT INTO donations (
                        "_id", "_createdDate", "_updatedDate", "_owner",
                        id, amount, currency, is_other_amount, source,
                        payment_status, payment_method, transaction_id,
                        member_email, member_name, created_at, updated_at, metadata
                    ) VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s, %s, %s
                    ) ON CONFLICT ("_id") DO NOTHING
                """, (
                    _id,
                    row.get('_createdDate') or row.get('created_at') or datetime.now().isoformat(),
                    row.get('_updatedDate') or row.get('updated_at') or datetime.now().isoformat(),
                    row.get('_owner', 'system'),
                    row.get('id') or _id,
                    row.get('amount'),
                    row.get('currency', 'USD'),
                    row.get('is_other_amount', 'false').lower() == 'true',
                    row.get('source', 'payment_page'),
                    row.get('payment_status', 'completed'),
                    row.get('payment_method'),
                    row.get('transaction_id'),
                    row.get('member_email'),
                    row.get('member_name'),
                    row.get('created_at') or row.get('_createdDate'),
                    row.get('updated_at') or row.get('_updatedDate'),
                    row.get('metadata')
                ))
                loaded += 1
            except Exception as e:
                print(f"⚠️  Error loading donation row: {e}")
                continue
    
    conn.commit()
    print(f"✅ Loaded {loaded} donations from CSV")
    return loaded

def load_members_from_csv(conn, csv_path):
    """Load members from registry CSV"""
    if not os.path.exists(csv_path):
        print(f"⚠️  CSV file not found: {csv_path}")
        return 0
    
    print(f"📥 Loading members from {csv_path}...")
    
    cur = conn.cursor()
    loaded = 0
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                membership_id = row.get('membership_id', '').strip()
                if not membership_id or membership_id == 'hidden':
                    continue
                
                _id = row.get('_id') or membership_id or str(uuid4())
                
                # Check if already exists
                cur.execute('SELECT "_id" FROM members WHERE membership_id = %s', (membership_id,))
                if cur.fetchone():
                    continue  # Skip duplicates
                
                cur.execute("""
                    INSERT INTO members (
                        "_id", "_createdDate", "_updatedDate", "_owner",
                        first_name, last_name, twin_name, membership_id,
                        city, region, country, registry_date, source_file, metadata
                    ) VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s
                    ) ON CONFLICT (membership_id) DO NOTHING
                """, (
                    _id,
                    row.get('_createdDate') or datetime.now().isoformat(),
                    row.get('_updatedDate') or datetime.now().isoformat(),
                    row.get('_owner', 'system'),
                    row.get('first_name'),
                    row.get('last_name'),
                    row.get('twin_name'),
                    membership_id,
                    row.get('city'),
                    row.get('region'),
                    row.get('country'),
                    row.get('registry_date'),
                    row.get('source_file'),
                    json.dumps({'source': 'registry_import'}) if row.get('source_file') else None
                ))
                loaded += 1
            except Exception as e:
                print(f"⚠️  Error loading member row: {e}")
                continue
    
    conn.commit()
    print(f"✅ Loaded {loaded} members from CSV")
    return loaded

def main():
    """Main execution"""
    print("🚀 Starting HingeCraft database load...")
    print(f"📊 Database: {DB_CONFIG['database']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    database_dir = os.path.join(project_root, 'database')
    
    conn = get_conn()
    print("✅ Connected to database")
    
    try:
        # Ensure members table exists
        ensure_members_table(conn)
        
        # Load donations
        donations_json = os.path.join(database_dir, 'COMPLETE_DATABASE_EXPORT.json')
        donations_csv = os.path.join(database_dir, 'donations_wix_import.csv')
        
        donations_loaded = 0
        donations_loaded += load_donations_from_json(conn, donations_json)
        donations_loaded += load_donations_from_csv(conn, donations_csv)
        
        # Load members
        members_csv = os.path.join(database_dir, 'registry_import.csv')
        members_loaded = load_members_from_csv(conn, members_csv)
        
        # Summary
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM donations')
        total_donations = cur.fetchone()[0]
        
        cur.execute('SELECT COUNT(*) FROM members')
        total_members = cur.fetchone()[0]
        
        print("\n" + "="*60)
        print("✅ LOAD COMPLETE")
        print("="*60)
        print(f"📊 Total donations in DB: {total_donations}")
        print(f"👥 Total members in DB: {total_members}")
        print(f"📥 Donations loaded this run: {donations_loaded}")
        print(f"📥 Members loaded this run: {members_loaded}")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == '__main__':
    main()







