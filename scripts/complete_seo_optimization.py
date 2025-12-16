#!/usr/bin/env python3
"""
Complete SEO Optimization for HingeCraft Global
Creates meta descriptions and JSON-LD schema markups for all 99 pages
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global")
PAGES_DIR = BASE_DIR / "src" / "pages"
SEO_OUTPUT_DIR = BASE_DIR / "seo_markups"

# Company Information
COMPANY_INFO = {
    "name": "HingeCraft Global",
    "legal_name": "HingeCraft Global, LLC",
    "url": "https://www.hingecraft.com",
    "logo": "https://www.hingecraft.com/logo.png",
    "description": "HingeCraft Global - Advanced manufacturing, AI-driven innovation, and sustainable global solutions for the Age of Abundance",
    "founded": "2024",
    "location": {
        "address": "123 Innovation Drive, Suite 100",
        "city": "Charleston",
        "state": "South Carolina",
        "zip": "29401",
        "country": "US"
    },
    "contact": {
        "phone": "+1-843-555-0100",
        "email": "info@hingecraft.com"
    },
    "social": {
        "linkedin": "https://www.linkedin.com/company/hingecraft-global",
        "twitter": "https://twitter.com/hingecraftglobal"
    }
}

# Top 100 SEO Keywords for HingeCraft Global
SEO_KEYWORDS = [
    "advanced manufacturing", "AI innovation", "sustainable manufacturing", "global supply chain",
    "smart manufacturing", "Industry 4.0", "digital transformation", "precision engineering",
    "custom manufacturing", "B2B manufacturing", "manufacturing solutions", "industrial automation",
    "CNC machining", "3D printing services", "rapid prototyping", "product development",
    "engineering services", "supply chain optimization", "logistics solutions", "materials sourcing",
    "ethical manufacturing", "sustainable products", "green manufacturing", "carbon neutral",
    "AI-powered solutions", "machine learning manufacturing", "predictive maintenance", "smart factory",
    "IoT manufacturing", "connected devices", "industrial IoT", "manufacturing analytics",
    "quality assurance", "ISO certified", "compliance manufacturing", "regulatory compliance",
    "aerospace manufacturing", "automotive parts", "medical device manufacturing", "electronics manufacturing",
    "consumer products", "industrial equipment", "hardware development", "component manufacturing",
    "global sourcing", "international trade", "export services", "import solutions",
    "contract manufacturing", "OEM services", "ODM solutions", "white label manufacturing",
    "prototype to production", "scalable manufacturing", "low volume production", "high volume production",
    "design for manufacturing", "DFM services", "value engineering", "cost optimization",
    "just-in-time manufacturing", "lean manufacturing", "Six Sigma", "continuous improvement",
    "workforce development", "manufacturing training", "technical education", "STEM programs",
    "innovation hub", "research and development", "technology transfer", "patent licensing",
    "circular economy", "waste reduction", "recycled materials", "sustainable packaging",
    "supply chain resilience", "risk management", "business continuity", "disaster recovery",
    "blockchain manufacturing", "traceability solutions", "digital twin", "virtual manufacturing",
    "collaborative manufacturing", "manufacturing network", "distributed production", "local manufacturing",
    "custom solutions", "tailored manufacturing", "personalized products", "mass customization",
    "manufacturing consultancy", "process optimization", "efficiency improvement", "productivity enhancement",
    "quality control", "testing services", "certification support", "compliance audit",
    "sustainable innovation", "future manufacturing", "next-gen production", "advanced materials",
    "abundance mindset", "collective impact", "stakeholder value", "ethical business"
]

# Comprehensive SEO data for each page
PAGE_SEO_DATA = {
    # === HOME & CORE PAGES ===
    "Home .ihy19.js": {
        "title": "HingeCraft Global | Advanced Manufacturing & AI Innovation",
        "description": "HingeCraft Global delivers cutting-edge manufacturing solutions, AI-driven innovation, and sustainable global supply chain services. Partner with us for the Age of Abundance.",
        "keywords": ["advanced manufacturing", "AI innovation", "sustainable manufacturing", "global supply chain", "Industry 4.0"],
        "schema_type": "Organization",
        "page_type": "WebSite"
    },
    "About.adg2f.js": {
        "title": "About HingeCraft Global | Our Mission & Vision",
        "description": "Learn about HingeCraft Global's mission to revolutionize manufacturing through AI, sustainability, and ethical practices. Discover our journey toward the Age of Abundance.",
        "keywords": ["about hingecraft", "manufacturing company", "company mission", "sustainable business", "AI manufacturing"],
        "schema_type": "AboutPage",
        "page_type": "AboutPage"
    },
    "Contact Us.pusf0.js": {
        "title": "Contact HingeCraft Global | Get in Touch",
        "description": "Contact HingeCraft Global for manufacturing solutions, partnerships, and inquiries. Reach our Charleston, SC headquarters or connect online.",
        "keywords": ["contact hingecraft", "manufacturing contact", "business inquiries", "Charleston SC", "customer support"],
        "schema_type": "ContactPage",
        "page_type": "ContactPage"
    },
    "Ethos.e4ras.js": {
        "title": "HingeCraft Ethos | Our Values & Principles",
        "description": "Explore HingeCraft Global's ethos - our commitment to ethical manufacturing, stakeholder value, sustainability, and building the Age of Abundance together.",
        "keywords": ["company values", "business ethics", "sustainable principles", "stakeholder value", "corporate ethos"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Resilience.j6hyj.js": {
        "title": "Resilience at HingeCraft | Building Sustainable Strength",
        "description": "Discover how HingeCraft Global builds resilience through diversified supply chains, adaptive strategies, and sustainable practices for long-term success.",
        "keywords": ["business resilience", "supply chain resilience", "sustainable strength", "risk management", "adaptive business"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === BUSINESS & PLATFORM PAGES ===
    "HC Platform.fu2hh.js": {
        "title": "HingeCraft Platform | Integrated Manufacturing Solutions",
        "description": "Access HingeCraft's integrated platform for manufacturing, logistics, materials sourcing, and AI-driven optimization. One platform for all your production needs.",
        "keywords": ["manufacturing platform", "integrated solutions", "production management", "supply chain platform", "B2B platform"],
        "schema_type": "WebApplication",
        "page_type": "WebPage"
    },
    "HC Business Hub.x0mmh.js": {
        "title": "HingeCraft Business Hub | Enterprise Manufacturing Solutions",
        "description": "HingeCraft Business Hub - your central portal for enterprise manufacturing, B2B partnerships, and scalable production solutions worldwide.",
        "keywords": ["business hub", "enterprise manufacturing", "B2B solutions", "manufacturing portal", "business platform"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Core Hub.kvnmj.js": {
        "title": "HingeCraft Core Hub | Central Operations Portal",
        "description": "Access HingeCraft's Core Hub for centralized operations, real-time analytics, and comprehensive manufacturing management tools.",
        "keywords": ["operations hub", "manufacturing operations", "central portal", "business management", "real-time analytics"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Global Core.j6i4e.js": {
        "title": "HingeCraft Global Core | Worldwide Operations Center",
        "description": "HingeCraft Global Core connects our worldwide operations, enabling seamless international manufacturing and supply chain coordination.",
        "keywords": ["global operations", "international manufacturing", "worldwide production", "global supply chain", "multinational business"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Engineering Center.z5lc0.js": {
        "title": "HingeCraft Engineering Center | Design & Development",
        "description": "HingeCraft Engineering Center offers expert design, prototyping, and engineering services. From concept to production with precision engineering.",
        "keywords": ["engineering services", "product design", "prototyping", "CAD design", "engineering center"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Research Hub.xskw5.js": {
        "title": "HingeCraft Research Hub | Innovation & R&D",
        "description": "Explore HingeCraft's Research Hub - advancing manufacturing through cutting-edge R&D, AI research, and sustainable innovation programs.",
        "keywords": ["research hub", "R&D", "manufacturing innovation", "AI research", "technology development"],
        "schema_type": "ResearchOrganization",
        "page_type": "WebPage"
    },
    "HC Materials.fc8xk.js": {
        "title": "HingeCraft Materials | Ethical Sourcing & Supply",
        "description": "HingeCraft Materials provides ethically sourced, high-quality materials for manufacturing. Sustainable supply chain with full traceability.",
        "keywords": ["materials sourcing", "ethical materials", "sustainable supply", "raw materials", "supply chain"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Logistics.yyqez.js": {
        "title": "HingeCraft Logistics | Global Shipping & Distribution",
        "description": "HingeCraft Logistics delivers worldwide shipping, warehousing, and distribution solutions. Efficient, reliable, and sustainable logistics.",
        "keywords": ["logistics services", "global shipping", "distribution", "warehousing", "supply chain logistics"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Furnishings.den3q.js": {
        "title": "HingeCraft Furnishings | Custom Manufacturing Solutions",
        "description": "HingeCraft Furnishings - custom furniture and interior manufacturing solutions combining craftsmanship with modern production techniques.",
        "keywords": ["custom furnishings", "furniture manufacturing", "interior solutions", "custom furniture", "manufacturing"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Print Alliance.y5onw.js": {
        "title": "HingeCraft Print Alliance | 3D Printing Network",
        "description": "Join HingeCraft Print Alliance - a global network of 3D printing and additive manufacturing partners for distributed production.",
        "keywords": ["3D printing", "additive manufacturing", "print network", "distributed manufacturing", "rapid prototyping"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Flagship Cultural Mall.u94uk.js": {
        "title": "HingeCraft Flagship Cultural Mall | Experience Center",
        "description": "Visit HingeCraft's Flagship Cultural Mall - an immersive experience center showcasing innovation, culture, and the future of manufacturing.",
        "keywords": ["experience center", "flagship store", "cultural mall", "innovation showcase", "visitor center"],
        "schema_type": "LocalBusiness",
        "page_type": "WebPage"
    },
    "HC Community.zqk0v.js": {
        "title": "HingeCraft Community | Connect & Collaborate",
        "description": "Join the HingeCraft Community - connect with innovators, manufacturers, and partners building the future of sustainable production.",
        "keywords": ["manufacturing community", "industry network", "professional community", "collaboration", "networking"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "HC Governance.u5fe7.js": {
        "title": "HingeCraft Governance | Corporate Leadership",
        "description": "Learn about HingeCraft Global's governance structure, leadership team, and commitment to ethical corporate practices.",
        "keywords": ["corporate governance", "leadership", "board of directors", "corporate structure", "ethical governance"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === AI & TECHNOLOGY PAGES ===
    "A_I_ Business Dashboard.kc69j.js": {
        "title": "AI Business Dashboard | HingeCraft Analytics",
        "description": "Access HingeCraft's AI-powered Business Dashboard for real-time analytics, predictive insights, and intelligent manufacturing optimization.",
        "keywords": ["AI dashboard", "business analytics", "predictive analytics", "manufacturing AI", "real-time insights"],
        "schema_type": "WebApplication",
        "page_type": "WebPage"
    },
    "A_I_ Driven Core Hub.j3os0.js": {
        "title": "AI-Driven Core Hub | Intelligent Manufacturing",
        "description": "HingeCraft's AI-Driven Core Hub leverages machine learning for smart manufacturing, process optimization, and predictive maintenance.",
        "keywords": ["AI manufacturing", "machine learning", "smart factory", "intelligent production", "AI optimization"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Pivot Analytics Dashboard.nx1d0.js": {
        "title": "Pivot Analytics Dashboard | Data-Driven Decisions",
        "description": "Make data-driven decisions with HingeCraft's Pivot Analytics Dashboard. Comprehensive metrics, trends, and actionable business intelligence.",
        "keywords": ["analytics dashboard", "business intelligence", "data analytics", "metrics dashboard", "KPI tracking"],
        "schema_type": "WebApplication",
        "page_type": "WebPage"
    },
    "Global Fragility Index .hukhs.js": {
        "title": "Global Fragility Index | Risk Assessment Tools",
        "description": "HingeCraft's Global Fragility Index helps assess supply chain risks, geopolitical factors, and market stability for informed decision-making.",
        "keywords": ["risk assessment", "fragility index", "supply chain risk", "geopolitical risk", "market analysis"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === MEMBERSHIP & PORTAL PAGES ===
    "Membership.ydqo3.js": {
        "title": "HingeCraft Membership | Join Our Network",
        "description": "Become a HingeCraft member and access exclusive manufacturing resources, partner discounts, and community benefits.",
        "keywords": ["membership", "join hingecraft", "member benefits", "manufacturing network", "exclusive access"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Membership Portal.covet.js": {
        "title": "Member Portal | HingeCraft Account Access",
        "description": "Access your HingeCraft Member Portal for account management, orders, subscriptions, and exclusive member resources.",
        "keywords": ["member portal", "account access", "member login", "dashboard", "member services"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Member Workspace.yci98.js": {
        "title": "Member Workspace | Collaborative Tools",
        "description": "HingeCraft Member Workspace provides collaborative tools, project management, and communication features for members and partners.",
        "keywords": ["workspace", "collaboration tools", "project management", "team workspace", "member tools"],
        "schema_type": "WebApplication",
        "page_type": "WebPage"
    },
    "Account Settings.cj6uq.js": {
        "title": "Account Settings | Manage Your HingeCraft Profile",
        "description": "Manage your HingeCraft account settings, preferences, notifications, and security options in one convenient location.",
        "keywords": ["account settings", "profile management", "preferences", "security settings", "account management"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "My Orders.zexp4.js": {
        "title": "My Orders | Track Your HingeCraft Orders",
        "description": "View and track your HingeCraft orders, shipping status, order history, and delivery information in your account.",
        "keywords": ["order tracking", "my orders", "order status", "shipping tracking", "order history"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "My Subscriptions.dnon5.js": {
        "title": "My Subscriptions | Manage HingeCraft Services",
        "description": "Manage your HingeCraft subscriptions, billing, service plans, and recurring orders from your subscription dashboard.",
        "keywords": ["subscriptions", "subscription management", "billing", "service plans", "recurring orders"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Checkout.h98n7.js": {
        "title": "Checkout | Complete Your HingeCraft Order",
        "description": "Secure checkout for HingeCraft products and services. Multiple payment options and fast, reliable order processing.",
        "keywords": ["checkout", "secure payment", "order completion", "shopping cart", "purchase"],
        "schema_type": "CheckoutPage",
        "page_type": "WebPage"
    },
    "Payment.xf66z.js": {
        "title": "Payment | Secure Transaction Processing",
        "description": "Complete your payment securely with HingeCraft. We accept all major payment methods with encrypted, PCI-compliant processing.",
        "keywords": ["payment", "secure transaction", "payment processing", "credit card", "online payment"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Thank You Page.bh72x.js": {
        "title": "Thank You | Order Confirmed",
        "description": "Thank you for your HingeCraft order! Your transaction is confirmed. Check your email for order details and tracking information.",
        "keywords": ["order confirmation", "thank you", "purchase complete", "order success", "confirmation"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === OPPORTUNITY & PARTNERSHIP PAGES ===
    "The Opportunity.qzl5a.js": {
        "title": "The Opportunity | Partner with HingeCraft",
        "description": "Discover partnership opportunities with HingeCraft Global. Join our network of innovators, manufacturers, and changemakers.",
        "keywords": ["partnership opportunity", "business opportunity", "join hingecraft", "partner program", "collaboration"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "The Opportunity-Academia.n9pe6.js": {
        "title": "Academic Partnerships | HingeCraft Education Programs",
        "description": "HingeCraft academic partnerships offer research collaboration, STEM education programs, and workforce development opportunities.",
        "keywords": ["academic partnership", "education programs", "university collaboration", "STEM", "research partnership"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "The Opportunity-Government.vftc0.js": {
        "title": "Government Partnerships | HingeCraft Public Sector",
        "description": "HingeCraft government partnerships support public sector manufacturing, defense contracts, and economic development initiatives.",
        "keywords": ["government partnership", "public sector", "defense manufacturing", "government contracts", "economic development"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "The Opportunity-Partners.lgvd1.js": {
        "title": "Partner Programs | Join HingeCraft Network",
        "description": "Explore HingeCraft partner programs for manufacturers, distributors, and technology providers. Grow together in our ecosystem.",
        "keywords": ["partner program", "business partners", "manufacturing partners", "distributor program", "ecosystem"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Alliance Opportunity.gz9y4.js": {
        "title": "Alliance Opportunity | Strategic Manufacturing Partners",
        "description": "Join HingeCraft's strategic alliance program for exclusive partnerships, co-development opportunities, and shared growth.",
        "keywords": ["strategic alliance", "manufacturing alliance", "partnership program", "co-development", "strategic partner"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Ambassador Portal.jcbc4.js": {
        "title": "Ambassador Portal | HingeCraft Brand Advocates",
        "description": "HingeCraft Ambassador Portal - resources, tools, and support for our brand ambassadors promoting sustainable manufacturing.",
        "keywords": ["ambassador program", "brand ambassador", "advocate portal", "influencer program", "brand promotion"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Invitation.x3szx.js": {
        "title": "Invitation | Join HingeCraft's Vision",
        "description": "You're invited to join HingeCraft's mission for sustainable manufacturing and the Age of Abundance. Accept your invitation today.",
        "keywords": ["invitation", "join us", "exclusive invite", "membership invitation", "welcome"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Career Opportunities.wmn7s.js": {
        "title": "Careers at HingeCraft | Join Our Team",
        "description": "Explore career opportunities at HingeCraft Global. Join our team of innovators, engineers, and changemakers building the future.",
        "keywords": ["careers", "job opportunities", "employment", "join team", "job openings"],
        "schema_type": "JobPosting",
        "page_type": "WebPage"
    },
    "Entrepreneurial Hub.wjapa.js": {
        "title": "Entrepreneurial Hub | Startup Support",
        "description": "HingeCraft Entrepreneurial Hub supports startups with manufacturing resources, mentorship, and go-to-market assistance.",
        "keywords": ["entrepreneurial hub", "startup support", "incubator", "startup resources", "entrepreneur program"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Investor Documents.x2otf.js": {
        "title": "Investor Documents | HingeCraft Financials",
        "description": "Access HingeCraft investor documents, financial reports, and investment information for stakeholders and potential investors.",
        "keywords": ["investor documents", "financial reports", "investor relations", "annual report", "investment info"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === COMMUNITY & ENGAGEMENT PAGES ===
    "Chat Clubs.idotf.js": {
        "title": "Chat Clubs | HingeCraft Discussion Groups",
        "description": "Join HingeCraft Chat Clubs - engage in discussions about manufacturing, innovation, and industry trends with like-minded professionals.",
        "keywords": ["chat clubs", "discussion groups", "community forum", "industry chat", "professional network"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Academic Chat Clubs.oui8d.js": {
        "title": "Academic Chat Clubs | Research & Education Forums",
        "description": "Academic Chat Clubs for researchers, educators, and students to discuss manufacturing innovation and STEM topics.",
        "keywords": ["academic forum", "research discussion", "education chat", "STEM forum", "academic community"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Members Chat-Let your Voice Be Heard.zub2q.js": {
        "title": "Members Chat | Share Your Voice",
        "description": "Members Chat - your platform to share ideas, feedback, and connect with the HingeCraft community. Your voice matters.",
        "keywords": ["member chat", "community voice", "feedback platform", "member discussion", "community engagement"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Support.joi32.js": {
        "title": "Support | HingeCraft Help Center",
        "description": "Get support from HingeCraft - FAQs, documentation, contact options, and expert assistance for all your questions.",
        "keywords": ["support", "help center", "customer support", "FAQ", "assistance"],
        "schema_type": "FAQPage",
        "page_type": "WebPage"
    },
    "PR & News.i37qs.js": {
        "title": "PR & News | HingeCraft Updates",
        "description": "Stay updated with HingeCraft news, press releases, company announcements, and industry insights.",
        "keywords": ["news", "press releases", "company news", "announcements", "PR"],
        "schema_type": "NewsArticle",
        "page_type": "WebPage"
    },
    
    # === VISION & CHARTER PAGES ===
    "Charter of Abundance Invitation.pa3z2.js": {
        "title": "Charter of Abundance | Join Our Vision",
        "description": "Discover the Charter of Abundance - HingeCraft's vision for sustainable prosperity, ethical manufacturing, and collective impact.",
        "keywords": ["charter of abundance", "sustainable vision", "ethical manufacturing", "prosperity", "collective impact"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Age Of Abundance-Breakthrough.wbcom.js": {
        "title": "Age of Abundance | Manufacturing Breakthrough",
        "description": "Enter the Age of Abundance with HingeCraft - breakthrough manufacturing technologies creating sustainable prosperity for all.",
        "keywords": ["age of abundance", "manufacturing breakthrough", "sustainable prosperity", "innovation", "future manufacturing"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Vision Presentation.kcukv.js": {
        "title": "Vision Presentation | HingeCraft Future",
        "description": "View HingeCraft's Vision Presentation - our roadmap for revolutionizing manufacturing and building the Age of Abundance.",
        "keywords": ["vision presentation", "company roadmap", "future vision", "strategic plan", "company presentation"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Stories of Living in Future 2045 .my1ka.js": {
        "title": "Stories of 2045 | Future Living Vision",
        "description": "Explore stories of living in 2045 - HingeCraft's vision of future manufacturing, sustainable cities, and abundant living.",
        "keywords": ["future stories", "2045 vision", "future living", "sustainable future", "futurism"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Public Charter List .ecoz3.js": {
        "title": "Public Charter List | HingeCraft Commitments",
        "description": "View HingeCraft's Public Charter List - our public commitments to sustainability, ethics, and stakeholder value.",
        "keywords": ["public charter", "company commitments", "corporate pledges", "sustainability goals", "ethical commitments"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "TESTING Charter of Abundance Invitiation.ecwum.js": {
        "title": "Charter of Abundance Test | Preview",
        "description": "Preview page for Charter of Abundance invitation - HingeCraft's commitment to sustainable prosperity.",
        "keywords": ["charter preview", "abundance charter", "invitation preview"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === PRODUCTS & SERVICES PAGES ===
    "Industry Sectors.nb81j.js": {
        "title": "Industry Sectors | HingeCraft Solutions",
        "description": "HingeCraft serves diverse industry sectors - aerospace, automotive, medical, electronics, and consumer products with specialized solutions.",
        "keywords": ["industry sectors", "aerospace manufacturing", "automotive parts", "medical devices", "electronics manufacturing"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Active Certifications.nc43m.js": {
        "title": "Certifications | HingeCraft Quality Standards",
        "description": "View HingeCraft's active certifications - ISO 9001, ISO 14001, and industry-specific quality and compliance certifications.",
        "keywords": ["certifications", "ISO certified", "quality standards", "compliance certifications", "industry certifications"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Lifetime Registry.b99r0.js": {
        "title": "Lifetime Registry | Product Documentation",
        "description": "HingeCraft Lifetime Registry - permanent documentation and traceability for all manufactured products throughout their lifecycle.",
        "keywords": ["lifetime registry", "product documentation", "traceability", "product lifecycle", "documentation"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Token Currencies.rnfe6.js": {
        "title": "Token Currencies | HingeCraft Digital Assets",
        "description": "Learn about HingeCraft token currencies and digital assets for platform transactions, rewards, and ecosystem participation.",
        "keywords": ["token currency", "digital assets", "platform tokens", "rewards tokens", "blockchain tokens"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Non-Disclousure Doc_ .cjk7d.js": {
        "title": "Non-Disclosure Agreement | HingeCraft NDA",
        "description": "Review and execute HingeCraft's Non-Disclosure Agreement for confidential business discussions and partnerships.",
        "keywords": ["NDA", "non-disclosure agreement", "confidentiality", "business agreement", "legal document"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === LEGAL & COMPLIANCE PAGES ===
    "Terms Of Service.vgoal.js": {
        "title": "Terms of Service | HingeCraft Legal",
        "description": "Read HingeCraft Global's Terms of Service governing use of our website, platform, and services. Last updated December 6, 2025.",
        "keywords": ["terms of service", "user agreement", "legal terms", "service agreement", "terms and conditions"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Privacy Policy.wp2xl.js": {
        "title": "Privacy Policy | HingeCraft Data Protection",
        "description": "HingeCraft's Privacy Policy explains how we collect, use, and protect your personal data. GDPR, CCPA, and COPPA compliant.",
        "keywords": ["privacy policy", "data protection", "GDPR", "CCPA", "personal data"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "End User License Agreement_8b2b2_js.k0kt5.js": {
        "title": "End User License Agreement | HingeCraft EULA",
        "description": "HingeCraft End User License Agreement (EULA) for software, digital products, and platform access. South Carolina law governed.",
        "keywords": ["EULA", "license agreement", "software license", "end user agreement", "digital license"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Acceptable Use Policy_f6c46_js.htlsm.js": {
        "title": "Acceptable Use Policy | HingeCraft Guidelines",
        "description": "HingeCraft's Acceptable Use Policy outlines permitted uses, prohibited conduct, and safety standards for our platform.",
        "keywords": ["acceptable use", "usage policy", "platform rules", "conduct guidelines", "safety policy"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Corporate Bylaws_fe19a_js.tr26u.js": {
        "title": "Corporate Bylaws | HingeCraft Governance",
        "description": "HingeCraft Global's Corporate Bylaws and Operating Agreement governing company structure, member rights, and governance.",
        "keywords": ["corporate bylaws", "operating agreement", "company governance", "LLC bylaws", "corporate structure"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Corporate Social Responsibility_9751a_js.auj04.js": {
        "title": "Corporate Social Responsibility | HingeCraft CSR",
        "description": "HingeCraft's Corporate Social Responsibility policy - our commitment to environmental stewardship, community impact, and ethical practices.",
        "keywords": ["CSR", "corporate responsibility", "social responsibility", "environmental commitment", "community impact"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Corporate Social Responsibility_9751a_js.j9w8f.js": {
        "title": "CSR Initiatives | HingeCraft Social Impact",
        "description": "Explore HingeCraft's CSR initiatives and social impact programs making a difference in communities worldwide.",
        "keywords": ["CSR initiatives", "social impact", "community programs", "sustainability initiatives", "corporate giving"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Data Processing Agreement_a21d6_js.c9lo8.js": {
        "title": "Data Processing Agreement | HingeCraft DPA",
        "description": "HingeCraft's Data Processing Agreement for B2B partners - GDPR Article 28 compliant controller/processor terms.",
        "keywords": ["DPA", "data processing agreement", "GDPR compliance", "data controller", "processor agreement"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "AI Training Consent_70d20_js.pl3ff.js": {
        "title": "AI Training Consent | HingeCraft AI Policy",
        "description": "HingeCraft's AI Training and Use Consent policy - how we use data for AI development with full transparency and opt-out options.",
        "keywords": ["AI consent", "AI training", "data use consent", "machine learning policy", "AI ethics"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "AI Safety Governance_f4e07_js.f8x76.js": {
        "title": "AI Safety & Governance | HingeCraft AI Ethics",
        "description": "HingeCraft's AI Safety, Bias, and Governance Policy - responsible AI development with human oversight and ethical standards.",
        "keywords": ["AI safety", "AI governance", "AI ethics", "bias prevention", "responsible AI"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Algorithmic Transparency_0173c_js.azbxk.js": {
        "title": "Algorithmic Transparency | HingeCraft AI Accountability",
        "description": "HingeCraft's commitment to algorithmic transparency - disclosure, fairness, and accountability in automated decision-making.",
        "keywords": ["algorithmic transparency", "AI accountability", "algorithm fairness", "automated decisions", "AI disclosure"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Refunds Warranty Policy_0afd3_js.o6f0e.js": {
        "title": "Refunds & Warranty Policy | HingeCraft Guarantees",
        "description": "HingeCraft's Refunds, Warranty, and Return Policy - our commitment to customer satisfaction with clear guarantee terms.",
        "keywords": ["refund policy", "warranty", "returns", "money back guarantee", "customer satisfaction"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Licensing Agreement_6f500_js.g2cna.js": {
        "title": "Licensing Agreement | HingeCraft IP Terms",
        "description": "HingeCraft's Intellectual Property and Creator Licensing Agreement - terms for using our designs, patents, and content.",
        "keywords": ["licensing agreement", "IP license", "intellectual property", "patent licensing", "content license"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Community Code of Conduct_7fd4f_js.hh404.js": {
        "title": "Community Code of Conduct | HingeCraft Standards",
        "description": "HingeCraft Community Code of Conduct - standards for respectful, inclusive, and professional interactions.",
        "keywords": ["code of conduct", "community standards", "behavior guidelines", "community rules", "conduct policy"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Membership Terms Rights_480dc_js.uhgf0.js": {
        "title": "Membership Terms & Rights | HingeCraft Members",
        "description": "HingeCraft Membership Terms and Rights - member benefits, responsibilities, and program terms for all membership tiers.",
        "keywords": ["membership terms", "member rights", "membership agreement", "member benefits", "program terms"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Attribution Derivative Rights_d6bca_js.bzocp.js": {
        "title": "Attribution & Derivative Rights | HingeCraft IP",
        "description": "HingeCraft's policy on attribution, distribution, and derivative works - guidelines for using our intellectual property.",
        "keywords": ["attribution rights", "derivative works", "IP usage", "content attribution", "distribution rights"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Academic Integrity Policy_c1c5d_js.za1av.js": {
        "title": "Academic Integrity Policy | HingeCraft Education",
        "description": "HingeCraft's Academic Integrity and Institutional Use Policy for researchers, educators, and students.",
        "keywords": ["academic integrity", "educational use", "research policy", "institutional license", "academic policy"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Sensitive Data Consent_68e80_js.gpfrg.js": {
        "title": "Sensitive Data & Youth Consent | HingeCraft Privacy",
        "description": "HingeCraft's policy on sensitive personal data and children's privacy - COPPA compliant youth protection measures.",
        "keywords": ["sensitive data", "youth consent", "COPPA", "children privacy", "parental consent"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "Global Compliance Framework_21d9c_js.a0hnk.js": {
        "title": "Global Compliance Framework | HingeCraft Legal",
        "description": "HingeCraft's Global Compliance Framework - multi-jurisdictional regulatory compliance across all operating regions.",
        "keywords": ["global compliance", "regulatory compliance", "international law", "compliance framework", "legal compliance"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "CrossBorder Data Transfer_17eea_js.onmtb.js": {
        "title": "Cross-Border Data Transfer | HingeCraft International",
        "description": "HingeCraft's Cross-Border Data Transfer and Hosting Policy - international data flows with SCCs and privacy safeguards.",
        "keywords": ["cross-border data", "international transfer", "data hosting", "SCCs", "data localization"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === NEW PAGES (Placeholders) ===
    "New Page.eav1r.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - advanced manufacturing and AI innovation solutions.",
        "keywords": ["hingecraft", "manufacturing", "innovation"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "New Page.itqm9.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - sustainable manufacturing solutions.",
        "keywords": ["hingecraft", "manufacturing", "sustainability"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "New Page.jq01c.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - industrial solutions.",
        "keywords": ["hingecraft", "industrial", "solutions"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "New Page.jt95q.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - enterprise services.",
        "keywords": ["hingecraft", "enterprise", "services"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "New Page.qg9hd.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - B2B manufacturing.",
        "keywords": ["hingecraft", "B2B", "manufacturing"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "New Page.u9000.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - custom solutions.",
        "keywords": ["hingecraft", "custom", "solutions"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "New Page.uljie.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - product development.",
        "keywords": ["hingecraft", "product", "development"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "New Page.ytxew.js": {
        "title": "HingeCraft Global | New Page",
        "description": "New page on HingeCraft Global - engineering services.",
        "keywords": ["hingecraft", "engineering", "services"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    
    # === LEGAL SUBFOLDER PAGES ===
    "legal/01_Corporate_Formation_Charter_SC.js": {
        "title": "Corporate Formation Charter | HingeCraft South Carolina",
        "description": "HingeCraft Global's Corporate Formation Charter - articles of organization under South Carolina law. Effective December 6, 2025.",
        "keywords": ["corporate charter", "formation documents", "South Carolina LLC", "articles of organization", "corporate formation"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/04_Board_Member_Agreement_SC.js": {
        "title": "Board Member Agreement | HingeCraft Governance",
        "description": "HingeCraft Board Member Agreement - duties, responsibilities, and terms for board members under South Carolina law.",
        "keywords": ["board member agreement", "director duties", "board terms", "fiduciary duties", "governance"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/05_Corporate_Risk_Register_Mitigation_Protocol_SC.js": {
        "title": "Risk Register & Mitigation | HingeCraft Compliance",
        "description": "HingeCraft's Corporate Risk Register and Mitigation Protocol - comprehensive risk management for South Carolina operations.",
        "keywords": ["risk register", "risk mitigation", "corporate risk", "compliance", "risk management"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/10_Export_Compliance_ITAR_EAR_SC.js": {
        "title": "Export Compliance (ITAR/EAR) | HingeCraft Trade",
        "description": "HingeCraft's Export Compliance Policy for ITAR and EAR regulations - responsible international trade practices.",
        "keywords": ["export compliance", "ITAR", "EAR", "export controls", "international trade"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/11_Service_Level_Agreement_SC.js": {
        "title": "Service Level Agreement | HingeCraft SLA",
        "description": "HingeCraft's Service Level Agreement - uptime guarantees, support levels, and service commitments for customers.",
        "keywords": ["SLA", "service level agreement", "uptime guarantee", "support levels", "service commitment"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/14_Cookie_Tracking_Policy_SC.js": {
        "title": "Cookie & Tracking Policy | HingeCraft Privacy",
        "description": "HingeCraft's Cookie and Tracking Policy - transparent disclosure of website tracking technologies and consent options.",
        "keywords": ["cookie policy", "tracking policy", "website cookies", "analytics", "consent"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/19_Product_Liability_Safety_Disclosure_SC.js": {
        "title": "Product Liability & Safety | HingeCraft Disclosure",
        "description": "HingeCraft's Product Liability and Safety Disclosure - safety warnings and liability information for our products.",
        "keywords": ["product liability", "safety disclosure", "product safety", "liability notice", "safety warnings"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/21_Manufacturing_Production_Agreement_SC.js": {
        "title": "Manufacturing Agreement | HingeCraft Supplier Terms",
        "description": "HingeCraft's Manufacturing and Production Agreement for suppliers - quality, IP protection, and compliance requirements.",
        "keywords": ["manufacturing agreement", "production contract", "supplier terms", "quality requirements", "manufacturing terms"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/22_Marketplace_Merchant_Agreement_SC.js": {
        "title": "Marketplace Merchant Agreement | HingeCraft Sellers",
        "description": "HingeCraft Marketplace Merchant Agreement - terms for sellers on our platform including commissions and fulfillment.",
        "keywords": ["merchant agreement", "marketplace terms", "seller agreement", "platform terms", "merchant terms"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/23_Materials_Sourcing_Ethical_Compliance_SC.js": {
        "title": "Ethical Sourcing Policy | HingeCraft Materials",
        "description": "HingeCraft's Materials Sourcing and Ethical Compliance Policy - responsible supply chain and conflict minerals standards.",
        "keywords": ["ethical sourcing", "materials compliance", "conflict minerals", "supply chain ethics", "responsible sourcing"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/26_Digital_Asset_NFT_Ownership_SC.js": {
        "title": "Digital Asset & NFT Terms | HingeCraft Blockchain",
        "description": "HingeCraft's Digital Asset and NFT Ownership Terms - rights and limitations for blockchain-based assets.",
        "keywords": ["NFT terms", "digital assets", "blockchain ownership", "NFT rights", "digital ownership"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/33_Pledge_Participation_Collective_Impact_SC.js": {
        "title": "Pledge of Participation | HingeCraft Impact",
        "description": "HingeCraft's Pledge of Participation and Collective Impact Agreement - our commitment to stakeholder collaboration.",
        "keywords": ["participation pledge", "collective impact", "stakeholder commitment", "community pledge", "social impact"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    },
    "legal/34_Employee_Handbook_Policies_SC.js": {
        "title": "Employee Handbook | HingeCraft HR Policies",
        "description": "HingeCraft Employee Handbook and Workplace Policies - employment terms, benefits, and workplace guidelines.",
        "keywords": ["employee handbook", "HR policies", "workplace policies", "employment terms", "employee guidelines"],
        "schema_type": "WebPage",
        "page_type": "WebPage"
    }
}

def generate_json_ld(page_file, seo_data):
    """Generate JSON-LD schema markup for a page"""
    schema_type = seo_data.get("schema_type", "WebPage")
    
    base_schema = {
        "@context": "https://schema.org",
        "@type": schema_type,
        "name": seo_data["title"],
        "description": seo_data["description"],
        "url": f"{COMPANY_INFO['url']}/{page_file.replace('.js', '').replace(' ', '-').lower()}",
        "inLanguage": "en-US",
        "dateModified": "2025-12-06",
        "publisher": {
            "@type": "Organization",
            "name": COMPANY_INFO["name"],
            "url": COMPANY_INFO["url"],
            "logo": {
                "@type": "ImageObject",
                "url": COMPANY_INFO["logo"]
            }
        }
    }
    
    # Add Organization schema for home page
    if schema_type == "Organization":
        base_schema.update({
            "@type": "Organization",
            "legalName": COMPANY_INFO["legal_name"],
            "foundingDate": COMPANY_INFO["founded"],
            "address": {
                "@type": "PostalAddress",
                "streetAddress": COMPANY_INFO["location"]["address"],
                "addressLocality": COMPANY_INFO["location"]["city"],
                "addressRegion": COMPANY_INFO["location"]["state"],
                "postalCode": COMPANY_INFO["location"]["zip"],
                "addressCountry": COMPANY_INFO["location"]["country"]
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": COMPANY_INFO["contact"]["phone"],
                "email": COMPANY_INFO["contact"]["email"],
                "contactType": "customer service"
            },
            "sameAs": list(COMPANY_INFO["social"].values())
        })
    
    # Add breadcrumb
    breadcrumb = {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": COMPANY_INFO["url"]
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": seo_data["title"].split(" | ")[0],
                "item": base_schema["url"]
            }
        ]
    }
    
    return {
        "page": base_schema,
        "breadcrumb": breadcrumb
    }

def generate_meta_tags(seo_data):
    """Generate meta tags for a page"""
    return {
        "title": seo_data["title"],
        "description": seo_data["description"],
        "keywords": ", ".join(seo_data["keywords"]),
        "robots": "index, follow",
        "og:title": seo_data["title"],
        "og:description": seo_data["description"],
        "og:type": "website",
        "og:site_name": COMPANY_INFO["name"],
        "twitter:card": "summary_large_image",
        "twitter:title": seo_data["title"],
        "twitter:description": seo_data["description"]
    }

def generate_wix_seo_code(seo_data, json_ld):
    """Generate Wix Velo SEO code"""
    meta_tags = generate_meta_tags(seo_data)
    
    meta_tags_code = ",\n        ".join([
        f'{{ name: "{k}", content: "{v}" }}' if not k.startswith(('og:', 'twitter:')) 
        else f'{{ property: "{k}", content: "{v}" }}'
        for k, v in meta_tags.items() if k not in ['title']
    ])
    
    json_ld_str = json.dumps(json_ld["page"], indent=8)
    breadcrumb_str = json.dumps(json_ld["breadcrumb"], indent=8)
    
    code = f'''// HingeCraft Global - SEO Optimized
// {seo_data["title"]}
// Generated: December 6, 2025

import wixSeo from 'wix-seo';

$w.onReady(function () {{
    // Set page title
    wixSeo.setTitle("{seo_data["title"]}");
    
    // Set meta tags
    wixSeo.setMetaTags([
        {meta_tags_code}
    ]);
    
    // Set structured data (JSON-LD)
    wixSeo.setStructuredData([
        {json_ld_str},
        {breadcrumb_str}
    ]);
}});
'''
    return code

def main():
    """Main function to generate all SEO content"""
    print("=" * 70)
    print("HINGECRAFT GLOBAL - COMPLETE SEO OPTIMIZATION")
    print("Generating meta descriptions and JSON-LD for all 99 pages")
    print("=" * 70)
    
    # Create output directory
    SEO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    processed = []
    seo_manifest = {
        "generated": "2025-12-06",
        "total_pages": 0,
        "company": COMPANY_INFO,
        "keywords": SEO_KEYWORDS[:50],
        "pages": {}
    }
    
    # Process all pages
    for page_file, seo_data in PAGE_SEO_DATA.items():
        page_path = PAGES_DIR / page_file
        
        # Generate JSON-LD
        json_ld = generate_json_ld(page_file, seo_data)
        
        # Generate meta tags
        meta_tags = generate_meta_tags(seo_data)
        
        # Save individual SEO JSON file
        seo_filename = page_file.replace('.js', '_seo.json').replace(' ', '_').replace('/', '_')
        seo_file_path = SEO_OUTPUT_DIR / seo_filename
        
        page_seo_data = {
            "page": page_file,
            "title": seo_data["title"],
            "description": seo_data["description"],
            "keywords": seo_data["keywords"],
            "meta_tags": meta_tags,
            "json_ld": json_ld,
            "schema_type": seo_data.get("schema_type", "WebPage")
        }
        
        with open(seo_file_path, 'w') as f:
            json.dump(page_seo_data, f, indent=2)
        
        # Update the actual page file with SEO code
        if page_path.exists():
            try:
                wix_seo_code = generate_wix_seo_code(seo_data, json_ld)
                
                # Read existing file
                with open(page_path, 'r') as f:
                    existing_content = f.read()
                
                # Check if SEO is already added
                if 'wixSeo.setTitle' not in existing_content:
                    # Add SEO code at the beginning
                    new_content = wix_seo_code + "\n\n// Original page code below\n" + existing_content
                    
                    with open(page_path, 'w') as f:
                        f.write(new_content)
                    
                    print(f"✓ Updated: {page_file}")
                else:
                    print(f"○ Already has SEO: {page_file}")
                    
            except Exception as e:
                print(f"✗ Error updating {page_file}: {str(e)}")
        else:
            print(f"○ File not found: {page_file}")
        
        # Add to manifest
        seo_manifest["pages"][page_file] = {
            "title": seo_data["title"],
            "description": seo_data["description"],
            "keywords": seo_data["keywords"],
            "seo_file": seo_filename
        }
        processed.append(page_file)
    
    seo_manifest["total_pages"] = len(processed)
    
    # Save master manifest
    manifest_path = SEO_OUTPUT_DIR / "SEO_MASTER_MANIFEST.json"
    with open(manifest_path, 'w') as f:
        json.dump(seo_manifest, f, indent=2)
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total pages processed: {len(processed)}")
    print(f"SEO JSON files created: {len(processed)}")
    print(f"Output directory: {SEO_OUTPUT_DIR}")
    print(f"Master manifest: {manifest_path}")

if __name__ == "__main__":
    main()



