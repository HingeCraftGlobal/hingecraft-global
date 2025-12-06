#!/usr/bin/env python3
"""
Verify all legal pages are complete and check for missing documents
"""

from pathlib import Path
import re

LEGAL_DIR = Path(__file__).parent.parent / "legal-pages"

# Required documents from original list
REQUIRED_DOCS = {
    # Core Compliance (10)
    "privacy-policy": ["privacy", "gdpr", "ccpa", "coppa"],
    "terms-of-service": ["terms", "tos", "service"],
    "cookie-tracking-policy": ["cookie", "tracking"],
    "data-processing-agreement": ["data-processing", "dpa"],
    "consent-sensitive-data": ["sensitive", "consent", "youth"],
    "ai-training-licensing": ["ai-training", "content-licensing"],
    "ip-creator-compensation": ["creator", "licensing", "ip", "compensation"],
    "membership-agreement": ["membership", "terms-rights"],
    "community-code-conduct": ["community", "code-conduct"],
    "child-minor-protections": ["child", "minor", "youth", "coppa"],
    "export-compliance": ["export", "itar", "ear"],
    
    # Corporate Governance (6)
    "corporate-formation-charter": ["corporate-formation", "charter"],
    "corporate-bylaws": ["corporate-bylaws", "bylaws"],
    "stakeholder-ethos": ["stakeholder", "ethos", "ethics"],
    "board-member-agreement": ["board-member"],
    "risk-register": ["risk-register", "mitigation"],
    "csr-compliance": ["social-responsibility", "csr"],
    
    # Platform Legal (5)
    "universal-terms": ["universal-terms", "terms-of-service"],
    "eula": ["end-user-license", "eula"],
    "acceptable-use": ["acceptable-use", "safety"],
    "sla": ["service-level", "sla"],
    "refunds-warranty": ["refunds", "warranty", "return"],
    
    # Data & AI Governance (6)
    "privacy-policy": ["privacy"],
    "data-processing": ["data-processing"],
    "ai-training-consent": ["ai-training"],
    "sensitive-data-youth": ["sensitive", "youth"],
    "algorithmic-transparency": ["algorithmic", "transparency"],
    "ai-safety-governance": ["ai-safety", "bias", "governance"],
    
    # Marketplace & Licensing (5)
    "creator-licensing-ip": ["creator-licensing"],
    "marketplace-merchant": ["marketplace", "merchant"],
    "manufacturing-production": ["manufacturing", "production"],
    "attribution-derivative": ["attribution", "derivative"],
    "nft-ownership": ["nft", "digital-asset"],
    
    # Hardware & Product (3)
    "product-liability": ["product-liability", "safety"],
    "warranty-repair": ["warranty-repair"],
    "materials-sourcing": ["materials-sourcing", "ethical"],
    
    # Membership & Community (3)
    "membership-terms-rights": ["membership-terms"],
    "community-code-conduct": ["community-code"],
    "academic-integrity": ["academic", "institutional"],
    
    # Movement & Charter (2)
    "charter-abundance": ["charter-abundance", "resilience"],
    "pledge-participation": ["pledge", "participation"],
    
    # International (2)
    "global-compliance": ["global-compliance"],
    "cross-border-data": ["cross-border", "data-transfer"],
}

def find_matching_file(keywords, files):
    """Find file matching keywords"""
    for file in files:
        filename_lower = file.lower()
        if any(kw.lower() in filename_lower for kw in keywords):
            return file
    return None

def verify_all_documents():
    """Verify all required documents exist"""
    html_files = [f.name for f in LEGAL_DIR.glob("*.html")]
    
    print(f"📊 Found {len(html_files)} HTML files\n")
    print("=" * 60)
    print("VERIFICATION REPORT")
    print("=" * 60 + "\n")
    
    missing = []
    found = []
    
    for doc_name, keywords in REQUIRED_DOCS.items():
        match = find_matching_file(keywords, html_files)
        if match:
            found.append((doc_name, match))
            print(f"✅ {doc_name}: {match}")
        else:
            missing.append((doc_name, keywords))
            print(f"❌ MISSING: {doc_name} (keywords: {keywords})")
    
    print("\n" + "=" * 60)
    print(f"SUMMARY: {len(found)} found, {len(missing)} missing")
    print("=" * 60 + "\n")
    
    if missing:
        print("⚠️  MISSING DOCUMENTS:")
        for doc_name, keywords in missing:
            print(f"   - {doc_name}")
        return False
    
    print("✅ All required documents found!")
    return True

if __name__ == "__main__":
    verify_all_documents()



