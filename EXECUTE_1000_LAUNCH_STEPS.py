#!/usr/bin/env python3
"""
Execute All 1000 Launch Nano Steps
Systematically verify and execute each step
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
STEPS_FILE = SCRIPT_DIR / "LAUNCH_1000_NANO_STEPS.json"
RESULTS_FILE = SCRIPT_DIR / "LAUNCH_1000_STEPS_RESULTS.json"
PROGRESS_FILE = SCRIPT_DIR / "LAUNCH_1000_STEPS_PROGRESS.json"

class LaunchStepExecutor:
    def __init__(self):
        self.steps = []
        self.results = []
        self.progress = {
            'total': 0,
            'completed': 0,
            'failed': 0,
            'pending': 0,
            'skipped': 0,
            'current_step': 0
        }
        
    def load_steps(self):
        """Load all 1000 steps"""
        print("📋 Loading 1000 launch steps...")
        with open(STEPS_FILE, 'r') as f:
            data = json.load(f)
            self.steps = data.get('steps', [])
            self.progress['total'] = len(self.steps)
        print(f"✅ Loaded {self.progress['total']} steps")
        
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
        except:
            return False
            
    def execute_command(self, command: str) -> tuple[bool, str]:
        """Execute shell command"""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0, result.stdout
        except Exception as e:
            return False, str(e)
            
    def execute_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single step"""
        step_id = step.get('id', '')
        category = step.get('category', '')
        description = step.get('description', '')
        priority = step.get('priority', 'low')
        is_manual = step.get('manual', False)
        
        result = {
            'id': step_id,
            'category': category,
            'priority': priority,
            'description': description,
            'status': 'pending',
            'timestamp': datetime.now().isoformat(),
            'details': {}
        }
        
        # Skip manual steps (require human interaction)
        if is_manual:
            result['status'] = 'pending'
            result['details']['note'] = 'Requires manual verification'
            return result
        
        # File checks
        if 'file' in step:
            file_path = step.get('file', '')
            check_type = step.get('check', 'exists')
            
            if check_type == 'exists':
                exists = self.check_file_exists(file_path)
                result['status'] = 'completed' if exists else 'failed'
                result['details']['file_exists'] = exists
            elif check_type == 'file_size':
                exists = self.check_file_exists(file_path)
                if exists:
                    size = (SCRIPT_DIR / file_path).stat().st_size
                    result['status'] = 'completed' if size > 0 else 'failed'
                    result['details']['file_size'] = size
                else:
                    result['status'] = 'failed'
            elif 'search' in step:
                search_text = step.get('search', '')
                exists = self.check_file_content(file_path, search_text)
                result['status'] = 'completed' if exists else 'failed'
                result['details']['content_found'] = exists
        
        # Command execution
        elif 'command' in step:
            command = step.get('command', '')
            success, output = self.execute_command(command)
            result['status'] = 'completed' if success else 'failed'
            result['details']['command_output'] = output[:200]  # Limit output
        
        # Default: mark as pending
        else:
            result['status'] = 'pending'
            result['details']['note'] = 'Automated verification not available'
        
        return result
        
    def execute_all_steps(self, start_from: int = 0, limit: int = None):
        """Execute all steps"""
        print(f"\n🚀 Executing launch steps (starting from step {start_from+1})...")
        print("=" * 80)
        
        steps_to_execute = self.steps[start_from:]
        if limit:
            steps_to_execute = steps_to_execute[:limit]
        
        for i, step in enumerate(steps_to_execute, start_from+1):
            if i % 50 == 0:
                print(f"📊 Progress: {i}/{self.progress['total']} steps...")
            
            result = self.execute_step(step)
            self.results.append(result)
            self.progress['current_step'] = i
            
            # Update progress
            if result['status'] == 'completed':
                self.progress['completed'] += 1
            elif result['status'] == 'failed':
                self.progress['failed'] += 1
            elif result['status'] == 'pending':
                self.progress['pending'] += 1
            else:
                self.progress['skipped'] += 1
        
        print(f"\n✅ Execution complete: {len(steps_to_execute)} steps processed")
        
    def save_results(self):
        """Save execution results"""
        output = {
            'timestamp': datetime.now().isoformat(),
            'progress': self.progress,
            'results': self.results
        }
        
        with open(RESULTS_FILE, 'w') as f:
            json.dump(output, f, indent=2)
            
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(self.progress, f, indent=2)
            
        print(f"📁 Results saved to: {RESULTS_FILE}")
        print(f"📁 Progress saved to: {PROGRESS_FILE}")
        
    def print_summary(self):
        """Print execution summary"""
        print("\n" + "=" * 80)
        print("📊 EXECUTION SUMMARY")
        print("=" * 80)
        print(f"Total Steps: {self.progress['total']}")
        print(f"✅ Completed: {self.progress['completed']} ({self.progress['completed']/self.progress['total']*100:.1f}%)")
        print(f"❌ Failed: {self.progress['failed']} ({self.progress['failed']/self.progress['total']*100:.1f}%)")
        print(f"⏳ Pending: {self.progress['pending']} ({self.progress['pending']/self.progress['total']*100:.1f}%)")
        print(f"⏭️  Skipped: {self.progress['skipped']} ({self.progress['skipped']/self.progress['total']*100:.1f}%)")
        print("=" * 80)
        
        # Category breakdown
        categories = {}
        for result in self.results:
            cat = result.get('category', 'unknown')
            if cat not in categories:
                categories[cat] = {'total': 0, 'completed': 0, 'failed': 0, 'pending': 0}
            categories[cat]['total'] += 1
            categories[cat][result['status']] = categories[cat].get(result['status'], 0) + 1
        
        print("\n📊 By Category:")
        for cat, stats in sorted(categories.items()):
            print(f"  {cat}:")
            print(f"    Total: {stats['total']}")
            print(f"    Completed: {stats.get('completed', 0)}")
            print(f"    Failed: {stats.get('failed', 0)}")
            print(f"    Pending: {stats.get('pending', 0)}")

def main():
    """Main execution"""
    print("🚀 Execute All 1000 Launch Nano Steps")
    print("=" * 80)
    
    executor = LaunchStepExecutor()
    
    try:
        # Load steps
        executor.load_steps()
        
        # Execute all steps
        executor.execute_all_steps()
        
        # Save results
        executor.save_results()
        
        # Print summary
        executor.print_summary()
        
        print("\n✅ Execution complete!")
        print(f"📁 Check {RESULTS_FILE} for detailed results")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()



