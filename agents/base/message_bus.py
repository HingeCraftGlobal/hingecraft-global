"""
Message Bus for Inter-Agent Communication
Enables agents to communicate with each other
"""

from typing import Dict, Any, List, Callable, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class MessageBus:
    """Message bus for agent communication"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.message_history: List[Dict[str, Any]] = []
        self.logger = logging.getLogger("message_bus")
    
    def subscribe(self, event_type: str, callback: Callable):
        """Subscribe to an event type"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
        self.logger.info(f"Subscribed to {event_type}")
    
    def publish(self, event_type: str, message: Dict[str, Any]):
        """Publish a message"""
        message["timestamp"] = datetime.now().isoformat()
        message["event_type"] = event_type
        self.message_history.append(message)
        
        if event_type in self.subscribers:
            for callback in self.subscribers[event_type]:
                try:
                    callback(message)
                except Exception as e:
                    self.logger.error(f"Error in callback: {e}")
        
        self.logger.info(f"Published {event_type}: {message.get('id', 'unknown')}")
    
    def get_message_history(self, event_type: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get message history"""
        history = self.message_history
        if event_type:
            history = [msg for msg in history if msg.get("event_type") == event_type]
        return history[-limit:]
