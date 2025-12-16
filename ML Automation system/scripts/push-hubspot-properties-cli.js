#!/usr/bin/env node

/**
 * Push HubSpot Properties via CLI
 * 
 * Creates all HubSpot properties using HubSpot API
 */

const fs = require('fs');
const path = require('path');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

// HubSpot Properties from this chat session
const HUBSPOT_PROPERTIES = {
  contacts: [
    // AnyMail & Source
    { name: 'anymail_source_type', label: 'AnyMail Source Type', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'automation_anymail_enriched', label: 'AnyMail Enriched Status', type: 'bool', fieldType: 'booleancheckbox', groupName: 'contactinformation', options: [{ label: 'Enriched', value: 'true', displayOrder: 0 }, { label: 'Not Enriched', value: 'false', displayOrder: 1 }] },
    
    // Sequence Management
    { name: 'automation_next_email_step', label: 'Automation Next Email Step', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'automation_next_send_timestamp', label: 'Automation Next Send Timestamp', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'automation_template_set', label: 'Automation Template Set', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'automation_lead_type', label: 'Automation Lead Type', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'automation_emails_sent', label: 'Automation Emails Sent', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'automation_source', label: 'Automation Source', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'automation_source_file_id', label: 'Automation Source File ID', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'automation_ingested_at', label: 'Automation Ingested At', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' },
    { name: 'automation_last_email_sent', label: 'Automation Last Email Sent', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' },
    
    // Email Status
    { name: 'send_email_ready', label: 'Send Email Ready (Automation)', type: 'bool', fieldType: 'booleancheckbox', groupName: 'contactinformation', options: [{ label: 'True', value: 'true', displayOrder: 0 }, { label: 'False', value: 'false', displayOrder: 1 }] },
    { name: 'last_contact_sent_date', label: 'Last Contact Sent Date', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' },
    
    // Segmentation Data
    { name: 'original_sheet_data_segment_1', label: 'Segment Data 1 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'original_sheet_data_segment_2', label: 'Segment Data 2 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'original_sheet_data_segment_3', label: 'Segment Data 3 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'original_sheet_data_segment_4', label: 'Segment Data 4 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'original_sheet_data_segment_5', label: 'Segment Data 5 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    
    // Tracking
    { name: 'total_emails_opened', label: 'Total Emails Opened', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'total_clicks', label: 'Total Clicks', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'sequence_replied', label: 'Replied to Sequence', type: 'bool', fieldType: 'booleancheckbox', groupName: 'contactinformation', options: [{ label: 'Replied', value: 'true', displayOrder: 0 }, { label: 'No Reply', value: 'false', displayOrder: 1 }] },
    { name: 'last_email_opened_at', label: 'Last Email Opened At', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' },
    { name: 'last_link_clicked_at', label: 'Last Link Clicked At', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' }
  ],
  companies: [
    { name: 'original_sheet_url', label: 'Original Sheet URL', type: 'string', fieldType: 'text', groupName: 'companyinformation' },
    { name: 'email_finder_status', label: 'Email Finder Status', type: 'string', fieldType: 'text', groupName: 'companyinformation' }
  ]
};

async function createHubSpotProperty(objectType, property) {
  if (!HUBSPOT_TOKEN) {
    console.log('❌ HUBSPOT_TOKEN not set');
    return false;
  }
  
  const url = `https://api.hubapi.com/crm/v3/properties/${objectType}`;
  const payload = {
    name: property.name,
    label: property.label,
    type: property.type,
    fieldType: property.fieldType,
    groupName: property.groupName
  };
  
  // Add options for boolean properties
  if (property.options) {
    payload.options = property.options;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log(`✅ Created property: ${property.name} on ${objectType}`);
      return true;
    } else if (response.status === 409) {
      console.log(`⚠️  Property ${property.name} already exists. Skipping.`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed to create property ${property.name}: ${response.status} - ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error creating property ${property.name}: ${error.message}`);
    return false;
  }
}

async function pushAllHubSpotProperties() {
  console.log('📝 Pushing HubSpot Properties via CLI\n');
  console.log('='.repeat(60) + '\n');
  
  if (!HUBSPOT_TOKEN) {
    console.log('❌ HUBSPOT_TOKEN not set in environment');
    console.log('   Set HUBSPOT_TOKEN in .env file or environment variables\n');
    return false;
  }
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  // Create contact properties
  console.log('📋 Creating Contact Properties...\n');
  for (const prop of HUBSPOT_PROPERTIES.contacts) {
    const result = await createHubSpotProperty('contacts', prop);
    if (result) {
      if (result === true) created++;
      else skipped++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Create company properties
  console.log('\n📋 Creating Company Properties...\n');
  for (const prop of HUBSPOT_PROPERTIES.companies) {
    const result = await createHubSpotProperty('companies', prop);
    if (result) {
      if (result === true) created++;
      else skipped++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⚠️  Skipped (already exist): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
  
  // Save properties to file
  const propsFile = path.join(__dirname, '../hubspot-properties-reference.json');
  fs.writeFileSync(propsFile, JSON.stringify(HUBSPOT_PROPERTIES, null, 2));
  console.log('📄 Properties reference saved to:', propsFile + '\n');
  
  return failed === 0;
}

async function main() {
  const success = await pushAllHubSpotProperties();
  
  if (success) {
    console.log('✅ HubSpot properties setup complete!\n');
  } else {
    console.log('⚠️  Some properties failed to create. Check errors above.\n');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { pushAllHubSpotProperties, HUBSPOT_PROPERTIES };
