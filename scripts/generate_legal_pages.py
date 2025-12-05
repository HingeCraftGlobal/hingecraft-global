#!/usr/bin/env python3
"""
Generate all remaining legal pages for HingeCraft Global
Creates SEO-optimized HTML pages matching website style
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
LEGAL_DIR = BASE_DIR / "legal-pages"

# HTML template
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{description}" />
  <meta name="keywords" content="{keywords}" />
  <meta name="robots" content="index, follow" />
  <title>{title} | HingeCraft Global</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .hero-gradient {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }}
    .prose h1 {{ font-size: 2rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 1rem; }}
    .prose h2 {{ font-size: 1.5rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.75rem; }}
    .prose h3 {{ font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }}
    .prose p {{ margin-top: 1rem; line-height: 1.7; }}
    .prose ul, .prose ol {{ margin-left: 1.5rem; margin-top: 0.75rem; }}
    .prose li {{ margin-top: 0.5rem; }}
    .prose strong {{ font-weight: 600; }}
  </style>
</head>
<body class="bg-slate-50">
  <section class="hero-gradient text-white py-12 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl font-bold mb-4">{title}</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">{subtitle}</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      {content}
      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-600">Last Updated: December 4, 2025</p>
        <p class="text-sm text-gray-600">For questions about this document, please contact: <a href="mailto:legal@hingecraft-global.ai" class="text-purple-700 hover:underline">legal@hingecraft-global.ai</a></p>
      </div>
    </div>
  </main>

  <footer class="bg-gray-900 text-white py-12 px-6 mt-16">
    <div class="max-w-4xl mx-auto text-center">
      <p class="mb-4">&copy; 2025 HingeCraft Global. All rights reserved.</p>
      <p class="text-gray-400 text-sm">
        <a href="/legal" class="hover:text-white">Legal</a> | 
        <a href="/privacy" class="hover:text-white">Privacy</a> | 
        <a href="/terms" class="hover:text-white">Terms</a>
      </p>
    </div>
  </footer>
</body>
</html>
"""

# Legal pages to generate
LEGAL_PAGES = [
    # Corporate Governance (remaining)
    {
        "filename": "05-corporate-risk-register-mitigation-protocol.html",
        "title": "Corporate Risk Register & Mitigation Protocol",
        "subtitle": "Defines Risk Classes and Mitigation Procedures",
        "description": "HingeCraft Global Corporate Risk Register - Risk classes, assessment, and mitigation procedures for comprehensive risk management",
        "keywords": "HingeCraft, Risk Management, Risk Register, Mitigation Protocol, Corporate Risk",
        "content": """
      <h2>RISK REGISTER OVERVIEW</h2>
      <p>This document defines the risk management framework for HINGECRAFT GLOBAL, INC., including risk classification, assessment procedures, and mitigation protocols.</p>

      <h2>I. RISK CLASSIFICATION</h2>
      
      <h3>1.1 Strategic Risks</h3>
      <ul>
        <li>Market competition and disruption</li>
        <li>Technology obsolescence</li>
        <li>Regulatory changes</li>
        <li>Mission misalignment</li>
      </ul>

      <h3>1.2 Operational Risks</h3>
      <ul>
        <li>Supply chain disruptions</li>
        <li>Production failures</li>
        <li>Cybersecurity breaches</li>
        <li>Key personnel loss</li>
      </ul>

      <h3>1.3 Financial Risks</h3>
      <ul>
        <li>Cash flow issues</li>
        <li>Currency fluctuations</li>
        <li>Investment losses</li>
        <li>Payment processing failures</li>
      </ul>

      <h3>1.4 Compliance Risks</h3>
      <ul>
        <li>Regulatory violations</li>
        <li>Data privacy breaches</li>
        <li>Export control violations</li>
        <li>Tax compliance issues</li>
      </ul>

      <h3>1.5 Reputational Risks</h3>
      <ul>
        <li>Public relations crises</li>
        <li>Social media backlash</li>
        <li>Product recalls</li>
        <li>Ethics violations</li>
      </ul>

      <h2>II. RISK ASSESSMENT</h2>
      
      <h3>2.1 Risk Scoring</h3>
      <p>Risks are scored on:</p>
      <ul>
        <li><strong>Probability:</strong> Likelihood of occurrence (1-5 scale)</li>
        <li><strong>Impact:</strong> Severity of consequences (1-5 scale)</li>
        <li><strong>Risk Score:</strong> Probability × Impact</li>
      </ul>

      <h3>2.2 Risk Levels</h3>
      <ul>
        <li><strong>Critical (20-25):</strong> Immediate action required</li>
        <li><strong>High (12-19):</strong> Action plan needed</li>
        <li><strong>Medium (6-11):</strong> Monitor and mitigate</li>
        <li><strong>Low (1-5):</strong> Accept or transfer</li>
      </ul>

      <h2>III. MITIGATION PROCEDURES</h2>
      
      <h3>3.1 Risk Mitigation Strategies</h3>
      <ul>
        <li><strong>Avoid:</strong> Eliminate the risk entirely</li>
        <li><strong>Mitigate:</strong> Reduce probability or impact</li>
        <li><strong>Transfer:</strong> Insurance or contracts</li>
        <li><strong>Accept:</strong> Acknowledge and monitor</li>
      </ul>

      <h3>3.2 Implementation</h3>
      <p>Mitigation plans include:</p>
      <ul>
        <li>Specific actions and timelines</li>
        <li>Responsible parties</li>
        <li>Resource requirements</li>
        <li>Success metrics</li>
      </ul>

      <h2>IV. MONITORING AND REVIEW</h2>
      <p>The Risk Register is reviewed quarterly by the Board of Directors and updated as needed based on:</p>
      <ul>
        <li>New risk identification</li>
        <li>Changes in risk levels</li>
        <li>Mitigation effectiveness</li>
        <li>External environment changes</li>
      </ul>
        """
    },
    {
        "filename": "06-corporate-social-responsibility-compliance.html",
        "title": "Corporate Social Responsibility Compliance",
        "subtitle": "ESG + UN SDG Alignment",
        "description": "HingeCraft Global Corporate Social Responsibility Compliance - ESG standards and UN Sustainable Development Goals alignment",
        "keywords": "HingeCraft, CSR, ESG, UN SDG, Sustainability, Corporate Responsibility",
        "content": """
      <h2>CSR COMMITMENT</h2>
      <p>HINGECRAFT GLOBAL, INC. is committed to corporate social responsibility through environmental, social, and governance (ESG) excellence and alignment with the United Nations Sustainable Development Goals (UN SDGs).</p>

      <h2>I. ENVIRONMENTAL RESPONSIBILITY</h2>
      
      <h3>1.1 Sustainable Manufacturing</h3>
      <ul>
        <li>Use of recycled and sustainable materials</li>
        <li>Reduction of waste and emissions</li>
        <li>Localized production to reduce transportation</li>
        <li>Circular economy principles</li>
      </ul>

      <h3>1.2 Climate Action</h3>
      <ul>
        <li>Carbon footprint reduction</li>
        <li>Renewable energy use</li>
        <li>Carbon offset programs</li>
        <li>Climate risk assessment</li>
      </ul>

      <h2>II. SOCIAL RESPONSIBILITY</h2>
      
      <h3>2.1 Employee Welfare</h3>
      <ul>
        <li>Fair wages and benefits</li>
        <li>Safe working conditions</li>
        <li>Diversity and inclusion</li>
        <li>Professional development</li>
      </ul>

      <h3>2.2 Community Impact</h3>
      <ul>
        <li>Local community engagement</li>
        <li>Educational programs</li>
        <li>Skills training</li>
        <li>Access to tools and resources</li>
      </ul>

      <h3>2.3 Human Rights</h3>
      <ul>
        <li>Respect for human rights in operations</li>
        <li>Supply chain due diligence</li>
        <li>No forced or child labor</li>
        <li>Freedom of association</li>
      </ul>

      <h2>III. GOVERNANCE</h2>
      
      <h3>3.1 Ethical Governance</h3>
      <ul>
        <li>Transparent decision-making</li>
        <li>Stakeholder engagement</li>
        <li>Anti-corruption measures</li>
        <li>Board diversity</li>
      </ul>

      <h3>3.2 Data Governance</h3>
      <ul>
        <li>Privacy protection</li>
        <li>Data security</li>
        <li>Transparent data practices</li>
        <li>User control</li>
      </ul>

      <h2>IV. UN SUSTAINABLE DEVELOPMENT GOALS</h2>
      <p>HingeCraft aligns with the following UN SDGs:</p>
      <ul>
        <li><strong>SDG 4:</strong> Quality Education - Providing educational tools and resources</li>
        <li><strong>SDG 8:</strong> Decent Work - Creating meaningful employment opportunities</li>
        <li><strong>SDG 9:</strong> Industry Innovation - Advancing sustainable manufacturing</li>
        <li><strong>SDG 12:</strong> Responsible Consumption - Promoting circular economy</li>
        <li><strong>SDG 13:</strong> Climate Action - Reducing environmental impact</li>
        <li><strong>SDG 17:</strong> Partnerships - Collaborating for sustainable development</li>
      </ul>

      <h2>V. REPORTING AND ACCOUNTABILITY</h2>
      <p>HingeCraft commits to:</p>
      <ul>
        <li>Annual CSR reporting</li>
        <li>Third-party verification</li>
        <li>Stakeholder feedback</li>
        <li>Continuous improvement</li>
      </ul>
        """
    },
    # Platform Legal Framework (5 docs)
    {
        "filename": "07-universal-terms-of-service.html",
        "title": "Universal Terms of Service",
        "subtitle": "Master Contract Covering Platform Access and Rights",
        "description": "HingeCraft Global Universal Terms of Service - Master contract covering platform access, user rights, and responsibilities",
        "keywords": "HingeCraft, Terms of Service, User Agreement, Platform Terms, Legal Contract",
        "content": """
      <h2>TERMS OF SERVICE</h2>
      <p>These Universal Terms of Service ("Terms") govern your access to and use of HingeCraft Global's platform, services, and products. By accessing or using our services, you agree to be bound by these Terms.</p>

      <h2>I. ACCEPTANCE OF TERMS</h2>
      <p>By accessing or using HingeCraft Global's platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and all applicable laws and regulations.</p>

      <h2>II. DESCRIPTION OF SERVICES</h2>
      <p>HingeCraft Global provides:</p>
      <ul>
        <li>AI-assisted design tools</li>
        <li>3D modeling and fabrication workflows</li>
        <li>Marketplace for designs and products</li>
        <li>Community and learning platforms</li>
        <li>Manufacturing coordination services</li>
      </ul>

      <h2>III. USER ACCOUNTS</h2>
      
      <h3>3.1 Account Creation</h3>
      <p>You must provide accurate and complete information when creating an account.</p>

      <h3>3.2 Account Security</h3>
      <p>You are responsible for maintaining the security of your account credentials.</p>

      <h3>3.3 Account Termination</h3>
      <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>

      <h2>IV. USER CONDUCT</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate any applicable laws</li>
        <li>Infringe intellectual property rights</li>
        <li>Transmit harmful code or malware</li>
        <li>Harass or harm other users</li>
        <li>Use services for illegal purposes</li>
      </ul>

      <h2>V. INTELLECTUAL PROPERTY</h2>
      
      <h3>5.1 Platform IP</h3>
      <p>All platform technology, designs, and content are owned by HingeCraft Global or its licensors.</p>

      <h3>5.2 User Content</h3>
      <p>You retain ownership of content you create but grant HingeCraft Global a license to use it in connection with the platform.</p>

      <h2>VI. PAYMENTS AND FEES</h2>
      <p>Certain services may require payment. Payment terms are specified at the point of purchase.</p>

      <h2>VII. DISCLAIMERS AND LIMITATIONS</h2>
      <p>Services are provided "as is" without warranties. HingeCraft Global's liability is limited to the maximum extent permitted by law.</p>

      <h2>VIII. TERMINATION</h2>
      <p>Either party may terminate access at any time. Upon termination, your right to use the services immediately ceases.</p>

      <h2>IX. GOVERNING LAW</h2>
      <p>These Terms are governed by Delaware law, without regard to conflict of law principles.</p>

      <h2>X. CHANGES TO TERMS</h2>
      <p>We may modify these Terms at any time. Continued use after changes constitutes acceptance.</p>
        """
    },
    {
        "filename": "08-end-user-license-agreement.html",
        "title": "End-User License Agreement (EULA)",
        "subtitle": "Software and AI Tools Usage Rights",
        "description": "HingeCraft Global End-User License Agreement - Software and AI tools usage rights and restrictions",
        "keywords": "HingeCraft, EULA, Software License, AI Tools, Usage Rights",
        "content": """
      <h2>END-USER LICENSE AGREEMENT</h2>
      <p>This End-User License Agreement ("EULA") governs your use of HingeCraft Global's software applications and AI tools.</p>

      <h2>I. GRANT OF LICENSE</h2>
      <p>Subject to these terms, HingeCraft Global grants you a limited, non-exclusive, non-transferable license to use the software for personal or commercial purposes as specified.</p>

      <h2>II. RESTRICTIONS</h2>
      <p>You may not:</p>
      <ul>
        <li>Copy, modify, or distribute the software</li>
        <li>Reverse engineer or decompile</li>
        <li>Remove proprietary notices</li>
        <li>Use for illegal purposes</li>
        <li>Transfer or sublicense</li>
      </ul>

      <h2>III. AI TOOLS USAGE</h2>
      <p>AI tools are provided for assistance only. You are responsible for verifying outputs and ensuring compliance with applicable laws.</p>

      <h2>IV. INTELLECTUAL PROPERTY</h2>
      <p>All software and AI tools remain the property of HingeCraft Global. This EULA does not grant ownership rights.</p>

      <h2>V. TERMINATION</h2>
      <p>This license terminates upon violation of these terms or at HingeCraft Global's discretion.</p>
        """
    },
    {
        "filename": "09-acceptable-use-safety-policy.html",
        "title": "Acceptable Use & Safety Policy",
        "subtitle": "Prohibited Uses and Moderation Triggers",
        "description": "HingeCraft Global Acceptable Use & Safety Policy - Prohibited uses, safety guidelines, and moderation policies",
        "keywords": "HingeCraft, Acceptable Use Policy, Safety Policy, Moderation, Community Guidelines",
        "content": """
      <h2>ACCEPTABLE USE & SAFETY POLICY</h2>
      <p>This policy defines acceptable and prohibited uses of HingeCraft Global's platform and services.</p>

      <h2>I. PROHIBITED USES</h2>
      <p>You may not use our platform to:</p>
      <ul>
        <li>Violate any laws or regulations</li>
        <li>Infringe intellectual property rights</li>
        <li>Harass, threaten, or harm others</li>
        <li>Distribute malware or harmful code</li>
        <li>Engage in fraud or deception</li>
        <li>Create weapons or harmful products</li>
        <li>Violate privacy rights</li>
        <li>Spam or send unsolicited communications</li>
      </ul>

      <h2>II. SAFETY GUIDELINES</h2>
      
      <h3>2.1 Product Safety</h3>
      <p>All designs and products must:</p>
      <ul>
        <li>Comply with safety standards</li>
        <li>Include appropriate warnings</li>
        <li>Not pose unreasonable risks</li>
        <li>Meet applicable regulations</li>
      </ul>

      <h3>2.2 Content Safety</h3>
      <p>Content must not:</p>
      <ul>
        <li>Promote violence or hate</li>
        <li>Contain explicit material</li>
        <li>Mislead or deceive</li>
        <li>Violate others' rights</li>
      </ul>

      <h2>III. MODERATION</h2>
      <p>HingeCraft Global reserves the right to:</p>
      <ul>
        <li>Review and remove content</li>
        <li>Suspend or terminate accounts</li>
        <li>Report violations to authorities</li>
        <li>Take legal action when necessary</li>
      </ul>

      <h2>IV. REPORTING VIOLATIONS</h2>
      <p>Report violations to: <a href="mailto:safety@hingecraft-global.ai">safety@hingecraft-global.ai</a></p>
        """
    },
    {
        "filename": "10-service-level-agreement.html",
        "title": "Service Level Agreement (SLA)",
        "subtitle": "For Enterprise, Schools, Governments",
        "description": "HingeCraft Global Service Level Agreement - Uptime guarantees, support levels, and service commitments for enterprise customers",
        "keywords": "HingeCraft, SLA, Service Level Agreement, Enterprise, Uptime Guarantee",
        "content": """
      <h2>SERVICE LEVEL AGREEMENT</h2>
      <p>This Service Level Agreement ("SLA") defines service commitments for enterprise, educational, and government customers.</p>

      <h2>I. SERVICE AVAILABILITY</h2>
      
      <h3>1.1 Uptime Commitment</h3>
      <ul>
        <li><strong>Standard:</strong> 99.0% uptime</li>
        <li><strong>Premium:</strong> 99.9% uptime</li>
        <li><strong>Enterprise:</strong> 99.95% uptime</li>
      </ul>

      <h3>1.2 Scheduled Maintenance</h3>
      <p>Maintenance windows are scheduled during low-usage periods with advance notice.</p>

      <h2>II. SUPPORT LEVELS</h2>
      
      <h3>2.1 Response Times</h3>
      <ul>
        <li><strong>Critical:</strong> 1 hour</li>
        <li><strong>High:</strong> 4 hours</li>
        <li><strong>Medium:</strong> 24 hours</li>
        <li><strong>Low:</strong> 48 hours</li>
      </ul>

      <h3>2.2 Support Channels</h3>
      <ul>
        <li>Email support</li>
        <li>Phone support (Enterprise)</li>
        <li>Dedicated account manager (Enterprise)</li>
        <li>24/7 support (Enterprise)</li>
      </ul>

      <h2>III. PERFORMANCE METRICS</h2>
      <ul>
        <li>API response time: < 200ms (p95)</li>
        <li>Page load time: < 2 seconds</li>
        <li>Data processing: Real-time or < 1 hour</li>
      </ul>

      <h2>IV. REMEDIES</h2>
      <p>Service credits are provided for SLA violations as specified in your service agreement.</p>
        """
    },
    {
        "filename": "11-refunds-warranty-return-policy.html",
        "title": "Refunds, Warranty & Return Policy",
        "subtitle": "Consumer Rights, Refund Logic, Product Guarantee",
        "description": "HingeCraft Global Refunds, Warranty & Return Policy - Consumer rights, refund procedures, and product warranties",
        "keywords": "HingeCraft, Refund Policy, Warranty, Returns, Consumer Rights",
        "content": """
      <h2>REFUNDS, WARRANTY & RETURN POLICY</h2>
      <p>This policy outlines refund procedures, warranty coverage, and return processes for HingeCraft Global products and services.</p>

      <h2>I. REFUND POLICY</h2>
      
      <h3>1.1 Digital Products</h3>
      <ul>
        <li>Refunds available within 30 days of purchase</li>
        <li>No refunds for downloaded or used digital products</li>
        <li>Refunds processed within 10 business days</li>
      </ul>

      <h3>1.2 Physical Products</h3>
      <ul>
        <li>Returns accepted within 30 days of delivery</li>
        <li>Products must be unused and in original packaging</li>
        <li>Customer responsible for return shipping</li>
      </ul>

      <h3>1.3 Services</h3>
      <ul>
        <li>Pro-rated refunds for unused service periods</li>
        <li>No refunds for completed services</li>
        <li>Refunds processed within 14 business days</li>
      </ul>

      <h2>II. WARRANTY</h2>
      
      <h3>2.1 Product Warranty</h3>
      <p>Physical products are warranted against defects in materials and workmanship for:</p>
      <ul>
        <li><strong>Standard:</strong> 1 year from purchase</li>
        <li><strong>Premium:</strong> 2 years from purchase</li>
      </ul>

      <h3>2.2 Warranty Exclusions</h3>
      <p>Warranty does not cover:</p>
      <ul>
        <li>Normal wear and tear</li>
        <li>Damage from misuse</li>
        <li>Modifications or repairs by unauthorized parties</li>
        <li>Acts of nature</li>
      </ul>

      <h3>2.3 Warranty Claims</h3>
      <p>Submit warranty claims to: <a href="mailto:warranty@hingecraft-global.ai">warranty@hingecraft-global.ai</a></p>

      <h2>III. RETURN PROCESS</h2>
      <ol>
        <li>Contact customer service for return authorization</li>
        <li>Receive return shipping label (if applicable)</li>
        <li>Package product securely</li>
        <li>Ship to designated return address</li>
        <li>Receive refund or replacement</li>
      </ol>

      <h2>IV. CONSUMER RIGHTS</h2>
      <p>This policy does not affect your statutory consumer rights under applicable law.</p>
        """
    },
    # Data & AI Governance (6 docs)
    {
        "filename": "12-privacy-policy-gdpr-ccpa-coppa.html",
        "title": "Privacy Policy (GDPR/CCPA/COPPA Compliant)",
        "subtitle": "Global Data Collection Compliance",
        "description": "HingeCraft Global Privacy Policy - GDPR, CCPA, and COPPA compliant privacy policy covering global data collection and user rights",
        "keywords": "HingeCraft, Privacy Policy, GDPR, CCPA, COPPA, Data Protection, Privacy Rights",
        "content": """
      <h2>PRIVACY POLICY</h2>
      <p>HingeCraft Global ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>

      <h2>I. INFORMATION WE COLLECT</h2>
      
      <h3>1.1 Information You Provide</h3>
      <ul>
        <li>Account information (name, email, password)</li>
        <li>Profile information</li>
        <li>Payment information</li>
        <li>Designs and content you create</li>
        <li>Communications with us</li>
      </ul>

      <h3>1.2 Automatically Collected Information</h3>
      <ul>
        <li>Device information</li>
        <li>Usage data and analytics</li>
        <li>Cookies and tracking technologies</li>
        <li>IP address and location data</li>
      </ul>

      <h2>II. HOW WE USE YOUR INFORMATION</h2>
      <ul>
        <li>Provide and improve our services</li>
        <li>Process transactions</li>
        <li>Communicate with you</li>
        <li>Personalize your experience</li>
        <li>Train and improve AI models (with consent)</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>III. DATA SHARING AND DISCLOSURE</h2>
      <p>We may share your information with:</p>
      <ul>
        <li>Service providers and partners</li>
        <li>Legal authorities when required</li>
        <li>Business transfers (mergers, acquisitions)</li>
        <li>With your consent</li>
      </ul>

      <h2>IV. YOUR RIGHTS (GDPR/CCPA)</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Delete your data</li>
        <li>Object to processing</li>
        <li>Data portability</li>
        <li>Opt-out of sale (CCPA)</li>
      </ul>

      <h2>V. CHILDREN'S PRIVACY (COPPA)</h2>
      <p>We do not knowingly collect information from children under 13 without parental consent. Parents may review, delete, or refuse further collection of their child's information.</p>

      <h2>VI. DATA SECURITY</h2>
      <p>We implement appropriate technical and organizational measures to protect your data, including encryption, access controls, and regular security assessments.</p>

      <h2>VII. INTERNATIONAL DATA TRANSFERS</h2>
      <p>Your data may be transferred to and processed in countries outside your jurisdiction. We ensure adequate safeguards are in place.</p>

      <h2>VIII. CONTACT US</h2>
      <p>For privacy inquiries: <a href="mailto:privacy@hingecraft-global.ai">privacy@hingecraft-global.ai</a></p>
      <p>Data Protection Officer: <a href="mailto:dpo@hingecraft-global.ai">dpo@hingecraft-global.ai</a></p>
        """
    },
    {
        "filename": "13-data-processing-agreement.html",
        "title": "Data Processing Agreement (DPA)",
        "subtitle": "Required for AI Training + User Uploads",
        "description": "HingeCraft Global Data Processing Agreement - Agreement governing data processing for AI training and user uploads",
        "keywords": "HingeCraft, DPA, Data Processing Agreement, AI Training, Data Processing",
        "content": """
      <h2>DATA PROCESSING AGREEMENT</h2>
      <p>This Data Processing Agreement ("DPA") governs how HingeCraft Global processes personal data in connection with AI training and user uploads.</p>

      <h2>I. SCOPE</h2>
      <p>This DPA applies to all personal data processed by HingeCraft Global as a data processor on behalf of users or as a data controller for platform operations.</p>

      <h2>II. PROCESSING PURPOSES</h2>
      <ul>
        <li>AI model training and improvement</li>
        <li>Service provision and personalization</li>
        <li>Content processing and storage</li>
        <li>Analytics and platform improvement</li>
      </ul>

      <h2>III. DATA SECURITY</h2>
      <p>We implement:</p>
      <ul>
        <li>Encryption in transit and at rest</li>
        <li>Access controls and authentication</li>
        <li>Regular security audits</li>
        <li>Incident response procedures</li>
      </ul>

      <h2>IV. SUBPROCESSORS</h2>
      <p>We may use subprocessors for cloud hosting, analytics, and other services. Subprocessors are bound by equivalent data protection obligations.</p>

      <h2>V. DATA RETENTION</h2>
      <p>Data is retained only as long as necessary for the purposes stated in this DPA or as required by law.</p>

      <h2>VI. USER RIGHTS</h2>
      <p>Users may exercise their rights under GDPR/CCPA, including access, correction, deletion, and portability.</p>
        """
    },
    {
        "filename": "14-ai-training-use-consent.html",
        "title": "AI Training & Use Consent Contract",
        "subtitle": "User Opt-In, Opt-Out, Ownership",
        "description": "HingeCraft Global AI Training & Use Consent Contract - User consent for AI training, opt-in/opt-out rights, and data ownership",
        "keywords": "HingeCraft, AI Training Consent, Opt-In, Opt-Out, Data Ownership, AI Consent",
        "content": """
      <h2>AI TRAINING & USE CONSENT CONTRACT</h2>
      <p>This contract governs your consent for HingeCraft Global to use your data for AI training and improvement purposes.</p>

      <h2>I. CONSENT FOR AI TRAINING</h2>
      <p>By opting in, you consent to:</p>
      <ul>
        <li>Use of your designs and content for AI model training</li>
        <li>Anonymization and aggregation of your data</li>
        <li>Improvement of AI capabilities</li>
        <li>Development of new AI features</li>
      </ul>

      <h2>II. OPT-IN PROCESS</h2>
      <p>You may opt-in to AI training through:</p>
      <ul>
        <li>Account settings</li>
        <li>Explicit consent during upload</li>
        <li>Separate consent form</li>
      </ul>

      <h2>III. OPT-OUT RIGHTS</h2>
      <p>You may opt-out at any time through:</p>
      <ul>
        <li>Account settings</li>
        <li>Email request to: <a href="mailto:privacy@hingecraft-global.ai">privacy@hingecraft-global.ai</a></li>
      </ul>
      <p>Opting out does not affect data already used in trained models but prevents future use.</p>

      <h2>IV. DATA OWNERSHIP</h2>
      <p>You retain ownership of your content. By consenting to AI training, you grant a license for training purposes only.</p>

      <h2>V. ANONYMIZATION</h2>
      <p>Data used for AI training is anonymized and aggregated to protect your privacy.</p>
        """
    },
    {
        "filename": "15-sensitive-data-youth-consent.html",
        "title": "Sensitive Data & Youth Data Consent",
        "subtitle": "For Minors, Biometrics, Education Data",
        "description": "HingeCraft Global Sensitive Data & Youth Data Consent - Special protections for minors, biometric data, and educational information",
        "keywords": "HingeCraft, Youth Data, COPPA, FERPA, Biometric Data, Sensitive Data",
        "content": """
      <h2>SENSITIVE DATA & YOUTH DATA CONSENT</h2>
      <p>This policy addresses special protections for sensitive data, including information from minors, biometric data, and educational records.</p>

      <h2>I. MINOR DATA PROTECTION (COPPA)</h2>
      
      <h3>1.1 Parental Consent</h3>
      <p>For users under 13, we require:</p>
      <ul>
        <li>Verifiable parental consent</li>
        <li>Parental access to child's account</li>
        <li>Limited data collection</li>
        <li>No behavioral advertising</li>
      </ul>

      <h3>1.2 Teen Privacy (13-17)</h3>
      <p>For users 13-17:</p>
      <ul>
        <li>Enhanced privacy protections</li>
        <li>Limited data sharing</li>
        <li>Age-appropriate content</li>
        <li>Parental notification options</li>
      </ul>

      <h2>II. BIOMETRIC DATA</h2>
      <p>If we collect biometric data:</p>
      <ul>
        <li>Explicit consent required</li>
        <li>Limited use and retention</li>
        <li>Secure storage</li>
        <li>Right to deletion</li>
      </ul>

      <h2>III. EDUCATIONAL DATA (FERPA)</h2>
      <p>For educational institutions:</p>
      <ul>
        <li>FERPA-compliant handling</li>
        <li>Limited disclosure</li>
        <li>Student record protection</li>
        <li>Institutional consent</li>
      </ul>

      <h2>IV. SENSITIVE PERSONAL DATA</h2>
      <p>Special protections apply to:</p>
      <ul>
        <li>Health information</li>
        <li>Financial data</li>
        <li>Location data</li>
        <li>Political or religious beliefs</li>
      </ul>
        """
    },
    {
        "filename": "16-algorithmic-transparency-accountability.html",
        "title": "Algorithmic Transparency & Accountability Statement",
        "subtitle": "Required for AI Governance Compliance",
        "description": "HingeCraft Global Algorithmic Transparency & Accountability Statement - AI governance compliance, transparency, and accountability measures",
        "keywords": "HingeCraft, Algorithmic Transparency, AI Governance, AI Accountability, Algorithmic Fairness",
        "content": """
      <h2>ALGORITHMIC TRANSPARENCY & ACCOUNTABILITY STATEMENT</h2>
      <p>HingeCraft Global is committed to transparent and accountable AI systems. This statement outlines our approach to algorithmic governance.</p>

      <h2>I. TRANSPARENCY COMMITMENTS</h2>
      
      <h3>1.1 Algorithm Disclosure</h3>
      <p>We disclose:</p>
      <ul>
        <li>Types of AI systems used</li>
        <li>General purposes and capabilities</li>
        <li>Data sources and training methods</li>
        <li>Known limitations</li>
      </ul>

      <h3>1.2 Decision Explanation</h3>
      <p>Where feasible, we provide explanations for AI-driven decisions affecting users.</p>

      <h2>II. ACCOUNTABILITY MEASURES</h2>
      
      <h3>2.1 Human Oversight</h3>
      <p>Critical decisions involve human review and oversight.</p>

      <h3>2.2 Bias Testing</h3>
      <p>We regularly test AI systems for bias and discrimination.</p>

      <h3>2.3 Impact Assessment</h3>
      <p>We assess the social and ethical impacts of our AI systems.</p>

      <h2>III. USER RIGHTS</h2>
      <ul>
        <li>Right to explanation</li>
        <li>Right to human review</li>
        <li>Right to contest decisions</li>
        <li>Right to opt-out</li>
      </ul>

      <h2>IV. GOVERNANCE FRAMEWORK</h2>
      <p>Our AI governance includes:</p>
      <ul>
        <li>Ethics review board</li>
        <li>Regular audits</li>
        <li>Stakeholder input</li>
        <li>Continuous improvement</li>
      </ul>
        """
    },
    {
        "filename": "17-ai-safety-bias-governance.html",
        "title": "AI Safety, Bias, and Governance Framework",
        "subtitle": "Comprehensive AI Safety and Bias Mitigation",
        "description": "HingeCraft Global AI Safety, Bias, and Governance Framework - Comprehensive framework for AI safety, bias mitigation, and ethical governance",
        "keywords": "HingeCraft, AI Safety, AI Bias, AI Governance, Ethical AI, AI Ethics",
        "content": """
      <h2>AI SAFETY, BIAS, AND GOVERNANCE FRAMEWORK</h2>
      <p>This framework establishes comprehensive guidelines for AI safety, bias mitigation, and ethical governance at HingeCraft Global.</p>

      <h2>I. AI SAFETY</h2>
      
      <h3>1.1 Safety Standards</h3>
      <ul>
        <li>Robust testing and validation</li>
        <li>Fail-safe mechanisms</li>
        <li>Error handling and recovery</li>
        <li>Security measures</li>
      </ul>

      <h3>1.2 Risk Assessment</h3>
      <p>We assess risks associated with:</p>
      <ul>
        <li>AI system failures</li>
        <li>Adversarial attacks</li>
        <li>Unintended consequences</li>
        <li>Systemic risks</li>
      </ul>

      <h2>II. BIAS MITIGATION</h2>
      
      <h3>2.1 Bias Detection</h3>
      <ul>
        <li>Regular bias audits</li>
        <li>Diverse training data</li>
        <li>Fairness metrics</li>
        <li>Representation analysis</li>
      </ul>

      <h3>2.2 Bias Remediation</h3>
      <ul>
        <li>Data balancing</li>
        <li>Algorithm adjustments</li>
        <li>Post-processing corrections</li>
        <li>Continuous monitoring</li>
      </ul>

      <h2>III. GOVERNANCE STRUCTURE</h2>
      
      <h3>3.1 Ethics Board</h3>
      <p>An independent ethics board reviews AI systems and policies.</p>

      <h3>3.2 Review Process</h3>
      <ul>
        <li>Pre-deployment review</li>
        <li>Ongoing monitoring</li>
        <li>Incident response</li>
        <li>Stakeholder feedback</li>
      </ul>

      <h2>IV. COMPLIANCE</h2>
      <p>We comply with:</p>
      <ul>
        <li>EU AI Act</li>
        <li>Algorithmic accountability laws</li>
        <li>Industry best practices</li>
        <li>Ethical AI principles</li>
      </ul>
        """
    },
    # Marketplace & Licensing (5 docs)
    {
        "filename": "18-creator-licensing-ip-agreement.html",
        "title": "Creator Licensing & IP Agreement",
        "subtitle": "Ownership + Royalties for Designs",
        "description": "HingeCraft Global Creator Licensing & IP Agreement - Intellectual property ownership and royalty structure for creators",
        "keywords": "HingeCraft, Creator Agreement, IP License, Royalties, Design Ownership",
        "content": """
      <h2>CREATOR LICENSING & IP AGREEMENT</h2>
      <p>This agreement governs intellectual property rights and licensing for creators using the HingeCraft Global platform.</p>

      <h2>I. OWNERSHIP</h2>
      <p>Creators retain ownership of their original designs and content. By uploading to the platform, creators grant HingeCraft Global a license to:</p>
      <ul>
        <li>Display and promote designs</li>
        <li>Facilitate sales and licensing</li>
        <li>Use for platform operations</li>
      </ul>

      <h2>II. LICENSING OPTIONS</h2>
      
      <h3>2.1 Exclusive License</h3>
      <p>Creator grants exclusive rights to HingeCraft Global for specified period.</p>

      <h3>2.2 Non-Exclusive License</h3>
      <p>Creator retains rights to license elsewhere while granting HingeCraft Global non-exclusive rights.</p>

      <h3>2.3 Marketplace License</h3>
      <p>Designs available for purchase/license by other users through marketplace.</p>

      <h2>III. ROYALTIES</h2>
      
      <h3>3.1 Royalty Structure</h3>
      <ul>
        <li><strong>Direct Sales:</strong> 70% to creator, 30% to platform</li>
        <li><strong>Licensing:</strong> 60% to creator, 40% to platform</li>
        <li><strong>Custom Agreements:</strong> Negotiated terms</li>
      </ul>

      <h3>3.2 Payment Terms</h3>
      <p>Royalties paid monthly within 30 days of month end.</p>

      <h2>IV. ATTRIBUTION</h2>
      <p>Creators receive attribution for their designs unless otherwise agreed.</p>

      <h2>V. TERMINATION</h2>
      <p>Either party may terminate with 30 days notice. Existing licenses remain valid.</p>
        """
    },
    {
        "filename": "19-marketplace-merchant-agreement.html",
        "title": "Marketplace Merchant Agreement",
        "subtitle": "Rules for Selling Through HingeCraft",
        "description": "HingeCraft Global Marketplace Merchant Agreement - Terms and rules for merchants selling products through HingeCraft marketplace",
        "keywords": "HingeCraft, Marketplace Agreement, Merchant Terms, Seller Agreement",
        "content": """
      <h2>MARKETPLACE MERCHANT AGREEMENT</h2>
      <p>This agreement governs your participation as a merchant in the HingeCraft Global marketplace.</p>

      <h2>I. MERCHANT OBLIGATIONS</h2>
      <ul>
        <li>Provide accurate product information</li>
        <li>Maintain product quality standards</li>
        <li>Fulfill orders promptly</li>
        <li>Handle customer service</li>
        <li>Comply with applicable laws</li>
      </ul>

      <h2>II. PRODUCT REQUIREMENTS</h2>
      <ul>
        <li>Meet safety standards</li>
        <li>Accurate descriptions</li>
        <li>High-quality images</li>
        <li>Compliance with regulations</li>
      </ul>

      <h2>III. FEES AND COMMISSIONS</h2>
      <ul>
        <li>Transaction fees: 5-10% per sale</li>
        <li>Listing fees: As specified</li>
        <li>Payment processing: Additional fees may apply</li>
      </ul>

      <h2>IV. PAYMENT TERMS</h2>
      <p>Payments processed within 14 days of order completion, minus fees and any refunds.</p>

      <h2>V. PROHIBITED ITEMS</h2>
      <p>Merchants may not sell:</p>
      <ul>
        <li>Illegal products</li>
        <li>Weapons or harmful items</li>
        <li>Counterfeit goods</li>
        <li>Items violating intellectual property</li>
      </ul>
        """
    },
    {
        "filename": "20-manufacturing-production-agreement.html",
        "title": "Manufacturing & Production Agreement",
        "subtitle": "For Print Partners and Microfactories",
        "description": "HingeCraft Global Manufacturing & Production Agreement - Agreement for print partners and microfactories",
        "keywords": "HingeCraft, Manufacturing Agreement, Production Agreement, Microfactory, Print Partner",
        "content": """
      <h2>MANUFACTURING & PRODUCTION AGREEMENT</h2>
      <p>This agreement governs manufacturing partnerships with print partners and microfactories.</p>

      <h2>I. PARTNER OBLIGATIONS</h2>
      <ul>
        <li>Meet quality standards</li>
        <li>Maintain production capacity</li>
        <li>Comply with safety regulations</li>
        <li>Protect intellectual property</li>
        <li>Report production issues</li>
      </ul>

      <h2>II. QUALITY STANDARDS</h2>
      <ul>
        <li>Material specifications</li>
        <li>Dimensional accuracy</li>
        <li>Finish quality</li>
        <li>Packaging requirements</li>
      </ul>

      <h2>III. INTELLECTUAL PROPERTY</h2>
      <p>Partners agree to:</p>
      <ul>
        <li>Protect design confidentiality</li>
        <li>Not reproduce designs without authorization</li>
        <li>Return or destroy designs upon termination</li>
      </ul>

      <h2>IV. PRICING AND PAYMENT</h2>
      <p>Pricing terms specified in individual agreements. Payment terms typically net 30 days.</p>

      <h2>V. TERMINATION</h2>
      <p>Either party may terminate with 60 days notice or immediately for material breach.</p>
        """
    },
    {
        "filename": "21-attribution-distribution-derivative-rights.html",
        "title": "Attribution, Distribution & Derivative Rights Policy",
        "subtitle": "Controls Remix, Resale, and Commercial Usage",
        "description": "HingeCraft Global Attribution, Distribution & Derivative Rights Policy - Policy governing remix, resale, and commercial usage rights",
        "keywords": "HingeCraft, Attribution Policy, Derivative Rights, Remix Rights, Commercial Usage",
        "content": """
      <h2>ATTRIBUTION, DISTRIBUTION & DERIVATIVE RIGHTS POLICY</h2>
      <p>This policy defines rights for attribution, distribution, and creation of derivative works from HingeCraft Global designs.</p>

      <h2>I. ATTRIBUTION REQUIREMENTS</h2>
      <p>When using designs, users must:</p>
      <ul>
        <li>Credit the original creator</li>
        <li>Include HingeCraft Global attribution when required</li>
        <li>Maintain attribution in derivative works</li>
      </ul>

      <h2>II. DISTRIBUTION RIGHTS</h2>
      
      <h3>2.1 Personal Use</h3>
      <p>Users may distribute designs for personal, non-commercial use.</p>

      <h3>2.2 Commercial Distribution</h3>
      <p>Commercial distribution requires:</p>
      <ul>
        <li>Appropriate license</li>
        <li>Creator attribution</li>
        <li>Compliance with license terms</li>
      </ul>

      <h2>III. DERIVATIVE WORKS</h2>
      
      <h3>3.1 Remix Rights</h3>
      <p>Remix rights depend on license type:</p>
      <ul>
        <li><strong>Open License:</strong> Remix allowed with attribution</li>
        <li><strong>Restricted License:</strong> Remix requires permission</li>
        <li><strong>Commercial License:</strong> Terms specified</li>
      </ul>

      <h3>3.2 Derivative Attribution</h3>
      <p>Derivative works must attribute both original creator and derivative creator.</p>

      <h2>IV. RESALE RIGHTS</h2>
      <p>Resale of physical products generally allowed. Resale of digital designs subject to license terms.</p>

      <h2>V. COMMERCIAL USAGE</h2>
      <p>Commercial usage requires appropriate license. Contact licensing@hingecraft-global.ai for commercial licensing.</p>
        """
    },
    {
        "filename": "22-digital-asset-nft-ownership.html",
        "title": "Digital Asset and NFT Ownership Contract",
        "subtitle": "Optional - If Tokenization or Blockchain Integration",
        "description": "HingeCraft Global Digital Asset and NFT Ownership Contract - Contract governing digital asset and NFT ownership and tokenization",
        "keywords": "HingeCraft, NFT, Digital Asset, Blockchain, Tokenization, Smart Contract",
        "content": """
      <h2>DIGITAL ASSET AND NFT OWNERSHIP CONTRACT</h2>
      <p>This contract governs ownership and rights for digital assets and NFTs (Non-Fungible Tokens) on the HingeCraft Global platform.</p>

      <h2>I. NFT DEFINITION</h2>
      <p>NFTs represent ownership of digital assets, including designs, artwork, and other digital content.</p>

      <h2>II. OWNERSHIP RIGHTS</h2>
      <p>NFT ownership grants:</p>
      <ul>
        <li>Ownership of the NFT token</li>
        <li>Rights specified in the smart contract</li>
        <li>Display and personal use rights</li>
        <li>Transfer and resale rights</li>
      </ul>

      <h2>III. INTELLECTUAL PROPERTY</h2>
      <p>NFT ownership does not necessarily grant:</p>
      <ul>
        <li>Copyright ownership</li>
        <li>Commercial usage rights</li>
        <li>Modification rights</li>
        <li>Exclusive rights</li>
      </ul>
      <p>Specific rights depend on the smart contract and underlying license.</p>

      <h2>IV. TRANSFER AND RESALE</h2>
      <p>NFTs may be transferred and resold subject to:</p>
      <ul>
        <li>Smart contract terms</li>
        <li>Platform policies</li>
        <li>Applicable laws</li>
        <li>Royalty obligations</li>
      </ul>

      <h2>V. ROYALTIES</h2>
      <p>Resales may include creator royalties as specified in the smart contract.</p>

      <h2>VI. DISCLAIMERS</h2>
      <p>NFTs are provided "as is." HingeCraft Global makes no warranties regarding value, functionality, or future utility.</p>
        """
    },
    # Hardware & Physical Product Legal (3 docs)
    {
        "filename": "23-product-liability-safety-disclosure.html",
        "title": "Product Liability & Safety Disclosure",
        "subtitle": "Required for Any Product Users Sit/Stand On",
        "description": "HingeCraft Global Product Liability & Safety Disclosure - Liability and safety information for physical products, especially furniture",
        "keywords": "HingeCraft, Product Liability, Safety Disclosure, Product Safety, Furniture Safety",
        "content": """
      <h2>PRODUCT LIABILITY & SAFETY DISCLOSURE</h2>
      <p>This disclosure addresses product liability and safety considerations for HingeCraft Global physical products, particularly furniture and items users sit or stand on.</p>

      <h2>I. PRODUCT SAFETY STANDARDS</h2>
      <p>Our products comply with:</p>
      <ul>
        <li>Applicable safety regulations</li>
        <li>Industry standards</li>
        <li>Load-bearing requirements</li>
        <li>Material safety standards</li>
      </ul>

      <h2>II. SAFETY WARNINGS</h2>
      <p>Users must:</p>
      <ul>
        <li>Follow assembly instructions</li>
        <li>Use products as intended</li>
        <li>Check weight capacity</li>
        <li>Inspect products regularly</li>
        <li>Not exceed recommended limits</li>
      </ul>

      <h2>III. LIABILITY LIMITATIONS</h2>
      <p>HingeCraft Global's liability is limited to:</p>
      <ul>
        <li>Product replacement or repair</li>
        <li>Refund of purchase price</li>
        <li>As permitted by applicable law</li>
      </ul>
      <p>We are not liable for:</p>
      <ul>
        <li>Misuse or modification</li>
        <li>Consequential damages</li>
        <li>Injury from improper use</li>
      </ul>

      <h2>IV. RECALL PROCEDURES</h2>
      <p>In the event of a safety issue, we will:</p>
      <ul>
        <li>Notify affected customers</li>
        <li>Provide repair or replacement</li>
        <li>Coordinate recalls if necessary</li>
      </ul>

      <h2>V. REPORTING SAFETY ISSUES</h2>
      <p>Report safety concerns to: <a href="mailto:safety@hingecraft-global.ai">safety@hingecraft-global.ai</a></p>
        """
    },
    {
        "filename": "24-warranty-repair-policy.html",
        "title": "Warranty & Repair Policy",
        "subtitle": "Time-Based Coverage for Physical Items",
        "description": "HingeCraft Global Warranty & Repair Policy - Warranty coverage and repair procedures for physical products",
        "keywords": "HingeCraft, Warranty Policy, Repair Policy, Product Warranty",
        "content": """
      <h2>WARRANTY & REPAIR POLICY</h2>
      <p>This policy outlines warranty coverage and repair procedures for HingeCraft Global physical products.</p>

      <h2>I. WARRANTY COVERAGE</h2>
      
      <h3>1.1 Standard Warranty</h3>
      <ul>
        <li><strong>Duration:</strong> 1 year from purchase</li>
        <li><strong>Coverage:</strong> Defects in materials and workmanship</li>
        <li><strong>Remedy:</strong> Repair or replacement</li>
      </ul>

      <h3>1.2 Extended Warranty</h3>
      <ul>
        <li><strong>Duration:</strong> 2-3 years (as purchased)</li>
        <li><strong>Coverage:</strong> Extended protection</li>
        <li><strong>Remedy:</strong> Repair, replacement, or refund</li>
      </ul>

      <h2>II. WARRANTY EXCLUSIONS</h2>
      <p>Warranty does not cover:</p>
      <ul>
        <li>Normal wear and tear</li>
        <li>Damage from misuse</li>
        <li>Modifications or unauthorized repairs</li>
        <li>Acts of nature</li>
        <li>Cosmetic damage</li>
      </ul>

      <h2>III. WARRANTY CLAIMS</h2>
      <p>To make a warranty claim:</p>
      <ol>
        <li>Contact customer service</li>
        <li>Provide proof of purchase</li>
        <li>Describe the issue</li>
        <li>Provide photos if requested</li>
        <li>Follow return instructions</li>
      </ol>

      <h2>IV. REPAIR SERVICES</h2>
      <p>Repair services available for:</p>
      <ul>
        <li>Warranty-covered defects</li>
        <li>Out-of-warranty repairs (fee applies)</li>
        <li>Damage assessment</li>
      </ul>

      <h2>V. REPLACEMENT POLICY</h2>
      <p>If repair is not feasible, we will replace the product with the same or equivalent item.</p>
        """
    },
    {
        "filename": "25-materials-sourcing-ethical-compliance.html",
        "title": "Materials Sourcing & Ethical Compliance Agreement",
        "subtitle": "Recycled Materials and Sustainability Claims Compliance",
        "description": "HingeCraft Global Materials Sourcing & Ethical Compliance Agreement - Agreement ensuring ethical sourcing and sustainability compliance",
        "keywords": "HingeCraft, Ethical Sourcing, Sustainability, Recycled Materials, Supply Chain Ethics",
        "content": """
      <h2>MATERIALS SOURCING & ETHICAL COMPLIANCE AGREEMENT</h2>
      <p>This agreement ensures ethical sourcing, sustainability, and compliance with recycled materials and sustainability claims.</p>

      <h2>I. ETHICAL SOURCING COMMITMENTS</h2>
      <ul>
        <li>No forced or child labor</li>
        <li>Fair wages and working conditions</li>
        <li>Environmental protection</li>
        <li>Supply chain transparency</li>
        <li>Regular audits</li>
      </ul>

      <h2>II. SUSTAINABILITY STANDARDS</h2>
      
      <h3>2.1 Recycled Materials</h3>
      <p>We prioritize:</p>
      <ul>
        <li>Post-consumer recycled content</li>
        <li>Recyclable materials</li>
        <li>Circular economy principles</li>
        <li>Waste reduction</li>
      </ul>

      <h3>2.2 Sustainability Claims</h3>
      <p>All sustainability claims are:</p>
      <ul>
        <li>Verified and documented</li>
        <li>Compliant with FTC Green Guides</li>
        <li>Accurate and not misleading</li>
        <li>Third-party verified when applicable</li>
      </ul>

      <h2>III. SUPPLY CHAIN DUE DILIGENCE</h2>
      <ul>
        <li>Supplier audits</li>
        <li>Material traceability</li>
        <li>Certification verification</li>
        <li>Continuous improvement</li>
      </ul>

      <h2>IV. COMPLIANCE</h2>
      <p>We comply with:</p>
      <ul>
        <li>FTC Green Guides</li>
        <li>Recycled content standards</li>
        <li>Environmental regulations</li>
        <li>Labor standards</li>
      </ul>

      <h2>V. REPORTING</h2>
      <p>Annual sustainability reports available upon request.</p>
        """
    },
    # Membership & Community Governance (3 docs)
    {
        "filename": "26-membership-terms-rights.html",
        "title": "Membership Terms & Rights",
        "subtitle": "Access Levels, Perks, Cancellation",
        "description": "HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies",
        "keywords": "HingeCraft, Membership Terms, Membership Rights, Access Levels, Cancellation Policy",
        "content": """
      <h2>MEMBERSHIP TERMS & RIGHTS</h2>
      <p>This document outlines membership terms, access levels, benefits, and cancellation policies for HingeCraft Global members.</p>

      <h2>I. MEMBERSHIP TIERS</h2>
      
      <h3>1.1 Basic Membership</h3>
      <ul>
        <li>Free access to basic features</li>
        <li>Limited design storage</li>
        <li>Community access</li>
        <li>Basic support</li>
      </ul>

      <h3>1.2 Premium Membership</h3>
      <ul>
        <li>All basic features</li>
        <li>Unlimited design storage</li>
        <li>Advanced AI tools</li>
        <li>Priority support</li>
        <li>Exclusive content</li>
      </ul>

      <h3>1.3 Enterprise Membership</h3>
      <ul>
        <li>All premium features</li>
        <li>Custom integrations</li>
        <li>Dedicated support</li>
        <li>Volume discounts</li>
        <li>SLA guarantees</li>
      </ul>

      <h2>II. MEMBER RIGHTS</h2>
      <ul>
        <li>Access to platform features per tier</li>
        <li>Data privacy and control</li>
        <li>Fair treatment</li>
        <li>Dispute resolution</li>
        <li>Account cancellation</li>
      </ul>

      <h2>III. MEMBER OBLIGATIONS</h2>
      <ul>
        <li>Comply with Terms of Service</li>
        <li>Maintain account security</li>
        <li>Pay fees when due</li>
        <li>Respect other members</li>
      </ul>

      <h2>IV. CANCELLATION</h2>
      
      <h3>4.1 Cancellation Rights</h3>
      <p>Members may cancel at any time through account settings or by contacting support.</p>

      <h3>4.2 Refund Policy</h3>
      <p>Refunds provided per our Refund Policy. Annual memberships may be prorated.</p>

      <h3>4.3 Effect of Cancellation</h3>
      <p>Upon cancellation:</p>
      <ul>
        <li>Access continues until period end</li>
        <li>Data available for export</li>
        <li>No further charges</li>
      </ul>
        """
    },
    {
        "filename": "27-community-code-of-conduct.html",
        "title": "Community Code of Conduct",
        "subtitle": "Gen-Z Aligned Rules, Moderation, Safety",
        "description": "HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines",
        "keywords": "HingeCraft, Code of Conduct, Community Rules, Moderation, Community Safety",
        "content": """
      <h2>COMMUNITY CODE OF CONDUCT</h2>
      <p>This Code of Conduct establishes expectations for respectful, inclusive, and safe participation in the HingeCraft Global community.</p>

      <h2>I. OUR VALUES</h2>
      <ul>
        <li><strong>Respect:</strong> Treat everyone with dignity</li>
        <li><strong>Inclusion:</strong> Welcome diverse perspectives</li>
        <li><strong>Safety:</strong> Create safe spaces</li>
        <li><strong>Integrity:</strong> Be honest and authentic</li>
        <li><strong>Collaboration:</strong> Work together constructively</li>
      </ul>

      <h2>II. EXPECTED BEHAVIOR</h2>
      <ul>
        <li>Be respectful and kind</li>
        <li>Listen to different viewpoints</li>
        <li>Give constructive feedback</li>
        <li>Help others learn</li>
        <li>Celebrate diversity</li>
        <li>Take responsibility for your actions</li>
      </ul>

      <h2>III. PROHIBITED BEHAVIOR</h2>
      <p>Do not:</p>
      <ul>
        <li>Harass, bully, or threaten</li>
        <li>Discriminate or use hate speech</li>
        <li>Share harmful or illegal content</li>
        <li>Spam or self-promote excessively</li>
        <li>Impersonate others</li>
        <li>Violate privacy</li>
      </ul>

      <h2>IV. MODERATION</h2>
      <p>Moderators may:</p>
      <ul>
        <li>Remove violating content</li>
        <li>Warn or suspend accounts</li>
        <li>Ban repeat offenders</li>
        <li>Report to authorities when necessary</li>
      </ul>

      <h2>V. REPORTING</h2>
      <p>Report violations to: <a href="mailto:community@hingecraft-global.ai">community@hingecraft-global.ai</a></p>
      <p>All reports are reviewed confidentially.</p>

      <h2>VI. CONSEQUENCES</h2>
      <p>Violations may result in:</p>
      <ul>
        <li>Warning</li>
        <li>Temporary suspension</li>
        <li>Permanent ban</li>
        <li>Legal action if warranted</li>
      </ul>
        """
    },
    {
        "filename": "28-academic-integrity-institutional-use.html",
        "title": "Academic Integrity & Institutional Use Policy",
        "subtitle": "Required for School Deployment & FERPA Adjacency",
        "description": "HingeCraft Global Academic Integrity & Institutional Use Policy - Policy for educational institutions and FERPA compliance",
        "keywords": "HingeCraft, Academic Integrity, FERPA, Educational Use, Institutional Policy",
        "content": """
      <h2>ACADEMIC INTEGRITY & INSTITUTIONAL USE POLICY</h2>
      <p>This policy addresses academic integrity and institutional use requirements for educational institutions using HingeCraft Global.</p>

      <h2>I. ACADEMIC INTEGRITY</h2>
      
      <h3>1.1 Original Work</h3>
      <p>Students must:</p>
      <ul>
        <li>Create original designs</li>
        <li>Properly attribute sources</li>
        <li>Follow institutional policies</li>
        <li>Not plagiarize or cheat</li>
      </ul>

      <h3>1.2 Collaboration</h3>
      <p>Collaboration is encouraged but must:</p>
      <ul>
        <li>Follow institutional guidelines</li>
        <li>Be properly attributed</li>
        <li>Not violate academic policies</li>
      </ul>

      <h2>II. INSTITUTIONAL USE</h2>
      
      <h3>2.1 Educational License</h3>
      <p>Educational institutions receive:</p>
      <ul>
        <li>Volume discounts</li>
        <li>Educational features</li>
        <li>Administrative controls</li>
        <li>FERPA-compliant handling</li>
      </ul>

      <h3>2.2 Student Data Protection</h3>
      <p>We comply with:</p>
      <ul>
        <li>FERPA requirements</li>
        <li>COPPA for students under 13</li>
        <li>Institutional data agreements</li>
        <li>Privacy protections</li>
      </ul>

      <h2>III. FERPA COMPLIANCE</h2>
      <ul>
        <li>Limited disclosure of student records</li>
        <li>Parental access rights</li>
        <li>Secure data handling</li>
        <li>Institutional consent</li>
      </ul>

      <h2>IV. INSTITUTIONAL RESPONSIBILITIES</h2>
      <ul>
        <li>Monitor student use</li>
        <li>Enforce academic integrity</li>
        <li>Provide student support</li>
        <li>Report violations</li>
      </ul>
        """
    },
    # Movement & Charter Framework (2 docs)
    {
        "filename": "31-charter-of-abundance-resilience-governance.html",
        "title": "Charter of Abundance & Resilience – Governance Treaty",
        "subtitle": "Public-Facing Legal Declaration of Mission",
        "description": "HingeCraft Global Charter of Abundance & Resilience Governance Treaty - Public-facing legal declaration of mission and governance principles",
        "keywords": "HingeCraft, Charter of Abundance, Resilience, Governance Treaty, Mission Statement",
        "content": """
      <h2>CHARTER OF ABUNDANCE & RESILIENCE</h2>
      <p>This Governance Treaty is a public-facing legal declaration of HingeCraft Global's mission to build resilient systems that protect communities and create sustainable abundance for all.</p>

      <h2>I. MISSION STATEMENT</h2>
      <p>We commit to designing institutions, systems, and technologies that:</p>
      <ul>
        <li>Produce abundance without fragility</li>
        <li>Protect communities from cascading collapse</li>
        <li>Enable equitable access to tools and knowledge</li>
        <li>Support sustainable manufacturing</li>
        <li>Empower future generations</li>
      </ul>

      <h2>II. RESILIENCE PRINCIPLES</h2>
      
      <h3>2.1 Systems Resilience</h3>
      <ul>
        <li>Diversified supply chains</li>
        <li>Localized production</li>
        <li>Redundant systems</li>
        <li>Rapid recovery capabilities</li>
      </ul>

      <h3>2.2 Economic Resilience</h3>
      <ul>
        <li>Worker protection and retraining</li>
        <li>Fair compensation</li>
        <li>Community investment</li>
        <li>Sustainable business models</li>
      </ul>

      <h2>III. ABUNDANCE COMMITMENT</h2>
      <ul>
        <li>Open access to tools</li>
        <li>Knowledge sharing</li>
        <li>Resource efficiency</li>
        <li>Waste reduction</li>
        <li>Circular economy</li>
      </ul>

      <h2>IV. GOVERNANCE FRAMEWORK</h2>
      <ul>
        <li>Transparent decision-making</li>
        <li>Stakeholder engagement</li>
        <li>Mission preservation</li>
        <li>Ethical oversight</li>
      </ul>

      <h2>V. GLOBAL IMPACT</h2>
      <p>This Charter aligns with:</p>
      <ul>
        <li>United Nations Sustainable Development Goals</li>
        <li>Global resilience initiatives</li>
        <li>Climate action commitments</li>
        <li>Human rights principles</li>
      </ul>
        """
    },
    {
        "filename": "32-pledge-participation-collective-impact.html",
        "title": "Pledge, Participation, & Collective Impact Agreement",
        "subtitle": "Converts Passive Users → Active Movement Participants",
        "description": "HingeCraft Global Pledge, Participation & Collective Impact Agreement - Agreement converting users into active movement participants",
        "keywords": "HingeCraft, Pledge Agreement, Participation Agreement, Collective Impact, Movement Participation",
        "content": """
      <h2>PLEDGE, PARTICIPATION & COLLECTIVE IMPACT AGREEMENT</h2>
      <p>This agreement transforms passive users into active participants in the Charter of Abundance & Resilience movement.</p>

      <h2>I. THE PLEDGE</h2>
      <p>By participating, you pledge to:</p>
      <ul>
        <li>Support resilient systems</li>
        <li>Promote sustainable practices</li>
        <li>Share knowledge and tools</li>
        <li>Protect communities</li>
        <li>Advance abundance for all</li>
      </ul>

      <h2>II. PARTICIPATION LEVELS</h2>
      
      <h3>2.1 Individual Participation</h3>
      <ul>
        <li>Sign the Charter</li>
        <li>Share your commitment</li>
        <li>Engage with the community</li>
        <li>Contribute to discussions</li>
      </ul>

      <h3>2.2 Community Participation</h3>
      <ul>
        <li>Organize local events</li>
        <li>Create educational content</li>
        <li>Mentor others</li>
        <li>Advocate for change</li>
      </ul>

      <h3>2.3 Institutional Participation</h3>
      <ul>
        <li>Adopt resilience principles</li>
        <li>Implement sustainable practices</li>
        <li>Support the movement</li>
        <li>Partner with HingeCraft</li>
      </ul>

      <h2>III. COLLECTIVE IMPACT</h2>
      <p>Together, we create impact through:</p>
      <ul>
        <li>Amplified voice</li>
        <li>Policy influence</li>
        <li>Systemic change</li>
        <li>Global movement</li>
      </ul>

      <h2>IV. COMMITMENTS</h2>
      <p>HingeCraft Global commits to:</p>
      <ul>
        <li>Transparent reporting</li>
        <li>Stakeholder engagement</li>
        <li>Mission preservation</li>
        <li>Continuous improvement</li>
      </ul>

      <h2>V. MEASUREMENT</h2>
      <p>Impact is measured through:</p>
      <ul>
        <li>Participation metrics</li>
        <li>Policy changes</li>
        <li>System improvements</li>
        <li>Community growth</li>
      </ul>
        """
    },
    # International Deployment (2 docs)
    {
        "filename": "29-global-compliance-framework.html",
        "title": "Global Compliance Framework",
        "subtitle": "Mapping Regulations Across Jurisdictions",
        "description": "HingeCraft Global Compliance Framework - Comprehensive mapping of regulations and compliance requirements across jurisdictions",
        "keywords": "HingeCraft, Global Compliance, Regulatory Framework, International Regulations, Compliance Mapping",
        "content": """
      <h2>GLOBAL COMPLIANCE FRAMEWORK</h2>
      <p>This framework maps regulatory requirements and compliance obligations across all jurisdictions where HingeCraft Global operates.</p>

      <h2>I. REGULATORY MAPPING</h2>
      
      <h3>1.1 Data Protection</h3>
      <ul>
        <li><strong>EU:</strong> GDPR compliance</li>
        <li><strong>US:</strong> CCPA, state privacy laws</li>
        <li><strong>UK:</strong> UK GDPR</li>
        <li><strong>Other:</strong> Local data protection laws</li>
      </ul>

      <h3>1.2 Consumer Protection</h3>
      <ul>
        <li>Product safety standards</li>
        <li>Warranty requirements</li>
        <li>Return and refund rights</li>
        <li>Advertising standards</li>
      </ul>

      <h3>1.3 Intellectual Property</h3>
      <ul>
        <li>Copyright laws</li>
        <li>Patent regulations</li>
        <li>Trademark protection</li>
        <li>Trade secret laws</li>
      </ul>

      <h2>II. JURISDICTION-SPECIFIC REQUIREMENTS</h2>
      
      <h3>2.1 European Union</h3>
      <ul>
        <li>GDPR compliance</li>
        <li>EU AI Act</li>
        <li>Product safety directives</li>
        <li>Consumer rights directives</li>
      </ul>

      <h3>2.2 United States</h3>
      <ul>
        <li>Federal and state regulations</li>
        <li>COPPA for children</li>
        <li>FTC guidelines</li>
        <li>Export controls</li>
      </ul>

      <h3>2.3 Other Jurisdictions</h3>
      <p>Compliance with local laws in all operating jurisdictions.</p>

      <h2>III. COMPLIANCE PROGRAM</h2>
      <ul>
        <li>Regular compliance audits</li>
        <li>Legal review processes</li>
        <li>Training programs</li>
        <li>Monitoring and reporting</li>
      </ul>

      <h2>IV. UPDATES</h2>
      <p>This framework is updated regularly to reflect regulatory changes.</p>
        """
    },
    {
        "filename": "30-cross-border-data-transfer-hosting.html",
        "title": "Cross-Border Data Transfer & Hosting Agreement",
        "subtitle": "Required for EU → US Transfers & Multi-Region Scaling",
        "description": "HingeCraft Global Cross-Border Data Transfer & Hosting Agreement - Agreement for EU to US data transfers and multi-region hosting",
        "keywords": "HingeCraft, Data Transfer Agreement, Cross-Border Data, EU-US Transfer, Data Hosting",
        "content": """
      <h2>CROSS-BORDER DATA TRANSFER & HOSTING AGREEMENT</h2>
      <p>This agreement governs cross-border data transfers, particularly EU to US transfers, and multi-region data hosting.</p>

      <h2>I. DATA TRANSFER FRAMEWORK</h2>
      
      <h3>1.1 Legal Basis</h3>
      <p>Transfers are based on:</p>
      <ul>
        <li>Standard Contractual Clauses (SCCs)</li>
        <li>Adequacy decisions</li>
        <li>Appropriate safeguards</li>
        <li>User consent when required</li>
      </ul>

      <h3>1.2 Transfer Mechanisms</h3>
      <ul>
        <li>EU-US Data Privacy Framework</li>
        <li>Standard Contractual Clauses</li>
        <li>Binding Corporate Rules</li>
        <li>Other approved mechanisms</li>
      </ul>

      <h2>II. DATA HOSTING</h2>
      
      <h3>2.1 Hosting Locations</h3>
      <p>Data may be hosted in:</p>
      <ul>
        <li>United States</li>
        <li>European Union</li>
        <li>Other regions as specified</li>
      </ul>

      <h3>2.2 Data Localization</h3>
      <p>Where required by law, data is localized to specific jurisdictions.</p>

      <h2>III. SAFEGUARDS</h2>
      <ul>
        <li>Encryption in transit and at rest</li>
        <li>Access controls</li>
        <li>Audit logs</li>
        <li>Security assessments</li>
      </ul>

      <h2>IV. USER RIGHTS</h2>
      <p>Users maintain rights to:</p>
      <ul>
        <li>Access their data</li>
        <li>Request data portability</li>
        <li>Request deletion</li>
        <li>Object to processing</li>
      </ul>

      <h2>V. NOTIFICATION</h2>
      <p>Users are notified of data transfers and hosting locations through our Privacy Policy.</p>
        """
    },
]

def generate_page(page_data):
    """Generate a single legal page"""
    content = HTML_TEMPLATE.format(
        title=page_data["title"],
        subtitle=page_data["subtitle"],
        description=page_data["description"],
        keywords=page_data["keywords"],
        content=page_data["content"]
    )
    
    filepath = LEGAL_DIR / page_data["filename"]
    filepath.write_text(content, encoding='utf-8')
    print(f"Generated: {filepath.name}")

def main():
    """Generate all legal pages"""
    LEGAL_DIR.mkdir(exist_ok=True)
    
    for page in LEGAL_PAGES:
        generate_page(page)
    
    print(f"\n✅ Generated {len(LEGAL_PAGES)} legal pages")
    print(f"📁 Location: {LEGAL_DIR}")

if __name__ == "__main__":
    main()

