#!/usr/bin/env python3
"""
Automation Triggers for Notion Integration
Automatically updates Notion based on various triggers
"""

import os
import json
import time
import logging
from datetime import datetime
from pathlib import Path
import subprocess
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notion-triggers")

class AutomationTriggers:
    """Handle automated triggers for Notion updates"""
    
    def __init__(self):
        self.workspace_path = Path(os.getenv("CURSOR_WORKSPACE_PATH", "../"))
        self.last_git_check = None
        self.last_file_check = None
    
    def check_git_activity(self):
        """Check for new git commits and trigger update"""
        try:
            result = subprocess.run(
                ['git', 'log', '--oneline', '-1', '--since=5 minutes ago'],
                cwd=self.workspace_path,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0 and result.stdout.strip():
                logger.info("Git activity detected - triggering Notion update")
                return {
                    'trigger': 'git_commit',
                    'timestamp': datetime.now().isoformat(),
                    'commits': result.stdout.strip().split('\n')
                }
        except Exception as e:
            logger.error(f"Error checking git activity: {e}")
        
        return None
    
    def check_file_modifications(self):
        """Check for recent file modifications"""
        recent_files = []
        cutoff_time = time.time() - 300  # Last 5 minutes
        
        for file_path in self.workspace_path.rglob("*"):
            if file_path.is_file() and file_path.suffix in ['.py', '.js', '.ts', '.md', '.json', '.sql']:
                try:
                    mtime = file_path.stat().st_mtime
                    if mtime > cutoff_time:
                        recent_files.append({
                            'path': str(file_path.relative_to(self.workspace_path)),
                            'modified': datetime.fromtimestamp(mtime).isoformat()
                        })
                except:
                    pass
        
        if recent_files:
            logger.info(f"File modifications detected: {len(recent_files)} files")
            return {
                'trigger': 'file_modification',
                'timestamp': datetime.now().isoformat(),
                'files': recent_files[:10]
            }
        
        return None
    
    def check_task_completion(self):
        """Check for completed tasks and update progress"""
        task_results_path = Path("../agents")
        completed_tasks = 0
        total_tasks = 0
        
        for result_file in task_results_path.glob("TASK_EXECUTION_RESULTS*.json"):
            try:
                with open(result_file, 'r') as f:
                    data = json.load(f)
                    if 'summary' in data:
                        total_tasks += data.get('total', 0)
                        completed_tasks += data['summary'].get('completed', 0)
            except:
                pass
        
        if total_tasks > 0:
            progress = (completed_tasks / total_tasks) * 100
            return {
                'trigger': 'task_completion',
                'timestamp': datetime.now().isoformat(),
                'progress': progress,
                'completed': completed_tasks,
                'total': total_tasks
            }
        
        return None
    
    def run_all_checks(self):
        """Run all trigger checks"""
        triggers = []
        
        # Check git
        git_trigger = self.check_git_activity()
        if git_trigger:
            triggers.append(git_trigger)
        
        # Check files
        file_trigger = self.check_file_modifications()
        if file_trigger:
            triggers.append(file_trigger)
        
        # Check tasks
        task_trigger = self.check_task_completion()
        if task_trigger:
            triggers.append(task_trigger)
        
        return triggers

def main():
    """Run automation triggers"""
    triggers = AutomationTriggers()
    
    while True:
        try:
            detected_triggers = triggers.run_all_checks()
            if detected_triggers:
                logger.info(f"Detected {len(detected_triggers)} triggers")
                # Here you would call the sync script to update Notion
                # For now, just log
                for trigger in detected_triggers:
                    logger.info(f"  - {trigger['trigger']}")
            
            time.sleep(30)  # Check every 30 seconds
        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"Error in trigger loop: {e}")
            time.sleep(60)

if __name__ == '__main__':
    main()


