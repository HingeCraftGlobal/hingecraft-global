"""
Legal Agent - Phase 2 Implementation
Core capabilities for legal operations
"""

from agents.legal.contract_reviewer import ContractReviewer
from agents.legal.policy_generator import PolicyGenerator
from agents.legal.compliance_checker import ComplianceChecker
from agents.legal.research_assistant import LegalResearchAssistant
from agents.legal.risk_calculator import RiskCalculator

__all__ = [
    "ContractReviewer",
    "PolicyGenerator",
    "ComplianceChecker",
    "LegalResearchAssistant",
    "RiskCalculator"
]

