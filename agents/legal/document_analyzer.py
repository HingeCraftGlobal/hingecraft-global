"""
Legal Agent - Legal Document Analyzer (Task 26)
Analyze legal documents for structure and content
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class LegalDocumentAnalyzer:
    """Analyze legal documents"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("document_analyzer")
    
    def analyze(self, document_text: str, document_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze a legal document
        
        Args:
            document_text: Document text to analyze
            document_type: Type of document (e.g., 'contract', 'policy', 'agreement')
        
        Returns:
            Dictionary with analysis results:
            - structure: Document structure analysis
            - clauses: Extracted clauses
            - parties: Identified parties
            - terms: Key terms and definitions
            - metadata: Document metadata
        """
        self.logger.info(f"Analyzing document: type={document_type}")
        
        structure = self._analyze_structure(document_text)
        clauses = self._extract_clauses(document_text)
        parties = self._identify_parties(document_text)
        terms = self._extract_terms(document_text)
        metadata = self._extract_metadata(document_text, document_type)
        
        return {
            "structure": structure,
            "clauses": clauses,
            "parties": parties,
            "terms": terms,
            "metadata": metadata,
            "analyzed_at": datetime.now().isoformat(),
            "document_type": document_type
        }
    
    def _analyze_structure(self, text: str) -> Dict[str, Any]:
        """Analyze document structure"""
        lines = text.split('\n')
        sections = []
        current_section = None
        
        for line in lines:
            line_stripped = line.strip()
            if line_stripped and line_stripped[0].isdigit() and '.' in line_stripped:
                if current_section:
                    sections.append(current_section)
                current_section = {"title": line_stripped, "content": []}
            elif current_section:
                current_section["content"].append(line_stripped)
        
        if current_section:
            sections.append(current_section)
        
        return {
            "total_sections": len(sections),
            "sections": sections[:10],  # First 10 sections
            "total_lines": len(lines),
            "has_table_of_contents": "table of contents" in text.lower()
        }
    
    def _extract_clauses(self, text: str) -> List[Dict[str, Any]]:
        """Extract key clauses"""
        clauses = []
        clause_keywords = ["whereas", "therefore", "hereby", "agrees", "warrants", "represents"]
        
        sentences = text.split('.')
        for sentence in sentences:
            for keyword in clause_keywords:
                if keyword.lower() in sentence.lower():
                    clauses.append({
                        "clause": sentence.strip(),
                        "type": keyword,
                        "relevance": "high"
                    })
                    break
        
        return clauses[:20]  # Top 20 clauses
    
    def _identify_parties(self, text: str) -> List[str]:
        """Identify parties in document"""
        parties = []
        
        # Look for party definitions
        party_patterns = ["party a", "party b", "company", "licensor", "licensee"]
        for pattern in party_patterns:
            if pattern.lower() in text.lower():
                parties.append(pattern.title())
        
        return list(set(parties))
    
    def _extract_terms(self, text: str) -> Dict[str, str]:
        """Extract key terms and definitions"""
        terms = {}
        
        # Look for definitions section
        if "definitions" in text.lower():
            # Simplified extraction
            terms["definitions_found"] = True
        
        # Extract common legal terms
        legal_terms = ["confidentiality", "indemnification", "liability", "termination"]
        for term in legal_terms:
            if term.lower() in text.lower():
                terms[term] = "Found in document"
        
        return terms
    
    def _extract_metadata(self, text: str, doc_type: Optional[str]) -> Dict[str, Any]:
        """Extract document metadata"""
        return {
            "document_type": doc_type or "unknown",
            "word_count": len(text.split()),
            "character_count": len(text),
            "has_signatures": "signature" in text.lower(),
            "has_dates": any(char.isdigit() for char in text),
            "language": "en"  # Simplified
        }



