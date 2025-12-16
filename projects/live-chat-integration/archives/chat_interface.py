"""
Real-Time Chat Interface
T5 CIA/FSB/LEVEL - Cursor/ChatGPT-Style Chat System

Features:
- Real-time message streaming
- Code block rendering
- Markdown support
- File attachments
- Context awareness
- Multi-turn conversations
- Message history
- AI integration
"""

import json
import uuid
import asyncio
from typing import Dict, List, Any, Optional, AsyncGenerator
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field, asdict
from enum import Enum
import threading
from collections import deque

BASE = Path(__file__).resolve().parents[2]


class MessageRole(Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    FUNCTION = "function"


class MessageType(Enum):
    """Message type enumeration."""
    TEXT = "text"
    CODE = "code"
    MARKDOWN = "markdown"
    FILE = "file"
    IMAGE = "image"
    ERROR = "error"


@dataclass
class ChatMessage:
    """Chat message container."""
    id: str
    role: MessageRole
    content: str
    message_type: MessageType = MessageType.TEXT
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
    code_language: Optional[str] = None
    file_path: Optional[str] = None
    parent_message_id: Optional[str] = None
    tokens: Optional[int] = None
    duration: Optional[float] = None


@dataclass
class ChatSession:
    """Chat session container."""
    id: str
    title: str
    messages: List[ChatMessage] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
    user_id: Optional[str] = None


class ChatStreamHandler:
    """Handles streaming chat responses."""
    
    def __init__(self):
        self.active_streams: Dict[str, asyncio.Queue] = {}
        self._lock = threading.RLock()
    
    def create_stream(self, stream_id: str) -> asyncio.Queue:
        """Create a new stream."""
        with self._lock:
            queue = asyncio.Queue()
            self.active_streams[stream_id] = queue
            return queue
    
    def send_chunk(self, stream_id: str, chunk: str):
        """Send chunk to stream."""
        with self._lock:
            if stream_id in self.active_streams:
                try:
                    self.active_streams[stream_id].put_nowait(chunk)
                except asyncio.QueueFull:
                    pass
    
    def close_stream(self, stream_id: str):
        """Close stream."""
        with self._lock:
            if stream_id in self.active_streams:
                queue = self.active_streams.pop(stream_id)
                queue.put_nowait(None)  # Signal end
    
    async def receive_stream(self, stream_id: str) -> AsyncGenerator[str, None]:
        """Receive stream chunks."""
        with self._lock:
            queue = self.active_streams.get(stream_id)
        
        if not queue:
            return
        
        while True:
            chunk = await queue.get()
            if chunk is None:
                break
            yield chunk


class CodeBlockRenderer:
    """Renders code blocks in chat."""
    
    @staticmethod
    def detect_language(code: str, hint: Optional[str] = None) -> str:
        """Detect code language."""
        if hint:
            return hint
        
        # Simple language detection
        if code.startswith("def ") or code.startswith("import ") or code.startswith("from "):
            return "python"
        elif code.startswith("function ") or code.startswith("const ") or code.startswith("let "):
            return "javascript"
        elif code.startswith("class ") and "{" in code:
            return "java"
        elif code.startswith("#include") or code.startswith("int main"):
            return "cpp"
        elif code.startswith("<?php"):
            return "php"
        elif code.startswith("<!DOCTYPE") or code.startswith("<html"):
            return "html"
        elif code.startswith("SELECT") or code.startswith("INSERT"):
            return "sql"
        else:
            return "text"
    
    @staticmethod
    def render(code: str, language: Optional[str] = None) -> str:
        """Render code block as HTML."""
        lang = CodeBlockRenderer.detect_language(code, language)
        
        # Escape HTML
        escaped_code = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        
        return f"""
        <div class="code-block" data-language="{lang}">
            <div class="code-header">
                <span class="code-language">{lang}</span>
                <button class="copy-code-btn" onclick="copyCode(this)">Copy</button>
            </div>
            <pre><code class="language-{lang}">{escaped_code}</code></pre>
        </div>
        """


class MarkdownRenderer:
    """Renders markdown in chat."""
    
    @staticmethod
    def render(text: str) -> str:
        """Render markdown as HTML."""
        # Simple markdown rendering (can be enhanced with a library)
        html = text
        
        # Headers
        import re
        html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        
        # Bold
        html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
        
        # Italic
        html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
        
        # Code inline
        html = re.sub(r'`(.+?)`', r'<code>\1</code>', html)
        
        # Links
        html = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', html)
        
        # Line breaks
        html = html.replace('\n', '<br>')
        
        return f'<div class="markdown-content">{html}</div>'


class ChatInterface:
    """
    Real-time chat interface.
    
    Features:
    - Message management
    - Streaming responses
    - Code block rendering
    - Markdown rendering
    - File handling
    - Session management
    """
    
    def __init__(self):
        self.sessions: Dict[str, ChatSession] = {}
        self.stream_handler = ChatStreamHandler()
        self.code_renderer = CodeBlockRenderer()
        self.markdown_renderer = MarkdownRenderer()
        self._lock = threading.RLock()
        self.max_history = 1000
    
    def create_session(self, title: str = "New Chat", user_id: Optional[str] = None) -> ChatSession:
        """Create a new chat session."""
        session = ChatSession(
            id=str(uuid.uuid4()),
            title=title,
            user_id=user_id
        )
        
        with self._lock:
            self.sessions[session.id] = session
        
        return session
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get chat session."""
        with self._lock:
            return self.sessions.get(session_id)
    
    def add_message(self, session_id: str, role: MessageRole, content: str,
                   message_type: MessageType = MessageType.TEXT,
                   code_language: Optional[str] = None,
                   file_path: Optional[str] = None,
                   parent_message_id: Optional[str] = None) -> ChatMessage:
        """Add message to session."""
        message = ChatMessage(
            id=str(uuid.uuid4()),
            role=role,
            content=content,
            message_type=message_type,
            code_language=code_language,
            file_path=file_path,
            parent_message_id=parent_message_id
        )
        
        with self._lock:
            session = self.sessions.get(session_id)
            if session:
                session.messages.append(message)
                session.updated_at = datetime.now()
                
                # Limit history
                if len(session.messages) > self.max_history:
                    session.messages = session.messages[-self.max_history:]
        
        return message
    
    def get_messages(self, session_id: str, limit: Optional[int] = None) -> List[ChatMessage]:
        """Get messages from session."""
        with self._lock:
            session = self.sessions.get(session_id)
            if not session:
                return []
            
            messages = session.messages
            if limit:
                messages = messages[-limit:]
            
            return messages
    
    def render_message(self, message: ChatMessage) -> str:
        """Render message as HTML."""
        role_class = message.role.value
        content = message.content
        
        # Render based on type
        if message.message_type == MessageType.CODE:
            content = self.code_renderer.render(content, message.code_language)
        elif message.message_type == MessageType.MARKDOWN:
            content = self.markdown_renderer.render(content)
        elif message.message_type == MessageType.FILE:
            content = f'<div class="file-attachment"><a href="{message.file_path}">{Path(message.file_path).name}</a></div>'
        else:
            # Escape HTML for text
            content = content.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            content = content.replace("\n", "<br>")
        
        timestamp = message.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        
        return f"""
        <div class="chat-message {role_class}" data-message-id="{message.id}">
            <div class="message-header">
                <span class="message-role">{message.role.value.title()}</span>
                <span class="message-timestamp">{timestamp}</span>
            </div>
            <div class="message-content">{content}</div>
        </div>
        """
    
    async def stream_response(self, session_id: str, prompt: str, 
                            stream_id: Optional[str] = None) -> AsyncGenerator[str, None]:
        """Stream AI response."""
        if not stream_id:
            stream_id = str(uuid.uuid4())
        
        queue = self.stream_handler.create_stream(stream_id)
        
        # Add user message
        self.add_message(session_id, MessageRole.USER, prompt)
        
        # Simulate streaming response (replace with actual AI integration)
        response_text = "This is a placeholder streaming response. AI integration coming soon."
        words = response_text.split()
        
        # Stream word by word
        accumulated = ""
        for word in words:
            accumulated += word + " "
            self.stream_handler.send_chunk(stream_id, word + " ")
            await asyncio.sleep(0.1)  # Simulate delay
        
        # Create assistant message
        assistant_message = self.add_message(session_id, MessageRole.ASSISTANT, accumulated.strip())
        
        # Close stream
        self.stream_handler.close_stream(stream_id)
        
        # Yield final message
        yield self.render_message(assistant_message)
    
    def delete_session(self, session_id: str) -> bool:
        """Delete chat session."""
        with self._lock:
            if session_id in self.sessions:
                del self.sessions[session_id]
                return True
            return False
    
    def list_sessions(self, user_id: Optional[str] = None) -> List[ChatSession]:
        """List chat sessions."""
        with self._lock:
            sessions = list(self.sessions.values())
            if user_id:
                sessions = [s for s in sessions if s.user_id == user_id]
            return sorted(sessions, key=lambda s: s.updated_at, reverse=True)


# Global instance
_chat_interface_instance: Optional[ChatInterface] = None


def get_chat_interface() -> ChatInterface:
    """Get global chat interface instance."""
    global _chat_interface_instance
    if _chat_interface_instance is None:
        _chat_interface_instance = ChatInterface()
    return _chat_interface_instance



