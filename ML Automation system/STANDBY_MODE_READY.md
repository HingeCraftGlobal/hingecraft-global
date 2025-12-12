# ⏸️ System Watcher - STANDBY MODE READY

**Date**: January 27, 2025  
**Status**: ✅ **STANDBY MODE - WAITING ON INPUT STAGE**

---

## ⏸️ Standby Mode Active

The system watcher is now in **STANDBY MODE** and waiting for a file to be dropped in Google Drive.

---

## 🔄 How It Works

### Current State: **WAITING ON INPUT STAGE**

1. **System Watcher**: ✅ Started in standby mode
2. **All Components**: ✅ Ready and waiting
3. **Status**: ⏸️ **STANDBY - Waiting for file input**
4. **Trigger**: Will activate automatically when file detected

### When File is Detected:

```
File Dropped in Google Drive
    ↓
Webhook Triggered
    ↓
System Watcher ACTIVATES
    ↓
Pipeline Tracking STARTS
    ↓
Complete Flow Logged
```

---

## 🚀 How to Start

### Option 1: Standalone Watcher Script

```bash
node scripts/watchSystem.js
```

**Output:**
```
🔍 HINGECRAFT ML AUTOMATION - SYSTEM WATCHER
═══════════════════════════════════════════════════════════════

✅ System watcher in STANDBY MODE
⏸️  Status: WAITING ON INPUT STAGE

📊 All components ready and waiting:
   - Google Drive (standby - waiting for file)
   - File Processor (standby - ready)
   - Lead Processor (standby - ready)
   - Anymail (standby - ready)
   - Database (standby - ready)
   - HubSpot (standby - ready)
   - Sequence Engine (standby - ready)
   - Email Wave Sender (standby - ready)

⏳ ═══════════════════════════════════════════════════════════════
⏳ WAITING FOR FILE IN GOOGLE DRIVE...
⏳ Drop a file in Google Drive folder to activate tracking
⏳ ═══════════════════════════════════════════════════════════════
```

### Option 2: Start Server (Auto-Standby)

```bash
npm start
```

The watcher automatically starts in standby mode when the server starts.

---

## 📊 Status Monitoring

### Check Status:

```bash
# View current status
node scripts/viewPipelineLogs.js status
```

### API Endpoint:

```
GET /api/pipeline/status
```

**Response:**
```json
{
  "success": true,
  "watcherActive": true,
  "mode": "standby",
  "waitingForFile": true,
  "status": "STANDBY - Waiting for file input",
  "activePipelines": 0,
  "pipelines": [],
  "componentStatus": {
    "googleDrive": {
      "status": "standby",
      "waiting": true
    },
    ...
  }
}
```

---

## 🔄 State Transitions

### Standby → Active

When a file is detected:
- ✅ Mode changes: `standby` → `active`
- ✅ `waitingForFile`: `true` → `false`
- ✅ All components: `standby` → `active`
- ✅ Pipeline tracking starts
- ✅ Full logging begins

### Active → Standby

After pipeline completes:
- Pipeline tracking ends
- System returns to standby
- Ready for next file

---

## 📝 What Happens When File is Detected

1. **File Detection** → Watcher activates
2. **Pipeline Tracking** → Starts immediately
3. **All 9 Stages** → Tracked and logged
4. **Real-time Updates** → Status displayed
5. **Complete Logging** → Every operation logged

---

## ✅ Ready Status

- ✅ **Watcher**: Standby mode active
- ✅ **Components**: All ready
- ✅ **Status**: Waiting on input stage
- ✅ **Trigger**: Auto-activates on file detection
- ✅ **Logging**: Ready to log
- ✅ **Monitoring**: Active

---

## 🎯 Next Step

**Drop a file in Google Drive folder** → System will automatically:
1. Detect the file
2. Activate watcher
3. Start tracking
4. Log everything

---

**Status**: ⏸️ **STANDBY MODE**  
**Waiting**: ✅ **YES - READY FOR FILE**  
**Auto-Activate**: ✅ **YES - ON FILE DETECTION**





