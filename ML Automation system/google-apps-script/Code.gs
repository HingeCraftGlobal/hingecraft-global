/**
 * HingeCraft Automation - Google Apps Script
 * Fully automated flow: Google Drive → AnyMail → HubSpot → Gmail Send
 * 
 * Setup Instructions:
 * 1. Set Script Properties (Project Settings → Script Properties):
 *    - HUBSPOT_TOKEN: pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39
 *    - ANYMAIL_KEY: pRUtyDRHSPageC2jHGbnWGpD
 *    - GMAIL_FROM_ADDRESS: marketingecraft@gmail.com
 *    - MONITORED_FOLDER_ID: 1MpKKqjpabi10iDh1vWliaiLQsj8wktiz
 * 2. Run createHubSpotProperties() once (manual)
 * 3. Set up Time-Driven Trigger for checkFolderForNewFiles (every 5 minutes)
 */

// ============================================
// CONFIGURATION - Loaded from Script Properties
// ============================================

/**
 * Get configuration from Script Properties
 */
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    // HubSpot Configuration
    HUBSPOT_ACCESS_TOKEN: scriptProperties.getProperty('HUBSPOT_TOKEN') || 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39',
    HUBSPOT_PORTAL_ID: '244560986',
    HUBSPOT_API_BASE: 'https://api.hubapi.com',
    
    // AnyMail Configuration
    ANYMAIL_API_KEY: scriptProperties.getProperty('ANYMAIL_KEY') || 'pRUtyDRHSPageC2jHGbnWGpD',
    ANYMAIL_API_BASE: 'https://api.anymail.com/v1',
    ANYMAIL_WEBHOOK_URL: 'https://your-domain.com/api/webhooks/anymail', // Your backend webhook
    
    // Google Drive Configuration
    MONITORED_FOLDER_ID: scriptProperties.getProperty('MONITORED_FOLDER_ID') || '1MpKKqjpabi10iDh1vWliaiLQsj8wktiz',
    MONITORED_FOLDER_NAME: 'HubSpot_Leads_Input',
    
    // Gmail Configuration
    GMAIL_FROM_ADDRESS: scriptProperties.getProperty('GMAIL_FROM_ADDRESS') || 'marketingecraft@gmail.com',
    GMAIL_FROM_NAME: 'HingeCraft',
    
    // Email Templates (from database)
    TEMPLATES: {
      'set_one_student': {
        step_1: {
          subject: "You're Invited: Help Build the Future of Creativity + Sustainable Design",
          body: getStudentTemplate1()
        },
        step_2: {
          subject: "You're now part of a growing creative movement — here's what's happening",
          body: getStudentTemplate2()
        },
        step_3: {
          subject: "Follow the journey: See what students are building",
          body: getStudentTemplate3()
        },
        step_4: {
          subject: "Your turn: Join the creative challenge",
          body: getStudentTemplate4()
        },
        step_5: {
          subject: "Keep building: Resources and next steps",
          body: getStudentTemplate5()
        }
      },
      'set_two_referral': {
        step_1: {
          subject: "Partnership Opportunity: Join Our Network",
          body: getReferralTemplate1()
        }
      },
      'set_three_b2b': {
        step_1: {
          subject: "Partnership Opportunity: Let's Build Together",
          body: getB2BTemplate1()
        },
        step_2: {
          subject: "Why HingeCraft? The Value Proposition",
          body: getB2BTemplate2()
        },
        step_3: {
          subject: "Success Stories: What Partners Are Saying",
          body: getB2BTemplate3()
        },
        step_4: {
          subject: "Next Steps: How to Get Started",
          body: getB2BTemplate4()
        },
        step_5: {
          subject: "Final Call: Don't Miss This Opportunity",
          body: getB2BTemplate5()
        }
      }
    }
  };
}

// ============================================
// PHASE 1: TRIGGER AND DATA INGESTION
// ============================================

/**
 * NOTE: onNewFileAdded trigger is unreliable in Google Apps Script
 * Use checkFolderForNewFiles (Time-Driven Trigger) instead
 * This function is kept for reference but should NOT be used as a trigger
 */

/**
 * Time-Driven Trigger: checkFolderForNewFiles
 * Runs every 5 minutes to check for new files
 * Backup trigger in case onChange doesn't fire
 */
/**
 * Time-Driven Trigger: checkFolderForNewFiles
 * Runs every 5 minutes to check for new files
 * THIS IS THE PRIMARY AUTOMATION TRIGGER
 * 
 * Set up trigger:
 * - Function: checkFolderForNewFiles
 * - Event source: Time-driven
 * - Type: Minutes timer
 * - Interval: Every 5 minutes
 * 
 * FIXED: Enhanced error handling and file type checking
 */
function checkFolderForNewFiles() {
  try {
    const CONFIG = getConfig();
    Logger.log('🔍 [Drive Trigger] Checking folder for new files...');
    Logger.log(`📁 Folder ID: ${CONFIG.MONITORED_FOLDER_ID}`);
    
    // Get folder with error handling
    let folder;
    try {
      folder = DriveApp.getFolderById(CONFIG.MONITORED_FOLDER_ID);
      Logger.log(`✅ Folder found: ${folder.getName()}`);
    } catch (e) {
      Logger.log(`❌ Error accessing folder: ${e.toString()}`);
      Logger.log(`   Make sure folder ID is correct and script has access`);
      return;
    }
    
    const files = folder.getFiles();
    const processedFileIds = getProcessedFileIds();
    
    let newFilesFound = 0;
    let processedCount = 0;
    
    while (files.hasNext()) {
      try {
        const file = files.next();
        const fileId = file.getId();
        const fileName = file.getName();
        const mimeType = file.getMimeType();
        
        // Skip if already processed
        if (processedFileIds.includes(fileId)) {
          continue;
        }
        
        // Check file type
        if (!isSupportedFileType(mimeType)) {
          Logger.log(`⚠️  Unsupported file type: ${fileName} (${mimeType})`);
          markFileAsProcessed(fileId); // Mark to skip in future
          continue;
        }
        
        Logger.log(`📄 New file detected: ${fileName} (${fileId})`);
        
        // Process the file
        processDriveFile(fileId, fileName, mimeType);
        markFileAsProcessed(fileId);
        newFilesFound++;
        processedCount++;
        
        // Limit processing per run to avoid timeout
        if (processedCount >= 10) {
          Logger.log(`⚠️  Reached processing limit (10 files). Remaining files will be processed in next run.`);
          break;
        }
        
      } catch (fileError) {
        Logger.log(`❌ Error processing file: ${fileError.toString()}`);
        continue;
      }
    }
    
    if (newFilesFound === 0) {
      Logger.log('✅ No new files found');
    } else {
      Logger.log(`✅ Processing complete: ${newFilesFound} new file(s) processed`);
    }
    
  } catch (error) {
    Logger.log(`❌ Error in checkFolderForNewFiles: ${error.toString()}`);
    Logger.log(`Stack: ${error.stack || 'No stack trace'}`);
  }
}

/**
 * Check if file type is supported
 */
function isSupportedFileType(mimeType) {
  const supportedTypes = [
    'application/vnd.google-apps.spreadsheet',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  return supportedTypes.includes(mimeType) || mimeType.includes('csv') || mimeType.includes('spreadsheet');
}

/**
 * Process Drive file: Read, parse, segment, enrich
 */
function processDriveFile(fileId, fileName, mimeType) {
  try {
    const CONFIG = getConfig();
    Logger.log(`📄 Processing file: ${fileName}`);
    
    // Step 1: Read file content
    const fileData = readDriveFile(fileId, mimeType);
    if (!fileData || fileData.length === 0) {
      Logger.log('⚠️ No data found in file');
      return;
    }
    
    Logger.log(`📊 Found ${fileData.length} rows`);
    
    // Step 2: Process each row
    const results = {
      processed: 0,
      enriched: 0,
      synced: 0,
      errors: []
    };
    
    for (let i = 0; i < fileData.length; i++) {
      try {
        const row = fileData[i];
        
        // Step 3: Initial segmentation
        const segmented = segmentRowData(row);
        
        // Step 4: Enrichment with AnyMail
        const enriched = enrichWithAnyMail(segmented, CONFIG);
        
        // Store file_id for reference
        enriched.file_id = fileId;
        
        // Step 5: Sync to HubSpot
        const synced = syncToHubSpot(enriched, CONFIG);
        
        if (synced.success) {
          results.processed++;
          if (enriched.email) results.enriched++;
          if (synced.contactId) results.synced++;
        }
        
      } catch (error) {
        Logger.log(`❌ Error processing row ${i}: ${error.toString()}`);
        results.errors.push({ row: i, error: error.toString() });
      }
    }
    
    Logger.log(`✅ Processing complete: ${results.processed} processed, ${results.enriched} enriched, ${results.synced} synced`);
    
    if (results.errors.length > 0) {
      Logger.log(`⚠️ ${results.errors.length} errors occurred`);
    }
    
    // Step 6: Trigger email sending for ready contacts
    triggerEmailSending(CONFIG);
    
  } catch (error) {
    Logger.log(`❌ Error processing file: ${error.toString()}`);
    Logger.log(`Stack: ${error.stack || 'No stack trace'}`);
    // Don't send error notification if Gmail is not configured
    try {
      sendErrorNotification(error);
    } catch (e) {
      Logger.log(`Could not send error notification: ${e.toString()}`);
    }
  }
}

/**
 * Read Drive file (CSV or Google Sheet)
 */
function readDriveFile(fileId, mimeType) {
  try {
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      // Google Sheet
      const sheet = SpreadsheetApp.openById(fileId).getActiveSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      return data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
    } else if (mimeType === 'text/csv' || mimeType.includes('csv')) {
      // CSV file
      const file = DriveApp.getFileById(fileId);
      const content = file.getBlob().getDataAsString();
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      
      return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });
    }
    
    return [];
  } catch (error) {
    Logger.log(`Error reading file: ${error.toString()}`);
    return [];
  }
}

/**
 * Segment row data - extract Company URL and other fields
 */
function segmentRowData(row) {
  const segmented = {
    // Standard fields
    first_name: row['First Name'] || row['first_name'] || row['First Name'] || '',
    last_name: row['Last Name'] || row['last_name'] || row['Last Name'] || '',
    company: row['Company'] || row['company'] || row['Organization'] || row['organization'] || '',
    title: row['Title'] || row['title'] || row['Job Title'] || row['job_title'] || '',
    phone: row['Phone'] || row['phone'] || '',
    website: row['Website'] || row['website'] || row['Company URL'] || row['company_url'] || '',
    city: row['City'] || row['city'] || '',
    state: row['State'] || row['state'] || '',
    country: row['Country'] || row['country'] || '',
    
    // Segmented data fields (all other columns)
    segmented_data: {}
  };
  
  // Extract all other columns as segmented data
  Object.keys(row).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (!['first name', 'last name', 'company', 'organization', 'title', 'job title', 
          'phone', 'website', 'company url', 'city', 'state', 'country', 'email'].includes(lowerKey)) {
      segmented.segmented_data[key] = row[key];
    }
  });
  
  return segmented;
}

// ============================================
// PHASE 2: ANYMAIL ENRICHMENT
// ============================================

/**
 * Enrich contact with AnyMail API
 */
function enrichWithAnyMail(segmented, CONFIG) {
  try {
    if (!segmented.website) {
      Logger.log('⚠️ No website URL, skipping AnyMail enrichment');
      return Object.assign({}, segmented, { email: null });
    }
    
    Logger.log(`🔍 Enriching with AnyMail: ${segmented.website}`);
    
    // Extract domain from website
    const domain = extractDomain(segmented.website);
    if (!domain) {
      return Object.assign({}, segmented, { email: null });
    }
    
    // Call AnyMail API with webhook
    const url = `${CONFIG.ANYMAIL_API_BASE}/find`;
    const payload = {
      domain: domain,
      first_name: segmented.first_name,
      last_name: segmented.last_name,
      company: segmented.company
    };
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.ANYMAIL_API_KEY}`,
        'Content-Type': 'application/json',
        'x-webhook-url': CONFIG.ANYMAIL_WEBHOOK_URL // Auto-configured webhook
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode >= 200 && responseCode < 300) {
      const result = JSON.parse(responseText);
      
      if (result.email) {
        Logger.log(`✅ Email found: ${result.email}`);
        return Object.assign({}, segmented, {
          email: result.email,
          anymail_source_type: result.verified ? 'verified' : 'guessed',
          anymail_enriched: true
        });
      }
    } else {
      Logger.log(`⚠️ AnyMail API error ${responseCode}: ${responseText}`);
    }
    
    return Object.assign({}, segmented, { email: null, anymail_enriched: false });
    
  } catch (error) {
    Logger.log(`❌ Error enriching with AnyMail: ${error.toString()}`);
    return Object.assign({}, segmented, { email: null, anymail_enriched: false });
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    if (!url) return null;
    if (!url.startsWith('http')) url = 'https://' + url;
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

// ============================================
// PHASE 3: HUBSPOT CRM UPDATE
// ============================================

/**
 * Sync enriched data to HubSpot
 */
function syncToHubSpot(enriched, CONFIG) {
  try {
    if (!enriched.email && !enriched.company) {
      Logger.log('⚠️ No email or company, skipping HubSpot sync');
      return { success: false };
    }
    
    Logger.log(`📊 Syncing to HubSpot: ${enriched.email || enriched.company}`);
    
    // Step 1: Create/Update Company
    let companyId = null;
    if (enriched.company) {
      companyId = createOrUpdateCompany(enriched, CONFIG);
    }
    
    // Step 2: Create/Update Contact
    const contactId = createOrUpdateContact(enriched, companyId, CONFIG);
    
    if (contactId) {
      Logger.log(`✅ Synced to HubSpot: Contact ${contactId}`);
      return { success: true, contactId: contactId, companyId: companyId };
    }
    
    return { success: false };
    
  } catch (error) {
    Logger.log(`❌ Error syncing to HubSpot: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Create or update HubSpot company
 */
function createOrUpdateCompany(data, CONFIG) {
  try {
    const url = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/companies`;
    
    // Search for existing company
    const searchUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/companies/search`;
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'domain',
          operator: 'EQ',
          value: extractDomain(data.website) || data.company.toLowerCase()
        }]
      }],
      properties: ['domain'],
      limit: 1
    };
    
    const searchOptions = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(searchPayload),
      muteHttpExceptions: true
    };
    
    const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
    const searchResult = JSON.parse(searchResponse.getContentText());
    
    const properties = {
      name: data.company,
      domain: extractDomain(data.website) || '',
      original_sheet_url: `https://drive.google.com/file/d/${data.file_id || ''}/view`,
      email_finder_status: data.anymail_enriched ? 'found' : 'pending'
    };
    
    if (searchResult.results && searchResult.results.length > 0) {
      // Update existing company
      const companyId = searchResult.results[0].id;
      const updateUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/companies/${companyId}`;
      const updateOptions = {
        method: 'patch',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties }),
        muteHttpExceptions: true
      };
      
      UrlFetchApp.fetch(updateUrl, updateOptions);
      return companyId;
    } else {
      // Create new company
      const createOptions = {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties }),
        muteHttpExceptions: true
      };
      
      const createResponse = UrlFetchApp.fetch(url, createOptions);
      const createResult = JSON.parse(createResponse.getContentText());
      return createResult.id;
    }
    
  } catch (error) {
    Logger.log(`❌ Error creating/updating company: ${error.toString()}`);
    return null;
  }
}

/**
 * Create or update HubSpot contact
 */
function createOrUpdateContact(data, companyId, CONFIG) {
  try {
    if (!data.email) {
      Logger.log('⚠️ No email, cannot create contact');
      return null;
    }
    
    const url = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts`;
    
    // Search for existing contact
    const searchUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`;
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: data.email.toLowerCase()
        }]
      }],
      properties: ['email'],
      limit: 1
    };
    
    const searchOptions = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(searchPayload),
      muteHttpExceptions: true
    };
    
    const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
    const searchResult = JSON.parse(searchResponse.getContentText());
    
    // Build properties
    const properties = {
      email: data.email.toLowerCase(),
      firstname: data.first_name || '',
      lastname: data.last_name || '',
      company: data.company || '',
      jobtitle: data.title || '',
      phone: data.phone || '',
      website: data.website || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      
      // Automation properties
      automation_source: 'google_drive',
      automation_source_file_id: data.file_id || '',
      automation_ingested_at: new Date().getTime().toString(),
      anymail_source_type: data.anymail_source_type || '',
      automation_anymail_enriched: data.anymail_enriched ? 'true' : 'false',
      send_email_ready: (data.email && data.anymail_enriched) ? 'true' : 'false'
    };
    
    // Add segmented data
    if (data.segmented_data) {
      Object.keys(data.segmented_data).forEach((key, index) => {
        if (index < 10) { // Limit to 10 segments
          const propName = `original_sheet_data_segment_${index + 1}`;
          properties[propName] = data.segmented_data[key] || '';
        }
      });
    }
    
    if (searchResult.results && searchResult.results.length > 0) {
      // Update existing contact
      const contactId = searchResult.results[0].id;
      const updateUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`;
      const updateOptions = {
        method: 'patch',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties }),
        muteHttpExceptions: true
      };
      
      UrlFetchApp.fetch(updateUrl, updateOptions);
      
      // Associate with company if provided
      if (companyId) {
        associateContactWithCompany(contactId, companyId, CONFIG);
      }
      
      return contactId;
    } else {
      // Create new contact
      const createOptions = {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties }),
        muteHttpExceptions: true
      };
      
      const createResponse = UrlFetchApp.fetch(url, createOptions);
      const createResult = JSON.parse(createResponse.getContentText());
      const contactId = createResult.id;
      
      // Associate with company if provided
      if (companyId) {
        associateContactWithCompany(contactId, companyId, CONFIG);
      }
      
      return contactId;
    }
    
  } catch (error) {
    Logger.log(`❌ Error creating/updating contact: ${error.toString()}`);
    return null;
  }
}

/**
 * Associate contact with company
 */
function associateContactWithCompany(contactId, companyId, CONFIG) {
  try {
    const url = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/0`;
    const options = {
      method: 'put',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    Logger.log(`⚠️ Error associating contact with company: ${error.toString()}`);
  }
}

// ============================================
// PHASE 4: EMAIL SENDING (Gmail API)
// ============================================

/**
 * Trigger email sending for ready contacts
 * Pulls from HubSpot "Ready to Send" list and sends emails
 */
function triggerEmailSending(CONFIG) {
  try {
    Logger.log('📧 Triggering email sending from HubSpot list...');
    
    // Get contacts from "Ready to Send" list
    const contacts = getContactsFromHubSpotList('Ready to Send', CONFIG);
    
    if (contacts.length === 0) {
      Logger.log('ℹ️ No contacts in "Ready to Send" list');
      return;
    }
    
    Logger.log(`📬 Found ${contacts.length} contacts ready to send`);
    
    // Process each contact
    let sent = 0;
    let failed = 0;
    
    for (const contact of contacts.slice(0, 50)) { // Limit to 50 per run
      try {
        const result = sendPersonalizedEmail(contact, CONFIG);
        if (result.success) {
          sent++;
          // Update HubSpot
          updateContactAfterEmailSend(contact, result, CONFIG);
        } else {
          failed++;
          Logger.log(`⚠️ Failed to send to ${contact.properties?.email || 'unknown'}: ${result.error}`);
        }
      } catch (error) {
        Logger.log(`❌ Error sending email: ${error.toString()}`);
        failed++;
      }
    }
    
    Logger.log(`✅ Email sending complete: ${sent} sent, ${failed} failed`);
    
  } catch (error) {
    Logger.log(`❌ Error in triggerEmailSending: ${error.toString()}`);
  }
}

/**
 * Get contacts from HubSpot list
 */
function getContactsFromHubSpotList(listName, CONFIG) {
  try {
    // First, find the list
    const listsUrl = `${CONFIG.HUBSPOT_API_BASE}/contacts/v1/lists`;
    const listsOptions = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const listsResponse = UrlFetchApp.fetch(listsUrl, listsOptions);
    const listsResult = JSON.parse(listsResponse.getContentText());
    
    const list = listsResult.lists ? listsResult.lists.find(function(l) { return l.name === listName; }) : null;
    if (!list) {
      Logger.log(`⚠️ List "${listName}" not found`);
      return [];
    }
    
    // Get contacts from list
    const contactsUrl = `${CONFIG.HUBSPOT_API_BASE}/contacts/v1/lists/${list.listId}/contacts/all`;
    const contactsOptions = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const contactsResponse = UrlFetchApp.fetch(contactsUrl, contactsOptions);
    const contactsResult = JSON.parse(contactsResponse.getContentText());
    
    return contactsResult.contacts || [];
    
  } catch (error) {
    Logger.log(`❌ Error getting contacts from list: ${error.toString()}`);
    return [];
  }
}

/**
 * Send personalized email via Gmail
 */
function sendPersonalizedEmail(contact, CONFIG) {
  try {
    const email = contact.properties ? contact.properties.email : null;
    if (!email) {
      return { success: false, error: 'No email' };
    }
    
    // Determine template set
    const templateSet = (contact.properties && contact.properties.automation_template_set) || 
                       determineTemplateSet(contact);
    
    if (!templateSet) {
      return { success: false, error: 'No template set' };
    }
    
    // Get template from CONFIG
    const template = getTemplate(templateSet, 1, CONFIG); // Start with step 1
    
    if (!template) {
      return { success: false, error: 'Template not found' };
    }
    
    // Personalize template
    const personalized = personalizeTemplate(template, contact);
    
    // Send via Gmail
    const emailResult = GmailApp.sendEmail(
      email,
      personalized.subject,
      '',
      {
        htmlBody: personalized.body,
        from: CONFIG.GMAIL_FROM_ADDRESS,
        name: CONFIG.GMAIL_FROM_NAME
      }
    );
    
    Logger.log(`✅ Email sent to ${email}`);
    
    return {
      success: true,
      messageId: emailResult.getMessage().getId(),
      template: templateSet
    };
    
  } catch (error) {
    Logger.log(`❌ Error sending email: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Determine template set based on contact properties
 */
function determineTemplateSet(contact) {
  const leadType = contact.properties ? contact.properties.automation_lead_type : null;
  
  if (leadType === 'Student' || leadType === 'School') {
    return 'set_one_student';
  } else if (leadType === 'NGO') {
    return 'set_two_referral';
  } else {
    return 'set_three_b2b';
  }
}

/**
 * Get template from CONFIG
 */
function getTemplate(templateSet, step, CONFIG) {
  const templates = CONFIG.TEMPLATES[templateSet];
  if (!templates) return null;
  
  const stepKey = 'step_' + step;
  return templates[stepKey] || templates.step_1 || null;
}

/**
 * Personalize template with contact data
 */
function personalizeTemplate(template, contact) {
  let subject = template.subject || '';
  let body = template.body || '';
  
  const props = contact.properties || {};
  
  // Build name
  const firstName = props.firstname || '';
  const lastName = props.lastname || '';
  const fullName = (firstName + ' ' + lastName).trim() || 'there';
  
  // Replace tokens
  const replacements = {
    '{{first_name}}': firstName,
    '{{last_name}}': lastName,
    '{{name}}': fullName,
    '{{organization}}': props.company || '',
    '{{company}}': props.company || '',
    '{{email}}': props.email || '',
    '{{city}}': props.city || '',
    '{{country}}': props.country || '',
    '{{lead_type}}': props.automation_lead_type || '',
    '{{segment_1}}': props.original_sheet_data_segment_1 || '',
    '{{segment_2}}': props.original_sheet_data_segment_2 || '',
    '{{segment_3}}': props.original_sheet_data_segment_3 || '',
    '{{mission_support_url}}': 'https://hingecraft.global/mission-support',
    '{{student_page_url}}': 'https://hingecraft.global/student',
    '{{build_log_url}}': 'https://hingecraft.global/build-log',
    '{{submit_creation_url}}': 'https://hingecraft.global/submit',
    '{{unsubscribe_url}}': 'https://hingecraft.global/unsubscribe',
    '{{preferences_url}}': 'https://hingecraft.global/preferences'
  };
  
  Object.keys(replacements).forEach(function(token) {
    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    subject = subject.replace(regex, replacements[token]);
    body = body.replace(regex, replacements[token]);
  });
  
  return { subject: subject, body: body };
}

/**
 * Update HubSpot contact after email send
 */
function updateContactAfterEmailSend(contact, emailResult, CONFIG) {
  try {
    const contactId = contact.id || contact.vid;
    if (!contactId) {
      Logger.log('⚠️ No contact ID for update');
      return;
    }

    const url = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`;
    const props = contact.properties || {};
    const currentCount = parseInt(props.automation_emails_sent || '0') || 0;
    const properties = {
      automation_last_email_sent: new Date().getTime().toString(),
      automation_emails_sent: (currentCount + 1).toString(),
      last_contact_sent_date: new Date().toISOString()
    };
    
    const options = {
      method: 'patch',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ properties: properties }),
      muteHttpExceptions: true
    };
    
    UrlFetchApp.fetch(url, options);
    Logger.log(`✅ Updated contact ${contactId} after email send`);
    
  } catch (error) {
    Logger.log(`❌ Error updating contact after email send: ${error.toString()}`);
  }
}

// ============================================
// EMAIL TEMPLATES (From Database)
// ============================================
// NOTE: All template functions have been moved to Templates.gs
// They are still accessible here since all .gs files share the same global scope

/**
 * Student Template 1: Welcome to the Movement
 * From database: set_one_student, step 1
 * MOVED TO Templates.gs - This is kept for reference only
 */
function getStudentTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h1 style="color: #4CAF50;">You're Invited: Help Build the Future</h1>
    <p>Hi {{first_name}},</p>
    <p>Our school has been granted access to join the <strong>HingeCraft Movement</strong> — a global community of students exploring creativity, sustainable design, and future innovation together.</p>
    <p><strong>This isn't a class.<br>This isn't an assignment.<br>This is your invitation to be part of something growing right now.</strong></p>
    <h2>What is the Movement?</h2>
    <p>A student-driven community built around:</p>
    <ul>
      <li>Creative expression</li>
      <li>AI-assisted learning</li>
      <li>Recycled-material innovation</li>
      <li>Digital + physical design challenges</li>
      <li>Shared progress and inspiration</li>
    </ul>
    <p>You can follow the journey, contribute your ideas, or simply watch the evolution.<br>There's no pressure — only possibility.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Begin here: Join the Movement</a>
    </p>
    <p>Let's build something that matters, together.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 2: Here's What You Just Joined
 * From database: set_one_student, step 2
 */
function getStudentTemplate2() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Here's What You Just Joined</h2>
    <p>Hi {{first_name}},</p>
    <p>Now that you're part of the Movement, here's what to expect next:</p>
    <h3>1. The Journey Updates</h3>
    <p>You'll receive updates on:</p>
    <ul>
      <li>New student-designed creations</li>
      <li>AI-generated ideas becoming real prototypes</li>
      <li>Behind-the-scenes progress on Hingecraft's design platform</li>
      <li>How recycled materials are being transformed into premium furniture</li>
    </ul>
    <h3>2. Your School's Community Page</h3>
    <p>Every school has its own page for:</p>
    <ul>
      <li>Student sharing</li>
      <li>Project uploads</li>
      <li>Discussion threads</li>
      <li>Mini challenges</li>
    </ul>
    <h3>3. Monthly Inspiration Drops</h3>
    <p>Each drop includes:</p>
    <ul>
      <li>A theme</li>
      <li>A story</li>
      <li>A design prompt</li>
      <li>A real-world example of creative innovation</li>
    </ul>
    <p>You can join in anytime.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{student_page_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Your Student Page</a>
    </p>
    <p>More updates coming soon — you're early.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 3: Follow the Journey
 * From database: set_one_student, step 3
 */
function getStudentTemplate3() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Follow the Journey</h2>
    <p>Hi {{first_name}},</p>
    <p>Every movement has a story.<br>Here's how you can follow ours:</p>
    <h3>📌 The Hingecraft Build Log</h3>
    <p>Weekly updates showing:</p>
    <ul>
      <li>New prototypes</li>
      <li>Behind-the-scenes lab work</li>
      <li>Sustainability breakthroughs</li>
      <li>Student ideas shaping the roadmap</li>
    </ul>
    <h3>📌 The Community Feed</h3>
    <p>Where students post:</p>
    <ul>
      <li>Creative concepts</li>
      <li>Personal projects</li>
      <li>Experiments using AI design tools</li>
      <li>Recycled-material builds</li>
    </ul>
    <h3>📌 The Path to Your First Creation</h3>
    <p>We'll send small, simple steps you can use to begin designing — even if you've never used AI tools before.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{build_log_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Following the Build Log</a>
    </p>
    <p>The journey is evolving.<br>You're part of it now.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 4: Your First Action Step
 * From database: set_one_student, step 4
 */
function getStudentTemplate4() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Your First Action Step</h2>
    <p>Hi {{first_name}},</p>
    <p>If you want to take part in the Creative Movement, here's the simplest first step:</p>
    <h3>Your First Action: The Signature Creative Prompt</h3>
    <p style="font-style: italic; font-size: 18px; color: #4CAF50; margin: 20px 0;">
      "What would you design if you could turn recycled materials into premium furniture using AI?"
    </p>
    <p>You can submit:</p>
    <ul>
      <li>A photo</li>
      <li>A rough sketch</li>
      <li>A written idea</li>
      <li>An AI-generated image</li>
      <li>A moodboard</li>
    </ul>
    <p><strong>Everything is welcome.</strong></p>
    <p>Your school's student page has a fast upload option:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{submit_creation_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Submit Your First Creation</a>
    </p>
    <p>This isn't about perfection.<br>It's about momentum.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 5: Become a Recognized Member
 * From database: set_one_student, step 5
 */
function getStudentTemplate5() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Become a Recognized Member</h2>
    <p>Hi {{first_name}},</p>
    <p>Students who join now are being recorded as <strong>early members</strong> of the Movement.</p>
    <p>To finalize your place, activate your <strong>$1 Student Membership Pass</strong>, which gives you:</p>
    <ul>
      <li>Early access to new tools</li>
      <li>The monthly creative challenge system</li>
      <li>A digital portfolio builder</li>
      <li>Your student badge</li>
      <li>A permanent member listing</li>
      <li>The ability to join collaborative builds</li>
    </ul>
    <p>You don't need it to follow the story.<br>But if you want to contribute, collaborate, or build — it helps unlock everything.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}?amount=1" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Activate Your Pass ($1 for the year)</a>
    </p>
    <p>We're just getting started.<br>Let's build forward, together.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Referral Template 1: A New $1 Student Pass Just Launched
 * From database: set_two_referral, step 1
 */
function getReferralTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">A New $1 Student Pass Just Launched</h2>
    <p>Dear Students,</p>
    <p>Our school has partnered with <strong>HingeCraft Global</strong> to bring you early access to a new student-focused program designed to support creativity, skill-building, and future-ready learning.</p>
    <p>For a limited time, all students can join the <strong>HingeCraft Student Pass</strong> for just <strong>$1 for the entire year</strong>.</p>
    <h3>What the Student Pass Includes:</h3>
    <ul>
      <li>A private school-specific student page</li>
      <li>Access to AI learning modules and beginner-friendly tools</li>
      <li>Monthly creative challenges (design, building, sustainable innovation)</li>
      <li>A digital portfolio-builder to showcase your work</li>
      <li>A student-only community space to connect, collaborate, and share ideas</li>
      <li>Early access to upcoming HingeCraft workshops and events</li>
    </ul>
    <h3>Why We're Sharing This With You</h3>
    <p>HingeCraft is building a new kind of platform where students can:</p>
    <ul>
      <li>✔ Explore creativity</li>
      <li>✔ Learn AI fundamentals</li>
      <li>✔ Build digital and physical projects</li>
      <li>✔ Develop new skills</li>
      <li>✔ Connect with a global community of creators</li>
    </ul>
    <p>It's designed to be simple, accessible, and supportive — whether you're into design, technology, sustainability, future innovation, or just want to try something new.</p>
    <h3>Activate Your $1 Access</h3>
    <p>You can activate your Student Pass here:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{school_unique_link}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">👉 Activate Your Student Pass</a>
    </p>
    <p>Feel free to share this link with classmates who may also want to join.</p>
    <p>If you have any questions about how the pass works or what you'll receive, our office is happy to help.</p>
    <p>Best regards,<br>{{sender_name}}<br>{{sender_title}}<br>{{school_name}}</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 1: Introducing Hingecraft
 * From database: set_three_b2b, step 1
 */
function getB2BTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Introducing Hingecraft</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft</strong> is an early-stage initiative focused on creativity, sustainability, and accessible AI education — built for students, communities, and partners who care about future skills without financial barriers.</p>
    <p>At its core, Hingecraft exists to make advanced creative tools available to young people in a way that feels human, collaborative, and grounded in real-world making. We blend AI-assisted design, recycled-material innovation, and community-driven challenges into a single ecosystem.</p>
    <p>This message is being shared broadly with organizations, institutions, and partners who support education, creativity, youth development, sustainability, or innovation. If this reaches the right person, feel free to forward internally.</p>
    <p><strong>No action is required</strong> — this is simply an introduction.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 2: The $1 Abundance Pass
 * From database: set_three_b2b, step 2
 */
function getB2BTemplate2() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">The $1 Abundance Pass</h2>
    <p>Hello,</p>
    <p>One of the most intentional design choices behind Hingecraft is the <strong>$1 Student Pass</strong>.</p>
    <p>We built this to remove financial friction entirely — not as a discount, but as a signal. Students shouldn't have to "qualify" for access to creativity, learning, or future-facing tools.</p>
    <p>The pass unlocks:</p>
    <ul>
      <li>Guided AI-assisted creative challenges</li>
      <li>Design prompts tied to sustainability and reuse</li>
      <li>Community collaboration and team participation</li>
      <li>Early exposure to future-skill workflows</li>
    </ul>
    <p>This model allows schools, nonprofits, community groups, and partners to participate without administrative overhead or funding complexity.</p>
    <p>If this message is landing with someone who manages programs, partnerships, or outreach, feel free to pass it along.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 3: How Hingecraft Approaches AI
 * From database: set_three_b2b, step 3
 */
function getB2BTemplate3() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">How Hingecraft Approaches AI</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft treats AI as a creative assistant, not a replacement.</strong></p>
    <p>Students don't just "use AI" — they learn how to:</p>
    <ul>
      <li>Prompt thoughtfully</li>
      <li>Iterate designs</li>
      <li>Combine digital ideas with physical outcomes</li>
      <li>Understand limitations and ethics</li>
      <li>Collaborate with peers using shared tools</li>
    </ul>
    <p>Our challenges are intentionally designed to feel more like creative studios than classrooms. The goal isn't speed — it's confidence, literacy, and creative ownership.</p>
    <p>This approach has resonated with educators, youth programs, maker spaces, and community partners who want AI exposure without risk or abstraction.</p>
    <p>Sharing for context.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 4: Why Local Participation Matters
 * From database: set_three_b2b, step 4
 */
function getB2BTemplate4() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Why Local Participation Matters</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft is structured so that each school or community participates as its own node</strong> — not as a passive audience.</p>
    <p>Students see:</p>
    <ul>
      <li>Their school represented on leaderboards</li>
      <li>Team-based challenges that require collaboration</li>
      <li>Recognition for participation, not just performance</li>
      <li>Creative output that reflects local identity</li>
    </ul>
    <p>This structure encourages organic sharing, peer involvement, and community pride — without competitive pressure or exclusion.</p>
    <p>Organizations supporting local youth, sustainability, or creative development often find this model aligns naturally with their goals.</p>
    <p>This message can be shared freely.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 5: Supporting Access (Optional)
 * From database: set_three_b2b, step 5
 */
function getB2BTemplate5() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Supporting Access (Optional)</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft is still building.</strong></p>
    <p>We operate with minimal overhead and rely on a mix of partnerships, small donations, and community support to keep student access open and affordable.</p>
    <p>For those who choose to support:</p>
    <ul>
      <li>Donations help subsidize student access</li>
      <li>Contributions fund platform development and challenges</li>
      <li>Support keeps the $1 Student Pass viable</li>
    </ul>
    <p><strong>There is no obligation</strong> — awareness alone is meaningful.</p>
    <p>If this message reaches someone responsible for community initiatives, education funding, or partnership development, it may be useful to share.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Support HingeCraft</a>
    </p>
    <p>Thank you for taking the time to read.</p>
    <p>—<br>HingeCraft</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get processed file IDs (stored in Properties Service)
 */
function getProcessedFileIds() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const processed = scriptProperties.getProperty('processed_file_ids');
  return processed ? JSON.parse(processed) : [];
}

/**
 * Mark file as processed
 */
function markFileAsProcessed(fileId) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const processed = getProcessedFileIds();
  processed.push(fileId);
  scriptProperties.setProperty('processed_file_ids', JSON.stringify(processed));
}

/**
 * Send error notification
 */
function sendErrorNotification(error) {
  try {
    const CONFIG = getConfig();
    GmailApp.sendEmail(
      CONFIG.GMAIL_FROM_ADDRESS,
      'HingeCraft Automation Error',
      'Error in automation: ' + error.toString(),
      { from: CONFIG.GMAIL_FROM_ADDRESS }
    );
  } catch (e) {
    Logger.log('⚠️ Could not send error notification: ' + e.toString());
  }
}
