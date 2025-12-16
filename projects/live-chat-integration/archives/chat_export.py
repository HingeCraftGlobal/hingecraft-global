"""
Chat Export/Import System
Exports chat data and integrates it into the system
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

BASE = Path(__file__).resolve().parents[1]
CHAT_DATA_DIR = BASE / "data" / "chats"


class ChatExporter:
    """Export and import chat data"""
    
    def __init__(self, base_path: Path = BASE):
        self.base_path = base_path
        self.chat_data_dir = CHAT_DATA_DIR
        self.chat_data_dir.mkdir(parents=True, exist_ok=True)
    
    def export_chat(self, chat_data: Dict[str, Any], chat_id: str = None) -> str:
        """
        Export chat data to JSON
        
        Args:
            chat_data: Chat data dictionary
            chat_id: Optional chat ID (generated if not provided)
        
        Returns:
            Path to exported file
        """
        if chat_id is None:
            chat_id = f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        export_data = {
            "chat_id": chat_id,
            "exported_at": datetime.now().isoformat(),
            "data": chat_data
        }
        
        export_path = self.chat_data_dir / f"{chat_id}.json"
        with open(export_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        return str(export_path)
    
    def import_chat(self, chat_id: str) -> Dict[str, Any]:
        """Import chat data from JSON"""
        import_path = self.chat_data_dir / f"{chat_id}.json"
        
        if not import_path.exists():
            raise FileNotFoundError(f"Chat {chat_id} not found")
        
        with open(import_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def list_chats(self) -> List[Dict[str, Any]]:
        """List all exported chats"""
        chats = []
        for chat_file in self.chat_data_dir.glob("*.json"):
            try:
                with open(chat_file, 'r', encoding='utf-8') as f:
                    chat_data = json.load(f)
                    chats.append({
                        "chat_id": chat_data.get("chat_id", chat_file.stem),
                        "exported_at": chat_data.get("exported_at"),
                        "file": str(chat_file)
                    })
            except Exception:
                pass
        
        return sorted(chats, key=lambda x: x.get("exported_at", ""), reverse=True)
    
    def integrate_chat_to_memory(self, chat_id: str, smk=None):
        """
        Integrate chat data into SMK memory
        
        Args:
            chat_id: Chat ID to integrate
            smk: Optional SMK instance
        """
        chat_data = self.import_chat(chat_id)
        
        if smk is None:
            try:
                from ai.memory.smk import SMK
                smk = SMK()
            except ImportError:
                print("Warning: SMK not available")
                return
        
        # Extract messages from chat
        messages = chat_data.get("data", {}).get("messages", [])
        
        for msg in messages:
            content = msg.get("content", "")
            role = msg.get("role", "user")
            
            if content:
                # Add to appropriate memory
                if role == "user":
                    smk.add_short_term(content, {"source": "chat", "chat_id": chat_id})
                else:
                    smk.add_mid_term(content, task_id=chat_id, metadata={"source": "chat"})
        
        print(f"Integrated {len(messages)} messages from chat {chat_id} into memory")
    
    def create_chat_summary(self, chat_id: str) -> Dict[str, Any]:
        """Create summary of chat"""
        chat_data = self.import_chat(chat_id)
        messages = chat_data.get("data", {}).get("messages", [])
        
        user_messages = [m for m in messages if m.get("role") == "user"]
        assistant_messages = [m for m in messages if m.get("role") == "assistant"]
        
        # Extract key topics
        all_content = " ".join([m.get("content", "") for m in messages])
        
        return {
            "chat_id": chat_id,
            "total_messages": len(messages),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "exported_at": chat_data.get("exported_at"),
            "summary": all_content[:500] + "..." if len(all_content) > 500 else all_content
        }


def export_current_chat():
    """Export current chat session"""
    # This would be called from the chat interface
    # For now, create a template
    current_chat = {
        "session_id": f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "messages": [
            {
                "role": "system",
                "content": "Ferguson System Chat Export",
                "timestamp": datetime.now().isoformat()
            }
        ],
        "metadata": {
            "exported_from": "ferguson-system",
            "version": "1.0.0"
        }
    }
    
    exporter = ChatExporter()
    chat_id = exporter.export_chat(current_chat)
    print(f"Chat exported to: {chat_id}")
    return chat_id


if __name__ == "__main__":
    exporter = ChatExporter()
    
    # List existing chats
    chats = exporter.list_chats()
    print(f"Found {len(chats)} exported chats")
    
    for chat in chats[:5]:
        print(f"  - {chat['chat_id']}: {chat.get('exported_at', 'Unknown date')}")

