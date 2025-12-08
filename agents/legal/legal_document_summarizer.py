"""
Legal Agent - Legal Document Summarizer (Task 31 - Phase 2)
Summarize legal documents with key points and structure
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import re

from agents.base.rag_connector import RAGConnector

logger = logging.getLogger(__name__)


class LegalDocumentSummarizer:
    """Summarize legal documents"""
    
    def __init__(self, rag_connector: RAGConnector):
        self.rag = rag_connector
        self.logger = logging.getLogger("legal_document_summarizer")
    
    def summarize(self, document_text: str, summary_type: str = "executive", max_length: int = 500) -> Dict[str, Any]:
        """
        Summarize a legal document
        
        Args:
            document_text: Full document text
            summary_type: Type of summary ('executive', 'detailed', 'bullet')
            max_length: Maximum summary length in words
        
        Returns:
            Dictionary with summary:
            - summary: Generated summary text
            - key_points: List of key points
            - structure: Document structure overview
            - word_count: Original word count
            - summary_length: Summary word count
        """
        self.logger.info(f"Summarizing document: type={summary_type}, max_length={max_length}")
        
        # Extract key information
        key_points = self._extract_key_points(document_text)
        structure = self._analyze_structure(document_text)
        
        # Generate summary based on type
        if summary_type == "executive":
            summary = self._generate_executive_summary(document_text, key_points, max_length)
        elif summary_type == "detailed":
            summary = self._generate_detailed_summary(document_text, key_points, max_length * 2)
        else:  # bullet
            summary = self._generate_bullet_summary(key_points)
        
        word_count = len(document_text.split())
        summary_word_count = len(summary.split())
        
        return {
            "summary": summary,
            "key_points": key_points[:10],  # Top 10 key points
            "structure": structure,
            "word_count": word_count,
            "summary_length": summary_word_count,
            "compression_ratio": round(summary_word_count / word_count * 100, 2) if word_count > 0 else 0,
            "summary_type": summary_type,
            "summarized_at": datetime.now().isoformat()
        }
    
    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key points from document"""
        key_points = []
        
        # Look for numbered/bulleted lists
        lines = text.split('\n')
        for line in lines:
            stripped = line.strip()
            # Check for numbered items
            if re.match(r'^\d+[\.\)]\s+', stripped):
                key_points.append(stripped)
            # Check for bullet points
            elif stripped.startswith('•') or stripped.startswith('-'):
                key_points.append(stripped)
            # Check for section headers
            elif stripped.isupper() and len(stripped) > 5:
                key_points.append(stripped)
        
        # Extract important clauses
        important_keywords = ["shall", "must", "required", "prohibited", "warranty", "liability"]
        sentences = text.split('.')
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in important_keywords):
                if len(sentence.strip()) > 20:
                    key_points.append(sentence.strip())
        
        return key_points[:20]  # Top 20 key points
    
    def _analyze_structure(self, text: str) -> Dict[str, Any]:
        """Analyze document structure"""
        sections = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            # Detect section headers
            if re.match(r'^\d+\.', stripped) or (stripped.isupper() and len(stripped) > 5):
                sections.append({
                    "title": stripped,
                    "line_number": i + 1
                })
        
        return {
            "total_sections": len(sections),
            "sections": sections[:15],  # First 15 sections
            "has_table_of_contents": "table of contents" in text.lower()[:500]
        }
    
    def _generate_executive_summary(self, text: str, key_points: List[str], max_length: int) -> str:
        """Generate executive summary"""
        # Use first paragraph and key points
        paragraphs = text.split('\n\n')
        summary_parts = []
        
        # Add first paragraph if available
        if paragraphs:
            first_para = paragraphs[0].strip()
            if len(first_para.split()) <= max_length // 2:
                summary_parts.append(first_para)
        
        # Add key points
        remaining_length = max_length - sum(len(part.split()) for part in summary_parts)
        for point in key_points[:5]:
            point_words = len(point.split())
            if point_words <= remaining_length:
                summary_parts.append(point)
                remaining_length -= point_words
            else:
                break
        
        return ' '.join(summary_parts)
    
    def _generate_detailed_summary(self, text: str, key_points: List[str], max_length: int) -> str:
        """Generate detailed summary"""
        # Include more context and structure
        paragraphs = text.split('\n\n')
        summary_parts = []
        
        # Include first few paragraphs
        for para in paragraphs[:3]:
            para_words = len(para.split())
            if sum(len(p.split()) for p in summary_parts) + para_words <= max_length:
                summary_parts.append(para.strip())
        
        # Add key points
        remaining_length = max_length - sum(len(part.split()) for part in summary_parts)
        for point in key_points[:10]:
            point_words = len(point.split())
            if point_words <= remaining_length:
                summary_parts.append(point)
                remaining_length -= point_words
        
        return '\n\n'.join(summary_parts)
    
    def _generate_bullet_summary(self, key_points: List[str]) -> str:
        """Generate bullet point summary"""
        return '\n'.join(f"• {point}" for point in key_points[:15])
