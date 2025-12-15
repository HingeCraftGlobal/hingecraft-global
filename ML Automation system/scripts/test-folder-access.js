/**
 * Test Folder Access
 * Helps verify the Drive folder is accessible
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Folder Access Test Helper\n');
console.log('='.repeat(80));
console.log('\n📝 To fix the folder access error:\n');
console.log('1. Get your folder ID:');
console.log('   - Open Google Drive');
console.log('   - Open your folder');
console.log('   - Copy the ID from the URL:');
console.log('     https://drive.google.com/drive/folders/FOLDER_ID_HERE\n');
console.log('2. Set in Script Properties:');
console.log('   - Go to Apps Script Editor');
console.log('   - Project Settings → Script Properties');
console.log('   - Add: MONITORED_FOLDER_ID = [your folder ID]\n');
console.log('3. Share folder:');
console.log('   - Right-click folder → Share');
console.log('   - Add service account email');
console.log('   - Give "Editor" permission\n');
console.log('4. Test:');
console.log('   - Run checkFolderForNewFiles()');
console.log('   - Should see: "📁 Accessing folder: [name]"\n');
console.log('='.repeat(80));
console.log('\n✅ Instructions provided!\n');


