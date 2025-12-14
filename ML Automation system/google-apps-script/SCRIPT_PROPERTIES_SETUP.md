# 🔐 Google Apps Script - Script Properties Setup

## Required Script Properties

You must configure these properties in the Google Apps Script editor:

1. **Open Google Apps Script Editor**: https://script.google.com/home/projects/1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS/edit

2. **Navigate to Project Settings**:
   - Click the gear icon (⚙️) in the left sidebar
   - Scroll down to "Script Properties"

3. **Add the following properties**:

| Property Key | Property Value |
|-------------|----------------|
| `HUBSPOT_TOKEN` | `pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39` |
| `ANYMAIL_KEY` | `pRUtyDRHSPageC2jHGbnWGpD` |
| `GMAIL_FROM_ADDRESS` | `marketingecraft@gmail.com` |
| `MONITORED_FOLDER_ID` | `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz` |

## How to Add Properties

1. In the Script Properties section, click **"Add script property"**
2. Enter the **Property key** (e.g., `HUBSPOT_TOKEN`)
3. Enter the **Property value** (e.g., `pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39`)
4. Click **"Save script property"**
5. Repeat for all 4 properties

## Verification

After adding all properties, you can verify they're loaded by running this test function in the Apps Script editor:

```javascript
function testScriptProperties() {
  const props = PropertiesService.getScriptProperties();
  Logger.log('HUBSPOT_TOKEN: ' + (props.getProperty('HUBSPOT_TOKEN') ? '✅ Set' : '❌ Missing'));
  Logger.log('ANYMAIL_KEY: ' + (props.getProperty('ANYMAIL_KEY') ? '✅ Set' : '❌ Missing'));
  Logger.log('GMAIL_FROM_ADDRESS: ' + (props.getProperty('GMAIL_FROM_ADDRESS') ? '✅ Set' : '❌ Missing'));
  Logger.log('MONITORED_FOLDER_ID: ' + (props.getProperty('MONITORED_FOLDER_ID') ? '✅ Set' : '❌ Missing'));
}
```

---

**Status:** ⚠️ **REQUIRED MANUAL STEP** - Must be completed before automation will work
