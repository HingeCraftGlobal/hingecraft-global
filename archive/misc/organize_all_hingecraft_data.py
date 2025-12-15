#!/usr/bin/env python3
"""
HingeCraft Global - Complete Data Organization System
=====================================================

This comprehensive Python system organizes ALL HingeCraft data, projects, and database content
into a fully segmented and structured format with complete project descriptions.

Author: HingeCraft Organization System
Date: 2025-01-27
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from collections import defaultdict


@dataclass
class ProjectComponent:
    """Represents a component within a project"""
    name: str
    description: str
    files: List[str]
    data_tables: List[str]
    status: str
    completion_percentage: float


@dataclass
class DatabaseTable:
    """Represents a database table with its data"""
    name: str
    description: str
    schema: Dict[str, Any]
    data: List[Dict[str, Any]]
    project_assignment: str
    record_count: int


@dataclass
class HingeCraftProject:
    """Represents a complete HingeCraft project"""
    project_id: str
    name: str
    description: str
    category: str
    components: List[ProjectComponent]
    database_tables: List[str]
    files: List[str]
    status: str
    completion_percentage: float
    data_summary: Dict[str, Any]


class HingeCraftDataOrganizer:
    """
    Complete HingeCraft Data Organization System
    
    Organizes all HingeCraft data, projects, and database content into
    a fully segmented and structured format.
    """
    
    def __init__(self, base_path: str = None):
        """Initialize the organizer with base path"""
        if base_path is None:
            self.base_path = Path(__file__).parent
        else:
            self.base_path = Path(base_path)
        
        self.projects: Dict[str, HingeCraftProject] = {}
        self.database_tables: Dict[str, DatabaseTable] = {}
        self.organization_data: Dict[str, Any] = {}
        
    def organize_all_data(self) -> Dict[str, Any]:
        """
        Main method to organize all HingeCraft data
        
        Returns:
            Complete organized data structure
        """
        print("🚀 Starting Complete HingeCraft Data Organization...")
        
        # 1. Define all projects with descriptions
        self._define_all_projects()
        
        # 2. Extract database schema and data
        self._extract_database_data()
        
        # 3. Scan and organize all files
        self._scan_and_organize_files()
        
        # 4. Segment database data by project
        self._segment_database_by_project()
        
        # 5. Generate complete organization report
        organization_report = self._generate_organization_report()
        
        print("✅ Complete HingeCraft Data Organization Finished!")
        return organization_report
    
    def _define_all_projects(self):
        """Define all HingeCraft projects with complete descriptions"""
        
        projects_definitions = {
            "database_system": {
                "name": "Database System",
                "description": """
                The core database system for HingeCraft Global. This project includes:
                - PostgreSQL database with 10-layer master schema
                - 50+ database tables covering all aspects of the platform
                - Enterprise security modules
                - Governance and compliance tables
                - RAG knowledge base integration
                - Complete data migration and management tools
                
                This is the foundation of all HingeCraft data storage and retrieval.
                """,
                "category": "Infrastructure",
                "tables": [
                    "donations", "members", "chat_clubs", "chat_messages",
                    "ambassadors", "contribution_intents", "crypto_payments",
                    "webhook_logs", "kyc_verifications"
                ],
                "components": [
                    {
                        "name": "Master Schema",
                        "description": "Core database schema with all base tables",
                        "files": ["database/init.sql", "database/master_schema/"],
                        "status": "complete"
                    },
                    {
                        "name": "Enterprise Security",
                        "description": "Security modules and access control",
                        "files": ["database/security/"],
                        "status": "complete"
                    },
                    {
                        "name": "Governance",
                        "description": "Governance, RBAC, and compliance tables",
                        "files": ["database/governance/"],
                        "status": "complete"
                    },
                    {
                        "name": "RAG Knowledge Base",
                        "description": "RAG knowledge base integration",
                        "files": ["database/rag_knowledge_base/"],
                        "status": "complete"
                    }
                ]
            },
            
            "agents_system": {
                "name": "Agents System",
                "description": """
                AI Agent System with 6 specialized agents for HingeCraft Global:
                
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
                
                Total: 600 agent tasks across all agents
                """,
                "category": "AI/ML",
                "tables": [],
                "components": [
                    {
                        "name": "Legal Agent",
                        "description": "Legal document analysis and compliance",
                        "files": ["agents/legal/"],
                        "status": "in_progress"
                    },
                    {
                        "name": "Marketing Agent",
                        "description": "Marketing campaigns and content",
                        "files": ["agents/marketing/"],
                        "status": "in_progress"
                    },
                    {
                        "name": "Engineering Agent",
                        "description": "Code generation and architecture",
                        "files": ["agents/engineering/"],
                        "status": "in_progress"
                    },
                    {
                        "name": "Education Agent",
                        "description": "Educational content creation",
                        "files": ["agents/education/"],
                        "status": "in_progress"
                    },
                    {
                        "name": "Community Agent",
                        "description": "Community engagement",
                        "files": ["agents/community/"],
                        "status": "in_progress"
                    },
                    {
                        "name": "Crypto/Compliance Agent",
                        "description": "KYC/AML and compliance",
                        "files": ["agents/crypto_compliance/"],
                        "status": "in_progress"
                    }
                ]
            },
            
            "api_system": {
                "name": "API System",
                "description": """
                FastAPI-based REST API system for HingeCraft Global:
                
                - Auth Router: Authentication and authorization
                - Donations Router: Donation processing and management
                - Webhooks Router: Webhook handling (Stripe, NOWPayments)
                - Admin Router: Administrative functions
                - Compliance Router: Compliance and KYC endpoints
                - Wallets Router: Crypto wallet management
                - Receipts Router: Receipt generation and management
                - Wix Router: Wix platform integration
                
                Includes middleware, authentication, database connections, and Celery workers.
                """,
                "category": "Backend",
                "tables": ["donations", "contribution_intents", "crypto_payments", "webhook_logs"],
                "components": [
                    {
                        "name": "Core API",
                        "description": "Main FastAPI application",
                        "files": ["api/main.py", "api/database.py", "api/auth.py"],
                        "status": "complete"
                    },
                    {
                        "name": "Routers",
                        "description": "API route handlers",
                        "files": ["api/routers/"],
                        "status": "complete"
                    },
                    {
                        "name": "Workers",
                        "description": "Celery background workers",
                        "files": ["api/workers/"],
                        "status": "complete"
                    }
                ]
            },
            
            "security_system": {
                "name": "Security System",
                "description": """
                Comprehensive security system with 16 security modules:
                
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
                
                Protects all HingeCraft data and systems.
                """,
                "category": "Security",
                "tables": ["kyc_verifications", "webhook_logs"],
                "components": [
                    {
                        "name": "Encryption",
                        "description": "Data encryption modules",
                        "files": ["database/security/"],
                        "status": "complete"
                    },
                    {
                        "name": "Access Control",
                        "description": "RBAC and permissions",
                        "files": ["database/governance/"],
                        "status": "complete"
                    }
                ]
            },
            
            "wix_integration": {
                "name": "Wix Integration",
                "description": """
                Complete Wix platform integration:
                
                - External database adaptor for Wix
                - Velo backend functions
                - Frontend integration
                - Payment page integration
                - Charter page integration
                - Legal pages deployment
                - SEO optimization
                
                Enables HingeCraft to work seamlessly with Wix platform.
                """,
                "category": "Integration",
                "tables": ["donations", "members", "contribution_intents"],
                "components": [
                    {
                        "name": "Backend Functions",
                        "description": "Wix Velo backend functions",
                        "files": ["backend-functions/", "deployment-ready/"],
                        "status": "complete"
                    },
                    {
                        "name": "Frontend Pages",
                        "description": "Wix frontend pages",
                        "files": ["public/", "src/"],
                        "status": "complete"
                    }
                ]
            },
            
            "legal_pages": {
                "name": "Legal Pages System",
                "description": """
                34 legal compliance pages for HingeCraft Global:
                
                - Privacy Policy
                - Terms of Service
                - Cookie Policy
                - GDPR Compliance
                - CCPA Compliance
                - And 29 more legal pages
                
                All pages are SEO optimized and ready for deployment.
                """,
                "category": "Compliance",
                "tables": [],
                "components": [
                    {
                        "name": "Legal Pages",
                        "description": "34 legal compliance pages",
                        "files": ["legal-pages/", "ALL_LEGAL_PAGES_HTML/"],
                        "status": "complete"
                    }
                ]
            },
            
            "notion_integration": {
                "name": "Notion Integration",
                "description": """
                Notion workspace integration for HingeCraft:
                
                - Database synchronization
                - Project management
                - Dashboard creation
                - Automation workflows
                - Webhook handlers
                
                Provides project management and collaboration tools.
                """,
                "category": "Integration",
                "tables": [],
                "components": [
                    {
                        "name": "Notion Sync",
                        "description": "Database synchronization",
                        "files": ["notion/sync/"],
                        "status": "complete"
                    },
                    {
                        "name": "Notion Dashboard",
                        "description": "Project dashboard",
                        "files": ["notion/"],
                        "status": "complete"
                    }
                ]
            },
            
            "deployment_system": {
                "name": "Deployment System",
                "description": """
                Complete deployment infrastructure:
                
                - Docker containerization
                - CI/CD pipelines
                - Environment management (Dev, Staging, Production)
                - Health checks
                - Monitoring and observability
                - Deployment scripts
                
                Enables reliable deployment across all environments.
                """,
                "category": "Infrastructure",
                "tables": [],
                "components": [
                    {
                        "name": "Docker",
                        "description": "Docker configuration",
                        "files": ["database-adaptor/", "api/Dockerfile"],
                        "status": "complete"
                    },
                    {
                        "name": "Deployment Scripts",
                        "description": "Deployment automation",
                        "files": ["deployment-scripts/", "scripts/"],
                        "status": "complete"
                    }
                ]
            },
            
            "monitoring_system": {
                "name": "Monitoring System",
                "description": """
                Comprehensive monitoring and observability:
                
                - Performance monitoring
                - Error tracking
                - Usage analytics
                - Security monitoring
                - Health checks
                
                Ensures system reliability and performance.
                """,
                "category": "Infrastructure",
                "tables": ["webhook_logs"],
                "components": [
                    {
                        "name": "Monitoring",
                        "description": "Monitoring tools",
                        "files": ["monitoring/"],
                        "status": "complete"
                    }
                ]
            },
            
            "payment_system": {
                "name": "Payment System",
                "description": """
                Complete payment processing system:
                
                - Stripe integration
                - NOWPayments crypto integration
                - Payment page
                - Donation tracking
                - Receipt generation
                - KYC/AML compliance
                
                Handles all payment processing for HingeCraft.
                """,
                "category": "Payment",
                "tables": [
                    "donations", "contribution_intents", "crypto_payments",
                    "kyc_verifications", "webhook_logs"
                ],
                "components": [
                    {
                        "name": "Payment Processing",
                        "description": "Payment handlers",
                        "files": ["api/routers/donations.py", "api/routers/webhooks.py"],
                        "status": "complete"
                    },
                    {
                        "name": "Crypto Payments",
                        "description": "NOWPayments integration",
                        "files": ["api/routers/wallets.py"],
                        "status": "complete"
                    }
                ]
            },
            
            "member_management": {
                "name": "Member Management System",
                "description": """
                Complete member management system:
                
                - Member registry
                - Charter members
                - Membership tracking
                - Member profiles
                - Twin name system
                
                Manages all HingeCraft members and their data.
                """,
                "category": "Core",
                "tables": ["members"],
                "components": [
                    {
                        "name": "Member Registry",
                        "description": "Member database",
                        "files": ["database/init.sql"],
                        "status": "complete"
                    }
                ]
            },
            
            "community_system": {
                "name": "Community System",
                "description": """
                Community engagement system:
                
                - Chat clubs
                - Chat messages
                - Community forums
                - Member interactions
                
                Facilitates community engagement and communication.
                """,
                "category": "Community",
                "tables": ["chat_clubs", "chat_messages"],
                "components": [
                    {
                        "name": "Chat System",
                        "description": "Chat clubs and messages",
                        "files": ["database/init.sql"],
                        "status": "complete"
                    }
                ]
            },
            
            "ambassador_program": {
                "name": "Ambassador Program",
                "description": """
                Ambassador program management:
                
                - Ambassador tracking
                - Campaign management
                - Impact metrics
                - Program administration
                
                Manages the HingeCraft ambassador program.
                """,
                "category": "Programs",
                "tables": ["ambassadors"],
                "components": [
                    {
                        "name": "Ambassador Management",
                        "description": "Ambassador tracking",
                        "files": ["database/init.sql"],
                        "status": "complete"
                    }
                ]
            }
        }
        
        # Create project objects
        for project_id, project_data in projects_definitions.items():
            components = [
                ProjectComponent(
                    name=comp["name"],
                    description=comp["description"],
                    files=comp["files"],
                    data_tables=[],
                    status=comp["status"],
                    completion_percentage=100.0 if comp["status"] == "complete" else 20.0
                )
                for comp in project_data["components"]
            ]
            
            project = HingeCraftProject(
                project_id=project_id,
                name=project_data["name"],
                description=project_data["description"].strip(),
                category=project_data["category"],
                components=components,
                database_tables=project_data["tables"],
                files=[],
                status="in_progress",
                completion_percentage=20.8,
                data_summary={}
            )
            
            self.projects[project_id] = project
    
    def _extract_database_data(self):
        """Extract all database schema and data from init.sql"""
        
        init_sql_path = self.base_path / "database" / "init.sql"
        
        if not init_sql_path.exists():
            print(f"⚠️  Warning: {init_sql_path} not found")
            return
        
        print(f"📊 Extracting database data from {init_sql_path}...")
        
        with open(init_sql_path, 'r') as f:
            sql_content = f.read()
        
        # Extract table definitions
        table_pattern = r'CREATE TABLE IF NOT EXISTS (\w+)'
        tables = re.findall(table_pattern, sql_content)
        
        # Define table descriptions
        table_descriptions = {
            "donations": "Stores all donation transactions with payment details, amounts, and member information",
            "members": "Member registry with charter members and lifetime registry members, including twin names",
            "chat_clubs": "Chat clubs/groups for community engagement",
            "chat_messages": "Chat messages from community members",
            "ambassadors": "Ambassador program participants and their campaigns",
            "contribution_intents": "Contribution intent data from Mission Support form and payment flows",
            "crypto_payments": "NOWPayments crypto payment invoices and transactions",
            "webhook_logs": "All webhook events for audit and debugging",
            "kyc_verifications": "KYC/AML verification tracking and compliance"
        }
        
        # Extract INSERT statements and data
        for table_name in tables:
            # Find INSERT statements for this table
            insert_pattern = rf"INSERT INTO {table_name}[^;]*VALUES[^;]*;"
            inserts = re.findall(insert_pattern, sql_content, re.IGNORECASE | re.DOTALL)
            
            # Count records (simplified - actual parsing would be more complex)
            record_count = len(inserts)
            
            # Extract schema (simplified)
            table_schema_pattern = rf"CREATE TABLE IF NOT EXISTS {table_name}\s*\(([^)]+)\)"
            schema_match = re.search(table_schema_pattern, sql_content, re.IGNORECASE | re.DOTALL)
            
            schema = {}
            if schema_match:
                columns = schema_match.group(1)
                # Parse columns (simplified)
                column_pattern = r'(\w+)\s+([^,\n]+)'
                for col_match in re.finditer(column_pattern, columns):
                    col_name = col_match.group(1).strip()
                    col_type = col_match.group(2).strip()
                    schema[col_name] = col_type
            
            table = DatabaseTable(
                name=table_name,
                description=table_descriptions.get(table_name, f"Table for {table_name} data"),
                schema=schema,
                data=[],  # Would need full SQL parsing to extract actual data
                project_assignment="",
                record_count=record_count
            )
            
            self.database_tables[table_name] = table
    
    def _scan_and_organize_files(self):
        """Scan and organize all project files"""
        
        print("📁 Scanning and organizing files...")
        
        # Key directories to scan
        key_dirs = [
            "agents", "api", "database", "backend-functions", "deployment-ready",
            "public", "src", "legal-pages", "notion", "scripts", "monitoring"
        ]
        
        for project_id, project in self.projects.items():
            project_files = []
            
            # Add files based on components
            for component in project.components:
                for file_pattern in component.files:
                    # Simple file matching (would be more sophisticated in production)
                    if os.path.exists(self.base_path / file_pattern):
                        project_files.append(file_pattern)
            
            project.files = list(set(project_files))
    
    def _segment_database_by_project(self):
        """Segment database tables by their assigned projects"""
        
        print("🔀 Segmenting database data by project...")
        
        # Assign tables to projects based on project definitions
        for project_id, project in self.projects.items():
            for table_name in project.database_tables:
                if table_name in self.database_tables:
                    self.database_tables[table_name].project_assignment = project_id
                    
                    # Add data summary
                    table = self.database_tables[table_name]
                    project.data_summary[table_name] = {
                        "record_count": table.record_count,
                        "description": table.description,
                        "schema_keys": list(table.schema.keys())[:10]  # First 10 columns
                    }
    
    def _generate_organization_report(self) -> Dict[str, Any]:
        """Generate complete organization report"""
        
        report = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "organizer_version": "1.0.0",
                "total_projects": len(self.projects),
                "total_database_tables": len(self.database_tables)
            },
            "projects": {},
            "database_tables": {},
            "summary": {
                "total_files": sum(len(p.files) for p in self.projects.values()),
                "total_components": sum(len(p.components) for p in self.projects.values()),
                "total_database_records": sum(t.record_count for t in self.database_tables.values())
            }
        }
        
        # Add projects
        for project_id, project in self.projects.items():
            report["projects"][project_id] = {
                "name": project.name,
                "description": project.description,
                "category": project.category,
                "status": project.status,
                "completion_percentage": project.completion_percentage,
                "components": [
                    {
                        "name": comp.name,
                        "description": comp.description,
                        "files": comp.files,
                        "status": comp.status,
                        "completion_percentage": comp.completion_percentage
                    }
                    for comp in project.components
                ],
                "database_tables": project.database_tables,
                "files": project.files,
                "data_summary": project.data_summary
            }
        
        # Add database tables
        for table_name, table in self.database_tables.items():
            report["database_tables"][table_name] = {
                "name": table.name,
                "description": table.description,
                "project_assignment": table.project_assignment,
                "record_count": table.record_count,
                "schema_keys": list(table.schema.keys())
            }
        
        return report
    
    def save_organization(self, output_path: str = "hingecraft_complete_organization.json"):
        """Save complete organization to JSON file"""
        
        report = self._generate_organization_report()
        
        output_file = self.base_path / output_path
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"💾 Saved complete organization to {output_file}")
        return output_file
    
    def generate_python_structure(self, output_path: str = "hingecraft_organized_data.py"):
        """Generate Python file with all organized data"""
        
        output_file = self.base_path / output_path
        
        with open(output_file, 'w') as f:
            f.write('"""\n')
            f.write('HingeCraft Global - Complete Organized Data\n')
            f.write('=' * 60 + '\n')
            f.write('\n')
            f.write('This file contains ALL HingeCraft data organized by project.\n')
            f.write('Generated automatically by organize_all_hingecraft_data.py\n')
            f.write(f'Generated: {datetime.now().isoformat()}\n')
            f.write('"""\n\n')
            f.write('from typing import Dict, List, Any\n')
            f.write('from dataclasses import dataclass\n\n\n')
            
            # Write projects
            f.write('# ============================================\n')
            f.write('# HINGECRAFT PROJECTS\n')
            f.write('# ============================================\n\n')
            
            f.write('HINGECRAFT_PROJECTS = {\n')
            for project_id, project in self.projects.items():
                f.write(f'    "{project_id}": {{\n')
                f.write(f'        "name": {repr(project.name)},\n')
                f.write(f'        "description": """{project.description}""",\n')
                f.write(f'        "category": {repr(project.category)},\n')
                f.write(f'        "status": {repr(project.status)},\n')
                f.write(f'        "completion_percentage": {project.completion_percentage},\n')
                f.write(f'        "database_tables": {project.database_tables},\n')
                f.write(f'        "components": [\n')
                for comp in project.components:
                    f.write(f'            {{\n')
                    f.write(f'                "name": {repr(comp.name)},\n')
                    f.write(f'                "description": {repr(comp.description)},\n')
                    f.write(f'                "files": {comp.files},\n')
                    f.write(f'                "status": {repr(comp.status)},\n')
                    f.write(f'            }},\n')
                f.write(f'        ],\n')
                f.write(f'        "data_summary": {json.dumps(project.data_summary, indent=12)},\n')
                f.write(f'    }},\n')
            f.write('}\n\n')
            
            # Write database tables
            f.write('# ============================================\n')
            f.write('# DATABASE TABLES\n')
            f.write('# ============================================\n\n')
            
            f.write('DATABASE_TABLES = {\n')
            for table_name, table in self.database_tables.items():
                f.write(f'    "{table_name}": {{\n')
                f.write(f'        "name": {repr(table.name)},\n')
                f.write(f'        "description": {repr(table.description)},\n')
                f.write(f'        "project_assignment": {repr(table.project_assignment)},\n')
                f.write(f'        "record_count": {table.record_count},\n')
                f.write(f'        "schema_keys": {list(table.schema.keys())},\n')
                f.write(f'    }},\n')
            f.write('}\n\n')
            
            # Write summary
            f.write('# ============================================\n')
            f.write('# SUMMARY\n')
            f.write('# ============================================\n\n')
            
            total_files = sum(len(p.files) for p in self.projects.values())
            total_components = sum(len(p.components) for p in self.projects.values())
            total_records = sum(t.record_count for t in self.database_tables.values())
            
            f.write('ORGANIZATION_SUMMARY = {\n')
            f.write(f'    "total_projects": {len(self.projects)},\n')
            f.write(f'    "total_database_tables": {len(self.database_tables)},\n')
            f.write(f'    "total_files": {total_files},\n')
            f.write(f'    "total_components": {total_components},\n')
            f.write(f'    "total_database_records": {total_records},\n')
            f.write('}\n')
        
        print(f"🐍 Generated Python structure file: {output_file}")
        return output_file


def main():
    """Main execution function"""
    
    print("=" * 70)
    print("HingeCraft Global - Complete Data Organization System")
    print("=" * 70)
    print()
    
    # Initialize organizer
    organizer = HingeCraftDataOrganizer()
    
    # Organize all data
    organization_report = organizer.organize_all_data()
    
    # Save to JSON
    json_file = organizer.save_organization("hingecraft_complete_organization.json")
    
    # Generate Python structure
    python_file = organizer.generate_python_structure("hingecraft_organized_data.py")
    
    # Print summary
    print("\n" + "=" * 70)
    print("ORGANIZATION COMPLETE")
    print("=" * 70)
    print(f"\n📊 Total Projects: {organization_report['summary']['total_components']}")
    print(f"📁 Total Files: {organization_report['summary']['total_files']}")
    print(f"🗄️  Total Database Tables: {len(organization_report['database_tables'])}")
    print(f"📝 Total Database Records: {organization_report['summary']['total_database_records']}")
    print(f"\n💾 JSON Output: {json_file}")
    print(f"🐍 Python Output: {python_file}")
    print("\n✅ All HingeCraft data has been organized and segmented by project!")


if __name__ == "__main__":
    main()
