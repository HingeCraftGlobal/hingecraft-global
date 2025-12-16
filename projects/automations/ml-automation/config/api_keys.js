/**
 * HingeCraft ML Automation System - API Configuration
 * All API keys and credentials for the automation system
 * 
 * SECURITY NOTE: This file should be added to .gitignore in production
 * Use environment variables or a secrets manager for production deployments
 */

module.exports = {
  // Google OAuth Configuration
  google: {
    clientId: '590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com',
    clientSecret: '4B9IiBGxsKK8zkBXtzqMREO2hXNe',
    // Gmail OAuth (for personal email access)
    gmailClientId: '394260294524-kri84v91me0sss34pcke9duffpkqrloj.apps.googleusercontent.com',
    // Google Drive folder ID to monitor
    driveFolderId: '1MpKKqjpabi10iDh1vWliaiLQsj8wktiz',
    // Required scopes
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/drive.file'
    ]
  },

  // Anymail API (Email Finding Service)
  anymail: {
    apiKey: 'g5Z72bVPvvfdrWjWLmbBVIJs',
    baseUrl: 'https://api.anymail.com/v1' // Update with actual Anymail API URL
  },

  // HubSpot CRM API
  hubspot: {
    apiKey: 'na2-e523-6348-4407-a23a-d0c00f2ed0ca',
    portalId: '244560986',
    baseUrl: 'https://api.hubapi.com',
    developerOverviewUrl: 'https://app-na2.hubspot.com/developer-overview/244560986'
  },

  // Database Configuration (PostgreSQL)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hingecraft_automation',
    user: process.env.DB_USER || 'hingecraft_user',
    password: process.env.DB_PASSWORD || 'hingecraft_password'
  },

  // Redis Configuration (for queue and caching)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },

  // Application Configuration
  app: {
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development',
    webhookSecret: process.env.WEBHOOK_SECRET || 'hingecraft-webhook-secret-change-in-production',
    // DRY RUN MODE: Process entire pipeline but don't send emails
    dryRun: process.env.DRY_RUN === 'true' || false,
    dryRunMessage: 'DRY RUN MODE: Emails will be validated but NOT sent'
  },

  // Email Configuration
  email: {
    fromAddress: 'hello@hingecraft.org',
    fromName: 'HingeCraft',
    replyTo: 'hello@hingecraft.org',
    // Email sending limits
    dailyLimit: 1000,
    hourlyLimit: 100,
    perDomainLimit: 10,
    // Wave-based sending configuration (prevents spam)
    waveSize: 75, // Emails per wave (50-100 recommended)
    waveDelay: 60000, // Delay between waves in ms (1 minute default)
    batchConcurrency: 10 // Emails sent concurrently within a wave
  },

  // Sequence Configuration
  sequences: {
    defaultDelayHours: 24,
    maxSequenceLength: 5,
    autoApproveScore: 85,
    qaReviewScore: 65
  }
};
