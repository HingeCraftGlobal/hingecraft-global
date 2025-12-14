/**
 * HubSpot Property Creation - One-Time Setup
 * Run this function manually once to create all necessary HubSpot properties
 */

/**
 * Get configuration from Script Properties
 */
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    HUBSPOT_ACCESS_TOKEN: scriptProperties.getProperty('HUBSPOT_TOKEN') || 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39',
    HUBSPOT_PORTAL_ID: '244560986',
    HUBSPOT_API_BASE: 'https://api.hubapi.com'
  };
}

/**
 * HubSpot API Request Helper
 */
function hubspotApiRequest(url, method, payload) {
  const config = getConfig();
  const options = {
    method: method || 'get',
    headers: {
      'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };
  
  if (payload && (method === 'post' || method === 'patch' || method === 'put')) {
    options.payload = JSON.stringify(payload);
  }
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  if (responseCode >= 200 && responseCode < 300) {
    return JSON.parse(responseText);
  } else {
    throw new Error(`HubSpot API Error ${responseCode}: ${responseText}`);
  }
}

/**
 * ONE-TIME SETUP: Creates all necessary custom HubSpot properties via API.
 * This is run manually once to set up the database structure.
 * 
 * To run: Select this function in Apps Script editor and click "Run"
 */
function createHubSpotProperties() {
  const config = getConfig();
  Logger.log('🚀 Starting HubSpot Property Creation...');
  Logger.log(`Using Portal ID: ${config.HUBSPOT_PORTAL_ID}`);
  
  const propertiesToCreate = [
    // Contact Properties
    { objectType: 'contacts', name: 'anymail_source_type', label: 'AnyMail Source Type', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'last_contact_sent_date', label: 'Last Contact Sent Date', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_emails_sent', label: 'Automation Emails Sent', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_last_email_sent', label: 'Automation Last Email Sent', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'send_email_ready', label: 'Send Email Ready', type: 'bool', fieldType: 'booleancheckbox', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_source', label: 'Automation Source', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_source_file_id', label: 'Automation Source File ID', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_ingested_at', label: 'Automation Ingested At', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_anymail_enriched', label: 'Automation AnyMail Enriched', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_template_set', label: 'Automation Template Set', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_lead_type', label: 'Automation Lead Type', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    
    // Segmented Data fields (up to 10)
    { objectType: 'contacts', name: 'original_sheet_data_segment_1', label: 'Segment Data 1 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_2', label: 'Segment Data 2 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_3', label: 'Segment Data 3 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_4', label: 'Segment Data 4 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_5', label: 'Segment Data 5 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_6', label: 'Segment Data 6 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_7', label: 'Segment Data 7 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_8', label: 'Segment Data 8 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_9', label: 'Segment Data 9 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_10', label: 'Segment Data 10 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    
    // Company Properties
    { objectType: 'companies', name: 'original_sheet_url', label: 'Original Sheet URL', type: 'string', fieldType: 'text', groupName: 'companyinformation' },
    { objectType: 'companies', name: 'email_finder_status', label: 'Email Finder Status', type: 'string', fieldType: 'text', groupName: 'companyinformation' }
  ];

  let created = 0;
  let skipped = 0;
  let errors = 0;

  propertiesToCreate.forEach(prop => {
    const url = `${config.HUBSPOT_API_BASE}/crm/v3/properties/${prop.objectType}`;
    const payload = {
      name: prop.name,
      label: prop.label,
      type: prop.type,
      fieldType: prop.fieldType,
      groupName: prop.groupName
    };
    
    try {
      const result = hubspotApiRequest(url, 'post', payload);
      Logger.log(`✅ Created property: ${prop.name} on ${prop.objectType}`);
      created++;
    } catch (e) {
      const errorStr = e.toString();
      // Error code 409 means the property already exists, which is acceptable
      if (errorStr.includes('409') || errorStr.includes('CONFLICT')) {
        Logger.log(`⏭️  Property ${prop.name} already exists. Skipping.`);
        skipped++;
      } else {
        Logger.log(`❌ Failed to create property ${prop.name}: ${errorStr}`);
        errors++;
      }
    }
  });
  
  Logger.log('');
  Logger.log('='.repeat(50));
  Logger.log(`✅ HubSpot Property Creation Complete!`);
  Logger.log(`   Created: ${created}`);
  Logger.log(`   Skipped (already exist): ${skipped}`);
  Logger.log(`   Errors: ${errors}`);
  Logger.log('='.repeat(50));
}

/**
 * Test function to verify HubSpot connection
 */
function testHubSpotConnection() {
  try {
    const config = getConfig();
    const url = `${config.HUBSPOT_API_BASE}/crm/v3/objects/contacts?limit=1`;
    const result = hubspotApiRequest(url, 'get');
    Logger.log('✅ HubSpot connection successful!');
    Logger.log(`Portal ID: ${config.HUBSPOT_PORTAL_ID}`);
    return true;
  } catch (e) {
    Logger.log(`❌ HubSpot connection failed: ${e.toString()}`);
    return false;
  }
}
