"""
Computer Index - Index based on LLM usage and system activity
Excludes hingecraft-related files
"""

import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime


class ComputerIndex:
    """
    Indexes computer usage, LLM interactions, and system activity
    Excludes hingecraft-related content
    """
    
    def __init__(self, index_path: Optional[Path] = None):
        self.index_path = index_path or Path.home() / ".moonlabs" / "computer_index.json"
        self.index: Dict[str, Any] = {
            'llm_interactions': [],
            'system_activity': [],
            'file_access': [],
            'performance_metrics': [],
            'excluded_patterns': ['hingecraft']
        }
        self._load()
    
    def _load(self) -> None:
        """Load index from disk"""
        if self.index_path.exists():
            try:
                with open(self.index_path, 'r') as f:
                    self.index = json.load(f)
            except Exception:
                pass
    
    def _save(self) -> None:
        """Save index to disk"""
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.index_path, 'w') as f:
            json.dump(self.index, f, indent=2)
    
    def _should_exclude(self, path: str) -> bool:
        """Check if path should be excluded"""
        path_lower = path.lower()
        return any(pattern in path_lower for pattern in self.index['excluded_patterns'])
    
    def record_llm_interaction(self, prompt: str, response: str, model: str = "unknown") -> None:
        """Record LLM interaction"""
        if self._should_exclude(prompt) or self._should_exclude(response):
            return
        
        interaction = {
            'timestamp': time.time(),
            'datetime': datetime.now().isoformat(),
            'prompt': prompt[:500],  # Truncate for storage
            'response_length': len(response),
            'model': model
        }
        
        self.index['llm_interactions'].append(interaction)
        
        # Keep last 1000 interactions
        if len(self.index['llm_interactions']) > 1000:
            self.index['llm_interactions'] = self.index['llm_interactions'][-1000:]
        
        self._save()
    
    def record_file_access(self, file_path: str, access_type: str = "read") -> None:
        """Record file access"""
        if self._should_exclude(file_path):
            return
        
        access = {
            'timestamp': time.time(),
            'datetime': datetime.now().isoformat(),
            'file_path': file_path,
            'access_type': access_type
        }
        
        self.index['file_access'].append(access)
        
        # Keep last 5000 accesses
        if len(self.index['file_access']) > 5000:
            self.index['file_access'] = self.index['file_access'][-5000:]
        
        self._save()
    
    def record_performance_metric(self, metric_name: str, value: float, unit: str = "") -> None:
        """Record performance metric"""
        metric = {
            'timestamp': time.time(),
            'datetime': datetime.now().isoformat(),
            'metric_name': metric_name,
            'value': value,
            'unit': unit
        }
        
        self.index['performance_metrics'].append(metric)
        
        # Keep last 10000 metrics
        if len(self.index['performance_metrics']) > 10000:
            self.index['performance_metrics'] = self.index['performance_metrics'][-10000:]
        
        self._save()
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get index statistics"""
        return {
            'llm_interactions': len(self.index['llm_interactions']),
            'file_accesses': len(self.index['file_access']),
            'performance_metrics': len(self.index['performance_metrics']),
            'excluded_patterns': self.index['excluded_patterns']
        }
    
    def search_llm_interactions(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search LLM interactions"""
        query_lower = query.lower()
        results = []
        
        for interaction in self.index['llm_interactions']:
            prompt = interaction.get('prompt', '').lower()
            if query_lower in prompt:
                results.append(interaction)
        
        return results[:limit]
    
    def get_recent_files(self, limit: int = 20) -> List[str]:
        """Get recently accessed files"""
        recent = sorted(
            self.index['file_access'],
            key=lambda x: x['timestamp'],
            reverse=True
        )[:limit]
        return [f['file_path'] for f in recent]

