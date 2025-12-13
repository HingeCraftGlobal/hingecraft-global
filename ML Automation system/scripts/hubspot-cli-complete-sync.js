#!/usr/bin/env node

/**
 * HubSpot CLI Complete Sync
 * Syncs all data, segments, and updates to HubSpot via CLI and API
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const { execSync } = require('child_process');
const path = require('path');
const config = require('../config/api_keys');
const hubspotOptimizedSync = require('../src/services/hubspotOptimizedSync');
const hubspotCompleteSetup = require('../src/services/hubspotCompleteSetup');
const db = require('../src/utils/database');
const logger = require('../src/utils/logger');

async function syncAllSegments() {
  try {
    logger.info('Syncing all segments to HubSpot...');

    // Get all unique segments from lead_segments
    const segmentsResult = await db.query(`
      SELECT DISTINCT 
        segment_name,
        segment_type,
        COUNT(*) as lead_count
      FROM lead_segments
      GROUP BY segment_name, segment_type
      ORDER BY lead_count DESC
    `);

    const segments = segmentsResult.rows;
    logger.info(`Found ${segments.length} segments to sync`);

    // Create lists in HubSpot for each segment
    const hubspotLists = [];
    for (const segment of segments) {
      try {
        // Get leads in this segment
        const leadsResult = await db.query(`
          SELECT l.email, l.first_name, l.last_name
          FROM leads l
          JOIN lead_segments ls ON l.id = ls.lead_id
          WHERE ls.segment_name = $1 AND ls.segment_type = $2
        `, [segment.segment_name, segment.segment_type]);

        const emails = leadsResult.rows.map(r => r.email).filter(e => e);

        if (emails.length > 0) {
          // Create HubSpot list
          const listName = `Automation: ${segment.segment_name} (${segment.segment_type})`;
          
          // Use HubSpot API to create list
          const axios = require('axios');
          const apiKey = config.hubspot.personalAccessKey;
          
          // First, create the list
          const createResponse = await axios.post(
            'https://api.hubapi.com/contacts/v1/lists',
            {
              name: listName,
              dynamic: false
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const listId = createResponse.data.listId;

          // Add contacts to list (batch)
          const batchSize = 100;
          for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            await axios.post(
              `https://api.hubapi.com/contacts/v1/lists/${listId}/add`,
              {
                emails: batch
              },
              {
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );
          }

          hubspotLists.push({
            segment_name: segment.segment_name,
            segment_type: segment.segment_type,
            list_id: listId,
            list_name: listName,
            contact_count: emails.length
          });

          logger.info(`Created HubSpot list: ${listName} with ${emails.length} contacts`);
        }
      } catch (error) {
        logger.error(`Error syncing segment ${segment.segment_name}:`, error.message);
      }
    }

    return {
      success: true,
      segments_synced: hubspotLists.length,
      total_segments: segments.length,
      lists: hubspotLists
    };
  } catch (error) {
    logger.error('Error syncing segments:', error);
    throw error;
  }
}

async function completeHubSpotSync() {
  try {
    console.log('\n🚀 HUBSPOT CLI COMPLETE SYNC');
    console.log('='.repeat(70));
    console.log('');

    // Step 1: Test HubSpot CLI connection
    console.log('📋 Step 1: Testing HubSpot CLI connection...');
    try {
      execSync('hs --version', { stdio: 'ignore' });
      console.log('✅ HubSpot CLI installed');
    } catch (error) {
      console.log('⚠️  HubSpot CLI not found, using API only');
    }

    // Step 2: Authenticate with HubSpot CLI
    console.log('');
    console.log('📋 Step 2: Authenticating with HubSpot...');
    const apiKey = config.hubspot.personalAccessKey;
    if (apiKey) {
      try {
        // Test API connection
        const axios = require('axios');
        await axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ HubSpot API connection verified');
      } catch (error) {
        console.log('❌ HubSpot API connection failed');
        throw error;
      }
    }

    // Step 3: Complete HubSpot setup (properties, data sync)
    console.log('');
    console.log('📋 Step 3: Running complete HubSpot setup...');
    const setupResult = await hubspotCompleteSetup.completeSetup();
    console.log(`✅ Properties: ${setupResult.properties.created} created, ${setupResult.properties.existing} existing`);
    console.log(`✅ Leads: ${setupResult.leads.synced}/${setupResult.leads.total} synced`);

    // Step 4: Sync all segments
    console.log('');
    console.log('📋 Step 4: Syncing all segments to HubSpot...');
    const segmentsResult = await syncAllSegments();
    console.log(`✅ Segments: ${segmentsResult.segments_synced}/${segmentsResult.total_segments} synced`);

    // Step 5: Full optimized sync
    console.log('');
    console.log('📋 Step 5: Running full optimized sync...');
    const syncResult = await hubspotOptimizedSync.fullSyncOptimized();
    console.log(`✅ Full sync complete: ${syncResult.apiCallsUsed} API calls used`);

    // Step 6: Summary
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ HUBSPOT COMPLETE SYNC FINISHED!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Properties: ${setupResult.properties.created + setupResult.properties.existing} total`);
    console.log(`   Leads Synced: ${setupResult.leads.synced}`);
    console.log(`   Segments Synced: ${segmentsResult.segments_synced}`);
    console.log(`   API Calls Used: ${syncResult.apiCallsUsed || setupResult.apiCallsUsed}`);
    console.log(`   API Usage: ${((syncResult.apiCallsUsed || setupResult.apiCallsUsed) / 250000 * 100).toFixed(3)}%`);
    console.log('');
    console.log('🎯 View in HubSpot:');
    console.log('   - Contacts: https://app-na2.hubspot.com/contacts');
    console.log('   - Lists: https://app-na2.hubspot.com/contacts/lists');
    console.log('   - Properties: https://app-na2.hubspot.com/settings/contacts/properties');
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
  completeHubSpotSync();
}

module.exports = { completeHubSpotSync, syncAllSegments };
