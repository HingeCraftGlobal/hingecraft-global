/**
 * Google Analytics 4 (GA4) Tracking System
 * Complete email tracking with open rates, click tracking, and response detection
 */

// ============================================
// GA4 TRACKING CONFIGURATION
// ============================================

/**
 * Get GA4 configuration from Script Properties
 */
function getGA4Config() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  return {
    GA4_MEASUREMENT_ID: scriptProperties.getProperty('GA4_MEASUREMENT_ID') || 'G-QF5H2Q291T',
    GA4_API_SECRET: scriptProperties.getProperty('GA4_API_SECRET') || 'cJH76-IHQteQx6DKaiPkGA',
    TRACKING_ENDPOINT_URL: scriptProperties.getProperty('TRACKING_ENDPOINT_URL') || 'https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec',
    STREAM_ID: scriptProperties.getProperty('GA4_STREAM_ID') || '13142410458',
    STREAM_URL: scriptProperties.getProperty('GA4_STREAM_URL') || 'https://hingecraft-global.ai'
  };
}

// ============================================
// GA4 MEASUREMENT PROTOCOL
// ============================================

/**
 * Sends an event to Google Analytics 4 via Measurement Protocol
 * @param {string} clientId - Unique client ID (HubSpot Contact ID)
 * @param {string} eventName - Event name (e.g., 'email_opened', 'link_clicked')
 * @param {Object} customParams - Custom event parameters
 */
function sendGa4Event(clientId, eventName, customParams = {}) {
  const config = getGA4Config();
  
  if (!config.GA4_MEASUREMENT_ID || !config.GA4_API_SECRET) {
    Logger.log('⚠️ GA4 Measurement ID or API Secret is missing. Check Script Properties.');
    return { success: false, error: 'Missing GA4 configuration' };
  }

  const payload = {
    client_id: clientId, // Use HubSpot Contact ID as unique client ID
    events: [{
      name: eventName,
      params: {
        engagement_time_msec: '1',
        session_id: clientId,
        ...customParams
      }
    }]
  };

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${config.GA4_MEASUREMENT_ID}&api_secret=${config.GA4_API_SECRET}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    
    if (responseCode >= 200 && responseCode < 300) {
      Logger.log(`✅ GA4 event sent: ${eventName} for client ${clientId}`);
      return { success: true, responseCode: responseCode };
    } else {
      Logger.log(`❌ GA4 event failed: ${responseCode} - ${response.getContentText()}`);
      return { success: false, error: `HTTP ${responseCode}`, response: response.getContentText() };
    }
  } catch (error) {
    Logger.log(`❌ Error sending GA4 event: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

// ============================================
// WEB APP ENDPOINT (Tracking Pixel & Clicks)
// ============================================

/**
 * Main Web App endpoint for tracking
 * Handles both email opens (pixel) and link clicks
 * 
 * URL Parameters:
 * - c: Contact ID (HubSpot Contact ID)
 * - t: Type ('o' = open, 'l' = link/click)
 * - url: Target URL (for clicks)
 * - s: Template Set (for segmentation)
 * 
 * Deploy as: Web App
 * Execute as: Me
 * Access: Anyone
 */
function doGet(e) {
  const contactId = e.parameter.c;    // HubSpot Contact ID
  const type = e.parameter.t;         // 'o' (open) or 'l' (link)
  const targetUrl = e.parameter.url;  // Actual URL (for clicks)
  const templateSet = e.parameter.s;  // Template Set (for GA4 segmentation)
  const step = e.parameter.step;      // Email step number

  if (!contactId || !type) {
    Logger.log('⚠️ Invalid tracking call - missing contact ID or type');
    return HtmlService.createHtmlOutput('Invalid tracking call.')
                     .setMimeType(HtmlService.MimeType.TEXT);
  }
  
  try {
    // Handle Email Open (Tracking Pixel)
    if (type === 'o') {
      Logger.log(`📧 Email opened: Contact ${contactId}, Template: ${templateSet}, Step: ${step}`);
      
      // 1. Log Open in GA4
      const ga4Result = sendGa4Event(contactId, 'email_opened', {
        template_set: templateSet || 'unknown',
        email_step: step || '1',
        engagement_time_msec: '1'
      });
      
      // 2. Update HubSpot (increment total_emails_opened)
      updateHubSpotTrackingProperty(contactId, 'total_emails_opened', 'increment');
      
      // 3. Log to database (if available)
      logEmailEvent(contactId, 'opened', {
        template_set: templateSet,
        step: step,
        timestamp: new Date().toISOString()
      });
      
      // 4. Return 1x1 transparent GIF (tracking pixel)
      const pixelGif = 'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
      return HtmlService.createHtmlOutput(`<img src="data:image/gif;base64,${pixelGif}" width="1" height="1" border="0" style="display:none;"/>`)
                       .setMimeType(HtmlService.MimeType.HTML);
                       
    } 
    // Handle Link Click
    else if (type === 'l' && targetUrl) {
      Logger.log(`🔗 Link clicked: Contact ${contactId}, URL: ${targetUrl}, Template: ${templateSet}`);
      
      // 1. Log Click in GA4
      const ga4Result = sendGa4Event(contactId, 'link_clicked', {
        link_url: targetUrl,
        template_set: templateSet || 'unknown',
        email_step: step || '1'
      });
      
      // 2. Update HubSpot (increment total_clicks)
      updateHubSpotTrackingProperty(contactId, 'total_clicks', 'increment');
      
      // 3. Log to database (if available)
      logEmailEvent(contactId, 'clicked', {
        url: targetUrl,
        template_set: templateSet,
        step: step,
        timestamp: new Date().toISOString()
      });
      
      // 4. Redirect to actual URL
      const escapedUrl = targetUrl.replace(/'/g, "\\'");
      return HtmlService.createHtmlOutput(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${escapedUrl}">
          <script>window.location.replace('${escapedUrl}');</script>
        </head>
        <body>
          <p>Redirecting... <a href="${escapedUrl}">Click here if not redirected</a></p>
        </body>
        </html>
      `).setMimeType(HtmlService.MimeType.HTML);
    }
    
    return HtmlService.createHtmlOutput('Tracking successful.').setMimeType(HtmlService.MimeType.TEXT);
    
  } catch (error) {
    Logger.log(`❌ Error in tracking endpoint: ${error.toString()}`);
    return HtmlService.createHtmlOutput('Tracking error occurred.').setMimeType(HtmlService.MimeType.TEXT);
  }
}

// ============================================
// HUBSPOT TRACKING PROPERTY UPDATES
// ============================================

/**
 * Updates HubSpot tracking properties
 * @param {string} contactId - HubSpot Contact ID
 * @param {string} propertyName - Property name (total_emails_opened, total_clicks, sequence_replied)
 * @param {string} operation - 'increment', 'set', or 'decrement'
 * @param {string|number} value - Value to set (if operation is 'set')
 */
function updateHubSpotTrackingProperty(contactId, propertyName, operation = 'increment', value = null) {
  const config = getConfig();
  
  if (!contactId || !propertyName) {
    Logger.log('⚠️ Missing contact ID or property name for HubSpot update');
    return { success: false };
  }
  
  try {
    // Get current value
    let currentValue = 0;
    if (operation === 'increment' || operation === 'decrement') {
      const getUrl = `${config.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}?properties=${propertyName}`;
      const getOptions = {
        method: 'get',
        headers: {
          'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };
      
      const getResponse = UrlFetchApp.fetch(getUrl, getOptions);
      const getResult = JSON.parse(getResponse.getContentText());
      currentValue = parseInt(getResult.properties?.[propertyName] || '0');
    }
    
    // Calculate new value
    let newValue;
    if (operation === 'increment') {
      newValue = currentValue + 1;
    } else if (operation === 'decrement') {
      newValue = Math.max(0, currentValue - 1);
    } else if (operation === 'set') {
      newValue = value !== null ? value : currentValue;
    } else {
      newValue = currentValue;
    }
    
    // Update HubSpot
    const updateUrl = `${config.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`;
    const updatePayload = {
      properties: {
        [propertyName]: newValue.toString()
      }
    };
    
    const updateOptions = {
      method: 'patch',
      headers: {
        'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(updatePayload)
    };
    
    const updateResponse = UrlFetchApp.fetch(updateUrl, updateOptions);
    const responseCode = updateResponse.getResponseCode();
    
    if (responseCode >= 200 && responseCode < 300) {
      Logger.log(`✅ Updated HubSpot property ${propertyName} to ${newValue} for contact ${contactId}`);
      return { success: true, newValue: newValue };
    } else {
      Logger.log(`❌ Failed to update HubSpot property: ${responseCode} - ${updateResponse.getContentText()}`);
      return { success: false, error: `HTTP ${responseCode}` };
    }
    
  } catch (error) {
    Logger.log(`❌ Error updating HubSpot property: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

// ============================================
// EMAIL EVENT LOGGING
// ============================================

/**
 * Logs email events to database (if available)
 * @param {string} contactId - Contact ID
 * @param {string} eventType - Event type (opened, clicked, replied)
 * @param {Object} metadata - Additional metadata
 */
function logEmailEvent(contactId, eventType, metadata = {}) {
  try {
    // This would connect to your database if available
    // For now, we'll log to Apps Script execution log
    Logger.log(`📊 Email Event: ${eventType} | Contact: ${contactId} | ${JSON.stringify(metadata)}`);
    
    // TODO: If database is available, insert into email_logs table
    // Example:
    // const db = connectToDatabase();
    // db.insert('email_logs', {
    //   lead_id: contactId,
    //   event_type: eventType,
    //   metadata: metadata,
    //   created_at: new Date()
    // });
    
    return { success: true };
  } catch (error) {
    Logger.log(`⚠️ Error logging email event: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

// ============================================
// RESPONSE DETECTION (Gmail Scanner)
// ============================================

/**
 * Scans Gmail for replies to sent emails
 * Updates HubSpot with sequence_replied property
 */
function scanGmailForResponses() {
  Logger.log('📧 Scanning Gmail for responses...');
  
  const config = getConfig();
  const fromAddress = config.GMAIL_FROM_ADDRESS;
  
  try {
    // Search for threads where we sent an email and received a reply
    const threads = GmailApp.search(`from:${fromAddress} has:nouserlabels`, 0, 50);
    let repliesFound = 0;
    
    for (const thread of threads) {
      const messages = thread.getMessages();
      
      // Check if there's a reply (message after our sent message)
      for (let i = 0; i < messages.length - 1; i++) {
        const ourMessage = messages[i];
        const replyMessage = messages[i + 1];
        
        // Check if our message is from our address and reply is not
        if (ourMessage.getFrom().includes(fromAddress) && 
            !replyMessage.getFrom().includes(fromAddress)) {
          
          // Extract contact ID from our message (could be in headers or body)
          const ourMessageBody = ourMessage.getBody();
          const contactIdMatch = ourMessageBody.match(/contact[_-]id["\s:=]+([a-zA-Z0-9_-]+)/i);
          
          if (contactIdMatch) {
            const contactId = contactIdMatch[1];
            
            // Update HubSpot
            updateHubSpotTrackingProperty(contactId, 'sequence_replied', 'set', 1);
            
            // Log to GA4
            sendGa4Event(contactId, 'email_replied', {
              reply_timestamp: replyMessage.getDate().toISOString()
            });
            
            // Log event
            logEmailEvent(contactId, 'replied', {
              reply_date: replyMessage.getDate().toISOString(),
              reply_from: replyMessage.getFrom()
            });
            
            repliesFound++;
            Logger.log(`✅ Reply detected from ${replyMessage.getFrom()} for contact ${contactId}`);
          }
        }
      }
    }
    
    Logger.log(`✅ Gmail scan complete: ${repliesFound} replies found`);
    return { success: true, repliesFound: repliesFound };
    
  } catch (error) {
    Logger.log(`❌ Error scanning Gmail: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

// ============================================
// TRACKING UTILITIES
// ============================================

/**
 * Wraps all links in email body with tracking URLs
 * @param {string} bodyHtml - Original email HTML body
 * @param {string} contactId - Contact ID
 * @param {string} templateSet - Template set
 * @param {string} step - Email step number
 * @returns {string} - HTML with wrapped links
 */
function wrapLinksWithTracking(bodyHtml, contactId, templateSet, step) {
  const config = getGA4Config();
  const trackingUrl = config.TRACKING_ENDPOINT_URL;
  
  if (!trackingUrl) {
    Logger.log('⚠️ TRACKING_ENDPOINT_URL not set. Links will not be tracked.');
    return bodyHtml;
  }
  
  // Wrap all href links with tracking
  const wrappedBody = bodyHtml.replace(/href=["']([^"']+)["']/gi, (match, url) => {
    // Skip mailto: and javascript: links
    if (url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
      return match;
    }
    
    // Create tracking URL
    const trackingLink = `${trackingUrl}?t=l&c=${contactId}&s=${encodeURIComponent(templateSet || '')}&step=${step || '1'}&url=${encodeURIComponent(url)}`;
    return `href="${trackingLink}"`;
  });
  
  return wrappedBody;
}

/**
 * Adds tracking pixel to email body
 * @param {string} bodyHtml - Email HTML body
 * @param {string} contactId - Contact ID
 * @param {string} templateSet - Template set
 * @param {string} step - Email step number
 * @returns {string} - HTML with tracking pixel
 */
function addTrackingPixel(bodyHtml, contactId, templateSet, step) {
  const config = getGA4Config();
  const trackingUrl = config.TRACKING_ENDPOINT_URL;
  
  if (!trackingUrl) {
    Logger.log('⚠️ TRACKING_ENDPOINT_URL not set. Open tracking will not work.');
    return bodyHtml;
  }
  
  // Create tracking pixel URL
  const pixelUrl = `${trackingUrl}?t=o&c=${contactId}&s=${encodeURIComponent(templateSet || '')}&step=${step || '1'}`;
  
  // Add pixel at end of body (before closing tags)
  const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" border="0" style="display:none; width:1px; height:1px; border:0;" alt="" />`;
  
  // Insert before closing body tag, or append if no body tag
  if (bodyHtml.includes('</body>')) {
    return bodyHtml.replace('</body>', `${pixelHtml}</body>`);
  } else {
    return bodyHtml + pixelHtml;
  }
}
