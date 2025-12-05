"""
Workflow Engine
Manages agent workflows and task execution
"""

from typing import Dict, List, Any, Callable, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class WorkflowStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WorkflowStep:
    """Represents a step in a workflow"""
    
    def __init__(self, name: str, action: Callable, dependencies: List[str] = None):
        self.name = name
        self.action = action
        self.dependencies = dependencies or []
        self.status = WorkflowStatus.PENDING
        self.result = None
        self.error = None


class WorkflowEngine:
    """Workflow execution engine"""
    
    def __init__(self):
        self.workflows: Dict[str, List[WorkflowStep]] = {}
        self.logger = logging.getLogger("workflow_engine")
    
    def create_workflow(self, workflow_id: str, steps: List[WorkflowStep]):
        """Create a new workflow"""
        self.workflows[workflow_id] = steps
        self.logger.info(f"Created workflow: {workflow_id} with {len(steps)} steps")
    
    def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Execute a workflow"""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        steps = self.workflows[workflow_id]
        results = {}
        
        for step in steps:
            try:
                step.status = WorkflowStatus.RUNNING
                step.result = step.action()
                step.status = WorkflowStatus.COMPLETED
                results[step.name] = step.result
            except Exception as e:
                step.status = WorkflowStatus.FAILED
                step.error = str(e)
                self.logger.error(f"Workflow step failed: {step.name} - {e}")
                break
        
        return results
