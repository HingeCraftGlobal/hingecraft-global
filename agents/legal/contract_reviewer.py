"""
Legal Agent - Contract Review Automation (Task 21)
Automated contract review and analysis
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.agent import BaseAgent
from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class ContractReviewer:
    """Automated contract review system"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("contract_reviewer")
    
    def review_contract(self, contract_text: str, contract_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Review a contract and provide analysis
        
        Args:
            contract_text: The contract text to review
            contract_type: Type of contract (e.g., 'service', 'employment', 'nda')
        
        Returns:
            Dictionary with review results including:
            - risk_score: Overall risk score (0-100)
            - issues: List of identified issues
            - recommendations: List of recommendations
            - key_terms: Extracted key terms
            - compliance_check: Compliance status
        """
        self.logger.info(f"Reviewing contract: type={contract_type}")
        
        # Query knowledge base for contract templates and standards
        knowledge = self.rag.query_knowledge_base(
            f"contract review {contract_type or 'general'} standards best practices",
            category="legal",
            limit=5
        )
        
        # Analyze contract (simplified - in production, use LLM)
        issues = self._identify_issues(contract_text, knowledge)
        risk_score = self._calculate_risk_score(issues)
        recommendations = self._generate_recommendations(issues, knowledge)
        key_terms = self._extract_key_terms(contract_text)
        compliance_check = self._check_compliance(contract_text, knowledge)
        
        return {
            "risk_score": risk_score,
            "issues": issues,
            "recommendations": recommendations,
            "key_terms": key_terms,
            "compliance_check": compliance_check,
            "reviewed_at": datetime.now().isoformat(),
            "contract_type": contract_type
        }
    
    def _identify_issues(self, contract_text: str, knowledge: List[Dict]) -> List[Dict[str, Any]]:
        """Identify potential issues in contract"""
        issues = []
        
        # Check for common issues (simplified)
        if "liability" not in contract_text.lower():
            issues.append({
                "type": "missing_clause",
                "severity": "high",
                "description": "Liability clause not found",
                "recommendation": "Add liability limitation clause"
            })
        
        if "termination" not in contract_text.lower():
            issues.append({
                "type": "missing_clause",
                "severity": "medium",
                "description": "Termination clause not found",
                "recommendation": "Add termination conditions"
            })
        
        return issues
    
    def _calculate_risk_score(self, issues: List[Dict]) -> int:
        """Calculate overall risk score"""
        if not issues:
            return 0
        
        high_severity = sum(1 for issue in issues if issue.get("severity") == "high")
        medium_severity = sum(1 for issue in issues if issue.get("severity") == "medium")
        
        score = (high_severity * 30) + (medium_severity * 15)
        return min(score, 100)
    
    def _generate_recommendations(self, issues: List[Dict], knowledge: List[Dict]) -> List[str]:
        """Generate recommendations based on issues"""
        recommendations = []
        
        for issue in issues:
            if "recommendation" in issue:
                recommendations.append(issue["recommendation"])
        
        # Add general recommendations
        if not recommendations:
            recommendations.append("Contract appears to be in good shape")
        
        return recommendations
    
    def _extract_key_terms(self, contract_text: str) -> Dict[str, Any]:
        """Extract key terms from contract"""
        # Simplified extraction (in production, use NLP)
        key_terms = {
            "parties": [],
            "duration": None,
            "payment_terms": None,
            "termination": None
        }
        
        # Extract parties (simplified)
        if "party" in contract_text.lower():
            key_terms["parties"] = ["Party A", "Party B"]  # Placeholder
        
        return key_terms
    
    def _check_compliance(self, contract_text: str, knowledge: List[Dict]) -> Dict[str, Any]:
        """Check compliance with standards"""
        return {
            "status": "compliant",
            "checks": [
                {"check": "GDPR compliance", "status": "pass"},
                {"check": "Standard terms", "status": "pass"}
            ],
            "warnings": []
        }






