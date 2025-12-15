/**
 * Update All Components to Same Version Level
 * Ensures consistency across entire system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SYSTEM_VERSION = '1.0.0';
const FROM_EMAIL = 'marketingecraft@gmail.com';
const TO_EMAIL = 'chandlerferguson319@gmail.com';

const UPDATES = {
  filesUpdated: [],
  errors: []
};

/**
 * Update email addresses in file
 */
function updateEmailAddresses(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Only update if it's a FROM address reference (not test/TO addresses)
    const fromPatterns = [
      /GMAIL_FROM_ADDRESS.*marketingecraft@gmail.com/g,
      /FROM_EMAIL.*marketingecraft@gmail.com/g,
      /from:\s*['"]chandlerferguson319@gmail.com['"]/gi,
      /From:\s*chandlerferguson319@gmail.com/gi
    ];
    
    fromPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          return match.replace('chandlerferguson319@gmail.com', FROM_EMAIL);
        });
        updated = true;
      }
    });
    
    // Update documentation that incorrectly shows FROM as chandlerferguson319
    if (filePath.endsWith('.md') || filePath.endsWith('.html')) {
      // Only update if it's clearly a FROM address context
      content = content.replace(
        /- \*\*From:\*\* chandlerferguson319@gmail.com/g,
        `- **From:** ${FROM_EMAIL}`
      );
      content = content.replace(
        /From: marketingecraft@gmail.com/g,
        `From: ${FROM_EMAIL}`
      );
      if (content.includes('chandlerferguson319@gmail.com') && content.includes('FROM')) {
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      UPDATES.filesUpdated.push(filePath);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    UPDATES.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Update package.json version
 */
function updatePackageVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      if (pkg.version !== SYSTEM_VERSION) {
        pkg.version = SYSTEM_VERSION;
        fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
        UPDATES.filesUpdated.push(packagePath);
        console.log(`✅ Updated package.json version to ${SYSTEM_VERSION}`);
      }
    } catch (error) {
      UPDATES.errors.push({ file: packagePath, error: error.message });
    }
  }
}

/**
 * Recursively update files
 */
function updateDirectory(dir, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip certain directories
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === 'dist' || 
          entry.name === 'build' ||
          entry.name === '.git') {
        continue;
      }
      
      if (entry.isDirectory()) {
        updateDirectory(fullPath, depth + 1, maxDepth);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        // Update .js, .gs, .md, .html, .json files
        if (['.js', '.gs', '.md', '.html', '.json', '.txt'].includes(ext)) {
          // Skip test files that should have chandlerferguson319 as TO address
          if (!entry.name.includes('test-live') && !entry.name.includes('TEST_CONFIG')) {
            updateEmailAddresses(fullPath);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error updating directory ${dir}: ${error.message}`);
  }
}

/**
 * Verify Google Apps Script code
 */
function verifyAppsScriptCode() {
  const codePath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
  if (fs.existsSync(codePath)) {
    try {
      const content = fs.readFileSync(codePath, 'utf8');
      
      // Verify FROM email
      if (!content.includes(`GMAIL_FROM_ADDRESS: '${FROM_EMAIL}'`)) {
        console.log('⚠️ Warning: Code.gs FROM email may need verification');
      }
      
      // Verify sequence functions exist
      const requiredFunctions = [
        'getContactsReadyForNextStep',
        'sequenceManager',
        'processReferralSequences',
        'advanceContactSequence',
        'qualifyLeadFromData'
      ];
      
      requiredFunctions.forEach(func => {
        if (!content.includes(`function ${func}`)) {
          console.log(`⚠️ Warning: Missing function ${func} in Code.gs`);
        }
      });
      
    } catch (error) {
      console.error(`Error verifying Apps Script: ${error.message}`);
    }
  }
}

/**
 * Main update function
 */
function updateAllComponents() {
  console.log('🔄 Updating All Components to Same Version Level...\n');
  console.log('='.repeat(80));
  
  const rootDir = path.join(__dirname, '..');
  
  // Phase 1: Update package version
  console.log('\n📦 Phase 1: Updating package version...');
  updatePackageVersion();
  
  // Phase 2: Update email addresses
  console.log('\n📧 Phase 2: Updating email addresses...');
  updateDirectory(rootDir);
  
  // Phase 3: Verify Apps Script
  console.log('\n✅ Phase 3: Verifying Apps Script code...');
  verifyAppsScriptCode();
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(80));
  console.log(`Files Updated: ${UPDATES.filesUpdated.length}`);
  console.log(`Errors: ${UPDATES.errors.length}`);
  
  if (UPDATES.filesUpdated.length > 0) {
    console.log('\n✅ Updated Files:');
    UPDATES.filesUpdated.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
  
  if (UPDATES.errors.length > 0) {
    console.log('\n❌ Errors:');
    UPDATES.errors.forEach(err => {
      console.log(`   - ${err.file}: ${err.error}`);
    });
  }
  
  console.log('\n✅ Update complete!\n');
  
  return UPDATES;
}

// Run if called directly
if (require.main === module) {
  updateAllComponents();
}

module.exports = { updateAllComponents, UPDATES };


