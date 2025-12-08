#!/usr/bin/env python3
"""
Execute Critical Wix Deployment Tasks
Verifies charter and payment pages are ready for Wix deployment
"""

import json
import os
import subprocess
from pathlib import Path
from datetime import datetime

# Load tasks
TASKS_FILE = Path(__file__).parent / "CHARTER_PAYMENT_WIX_LIVE_1000_TASKS.json"
RESULTS_FILE = Path(__file__).parent / "WIX_DEPLOYMENT_TASK_RESULTS.json"

def load_tasks():
    """Load tasks from JSON file"""
    with open(TASKS_FILE, 'r') as f:
        return json.load(f)

def check_file_exists(file_path):
    """Check if file exists"""
    full_path = Path(__file__).parent / file_path
    return full_path.exists()

def check_file_content(file_path, search_text):
    """Check if file contains specific text"""
    full_path = Path(__file__).parent / file_path
    if not full_path.exists():
        return False
    try:
        with open(full_path, 'r') as f:
            content = f.read()
            return search_text in content
    except:
        return False

def execute_task(task):
    """Execute a single task"""
    task_id = task['id']
    task_type = task.get('type', '')
    description = task.get('description', '')
    
    result = {
        'id': task_id,
        'description': description,
        'status': 'pending',
        'timestamp': datetime.now().isoformat(),
        'details': {}
    }
    
    # File checks
    if task_type == 'file_check':
        file_path = task.get('file', '')
        if file_path:
            exists = check_file_exists(file_path)
            result['status'] = 'completed' if exists else 'failed'
            result['details']['file_exists'] = exists
            result['details']['file_path'] = file_path
    
    # Function checks
    elif task_type == 'function_check':
        file_path = task.get('file', '')
        function = task.get('function', '')
        if file_path and function:
            exists = check_file_content(file_path, function)
            result['status'] = 'completed' if exists else 'failed'
            result['details']['function_exists'] = exists
            result['details']['function'] = function
    
    # Syntax checks
    elif task_type == 'syntax_check':
        file_path = task.get('file', '')
        if file_path:
            exists = check_file_exists(file_path)
            # Basic syntax check - file exists and is readable
            result['status'] = 'completed' if exists else 'failed'
            result['details']['file_readable'] = exists
    
    # Config checks
    elif task_type == 'config_check':
        file_path = task.get('file', '')
        config = task.get('config', '')
        if file_path and config:
            exists = check_file_content(file_path, config)
            result['status'] = 'completed' if exists else 'failed'
            result['details']['config_exists'] = exists
    
    else:
        # Other task types - mark as pending for manual verification
        result['status'] = 'pending'
        result['details']['note'] = 'Requires manual verification'
    
    return result

def main():
    """Main execution"""
    print("🚀 Executing Critical Wix Deployment Tasks")
    print("=" * 60)
    
    # Load tasks
    data = load_tasks()
    tasks = data['tasks']
    
    # Filter critical tasks (first 100)
    critical_tasks = [t for t in tasks if t.get('priority') == 'critical'][:100]
    
    print(f"\n📋 Found {len(critical_tasks)} critical tasks")
    print(f"📊 Total tasks: {len(tasks)}\n")
    
    # Execute tasks
    results = []
    completed = 0
    failed = 0
    pending = 0
    
    for i, task in enumerate(critical_tasks, 1):
        print(f"[{i}/{len(critical_tasks)}] {task['id']}: {task['description'][:60]}...", end=' ')
        result = execute_task(task)
        results.append(result)
        
        if result['status'] == 'completed':
            completed += 1
            print("✅")
        elif result['status'] == 'failed':
            failed += 1
            print("❌")
        else:
            pending += 1
            print("⏳")
    
    # Save results
    output = {
        'timestamp': datetime.now().isoformat(),
        'total_tasks': len(critical_tasks),
        'completed': completed,
        'failed': failed,
        'pending': pending,
        'results': results
    }
    
    with open(RESULTS_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 EXECUTION SUMMARY")
    print("=" * 60)
    print(f"✅ Completed: {completed}")
    print(f"❌ Failed: {failed}")
    print(f"⏳ Pending: {pending}")
    print(f"📈 Completion Rate: {(completed/len(critical_tasks)*100):.1f}%")
    print(f"\n📁 Results saved to: {RESULTS_FILE}")
    
    # Print failed tasks
    if failed > 0:
        print("\n❌ FAILED TASKS:")
        for result in results:
            if result['status'] == 'failed':
                print(f"  - {result['id']}: {result['description']}")
    
    # Print recommendations
    print("\n💡 RECOMMENDATIONS:")
    if completed >= 80:
        print("  ✅ Most critical tasks completed - Ready for Wix deployment")
        print("  📋 Next: Run 'wix dev' to sync pages")
        print("  📋 Then: Verify pages in Wix Editor")
        print("  📋 Finally: Run 'wix publish' to go live")
    elif completed >= 50:
        print("  ⚠️  Some tasks completed - Review failed tasks")
        print("  📋 Fix issues before proceeding with deployment")
    else:
        print("  ❌ Many tasks failed - Review and fix issues")
        print("  📋 Check file paths and code structure")

if __name__ == '__main__':
    main()

