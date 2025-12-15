"""
Legal Agent - Policy Document Generator (Task 22)
Generate policy documents from templates
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class PolicyGenerator:
    """Generate policy documents from templates"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("policy_generator")
        self.templates = self._load_templates()
    
    def generate_policy(self, policy_type: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a policy document
        
        Args:
            policy_type: Type of policy (e.g., 'privacy', 'terms', 'cookie')
            variables: Variables to substitute in template
        
        Returns:
            Dictionary with generated policy:
            - content: Generated policy text
            - pdf_url: URL to generated PDF (if applicable)
            - metadata: Policy metadata
        """
        self.logger.info(f"Generating policy: type={policy_type}")
        
        # Get template
        template = self.templates.get(policy_type)
        if not template:
            template = self._get_template_from_kb(policy_type)
        
        # Substitute variables
        content = self._substitute_variables(template, variables)
        
        # Generate PDF (simplified - in production, use PDF library)
        pdf_url = self._generate_pdf(content, policy_type)
        
        return {
            "content": content,
            "pdf_url": pdf_url,
            "policy_type": policy_type,
            "variables": variables,
            "generated_at": datetime.now().isoformat(),
            "metadata": {
                "version": "1.0",
                "language": variables.get("language", "en"),
                "jurisdiction": variables.get("jurisdiction", "US")
            }
        }
    
    def _load_templates(self) -> Dict[str, str]:
        """Load policy templates"""
        return {
            "privacy": self._get_privacy_template(),
            "terms": self._get_terms_template(),
            "cookie": self._get_cookie_template()
        }
    
    def _get_template_from_kb(self, policy_type: str) -> str:
        """Get template from knowledge base"""
        knowledge = self.rag.query_knowledge_base(
            f"policy template {policy_type}",
            category="legal",
            limit=1
        )
        
        if knowledge:
            return knowledge[0].get("content", "")
        
        return f"Template for {policy_type} policy"
    
    def _substitute_variables(self, template: str, variables: Dict[str, Any]) -> str:
        """Substitute variables in template"""
        content = template
        
        # Standard substitutions
        substitutions = {
            "{company_name}": variables.get("company_name", "HingeCraft"),
            "{contact_email}": variables.get("contact_email", "legal@hingecraft.ai"),
            "{effective_date}": variables.get("effective_date", datetime.now().strftime("%B %d, %Y")),
            "{jurisdiction}": variables.get("jurisdiction", "United States")
        }
        
        for key, value in substitutions.items():
            content = content.replace(key, str(value))
        
        return content
    
    def _generate_pdf(self, content: str, policy_type: str) -> str:
        """Generate PDF from content"""
        # Simplified - in production, use reportlab or similar
        return f"/policies/{policy_type}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    def _get_privacy_template(self) -> str:
        """Privacy policy template"""
        return """
Privacy Policy

Effective Date: {effective_date}

1. Introduction
{company_name} ("we", "our", or "us") is committed to protecting your privacy.

2. Information We Collect
We collect information that you provide directly to us.

3. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

4. Contact Us
If you have questions about this Privacy Policy, please contact us at {contact_email}.

Jurisdiction: {jurisdiction}
"""
    
    def _get_terms_template(self) -> str:
        """Terms of service template"""
        return """
Terms of Service

Effective Date: {effective_date}

1. Acceptance of Terms
By accessing and using {company_name}'s services, you accept and agree to be bound by these Terms.

2. Use of Services
You agree to use our services only for lawful purposes.

3. Limitation of Liability
{company_name} shall not be liable for any indirect, incidental, or consequential damages.

4. Contact
For questions about these Terms, contact {contact_email}.

Jurisdiction: {jurisdiction}
"""
    
    def _get_cookie_template(self) -> str:
        """Cookie policy template"""
        return """
Cookie Policy

Effective Date: {effective_date}

1. What Are Cookies
Cookies are small text files stored on your device.

2. How We Use Cookies
We use cookies to improve your experience on our website.

3. Managing Cookies
You can control cookies through your browser settings.

4. Contact
Questions? Contact us at {contact_email}.

Jurisdiction: {jurisdiction}
"""






