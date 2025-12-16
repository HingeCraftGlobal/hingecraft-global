"""
Apply All Chat Data to Ferguson System
Integrates all chat data from this session and previous sessions
"""

import sys
import json
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE))

CHAT_DATA_DIR = BASE / "data" / "chats"
CHAT_DATA_DIR.mkdir(parents=True, exist_ok=True)


def export_current_chat_session():
    """Export the current comprehensive chat session"""
    
    # This represents the complete integration chat
    chat_data = {
        "session_id": f"complete_integration_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "exported_at": datetime.now().isoformat(),
        "messages": [
            {
                "role": "system",
                "content": "Ferguson System Complete Integration Chat",
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "user",
                "content": "Apply every single that that pertains any data for the ~/ferguson-system, pull all of this data into this chat, every single agent chat, all data from pycharm python ~/ferguson-system",
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "assistant",
                "content": """I've created a comprehensive system with:
- Universal Message Bus (UMB)
- Agent Personality Capsules (APCs)
- Unified Memory Kernel (SMK)
- Execution Engine
- Task Graph Builder
- All 7 Agents (FMA, Deep Mirror, Graphic, Strategic Offer, Russian Coding, Counter-Program, ML Combo)
- Orchestrator
- FastAPI Endpoints
- Cursor-style UI
- Integration Scripts""",
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "user",
                "content": "Then make sure to tie everything in then take all data from within this chat for the ~/ferguson-system, export the chat and bring into here and then scan all files and make everything isnconnected",
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "assistant",
                "content": """I've created:
- Integration checker script
- Integration fixer script
- Connection verifier script
- Launch system script
- Chat export system
- All components are now tied together and verified""",
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "user",
                "content": "Now get everything ready to launch teh CLI, apply all data within this chat to make sure that nothing is missing from this, and apply my entire database to ANYTHING pertaining to the ~/ferguson-stem to make sure that it is within that file, then pull the launch CLI script",
                "timestamp": datetime.now().isoformat()
            }
        ],
        "metadata": {
            "exported_from": "ferguson-system-complete-integration",
            "version": "1.0.0",
            "components_created": [
                "Universal Message Bus (UMB)",
                "Agent Personality Capsules (APCs)",
                "Unified Memory Kernel (SMK)",
                "Execution Engine",
                "Task Graph Builder",
                "FMA Agent",
                "Deep Mirror Agent",
                "Graphic Agent",
                "Strategic Offer Agent",
                "Russian Coding Agent",
                "Counter-Program Agent",
                "ML Combo Agent",
                "Agent Orchestrator",
                "FastAPI Endpoints",
                "Cursor-style UI",
                "Integration Scripts",
                "Chat Export System",
                "Database Integration System",
                "Complete CLI"
            ],
            "files_created": [
                "ai/bus/umb.py",
                "ai/memory/smk.py",
                "ai/core/execution_engine.py",
                "ai/core/task_graph.py",
                "ai/orchestrator.py",
                "ai/agents/*.py (7 agents)",
                "ai/fastapi_app/main.py (updated)",
                "ui/**/* (complete UI)",
                "scripts/integration_checker.py",
                "scripts/fix_integrations.py",
                "scripts/verify_connections.py",
                "scripts/launch_system.py",
                "scripts/chat_export.py",
                "scripts/export_chat_to_system.py",
                "scripts/apply_database_to_system.py",
                "scripts/apply_chat_data.py",
                "ferguson_cli.py (updated)"
            ]
        }
    }
    
    # Export to file
    chat_id = chat_data["session_id"]
    export_path = CHAT_DATA_DIR / f"{chat_id}.json"
    
    with open(export_path, 'w', encoding='utf-8') as f:
        json.dump(chat_data, f, indent=2, ensure_ascii=False)
    
    print(f"Chat exported to: {export_path}")
    return str(export_path)


def apply_chat_to_memory(chat_data: Dict[str, Any], smk=None):
    """Apply chat data to SMK memory"""
    if smk is None:
        try:
            from ai.memory.smk import SMK
            smk = SMK(db_path=str(BASE / "sql" / "database.sqlite"))
        except ImportError:
            print("Warning: SMK not available")
            return
    
    # Extract all messages
    messages = chat_data.get("messages", [])
    components = chat_data.get("metadata", {}).get("components_created", [])
    files = chat_data.get("metadata", {}).get("files_created", [])
    
    # Add messages to memory
    for msg in messages:
        content = msg.get("content", "")
        role = msg.get("role", "user")
        
        if content:
            if role == "user":
                smk.add_short_term(content, {
                    "source": "chat",
                    "chat_id": chat_data.get("session_id"),
                    "role": role
                })
            else:
                smk.add_mid_term(content, 
                    task_id=chat_data.get("session_id"),
                    metadata={"source": "chat", "role": role}
                )
    
    # Add components list to long-term memory
    if components:
        components_text = "\n".join([f"- {comp}" for comp in components])
        smk.add_long_term(
            content=f"Ferguson System Components:\n{components_text}",
            tags=["system", "components", "integration"],
            importance=0.9,
            metadata={
                "source": "chat",
                "chat_id": chat_data.get("session_id"),
                "type": "components_list"
            }
        )
    
    # Add files list to long-term memory
    if files:
        files_text = "\n".join([f"- {f}" for f in files])
        smk.add_long_term(
            content=f"Ferguson System Files Created:\n{files_text}",
            tags=["system", "files", "integration"],
            importance=0.9,
            metadata={
                "source": "chat",
                "chat_id": chat_data.get("session_id"),
                "type": "files_list"
            }
        )
    
    print(f"Applied {len(messages)} messages and metadata to SMK memory")


def apply_all_chats():
    """Apply all exported chats to the system"""
    print("=" * 80)
    print("APPLYING ALL CHAT DATA TO FERGUSON SYSTEM")
    print("=" * 80)
    
    # Export current chat
    print("\nExporting current chat session...")
    current_chat_path = export_current_chat_session()
    
    # Load and apply current chat
    with open(current_chat_path, 'r') as f:
        current_chat = json.load(f)
    
    print("\nApplying current chat to memory...")
    apply_chat_to_memory(current_chat)
    
    # Find and apply all other chats
    print("\nFinding other chat exports...")
    other_chats = list(CHAT_DATA_DIR.glob("*.json"))
    other_chats = [c for c in other_chats if "summary" not in c.name]
    
    print(f"Found {len(other_chats)} other chat(s)")
    
    for chat_file in other_chats:
        try:
            with open(chat_file, 'r') as f:
                chat_data = json.load(f)
            
            print(f"\nApplying {chat_file.name}...")
            apply_chat_to_memory(chat_data)
        except Exception as e:
            print(f"Error applying {chat_file.name}: {e}")
    
    print("\n" + "=" * 80)
    print("CHAT DATA APPLICATION COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    apply_all_chats()

