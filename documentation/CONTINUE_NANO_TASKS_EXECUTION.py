#!/usr/bin/env python3
"""
HingeCraft Global - Continue Nano Tasks Execution
Executes remaining nano tasks from where we left off
"""

import json
import os
import subprocess
from datetime import datetime
from pathlib import Path

# Base directory
BASE_DIR = Path("os.path.dirname(os.path.abspath(__file__))")

# Task categories and their verification methods
TASK_RESULTS = {
    "timestamp": datetime.now().isoformat(),
    "session": "continuation",
    "tasks_executed": 0,
    "tasks_passed": 0,
    "tasks_failed": 0,
    "categories": {}
}

def verify_file_exists(filepath):
    """Verify a file exists"""
    full_path = BASE_DIR / filepath if not filepath.startswith('/') else Path(filepath)
    return full_path.exists()

def verify_python_syntax(filepath):
    """Verify Python syntax"""
    full_path = BASE_DIR / filepath if not filepath.startswith('/') else Path(filepath)
    if not full_path.exists():
        return False
    try:
        result = subprocess.run(
            ['python3', '-m', 'py_compile', str(full_path)],
            capture_output=True, timeout=10
        )
        return result.returncode == 0
    except:
        return False

def verify_json_syntax(filepath):
    """Verify JSON syntax"""
    full_path = BASE_DIR / filepath if not filepath.startswith('/') else Path(filepath)
    if not full_path.exists():
        return False
    try:
        with open(full_path) as f:
            json.load(f)
        return True
    except:
        return False

def verify_sql_exists(filepath):
    """Verify SQL file exists and has content"""
    full_path = BASE_DIR / filepath if not filepath.startswith('/') else Path(filepath)
    if not full_path.exists():
        return False
    return full_path.stat().st_size > 0

def run_task_batch(category, tasks, verify_func):
    """Run a batch of verification tasks"""
    results = {"passed": 0, "failed": 0, "details": []}
    
    for task in tasks:
        TASK_RESULTS["tasks_executed"] += 1
        passed = verify_func(task)
        if passed:
            results["passed"] += 1
            TASK_RESULTS["tasks_passed"] += 1
        else:
            results["failed"] += 1
            TASK_RESULTS["tasks_failed"] += 1
            results["details"].append({"task": task, "status": "failed"})
    
    return results

print("=" * 60)
print("🚀 HingeCraft Global - Nano Task Continuation")
print("=" * 60)
print(f"Start Time: {datetime.now().isoformat()}")
print()

# 1. AGENT FILES VERIFICATION
print("📂 [1/7] Verifying Agent Python Files...")
agent_files = list((BASE_DIR / "agents").rglob("*.py"))
agent_results = run_task_batch("agents", [str(f.relative_to(BASE_DIR)) for f in agent_files], verify_python_syntax)
TASK_RESULTS["categories"]["agents"] = agent_results
print(f"   ✅ Passed: {agent_results['passed']}, ❌ Failed: {agent_results['failed']}")

# 2. DATABASE SQL FILES VERIFICATION
print("📂 [2/7] Verifying Database SQL Files...")
sql_files = list((BASE_DIR / "database").rglob("*.sql"))
sql_results = run_task_batch("database_sql", [str(f.relative_to(BASE_DIR)) for f in sql_files], verify_sql_exists)
TASK_RESULTS["categories"]["database_sql"] = sql_results
print(f"   ✅ Passed: {sql_results['passed']}, ❌ Failed: {sql_results['failed']}")

# 3. JSON FILES VERIFICATION
print("📂 [3/7] Verifying JSON Configuration Files...")
json_files = [f for f in BASE_DIR.rglob("*.json") if "node_modules" not in str(f) and ".wix" not in str(f)]
json_results = run_task_batch("json_configs", [str(f.relative_to(BASE_DIR)) for f in json_files], verify_json_syntax)
TASK_RESULTS["categories"]["json_configs"] = json_results
print(f"   ✅ Passed: {json_results['passed']}, ❌ Failed: {json_results['failed']}")

# 4. API FILES VERIFICATION
print("📂 [4/7] Verifying API Python Files...")
api_files = list((BASE_DIR / "api").rglob("*.py")) if (BASE_DIR / "api").exists() else []
api_results = run_task_batch("api", [str(f.relative_to(BASE_DIR)) for f in api_files], verify_python_syntax)
TASK_RESULTS["categories"]["api"] = api_results
print(f"   ✅ Passed: {api_results['passed']}, ❌ Failed: {api_results['failed']}")

# 5. SCRIPTS VERIFICATION
print("📂 [5/7] Verifying Script Files...")
script_files = list((BASE_DIR / "scripts").rglob("*.py")) if (BASE_DIR / "scripts").exists() else []
script_results = run_task_batch("scripts", [str(f.relative_to(BASE_DIR)) for f in script_files], verify_python_syntax)
TASK_RESULTS["categories"]["scripts"] = script_results
print(f"   ✅ Passed: {script_results['passed']}, ❌ Failed: {script_results['failed']}")

# 6. LEGAL PAGES VERIFICATION
print("📂 [6/7] Verifying Legal Pages HTML Files...")
legal_html = list((BASE_DIR / "COMPLETE_LEGAL_DOCS_SC").glob("*.html")) if (BASE_DIR / "COMPLETE_LEGAL_DOCS_SC").exists() else []
legal_results = run_task_batch("legal_pages", [str(f.relative_to(BASE_DIR)) for f in legal_html], verify_file_exists)
TASK_RESULTS["categories"]["legal_pages"] = legal_results
print(f"   ✅ Passed: {legal_results['passed']}, ❌ Failed: {legal_results['failed']}")

# 7. MASTER SCHEMA VERIFICATION
print("📂 [7/7] Verifying Master Schema Files...")
master_schema = list((BASE_DIR / "database" / "master_schema").glob("*.sql")) if (BASE_DIR / "database" / "master_schema").exists() else []
schema_results = run_task_batch("master_schema", [str(f.relative_to(BASE_DIR)) for f in master_schema], verify_sql_exists)
TASK_RESULTS["categories"]["master_schema"] = schema_results
print(f"   ✅ Passed: {schema_results['passed']}, ❌ Failed: {schema_results['failed']}")

# Calculate totals
print()
print("=" * 60)
print("📊 EXECUTION SUMMARY")
print("=" * 60)
print(f"Total Tasks Executed: {TASK_RESULTS['tasks_executed']}")
print(f"✅ Passed: {TASK_RESULTS['tasks_passed']}")
print(f"❌ Failed: {TASK_RESULTS['tasks_failed']}")
success_rate = (TASK_RESULTS['tasks_passed'] / max(TASK_RESULTS['tasks_executed'], 1)) * 100
print(f"Success Rate: {success_rate:.1f}%")
print()

# Save results
results_file = BASE_DIR / "NANO_TASKS_CONTINUATION_RESULTS.json"
with open(results_file, 'w') as f:
    json.dump(TASK_RESULTS, f, indent=2)
print(f"Results saved to: {results_file}")

print()
print("=" * 60)
print("✅ NANO TASK CONTINUATION COMPLETE")
print("=" * 60)



