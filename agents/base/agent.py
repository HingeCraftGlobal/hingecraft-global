"""
Base Agent Class
Foundation for all specialized agents
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all HingeCraft agents"""
    
    def __init__(self, agent_name: str, agent_type: str):
        self.agent_name = agent_name
        self.agent_type = agent_type
        self.created_at = datetime.now()
        self.is_active = True
        self.capabilities = []
        self.logger = logging.getLogger(f"agent.{agent_name}")
    
    @abstractmethod
    def initialize(self) -> bool:
        """Initialize the agent"""
        pass
    
    @abstractmethod
    def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request"""
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Get list of agent capabilities"""
        pass
    
    def log_activity(self, activity: str, details: Optional[Dict] = None):
        """Log agent activity"""
        self.logger.info(f"{activity}: {details}")
    
    def health_check(self) -> Dict[str, Any]:
        """Check agent health"""
        return {
            "agent_name": self.agent_name,
            "agent_type": self.agent_type,
            "is_active": self.is_active,
            "status": "healthy" if self.is_active else "inactive",
            "capabilities": self.get_capabilities()
        }
