/**
 * HubSpot CLI Sync Service
 * Handles syncing data to HubSpot via CLI and API
 */

const { execSync } = require('child_process');
const config = require('../../config/api_keys');
const hubspotUnifiedSync = require('./hubspotUnifiedSync');
const db = require('../utils/database');
const logger = require('../utils/logger');

class HubSpotCLISync {
  /**
   * Sync all data to HubSpot using CLI and API
   */
  async syncAll() {
    try {
      logger.info('Starting HubSpot CLI sync...');

      // Step 1: Test CLI availability
      let cliAvailable = false;
      try {
        execSync('hs --version', { stdio: 'ignore' });
        cliAvailable = true;
        logger.info('HubSpot CLI is available');
      } catch (error) {
        logger.warn('HubSpot CLI not found, using API only');
      }

      // Step 2: Run unified sync (uses API)
      const syncResult = await hubspotUnifiedSync.completeUnifiedSync();

      // Step 3: If CLI available, run additional CLI commands
      if (cliAvailable) {
        try {
          // Sync contacts via CLI (if needed)
          logger.info('Running additional CLI sync...');
          // CLI commands can be added here if needed
        } catch (error) {
          logger.warn('CLI sync failed, continuing with API sync:', error.message);
        }
      }

      return {
        success: true,
        cli_available: cliAvailable,
        sync_result: syncResult
      };
    } catch (error) {
      logger.error('Error in HubSpot CLI sync:', error);
      throw error;
    }
  }

  /**
   * Update HubSpot CLI configuration
   */
  async updateCLIConfig() {
    try {
      const apiKey = config.hubspot.personalAccessKey;
      const portalId = config.hubspot.portalId;

      // Update CLI config if CLI is available
      try {
        execSync(`hs auth personal-access-key --personal-access-key "${apiKey}"`, { stdio: 'ignore' });
        logger.info('HubSpot CLI config updated');
        return { success: true };
      } catch (error) {
        logger.warn('Could not update CLI config:', error.message);
        return { success: false, error: error.message };
      }
    } catch (error) {
      logger.error('Error updating CLI config:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new HubSpotCLISync();
