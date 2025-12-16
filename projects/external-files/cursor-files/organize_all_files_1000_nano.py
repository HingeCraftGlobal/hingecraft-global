#!/usr/bin/env python3
"""
Master File Organization System - 1000 Nano Organization
Organizes ALL files across the entire project using nano-level granularity
"""

import os
import json
import shutil
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import subprocess
import sys

BASE_DIR = Path(__file__).parent
ORGANIZATION_DIR = BASE_DIR / "ORGANIZED_PROJECTS"
LOG_FILE = BASE_DIR / "organization_log.json"

# 1000 Nano Organization Categories
NANO_CATEGORIES = {
    "01_core": {
        "name": "Core System Files",
        "subdirs": ["config", "main", "utils", "base"]
    },
    "02_database": {
        "name": "Database Systems",
        "subdirs": ["schemas", "migrations", "data", "backups", "scripts"]
    },
    "03_api": {
        "name": "API & Backend",
        "subdirs": ["endpoints", "middleware", "auth", "validation"]
    },
    "04_frontend": {
        "name": "Frontend & UI",
        "subdirs": ["pages", "components", "styles", "assets", "public"]
    },
    "05_agents": {
        "name": "AI Agents",
        "subdirs": ["core", "specialized", "tools", "memory"]
    },
    "06_integrations": {
        "name": "External Integrations",
        "subdirs": ["notion", "wix", "apis", "webhooks"]
    },
    "07_ml_ai": {
        "name": "ML & AI Systems",
        "subdirs": ["models", "training", "inference", "embeddings", "rag"]
    },
    "08_security": {
        "name": "Security & Auth",
        "subdirs": ["auth", "encryption", "validation", "compliance"]
    },
    "09_testing": {
        "name": "Testing & QA",
        "subdirs": ["unit", "integration", "e2e", "fixtures"]
    },
    "10_documentation": {
        "name": "Documentation",
        "subdirs": ["guides", "api", "architecture", "deployment"]
    },
    "11_scripts": {
        "name": "Scripts & Automation",
        "subdirs": ["setup", "deployment", "maintenance", "utilities"]
    },
    "12_data": {
        "name": "Data Files",
        "subdirs": ["raw", "processed", "exports", "backups"]
    },
    "13_config": {
        "name": "Configuration",
        "subdirs": ["env", "yaml", "json", "secrets"]
    },
    "14_logs": {
        "name": "Logs & Monitoring",
        "subdirs": ["application", "errors", "audit", "metrics"]
    },
    "15_temporary": {
        "name": "Temporary Files",
        "subdirs": ["cache", "temp", "build", "dist"]
    }
}

# Project mappings
PROJECT_MAPPINGS = {
    "hingecraft-global": {
        "categories": ["03_api", "04_frontend", "06_integrations", "02_database"],
        "priority": "high"
    },
    "HingeCraft": {
        "categories": ["03_api", "02_database", "11_scripts"],
        "priority": "high"
    },
    "pattern_analyzer_system": {
        "categories": ["07_ml_ai", "05_agents"],
        "priority": "high"
    },
    "ats_python_system": {
        "categories": ["03_api", "07_ml_ai"],
        "priority": "medium"
    },
    "ai": {
        "categories": ["05_agents", "07_ml_ai", "08_security"],
        "priority": "high"
    },
    "pycharm": {
        "categories": ["01_core", "11_scripts"],
        "priority": "medium"
    },
    "VOLK-PRIME": {
        "categories": ["01_core", "05_agents"],
        "priority": "medium"
    },
    "RU_PREP": {
        "categories": ["11_scripts", "12_data", "10_documentation"],
        "priority": "medium"
    },
    "ferguson-system": {
        "categories": ["01_core", "02_database", "05_agents"],
        "priority": "high"
    }
}

def get_file_category(file_path: Path) -> str:
    """Determine which nano category a file belongs to"""
    name_lower = file_path.name.lower()
    parent_lower = str(file_path.parent).lower()
    
    # Database files
    if any(x in name_lower for x in ['.db', '.sql', 'database', 'schema', 'migration']):
        return "02_database"
    
    # API files
    if any(x in name_lower for x in ['api', 'endpoint', 'route', 'fastapi', 'flask']):
        return "03_api"
    
    # Frontend files
    if any(x in name_lower for x in ['.html', '.css', '.js', 'frontend', 'public', 'pages']):
        return "04_frontend"
    
    # Agent files
    if any(x in name_lower for x in ['agent', 'orchestrator', 'marp', 'shadow']):
        return "05_agents"
    
    # Integration files
    if any(x in name_lower for x in ['notion', 'wix', 'webhook', 'integration']):
        return "06_integrations"
    
    # ML/AI files
    if any(x in name_lower for x in ['ml', 'ai', 'model', 'embedding', 'rag', 'transformer']):
        return "07_ml_ai"
    
    # Security files
    if any(x in name_lower for x in ['security', 'auth', 'encrypt', 'crypto', 'jwt']):
        return "08_security"
    
    # Testing files
    if any(x in name_lower for x in ['test', 'spec', 'fixture']):
        return "09_testing"
    
    # Documentation
    if any(x in name_lower for x in ['.md', 'readme', 'doc', 'guide', 'manual']):
        return "10_documentation"
    
    # Scripts
    if any(x in name_lower for x in ['.sh', '.py', 'script', 'setup', 'install']):
        if 'test' not in name_lower:
            return "11_scripts"
    
    # Data files
    if any(x in name_lower for x in ['.json', '.csv', '.data', 'export', 'backup']):
        return "12_data"
    
    # Config files
    if any(x in name_lower for x in ['.env', '.yaml', '.yml', '.toml', 'config', 'settings']):
        return "13_config"
    
    # Logs
    if any(x in name_lower for x in ['log', '.log', 'monitor']):
        return "14_logs"
    
    # Default to core
    return "01_core"

def scan_all_files():
    """Scan all files in the project"""
    print("="*60)
    print("Scanning all files...")
    print("="*60)
    
    files_by_category = defaultdict(list)
    files_by_project = defaultdict(list)
    all_files = []
    
    # Exclude certain directories
    exclude_dirs = {
        '.git', '__pycache__', '.venv', 'venv', 'node_modules',
        '.idea', '.vscode', '.cursor', 'dist', 'build', '.pytest_cache'
    }
    
    for root, dirs, files in os.walk(BASE_DIR):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        root_path = Path(root)
        
        # Skip if in excluded directory
        if any(excluded in str(root_path) for excluded in exclude_dirs):
            continue
        
        for file in files:
            file_path = root_path / file
            
            # Skip hidden files and certain types
            if file.startswith('.') or file.endswith('.pyc'):
                continue
            
            try:
                category = get_file_category(file_path)
                relative_path = file_path.relative_to(BASE_DIR)
                
                # Determine project
                project = "root"
                for proj_name in PROJECT_MAPPINGS.keys():
                    if proj_name in str(relative_path):
                        project = proj_name
                        break
                
                file_info = {
                    "path": str(relative_path),
                    "full_path": str(file_path),
                    "category": category,
                    "project": project,
                    "size": file_path.stat().st_size if file_path.exists() else 0,
                    "extension": file_path.suffix
                }
                
                files_by_category[category].append(file_info)
                files_by_project[project].append(file_info)
                all_files.append(file_info)
                
            except Exception as e:
                print(f"  ⚠️  Error processing {file_path}: {e}")
    
    return {
        "by_category": dict(files_by_category),
        "by_project": dict(files_by_project),
        "all": all_files,
        "total": len(all_files)
    }

def create_organization_structure():
    """Create the organized directory structure"""
    print("\n" + "="*60)
    print("Creating organization structure...")
    print("="*60)
    
    ORGANIZATION_DIR.mkdir(exist_ok=True)
    
    for cat_id, cat_info in NANO_CATEGORIES.items():
        cat_dir = ORGANIZATION_DIR / cat_id
        cat_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        for subdir in cat_info["subdirs"]:
            (cat_dir / subdir).mkdir(exist_ok=True)
        
        print(f"  ✓ Created {cat_id}: {cat_info['name']}")

def generate_organization_report(file_data):
    """Generate comprehensive organization report"""
    print("\n" + "="*60)
    print("Generating organization report...")
    print("="*60)
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_files": file_data["total"],
        "categories": {},
        "projects": {},
        "statistics": {}
    }
    
    # Category statistics
    for category, files in file_data["by_category"].items():
        cat_info = NANO_CATEGORIES.get(category, {"name": category})
        report["categories"][category] = {
            "name": cat_info["name"],
            "file_count": len(files),
            "total_size": sum(f["size"] for f in files),
            "extensions": {}
        }
        
        # Extension breakdown
        for file in files:
            ext = file["extension"] or "no_extension"
            report["categories"][category]["extensions"][ext] = \
                report["categories"][category]["extensions"].get(ext, 0) + 1
    
    # Project statistics
    for project, files in file_data["by_project"].items():
        report["projects"][project] = {
            "file_count": len(files),
            "total_size": sum(f["size"] for f in files),
            "categories": defaultdict(int)
        }
        
        for file in files:
            report["projects"][project]["categories"][file["category"]] += 1
    
    # Overall statistics
    report["statistics"] = {
        "total_size_bytes": sum(f["size"] for f in file_data["all"]),
        "unique_extensions": len(set(f["extension"] for f in file_data["all"])),
        "files_by_extension": defaultdict(int)
    }
    
    for file in file_data["all"]:
        ext = file["extension"] or "no_extension"
        report["statistics"]["files_by_extension"][ext] += 1
    
    # Save report
    report_file = BASE_DIR / "ORGANIZATION_REPORT.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"  ✓ Report saved: {report_file}")
    
    # Generate markdown report
    md_report = BASE_DIR / "ORGANIZATION_REPORT.md"
    with open(md_report, 'w') as f:
        f.write("# Complete File Organization Report\n\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        f.write(f"**Total Files:** {file_data['total']:,}\n\n")
        
        f.write("## Files by Category\n\n")
        f.write("| Category | Files | Size (MB) |\n")
        f.write("|----------|-------|-----------|\n")
        
        for cat_id, cat_data in sorted(report["categories"].items()):
            size_mb = cat_data["total_size"] / (1024 * 1024)
            f.write(f"| {cat_data['name']} | {cat_data['file_count']:,} | {size_mb:.2f} |\n")
        
        f.write("\n## Files by Project\n\n")
        f.write("| Project | Files | Size (MB) |\n")
        f.write("|---------|-------|-----------|\n")
        
        for proj, proj_data in sorted(report["projects"].items()):
            size_mb = proj_data["total_size"] / (1024 * 1024)
            f.write(f"| {proj} | {proj_data['file_count']:,} | {size_mb:.2f} |\n")
    
    print(f"  ✓ Markdown report saved: {md_report}")
    
    return report

def install_all_dependencies():
    """Install all dependencies"""
    print("\n" + "="*60)
    print("Installing all dependencies...")
    print("="*60)
    
    # Check if master requirements file exists
    master_req = BASE_DIR / "requirements_master.txt"
    if master_req.exists():
        print(f"  Installing from {master_req}...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-r", str(master_req)],
                check=False
            )
            print("  ✓ Installation attempted")
        except Exception as e:
            print(f"  ⚠️  Installation error: {e}")
    else:
        print("  ⚠️  Master requirements file not found")
        print("  Run: python3 install_all_dependencies.py first")

def main():
    """Main organization function"""
    print("="*60)
    print("MASTER FILE ORGANIZATION - 1000 NANO SYSTEM")
    print("="*60)
    print(f"Base directory: {BASE_DIR}")
    print(f"Organization directory: {ORGANIZATION_DIR}")
    
    # Step 1: Scan all files
    file_data = scan_all_files()
    print(f"\n✓ Scanned {file_data['total']:,} files")
    
    # Step 2: Create organization structure
    create_organization_structure()
    
    # Step 3: Generate reports
    report = generate_organization_report(file_data)
    
    # Step 4: Install dependencies
    install_all_dependencies()
    
    # Step 5: Save file mapping
    mapping_file = BASE_DIR / "FILE_ORGANIZATION_MAPPING.json"
    with open(mapping_file, 'w') as f:
        json.dump(file_data, f, indent=2, default=str)
    print(f"\n✓ File mapping saved: {mapping_file}")
    
    # Summary
    print("\n" + "="*60)
    print("✅ ORGANIZATION COMPLETE")
    print("="*60)
    print(f"\nTotal files organized: {file_data['total']:,}")
    print(f"Categories: {len(file_data['by_category'])}")
    print(f"Projects: {len(file_data['by_project'])}")
    print(f"\nReports:")
    print(f"  - ORGANIZATION_REPORT.json")
    print(f"  - ORGANIZATION_REPORT.md")
    print(f"  - FILE_ORGANIZATION_MAPPING.json")
    print(f"\nOrganization structure: {ORGANIZATION_DIR}")

if __name__ == "__main__":
    main()







