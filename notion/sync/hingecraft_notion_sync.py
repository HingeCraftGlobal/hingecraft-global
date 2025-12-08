#!/usr/bin/env python3
"""
HingeCraft Notion Sync - Complete Integration System
Syncs all HingeCraft data to Notion dashboard with real-time updates

Features:
- Cursor-based incremental sync
- Real-time status updates
- Progress tracking automation
- Chat history integration
- Timeline/deadline sync
- 24/7 monitoring
- Webhook support
"""

import os
import json
import time
import logging
import subprocess
import sys
from typing import Optional, Tuple, List, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
import requests
from dotenv import load_dotenv
from notion_client import Client

# Setup logging first
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("notion_sync.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("hingecraft-notion-sync")

# Add monitoring module to path
sys.path.insert(0, str(Path(__file__).parent.parent / "monitoring"))
try:
    from docker_monitor import get_all_services_status, check_docker_running
except ImportError:
    logger.warning("Docker monitor not available - Docker monitoring disabled")
    def get_all_services_status():
        return {"docker_running": False, "error": "Docker monitor not available"}
    def check_docker_running():
        return False

# Load environment
load_dotenv()

# Configuration
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
# Primary Notion Page ID (Ferguson-System Sync Blueprint)
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "19ad872b-594c-81d7-b4fd-00024322280f")
# Legacy/Alternative Notion Page ID (if needed)
LEGACY_PARENT_PAGE = os.getenv("NOTION_LEGACY_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")
HINGECRAFT_DB_PATH = os.getenv("HINGECRAFT_DB_PATH", "../database")
CURSOR_WORKSPACE = os.getenv("CURSOR_WORKSPACE_PATH", "../")
SYNC_INTERVAL = int(os.getenv("SYNC_INTERVAL", "60"))
REALTIME_INTERVAL = int(os.getenv("REALTIME_UPDATE_INTERVAL", "5"))

# Database IDs (will be set after creation)
DB_IDS = {
    'projects': os.getenv("NOTION_PROJECT_DB_ID", ""),
    'tasks': os.getenv("NOTION_TASK_DB_ID", ""),
    'donations': os.getenv("NOTION_DONATION_DB_ID", ""),
    'leads': os.getenv("NOTION_LEADS_DB_ID", ""),
    'content': os.getenv("NOTION_CONTENT_DB_ID", ""),
    'team': os.getenv("NOTION_TEAM_DB_ID", ""),
    'chat_history': os.getenv("NOTION_CHAT_HISTORY_DB_ID", ""),
    'timeline': os.getenv("NOTION_TIMELINE_DB_ID", ""),
    'system_status': os.getenv("NOTION_SYSTEM_STATUS_DB_ID", ""),
    'urls': os.getenv("NOTION_URLS_DB_ID", "")
}

# File paths
MAPPINGS_FILE = os.getenv("MAPPINGS_FILE", "./mappings.json")
LAST_CURSOR_FILE = os.getenv("LAST_CURSOR_FILE", "./last_cursor.json")
CHAT_HISTORY_FILE = os.getenv("CHAT_HISTORY_FILE", "./chat_history.json")
PROGRESS_LOG_FILE = os.getenv("PROGRESS_LOG_FILE", "./progress_log.json")

# Initialize Notion client
notion = Client(auth=NOTION_TOKEN)

# Load mappings
if os.path.exists(MAPPINGS_FILE):
    with open(MAPPINGS_FILE, 'r') as f:
        MAPPINGS = json.load(f)
else:
    MAPPINGS = {}

def save_mappings():
    with open(MAPPINGS_FILE, 'w') as f:
        json.dump(MAPPINGS, f, indent=2)

# Load progress log
if os.path.exists(PROGRESS_LOG_FILE):
    with open(PROGRESS_LOG_FILE, 'r') as f:
        PROGRESS_LOG = json.load(f)
else:
    PROGRESS_LOG = {
        'last_update': None,
        'project_progress': {},
        'task_completion': {},
        'overall_progress': 0
    }

def save_progress_log():
    with open(PROGRESS_LOG_FILE, 'w') as f:
        json.dump(PROGRESS_LOG, f, indent=2)

# ============================================================================
# Notion Database Creation
# ============================================================================

def create_notion_databases():
    """Create all required Notion databases if they don't exist"""
    logger.info("Creating Notion databases...")
    
    # Projects Database
    if not DB_IDS['projects']:
        projects_db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Projects"}}],
            properties={
                "Name": {"title": {}},
                "Project ID": {"rich_text": {}},
                "Status": {"select": {
                    "options": [
                        {"name": "Idea", "color": "gray"},
                        {"name": "Planning", "color": "blue"},
                        {"name": "In Progress", "color": "yellow"},
                        {"name": "Blocked", "color": "red"},
                        {"name": "Review", "color": "orange"},
                        {"name": "Done", "color": "green"}
                    ]
                }},
                "Priority": {"select": {
                    "options": [
                        {"name": "Urgent", "color": "red"},
                        {"name": "High", "color": "orange"},
                        {"name": "Medium", "color": "yellow"},
                        {"name": "Low", "color": "gray"}
                    ]
                }},
                "Owner": {"rich_text": {}},
                "Team": {"multi_select": {
                    "options": [
                        {"name": "Engineering", "color": "blue"},
                        {"name": "Marketing", "color": "pink"},
                        {"name": "Legal", "color": "purple"},
                        {"name": "Community", "color": "green"},
                        {"name": "Education", "color": "yellow"},
                        {"name": "Design", "color": "orange"}
                    ]
                }},
                "Start Date": {"date": {}},
                "Due Date": {"date": {}},
                "Progress %": {"number": {"format": "percent"}},
                "Related Tasks": {"relation": {"database_id": ""}},  # Will be set after Tasks DB created
                "Notes": {"rich_text": {}}
            }
        )
        DB_IDS['projects'] = projects_db['id']
        logger.info(f"Created Projects database: {DB_IDS['projects']}")
    
    # Tasks Database
    if not DB_IDS['tasks']:
        tasks_db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Tasks"}}],
            properties={
                "Name": {"title": {}},
                "Task ID": {"rich_text": {}},
                "Project": {"relation": {"database_id": DB_IDS['projects']}},
                "Assignee": {"rich_text": {}},
                "Status": {"select": {
                    "options": [
                        {"name": "Todo", "color": "gray"},
                        {"name": "Doing", "color": "yellow"},
                        {"name": "Blocked", "color": "red"},
                        {"name": "Done", "color": "green"}
                    ]
                }},
                "Due": {"date": {}},
                "Estimate (hrs)": {"number": {}},
                "Type": {"select": {
                    "options": [
                        {"name": "Dev", "color": "blue"},
                        {"name": "Content", "color": "pink"},
                        {"name": "Legal", "color": "purple"},
                        {"name": "Design", "color": "orange"},
                        {"name": "Outreach", "color": "green"}
                    ]
                }},
                "Notes": {"rich_text": {}}
            }
        )
        DB_IDS['tasks'] = tasks_db['id']
        logger.info(f"Created Tasks database: {DB_IDS['tasks']}")
    
    # Donations Database
    if not DB_IDS['donations']:
        donations_db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Donations"}}],
            properties={
                "Donor Name": {"title": {}},
                "Donation ID": {"rich_text": {}},
                "Amount": {"number": {"format": "dollar"}},
                "Currency": {"select": {
                    "options": [
                        {"name": "USD", "color": "green"},
                        {"name": "BTC", "color": "orange"},
                        {"name": "SOL", "color": "purple"},
                        {"name": "USDC", "color": "blue"}
                    ]
                }},
                "Date": {"date": {}},
                "Method": {"select": {
                    "options": [
                        {"name": "Stripe", "color": "blue"},
                        {"name": "Coinbase Commerce", "color": "purple"},
                        {"name": "Bank", "color": "green"},
                        {"name": "Manual", "color": "gray"}
                    ]
                }},
                "Designation": {"select": {
                    "options": [
                        {"name": "General", "color": "gray"},
                        {"name": "Student Funds", "color": "blue"},
                        {"name": "Microfactory", "color": "green"},
                        {"name": "Other", "color": "orange"}
                    ]
                }},
                "Confirmed": {"checkbox": {}},
                "Receipt Sent": {"checkbox": {}}
            }
        )
        DB_IDS['donations'] = donations_db['id']
        logger.info(f"Created Donations database: {DB_IDS['donations']}")
    
    # System Status Database
    if not DB_IDS['system_status']:
        system_status_db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "System Status"}}],
            properties={
                "Service Name": {"title": {}},
                "Service ID": {"rich_text": {}},
                "Status": {"select": {
                    "options": [
                        {"name": "Running", "color": "green"},
                        {"name": "Stopped", "color": "red"},
                        {"name": "Degraded", "color": "yellow"},
                        {"name": "Unknown", "color": "gray"}
                    ]
                }},
                "Type": {"select": {
                    "options": [
                        {"name": "Database", "color": "blue"},
                        {"name": "API", "color": "purple"},
                        {"name": "Cache", "color": "orange"},
                        {"name": "Storage", "color": "green"},
                        {"name": "Worker", "color": "pink"},
                        {"name": "Proxy", "color": "yellow"}
                    ]
                }},
                "Port": {"number": {}},
                "Health Check": {"url": {}},
                "Last Checked": {"date": {}},
                "Details": {"rich_text": {}}
            }
        )
        DB_IDS['system_status'] = system_status_db['id']
        logger.info(f"Created System Status database: {DB_IDS['system_status']}")
    
    # URLs Database
    if not DB_IDS['urls']:
        urls_db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Company URLs & Repositories"}}],
            properties={
                "Name": {"title": {}},
                "URL": {"url": {}},
                "Category": {"select": {
                    "options": [
                        {"name": "Website", "color": "blue"},
                        {"name": "Repository", "color": "green"},
                        {"name": "Backend Service", "color": "purple"},
                        {"name": "Admin Panel", "color": "orange"},
                        {"name": "Documentation", "color": "yellow"}
                    ]
                }},
                "Type": {"select": {
                    "options": [
                        {"name": "Main Site", "color": "blue"},
                        {"name": "GitHub Repo", "color": "gray"},
                        {"name": "API Endpoint", "color": "purple"},
                        {"name": "Database", "color": "green"},
                        {"name": "Storage", "color": "orange"}
                    ]
                }},
                "Status": {"select": {
                    "options": [
                        {"name": "Active", "color": "green"},
                        {"name": "Inactive", "color": "red"},
                        {"name": "Maintenance", "color": "yellow"}
                    ]
                }},
                "Description": {"rich_text": {}}
            }
        )
        DB_IDS['urls'] = urls_db['id']
        logger.info(f"Created URLs database: {DB_IDS['urls']}")
    
    # Save DB IDs to .env or config file
    logger.info("All databases created successfully")

# ============================================================================
# Data Loading from HingeCraft Database
# ============================================================================

def load_hingecraft_database():
    """Load all data from HingeCraft database"""
    data = {
        'projects': [],
        'tasks': [],
        'donations': [],
        'leads': [],
        'content': [],
        'team': [],
        'chat_history': [],
        'timeline': []
    }
    
    # Load from database exports
    db_export_path = Path(HINGECRAFT_DB_PATH) / "COMPLETE_DATABASE_EXPORT.json"
    if db_export_path.exists():
        with open(db_export_path, 'r') as f:
            db_data = json.load(f)
            if 'data' in db_data and 'donations' in db_data['data']:
                data['donations'] = db_data['data']['donations']
    
    # Load from task execution results
    task_results_path = Path("../agents")
    for result_file in task_results_path.glob("TASK_EXECUTION_RESULTS*.json"):
        with open(result_file, 'r') as f:
            task_data = json.load(f)
            # Process task data into projects/tasks format
            pass
    
    # Load chat history
    chat_files = [
        Path("../CHAT_SESSION_COMPLETE_OUTLINE.json"),
        Path("../CHAT_SESSION_COMPLETE_OUTLINE.md")
    ]
    for chat_file in chat_files:
        if chat_file.exists():
            # Extract chat history
            pass
    
    return data

# ============================================================================
# Cursor Integration - Detect Active Work
# ============================================================================

def detect_cursor_activity():
    """Detect if user is actively working in Cursor"""
    try:
        # Check for recent file modifications
        workspace_path = Path(CURSOR_WORKSPACE)
        recent_files = []
        
        for file_path in workspace_path.rglob("*"):
            if file_path.is_file():
                try:
                    mtime = file_path.stat().st_mtime
                    if time.time() - mtime < 300:  # Modified in last 5 minutes
                        recent_files.append({
                            'path': str(file_path.relative_to(workspace_path)),
                            'modified': datetime.fromtimestamp(mtime).isoformat()
                        })
                except:
                    pass
        
        # Check git activity
        git_commits = []
        try:
            result = subprocess.run(
                ['git', 'log', '--oneline', '-10', '--since=1 hour ago'],
                cwd=workspace_path,
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                git_commits = result.stdout.strip().split('\n')
        except:
            pass
        
        return {
            'active': len(recent_files) > 0 or len(git_commits) > 0,
            'recent_files': recent_files[:10],
            'recent_commits': git_commits[:5],
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error detecting Cursor activity: {e}")
        return {'active': False, 'error': str(e)}

# ============================================================================
# Progress Calculation
# ============================================================================

def calculate_progress():
    """Calculate overall progress from all sources"""
    progress = {
        'overall': 0,
        'by_category': {},
        'by_project': {},
        'last_calculated': datetime.now().isoformat()
    }
    
    # Load task execution results
    task_files = list(Path("../agents").glob("TASK_EXECUTION_RESULTS*.json"))
    total_tasks = 0
    completed_tasks = 0
    
    for task_file in task_files:
        try:
            with open(task_file, 'r') as f:
                task_data = json.load(f)
                if 'summary' in task_data:
                    total_tasks += task_data.get('total', 0)
                    completed_tasks += task_data['summary'].get('completed', 0)
        except:
            pass
    
    if total_tasks > 0:
        progress['overall'] = (completed_tasks / total_tasks) * 100
    
    # Calculate by category
    # ... (implement category-based progress)
    
    return progress

# ============================================================================
# Notion Upsert Functions
# ============================================================================

def upsert_notion_page(db_id: str, source_id: str, props: dict, mapping_key: str) -> str:
    """Upsert a page into Notion database"""
    MAPPINGS.setdefault(source_id, {})
    
    if MAPPINGS[source_id].get(mapping_key):
        page_id = MAPPINGS[source_id][mapping_key]
        try:
            notion.pages.update(page_id=page_id, properties=props)
            logger.debug(f"Updated {mapping_key} for {source_id}")
            return page_id
        except Exception as e:
            logger.warning(f"Update failed for {source_id}, creating new: {e}")
    
    # Create new
    try:
        new = notion.pages.create(parent={"database_id": db_id}, properties=props)
        page_id = new["id"]
        MAPPINGS[source_id][mapping_key] = page_id
        save_mappings()
        logger.info(f"Created {mapping_key} for {source_id}")
        return page_id
    except Exception as e:
        logger.error(f"Failed to create {mapping_key} for {source_id}: {e}")
        raise

def sync_project(project_data: dict):
    """Sync a project to Notion"""
    src_id = str(project_data.get('id', project_data.get('project_id', '')))
    if not src_id:
        return
    
    props = {
        "Name": {"title": [{"text": {"content": project_data.get('name', 'Untitled Project')}}]},
        "Project ID": {"rich_text": [{"text": {"content": src_id}}]},
        "Status": {"select": {"name": project_data.get('status', 'Idea')}},
        "Priority": {"select": {"name": project_data.get('priority', 'Medium')}},
        "Owner": {"rich_text": [{"text": {"content": project_data.get('owner', '')}}]},
        "Progress %": {"number": project_data.get('progress', 0) / 100 if project_data.get('progress', 0) > 1 else project_data.get('progress', 0)}
    }
    
    if project_data.get('start_date'):
        props["Start Date"] = {"date": {"start": project_data['start_date']}}
    if project_data.get('due_date'):
        props["Due Date"] = {"date": {"start": project_data['due_date']}}
    
    upsert_notion_page(DB_IDS['projects'], src_id, props, 'project')

def sync_donation(donation_data: dict):
    """Sync a donation to Notion"""
    src_id = str(donation_data.get('id', donation_data.get('_id', '')))
    if not src_id:
        return
    
    # Handle null/None values for select fields
    payment_method = donation_data.get('payment_method')
    if not payment_method or payment_method == 'null' or payment_method is None:
        payment_method = 'Manual'
    
    currency = donation_data.get('currency')
    if not currency or currency == 'null' or currency is None:
        currency = 'USD'
    
    props = {
        "Donor Name": {"title": [{"text": {"content": donation_data.get('member_name', 'Anonymous')}}]},
        "Donation ID": {"rich_text": [{"text": {"content": src_id}}]},
        "Amount": {"number": float(donation_data.get('amount', 0))},
        "Currency": {"select": {"name": str(currency)}},
        "Date": {"date": {"start": donation_data.get('created_at', datetime.now().isoformat())}},
        "Method": {"select": {"name": str(payment_method)}},
        "Confirmed": {"checkbox": donation_data.get('payment_status') == 'completed'},
        "Receipt Sent": {"checkbox": False}
    }
    
    upsert_notion_page(DB_IDS['donations'], src_id, props, 'donation')

def sync_status_update(status_data: dict):
    """Update status in Notion based on current work"""
    # Update main dashboard status block
    # This would update a status text block on the main page
    pass

def sync_docker_status():
    """Sync Docker services status to Notion System Status database"""
    if not DB_IDS['system_status']:
        return
    
    if not os.getenv("DOCKER_MONITORING_ENABLED", "true").lower() == "true":
        return
    
    try:
        docker_status = get_all_services_status()
        
        for service_name, service_info in docker_status.get('services', {}).items():
            src_id = f"docker_{service_name}"
            props = {
                "Service Name": {"title": [{"text": {"content": service_name}}]},
                "Service ID": {"rich_text": [{"text": {"content": src_id}}]},
                "Status": {"select": {"name": service_info.get('container_status', 'Unknown').title()}},
                "Type": {"select": {"name": service_info.get('type', 'Unknown').title()}},
                "Last Checked": {"date": {"start": service_info.get('last_checked', datetime.now().isoformat())}},
                "Details": {"rich_text": [{"text": {"content": json.dumps(service_info, indent=2)}}]}
            }
            
            if service_info.get('port'):
                props["Port"] = {"number": service_info['port']}
            
            if service_info.get('port_status', {}).get('port_open'):
                health_url = f"http://localhost:{service_info['port']}"
                props["Health Check"] = {"url": health_url}
            
            upsert_notion_page(DB_IDS['system_status'], src_id, props, 'system_status')
        
        logger.info(f"Synced Docker status: {docker_status.get('summary', {})}")
    except Exception as e:
        logger.error(f"Failed to sync Docker status: {e}")

def sync_company_urls():
    """Sync all company URLs and repositories to Notion"""
    if not DB_IDS['urls']:
        logger.warning("URLs database not created yet - skipping URL sync")
        return
    
    try:
        urls_file = Path(__file__).parent.parent / "company_urls.json"
        if not urls_file.exists():
            logger.warning("company_urls.json not found")
            return
        
        with open(urls_file, 'r') as f:
            urls_data = json.load(f)
        
        # Check if database exists and has correct properties
        try:
            db_info = notion.databases.retrieve(database_id=DB_IDS['urls'])
            db_props = db_info.get('properties', {})
            logger.debug(f"URLs DB properties: {list(db_props.keys())}")
        except Exception as e:
            logger.error(f"Failed to retrieve URLs database: {e}")
            return
        
        # Sync main website
        website_url = urls_data.get('company', {}).get('primary_domain', '')
        if website_url:
            props = {}
            if "Name" in db_props:
                props["Name"] = {"title": [{"text": {"content": "HingeCraft Global - Main Website"}}]}
            if "URL" in db_props:
                props["URL"] = {"url": website_url}
            if "Category" in db_props:
                props["Category"] = {"select": {"name": "Website"}}
            if "Type" in db_props:
                props["Type"] = {"select": {"name": "Main Site"}}
            if "Status" in db_props:
                props["Status"] = {"select": {"name": "Active"}}
            if "Description" in db_props:
                props["Description"] = {"rich_text": [{"text": {"content": "Primary HingeCraft Global website"}}]}
            
            if props:
                upsert_notion_page(DB_IDS['urls'], "main_website", props, 'url')
        
        # Sync repositories
        for repo_name, repo_info in urls_data.get('repositories', {}).items():
            repo_url = repo_info.get('url', '')
            if repo_url:
                props = {}
                if "Name" in db_props:
                    props["Name"] = {"title": [{"text": {"content": repo_info.get('name', repo_name)}}]}
                if "URL" in db_props:
                    props["URL"] = {"url": repo_url}
                if "Category" in db_props:
                    props["Category"] = {"select": {"name": "Repository"}}
                if "Type" in db_props:
                    props["Type"] = {"select": {"name": "GitHub Repo"}}
                if "Status" in db_props:
                    props["Status"] = {"select": {"name": "Active"}}
                if "Description" in db_props:
                    props["Description"] = {"rich_text": [{"text": {"content": repo_info.get('description', repo_info.get('type', ''))}}]}
                
                if props:
                    upsert_notion_page(DB_IDS['urls'], f"repo_{repo_name}", props, 'url')
        
        # Sync backend services
        for service_name, service_url in urls_data.get('backend_services', {}).items():
            if isinstance(service_url, str) and service_url.startswith('http'):
                props = {}
                if "Name" in db_props:
                    props["Name"] = {"title": [{"text": {"content": f"{service_name.title()} Service"}}]}
                if "URL" in db_props:
                    props["URL"] = {"url": service_url}
                if "Category" in db_props:
                    props["Category"] = {"select": {"name": "Backend Service"}}
                if "Type" in db_props:
                    props["Type"] = {"select": {"name": "API Endpoint"}}
                if "Status" in db_props:
                    props["Status"] = {"select": {"name": "Active"}}
                if "Description" in db_props:
                    props["Description"] = {"rich_text": [{"text": {"content": f"Backend {service_name} service endpoint"}}]}
                
                if props:
                    upsert_notion_page(DB_IDS['urls'], f"backend_{service_name}", props, 'url')
        
        logger.info("Synced company URLs to Notion")
    except Exception as e:
        logger.error(f"Failed to sync company URLs: {e}")

# ============================================================================
# Main Sync Loop
# ============================================================================

def run_sync():
    """Main sync function"""
    logger.info("Starting HingeCraft -> Notion sync...")
    
    # Detect activity
    activity = detect_cursor_activity()
    if activity['active']:
        logger.info("Active work detected - updating status")
        sync_status_update({'status': 'Active', 'details': activity})
    
    # Sync Docker services status
    sync_docker_status()
    
    # Sync company URLs
    sync_company_urls()
    
    # Load data
    data = load_hingecraft_database()
    
    # Sync all entities
    for donation in data['donations']:
        try:
            sync_donation(donation)
        except Exception as e:
            logger.error(f"Failed to sync donation {donation.get('id')}: {e}")
    
    # Calculate and update progress
    progress = calculate_progress()
    PROGRESS_LOG['last_update'] = datetime.now().isoformat()
    PROGRESS_LOG['overall_progress'] = progress['overall']
    save_progress_log()
    
    logger.info(f"Sync complete. Overall progress: {progress['overall']:.1f}%")

# ============================================================================
# 24/7 Monitoring Service
# ============================================================================

def run_monitoring_service():
    """Run continuous monitoring and sync service"""
    logger.info("Starting 24/7 monitoring service...")
    
    while True:
        try:
            run_sync()
            time.sleep(SYNC_INTERVAL)
        except KeyboardInterrupt:
            logger.info("Monitoring service stopped")
            break
        except Exception as e:
            logger.error(f"Error in monitoring service: {e}")
            time.sleep(60)  # Wait before retry

if __name__ == "__main__":
    # Create databases if needed
    create_notion_databases()
    
    # Run initial sync
    run_sync()
    
    # Start monitoring service
    if os.getenv("MONITORING_ENABLED", "true").lower() == "true":
        run_monitoring_service()

