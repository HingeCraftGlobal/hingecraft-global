/**
 * Draft Tracking and Universal Sending System
 * Processes Gmail drafts with GA4 tracking and sends them automatically
 * 
 * This entire process occurs when Time-Driven Trigger fires (e.g., every 5 minutes),
 * running the scanDraftsForOutbound() function.
 */

// ============================================
// PHASE 1: LOCATING AND IDENTIFYING THE DRAFT
// ============================================

/**
 * Main function: Scans Gmail drafts with 'Tracked_Outbound' label
 * Processes all drafts, injects tracking, and sends them
 * 
 * This should be called by a time-driven trigger (every 5 minutes)
 */
function scanDraftsForOutbound() {
  Logger.log('📧 Scanning drafts for outbound tracking...');
  
  try {
    // Step 1: Find Label
    const labelName = 'Tracked_Outbound';
    let label;
    try {
      label = GmailApp.getUserLabelByName(labelName);
    } catch (error) {
      Logger.log(`⚠️ Label "${labelName}" not found. Creating it...`);
      label = GmailApp.createLabel(labelName);
      Logger.log(`✅ Created label: ${labelName}`);
    }
    
    if (!label) {
      Logger.log(`❌ Could not find or create label: ${labelName}`);
      return { success: false, error: 'Label not found' };
    }
    
    // Step 2: Get Threads
    const threads = label.getThreads(0, 50); // Get up to 50 threads
    Logger.log(`Found ${threads.length} threads with label "${labelName}"`);
    
    if (threads.length === 0) {
      Logger.log('✅ No drafts to process');
      return { success: true, processed: 0 };
    }
    
    let processed = 0;
    let sent = 0;
    let errors = 0;
    
    // Process each thread
    for (const thread of threads) {
      try {
        // Step 3: Access Draft
        const messages = thread.getMessages();
        if (messages.length === 0) {
          continue;
        }
        
        const draftMessage = messages[0]; // Drafts usually exist as first message
        
        // Step 4: Pre-Checks
        if (!draftMessage.isDraft()) {
          Logger.log(`⚠️ Message is not a draft, skipping thread ${thread.getId()}`);
          // Remove label if not a draft
          thread.removeLabel(label);
          continue;
        }
        
        // Step 5: Get Recipient
        const recipientEmail = draftMessage.getTo();
        if (!recipientEmail || !recipientEmail.includes('@')) {
          Logger.log(`⚠️ Invalid recipient email: ${recipientEmail}`);
          errors++;
          continue;
        }
        
        Logger.log(`📧 Processing draft to: ${recipientEmail}`);
        
        // Step 6: CRM Check - Ensure contact exists in HubSpot
        const contactId = ensureContactExists(recipientEmail);
        if (!contactId) {
          Logger.log(`⚠️ Could not find or create contact for ${recipientEmail}`);
          errors++;
          continue;
        }
        
        // Get template set and step from contact (or use defaults)
        const contact = getContactFromHubSpot(contactId);
        const templateSet = contact?.properties?.automation_template_set || 'set_three_b2b';
        const emailStep = parseInt(contact?.properties?.automation_next_email_step || '1');
        
        // ============================================
        // PHASE 2: INJECTING THE GA4 TRACKING
        // ============================================
        
        // Step 7: Get HTML Body
        let bodyHtml = draftMessage.getBody();
        const subject = draftMessage.getSubject();
        
        // Step 8 & 9: Link Wrapping
        bodyHtml = wrapLinksWithTracking(bodyHtml, contactId, templateSet, emailStep);
        
        // Step 10: Inject Pixel
        bodyHtml = addTrackingPixel(bodyHtml, contactId, templateSet, emailStep);
        
        // ============================================
        // PHASE 3: SENDING AND CLEANUP
        // ============================================
        
        // Step 11: Send Email
        const emailResult = GmailApp.sendEmail(
          recipientEmail,
          subject,
          '', // Plain text (empty, using HTML)
          {
            htmlBody: bodyHtml,
            from: getConfig().GMAIL_FROM_ADDRESS || 'marketingecraft@gmail.com',
            name: 'HingeCraft'
          }
        );
        
        Logger.log(`✅ Email sent to ${recipientEmail} (Message ID: ${emailResult.getMessage().getId()})`);
        
        // Step 12: Update Tracking
        updateHubSpotTrackingProperty(contactId, 'last_contact_sent_date', 'set', new Date().toISOString());
        
        // Also update sequence if needed
        const currentEmailsSent = parseInt(contact?.properties?.automation_emails_sent || '0');
        updateHubSpotTrackingProperty(contactId, 'automation_emails_sent', 'set', currentEmailsSent + 1);
        
        // Step 13: Delete Draft
        draftMessage.moveToTrash();
        
        // Step 14: Remove Label
        thread.removeLabel(label);
        
        sent++;
        processed++;
        
        // Small delay to respect rate limits
        Utilities.sleep(500);
        
      } catch (error) {
        Logger.log(`❌ Error processing thread: ${error.toString()}`);
        errors++;
      }
    }
    
    Logger.log(`✅ Draft scan complete: ${processed} processed, ${sent} sent, ${errors} errors`);
    
    return {
      success: true,
      processed: processed,
      sent: sent,
      errors: errors
    };
    
  } catch (error) {
    Logger.log(`❌ Error in scanDraftsForOutbound: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Ensures contact exists in HubSpot, returns contact ID
 * @param {string} email - Email address
 * @returns {string|null} - HubSpot Contact ID or null
 */
function ensureContactExists(email) {
  const config = getConfig();
  
  if (!email || !email.includes('@')) {
    return null;
  }
  
  try {
    // Search for contact by email
    const searchUrl = `${config.HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`;
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email.toLowerCase()
        }]
      }],
      properties: ['id', 'email'],
      limit: 1
    };
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(searchPayload)
    };
    
    const response = UrlFetchApp.fetch(searchUrl, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.results && result.results.length > 0) {
      // Contact exists
      return result.results[0].id;
    }
    
    // Contact doesn't exist, create it
    const createUrl = `${config.HUBSPOT_API_BASE}/crm/v3/objects/contacts`;
    const createPayload = {
      properties: {
        email: email.toLowerCase()
      }
    };
    
    const createOptions = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(createPayload)
    };
    
    const createResponse = UrlFetchApp.fetch(createUrl, createOptions);
    const createResult = JSON.parse(createResponse.getContentText());
    
    if (createResult.id) {
      Logger.log(`✅ Created new contact in HubSpot: ${email} (ID: ${createResult.id})`);
      return createResult.id;
    }
    
    return null;
    
  } catch (error) {
    Logger.log(`❌ Error ensuring contact exists: ${error.toString()}`);
    return null;
  }
}

/**
 * Gets contact from HubSpot
 * @param {string} contactId - HubSpot Contact ID
 * @returns {Object|null} - Contact object or null
 */
function getContactFromHubSpot(contactId) {
  const config = getConfig();
  
  try {
    const url = `${config.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}?properties=email,automation_template_set,automation_next_email_step,automation_lead_type`;
    
    const options = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    return {
      id: result.id,
      properties: result.properties
    };
    
  } catch (error) {
    Logger.log(`❌ Error getting contact from HubSpot: ${error.toString()}`);
    return null;
  }
}

/**
 * Get configuration (shared with Code.gs)
 */
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  return {
    HUBSPOT_ACCESS_TOKEN: scriptProperties.getProperty('HUBSPOT_TOKEN') || 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39',
    HUBSPOT_API_BASE: 'https://api.hubapi.com',
    GMAIL_FROM_ADDRESS: scriptProperties.getProperty('GMAIL_FROM_ADDRESS') || 'marketingecraft@gmail.com',
    GMAIL_FROM_NAME: 'HingeCraft'
  };
}
