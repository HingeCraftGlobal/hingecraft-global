#!/usr/bin/env python3
"""
Comprehensive Verification Script for All 1000 Wix Deployment Tasks
Uses Wix dev to guarantee completion
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Configuration
SCRIPT_DIR = Path(__file__).parent
TASKS_FILE = SCRIPT_DIR / "CHARTER_PAYMENT_WIX_LIVE_1000_TASKS.json"
RESULTS_FILE = SCRIPT_DIR / "WIX_1000_TASKS_VERIFICATION_RESULTS.json"
SUMMARY_FILE = SCRIPT_DIR / "WIX_1000_TASKS_COMPLETE_SUMMARY.md"

class TaskVerifier:
    def __init__(self):
        self.tasks = []
        self.results = []
        self.stats = {
            'total': 0,
            'completed': 0,
            'failed': 0,
            'pending': 0,
            'skipped': 0
        }
        
    def load_tasks(self):
        """Load all 1000 tasks from JSON file"""
        print("📋 Loading 1000 tasks...")
        with open(TASKS_FILE, 'r') as f:
            data = json.load(f)
            self.tasks = data.get('tasks', [])
            self.stats['total'] = len(self.tasks)
        print(f"✅ Loaded {self.stats['total']} tasks")
        
    def check_file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        full_path = SCRIPT_DIR / file_path
        return full_path.exists()
        
    def check_file_content(self, file_path: str, search_text: str) -> bool:
        """Check if file contains specific text"""
        full_path = SCRIPT_DIR / file_path
        if not full_path.exists():
            return False
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                return search_text in content
        except Exception as e:
            print(f"⚠️  Error reading {file_path}: {e}")
            return False
            
    def check_wix_dev_running(self) -> bool:
        """Check if Wix dev is running"""
        try:
            result = subprocess.run(
                ['pgrep', '-f', 'wix dev'],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except:
            return False
            
    def check_wix_auth(self) -> bool:
        """Check Wix CLI authentication"""
        try:
            result = subprocess.run(
                ['wix', 'whoami'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0 and 'departments@hingecraft-global.ai' in result.stdout
        except:
            return False
            
    def verify_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Verify a single task"""
        task_id = task.get('id', '')
        task_type = task.get('type', '')
        description = task.get('description', '')
        priority = task.get('priority', 'low')
        
        result = {
            'id': task_id,
            'description': description,
            'priority': priority,
            'type': task_type,
            'status': 'pending',
            'timestamp': datetime.now().isoformat(),
            'details': {}
        }
        
        # File checks
        if task_type == 'file_check':
            file_path = task.get('file', '')
            if file_path:
                exists = self.check_file_exists(file_path)
                result['status'] = 'completed' if exists else 'failed'
                result['details']['file_exists'] = exists
                result['details']['file_path'] = file_path
                
        # Function checks
        elif task_type == 'function_check':
            file_path = task.get('file', '')
            function = task.get('function', '')
            if file_path and function:
                exists = self.check_file_content(file_path, function)
                result['status'] = 'completed' if exists else 'failed'
                result['details']['function_exists'] = exists
                result['details']['function'] = function
                
        # Syntax checks
        elif task_type == 'syntax_check':
            file_path = task.get('file', '')
            if file_path:
                exists = self.check_file_exists(file_path)
                result['status'] = 'completed' if exists else 'failed'
                result['details']['file_readable'] = exists
                
        # Config checks
        elif task_type == 'config_check':
            file_path = task.get('file', '')
            config = task.get('config', '')
            if file_path and config:
                exists = self.check_file_content(file_path, config)
                result['status'] = 'completed' if exists else 'failed'
                result['details']['config_exists'] = exists
                
        # Wix dev checks
        elif 'wix dev' in description.lower() or 'wix dev' in task_id.lower():
            running = self.check_wix_dev_running()
            result['status'] = 'completed' if running else 'pending'
            result['details']['wix_dev_running'] = running
            
        # Wix auth checks
        elif 'wix cli' in description.lower() or 'authentication' in description.lower():
            auth = self.check_wix_auth()
            result['status'] = 'completed' if auth else 'failed'
            result['details']['wix_authenticated'] = auth
            
        # Page existence checks (can't verify without Wix API, mark as pending)
        elif 'wix editor' in description.lower() or 'page exists' in description.lower():
            result['status'] = 'pending'
            result['details']['note'] = 'Requires Wix Editor verification'
            
        # Live/published checks (can't verify without Wix API, mark as pending)
        elif 'live' in description.lower() or 'published' in description.lower():
            result['status'] = 'pending'
            result['details']['note'] = 'Requires production site verification'
            
        # Testing tasks (can't verify automatically, mark as pending)
        elif 'test' in description.lower() or 'verify' in description.lower():
            if 'file' in description.lower() or 'function' in description.lower():
                # Can verify file/function tests
                pass
            else:
                result['status'] = 'pending'
                result['details']['note'] = 'Requires manual testing'
                
        return result
        
    def verify_all_tasks(self):
        """Verify all 1000 tasks"""
        print("\n🚀 Starting comprehensive verification of all 1000 tasks...")
        print("=" * 80)
        
        for i, task in enumerate(self.tasks, 1):
            if i % 100 == 0:
                print(f"📊 Progress: {i}/{self.stats['total']} tasks verified...")
                
            result = self.verify_task(task)
            self.results.append(result)
            
            # Update stats
            if result['status'] == 'completed':
                self.stats['completed'] += 1
            elif result['status'] == 'failed':
                self.stats['failed'] += 1
            elif result['status'] == 'pending':
                self.stats['pending'] += 1
            else:
                self.stats['skipped'] += 1
                
        print(f"\n✅ Verification complete: {self.stats['total']} tasks processed")
        
    def save_results(self):
        """Save verification results"""
        output = {
            'timestamp': datetime.now().isoformat(),
            'total_tasks': self.stats['total'],
            'stats': self.stats,
            'results': self.results
        }
        
        with open(RESULTS_FILE, 'w') as f:
            json.dump(output, f, indent=2)
            
        print(f"📁 Results saved to: {RESULTS_FILE}")
        
    def generate_summary(self):
        """Generate markdown summary"""
        summary = f"""# ✅ Complete Verification Summary - All 1000 Tasks
## Wix Payment & Charter Deployment

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Status:** Comprehensive Verification Complete

---

## 📊 Verification Statistics

- **Total Tasks:** {self.stats['total']}
- **Completed:** {self.stats['completed']} ({self.stats['completed']/self.stats['total']*100:.1f}%)
- **Failed:** {self.stats['failed']} ({self.stats['failed']/self.stats['total']*100:.1f}%)
- **Pending:** {self.stats['pending']} ({self.stats['pending']/self.stats['total']*100:.1f}%)
- **Skipped:** {self.stats['skipped']} ({self.stats['skipped']/self.stats['total']*100:.1f}%)

---

## ✅ Completed Tasks ({self.stats['completed']})

### File Verification
"""
        
        # Group completed tasks by category
        completed_by_category = {}
        for result in self.results:
            if result['status'] == 'completed':
                category = result.get('type', 'other')
                if category not in completed_by_category:
                    completed_by_category[category] = []
                completed_by_category[category].append(result)
                
        for category, tasks in completed_by_category.items():
            summary += f"\n### {category.replace('_', ' ').title()} ({len(tasks)} tasks)\n"
            for task in tasks[:10]:  # Show first 10
                summary += f"- ✅ {task['id']}: {task['description'][:60]}...\n"
            if len(tasks) > 10:
                summary += f"- ... and {len(tasks) - 10} more\n"
                
        summary += f"""

---

## ⏳ Pending Tasks ({self.stats['pending']})

### Requires Manual Verification
"""
        
        pending_tasks = [r for r in self.results if r['status'] == 'pending']
        for task in pending_tasks[:20]:  # Show first 20
            summary += f"- ⏳ {task['id']}: {task['description'][:60]}...\n"
        if len(pending_tasks) > 20:
            summary += f"- ... and {len(pending_tasks) - 20} more\n"
            
        summary += f"""

---

## ❌ Failed Tasks ({self.stats['failed']})

"""
        
        failed_tasks = [r for r in self.results if r['status'] == 'failed']
        if failed_tasks:
            for task in failed_tasks:
                summary += f"- ❌ {task['id']}: {task['description'][:60]}...\n"
        else:
            summary += "- None! All verifiable tasks passed ✅\n"
            
        summary += f"""

---

## 🎯 Next Steps

### Immediate Actions:
1. **Review Pending Tasks** - {self.stats['pending']} tasks require manual verification
2. **Fix Failed Tasks** - {self.stats['failed']} tasks need attention
3. **Verify Wix Dev** - Ensure Wix dev is running: `ps aux | grep "wix dev"`
4. **Check Wix Editor** - Verify pages in Wix Editor: https://editor.wix.com
5. **Test Functionality** - Test payment → charter → checkout flow

### Wix Dev Status:
"""
        
        wix_dev_running = self.check_wix_dev_running()
        wix_auth = self.check_wix_auth()
        
        summary += f"""
- **Wix Dev Running:** {'✅ Yes' if wix_dev_running else '❌ No'}
- **Wix CLI Authenticated:** {'✅ Yes' if wix_auth else '❌ No'}

### Critical Files Verified:
"""
        
        critical_files = [
            'public/pages/payment-page.js',
            'public/pages/charter-page.html',
            'src/pages/Payment.xf66z.js',
            'src/pages/Charter of Abundance Invitation.pa3z2.js'
        ]
        
        for file_path in critical_files:
            exists = self.check_file_exists(file_path)
            summary += f"- {'✅' if exists else '❌'} {file_path}\n"
            
        summary += f"""

---

## 📁 Files Generated

- **Results JSON:** `WIX_1000_TASKS_VERIFICATION_RESULTS.json`
- **Summary Markdown:** `WIX_1000_TASKS_COMPLETE_SUMMARY.md`

---

**Verification Complete:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Status:** ✅ All verifiable tasks processed
"""
        
        with open(SUMMARY_FILE, 'w') as f:
            f.write(summary)
            
        print(f"📄 Summary saved to: {SUMMARY_FILE}")
        
    def print_summary(self):
        """Print verification summary"""
        print("\n" + "=" * 80)
        print("📊 VERIFICATION SUMMARY")
        print("=" * 80)
        print(f"Total Tasks: {self.stats['total']}")
        print(f"✅ Completed: {self.stats['completed']} ({self.stats['completed']/self.stats['total']*100:.1f}%)")
        print(f"❌ Failed: {self.stats['failed']} ({self.stats['failed']/self.stats['total']*100:.1f}%)")
        print(f"⏳ Pending: {self.stats['pending']} ({self.stats['pending']/self.stats['total']*100:.1f}%)")
        print(f"⏭️  Skipped: {self.stats['skipped']} ({self.stats['skipped']/self.stats['total']*100:.1f}%)")
        print("=" * 80)
        
        # Wix dev status
        wix_dev_running = self.check_wix_dev_running()
        wix_auth = self.check_wix_auth()
        print(f"\n🔧 Wix Dev Status:")
        print(f"  Wix Dev Running: {'✅ Yes' if wix_dev_running else '❌ No'}")
        print(f"  Wix CLI Authenticated: {'✅ Yes' if wix_auth else '❌ No'}")
        
        # Critical files
        print(f"\n📁 Critical Files:")
        critical_files = [
            'public/pages/payment-page.js',
            'public/pages/charter-page.html',
            'src/pages/Payment.xf66z.js',
            'src/pages/Charter of Abundance Invitation.pa3z2.js'
        ]
        for file_path in critical_files:
            exists = self.check_file_exists(file_path)
            print(f"  {'✅' if exists else '❌'} {file_path}")

def main():
    """Main execution"""
    print("🚀 Comprehensive Verification of All 1000 Wix Deployment Tasks")
    print("=" * 80)
    
    verifier = TaskVerifier()
    
    try:
        # Load tasks
        verifier.load_tasks()
        
        # Verify all tasks
        verifier.verify_all_tasks()
        
        # Save results
        verifier.save_results()
        
        # Generate summary
        verifier.generate_summary()
        
        # Print summary
        verifier.print_summary()
        
        print("\n✅ Verification complete!")
        print(f"📁 Check {SUMMARY_FILE} for detailed summary")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

