"""
Marketing Agent - Email Campaign Builder (Task 123)
Build email campaigns
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class EmailCampaignBuilder:
    """Build email campaigns"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("email_campaign_builder")
    
    def build_campaign(self, campaign_name: str, subject: str, audience: str, content: str, template: Optional[str] = None) -> Dict[str, Any]:
        """
        Build an email campaign
        
        Args:
            campaign_name: Campaign name
            subject: Email subject line
            audience: Target audience
            content: Email content
            template: Template to use
        
        Returns:
            Dictionary with campaign details:
            - campaign_id: Campaign ID
            - subject: Subject line
            - html_content: HTML content
            - text_content: Plain text content
            - metadata: Campaign metadata
        """
        self.logger.info(f"Building campaign: {campaign_name}")
        
        # Get email templates from knowledge base
        templates = self.rag.query_knowledge_base(
            "email template campaign design",
            category="marketing",
            limit=3
        )
        
        html_content = self._generate_html(content, template, templates)
        text_content = self._generate_text(content)
        
        return {
            "campaign_id": f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "campaign_name": campaign_name,
            "subject": subject,
            "html_content": html_content,
            "text_content": text_content,
            "audience": audience,
            "created_at": datetime.now().isoformat(),
            "metadata": {
                "status": "draft",
                "template": template or "default",
                "estimated_send": None
            }
        }
    
    def _generate_html(self, content: str, template: Optional[str], templates: List[Dict]) -> str:
        """Generate HTML email content"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Campaign</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="padding: 20px;">
        {content.replace(chr(10), '<br>')}
    </div>
</body>
</html>
"""
        return html.strip()
    
    def _generate_text(self, content: str) -> str:
        """Generate plain text version"""
        # Remove HTML tags if any
        import re
        text = re.sub(r'<[^>]+>', '', content)
        return text.strip()




