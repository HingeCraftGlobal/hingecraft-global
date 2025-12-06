"""
Marketing Agent - Social Media Content Creator (Task 122)
Create social media content for various platforms
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class SocialContentCreator:
    """Create social media content"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("social_content_creator")
        self.platforms = ["twitter", "facebook", "instagram", "linkedin", "tiktok"]
    
    def create_content(self, platform: str, message: str, content_type: str = "post", hashtags: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Create social media content
        
        Args:
            platform: Social media platform
            message: Core message
            content_type: Type of content (post/story/reel)
            hashtags: List of hashtags
        
        Returns:
            Dictionary with created content:
            - text: Content text
            - hashtags: Hashtags
            - character_count: Character count
            - platform_specific: Platform-specific formatting
        """
        self.logger.info(f"Creating content: platform={platform}, type={content_type}")
        
        # Get platform guidelines
        guidelines = self.rag.query_knowledge_base(
            f"{platform} social media guidelines best practices",
            category="marketing",
            limit=2
        )
        
        # Format for platform
        formatted_content = self._format_for_platform(message, platform, content_type, guidelines)
        hashtags = hashtags or self._generate_hashtags(message, platform)
        
        return {
            "text": formatted_content,
            "hashtags": hashtags,
            "character_count": len(formatted_content),
            "platform": platform,
            "content_type": content_type,
            "platform_specific": self._get_platform_specs(platform),
            "created_at": datetime.now().isoformat()
        }
    
    def _format_for_platform(self, message: str, platform: str, content_type: str, guidelines: List[Dict]) -> str:
        """Format content for specific platform"""
        max_lengths = {
            "twitter": 280,
            "facebook": 5000,
            "instagram": 2200,
            "linkedin": 3000,
            "tiktok": 150
        }
        
        max_len = max_lengths.get(platform.lower(), 1000)
        
        # Truncate if needed
        if len(message) > max_len:
            message = message[:max_len-3] + "..."
        
        return message
    
    def _generate_hashtags(self, message: str, platform: str) -> List[str]:
        """Generate relevant hashtags"""
        # Simplified hashtag generation
        keywords = message.lower().split()[:5]
        hashtags = [f"#{kw}" for kw in keywords if len(kw) > 3]
        
        # Add platform-specific hashtags
        if platform == "instagram":
            hashtags.extend(["#instagood", "#photooftheday"])
        elif platform == "twitter":
            hashtags.extend(["#trending", "#news"])
        
        return hashtags[:10]  # Max 10 hashtags
    
    def _get_platform_specs(self, platform: str) -> Dict[str, Any]:
        """Get platform-specific specifications"""
        specs = {
            "twitter": {"max_chars": 280, "supports_images": True, "supports_video": True},
            "facebook": {"max_chars": 5000, "supports_images": True, "supports_video": True},
            "instagram": {"max_chars": 2200, "supports_images": True, "supports_video": True},
            "linkedin": {"max_chars": 3000, "supports_images": True, "supports_video": True},
            "tiktok": {"max_chars": 150, "supports_images": False, "supports_video": True}
        }
        
        return specs.get(platform.lower(), {})




