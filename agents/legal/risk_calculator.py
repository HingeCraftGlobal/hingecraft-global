"""
Legal Agent - Risk Assessment Calculator (Task 25)
Calculate legal risk scores
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class RiskCalculator:
    """Legal risk assessment calculator"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("risk_calculator")
        self.risk_factors = self._load_risk_factors()
    
    def calculate_risk(self, document: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate legal risk score
        
        Args:
            document: Document to assess
            context: Context information (e.g., jurisdiction, document_type)
        
        Returns:
            Dictionary with risk assessment:
            - overall_risk: Overall risk score (0-100)
            - risk_level: Risk level (low/medium/high/critical)
            - factors: List of risk factors
            - recommendations: Risk mitigation recommendations
        """
        self.logger.info(f"Calculating risk: context={context}")
        
        # Analyze risk factors
        factors = self._analyze_risk_factors(document, context)
        
        # Calculate overall risk
        overall_risk = self._calculate_overall_risk(factors)
        
        # Determine risk level
        risk_level = self._determine_risk_level(overall_risk)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(factors, overall_risk)
        
        return {
            "overall_risk": overall_risk,
            "risk_level": risk_level,
            "factors": factors,
            "recommendations": recommendations,
            "assessed_at": datetime.now().isoformat(),
            "context": context
        }
    
    def _analyze_risk_factors(self, document: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze individual risk factors"""
        factors = []
        
        # Check for high-risk keywords
        high_risk_keywords = ["liability", "indemnification", "warranty", "guarantee"]
        for keyword in high_risk_keywords:
            if keyword.lower() in document.lower():
                factors.append({
                    "factor": f"Contains {keyword} clause",
                    "risk_score": 20,
                    "severity": "medium",
                    "description": f"Document contains {keyword} which may increase legal risk"
                })
        
        # Check jurisdiction-specific risks
        jurisdiction = context.get("jurisdiction", "US")
        if jurisdiction == "EU":
            if "gdpr" not in document.lower():
                factors.append({
                    "factor": "Missing GDPR compliance",
                    "risk_score": 30,
                    "severity": "high",
                    "description": "Document may not comply with GDPR requirements"
                })
        
        # Check for missing clauses
        required_clauses = ["termination", "dispute resolution", "governing law"]
        for clause in required_clauses:
            if clause.lower() not in document.lower():
                factors.append({
                    "factor": f"Missing {clause} clause",
                    "risk_score": 15,
                    "severity": "medium",
                    "description": f"Document lacks {clause} clause which may create ambiguity"
                })
        
        return factors
    
    def _calculate_overall_risk(self, factors: List[Dict]) -> int:
        """Calculate overall risk score"""
        if not factors:
            return 0
        
        total_score = sum(factor.get("risk_score", 0) for factor in factors)
        
        # Normalize to 0-100
        risk_score = min(total_score, 100)
        
        return risk_score
    
    def _determine_risk_level(self, risk_score: int) -> str:
        """Determine risk level from score"""
        if risk_score < 25:
            return "low"
        elif risk_score < 50:
            return "medium"
        elif risk_score < 75:
            return "high"
        else:
            return "critical"
    
    def _generate_recommendations(self, factors: List[Dict], overall_risk: int) -> List[str]:
        """Generate risk mitigation recommendations"""
        recommendations = []
        
        if overall_risk < 25:
            recommendations.append("Risk level is acceptable")
        else:
            recommendations.append("Consider legal review before proceeding")
            
            # Specific recommendations based on factors
            high_severity_factors = [f for f in factors if f.get("severity") == "high"]
            if high_severity_factors:
                recommendations.append("Address high-severity risk factors immediately")
            
            missing_clauses = [f for f in factors if "Missing" in f.get("factor", "")]
            if missing_clauses:
                recommendations.append("Add missing clauses to reduce ambiguity")
        
        return recommendations
    
    def _load_risk_factors(self) -> Dict[str, Any]:
        """Load risk factor definitions"""
        return {
            "liability": {"weight": 20, "severity": "medium"},
            "indemnification": {"weight": 25, "severity": "high"},
            "warranty": {"weight": 15, "severity": "medium"},
            "gdpr_compliance": {"weight": 30, "severity": "high"}
        }






