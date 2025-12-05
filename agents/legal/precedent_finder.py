"""
Legal Agent - Legal Precedent Finder (Task 28)
Find legal precedents and case law
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class PrecedentFinder:
    """Find legal precedents"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("precedent_finder")
    
    def find_precedents(self, query: str, jurisdiction: Optional[str] = None, area_of_law: Optional[str] = None) -> Dict[str, Any]:
        """
        Find legal precedents
        
        Args:
            query: Search query
            jurisdiction: Legal jurisdiction
            area_of_law: Area of law (e.g., 'contract', 'tort', 'employment')
        
        Returns:
            Dictionary with precedents:
            - precedents: List of found precedents
            - summary: Summary of findings
            - relevance: Relevance scores
        """
        self.logger.info(f"Finding precedents: query={query}, jurisdiction={jurisdiction}")
        
        search_query = f"{query} {jurisdiction or ''} {area_of_law or ''} precedent case law"
        knowledge = self.rag.query_knowledge_base(
            search_query,
            category="legal",
            limit=20
        )
        
        precedents = self._process_precedents(knowledge, query)
        summary = self._generate_summary(precedents)
        relevance = self._calculate_relevance(precedents, query)
        
        return {
            "precedents": precedents,
            "summary": summary,
            "relevance": relevance,
            "query": query,
            "jurisdiction": jurisdiction,
            "area_of_law": area_of_law,
            "found_at": datetime.now().isoformat()
        }
    
    def _process_precedents(self, knowledge: List[Dict], query: str) -> List[Dict[str, Any]]:
        """Process knowledge into precedents"""
        precedents = []
        
        for doc in knowledge:
            if doc.get("type") in ["case", "precedent", "ruling"]:
                precedents.append({
                    "case_name": doc.get("title", "Unknown"),
                    "court": doc.get("court", "Unknown"),
                    "year": doc.get("year"),
                    "citation": doc.get("citation", ""),
                    "summary": doc.get("summary", ""),
                    "relevance": "high" if query.lower() in doc.get("title", "").lower() else "medium"
                })
        
        return precedents[:10]  # Top 10
    
    def _generate_summary(self, precedents: List[Dict]) -> Dict[str, Any]:
        """Generate summary of precedents"""
        if not precedents:
            return {"total": 0, "message": "No precedents found"}
        
        return {
            "total": len(precedents),
            "courts": list(set(p.get("court", "Unknown") for p in precedents)),
            "years": [p.get("year") for p in precedents if p.get("year")],
            "high_relevance": sum(1 for p in precedents if p.get("relevance") == "high")
        }
    
    def _calculate_relevance(self, precedents: List[Dict], query: str) -> Dict[str, int]:
        """Calculate relevance scores"""
        return {
            "high": sum(1 for p in precedents if p.get("relevance") == "high"),
            "medium": sum(1 for p in precedents if p.get("relevance") == "medium"),
            "low": sum(1 for p in precedents if p.get("relevance") == "low")
        }

