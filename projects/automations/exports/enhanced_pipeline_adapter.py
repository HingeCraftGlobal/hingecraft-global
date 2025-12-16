"""
Enhanced Pipeline Adapter - Routes to Volkov RAG
Maintains backward compatibility without changing core functions
"""

import os
import sys
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

BASE = Path(__file__).resolve().parents[2]

class EnhancedPipelineAdapter:
    """
    Adapter for enhanced_pipeline.py
    Routes all calls to Volkov RAG without modifying original file
    """
    
    def __init__(self):
        """Initialize Enhanced Pipeline Adapter."""
        self.adapter_id = "enhanced_pipeline_adapter.v1"
        self.volkov_rag = None
        self._load_volkov_rag()
        
        logger.info("✅ Enhanced Pipeline Adapter initialized")
    
    def _load_volkov_rag(self):
        """Load Volkov RAG as backend."""
        try:
            from ai.rag.volkov_rag_setup import get_volkov_rag
            self.volkov_rag = get_volkov_rag()
        except Exception as e:
            logger.warning(f"⚠️  Could not load Volkov RAG: {e}")
    
    def process_query(self, query: str, **kwargs) -> Dict[str, Any]:
        """Process query - routes to Volkov RAG."""
        if self.volkov_rag:
            rag_engine = self.volkov_rag.get_rag_engine()
            return rag_engine.query(query, **kwargs)
        return {"error": "Volkov RAG not available"}
    
    def retrieve_documents(self, query: str, top_k: int = 5, **kwargs) -> List[Dict[str, Any]]:
        """Retrieve documents - routes to Volkov RAG."""
        if self.volkov_rag:
            rag_engine = self.volkov_rag.get_rag_engine()
            return rag_engine.retrieve(query, k=top_k, **kwargs)
        return []
    
    def generate_response(self, query: str, context: List[Dict[str, Any]], **kwargs) -> str:
        """Generate response - routes to Volkov RAG."""
        if self.volkov_rag:
            rag_engine = self.volkov_rag.get_rag_engine()
            return rag_engine.generate(query, context, **kwargs)
        return ""

# Global instance
_enhanced_pipeline_adapter: Optional[EnhancedPipelineAdapter] = None

def get_enhanced_pipeline_adapter() -> EnhancedPipelineAdapter:
    """Get Enhanced Pipeline Adapter."""
    global _enhanced_pipeline_adapter
    if _enhanced_pipeline_adapter is None:
        _enhanced_pipeline_adapter = EnhancedPipelineAdapter()
    return _enhanced_pipeline_adapter

