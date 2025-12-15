"""
Legal Agent - Legal Deadline Manager (Task 30)
Manage legal deadlines and important dates
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class DeadlineManager:
    """Manage legal deadlines"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("deadline_manager")
        self.deadlines = []
    
    def add_deadline(self, description: str, due_date: datetime, priority: str = "medium", category: Optional[str] = None) -> Dict[str, Any]:
        """
        Add a legal deadline
        
        Args:
            description: Deadline description
            due_date: Due date
            priority: Priority level (low/medium/high/critical)
            category: Deadline category
        
        Returns:
            Dictionary with deadline information
        """
        deadline = {
            "id": len(self.deadlines) + 1,
            "description": description,
            "due_date": due_date.isoformat(),
            "priority": priority,
            "category": category,
            "created_at": datetime.now().isoformat(),
            "status": "pending"
        }
        
        self.deadlines.append(deadline)
        self.logger.info(f"Added deadline: {description}")
        
        return deadline
    
    def get_upcoming_deadlines(self, days_ahead: int = 30) -> Dict[str, Any]:
        """
        Get upcoming deadlines
        
        Args:
            days_ahead: Number of days to look ahead
        
        Returns:
            Dictionary with upcoming deadlines
        """
        cutoff_date = datetime.now() + timedelta(days=days_ahead)
        
        upcoming = [
            d for d in self.deadlines
            if datetime.fromisoformat(d["due_date"]) <= cutoff_date
            and d["status"] == "pending"
        ]
        
        # Sort by due date
        upcoming.sort(key=lambda x: x["due_date"])
        
        return {
            "deadlines": upcoming,
            "total": len(upcoming),
            "critical": len([d for d in upcoming if d["priority"] == "critical"]),
            "high": len([d for d in upcoming if d["priority"] == "high"]),
            "days_ahead": days_ahead
        }
    
    def mark_complete(self, deadline_id: int) -> Dict[str, Any]:
        """Mark deadline as complete"""
        for deadline in self.deadlines:
            if deadline["id"] == deadline_id:
                deadline["status"] = "completed"
                deadline["completed_at"] = datetime.now().isoformat()
                return deadline
        
        return {"error": "Deadline not found"}
    
    def get_overdue(self) -> List[Dict[str, Any]]:
        """Get overdue deadlines"""
        now = datetime.now()
        overdue = [
            d for d in self.deadlines
            if datetime.fromisoformat(d["due_date"]) < now
            and d["status"] == "pending"
        ]
        
        return sorted(overdue, key=lambda x: x["due_date"])






