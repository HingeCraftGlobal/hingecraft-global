/**
 * Cleanup Old and Outdated Files
 * Removes unnecessary files and ensures only current system files remain
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Files to keep (core system)
const keepFiles = [
  // Core files
  'src/',
  'config/',
  'database/',
  'google-apps-script/',
  'scripts/',
  'tests/',
  'package.json',
  '.gitignore',
  '.env.example',
  'README.md',
  
  // Documentation (keep only essential)
  '📋_COMPLETE_FLOW_EXPLANATION.md',
  '✅_DATABASE_AND_FLOW_COMPLETE.md',
  '🧪_SIMULATION_TEST_RESULTS.md'
];

// Patterns to remove
const removePatterns = [
  /^✅_.*\.md$/,
  /^🎯_.*\.md$/,
  /^🚀_.*\.md$/,
  /^📋_.*\.md$/,
  /^🔍_.*\.md$/,
  /^🎉_.*\.md$/,
  /^.*_COMPLETE\.md$/,
  /^.*_STATUS\.md$/,
  /^.*_READY\.md$/,
  /^.*_SUMMARY\.md$/,
  /^.*_UPDATE\.md$/,
  /^.*_GUIDE\.md$/,
  /^.*_CHECKLIST\.md$/,
  /^.*_INSTRUCTIONS\.md$/,
  /^.*_SETUP\.md$/,
  /^SYSTEM_READY\.txt$/
];

function shouldKeep(filePath) {
  const fileName = path.basename(filePath);
  
  // Check keep list
  for (const keep of keepFiles) {
    if (filePath.includes(keep) || fileName === keep) {
      return true;
    }
  }
  
  // Check remove patterns
  for (const pattern of removePatterns) {
    if (pattern.test(fileName)) {
      // But keep essential docs
      if (keepFiles.some(k => fileName.includes(k))) {
        return true;
      }
      return false;
    }
  }
  
  // Keep everything else
  return true;
}

function cleanupDirectory(dir) {
  const files = fs.readdirSync(dir);
  let removed = 0;
  let kept = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively clean subdirectories (but skip node_modules, .git, etc.)
      if (!file.startsWith('.') && file !== 'node_modules') {
        const subRemoved = cleanupDirectory(filePath);
        removed += subRemoved;
      }
    } else {
      if (!shouldKeep(filePath)) {
        try {
          fs.unlinkSync(filePath);
          log(`Removed: ${filePath}`, 'yellow');
          removed++;
        } catch (error) {
          log(`Error removing ${filePath}: ${error.message}`, 'red');
        }
      } else {
        kept++;
      }
    }
  }
  
  return removed;
}

function main() {
  console.clear();
  log('\n🧹 CLEANUP OLD FILES\n', 'cyan');
  
  const projectDir = path.join(__dirname, '..');
  
  log('Scanning for old files...', 'yellow');
  const removed = cleanupDirectory(projectDir);
  
  log(`\n✓ Cleanup complete: ${removed} files removed`, 'green');
  log('✓ Core system files preserved', 'green');
}

if (require.main === module) {
  main();
}

module.exports = { cleanupDirectory };


