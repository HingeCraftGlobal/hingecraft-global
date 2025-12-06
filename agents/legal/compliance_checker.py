"""
Legal Agent - Compliance Checker (Task 23)
Check compliance with regulations and standards
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class ComplianceChecker:
    """Compliance checking system"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("compliance_checker")
        self.regulations = self._load_regulations()
    
    def check_compliance(self, document: str, regulation_types: List[str]) -> Dict[str, Any]:
        """
        Check document compliance with regulations
        
        Args:
            document: Document text to check
            regulation_types: List of regulation types (e.g., ['GDPR', 'CCPA', 'HIPAA'])
        
        Returns:
            Dictionary with compliance results:
            - overall_status: Overall compliance status
            - checks: List of individual checks
            - score: Compliance score (0-100)
            - recommendations: List of recommendations
        """
        self.logger.info(f"Checking compliance: regulations={regulation_types}")
        
        checks = []
        total_score = 0
        
        for reg_type in regulation_types:
            check_result = self._check_regulation(document, reg_type)
            checks.append(check_result)
            total_score += check_result.get("score", 0)
        
        overall_score = total_score / len(regulation_types) if regulation_types else 0
        overall_status = "compliant" if overall_score >= 80 else "non_compliant"
        
        recommendations = self._generate_recommendations(checks)
        
        return {
            "overall_status": overall_status,
            "overall_score": overall_score,
            "checks": checks,
            "recommendations": recommendations,
            "checked_at": datetime.now().isoformat(),
            "regulations": regulation_types
        }
    
    def _check_regulation(self, document: str, regulation_type: str) -> Dict[str, Any]:
        """Check compliance with specific regulation"""
        regulation = self.regulations.get(regulation_type, {})
        requirements = regulation.get("requirements", [])
        
        passed = []
        failed = []
        
        for requirement in requirements:
            if self._check_requirement(document, requirement):
                passed.append(requirement)
            else:
                failed.append(requirement)
        
        score = (len(passed) / len(requirements) * 100) if requirements else 0
        status = "pass" if score >= 80 else "fail"
        
        return {
            "regulation": regulation_type,
            "status": status,
            "score": score,
            "passed": passed,
            "failed": failed,
            "requirements_total": len(requirements)
        }
    
    def _check_requirement(self, document: str, requirement: Dict[str, Any]) -> bool:
        """Check if document meets a specific requirement"""
        req_type = requirement.get("type")
        keyword = requirement.get("keyword")
        
        if req_type == "keyword_presence":
            return keyword.lower() in document.lower()
        
        return True
    
    def _generate_recommendations(self, checks: List[Dict]) -> List[str]:
        """Generate recommendations based on compliance checks"""
        recommendations = []
        
        for check in checks:
            if check.get("status") == "fail":
                failed = check.get("failed", [])
                for req in failed:
                    recommendations.append(f"Add {req.get('keyword', 'required element')} for {check.get('regulation')} compliance")
        
        if not recommendations:
            recommendations.append("Document appears to be compliant with all checked regulations")
        
        return recommendations
    
    def _load_regulations(self) -> Dict[str, Dict]:
        """Load regulation requirements"""
        return {
            "GDPR": {
                "requirements": [
                    {"type": "keyword_presence", "keyword": "data protection"},
                    {"type": "keyword_presence", "keyword": "right to access"},
                    {"type": "keyword_presence", "keyword": "right to deletion"}
                ]
            },
            "CCPA": {
                "requirements": [
                    {"type": "keyword_presence", "keyword": "california consumer privacy"},
                    {"type": "keyword_presence", "keyword": "opt-out"},
                    {"type": "keyword_presence", "keyword": "do not sell"}
                ]
            },
            "HIPAA": {
                "requirements": [
                    {"type": "keyword_presence", "keyword": "protected health information"},
                    {"type": "keyword_presence", "keyword": "privacy rule"},
                    {"type": "keyword_presence", "keyword": "security rule"}
                ]
            }
        }




