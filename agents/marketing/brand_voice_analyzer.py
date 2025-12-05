"""
Marketing Agent - Brand Voice Analyzer (Task 124)
Analyze content for brand voice consistency
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class BrandVoiceAnalyzer:
    """Analyze brand voice consistency"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("brand_voice_analyzer")
    
    def analyze(self, content: str) -> Dict[str, Any]:
        """
        Analyze content for brand voice consistency
        
        Args:
            content: Content to analyze
        
        Returns:
            Dictionary with analysis results:
            - consistency_score: Consistency score (0-100)
            - tone_match: Tone matching analysis
            - recommendations: Recommendations for improvement
        """
        self.logger.info("Analyzing brand voice")
        
        # Get brand guidelines
        guidelines = self.rag.query_knowledge_base(
            "brand voice tone style guidelines",
            category="marketing",
            limit=5
        )
        
        tone_match = self._analyze_tone(content, guidelines)
        consistency_score = self._calculate_consistency(content, guidelines)
        recommendations = self._generate_recommendations(content, guidelines, consistency_score)
        
        return {
            "consistency_score": consistency_score,
            "tone_match": tone_match,
            "recommendations": recommendations,
            "analyzed_at": datetime.now().isoformat()
        }
    
    def _analyze_tone(self, content: str, guidelines: List[Dict]) -> Dict[str, Any]:
        """Analyze tone matching"""
        # Simplified tone analysis
        content_lower = content.lower()
        
        professional_words = ["professional", "expert", "quality", "excellence"]
        casual_words = ["hey", "awesome", "cool", "great"]
        
        professional_count = sum(1 for word in professional_words if word in content_lower)
        casual_count = sum(1 for word in casual_words if word in content_lower)
        
        if professional_count > casual_count:
            detected_tone = "professional"
        elif casual_count > professional_count:
            detected_tone = "casual"
        else:
            detected_tone = "neutral"
        
        return {
            "detected_tone": detected_tone,
            "professional_score": professional_count,
            "casual_score": casual_count,
            "match": "good"  # Simplified
        }
    
    def _calculate_consistency(self, content: str, guidelines: List[Dict]) -> int:
        """Calculate consistency score"""
        # Simplified scoring
        score = 75  # Base score
        
        # Adjust based on content length
        if 500 <= len(content) <= 2000:
            score += 10
        
        # Adjust based on structure
        if content.count('\n') > 3:
            score += 5
        
        return min(score, 100)
    
    def _generate_recommendations(self, content: str, guidelines: List[Dict], score: int) -> List[str]:
        """Generate recommendations"""
        recommendations = []
        
        if score < 70:
            recommendations.append("Content may not fully align with brand voice")
            recommendations.append("Review brand guidelines and adjust tone")
        
        if len(content) < 200:
            recommendations.append("Consider expanding content for better engagement")
        
        if not recommendations:
            recommendations.append("Content aligns well with brand voice")
        
        return recommendations

