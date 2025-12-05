"""
Legal Agent - Phase 2 Implementation
Core capabilities for legal operations
"""

from agents.legal.contract_reviewer import ContractReviewer
from agents.legal.policy_generator import PolicyGenerator
from agents.legal.compliance_checker import ComplianceChecker
from agents.legal.research_assistant import LegalResearchAssistant
from agents.legal.risk_calculator import RiskCalculator
from agents.legal.document_analyzer import LegalDocumentAnalyzer
from agents.legal.clause_extractor import ClauseExtractor
from agents.legal.precedent_finder import PrecedentFinder
from agents.legal.regulatory_tracker import RegulatoryTracker
from agents.legal.deadline_manager import DeadlineManager

__all__ = [
    "ContractReviewer",
    "PolicyGenerator",
    "ComplianceChecker",
    "LegalResearchAssistant",
    "RiskCalculator",
    "LegalDocumentAnalyzer",
    "ClauseExtractor",
    "PrecedentFinder",
    "RegulatoryTracker",
    "DeadlineManager"
]

