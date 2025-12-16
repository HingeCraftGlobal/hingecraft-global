#!/usr/bin/env python3
"""
Comprehensive System Scan
Scans entire computer to ensure nothing is missing and everything is present
"""

import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib
import subprocess
from collections import defaultdict

# Scan configuration
SCAN_ROOT = Path("/Users/chandlerfergusen")
EXCLUDE_DIRS = {
    '.Trash', '.cache', '.npm', '.yarn', 'node_modules', 
    '.git', '__pycache__', '.venv', 'venv', '.env',
    'Library/Caches', 'Library/Logs', 'Library/Application Support/Spotify',
    'Library/Application Support/Code', 'Library/Application Support/Cursor'
}

# Key directories to scan
KEY_DIRECTORIES = [
    SCAN_ROOT / "Desktop" / "CURSOR",
    SCAN_ROOT / "Desktop" / "CURSOR_BACKUP_20251210_190306",
    SCAN_ROOT / "ferguson-system",
    SCAN_ROOT / "PycharmProjects",
    SCAN_ROOT / "PythonProject",
    SCAN_ROOT / "Documents",
    SCAN_ROOT / "Downloads",
]

# Output directory
OUTPUT_DIR = Path("/Users/chandlerfergusen/Desktop/CURSOR/SYSTEM_SCAN_RESULTS")
OUTPUT_DIR.mkdir(exist_ok=True)

def calculate_file_hash(file_path):
    """Calculate MD5 hash of a file"""
    try:
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception as e:
        return f"ERROR: {e}"

def should_scan_path(path):
    """Check if path should be scanned"""
    path_str = str(path)
    for exclude in EXCLUDE_DIRS:
        if exclude in path_str:
            return False
    return True

def find_all_databases(root_path):
    """Find all database files"""
    print(f"\n{'='*60}")
    print("Scanning for database files...")
    print(f"{'='*60}")
    
    databases = []
    db_extensions = ['.db', '.sqlite', '.sqlite3', '.db3']
    
    for ext in db_extensions:
        for db_file in root_path.rglob(f"*{ext}"):
            if should_scan_path(db_file):
                try:
                    size = db_file.stat().st_size
                    mtime = datetime.fromtimestamp(db_file.stat().st_mtime)
                    
                    # Try to get table count
                    table_count = 0
                    if ext == '.db' or 'sqlite' in ext:
                        try:
                            conn = sqlite3.connect(str(db_file))
                            cursor = conn.cursor()
                            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                            table_count = len(cursor.fetchall())
                            conn.close()
                        except:
                            pass
                    
                    databases.append({
                        "path": str(db_file),
                        "name": db_file.name,
                        "size": size,
                        "size_mb": round(size / (1024 * 1024), 2),
                        "modified": mtime.isoformat(),
                        "table_count": table_count,
                        "relative_path": str(db_file.relative_to(root_path))
                    })
                    print(f"  Found: {db_file.name} ({size / (1024*1024):.2f} MB, {table_count} tables)")
                except Exception as e:
                    print(f"  Error scanning {db_file}: {e}")
    
    return databases

def find_all_project_files(root_path):
    """Find all project-related files"""
    print(f"\n{'='*60}")
    print("Scanning for project files...")
    print(f"{'='*60}")
    
    projects = defaultdict(list)
    key_extensions = ['.py', '.js', '.ts', '.sql', '.md', '.json', '.html', '.css', '.sh']
    
    for ext in key_extensions:
        count = 0
        for file_path in root_path.rglob(f"*{ext}"):
            if should_scan_path(file_path):
                try:
                    size = file_path.stat().st_size
                    mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    
                    # Categorize by directory
                    rel_path = str(file_path.relative_to(root_path))
                    if 'hingecraft' in rel_path.lower():
                        category = 'HingeCraft'
                    elif 'cursor' in rel_path.lower():
                        category = 'CURSOR'
                    elif 'ferguson' in rel_path.lower():
                        category = 'Ferguson'
                    else:
                        category = 'Other'
                    
                    projects[category].append({
                        "path": str(file_path),
                        "name": file_path.name,
                        "size": size,
                        "modified": mtime.isoformat(),
                        "extension": ext,
                        "relative_path": rel_path
                    })
                    count += 1
                except Exception as e:
                    pass
        
        if count > 0:
            print(f"  {ext}: {count:,} files")
    
    return projects

def find_backup_files(root_path):
    """Find all backup files"""
    print(f"\n{'='*60}")
    print("Scanning for backup files...")
    print(f"{'='*60}")
    
    backups = []
    backup_keywords = ['backup', 'copy', 'old', 'archive', 'bak', '.backup']
    
    for keyword in backup_keywords:
        for backup_file in root_path.rglob(f"*{keyword}*"):
            if should_scan_path(backup_file) and backup_file.is_file():
                try:
                    size = backup_file.stat().st_size
                    mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
                    
                    backups.append({
                        "path": str(backup_file),
                        "name": backup_file.name,
                        "size": size,
                        "size_mb": round(size / (1024 * 1024), 2),
                        "modified": mtime.isoformat(),
                        "relative_path": str(backup_file.relative_to(root_path))
                    })
                except Exception as e:
                    pass
    
    print(f"  Found {len(backups)} backup files")
    return backups

def check_cursor_integrity(cursor_path):
    """Check CURSOR directory integrity"""
    print(f"\n{'='*60}")
    print("Checking CURSOR directory integrity...")
    print(f"{'='*60}")
    
    integrity_report = {
        "cursor_path": str(cursor_path),
        "exists": cursor_path.exists(),
        "is_directory": cursor_path.is_dir() if cursor_path.exists() else False,
        "subdirectories": [],
        "key_files": [],
        "databases": [],
        "issues": []
    }
    
    if not cursor_path.exists():
        integrity_report["issues"].append("CURSOR directory does not exist")
        return integrity_report
    
    # Check key subdirectories
    key_dirs = ['data', 'sql', 'hingecraft-global', 'HingeCraft', 'ai', 'ats_python_system']
    for key_dir in key_dirs:
        dir_path = cursor_path / key_dir
        if dir_path.exists():
            integrity_report["subdirectories"].append({
                "name": key_dir,
                "path": str(dir_path),
                "exists": True,
                "file_count": len(list(dir_path.rglob("*"))) if dir_path.is_dir() else 0
            })
        else:
            integrity_report["issues"].append(f"Missing key directory: {key_dir}")
    
    # Check key files
    key_files = [
        "RESTORE_ALL_DATABASE_DATA.py",
        "COMPLETE_DATABASE_AND_CHAT_RESTORATION.md",
        "DATABASE_RESTORATION/COMPLETE_DATABASE_RESTORATION.json"
    ]
    for key_file in key_files:
        file_path = cursor_path / key_file
        if file_path.exists():
            integrity_report["key_files"].append({
                "name": key_file,
                "path": str(file_path),
                "exists": True,
                "size": file_path.stat().st_size
            })
        else:
            integrity_report["issues"].append(f"Missing key file: {key_file}")
    
    # Check databases
    db_files = ['data/ferguson_system.db', 'sql/fma_data.db']
    for db_file in db_files:
        db_path = cursor_path / db_file
        if db_path.exists():
            try:
                conn = sqlite3.connect(str(db_path))
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in cursor.fetchall()]
                conn.close()
                
                integrity_report["databases"].append({
                    "name": db_file,
                    "path": str(db_path),
                    "exists": True,
                    "size": db_path.stat().st_size,
                    "table_count": len(tables),
                    "tables": tables
                })
            except Exception as e:
                integrity_report["issues"].append(f"Error reading database {db_file}: {e}")
        else:
            integrity_report["issues"].append(f"Missing database: {db_file}")
    
    return integrity_report

def check_for_missing_references(root_path):
    """Check for missing file references"""
    print(f"\n{'='*60}")
    print("Checking for missing file references...")
    print(f"{'='*60}")
    
    missing_refs = []
    
    # Check import statements in code files
    code_files = list(root_path.rglob("*.py")) + list(root_path.rglob("*.js"))
    
    for code_file in code_files[:1000]:  # Limit to first 1000 for performance
        if not should_scan_path(code_file):
            continue
        
        try:
            with open(code_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                # Check for common import patterns
                import_patterns = [
                    r'from\s+([\w.]+)\s+import',
                    r'import\s+([\w.]+)',
                    r'require\([\'"]([^\'"]+)[\'"]\)',
                    r'from\s+[\'"]([^\'"]+)[\'"]\s+import'
                ]
                
                # Simple check for file references
                if '../' in content or './' in content:
                    # This is a simplified check - could be enhanced
                    pass
        except Exception as e:
            pass
    
    return missing_refs

def generate_comprehensive_report():
    """Generate comprehensive system scan report"""
    print("="*60)
    print("COMPREHENSIVE SYSTEM SCAN")
    print("="*60)
    print(f"Scan Root: {SCAN_ROOT}")
    print(f"Scan Time: {datetime.now().isoformat()}")
    print(f"Output Directory: {OUTPUT_DIR}")
    
    scan_results = {
        "scan_timestamp": datetime.now().isoformat(),
        "scan_root": str(SCAN_ROOT),
        "databases": [],
        "projects": {},
        "backups": [],
        "cursor_integrity": {},
        "statistics": {}
    }
    
    # Scan all databases
    all_databases = []
    for key_dir in KEY_DIRECTORIES:
        if key_dir.exists():
            dbs = find_all_databases(key_dir)
            all_databases.extend(dbs)
    
    # Also scan entire system for databases
    print("\nScanning entire system for databases...")
    system_dbs = find_all_databases(SCAN_ROOT)
    all_databases.extend(system_dbs)
    
    # Remove duplicates
    seen_paths = set()
    unique_databases = []
    for db in all_databases:
        if db["path"] not in seen_paths:
            seen_paths.add(db["path"])
            unique_databases.append(db)
    
    scan_results["databases"] = unique_databases
    print(f"\nTotal unique databases found: {len(unique_databases)}")
    
    # Scan project files
    all_projects = defaultdict(list)
    for key_dir in KEY_DIRECTORIES:
        if key_dir.exists():
            projects = find_all_project_files(key_dir)
            for category, files in projects.items():
                all_projects[category].extend(files)
    
    scan_results["projects"] = {k: v for k, v in all_projects.items()}
    
    # Find backups
    backups = find_backup_files(SCAN_ROOT)
    scan_results["backups"] = backups[:100]  # Limit to 100 most recent
    
    # Check CURSOR integrity
    cursor_path = SCAN_ROOT / "Desktop" / "CURSOR"
    integrity = check_cursor_integrity(cursor_path)
    scan_results["cursor_integrity"] = integrity
    
    # Calculate statistics
    total_db_size = sum(db["size"] for db in unique_databases)
    total_files = sum(len(files) for files in all_projects.values())
    
    scan_results["statistics"] = {
        "total_databases": len(unique_databases),
        "total_database_size_mb": round(total_db_size / (1024 * 1024), 2),
        "total_project_files": total_files,
        "total_backups_found": len(backups),
        "cursor_issues": len(integrity.get("issues", [])),
        "cursor_subdirectories": len(integrity.get("subdirectories", [])),
        "cursor_databases": len(integrity.get("databases", []))
    }
    
    # Save results
    json_file = OUTPUT_DIR / "COMPREHENSIVE_SYSTEM_SCAN.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(scan_results, f, indent=2, default=str, ensure_ascii=False)
    
    # Generate markdown report
    md_file = OUTPUT_DIR / "COMPREHENSIVE_SYSTEM_SCAN_REPORT.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write("# 🔍 COMPREHENSIVE SYSTEM SCAN REPORT\n\n")
        f.write(f"**Scan Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Scan Root:** {SCAN_ROOT}\n\n")
        
        f.write("## 📊 Statistics\n\n")
        stats = scan_results["statistics"]
        f.write(f"- **Total Databases Found:** {stats['total_databases']}\n")
        f.write(f"- **Total Database Size:** {stats['total_database_size_mb']} MB\n")
        f.write(f"- **Total Project Files:** {stats['total_project_files']:,}\n")
        f.write(f"- **Total Backups Found:** {stats['total_backups_found']}\n")
        f.write(f"- **CURSOR Issues:** {stats['cursor_issues']}\n")
        f.write(f"- **CURSOR Subdirectories:** {stats['cursor_subdirectories']}\n")
        f.write(f"- **CURSOR Databases:** {stats['cursor_databases']}\n\n")
        
        f.write("## 🗄️ Databases Found\n\n")
        for db in unique_databases[:50]:  # Show first 50
            f.write(f"### {db['name']}\n\n")
            f.write(f"- **Path:** `{db['path']}`\n")
            f.write(f"- **Size:** {db['size_mb']} MB\n")
            f.write(f"- **Tables:** {db['table_count']}\n")
            f.write(f"- **Modified:** {db['modified']}\n\n")
        
        if len(unique_databases) > 50:
            f.write(f"\n*... and {len(unique_databases) - 50} more databases*\n\n")
        
        f.write("## 📁 Project Files by Category\n\n")
        for category, files in all_projects.items():
            f.write(f"### {category}\n\n")
            f.write(f"- **Total Files:** {len(files):,}\n")
            if files:
                f.write(f"- **Sample Files:**\n")
                for file_info in files[:10]:
                    f.write(f"  - `{file_info['relative_path']}` ({file_info['size']} bytes)\n")
                if len(files) > 10:
                    f.write(f"  - *... and {len(files) - 10} more files*\n")
            f.write("\n")
        
        f.write("## ✅ CURSOR Directory Integrity\n\n")
        integrity = scan_results["cursor_integrity"]
        f.write(f"- **Path:** `{integrity['cursor_path']}`\n")
        f.write(f"- **Exists:** {integrity['exists']}\n")
        f.write(f"- **Is Directory:** {integrity['is_directory']}\n\n")
        
        if integrity.get("subdirectories"):
            f.write("### Subdirectories\n\n")
            for subdir in integrity["subdirectories"]:
                f.write(f"- **{subdir['name']}:** {subdir['file_count']} files\n")
            f.write("\n")
        
        if integrity.get("databases"):
            f.write("### Databases\n\n")
            for db in integrity["databases"]:
                f.write(f"- **{db['name']}:** {db['table_count']} tables, {db['size'] / (1024*1024):.2f} MB\n")
            f.write("\n")
        
        if integrity.get("issues"):
            f.write("### ⚠️ Issues Found\n\n")
            for issue in integrity["issues"]:
                f.write(f"- {issue}\n")
            f.write("\n")
        else:
            f.write("### ✅ No Issues Found\n\n")
            f.write("All key directories, files, and databases are present.\n\n")
    
    print(f"\n{'='*60}")
    print("SCAN COMPLETE")
    print(f"{'='*60}")
    print(f"Results saved to:")
    print(f"  - JSON: {json_file}")
    print(f"  - Markdown: {md_file}")
    print(f"\nStatistics:")
    print(f"  - Databases: {stats['total_databases']}")
    print(f"  - Database Size: {stats['total_database_size_mb']} MB")
    print(f"  - Project Files: {stats['total_project_files']:,}")
    print(f"  - CURSOR Issues: {stats['cursor_issues']}")
    
    return scan_results

if __name__ == "__main__":
    results = generate_comprehensive_report()












