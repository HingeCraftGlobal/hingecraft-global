#!/usr/bin/env python3
"""
Discord Integration for Notion Project Updates
Pushes updates about Notion project progress to Discord
"""

import os
import sys
import json
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK", "")

def send_discord_embed(title, description, color=0x10b981, fields=None, footer=None):
    """Send formatted embed to Discord"""
    if not DISCORD_WEBHOOK:
        print("⚠️  Discord webhook not configured")
        return False
    
    embed = {
        "title": title,
        "description": description,
        "color": color,
        "timestamp": datetime.now().isoformat(),
        "footer": {
            "text": footer or "HingeCraft Global - Notion Project"
        }
    }
    
    if fields:
        embed["fields"] = fields
    
    payload = {"embeds": [embed]}
    
    try:
        response = requests.post(DISCORD_WEBHOOK, json=payload)
        if response.status_code == 204:
            print(f"✅ Sent to Discord: {title}")
            return True
        else:
            print(f"⚠️  Discord error: {response.status_code}")
            return False
    except Exception as e:
        print(f"⚠️  Discord error: {e}")
        return False

def notify_notion_setup_complete():
    """Notify that Notion setup is complete"""
    send_discord_embed(
        title="✅ Notion Dashboard Setup Complete",
        description="The HingeCraft Notion workspace is now fully configured and ready!",
        fields=[
            {"name": "📊 Databases Created", "value": "10 databases with full schemas", "inline": True},
            {"name": "📝 Projects Added", "value": "7 major projects documented", "inline": True},
            {"name": "💰 Donations Synced", "value": "3 donations ($175.50 total)", "inline": True},
            {"name": "🚀 Status", "value": "Ready for team collaboration", "inline": False}
        ],
        color=0x10b981
    )

def notify_gpt4_prompts_started():
    """Notify that GPT-4 prompts are starting"""
    send_discord_embed(
        title="🤖 GPT-4 Multi-Prompt System Started",
        description="Generating comprehensive Notion project content using GPT-4",
        fields=[
            {"name": "📋 Prompts", "value": "8 comprehensive prompts", "inline": True},
            {"name": "🎯 Focus", "value": "Architecture, Content, Automation", "inline": True},
            {"name": "⏱️ ETA", "value": "~5-10 minutes", "inline": True}
        ],
        color=0x5865f2
    )

def notify_project_update(project_name, status, progress, description=""):
    """Notify about project update"""
    send_discord_embed(
        title=f"📊 Project Update: {project_name}",
        description=description or f"Status update for {project_name}",
        fields=[
            {"name": "Status", "value": status, "inline": True},
            {"name": "Progress", "value": f"{progress}%", "inline": True},
            {"name": "Updated", "value": datetime.now().strftime("%Y-%m-%d %H:%M"), "inline": True}
        ],
        color=0x10b981 if status == "Done" else 0xf59e0b
    )

def notify_donation_received(amount, donor_name, currency="USD"):
    """Notify about new donation"""
    send_discord_embed(
        title="💰 New Donation Received",
        description=f"Thank you {donor_name} for your support!",
        fields=[
            {"name": "Amount", "value": f"${amount:.2f} {currency}", "inline": True},
            {"name": "Donor", "value": donor_name, "inline": True},
            {"name": "Total", "value": "Updated in Notion", "inline": True}
        ],
        color=0x10b981
    )

def notify_sync_complete(stats):
    """Notify that sync is complete"""
    send_discord_embed(
        title="🔄 Notion Sync Complete",
        description="All data has been synced to Notion workspace",
        fields=[
            {"name": "Projects", "value": str(stats.get('projects', 0)), "inline": True},
            {"name": "Donations", "value": str(stats.get('donations', 0)), "inline": True},
            {"name": "Tasks", "value": str(stats.get('tasks', 0)), "inline": True},
            {"name": "Overall Progress", "value": f"{stats.get('progress', 0):.1f}%", "inline": False}
        ],
        color=0x10b981
    )

def notify_error(error_message, context=""):
    """Notify about error"""
    send_discord_embed(
        title="❌ Error Occurred",
        description=error_message,
        fields=[{"name": "Context", "value": context, "inline": False}] if context else None,
        color=0xef4444
    )

def main():
    """Test Discord integration"""
    print("🚀 Testing Discord Integration")
    
    if not DISCORD_WEBHOOK:
        print("❌ Discord webhook not configured")
        print("   Set DISCORD_WEBHOOK in .env file")
        return
    
    # Test messages
    notify_notion_setup_complete()
    notify_gpt4_prompts_started()
    notify_project_update("Notion Dashboard Integration", "In Progress", 30)
    notify_sync_complete({"projects": 7, "donations": 3, "tasks": 0, "progress": 84.3})
    
    print("\n✅ Discord integration test complete!")

if __name__ == '__main__':
    main()





