#!/usr/bin/env python3
"""
Update Database with Refined Copywriting
Applies copywriting from master blueprint to all database records
"""

import os
import sys
import json
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'hingecraft'),
    'user': os.getenv('DB_USER', 'hcuser'),
    'password': os.getenv('DB_PASSWORD', 'hcpass')
}

# Project descriptions from blueprint
PROJECT_DESCRIPTIONS = {
    'notion_dashboard': {
        'name': 'Notion Dashboard Integration',
        'description': 'Complete 24/7 sync system integrating all HingeCraft data with Notion workspace. Real-time project tracking, progress monitoring, and team collaboration dashboard. Syncs 10 databases including projects, tasks, donations, leads, content pipeline, team tracker, chat history, timeline, system status, and company URLs. Status: 30% complete (3,000/10,000 tasks). Actively building with 100% success rate.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 30
    },
    'ml_automation': {
        'name': 'ML Automation System',
        'description': 'End-to-end lead automation pipeline processing Google Drive files, enriching leads with Anymail API, syncing to HubSpot CRM, and sending automated email sequences. Features OAuth authentication, batch processing, email wave sending, and comprehensive tracking. Status: Operational. Handles CSV/Sheets files, normalizes data, deduplicates leads, and manages complete email sequences.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100
    },
    'database_schema': {
        'name': '10-Layer Master Schema',
        'description': 'Comprehensive PostgreSQL database architecture with 10 integrated layers: core extensions, users/identity, design metadata, community activity, microfactory integrations, content contributions, environmental impact, crypto treasury, learning/skills, and webhooks/assets/prompts. Supports 50+ tables, full-text search, encryption, and enterprise security. Status: Complete and operational.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100
    },
    'charter_platform': {
        'name': 'Charter for Abundance Platform',
        'description': 'Membership platform for the Charter for Abundance & Resilience initiative. Features donation processing (Stripe + crypto), charter invitation system, mission support forms, and community engagement tools. Integrated with Wix, supports multiple payment methods, and tracks contributions in real-time. Status: Live and operational.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100
    },
    'legal_compliance': {
        'name': '34 Legal Compliance Pages',
        'description': 'Complete legal compliance framework with 34 comprehensive pages covering corporate formation, terms of service, privacy policies, AI governance, export compliance, and global regulations. All pages created in HTML and Wix format, ready for deployment. Status: Complete, ready for Wix deployment.',
        'status': 'Review',
        'priority': 'High',
        'progress': 100
    }
}

def connect_db():
    """Connect to database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

def update_projects_table(conn):
    """Update projects table with refined descriptions"""
    cursor = conn.cursor()
    
    # Check if projects table exists
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'projects'
        );
    """)
    
    if not cursor.fetchone()[0]:
        print("⚠️  Projects table doesn't exist. Creating...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(255) UNIQUE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50),
                priority VARCHAR(50),
                progress_percent DECIMAL(5,2),
                owner VARCHAR(255),
                team VARCHAR(255),
                start_date DATE,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        print("✅ Projects table created")
    
    # Insert or update projects
    for key, project in PROJECT_DESCRIPTIONS.items():
        cursor.execute("""
            INSERT INTO projects (project_id, name, description, status, priority, progress_percent)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (project_id) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                status = EXCLUDED.status,
                priority = EXCLUDED.priority,
                progress_percent = EXCLUDED.progress_percent,
                updated_at = CURRENT_TIMESTAMP;
        """, (
            key,
            project['name'],
            project['description'],
            project['status'],
            project['priority'],
            project['progress']
        ))
        print(f"✅ Updated project: {project['name']}")
    
    conn.commit()
    cursor.close()
    print("✅ All projects updated with refined copywriting")

def update_donations_table(conn):
    """Update donations table with refined field descriptions"""
    cursor = conn.cursor()
    
    # Add comments to donations table columns
    comments = {
        'member_name': 'Name of the person or organization making the donation',
        'amount': 'Amount donated in the selected currency',
        'currency': 'Currency type: USD (US Dollar), BTC (Bitcoin), SOL (Solana), or USDC (USD Coin)',
        'payment_method': 'How the payment was processed: Stripe (card), Coinbase Commerce (crypto), Bank (wire transfer), or Manual (other)',
        'payment_status': 'Current payment status: pending, completed, failed, or refunded'
    }
    
    for column, comment in comments.items():
        try:
            cursor.execute(f"""
                COMMENT ON COLUMN donations.{column} IS %s;
            """, (comment,))
            print(f"✅ Added comment to donations.{column}")
        except Exception as e:
            print(f"⚠️  Could not add comment to {column}: {e}")
    
    conn.commit()
    cursor.close()

def create_copywriting_metadata(conn):
    """Create metadata table for copywriting version tracking"""
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS copywriting_metadata (
            id SERIAL PRIMARY KEY,
            version VARCHAR(50) NOT NULL,
            blueprint_file VARCHAR(255),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_by VARCHAR(255),
            notes TEXT
        );
    """)
    
    # Insert current version
    cursor.execute("""
        INSERT INTO copywriting_metadata (version, blueprint_file, notes)
        VALUES ('1.0', 'COPYWRITING_MASTER_BLUEPRINT.md', 'Initial copywriting blueprint implementation')
        ON CONFLICT DO NOTHING;
    """)
    
    conn.commit()
    cursor.close()
    print("✅ Copywriting metadata table created")

def main():
    """Main execution"""
    print("🚀 Starting database copywriting update...")
    
    conn = connect_db()
    if not conn:
        print("❌ Failed to connect to database")
        return
    
    try:
        update_projects_table(conn)
        update_donations_table(conn)
        create_copywriting_metadata(conn)
        print("\n✅ Database copywriting update complete!")
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    main()






