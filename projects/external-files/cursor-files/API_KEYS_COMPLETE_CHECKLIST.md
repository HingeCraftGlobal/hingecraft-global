# API Keys Complete Checklist - Ferguson-System

**Date:** 2025-01-XX  
**Purpose:** Comprehensive list of all API keys needed for full system functionality

---

## 🔑 Required API Keys

### 1. OpenAI API Key
- **Purpose**: LLM processing, embeddings, agent operations
- **Environment Variable**: `OPENAI_API_KEY`
- **File Locations**:
  - `.env` file in project root
  - `pattern_analyzer_system/api_keys/openai.json`
  - `pattern_analyzer_system/api_keys/openai.txt`
- **Format**: `sk-proj-...` or `sk-...`
- **Status**: ✅ Found in codebase
- **Verification**: 
  ```bash
  echo $OPENAI_API_KEY | head -c 20
  ```

### 2. Notion API Key
- **Purpose**: Notion integration, sync blueprint
- **Environment Variable**: `NOTION_TOKEN`
- **File Locations**:
  - `.env` file in project root
  - `hingecraft-global/notion/sync/hingecraft_notion_sync.py`
- **Format**: `ntn_...`
- **Current Token**: `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`
- **Notion Page ID**: `19ad872b-594c-81d7-b4fd-00024322280f` (NEW)
- **Legacy Page ID**: `2c1993783a3480e7b13be279941b67e0`
- **Status**: ✅ Configured
- **Verification**:
  ```bash
  curl -X GET 'https://api.notion.com/v1/users/me' \
    -H "Authorization: Bearer $NOTION_TOKEN" \
    -H "Notion-Version: 2022-06-28"
  ```

### 3. YouTube API Key (Optional)
- **Purpose**: YouTube Agent video discovery
- **Environment Variable**: `YOUTUBE_API_KEY`
- **File Locations**:
  - `.env` file in project root
  - `ai/youtube_agent/.env`
- **Format**: `AIza...`
- **Status**: ⚠️ Optional (Whisper can work without it)
- **Verification**:
  ```bash
  curl "https://www.googleapis.com/youtube/v3/videos?id=dQw4w9WgXcQ&key=$YOUTUBE_API_KEY&part=snippet"
  ```

### 4. Google API Credentials (Optional)
- **Purpose**: Google Docs integration, Google Cloud services
- **File Locations**:
  - `pattern_analyzer_system/credentials.json`
  - `credentials.json` in project root
  - `~/.config/google/credentials.json`
- **Format**: JSON service account file
- **Status**: ⚠️ Optional
- **Verification**: Check file exists and is valid JSON

### 5. Redis URL (Optional)
- **Purpose**: Job queue, caching
- **Environment Variable**: `REDIS_URL`
- **Default**: `redis://localhost:6379/0`
- **Status**: ⚠️ Optional (for YouTube Agent)
- **Verification**:
  ```bash
  redis-cli ping
  ```

### 6. PostgreSQL Connection (Optional)
- **Purpose**: HingeCraft database
- **Environment Variable**: `DATABASE_URL` or `POSTGRES_URL`
- **Format**: `postgresql://user:password@host:port/database`
- **Status**: ⚠️ Optional (SQLite used by default)
- **Verification**:
  ```bash
  psql $DATABASE_URL -c "SELECT version();"
  ```

---

## 📋 API Key Setup Checklist

### Step 1: Verify Current Keys
- [ ] Check OpenAI API key exists and is valid
- [ ] Check Notion API token exists and is valid
- [ ] Verify Notion Page ID is updated: `19ad872b-594c-81d7-b4fd-00024322280f`
- [ ] Test OpenAI API connection
- [ ] Test Notion API connection

### Step 2: Environment Configuration
- [ ] Create `.env` file in project root if not exists
- [ ] Add `OPENAI_API_KEY=sk-...` to `.env`
- [ ] Add `NOTION_TOKEN=ntn_...` to `.env`
- [ ] Add `NOTION_PARENT_PAGE_ID=19ad872b-594c-81d7-b4fd-00024322280f` to `.env`
- [ ] Verify `.env` file is in `.gitignore`
- [ ] Test environment variable loading

### Step 3: File-Based Configuration
- [ ] Create `pattern_analyzer_system/api_keys/` directory
- [ ] Add OpenAI key to `pattern_analyzer_system/api_keys/openai.json`
- [ ] Add OpenAI key to `pattern_analyzer_system/api_keys/openai.txt`
- [ ] Verify file permissions (read-only for others)
- [ ] Test file-based key loading

### Step 4: Integration Testing
- [ ] Test OpenAI API with a simple request
- [ ] Test Notion API with page access
- [ ] Test agent initialization with API keys
- [ ] Test RAG system with OpenAI embeddings
- [ ] Test Notion sync with API token

### Step 5: Security Verification
- [ ] Verify `.env` is not committed to git
- [ ] Verify API keys are not hardcoded in source
- [ ] Verify API keys use environment variables
- [ ] Check API key file permissions
- [ ] Review API key usage in codebase

---

## 🔍 API Key Verification Script

Run the verification script to check all API keys:

```bash
python FERGUSON_SYSTEM_VERIFICATION_SCRIPT.py
```

This will:
- Check for API keys in environment variables
- Check for API keys in configuration files
- Test API connections
- Report missing or invalid keys

---

## 📝 Notes

1. **OpenAI API Key**: Critical for all LLM operations
2. **Notion API Key**: Required for sync blueprint integration
3. **YouTube API Key**: Optional, only needed for video discovery
4. **Google Credentials**: Optional, only for Google Docs integration
5. **Redis/PostgreSQL**: Optional, only for specific features

---

## 🚨 Security Reminders

- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate API keys periodically
- Monitor API key usage for anomalies
- Use least-privilege access for API keys
- Store API keys securely (encrypted if possible)

---

**Last Updated**: 2025-01-XX  
**Status**: ✅ Complete Checklist

