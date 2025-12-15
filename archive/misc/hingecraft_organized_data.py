"""
HingeCraft Global - Complete Organized Data
============================================================

This file contains ALL HingeCraft data organized by project.
Generated automatically by organize_all_hingecraft_data.py
Generated: 2025-12-10T09:01:41.548975
"""

from typing import Dict, List, Any
from dataclasses import dataclass


# ============================================
# HINGECRAFT PROJECTS
# ============================================

HINGECRAFT_PROJECTS = {
    "database_system": {
        "name": 'Database System',
        "description": """The core database system for HingeCraft Global. This project includes:
                - PostgreSQL database with 10-layer master schema
                - 50+ database tables covering all aspects of the platform
                - Enterprise security modules
                - Governance and compliance tables
                - RAG knowledge base integration
                - Complete data migration and management tools
                
                This is the foundation of all HingeCraft data storage and retrieval.""",
        "category": 'Infrastructure',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['donations', 'members', 'chat_clubs', 'chat_messages', 'ambassadors', 'contribution_intents', 'crypto_payments', 'webhook_logs', 'kyc_verifications'],
        "components": [
            {
                "name": 'Master Schema',
                "description": 'Core database schema with all base tables',
                "files": ['database/init.sql', 'database/master_schema/'],
                "status": 'complete',
            },
            {
                "name": 'Enterprise Security',
                "description": 'Security modules and access control',
                "files": ['database/security/'],
                "status": 'complete',
            },
            {
                "name": 'Governance',
                "description": 'Governance, RBAC, and compliance tables',
                "files": ['database/governance/'],
                "status": 'complete',
            },
            {
                "name": 'RAG Knowledge Base',
                "description": 'RAG knowledge base integration',
                "files": ['database/rag_knowledge_base/'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "donations": {
                        "record_count": 3,
                        "description": "Stores all donation transactions with payment details, amounts, and member information",
                        "schema_keys": [
                                    "Wix"
                        ]
            },
            "members": {
                        "record_count": 2,
                        "description": "Member registry with charter members and lifetime registry members, including twin names",
                        "schema_keys": []
            },
            "chat_clubs": {
                        "record_count": 1,
                        "description": "Chat clubs/groups for community engagement",
                        "schema_keys": []
            },
            "chat_messages": {
                        "record_count": 1,
                        "description": "Chat messages from community members",
                        "schema_keys": []
            },
            "ambassadors": {
                        "record_count": 0,
                        "description": "Ambassador program participants and their campaigns",
                        "schema_keys": []
            },
            "contribution_intents": {
                        "record_count": 0,
                        "description": "Contribution intent data from Mission Support form and payment flows",
                        "schema_keys": []
            },
            "crypto_payments": {
                        "record_count": 0,
                        "description": "NOWPayments crypto payment invoices and transactions",
                        "schema_keys": []
            },
            "webhook_logs": {
                        "record_count": 0,
                        "description": "All webhook events for audit and debugging",
                        "schema_keys": []
            },
            "kyc_verifications": {
                        "record_count": 0,
                        "description": "KYC/AML verification tracking and compliance",
                        "schema_keys": []
            }
},
    },
    "agents_system": {
        "name": 'Agents System',
        "description": """AI Agent System with 6 specialized agents for HingeCraft Global:
                
                1. Legal Agent - Handles legal document analysis, compliance checking,
                   regulatory tracking, contract review, and policy generation
                2. Marketing Agent - Manages campaigns, brand voice, social content,
                   email campaigns, and blog generation
                3. Engineering Agent - Code generation, architecture design, bug detection,
                   documentation, and AI code completion
                4. Education Agent - Educational content creation and management
                5. Community Agent - Community engagement and management
                6. Crypto/Compliance Agent - KYC/AML processing, transaction monitoring,
                   compliance reporting, treasury management, and blockchain integration
                
                Total: 600 agent tasks across all agents""",
        "category": 'AI/ML',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": [],
        "components": [
            {
                "name": 'Legal Agent',
                "description": 'Legal document analysis and compliance',
                "files": ['agents/legal/'],
                "status": 'in_progress',
            },
            {
                "name": 'Marketing Agent',
                "description": 'Marketing campaigns and content',
                "files": ['agents/marketing/'],
                "status": 'in_progress',
            },
            {
                "name": 'Engineering Agent',
                "description": 'Code generation and architecture',
                "files": ['agents/engineering/'],
                "status": 'in_progress',
            },
            {
                "name": 'Education Agent',
                "description": 'Educational content creation',
                "files": ['agents/education/'],
                "status": 'in_progress',
            },
            {
                "name": 'Community Agent',
                "description": 'Community engagement',
                "files": ['agents/community/'],
                "status": 'in_progress',
            },
            {
                "name": 'Crypto/Compliance Agent',
                "description": 'KYC/AML and compliance',
                "files": ['agents/crypto_compliance/'],
                "status": 'in_progress',
            },
        ],
        "data_summary": {},
    },
    "api_system": {
        "name": 'API System',
        "description": """FastAPI-based REST API system for HingeCraft Global:
                
                - Auth Router: Authentication and authorization
                - Donations Router: Donation processing and management
                - Webhooks Router: Webhook handling (Stripe, NOWPayments)
                - Admin Router: Administrative functions
                - Compliance Router: Compliance and KYC endpoints
                - Wallets Router: Crypto wallet management
                - Receipts Router: Receipt generation and management
                - Wix Router: Wix platform integration
                
                Includes middleware, authentication, database connections, and Celery workers.""",
        "category": 'Backend',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['donations', 'contribution_intents', 'crypto_payments', 'webhook_logs'],
        "components": [
            {
                "name": 'Core API',
                "description": 'Main FastAPI application',
                "files": ['api/main.py', 'api/database.py', 'api/auth.py'],
                "status": 'complete',
            },
            {
                "name": 'Routers',
                "description": 'API route handlers',
                "files": ['api/routers/'],
                "status": 'complete',
            },
            {
                "name": 'Workers',
                "description": 'Celery background workers',
                "files": ['api/workers/'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "donations": {
                        "record_count": 3,
                        "description": "Stores all donation transactions with payment details, amounts, and member information",
                        "schema_keys": [
                                    "Wix"
                        ]
            },
            "contribution_intents": {
                        "record_count": 0,
                        "description": "Contribution intent data from Mission Support form and payment flows",
                        "schema_keys": []
            },
            "crypto_payments": {
                        "record_count": 0,
                        "description": "NOWPayments crypto payment invoices and transactions",
                        "schema_keys": []
            },
            "webhook_logs": {
                        "record_count": 0,
                        "description": "All webhook events for audit and debugging",
                        "schema_keys": []
            }
},
    },
    "security_system": {
        "name": 'Security System',
        "description": """Comprehensive security system with 16 security modules:
                
                - Encryption at Rest/Transit
                - Access Control (RBAC)
                - Intrusion Detection
                - Audit Logging
                - Data Loss Prevention
                - Vulnerability Management
                - Network Security
                - Incident Response
                - Security Monitoring
                - Rate Limiting
                - Query Inspection
                - And more...
                
                Protects all HingeCraft data and systems.""",
        "category": 'Security',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['kyc_verifications', 'webhook_logs'],
        "components": [
            {
                "name": 'Encryption',
                "description": 'Data encryption modules',
                "files": ['database/security/'],
                "status": 'complete',
            },
            {
                "name": 'Access Control',
                "description": 'RBAC and permissions',
                "files": ['database/governance/'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "kyc_verifications": {
                        "record_count": 0,
                        "description": "KYC/AML verification tracking and compliance",
                        "schema_keys": []
            },
            "webhook_logs": {
                        "record_count": 0,
                        "description": "All webhook events for audit and debugging",
                        "schema_keys": []
            }
},
    },
    "wix_integration": {
        "name": 'Wix Integration',
        "description": """Complete Wix platform integration:
                
                - External database adaptor for Wix
                - Velo backend functions
                - Frontend integration
                - Payment page integration
                - Charter page integration
                - Legal pages deployment
                - SEO optimization
                
                Enables HingeCraft to work seamlessly with Wix platform.""",
        "category": 'Integration',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['donations', 'members', 'contribution_intents'],
        "components": [
            {
                "name": 'Backend Functions',
                "description": 'Wix Velo backend functions',
                "files": ['backend-functions/', 'deployment-ready/'],
                "status": 'complete',
            },
            {
                "name": 'Frontend Pages',
                "description": 'Wix frontend pages',
                "files": ['public/', 'src/'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "donations": {
                        "record_count": 3,
                        "description": "Stores all donation transactions with payment details, amounts, and member information",
                        "schema_keys": [
                                    "Wix"
                        ]
            },
            "members": {
                        "record_count": 2,
                        "description": "Member registry with charter members and lifetime registry members, including twin names",
                        "schema_keys": []
            },
            "contribution_intents": {
                        "record_count": 0,
                        "description": "Contribution intent data from Mission Support form and payment flows",
                        "schema_keys": []
            }
},
    },
    "legal_pages": {
        "name": 'Legal Pages System',
        "description": """34 legal compliance pages for HingeCraft Global:
                
                - Privacy Policy
                - Terms of Service
                - Cookie Policy
                - GDPR Compliance
                - CCPA Compliance
                - And 29 more legal pages
                
                All pages are SEO optimized and ready for deployment.""",
        "category": 'Compliance',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": [],
        "components": [
            {
                "name": 'Legal Pages',
                "description": '34 legal compliance pages',
                "files": ['legal-pages/', 'ALL_LEGAL_PAGES_HTML/'],
                "status": 'complete',
            },
        ],
        "data_summary": {},
    },
    "notion_integration": {
        "name": 'Notion Integration',
        "description": """Notion workspace integration for HingeCraft:
                
                - Database synchronization
                - Project management
                - Dashboard creation
                - Automation workflows
                - Webhook handlers
                
                Provides project management and collaboration tools.""",
        "category": 'Integration',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": [],
        "components": [
            {
                "name": 'Notion Sync',
                "description": 'Database synchronization',
                "files": ['notion/sync/'],
                "status": 'complete',
            },
            {
                "name": 'Notion Dashboard',
                "description": 'Project dashboard',
                "files": ['notion/'],
                "status": 'complete',
            },
        ],
        "data_summary": {},
    },
    "deployment_system": {
        "name": 'Deployment System',
        "description": """Complete deployment infrastructure:
                
                - Docker containerization
                - CI/CD pipelines
                - Environment management (Dev, Staging, Production)
                - Health checks
                - Monitoring and observability
                - Deployment scripts
                
                Enables reliable deployment across all environments.""",
        "category": 'Infrastructure',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": [],
        "components": [
            {
                "name": 'Docker',
                "description": 'Docker configuration',
                "files": ['database-adaptor/', 'api/Dockerfile'],
                "status": 'complete',
            },
            {
                "name": 'Deployment Scripts',
                "description": 'Deployment automation',
                "files": ['deployment-scripts/', 'scripts/'],
                "status": 'complete',
            },
        ],
        "data_summary": {},
    },
    "monitoring_system": {
        "name": 'Monitoring System',
        "description": """Comprehensive monitoring and observability:
                
                - Performance monitoring
                - Error tracking
                - Usage analytics
                - Security monitoring
                - Health checks
                
                Ensures system reliability and performance.""",
        "category": 'Infrastructure',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['webhook_logs'],
        "components": [
            {
                "name": 'Monitoring',
                "description": 'Monitoring tools',
                "files": ['monitoring/'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "webhook_logs": {
                        "record_count": 0,
                        "description": "All webhook events for audit and debugging",
                        "schema_keys": []
            }
},
    },
    "payment_system": {
        "name": 'Payment System',
        "description": """Complete payment processing system:
                
                - Stripe integration
                - NOWPayments crypto integration
                - Payment page
                - Donation tracking
                - Receipt generation
                - KYC/AML compliance
                
                Handles all payment processing for HingeCraft.""",
        "category": 'Payment',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['donations', 'contribution_intents', 'crypto_payments', 'kyc_verifications', 'webhook_logs'],
        "components": [
            {
                "name": 'Payment Processing',
                "description": 'Payment handlers',
                "files": ['api/routers/donations.py', 'api/routers/webhooks.py'],
                "status": 'complete',
            },
            {
                "name": 'Crypto Payments',
                "description": 'NOWPayments integration',
                "files": ['api/routers/wallets.py'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "donations": {
                        "record_count": 3,
                        "description": "Stores all donation transactions with payment details, amounts, and member information",
                        "schema_keys": [
                                    "Wix"
                        ]
            },
            "contribution_intents": {
                        "record_count": 0,
                        "description": "Contribution intent data from Mission Support form and payment flows",
                        "schema_keys": []
            },
            "crypto_payments": {
                        "record_count": 0,
                        "description": "NOWPayments crypto payment invoices and transactions",
                        "schema_keys": []
            },
            "kyc_verifications": {
                        "record_count": 0,
                        "description": "KYC/AML verification tracking and compliance",
                        "schema_keys": []
            },
            "webhook_logs": {
                        "record_count": 0,
                        "description": "All webhook events for audit and debugging",
                        "schema_keys": []
            }
},
    },
    "member_management": {
        "name": 'Member Management System',
        "description": """Complete member management system:
                
                - Member registry
                - Charter members
                - Membership tracking
                - Member profiles
                - Twin name system
                
                Manages all HingeCraft members and their data.""",
        "category": 'Core',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['members'],
        "components": [
            {
                "name": 'Member Registry',
                "description": 'Member database',
                "files": ['database/init.sql'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "members": {
                        "record_count": 2,
                        "description": "Member registry with charter members and lifetime registry members, including twin names",
                        "schema_keys": []
            }
},
    },
    "community_system": {
        "name": 'Community System',
        "description": """Community engagement system:
                
                - Chat clubs
                - Chat messages
                - Community forums
                - Member interactions
                
                Facilitates community engagement and communication.""",
        "category": 'Community',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['chat_clubs', 'chat_messages'],
        "components": [
            {
                "name": 'Chat System',
                "description": 'Chat clubs and messages',
                "files": ['database/init.sql'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "chat_clubs": {
                        "record_count": 1,
                        "description": "Chat clubs/groups for community engagement",
                        "schema_keys": []
            },
            "chat_messages": {
                        "record_count": 1,
                        "description": "Chat messages from community members",
                        "schema_keys": []
            }
},
    },
    "ambassador_program": {
        "name": 'Ambassador Program',
        "description": """Ambassador program management:
                
                - Ambassador tracking
                - Campaign management
                - Impact metrics
                - Program administration
                
                Manages the HingeCraft ambassador program.""",
        "category": 'Programs',
        "status": 'in_progress',
        "completion_percentage": 20.8,
        "database_tables": ['ambassadors'],
        "components": [
            {
                "name": 'Ambassador Management',
                "description": 'Ambassador tracking',
                "files": ['database/init.sql'],
                "status": 'complete',
            },
        ],
        "data_summary": {
            "ambassadors": {
                        "record_count": 0,
                        "description": "Ambassador program participants and their campaigns",
                        "schema_keys": []
            }
},
    },
}

# ============================================
# DATABASE TABLES
# ============================================

DATABASE_TABLES = {
    "donations": {
        "name": 'donations',
        "description": 'Stores all donation transactions with payment details, amounts, and member information',
        "project_assignment": 'payment_system',
        "record_count": 3,
        "schema_keys": ['Wix'],
    },
    "members": {
        "name": 'members',
        "description": 'Member registry with charter members and lifetime registry members, including twin names',
        "project_assignment": 'member_management',
        "record_count": 2,
        "schema_keys": [],
    },
    "chat_clubs": {
        "name": 'chat_clubs',
        "description": 'Chat clubs/groups for community engagement',
        "project_assignment": 'community_system',
        "record_count": 1,
        "schema_keys": [],
    },
    "chat_messages": {
        "name": 'chat_messages',
        "description": 'Chat messages from community members',
        "project_assignment": 'community_system',
        "record_count": 1,
        "schema_keys": [],
    },
    "ambassadors": {
        "name": 'ambassadors',
        "description": 'Ambassador program participants and their campaigns',
        "project_assignment": 'ambassador_program',
        "record_count": 0,
        "schema_keys": [],
    },
    "contribution_intents": {
        "name": 'contribution_intents',
        "description": 'Contribution intent data from Mission Support form and payment flows',
        "project_assignment": 'payment_system',
        "record_count": 0,
        "schema_keys": [],
    },
    "crypto_payments": {
        "name": 'crypto_payments',
        "description": 'NOWPayments crypto payment invoices and transactions',
        "project_assignment": 'payment_system',
        "record_count": 0,
        "schema_keys": [],
    },
    "webhook_logs": {
        "name": 'webhook_logs',
        "description": 'All webhook events for audit and debugging',
        "project_assignment": 'payment_system',
        "record_count": 0,
        "schema_keys": [],
    },
    "kyc_verifications": {
        "name": 'kyc_verifications',
        "description": 'KYC/AML verification tracking and compliance',
        "project_assignment": 'payment_system',
        "record_count": 0,
        "schema_keys": [],
    },
}

# ============================================
# SUMMARY
# ============================================

ORGANIZATION_SUMMARY = {
    "total_projects": 13,
    "total_database_tables": 9,
    "total_files": 36,
    "total_components": 28,
    "total_database_records": 7,
}
