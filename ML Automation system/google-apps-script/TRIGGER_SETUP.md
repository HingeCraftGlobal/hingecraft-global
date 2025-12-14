# ⏰ Google Apps Script - Trigger Setup

## Primary Trigger: Time-Driven (checkFolderForNewFiles)

The `onNewFileAdded` trigger is unreliable in Google Apps Script. Use the Time-Driven trigger instead.

### Setup Steps

1. **Open Google Apps Script Editor**: 
   https://script.google.com/home/projects/1KO0ZyapRwk0k0kc42q0V6P8avc1s5TM7P24XmWR1DNGAavfIO44HR7Y_/edit

2. **Navigate to Triggers**:
   - Click the clock icon (⏰) in the left sidebar
   - Or go to: Edit → Current project's triggers

3. **Add New Trigger**:
   - Click **"+ Add Trigger"** button (bottom right)
   
4. **Configure Trigger**:
   - **Function to run**: `checkFolderForNewFiles`
   - **Event source**: `Time-driven`
   - **Type of time based trigger**: `Minutes timer`
   - **Minute interval**: `Every 5 minutes` (or your preferred interval)
   - **Failure notification settings**: `Notify me immediately`

5. **Save Trigger**:
   - Click **"Save"**

## What This Does

- Every 5 minutes, the script checks the monitored Google Drive folder for new files
- If new files are found, they are automatically processed
- Files are tracked to prevent duplicate processing

## Alternative Intervals

You can adjust the interval based on your needs:
- **Every 1 minute**: More responsive, but uses more quota
- **Every 5 minutes**: Balanced (recommended)
- **Every 15 minutes**: Less frequent, saves quota
- **Every hour**: For low-volume scenarios

## Verification

After setting up the trigger:

1. **Check Execution Logs**:
   - Go to: Executions (play icon in left sidebar)
   - You should see `checkFolderForNewFiles` running every 5 minutes

2. **Test Manually**:
   - In the Apps Script editor, select `checkFolderForNewFiles` from the function dropdown
   - Click "Run" to test immediately

---

**Status:** ⚠️ **REQUIRED MANUAL STEP** - Must be completed for automation to work
