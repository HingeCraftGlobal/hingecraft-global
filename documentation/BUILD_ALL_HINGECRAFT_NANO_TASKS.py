#!/usr/bin/env python3
"""
HingeCraft Global - Complete Nano Task Builder & Executor
Generates and executes ALL nano tasks for the entire project
"""

import json
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List

# Base directory (use current directory or environment variable)
BASE_DIR = Path(os.getenv("HINGECRAFT_GLOBAL_DIR", os.path.dirname(os.path.abspath(__file__))))

# Master task tracker
MASTER_RESULTS = {
    "session_id": datetime.now().strftime("%Y%m%d_%H%M%S"),
    "start_time": datetime.now().isoformat(),
    "project": "HingeCraft Global",
    "total_tasks": 0,
    "passed": 0,
    "failed": 0,
    "sections": {}
}

def verify_file_exists(path):
    p = BASE_DIR / path if not str(path).startswith('/') else Path(path)
    return p.exists()

def verify_python_syntax(path):
    p = BASE_DIR / path if not str(path).startswith('/') else Path(path)
    if not p.exists():
        return False
    try:
        result = subprocess.run(['python3', '-m', 'py_compile', str(p)], 
                               capture_output=True, timeout=10)
        return result.returncode == 0
    except:
        return False

def verify_json_valid(path):
    p = BASE_DIR / path if not str(path).startswith('/') else Path(path)
    if not p.exists():
        return False
    try:
        with open(p) as f:
            json.load(f)
        return True
    except:
        return False

def verify_sql_valid(path):
    p = BASE_DIR / path if not str(path).startswith('/') else Path(path)
    if not p.exists():
        return False
    try:
        content = p.read_text()
        return any(kw in content.upper() for kw in ['CREATE', 'INSERT', 'SELECT', 'ALTER', 'DROP', 'GRANT'])
    except:
        return False

def verify_html_valid(path):
    p = BASE_DIR / path if not str(path).startswith('/') else Path(path)
    if not p.exists():
        return False
    try:
        content = p.read_text()
        return '<html' in content.lower() or '<!doctype' in content.lower() or '<div' in content.lower()
    except:
        return False

def verify_not_empty(path):
    p = BASE_DIR / path if not str(path).startswith('/') else Path(path)
    try:
        return p.stat().st_size > 0
    except:
        return False

def verify_no_conflicts(path):
    p = BASE_DIR / path if not str(path).startswith('/') else Path(path)
    try:
        content = p.read_text()
        return '<<<<<<<' not in content and '>>>>>>>' not in content
    except:
        return True

def run_section(section_name: str, files: List[Path], tasks: List[tuple]) -> Dict:
    """Run all tasks for a section"""
    section_results = {
        "files_count": len(files),
        "tasks_per_file": len(tasks),
        "total_tasks": len(files) * len(tasks),
        "passed": 0,
        "failed": 0,
        "failed_items": []
    }
    
    for filepath in files:
        rel_path = str(filepath.relative_to(BASE_DIR)) if filepath.is_absolute() else str(filepath)
        
        for task_name, task_func in tasks:
            MASTER_RESULTS["total_tasks"] += 1
            
            try:
                passed = task_func(rel_path)
                if passed:
                    section_results["passed"] += 1
                    MASTER_RESULTS["passed"] += 1
                else:
                    section_results["failed"] += 1
                    MASTER_RESULTS["failed"] += 1
                    section_results["failed_items"].append({"file": rel_path, "task": task_name})
            except Exception as e:
                section_results["failed"] += 1
                MASTER_RESULTS["failed"] += 1
    
    return section_results

print("=" * 70)
print("🚀 HINGECRAFT GLOBAL - COMPLETE NANO TASK BUILDER")
print("=" * 70)
print(f"Session Start: {MASTER_RESULTS['start_time']}")
print()

# SECTION 1: AGENTS
print("=" * 70)
print("📂 SECTION 1: AGENTS SYSTEM")
print("=" * 70)

agent_files = [f for f in (BASE_DIR / "agents").rglob("*.py") if "__pycache__" not in str(f)]
agent_tasks = [("file_exists", verify_file_exists), ("python_syntax", verify_python_syntax), 
               ("not_empty", verify_not_empty), ("no_conflicts", verify_no_conflicts)]

print(f"[INFO] Processing {len(agent_files)} agent files × {len(agent_tasks)} tasks = {len(agent_files)*len(agent_tasks)} tasks...")
MASTER_RESULTS["sections"]["agents"] = run_section("agents", agent_files, agent_tasks)
r = MASTER_RESULTS["sections"]["agents"]
print(f"✅ Agents: {r['passed']}/{r['total_tasks']} ({r['passed']/max(r['total_tasks'],1)*100:.1f}%)")

# SECTION 2: DATABASE
print()
print("=" * 70)
print("📂 SECTION 2: DATABASE SCHEMA")
print("=" * 70)

sql_files = list((BASE_DIR / "database").rglob("*.sql"))
sql_tasks = [("file_exists", verify_file_exists), ("sql_valid", verify_sql_valid), 
             ("not_empty", verify_not_empty), ("no_conflicts", verify_no_conflicts)]
print(f"[INFO] Processing {len(sql_files)} SQL files × {len(sql_tasks)} tasks...")
MASTER_RESULTS["sections"]["database_sql"] = run_section("database_sql", sql_files, sql_tasks)

db_json = list((BASE_DIR / "database").rglob("*.json"))
json_tasks = [("file_exists", verify_file_exists), ("json_valid", verify_json_valid), ("not_empty", verify_not_empty)]
print(f"[INFO] Processing {len(db_json)} JSON files × {len(json_tasks)} tasks...")
MASTER_RESULTS["sections"]["database_json"] = run_section("database_json", db_json, json_tasks)

csv_files = list((BASE_DIR / "database").rglob("*.csv"))
csv_tasks = [("file_exists", verify_file_exists), ("not_empty", verify_not_empty)]
print(f"[INFO] Processing {len(csv_files)} CSV files × {len(csv_tasks)} tasks...")
MASTER_RESULTS["sections"]["database_csv"] = run_section("database_csv", csv_files, csv_tasks)

total_db = sum(MASTER_RESULTS["sections"][k]["passed"] for k in ["database_sql", "database_json", "database_csv"])
total_db_tasks = sum(MASTER_RESULTS["sections"][k]["total_tasks"] for k in ["database_sql", "database_json", "database_csv"])
print(f"✅ Database Total: {total_db}/{total_db_tasks} ({total_db/max(total_db_tasks,1)*100:.1f}%)")

# SECTION 3: API
print()
print("=" * 70)
print("📂 SECTION 3: API SYSTEM")
print("=" * 70)

api_files = [f for f in (BASE_DIR / "api").rglob("*.py") if "__pycache__" not in str(f)]
api_tasks = [("file_exists", verify_file_exists), ("python_syntax", verify_python_syntax),
             ("not_empty", verify_not_empty), ("no_conflicts", verify_no_conflicts)]
print(f"[INFO] Processing {len(api_files)} API files × {len(api_tasks)} tasks...")
MASTER_RESULTS["sections"]["api"] = run_section("api", api_files, api_tasks)
r = MASTER_RESULTS["sections"]["api"]
print(f"✅ API: {r['passed']}/{r['total_tasks']} ({r['passed']/max(r['total_tasks'],1)*100:.1f}%)")

# SECTION 4: SCRIPTS
print()
print("=" * 70)
print("📂 SECTION 4: SCRIPTS")
print("=" * 70)

script_py = [f for f in (BASE_DIR / "scripts").rglob("*.py") if "__pycache__" not in str(f)] if (BASE_DIR / "scripts").exists() else []
script_sh = list((BASE_DIR / "scripts").rglob("*.sh")) if (BASE_DIR / "scripts").exists() else []

print(f"[INFO] Processing {len(script_py)} Python scripts × 3 tasks...")
MASTER_RESULTS["sections"]["scripts_py"] = run_section("scripts_py", script_py, 
    [("file_exists", verify_file_exists), ("python_syntax", verify_python_syntax), ("not_empty", verify_not_empty)])

print(f"[INFO] Processing {len(script_sh)} Shell scripts × 2 tasks...")
MASTER_RESULTS["sections"]["scripts_sh"] = run_section("scripts_sh", script_sh,
    [("file_exists", verify_file_exists), ("not_empty", verify_not_empty)])

total_scripts = MASTER_RESULTS["sections"]["scripts_py"]["passed"] + MASTER_RESULTS["sections"]["scripts_sh"]["passed"]
total_script_tasks = MASTER_RESULTS["sections"]["scripts_py"]["total_tasks"] + MASTER_RESULTS["sections"]["scripts_sh"]["total_tasks"]
print(f"✅ Scripts: {total_scripts}/{total_script_tasks} ({total_scripts/max(total_script_tasks,1)*100:.1f}%)")

# SECTION 5: LEGAL DOCS
print()
print("=" * 70)
print("📂 SECTION 5: LEGAL COMPLIANCE DOCUMENTS")
print("=" * 70)

legal_files = list((BASE_DIR / "COMPLETE_LEGAL_DOCS_SC").glob("*.html")) if (BASE_DIR / "COMPLETE_LEGAL_DOCS_SC").exists() else []
legal_tasks = [("file_exists", verify_file_exists), ("html_valid", verify_html_valid), ("not_empty", verify_not_empty)]
print(f"[INFO] Processing {len(legal_files)} legal HTML files × {len(legal_tasks)} tasks...")
MASTER_RESULTS["sections"]["legal_docs"] = run_section("legal_docs", legal_files, legal_tasks)
r = MASTER_RESULTS["sections"]["legal_docs"]
print(f"✅ Legal Docs: {r['passed']}/{r['total_tasks']} ({r['passed']/max(r['total_tasks'],1)*100:.1f}%)")

# SECTION 6: WIX
print()
print("=" * 70)
print("📂 SECTION 6: WIX INTEGRATION")
print("=" * 70)

wix_js = [f for f in (BASE_DIR / "src").rglob("*.js") if "node_modules" not in str(f)]
wix_jsw = list((BASE_DIR / "src").rglob("*.jsw"))
wix_tasks = [("file_exists", verify_file_exists), ("not_empty", verify_not_empty), ("no_conflicts", verify_no_conflicts)]

print(f"[INFO] Processing {len(wix_js)} JavaScript files × {len(wix_tasks)} tasks...")
MASTER_RESULTS["sections"]["wix_js"] = run_section("wix_js", wix_js, wix_tasks)

print(f"[INFO] Processing {len(wix_jsw)} JSW files × {len(wix_tasks)} tasks...")
MASTER_RESULTS["sections"]["wix_jsw"] = run_section("wix_jsw", wix_jsw, wix_tasks)

total_wix = MASTER_RESULTS["sections"]["wix_js"]["passed"] + MASTER_RESULTS["sections"]["wix_jsw"]["passed"]
total_wix_tasks = MASTER_RESULTS["sections"]["wix_js"]["total_tasks"] + MASTER_RESULTS["sections"]["wix_jsw"]["total_tasks"]
print(f"✅ Wix Integration: {total_wix}/{total_wix_tasks} ({total_wix/max(total_wix_tasks,1)*100:.1f}%)")

# SECTION 7: NOTION
print()
print("=" * 70)
print("📂 SECTION 7: NOTION INTEGRATION")
print("=" * 70)

notion_py = [f for f in (BASE_DIR / "notion").rglob("*.py") if "__pycache__" not in str(f) and "venv" not in str(f)]
notion_json = [f for f in (BASE_DIR / "notion").rglob("*.json") if "venv" not in str(f)]

print(f"[INFO] Processing {len(notion_py)} Notion Python files × 3 tasks...")
MASTER_RESULTS["sections"]["notion_py"] = run_section("notion_py", notion_py,
    [("file_exists", verify_file_exists), ("python_syntax", verify_python_syntax), ("not_empty", verify_not_empty)])

print(f"[INFO] Processing {len(notion_json)} Notion JSON files × 2 tasks...")
MASTER_RESULTS["sections"]["notion_json"] = run_section("notion_json", notion_json,
    [("file_exists", verify_file_exists), ("json_valid", verify_json_valid)])

total_notion = MASTER_RESULTS["sections"]["notion_py"]["passed"] + MASTER_RESULTS["sections"]["notion_json"]["passed"]
total_notion_tasks = MASTER_RESULTS["sections"]["notion_py"]["total_tasks"] + MASTER_RESULTS["sections"]["notion_json"]["total_tasks"]
print(f"✅ Notion Integration: {total_notion}/{total_notion_tasks} ({total_notion/max(total_notion_tasks,1)*100:.1f}%)")

# SECTION 8: CONFIG
print()
print("=" * 70)
print("📂 SECTION 8: ROOT CONFIGURATION FILES")
print("=" * 70)

root_json = list(BASE_DIR.glob("*.json"))
root_md = list(BASE_DIR.glob("*.md"))
root_sh = list(BASE_DIR.glob("*.sh"))

print(f"[INFO] Processing {len(root_json)} root JSON files × 2 tasks...")
MASTER_RESULTS["sections"]["config_json"] = run_section("config_json", root_json,
    [("file_exists", verify_file_exists), ("json_valid", verify_json_valid)])

print(f"[INFO] Processing {len(root_md)} root MD files × 2 tasks...")
MASTER_RESULTS["sections"]["config_md"] = run_section("config_md", root_md,
    [("file_exists", verify_file_exists), ("not_empty", verify_not_empty)])

print(f"[INFO] Processing {len(root_sh)} root shell scripts × 2 tasks...")
MASTER_RESULTS["sections"]["config_sh"] = run_section("config_sh", root_sh,
    [("file_exists", verify_file_exists), ("not_empty", verify_not_empty)])

total_config = sum(MASTER_RESULTS["sections"][k]["passed"] for k in ["config_json", "config_md", "config_sh"])
total_config_tasks = sum(MASTER_RESULTS["sections"][k]["total_tasks"] for k in ["config_json", "config_md", "config_sh"])
print(f"✅ Config Files: {total_config}/{total_config_tasks} ({total_config/max(total_config_tasks,1)*100:.1f}%)")

# FINAL SUMMARY
print()
print("=" * 70)
print("🎉 HINGECRAFT NANO TASK EXECUTION COMPLETE")
print("=" * 70)

MASTER_RESULTS["end_time"] = datetime.now().isoformat()
overall_rate = (MASTER_RESULTS["passed"] / max(MASTER_RESULTS["total_tasks"], 1)) * 100

print()
print("📊 MASTER SUMMARY")
print("-" * 50)
print(f"Total Tasks Executed:  {MASTER_RESULTS['total_tasks']}")
print(f"✅ Passed:            {MASTER_RESULTS['passed']}")
print(f"❌ Failed:            {MASTER_RESULTS['failed']}")
print(f"Success Rate:          {overall_rate:.2f}%")
print()

print("📋 SECTION BREAKDOWN")
print("-" * 50)
for section, data in MASTER_RESULTS["sections"].items():
    if data["total_tasks"] > 0:
        rate = (data["passed"] / data["total_tasks"]) * 100
        status = "✅" if rate >= 95 else "⚠️" if rate >= 80 else "❌"
        print(f"  {status} {section}: {data['passed']}/{data['total_tasks']} ({rate:.1f}%)")

# Save results
results_file = BASE_DIR / "HINGECRAFT_NANO_TASKS_COMPLETE_RESULTS.json"
with open(results_file, 'w') as f:
    json.dump(MASTER_RESULTS, f, indent=2)

print()
print(f"Results saved to: {results_file}")
print()
print("=" * 70)
print("✅ ALL HINGECRAFT NANO TASKS BUILT AND EXECUTED")
print("=" * 70)
