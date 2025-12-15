"""
Progress Tracker
Tracks completion of all 600 agent tasks
"""

import json
from typing import Dict, List, Any
from pathlib import Path
from datetime import datetime

class ProgressTracker:
    """Tracks progress of agent tasks"""
    
    def __init__(self, progress_dir: str = "agents/progress"):
        self.progress_dir = Path(progress_dir)
        self.progress_dir.mkdir(exist_ok=True)
        self.agents = [
            "legal", "marketing", "engineering",
            "education", "community", "crypto_compliance"
        ]
    
    def load_progress(self, agent_name: str) -> Dict[str, Any]:
        """Load progress for an agent"""
        file_path = self.progress_dir / f"{agent_name}_agent.json"
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return {"tasks": {}, "last_updated": None}
    
    def save_progress(self, agent_name: str, progress: Dict[str, Any]):
        """Save progress for an agent"""
        file_path = self.progress_dir / f"{agent_name}_agent.json"
        progress["last_updated"] = datetime.now().isoformat()
        with open(file_path, 'w') as f:
            json.dump(progress, f, indent=2)
    
    def update_task_status(self, agent_name: str, task_num: int, status: str):
        """Update status of a task"""
        progress = self.load_progress(agent_name)
        if "tasks" not in progress:
            progress["tasks"] = {}
        progress["tasks"][str(task_num)] = {
            "status": status,
            "updated_at": datetime.now().isoformat()
        }
        self.save_progress(agent_name, progress)
    
    def get_overall_progress(self) -> Dict[str, Any]:
        """Get overall progress across all agents"""
        total_tasks = 600
        completed = 0
        in_progress = 0
        planned = 0
        
        for agent in self.agents:
            progress = self.load_progress(agent)
            for task_num, task_data in progress.get("tasks", {}).items():
                status = task_data.get("status", "planned")
                if status == "completed":
                    completed += 1
                elif status == "in_progress":
                    in_progress += 1
                else:
                    planned += 1
        
        return {
            "total_tasks": total_tasks,
            "completed": completed,
            "in_progress": in_progress,
            "planned": planned,
            "completion_percentage": (completed / total_tasks) * 100
        }
