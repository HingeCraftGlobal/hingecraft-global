/**
 * Initialize Email Templates in Database
 * Creates default sequences and steps with proper email templates
 */

const db = require('../src/utils/database');
const logger = require('../src/utils/logger');

async function initializeTemplates() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 Initializing Email Templates');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Read SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '../database/init-email-templates.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    await db.query(sql);

    console.log('✅ Email templates initialized successfully\n');

    // Verify templates
    const sequences = await db.query('SELECT * FROM sequences WHERE is_active = true');
    console.log(`📊 Sequences created: ${sequences.rows.length}`);

    for (const seq of sequences.rows) {
      const steps = await db.query(
        'SELECT COUNT(*) as count FROM sequence_steps WHERE sequence_id = $1',
        [seq.id]
      );
      console.log(`   • ${seq.name}: ${steps.rows[0].count} steps`);
    }

    console.log('\n✅ Template initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing templates:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  initializeTemplates()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { initializeTemplates };
