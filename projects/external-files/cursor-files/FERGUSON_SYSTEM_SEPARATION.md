# Ferguson-System Separation Guide

**Date:** 2025-01-XX  
**Purpose:** Clarify separation between Ferguson-System and HingeCraft

---

## 🎯 System Separation

Ferguson-System and HingeCraft are **completely separate systems** with no shared components.

---

## 📁 Ferguson-System Components

### Core Location
- **Primary**: `/Users/chandlerfergusen/PycharmProjects/PythonProject/ferguson-system`
- **CURSOR Integration**: `/Users/chandlerfergusen/Desktop/CURSOR/ai/`

### Ferguson-System Only Components

#### AI Components (in `ai/` directory)
- ✅ QRCCE-FSB
- ✅ PMPS
- ✅ TCTC
- ✅ QSDE
- ✅ MAROC
- ✅ CSAL
- ✅ MRPL
- ✅ TCNR
- ✅ QVIR
- ✅ SSIF
- ✅ RASNet
- ✅ MRTS
- ✅ NSEF

#### Databases
- ✅ `sql/fma_data.db` (Ferguson-System)
- ✅ `data/ferguson_system.db` (Ferguson-System)

#### Agents
- ✅ Multi-Stage LangChain Agent (`ai/langchain_pipelines/agent.py`)
- ✅ YouTube Agent (`ai/youtube_agent/`)
- ✅ Pattern Analyzer System (`pattern_analyzer_system/`)

#### RAG System
- ✅ Embedding Systems (`ai/embedding/`)
- ✅ LangChain Pipelines (`ai/langchain_pipelines/`)
- ✅ Vector Storage (SQLite embeddings table)

#### Integrations
- ✅ Notion Integration (Ferguson-System sync blueprint)
- ✅ Obsidian Integration (`obsidian/`)
- ✅ PyCharm Connector (`ai/integration/pycharm_connector.py`)
- ✅ FastAPI Application (`ai/fastapi_app/main.py`)

---

## 🚫 NOT Ferguson-System Components

### HingeCraft Components (Separate System)
- ❌ `hingecraft-global/` directory
- ❌ HingeCraft agents (`hingecraft-global/agents/`)
- ❌ HingeCraft database schemas
- ❌ HingeCraft Notion integration
- ❌ HingeCraft RAG connector

**These are completely separate and should not be referenced in Ferguson-System documentation or scripts.**

---

## ✅ Verification

To ensure separation:

1. **Check Documentation**: No references to `hingecraft-global/` in Ferguson-System docs
2. **Check Scripts**: No paths to HingeCraft directories
3. **Check Imports**: No imports from HingeCraft modules
4. **Check Config**: No HingeCraft configuration in Ferguson-System

---

## 📝 Notes

- Ferguson-System has its own Notion integration (separate from HingeCraft)
- Ferguson-System has its own database schemas
- Ferguson-System has its own agent systems
- Ferguson-System has its own RAG components

**Keep systems completely separate.**

---

**Last Updated**: 2025-01-XX  
**Status**: ✅ Separation Documented

