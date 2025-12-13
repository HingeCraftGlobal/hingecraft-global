#!/usr/bin/env node

/**
 * HubSpot Contact Properties Sync (Fallback)
 * Syncs automation data to contact properties only (no custom objects)
 * This works even if custom object permissions aren't available
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const hubspot = require('../src/services/hubspot');
const db = require('../src/utils/database');
const logger = require('../src/utils/logger');

async function syncContactsOnly() {
  try {
    console.log('\n🚀 HUBSPOT CONTACT PROPERTIES SYNC');
    console.log('='.repeat(70));
    console.log('Syncing automation data to contact properties...');
    console.log('');

    // Get all leads with HubSpot contact IDs
    const result = await db.query(`
      SELECT DISTINCT
        l.id as lead_id,
        l.email,
        l.lead_type,
        l.template_set,
        l.lead_score,
        l.source,
        l.created_at,
        COALESCE(
          dr.hubspot_contact_id,
          (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
        ) as hubspot_contact_id
      FROM leads l
      LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
      WHERE COALESCE(
        dr.hubspot_contact_id,
        (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
      ) IS NOT NULL
      ORDER BY l.created_at DESC
      LIMIT 100
    `);

    if (result.rows.length === 0) {
      console.log('⚠️  No leads with HubSpot contact IDs found.');
      console.log('   Make sure contacts are synced to HubSpot first.');
      return;
    }

    console.log(`📊 Found ${result.rows.length} leads to sync`);
    console.log('');

    let synced = 0;
    let failed = 0;

    for (const row of result.rows) {
      try {
        // Get sequence data
        const sequenceResult = await db.query(
          'SELECT * FROM lead_sequences WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 1',
          [row.lead_id]
        );

        // Get email stats
        const emailStatsResult = await db.query(
          `SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'opened') as opened,
            COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
            COUNT(*) FILTER (WHERE status = 'replied') as replied,
            MAX(created_at) as last_sent
          FROM email_logs WHERE lead_id = $1`,
          [row.lead_id]
        );

        const emailStats = emailStatsResult.rows[0];
        const sequence = sequenceResult.rows[0];

        // Build properties object
        const properties = {
          // Automation properties (these need to exist in HubSpot first)
          automation_lead_type: row.lead_type || '',
          automation_template_set: row.template_set || '',
          automation_lead_score: row.lead_score?.toString() || '0',
          automation_source: row.source || '',
          automation_sequence_status: sequence?.status || '',
          automation_sequence_step: sequence?.current_step?.toString() || '0',
          automation_emails_sent: emailStats.total?.toString() || '0',
          automation_emails_opened: emailStats.opened?.toString() || '0',
          automation_emails_clicked: emailStats.clicked?.toString() || '0',
          automation_emails_replied: emailStats.replied?.toString() || '0'
        };

        // Update contact via HubSpot API
        await hubspot.updateContactProperties(row.hubspot_contact_id, properties);
        
        synced++;
        process.stdout.write(`\r✅ Synced: ${synced}/${result.rows.length}`);
      } catch (error) {
        failed++;
        console.error(`\n❌ Failed to sync lead ${row.lead_id}: ${error.message}`);
      }
    }

    console.log('');
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ SYNC COMPLETE!');
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   Synced: ${synced}`);
    console.log(`   Failed: ${failed}`);
    console.log('');
    console.log('🎯 View in HubSpot:');
    console.log('   - Go to Contacts');
    console.log('   - Open any contact');
    console.log('   - Check properties starting with "automation_"');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  syncContactsOnly();
}

module.exports = syncContactsOnly;
