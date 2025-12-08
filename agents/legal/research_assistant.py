"""
Legal Agent - Legal Research Assistant (Task 24)
Assist with legal research queries
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class LegalResearchAssistant:
    """Legal research assistant using RAG"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("legal_research_assistant")
    
    def research(self, query: str, jurisdiction: Optional[str] = None, topic: Optional[str] = None) -> Dict[str, Any]:
        """
        Conduct legal research
        
        Args:
            query: Research query
            jurisdiction: Legal jurisdiction (e.g., 'US', 'EU', 'CA')
            topic: Legal topic (e.g., 'contract', 'privacy', 'employment')
        
        Returns:
            Dictionary with research results:
            - summary: Research summary
            - sources: List of sources
            - citations: Legal citations
            - related_cases: Related cases
            - recommendations: Research recommendations
        """
        self.logger.info(f"Conducting research: query={query}, jurisdiction={jurisdiction}")
        
        # Query knowledge base
        search_query = f"{query} {jurisdiction or ''} {topic or ''}"
        knowledge = self.rag.query_knowledge_base(
            search_query,
            category="legal",
            limit=10
        )
        
        # Extract citations
        citations = self._extract_citations(knowledge)
        
        # Find related cases
        related_cases = self._find_related_cases(query, knowledge)
        
        # Generate summary
        summary = self._generate_summary(query, knowledge)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(query, knowledge)
        
        return {
            "query": query,
            "summary": summary,
            "sources": knowledge,
            "citations": citations,
            "related_cases": related_cases,
            "recommendations": recommendations,
            "jurisdiction": jurisdiction,
            "topic": topic,
            "researched_at": datetime.now().isoformat()
        }
    
    def _extract_citations(self, knowledge: List[Dict]) -> List[Dict[str, Any]]:
        """Extract legal citations from knowledge"""
        citations = []
        
        for doc in knowledge:
            # Extract citations (simplified)
            if "citation" in doc:
                citations.append({
                    "citation": doc["citation"],
                    "source": doc.get("title", "Unknown"),
                    "relevance": "high"
                })
        
        return citations
    
    def _find_related_cases(self, query: str, knowledge: List[Dict]) -> List[Dict[str, Any]]:
        """Find related legal cases"""
        cases = []
        
        for doc in knowledge:
            if doc.get("type") == "case":
                cases.append({
                    "case_name": doc.get("title", "Unknown Case"),
                    "court": doc.get("court", "Unknown"),
                    "year": doc.get("year"),
                    "relevance": "high"
                })
        
        return cases[:5]  # Return top 5
    
    def _generate_summary(self, query: str, knowledge: List[Dict]) -> str:
        """Generate research summary"""
        if not knowledge:
            return f"No results found for query: {query}"
        
        summary = f"Research summary for: {query}\n\n"
        summary += f"Found {len(knowledge)} relevant sources.\n\n"
        summary += "Key findings:\n"
        
        for i, doc in enumerate(knowledge[:3], 1):
            summary += f"{i}. {doc.get('title', 'Unknown')}\n"
        
        return summary
    
    def _generate_recommendations(self, query: str, knowledge: List[Dict]) -> List[str]:
        """Generate research recommendations"""
        recommendations = []
        
        if not knowledge:
            recommendations.append("Consider broadening your search terms")
            recommendations.append("Check multiple jurisdictions")
        else:
            recommendations.append("Review the cited sources for detailed information")
            recommendations.append("Consider consulting with a legal expert")
        
        return recommendations






