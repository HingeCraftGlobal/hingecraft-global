#!/usr/bin/env python3
"""
Load ALL segmented data into PostgreSQL database.
Loads:
- Charter list data (into members table)
- Chat clubs data (into chat_clubs table)
- Chat messages data (into chat_messages table)
- Ambassador data (into ambassadors table)
"""

import os
import sys
import json
import csv
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from uuid import uuid4

# Database connection defaults
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

def ensure_tables(conn):
    """Ensure all tables exist"""
    cur = conn.cursor()
    
    # Check and create tables if needed (they should exist from init.sql)
    tables = ['chat_clubs', 'chat_messages', 'ambassadors']
    for table in tables:
        cur.execute(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '{table}'
            );
        """)
        if not cur.fetchone()[0]:
            print(f"⚠️  Table {table} does not exist - please run database/init.sql")
    
    conn.commit()

def load_charter_to_members(conn, csv_path):
    """Load charter list data into members table"""
    if not os.path.exists(csv_path):
        return 0
    
    print(f"📥 Loading charter data from {csv_path}...")
    cur = conn.cursor()
    loaded = 0
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                membership_id = row.get('membership_id', '').strip()
                if not membership_id or membership_id == 'hidden':
                    membership_id = f"charter_{hash(row.get('first_name', '') + row.get('last_name', ''))}"
                
                _id = membership_id or str(uuid4())
                
                # Check if already exists
                cur.execute('SELECT "_id" FROM members WHERE membership_id = %s OR ("_id" = %s AND membership_id IS NULL)', 
                           (membership_id, _id))
                if cur.fetchone():
                    continue
                
                cur.execute("""
                    INSERT INTO members (
                        "_id", "_createdDate", "_updatedDate", "_owner",
                        first_name, last_name, twin_name, membership_id,
                        city, region, country, registry_date, source_file
                    ) VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s, %s, %s
                    ) ON CONFLICT (membership_id) DO UPDATE SET
                        "_updatedDate" = EXCLUDED."_updatedDate",
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name,
                        twin_name = EXCLUDED.twin_name,
                        city = EXCLUDED.city,
                        region = EXCLUDED.region,
                        country = EXCLUDED.country,
                        registry_date = EXCLUDED.registry_date;
                """, (
                    _id, datetime.now().isoformat(), datetime.now().isoformat(), 'system',
                    row.get('first_name'), row.get('last_name'), row.get('twin_name'),
                    membership_id, row.get('city'), row.get('region'), row.get('country'),
                    row.get('signup_date'), row.get('source', 'charter-list')
                ))
                loaded += 1
            except Exception as e:
                print(f"⚠️  Error loading charter record: {e}")
                continue
    
    conn.commit()
    print(f"✅ Loaded {loaded} charter records into members table")
    return loaded

def load_chat_clubs(conn, csv_path):
    """Load chat clubs data"""
    if not os.path.exists(csv_path):
        return 0
    
    print(f"📥 Loading chat clubs from {csv_path}...")
    cur = conn.cursor()
    loaded = 0
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                club_name = row.get('club_name', '').strip()
                if not club_name:
                    continue
                
                _id = str(uuid4())
                
                # Check if already exists
                cur.execute('SELECT "_id" FROM chat_clubs WHERE club_name = %s', (club_name,))
                if cur.fetchone():
                    continue
                
                cur.execute("""
                    INSERT INTO chat_clubs (
                        "_id", "_createdDate", "_updatedDate", "_owner",
                        club_name, category, member_count, status, source
                    ) VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s, %s, %s
                    ) ON CONFLICT ("_id") DO NOTHING
                """, (
                    _id, datetime.now().isoformat(), datetime.now().isoformat(), 'system',
                    club_name, row.get('category', ''), int(row.get('member_count', 0)),
                    row.get('status', 'Active'), row.get('source', 'chat-clubs')
                ))
                loaded += 1
            except Exception as e:
                print(f"⚠️  Error loading club: {e}")
                continue
    
    conn.commit()
    print(f"✅ Loaded {loaded} chat clubs")
    return loaded

def load_chat_messages(conn, csv_path):
    """Load chat messages data"""
    if not os.path.exists(csv_path):
        return 0
    
    print(f"📥 Loading chat messages from {csv_path}...")
    cur = conn.cursor()
    loaded = 0
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                _id = str(uuid4())
                
                cur.execute("""
                    INSERT INTO chat_messages (
                        "_id", "_createdDate", "_updatedDate", "_owner",
                        member_name, twin_name, country, room, message, source
                    ) VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s
                    ) ON CONFLICT ("_id") DO NOTHING
                """, (
                    _id, datetime.now().isoformat(), datetime.now().isoformat(), 'system',
                    row.get('member_name'), row.get('twin_name'), row.get('country'),
                    row.get('room', 'Room 1'), row.get('message'), row.get('source', 'chat-messages')
                ))
                loaded += 1
            except Exception as e:
                print(f"⚠️  Error loading message: {e}")
                continue
    
    conn.commit()
    print(f"✅ Loaded {loaded} chat messages")
    return loaded

def main():
    """Main execution"""
    print("🚀 Loading ALL segmented data into database...")
    print(f"📊 Database: {DB_CONFIG['database']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    database_dir = os.path.join(project_root, 'database')
    
    conn = get_conn()
    print("✅ Connected to database")
    
    try:
        ensure_tables(conn)
        
        # Load charter data
        charter_csv = os.path.join(database_dir, 'charter_list_provided.csv')
        charter_loaded = load_charter_to_members(conn, charter_csv)
        
        # Load chat clubs
        clubs_csv = os.path.join(database_dir, 'chat_clubs_provided.csv')
        clubs_loaded = load_chat_clubs(conn, clubs_csv)
        
        # Load chat messages
        messages_csv = os.path.join(database_dir, 'chat_messages_provided.csv')
        messages_loaded = load_chat_messages(conn, messages_csv)
        
        # Summary
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM members')
        total_members = cur.fetchone()[0]
        
        cur.execute('SELECT COUNT(*) FROM chat_clubs')
        total_clubs = cur.fetchone()[0]
        
        cur.execute('SELECT COUNT(*) FROM chat_messages')
        total_messages = cur.fetchone()[0]
        
        print("\n" + "="*60)
        print("✅ LOAD COMPLETE")
        print("="*60)
        print(f"📊 Total Members: {total_members}")
        print(f"📊 Total Chat Clubs: {total_clubs}")
        print(f"📊 Total Chat Messages: {total_messages}")
        print(f"📥 Charter records loaded: {charter_loaded}")
        print(f"📥 Clubs loaded: {clubs_loaded}")
        print(f"📥 Messages loaded: {messages_loaded}")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == '__main__':
    main()





