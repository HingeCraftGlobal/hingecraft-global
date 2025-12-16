#!/usr/bin/env python3
"""
Comprehensive Database Verification and Update Script
Checks all databases, exports data, and ensures everything is up to date
"""

import sqlite3
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import subprocess

# Database paths
BASE_DIR = Path(__file__).parent
SQLITE_DBS = {
    "ferguson_system": BASE_DIR / "data" / "ferguson_system.db",
    "fma_data": BASE_DIR / "sql" / "fma_data.db"
}

# PostgreSQL connection info (if available)
POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "hingecraft_db",
    "user": "hingecraft_user",
    "password": "hingecraft_secure_password_123"
}

OUTPUT_DIR = BASE_DIR / "database_verification"
OUTPUT_DIR.mkdir(exist_ok=True)


def get_sqlite_tables(db_path: Path) -> List[str]:
    """Get all table names from SQLite database"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
        return tables
    except Exception as e:
        print(f"Error reading {db_path}: {e}")
        return []


def get_table_schema(db_path: Path, table_name: str) -> Dict[str, Any]:
    """Get schema information for a table"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        schema = {
            "columns": [
                {
                    "name": col[1],
                    "type": col[2],
                    "not_null": bool(col[3]),
                    "default": col[4],
                    "primary_key": bool(col[5])
                }
                for col in columns
            ]
        }
        conn.close()
        return schema
    except Exception as e:
        print(f"Error getting schema for {table_name}: {e}")
        return {"columns": []}


def get_table_row_count(db_path: Path, table_name: str) -> int:
    """Get row count for a table"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        conn.close()
        return count
    except Exception as e:
        print(f"Error counting rows in {table_name}: {e}")
        return 0


def export_table_data(db_path: Path, table_name: str) -> List[Dict]:
    """Export all data from a table"""
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        data = [dict(row) for row in rows]
        conn.close()
        return data
    except Exception as e:
        print(f"Error exporting data from {table_name}: {e}")
        return []


def verify_sqlite_database(db_name: str, db_path: Path) -> Dict[str, Any]:
    """Verify and export SQLite database"""
    print(f"\n{'='*60}")
    print(f"Verifying SQLite Database: {db_name}")
    print(f"Path: {db_path}")
    print(f"{'='*60}")
    
    if not db_path.exists():
        return {
            "exists": False,
            "error": f"Database file not found: {db_path}"
        }
    
    # Get file size
    file_size = db_path.stat().st_size
    
    # Get tables
    tables = get_sqlite_tables(db_path)
    
    result = {
        "exists": True,
        "path": str(db_path),
        "file_size_bytes": file_size,
        "file_size_mb": round(file_size / (1024 * 1024), 2),
        "tables": {},
        "total_tables": len(tables),
        "total_rows": 0
    }
    
    # Process each table
    for table in tables:
        print(f"  Processing table: {table}")
        schema = get_table_schema(db_path, table)
        row_count = get_table_row_count(db_path, table)
        data = export_table_data(db_path, table)
        
        result["tables"][table] = {
            "schema": schema,
            "row_count": row_count,
            "sample_data": data[:5] if len(data) > 5 else data,  # First 5 rows as sample
            "has_data": len(data) > 0
        }
        result["total_rows"] += row_count
        
        # Export full data to JSON
        export_file = OUTPUT_DIR / f"{db_name}_{table}_export.json"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"    ✓ Exported {row_count} rows to {export_file}")
    
    return result


def check_postgres_connection() -> Dict[str, Any]:
    """Check PostgreSQL database connection and get info"""
    print(f"\n{'='*60}")
    print("Checking PostgreSQL Database (HingeCraft)")
    print(f"{'='*60}")
    
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=POSTGRES_CONFIG["host"],
            port=POSTGRES_CONFIG["port"],
            database=POSTGRES_CONFIG["database"],
            user=POSTGRES_CONFIG["user"],
            password=POSTGRES_CONFIG["password"]
        )
        cursor = conn.cursor()
        
        # Get tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        result = {
            "connected": True,
            "database": POSTGRES_CONFIG["database"],
            "tables": [],
            "total_tables": len(tables)
        }
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            result["tables"].append({
                "name": table,
                "row_count": count
            })
            print(f"  ✓ Table: {table} - {count} rows")
        
        conn.close()
        return result
        
    except ImportError:
        return {
            "connected": False,
            "error": "psycopg2 not installed. Install with: pip install psycopg2-binary"
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e)
        }


def create_backup_script():
    """Create a backup script for all databases"""
    backup_script = OUTPUT_DIR / "backup_all_databases.sh"
    
    script_content = f"""#!/bin/bash
# Database Backup Script
# Generated: {datetime.now().isoformat()}

set -e

BACKUP_DIR="{OUTPUT_DIR}/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Creating database backups..."

# Backup SQLite databases
echo "Backing up SQLite databases..."
"""
    
    for db_name, db_path in SQLITE_DBS.items():
        if db_path.exists():
            script_content += f"""
# Backup {db_name}
if [ -f "{db_path}" ]; then
    cp "{db_path}" "$BACKUP_DIR/{db_name}_${{TIMESTAMP}}.db"
    echo "  ✓ Backed up {db_name}"
fi
"""
    
    script_content += """
# Backup PostgreSQL (if Docker is running)
if docker ps | grep -q postgres; then
    echo "Backing up PostgreSQL..."
    docker exec postgres pg_dump -U hingecraft_user hingecraft_db > "$BACKUP_DIR/postgres_${TIMESTAMP}.sql"
    echo "  ✓ Backed up PostgreSQL"
fi

echo "Backups completed in: $BACKUP_DIR"
"""
    
    with open(backup_script, 'w') as f:
        f.write(script_content)
    
    os.chmod(backup_script, 0o755)
    print(f"\n✓ Created backup script: {backup_script}")


def generate_summary_report(results: Dict[str, Any]):
    """Generate a comprehensive summary report"""
    report_file = OUTPUT_DIR / "database_verification_report.md"
    
    with open(report_file, 'w') as f:
        f.write("# Database Verification Report\n\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n\n")
        f.write("## Summary\n\n")
        
        # SQLite databases
        f.write("### SQLite Databases\n\n")
        for db_name, db_info in results.get("sqlite_databases", {}).items():
            if db_info.get("exists"):
                f.write(f"#### {db_name}\n")
                f.write(f"- **Path:** `{db_info['path']}`\n")
                f.write(f"- **Size:** {db_info['file_size_mb']} MB\n")
                f.write(f"- **Tables:** {db_info['total_tables']}\n")
                f.write(f"- **Total Rows:** {db_info['total_rows']}\n\n")
                
                f.write("| Table | Rows | Has Data |\n")
                f.write("|-------|------|----------|\n")
                for table_name, table_info in db_info.get("tables", {}).items():
                    status = "✓" if table_info.get("has_data") else "○"
                    f.write(f"| {table_name} | {table_info.get('row_count', 0)} | {status} |\n")
                f.write("\n")
            else:
                f.write(f"#### {db_name}\n")
                f.write(f"- **Status:** ❌ Not found\n")
                f.write(f"- **Error:** {db_info.get('error', 'Unknown error')}\n\n")
        
        # PostgreSQL
        f.write("### PostgreSQL Database\n\n")
        pg_info = results.get("postgres_database", {})
        if pg_info.get("connected"):
            f.write(f"- **Database:** {pg_info.get('database')}\n")
            f.write(f"- **Tables:** {pg_info.get('total_tables')}\n\n")
            f.write("| Table | Rows |\n")
            f.write("|-------|------|\n")
            for table in pg_info.get("tables", []):
                f.write(f"| {table['name']} | {table['row_count']} |\n")
        else:
            f.write(f"- **Status:** ❌ Not connected\n")
            f.write(f"- **Error:** {pg_info.get('error', 'Unknown error')}\n")
        
        f.write("\n## Export Files\n\n")
        f.write("All table data has been exported to JSON files in:\n")
        f.write(f"`{OUTPUT_DIR}`\n\n")
    
    print(f"\n✓ Generated report: {report_file}")


def main():
    """Main verification function"""
    print("="*60)
    print("DATABASE VERIFICATION AND UPDATE")
    print("="*60)
    print(f"Output directory: {OUTPUT_DIR}")
    
    results = {
        "sqlite_databases": {},
        "postgres_database": {},
        "timestamp": datetime.now().isoformat()
    }
    
    # Verify SQLite databases
    for db_name, db_path in SQLITE_DBS.items():
        results["sqlite_databases"][db_name] = verify_sqlite_database(db_name, db_path)
    
    # Check PostgreSQL
    results["postgres_database"] = check_postgres_connection()
    
    # Create backup script
    create_backup_script()
    
    # Generate summary report
    generate_summary_report(results)
    
    # Save full results as JSON
    results_file = OUTPUT_DIR / "verification_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print("\n" + "="*60)
    print("VERIFICATION COMPLETE")
    print("="*60)
    print(f"\nResults saved to: {OUTPUT_DIR}")
    print(f"Summary report: {OUTPUT_DIR}/database_verification_report.md")
    print(f"Full results: {OUTPUT_DIR}/verification_results.json")
    print(f"\nTo backup databases, run: {OUTPUT_DIR}/backup_all_databases.sh")


if __name__ == "__main__":
    main()







