#!/usr/bin/env python3
"""
Complete Database Restoration Script
Pulls all data from all databases and identifies last 3 active HingeCraft chats
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path
import subprocess

# Database paths
CURSOR_ROOT = Path("[PROJECT_ROOT]")
DATABASES = {
    "ferguson_system": CURSOR_ROOT / "data" / "ferguson_system.db",
    "fma_data": CURSOR_ROOT / "sql" / "fma_data.db",
}

# Output directory
OUTPUT_DIR = CURSOR_ROOT / "DATABASE_RESTORATION"
OUTPUT_DIR.mkdir(exist_ok=True)

def get_all_tables(conn):
    """Get all table names from database"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    return [row[0] for row in cursor.fetchall()]

def get_table_schema(conn, table_name):
    """Get schema for a table"""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    return cursor.fetchall()

def get_all_data_from_table(conn, table_name):
    """Get all data from a table"""
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        print(f"Error reading table {table_name}: {e}")
        return []

def export_database(db_name, db_path):
    """Export all data from a SQLite database"""
    if not db_path.exists():
        print(f"Database {db_name} not found at {db_path}")
        return None
    
    print(f"\n{'='*60}")
    print(f"Exporting database: {db_name}")
    print(f"Path: {db_path}")
    print(f"{'='*60}")
    
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    
    tables = get_all_tables(conn)
    print(f"Found {len(tables)} tables: {', '.join(tables)}")
    
    database_export = {
        "database_name": db_name,
        "database_path": str(db_path),
        "export_timestamp": datetime.now().isoformat(),
        "tables": {}
    }
    
    for table in tables:
        print(f"  Exporting table: {table}")
        schema = get_table_schema(conn, table)
        data = get_all_data_from_table(conn, table)
        
        database_export["tables"][table] = {
            "schema": [
                {
                    "cid": col[0],
                    "name": col[1],
                    "type": col[2],
                    "notnull": col[3],
                    "default_value": col[4],
                    "pk": col[5]
                }
                for col in schema
            ],
            "row_count": len(data),
            "data": data
        }
        
        print(f"    Exported {len(data)} rows")
    
    conn.close()
    return database_export

def find_hingecraft_chats():
    """Find last 3 active HingeCraft chats from all sources"""
    print(f"\n{'='*60}")
    print("Searching for HingeCraft chats...")
    print(f"{'='*60}")
    
    chats = []
    
    # Search in chat history markdown files
    chat_files = [
        CURSOR_ROOT / "hingecraft-global" / "COMPLETE_CHAT_HISTORY_EXPORT.md",
        CURSOR_ROOT / "hingecraft-global" / "MASTER_CHAT_CONTINUATION_COMPLETE.md",
        CURSOR_ROOT / "HingeCraft" / "ALL_HINGECRAFT_CHAT_DATA_CONSOLIDATED.md",
        CURSOR_ROOT / "HingeCraft" / "COMPLETE_CHAT_EXPORT_AND_SOLUTION.md",
        CURSOR_ROOT / "HingeCraft" / "HINGECRAFT_COMPLETE_CHAT_DATA.md",
    ]
    
    for chat_file in chat_files:
        if chat_file.exists():
            print(f"Found chat file: {chat_file.name}")
            try:
                with open(chat_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Extract session information
                    if "SESSION" in content or "Session" in content:
                        chats.append({
                            "source": str(chat_file),
                            "file_name": chat_file.name,
                            "size": len(content),
                            "last_modified": datetime.fromtimestamp(chat_file.stat().st_mtime).isoformat()
                        })
            except Exception as e:
                print(f"Error reading {chat_file}: {e}")
    
    # Search in database tables for chat-related data
    for db_name, db_path in DATABASES.items():
        if db_path.exists():
            conn = sqlite3.connect(str(db_path))
            tables = get_all_tables(conn)
            
            # Look for chat, message, session, or conversation tables
            chat_tables = [t for t in tables if any(keyword in t.lower() 
                        for keyword in ['chat', 'message', 'session', 'conversation'])]
            
            for table in chat_tables:
                print(f"Found chat table: {db_name}.{table}")
                data = get_all_data_from_table(conn, table)
                
                # Try to find HingeCraft-related entries
                for row in data:
                    row_str = json.dumps(row, default=str).lower()
                    if 'hingecraft' in row_str:
                        chats.append({
                            "source": f"{db_name}.{table}",
                            "database": db_name,
                            "table": table,
                            "data": row
                        })
            
            conn.close()
    
    return chats

def check_postgresql_connection():
    """Check if PostgreSQL is accessible and try to connect"""
    print(f"\n{'='*60}")
    print("Checking PostgreSQL connections...")
    print(f"{'='*60}")
    
    # Try to connect to PostgreSQL databases mentioned in configs
    pg_configs = [
        {
            "name": "HingeCraft Production",
            "host": "localhost",
            "port": 5432,
            "database": "hingecraft",
            "user": "hcuser",
            "password": "hcpass"
        },
        {
            "name": "HingeCraft Alternative",
            "host": "localhost",
            "port": 5432,
            "database": "hingecraft_db",
            "user": "hingecraft_user",
            "password": "hingecraft_secure_password_123"
        }
    ]
    
    pg_results = []
    
    for config in pg_configs:
        try:
            # Try using psql if available
            result = subprocess.run(
                ["psql", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                print(f"PostgreSQL client found: {result.stdout.strip()}")
                # Try to connect
                try:
                    import psycopg2
                    conn = psycopg2.connect(
                        host=config["host"],
                        port=config["port"],
                        database=config["database"],
                        user=config["user"],
                        password=config["password"],
                        connect_timeout=5
                    )
                    
                    cursor = conn.cursor()
                    cursor.execute("SELECT version();")
                    version = cursor.fetchone()[0]
                    
                    # Check for chat-related tables
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND (table_name LIKE '%chat%' 
                             OR table_name LIKE '%message%' 
                             OR table_name LIKE '%session%')
                        ORDER BY table_name;
                    """)
                    chat_tables = [row[0] for row in cursor.fetchall()]
                    
                    pg_results.append({
                        "config_name": config["name"],
                        "status": "connected",
                        "version": version,
                        "chat_tables": chat_tables
                    })
                    
                    # Get last 3 active chats if chat tables exist
                    if chat_tables:
                        for table in chat_tables:
                            try:
                                cursor.execute(f"""
                                    SELECT * FROM {table} 
                                    ORDER BY created_at DESC, ts DESC, _createdDate DESC
                                    LIMIT 3;
                                """)
                                rows = cursor.fetchall()
                                if rows:
                                    pg_results[-1][f"{table}_last_3"] = [
                                        dict(zip([desc[0] for desc in cursor.description], row))
                                        for row in rows
                                    ]
                            except Exception as e:
                                print(f"Error querying {table}: {e}")
                    
                    conn.close()
                    print(f"✓ Connected to {config['name']}")
                    
                except ImportError:
                    print(f"psycopg2 not installed, cannot connect to PostgreSQL")
                except Exception as e:
                    print(f"✗ Could not connect to {config['name']}: {e}")
            else:
                print(f"PostgreSQL client not found")
                
        except FileNotFoundError:
            print("PostgreSQL client (psql) not found in PATH")
        except Exception as e:
            print(f"Error checking PostgreSQL: {e}")
    
    return pg_results

def main():
    """Main restoration function"""
    print("="*60)
    print("COMPLETE DATABASE RESTORATION")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Output directory: {OUTPUT_DIR}")
    
    all_data = {
        "restoration_timestamp": datetime.now().isoformat(),
        "databases": {},
        "hingecraft_chats": [],
        "postgresql_connections": []
    }
    
    # Export all SQLite databases
    for db_name, db_path in DATABASES.items():
        export = export_database(db_name, db_path)
        if export:
            all_data["databases"][db_name] = export
    
    # Find HingeCraft chats
    chats = find_hingecraft_chats()
    all_data["hingecraft_chats"] = chats
    
    # Get last 3 active chats
    if chats:
        print(f"\n{'='*60}")
        print(f"Found {len(chats)} HingeCraft chat sources")
        print(f"{'='*60}")
        
        # Sort by modification time or relevance
        sorted_chats = sorted(chats, 
                             key=lambda x: x.get("last_modified", ""), 
                             reverse=True)[:3]
        
        all_data["last_3_active_chats"] = sorted_chats
        
        print("\nLast 3 Active HingeCraft Chats:")
        for i, chat in enumerate(sorted_chats, 1):
            print(f"\n{i}. {chat.get('file_name', chat.get('source', 'Unknown'))}")
            if 'last_modified' in chat:
                print(f"   Last Modified: {chat['last_modified']}")
            if 'size' in chat:
                print(f"   Size: {chat['size']:,} bytes")
    
    # Check PostgreSQL connections
    pg_results = check_postgresql_connection()
    all_data["postgresql_connections"] = pg_results
    
    # Save complete restoration
    output_file = OUTPUT_DIR / "COMPLETE_DATABASE_RESTORATION.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, default=str, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"Restoration complete!")
    print(f"Output saved to: {output_file}")
    print(f"{'='*60}")
    
    # Create summary markdown
    summary_file = OUTPUT_DIR / "RESTORATION_SUMMARY.md"
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("# Complete Database Restoration Summary\n\n")
        f.write(f"**Restoration Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("## Databases Exported\n\n")
        
        for db_name, db_data in all_data["databases"].items():
            f.write(f"### {db_name}\n\n")
            f.write(f"- **Path:** {db_data['database_path']}\n")
            f.write(f"- **Tables:** {len(db_data['tables'])}\n")
            for table_name, table_data in db_data["tables"].items():
                f.write(f"  - `{table_name}`: {table_data['row_count']} rows\n")
            f.write("\n")
        
        f.write("## Last 3 Active HingeCraft Chats\n\n")
        if "last_3_active_chats" in all_data:
            for i, chat in enumerate(all_data["last_3_active_chats"], 1):
                f.write(f"{i}. **{chat.get('file_name', chat.get('source', 'Unknown'))}**\n")
                if 'last_modified' in chat:
                    f.write(f"   - Last Modified: {chat['last_modified']}\n")
                if 'source' in chat:
                    f.write(f"   - Source: {chat['source']}\n")
                f.write("\n")
        else:
            f.write("No active chats found.\n\n")
        
        f.write("## PostgreSQL Connections\n\n")
        if pg_results:
            for pg in pg_results:
                f.write(f"### {pg.get('config_name', 'Unknown')}\n")
                f.write(f"- **Status:** {pg.get('status', 'unknown')}\n")
                if 'chat_tables' in pg:
                    f.write(f"- **Chat Tables:** {', '.join(pg['chat_tables']) if pg['chat_tables'] else 'None'}\n")
                f.write("\n")
        else:
            f.write("No PostgreSQL connections available.\n\n")
    
    print(f"Summary saved to: {summary_file}")
    
    return all_data

if __name__ == "__main__":
    main()












