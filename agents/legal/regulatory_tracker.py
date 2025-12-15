"""
Legal Agent - Regulatory Change Tracker (Task 29)
Track regulatory changes and updates
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class RegulatoryTracker:
    """Track regulatory changes"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("regulatory_tracker")
    
    def track_changes(self, regulation_type: str, jurisdiction: Optional[str] = None, days_back: int = 30) -> Dict[str, Any]:
        """
        Track regulatory changes
        
        Args:
            regulation_type: Type of regulation (e.g., 'GDPR', 'CCPA', 'HIPAA')
            jurisdiction: Legal jurisdiction
            days_back: Number of days to look back
        
        Returns:
            Dictionary with tracked changes:
            - changes: List of regulatory changes
            - summary: Summary of changes
            - impact: Impact assessment
        """
        self.logger.info(f"Tracking changes: type={regulation_type}, jurisdiction={jurisdiction}")
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Query knowledge base for recent changes
        knowledge = self.rag.query_knowledge_base(
            f"{regulation_type} {jurisdiction or ''} regulatory change update",
            category="legal",
            limit=20
        )
        
        changes = self._filter_recent_changes(knowledge, cutoff_date)
        summary = self._generate_summary(changes)
        impact = self._assess_impact(changes, regulation_type)
        
        return {
            "changes": changes,
            "summary": summary,
            "impact": impact,
            "regulation_type": regulation_type,
            "jurisdiction": jurisdiction,
            "tracked_at": datetime.now().isoformat(),
            "period_days": days_back
        }
    
    def _filter_recent_changes(self, knowledge: List[Dict], cutoff_date: datetime) -> List[Dict[str, Any]]:
        """Filter changes by date"""
        changes = []
        
        for doc in knowledge:
            doc_date = doc.get("date")
            if doc_date:
                try:
                    doc_datetime = datetime.fromisoformat(doc_date.replace('Z', '+00:00'))
                    if doc_datetime >= cutoff_date:
                        changes.append({
                            "title": doc.get("title", "Unknown"),
                            "date": doc_date,
                            "type": doc.get("type", "regulation"),
                            "description": doc.get("summary", ""),
                            "source": doc.get("source", "")
                        })
                except:
                    pass
        
        return sorted(changes, key=lambda x: x.get("date", ""), reverse=True)
    
    def _generate_summary(self, changes: List[Dict]) -> Dict[str, Any]:
        """Generate summary of changes"""
        return {
            "total_changes": len(changes),
            "recent_changes": len([c for c in changes if c.get("date")]),
            "change_types": list(set(c.get("type", "unknown") for c in changes)),
            "latest_change": changes[0].get("date") if changes else None
        }
    
    def _assess_impact(self, changes: List[Dict], regulation_type: str) -> Dict[str, Any]:
        """Assess impact of changes"""
        if not changes:
            return {
                "level": "none",
                "message": "No recent changes detected",
                "action_required": False
            }
        
        return {
            "level": "medium" if len(changes) < 5 else "high",
            "message": f"{len(changes)} changes detected in {regulation_type}",
            "action_required": len(changes) > 0,
            "recommendations": [
                "Review changes for compliance impact",
                "Update internal policies if needed",
                "Notify relevant stakeholders"
            ]
        }






