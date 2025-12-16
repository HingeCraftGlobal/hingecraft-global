"""
Enhanced RAG Pipeline with Ferguson Intelligence Packages

Integrates:
1. ferguson-chaosgraph - Causal Structural Intelligence
2. ferguson-vectorforge - Multi-Channel Intelligence Embeddings
3. ferguson-opriselector - Opportunity Extraction Engine
"""

import numpy as np
from typing import Dict, List, Optional, Any, Union
import json

# Import the three new packages
try:
    from chaosgraph import ChaosGraphExtractor, OperationalWeighter, EchoSustainForecaster, GraphEmbedder
    CHAOSGRAPH_AVAILABLE = True
except ImportError:
    CHAOSGRAPH_AVAILABLE = False
    print("Warning: ferguson-chaosgraph not available")

try:
    from vectorforge import VectorForgeEmbedder, ChannelMap
    VECTORFORGE_AVAILABLE = True
except ImportError:
    VECTORFORGE_AVAILABLE = False
    print("Warning: ferguson-vectorforge not available")

try:
    from opriselector import OpportunityScanner, OpportunityRanker, OperationalAdvantageDecoder
    OPRISELECTOR_AVAILABLE = True
except ImportError:
    OPRISELECTOR_AVAILABLE = False
    print("Warning: ferguson-opriselector not available")


class EnhancedRAGPipeline:
    """
    Enhanced RAG Pipeline with all three Ferguson intelligence packages
    """
    
    def __init__(self):
        # Initialize ChaosGraph
        if CHAOSGRAPH_AVAILABLE:
            self.graph_extractor = ChaosGraphExtractor()
            self.graph_weighter = OperationalWeighter()
            self.forecaster = EchoSustainForecaster()
            self.graph_embedder = GraphEmbedder()
        else:
            self.graph_extractor = None
            self.graph_weighter = None
            self.forecaster = None
            self.graph_embedder = None
        
        # Initialize VectorForge
        if VECTORFORGE_AVAILABLE:
            self.vector_forge = VectorForgeEmbedder()
            self.channel_map = ChannelMap()
        else:
            self.vector_forge = None
            self.channel_map = None
        
        # Initialize OpriSelector
        if OPRISELECTOR_AVAILABLE:
            self.opportunity_scanner = OpportunityScanner()
            self.opportunity_ranker = OpportunityRanker()
            self.advantage_decoder = OperationalAdvantageDecoder()
        else:
            self.opportunity_scanner = None
            self.opportunity_ranker = None
            self.advantage_decoder = None
    
    def process_with_chaosgraph(self, text: str) -> Dict[str, Any]:
        """Process text with ChaosGraph to extract causal structures"""
        if not CHAOSGRAPH_AVAILABLE or not self.graph_extractor:
            return {"available": False}
        
        # Build causal graph
        graph = self.graph_extractor.build_graph(text)
        
        # Weight nodes by operational value
        weights = self.graph_weighter.weight_graph(graph)
        
        # Find chaos points
        chaos_points = self.forecaster.find_chaos_points(graph)
        
        # Create graph embedding
        graph_embedding = self.graph_embedder.embed_graph_structure(graph)
        
        # Get top nodes
        top_nodes = self.graph_weighter.get_top_nodes(graph, n=10)
        
        return {
            "available": True,
            "graph_nodes": graph.number_of_nodes(),
            "graph_edges": graph.number_of_edges(),
            "top_nodes": top_nodes,
            "chaos_points": chaos_points[:5],  # Top 5
            "graph_embedding_dim": len(graph_embedding),
            "operational_weights": {node: weights[node]["operational"] 
                                  for node in list(weights.keys())[:10]}
        }
    
    def process_with_vectorforge(self, text: str) -> Dict[str, Any]:
        """Process text with VectorForge for multi-channel embeddings"""
        if not VECTORFORGE_AVAILABLE or not self.vector_forge:
            return {"available": False}
        
        # Get multi-channel embedding with metadata
        embedding_data = self.vector_forge.embed_with_metadata(text)
        
        # Get channel analysis
        channel_analysis = self.vector_forge.get_channel_analysis(text)
        
        return {
            "available": True,
            "fused_embedding_dim": len(embedding_data["fused_embedding"]),
            "channel_weights": channel_analysis,
            "dominant_channel": embedding_data["dominant_channel"],
            "channel_embeddings": {
                ch: len(emb) for ch, emb in embedding_data["channel_embeddings"].items()
            }
        }
    
    def process_with_opriselector(self, text: str, 
                                 selection_list: Optional[List[str]] = None) -> Dict[str, Any]:
        """Process text with OpriSelector for opportunity extraction"""
        if not OPRISELECTOR_AVAILABLE or not self.advantage_decoder:
            return {"available": False}
        
        # Decode operational advantages
        if selection_list:
            summary = self.advantage_decoder.decode_with_selection(text, selection_list)
        else:
            summary = self.advantage_decoder.decode(text)
        
        return {
            "available": True,
            "total_opportunities": summary["total_opportunities"],
            "operational_advantage_score": summary["operational_advantage_score"],
            "top_opportunities": summary["top_opportunities"][:5],  # Top 5
            "opportunity_breakdown": summary["opportunity_breakdown"],
            "recommendations": summary["recommendations"][:3]  # Top 3
        }
    
    def process_complete(self, text: str, 
                        selection_list: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Complete processing with all three packages
        
        Returns comprehensive intelligence analysis
        """
        result = {
            "text_length": len(text),
            "chaosgraph": self.process_with_chaosgraph(text),
            "vectorforge": self.process_with_vectorforge(text),
            "opriselector": self.process_with_opriselector(text, selection_list)
        }
        
        # Calculate overall intelligence score
        scores = []
        if result["chaosgraph"].get("available"):
            # Use chaos points as score indicator
            chaos_points = result["chaosgraph"].get("chaos_points", [])
            if chaos_points:
                scores.append(sum(score for _, score in chaos_points[:3]) / 3.0)
        
        if result["vectorforge"].get("available"):
            # Use dominant channel weight
            channel_weights = result["vectorforge"].get("channel_weights", {})
            if channel_weights:
                scores.append(max(channel_weights.values()))
        
        if result["opriselector"].get("available"):
            # Use operational advantage score
            opp_score = result["opriselector"].get("operational_advantage_score", 0.0)
            scores.append(opp_score / 100.0)  # Normalize to 0-1
        
        result["overall_intelligence_score"] = sum(scores) / len(scores) if scores else 0.0
        
        return result
    
    def get_enhanced_embedding(self, text: str) -> Optional[np.ndarray]:
        """
        Get enhanced embedding combining VectorForge and ChaosGraph
        
        Returns unified embedding for RAG search
        """
        embeddings = []
        
        # VectorForge embedding
        if VECTORFORGE_AVAILABLE and self.vector_forge:
            vf_embedding = self.vector_forge.embed(text)
            embeddings.append(vf_embedding)
        
        # ChaosGraph embedding
        if CHAOSGRAPH_AVAILABLE and self.graph_extractor:
            graph = self.graph_extractor.build_graph(text)
            graph_embedding = self.graph_embedder.embed_graph_structure(graph)
            embeddings.append(graph_embedding)
        
        if not embeddings:
            return None
        
        # Combine embeddings (weighted average)
        if len(embeddings) == 2:
            # Normalize dimensions if needed
            min_dim = min(len(e) for e in embeddings)
            embeddings = [e[:min_dim] for e in embeddings]
            combined = (embeddings[0] * 0.6 + embeddings[1] * 0.4)
        else:
            combined = embeddings[0]
        
        # Normalize
        norm = np.linalg.norm(combined)
        if norm > 0:
            combined = combined / norm
        
        return combined


# Global instance
_enhanced_pipeline = None

def get_enhanced_pipeline() -> EnhancedRAGPipeline:
    """Get or create global enhanced pipeline instance"""
    global _enhanced_pipeline
    if _enhanced_pipeline is None:
        _enhanced_pipeline = EnhancedRAGPipeline()
    return _enhanced_pipeline


def process_with_enhanced_rag(text: str, 
                              selection_list: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Process text with enhanced RAG pipeline
    
    Convenience function for easy integration
    """
    pipeline = get_enhanced_pipeline()
    return pipeline.process_complete(text, selection_list)


def get_enhanced_embedding(text: str) -> Optional[np.ndarray]:
    """
    Get enhanced embedding for RAG search
    
    Convenience function for easy integration
    """
    pipeline = get_enhanced_pipeline()
    return pipeline.get_enhanced_embedding(text)








