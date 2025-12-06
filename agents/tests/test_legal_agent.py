"""
Unit Tests for Legal Agent
Test Phase 2 implementations
"""

import unittest
from unittest.mock import Mock, MagicMock
from agents.legal.contract_reviewer import ContractReviewer
from agents.legal.policy_generator import PolicyGenerator
from agents.legal.compliance_checker import ComplianceChecker
from agents.legal.research_assistant import LegalResearchAssistant
from agents.legal.risk_calculator import RiskCalculator


class TestContractReviewer(unittest.TestCase):
    """Test ContractReviewer"""
    
    def setUp(self):
        self.rag = Mock()
        self.rag.query_knowledge_base = Mock(return_value=[])
        self.reviewer = ContractReviewer(self.rag)
    
    def test_review_contract(self):
        """Test contract review"""
        contract_text = "This is a test contract with liability clause."
        result = self.reviewer.review_contract(contract_text)
        
        self.assertIn("risk_score", result)
        self.assertIn("issues", result)
        self.assertIn("recommendations", result)
        self.assertIsInstance(result["risk_score"], int)


class TestPolicyGenerator(unittest.TestCase):
    """Test PolicyGenerator"""
    
    def setUp(self):
        self.rag = Mock()
        self.rag.query_knowledge_base = Mock(return_value=[])
        self.generator = PolicyGenerator(self.rag)
    
    def test_generate_policy(self):
        """Test policy generation"""
        variables = {
            "company_name": "TestCo",
            "contact_email": "test@test.com",
            "jurisdiction": "US"
        }
        result = self.generator.generate_policy("privacy", variables)
        
        self.assertIn("content", result)
        self.assertIn("pdf_url", result)
        self.assertEqual(result["policy_type"], "privacy")


class TestComplianceChecker(unittest.TestCase):
    """Test ComplianceChecker"""
    
    def setUp(self):
        self.rag = Mock()
        self.rag.query_knowledge_base = Mock(return_value=[])
        self.checker = ComplianceChecker(self.rag)
    
    def test_check_compliance(self):
        """Test compliance checking"""
        document = "This document contains data protection and right to access."
        result = self.checker.check_compliance(document, ["GDPR"])
        
        self.assertIn("overall_status", result)
        self.assertIn("overall_score", result)
        self.assertIn("checks", result)


class TestLegalResearchAssistant(unittest.TestCase):
    """Test LegalResearchAssistant"""
    
    def setUp(self):
        self.rag = Mock()
        self.rag.query_knowledge_base = Mock(return_value=[])
        self.assistant = LegalResearchAssistant(self.rag)
    
    def test_research(self):
        """Test legal research"""
        result = self.assistant.research("contract law", "US", "commercial")
        
        self.assertIn("summary", result)
        self.assertIn("sources", result)
        self.assertIn("citations", result)


class TestRiskCalculator(unittest.TestCase):
    """Test RiskCalculator"""
    
    def setUp(self):
        self.rag = Mock()
        self.rag.query_knowledge_base = Mock(return_value=[])
        self.calculator = RiskCalculator(self.rag)
    
    def test_calculate_risk(self):
        """Test risk calculation"""
        document = "This contract contains liability and indemnification clauses."
        context = {"jurisdiction": "US", "document_type": "service"}
        result = self.calculator.calculate_risk(document, context)
        
        self.assertIn("overall_risk", result)
        self.assertIn("risk_level", result)
        self.assertIn("factors", result)
        self.assertIn(result["risk_level"], ["low", "medium", "high", "critical"])


if __name__ == '__main__':
    unittest.main()



