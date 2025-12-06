"""
Legal Agent - Contract Clause Extractor (Task 27)
Extract specific clauses from contracts
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import re
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class ClauseExtractor:
    """Extract clauses from contracts"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("clause_extractor")
        self.clause_types = self._load_clause_types()
    
    def extract_clauses(self, contract_text: str, clause_types: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Extract specific clauses from contract
        
        Args:
            contract_text: Contract text
            clause_types: List of clause types to extract (None = all)
        
        Returns:
            Dictionary with extracted clauses:
            - clauses: List of extracted clauses by type
            - summary: Summary of found clauses
            - missing: Missing clause types
        """
        self.logger.info(f"Extracting clauses: types={clause_types}")
        
        if clause_types is None:
            clause_types = list(self.clause_types.keys())
        
        extracted = {}
        missing = []
        
        for clause_type in clause_types:
            clause = self._extract_clause_type(contract_text, clause_type)
            if clause:
                extracted[clause_type] = clause
            else:
                missing.append(clause_type)
        
        summary = self._generate_summary(extracted, missing)
        
        return {
            "clauses": extracted,
            "summary": summary,
            "missing": missing,
            "extracted_at": datetime.now().isoformat()
        }
    
    def _extract_clause_type(self, text: str, clause_type: str) -> Optional[Dict[str, Any]]:
        """Extract a specific clause type"""
        patterns = self.clause_types.get(clause_type, {}).get("patterns", [])
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                return {
                    "type": clause_type,
                    "text": match.group(0).strip(),
                    "position": match.start(),
                    "found": True
                }
        
        return None
    
    def _generate_summary(self, extracted: Dict, missing: List[str]) -> Dict[str, Any]:
        """Generate summary of extracted clauses"""
        return {
            "total_found": len(extracted),
            "total_missing": len(missing),
            "found_types": list(extracted.keys()),
            "missing_types": missing,
            "completeness": len(extracted) / (len(extracted) + len(missing)) * 100 if (extracted or missing) else 0
        }
    
    def _load_clause_types(self) -> Dict[str, Dict]:
        """Load clause type patterns"""
        return {
            "liability": {
                "patterns": [
                    r"LIMITATION OF LIABILITY.*?(?=\n\n|\n[A-Z]|$)",
                    r"LIABILITY.*?(?=\n\n|\n[A-Z]|$)"
                ]
            },
            "indemnification": {
                "patterns": [
                    r"INDEMNIFICATION.*?(?=\n\n|\n[A-Z]|$)",
                    r"INDEMNIFY.*?(?=\n\n|\n[A-Z]|$)"
                ]
            },
            "termination": {
                "patterns": [
                    r"TERMINATION.*?(?=\n\n|\n[A-Z]|$)",
                    r"TERM.*?(?=\n\n|\n[A-Z]|$)"
                ]
            },
            "confidentiality": {
                "patterns": [
                    r"CONFIDENTIALITY.*?(?=\n\n|\n[A-Z]|$)",
                    r"NON-DISCLOSURE.*?(?=\n\n|\n[A-Z]|$)"
                ]
            },
            "governing_law": {
                "patterns": [
                    r"GOVERNING LAW.*?(?=\n\n|\n[A-Z]|$)",
                    r"JURISDICTION.*?(?=\n\n|\n[A-Z]|$)"
                ]
            }
        }



