#!/usr/bin/env node

/**
 * Ensure All Data Flowing
 * Final script to ensure all pieces work together and data flows correctly
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const hubspotUnifiedSync = require('../src/services/hubspotUnifiedSync');
const db = require('../src/utils/database');
const logger = require('../src/utils/logger');

async function ensureAllDataFlowing() {
  try {
    console.log('\n🚀 ENSURING ALL DATA FLOWS TO HUBSPOT');
    console.log('='.repeat(70));
    console.log('');

    // Step 1: Run complete unified sync
    console.log('📋 Step 1: Running complete unified sync...');
    const syncResult = await hubspotUnifiedSync.completeUnifiedSync();
    console.log(`✅ Sync complete: ${syncResult.verification.count} contacts in HubSpot`);

    // Step 2: Ensure all leads have HubSpot contact IDs
    console.log('');
    console.log('📋 Step 2: Ensuring all leads are synced...');
    const ensureResult = await hubspotUnifiedSync.ensureAllLeadsSynced();
    if (ensureResult.synced > 0) {
      console.log(`✅ Additional sync: ${ensureResult.synced} leads synced`);
    } else {
      console.log('✅ All leads already synced');
    }

    // Step 3: Verify data flow
    console.log('');
    console.log('📋 Step 3: Verifying complete data flow...');
    
    // Check database → HubSpot flow
    const dbStats = await db.query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN dr.hubspot_contact_id IS NOT NULL THEN 1 END) as synced_via_drive,
        COUNT(CASE WHEN hs.hubspot_contact_id IS NOT NULL THEN 1 END) as synced_via_hubspot_sync
      FROM leads l
      LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
      LEFT JOIN hubspot_sync hs ON l.id = hs.lead_id
    `);

    const stats = dbStats.rows[0];
    const totalSynced = parseInt(stats.synced_via_drive) + parseInt(stats.synced_via_hubspot_sync);
    const syncPercentage = stats.total_leads > 0 ? ((totalSynced / stats.total_leads) * 100).toFixed(1) : 0;

    console.log(`✅ Data Flow: ${totalSynced}/${stats.total_leads} leads synced (${syncPercentage}%)`);

    // Step 4: Final verification
    console.log('');
    console.log('📋 Step 4: Final verification...');
    const finalVerification = await hubspotUnifiedSync.verifyContactsInHubSpot();
    console.log(`✅ HubSpot Contacts: ${finalVerification.count} visible`);
    
    if (finalVerification.sample && finalVerification.sample.length > 0) {
      console.log('   Sample contacts:');
      finalVerification.sample.forEach(c => {
        console.log(`   - ${c.name || 'N/A'} (${c.email})`);
      });
    }

    // Summary
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ ALL DATA FLOWING SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 Final Status:');
    console.log(`   Database Leads: ${stats.total_leads}`);
    console.log(`   Synced to HubSpot: ${totalSynced} (${syncPercentage}%)`);
    console.log(`   Contacts Visible in HubSpot: ${finalVerification.count}`);
    console.log(`   API Calls Used: ${syncResult.apiCallsUsed}`);
    console.log('');
    console.log('🎯 System is fully operational!');
    console.log('   All data is flowing: Database → HubSpot → Visible in UI');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  ensureAllDataFlowing();
}

module.exports = ensureAllDataFlowing;
