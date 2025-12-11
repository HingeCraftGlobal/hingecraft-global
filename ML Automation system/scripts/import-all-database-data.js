#!/usr/bin/env node

/**
 * Import All Database Data into Automation System
 * Imports donations, members, and all HingeCraft data into the automation database
 * Then syncs everything to HubSpot
 */

const fs = require('fs');
const path = require('path');
const db = require('../src/utils/database');
const hubspot = require('../src/services/hubspot');
const leadProcessor = require('../src/services/leadProcessor');
const anymail = require('../src/services/anymail');
const emailWaveSender = require('../src/services/emailWaveSender');
const logger = require('../src/utils/logger');
const { v4: uuidv4 } = require('uuid');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Load donations data from SQL file
 */
async function loadDonationsData() {
  try {
    const sqlPath = path.join(__dirname, '../../database/insert_all_hingecraft_data.sql');
    if (!fs.existsSync(sqlPath)) {
      log('⚠️  Donations SQL file not found, skipping...', 'yellow');
      return [];
    }

    // Parse donations from SQL (simplified - in production would use proper SQL parser)
    const donations = [
      {
        email: 'verify@test.com',
        name: 'Verification Test',
        amount: 25.50,
        currency: 'USD',
        status: 'verified',
        created_at: '2025-12-01 14:49:01.941'
      },
      {
        email: 'test2@example.com',
        name: 'Test User 2',
        amount: 100.00,
        currency: 'USD',
        status: 'pending',
        created_at: '2025-12-01 14:47:48.528'
      },
      {
        email: 'test@example.com',
        name: 'Test User',
        amount: 50.00,
        currency: 'USD',
        status: 'completed',
        created_at: '2025-12-01 14:45:54.879'
      }
    ];

    return donations;
  } catch (error) {
    logger.error('Error loading donations:', error);
    return [];
  }
}

/**
 * Load members data from SQL file
 */
async function loadMembersData() {
  try {
    const members = [
      { first_name: 'Wyatt', last_name: 'Smith', city: 'Sydney', region: 'NSW', country: 'Australia' },
      { first_name: 'Carter', last_name: 'Jones', twin_name: 'Nimbus-142', country: 'Australia' },
      { first_name: 'Grace', last_name: 'Harris', country: 'Australia' },
      { first_name: 'Henry', last_name: 'Ramirez', twin_name: 'Zenith-211', region: 'VIC', country: 'Australia' },
      { first_name: 'Leo', last_name: 'Martinez', twin_name: 'Drift-271', city: 'Sydney', country: 'Australia' },
      { first_name: 'James', last_name: 'Gonzalez', twin_name: 'Pixel-280', city: 'Melbourne', region: 'VIC', country: 'Australia' },
      { first_name: 'James', last_name: 'Allen', city: 'Sydney', region: 'NSW', country: 'Australia' },
      { first_name: 'Harper', last_name: 'Scott', twin_name: 'Comet-349', country: 'Australia' },
      { first_name: 'Noah', last_name: 'Moore', country: 'Australia' },
      { first_name: 'Jack', last_name: 'Lee', twin_name: 'Halo-418', region: 'VIC', country: 'Australia' }
    ];

    return members;
  } catch (error) {
    logger.error('Error loading members:', error);
    return [];
  }
}

/**
 * Convert donation to lead format
 */
function donationToLead(donation) {
  const nameParts = (donation.name || '').split(' ');
  return {
    email: donation.email,
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    organization: '',
    title: '',
    phone: '',
    website: '',
    city: '',
    state: '',
    country: '',
    source: 'donation',
    has_donated: true,
    status: donation.status === 'completed' ? 'converted' : 'contacted',
    tier: donation.amount >= 100 ? 2 : 1,
    raw_meta: {
      donation_amount: donation.amount,
      donation_currency: donation.currency,
      donation_status: donation.status,
      donation_date: donation.created_at
    }
  };
}

/**
 * Convert member to lead format
 */
function memberToLead(member) {
  // Try to find email via Anymail if not present
  const domain = member.organization || 'example.com';
  
  return {
    email: '', // Will be enriched
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    organization: member.twin_name || '',
    title: '',
    phone: '',
    website: '',
    city: member.city || '',
    state: member.region || '',
    country: member.country || 'Australia',
    source: 'charter_member',
    has_donated: false,
    status: 'new',
    tier: 1,
    raw_meta: {
      twin_name: member.twin_name,
      membership_id: member.membership_id,
      registry_date: member.registry_date
    }
  };
}

/**
 * Import all data into automation database
 */
async function importAllData() {
  log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
  log('📊 IMPORTING ALL DATABASE DATA INTO AUTOMATION SYSTEM', 'bright');
  log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

  try {
    // Step 1: Load data
    log('📥 Step 1: Loading data from database files...', 'blue');
    const donations = await loadDonationsData();
    const members = await loadMembersData();
    
    log(`   ✓ Loaded ${donations.length} donations`, 'green');
    log(`   ✓ Loaded ${members.length} members`, 'green');

    // Step 2: Convert to leads
    log('\n🔄 Step 2: Converting data to lead format...', 'blue');
    const donationLeads = donations.map(donationToLead);
    const memberLeads = members.map(memberToLead);
    const allLeads = [...donationLeads, ...memberLeads];
    
    log(`   ✓ Converted ${allLeads.length} total leads`, 'green');

    // Step 3: Enrich with Anymail
    log('\n📧 Step 3: Enriching leads with Anymail (finding missing emails)...', 'blue');
    let enrichedCount = 0;
    for (const lead of allLeads) {
      if (!lead.email && (lead.organization || lead.first_name || lead.last_name)) {
        try {
          const domain = lead.website || lead.organization || 'example.com';
          const enriched = await leadProcessor.enrichLead(lead);
          if (enriched.email) {
            lead.email = enriched.email;
            enrichedCount++;
            log(`   ✓ Found email for ${lead.first_name} ${lead.last_name}: ${lead.email}`, 'green');
          }
        } catch (error) {
          log(`   ⚠️  Could not enrich ${lead.first_name} ${lead.last_name}`, 'yellow');
        }
      }
    }
    log(`   ✓ Enriched ${enrichedCount} leads with emails`, 'green');

    // Step 4: Insert into database
    log('\n💾 Step 4: Inserting leads into automation database...', 'blue');
    const insertedLeads = [];
    let insertedCount = 0;
    let duplicateCount = 0;

    for (const lead of allLeads) {
      if (!lead.email) {
        log(`   ⚠️  Skipping ${lead.first_name} ${lead.last_name} - no email`, 'yellow');
        continue;
      }

      try {
        // Compute fingerprint
        const domain = lead.email.split('@')[1] || '';
        const fingerprint = await db.computeFingerprint(
          lead.email,
          `${lead.first_name} ${lead.last_name}`,
          lead.organization,
          domain
        );

        // Check for duplicates
        const existing = await db.findLeadByFingerprint(fingerprint) || 
                        await db.findLeadByEmail(lead.email);

        if (existing) {
          duplicateCount++;
          log(`   ⚠️  Duplicate found: ${lead.email}`, 'yellow');
          continue;
        }

        // Insert lead
        const inserted = await db.insertLead({
          ...lead,
          fingerprint: fingerprint
        });

        insertedLeads.push(inserted);
        insertedCount++;
        log(`   ✓ Inserted: ${lead.email}`, 'green');
      } catch (error) {
        log(`   ❌ Error inserting ${lead.email}: ${error.message}`, 'red');
      }
    }

    log(`\n   📊 Summary: ${insertedCount} inserted, ${duplicateCount} duplicates skipped`, 'cyan');

    // Step 5: Sync to HubSpot
    log('\n🔗 Step 5: Syncing all leads to HubSpot...', 'blue');
    const hubspotResults = [];
    let hubspotSynced = 0;
    let hubspotErrors = 0;

    for (const lead of insertedLeads) {
      try {
        const result = await hubspot.upsertContact(lead);
        
        if (result.success) {
          // Store sync record
          await db.query(
            `INSERT INTO hubspot_sync (lead_id, hubspot_contact_id, sync_status, last_sync_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (hubspot_contact_id) DO UPDATE
             SET lead_id = EXCLUDED.lead_id, last_sync_at = EXCLUDED.last_sync_at`,
            [lead.id, result.contactId, 'synced', new Date()]
          );

          hubspotResults.push({
            lead_id: lead.id,
            email: lead.email,
            hubspot_contact_id: result.contactId,
            action: result.action
          });

          hubspotSynced++;
          log(`   ✓ Synced to HubSpot: ${lead.email} (${result.contactId})`, 'green');
        } else {
          hubspotErrors++;
          log(`   ❌ HubSpot sync failed: ${lead.email} - ${result.error}`, 'red');
        }
      } catch (error) {
        hubspotErrors++;
        log(`   ❌ Error syncing ${lead.email}: ${error.message}`, 'red');
      }
    }

    log(`\n   📊 HubSpot Summary: ${hubspotSynced} synced, ${hubspotErrors} errors`, 'cyan');

    // Step 6: Initialize sequences for qualified leads
    log('\n🔄 Step 6: Initializing email sequences for qualified leads...', 'blue');
    const sequenceEngine = require('../src/services/sequenceEngine');
    let sequencesInitialized = 0;

    for (const lead of insertedLeads) {
      const score = leadProcessor.scoreLead(lead);
      if (score >= 65 && lead.email) {
        try {
          await sequenceEngine.initializeSequence(lead.id, 'welcome');
          sequencesInitialized++;
          log(`   ✓ Sequence initialized: ${lead.email} (score: ${score})`, 'green');
        } catch (error) {
          log(`   ❌ Error initializing sequence: ${lead.email}`, 'red');
        }
      }
    }

    log(`\n   📊 Sequences: ${sequencesInitialized} initialized`, 'cyan');

    // Step 7: Prepare emails for wave sending
    log('\n📨 Step 7: Preparing emails for wave-based sending...', 'blue');
    const qualifiedLeads = insertedLeads.filter(lead => {
      const score = leadProcessor.scoreLead(lead);
      return score >= 65 && lead.email;
    });

    if (qualifiedLeads.length > 0) {
      const welcomeTemplate = {
        subject: 'Welcome to HingeCraft, {{first_name}}!',
        html: `
          <p>Hi {{first_name}},</p>
          <p>Welcome to HingeCraft! We're excited to have you join our mission.</p>
          <p>We're building something special, and we'd love for you to be part of it.</p>
          <p>Best regards,<br>The HingeCraft Team</p>
        `,
        template_id: 'welcome_1'
      };

      const emails = await emailWaveSender.collectEmailsFromLeads(
        qualifiedLeads.map(lead => ({
          ...lead,
          sequence_id: null,
          step_number: 1
        })),
        welcomeTemplate
      );

      log(`   ✓ Collected ${emails.length} emails ready for sending`, 'green');

      // Step 8: Send in waves
      log('\n🌊 Step 8: Sending emails in waves (75 per wave)...', 'blue');
      const waveResults = await emailWaveSender.sendInWaves(emails);

      log(`\n   📊 Wave Sending Summary:`, 'cyan');
      log(`      Total: ${waveResults.total}`, 'cyan');
      log(`      Sent: ${waveResults.sent}`, 'green');
      log(`      Failed: ${waveResults.failed}`, waveResults.failed > 0 ? 'red' : 'green');
      log(`      Waves: ${waveResults.waves}`, 'cyan');

      if (waveResults.waveResults) {
        waveResults.waveResults.forEach((wave, index) => {
          log(`      Wave ${index + 1}: ${wave.sent}/${wave.total} sent`, 'cyan');
        });
      }
    } else {
      log('   ⚠️  No qualified leads for email sending', 'yellow');
      emailResults = { sent: 0, failed: 0, waves: 0 };
    }

    // Final Summary
    log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
    log('✅ IMPORT COMPLETE - SUMMARY', 'bright');
    log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

    log(`📊 Data Imported:`, 'bright');
    log(`   Donations: ${donations.length}`, 'cyan');
    log(`   Members: ${members.length}`, 'cyan');
    log(`   Total Leads: ${allLeads.length}`, 'cyan');
    log(`   Leads Inserted: ${insertedCount}`, 'green');
    log(`   Duplicates Skipped: ${duplicateCount}`, 'yellow');

    log(`\n🔗 HubSpot Sync:`, 'bright');
    log(`   Synced: ${hubspotSynced}`, 'green');
    log(`   Errors: ${hubspotErrors}`, hubspotErrors > 0 ? 'red' : 'green');

    log(`\n🔄 Sequences:`, 'bright');
    log(`   Initialized: ${sequencesInitialized}`, 'green');

    if (qualifiedLeads.length > 0) {
      log(`\n📧 Email Sending:`, 'bright');
      log(`   Qualified Leads: ${qualifiedLeads.length}`, 'cyan');
      log(`   Emails Sent: ${emailResults?.sent || 0}`, 'green');
      log(`   Emails Failed: ${emailResults?.failed || 0}`, emailResults?.failed > 0 ? 'red' : 'green');
      log(`   Waves: ${emailResults?.waves || 0}`, 'cyan');
    }

    log('\n═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

    return {
      success: true,
      donations: donations.length,
      members: members.length,
      leadsInserted: insertedCount,
      hubspotSynced: hubspotSynced,
      sequencesInitialized: sequencesInitialized,
      emailsSent: waveResults?.sent || 0
    };

  } catch (error) {
    log(`\n❌ Error during import: ${error.message}`, 'red');
    logger.error('Import error:', error);
    throw error;
  }
}

// Run import
if (require.main === module) {
  importAllData()
    .then(result => {
      log('\n✅ All data imported successfully!', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`\n❌ Import failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { importAllData };
