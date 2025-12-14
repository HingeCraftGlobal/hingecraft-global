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
    clientId: '1038403103618-9khn47kou8vkop37b0kiq0autj0712af.apps.googleusercontent.com',
    clientSecret: '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',
    apiKey: 'AIzaSyDMUf14ZedNdsrV6nRqVa3-jmfHhdpoJDU', // Google API Key for HingeCraft
    // Gmail OAuth (for personal email access)
    gmailClientId: '394260294524-kri84v91me0sss34pcke9duffpkqrloj.apps.googleusercontent.com',
    // Google Drive folder ID to monitor
    driveFolderId: '1MpKKqjpabi10iDh1vWliaiLQsj8wktiz',
    // Required scopes (Complete Blueprint Version)
    scopes: [
      // Gmail Scopes
      'https://www.googleapis.com/auth/gmail.send',           // Send email
      'https://www.googleapis.com/auth/gmail.modify',         // Modify threads, replies, opens
      'https://www.googleapis.com/auth/gmail.metadata',       // Read inbox metadata for lead-status logic
      // Google Sheets Scopes
      'https://www.googleapis.com/auth/spreadsheets',         // Full read/write to Sheets
      // Google Drive Scopes
      'https://www.googleapis.com/auth/drive.file',           // Create & manage automation files
      'https://www.googleapis.com/auth/drive.readonly',       // Read uploaded CSV/XLSX files
      'https://www.googleapis.com/auth/drive.metadata.readonly' // View folder structure
    ]
  },

  // Anymail API (Email Finding Service)
  anymail: {
    apiKey: 'pRUtyDRHSPageC2jHGbnWGpD',
    baseUrl: 'https://api.anymail.com/v1' // Update with actual Anymail API URL
  },

  // HubSpot CRM API
  hubspot: {
    // Personal Access Key (Private App - MAIN)
    personalAccessKey: 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39',
    // Client Secret (Private App)
    clientSecret: '0ad815f3-704e-4157-9135-f1e180c65b15',
    // Developer API Key (legacy, for some endpoints)
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
    dryRunMessage: 'DRY RUN MODE: Emails will be validated but NOT sent',
    // Template URL Configuration
    missionSupportUrl: process.env.MISSION_SUPPORT_URL || 'https://hingecraft.global/mission-support',
    studentPageUrl: process.env.STUDENT_PAGE_URL || 'https://hingecraft.global/student',
    buildLogUrl: process.env.BUILD_LOG_URL || 'https://hingecraft.global/build-log',
    submitCreationUrl: process.env.SUBMIT_CREATION_URL || 'https://hingecraft.global/submit',
    baseUrl: process.env.BASE_URL || 'https://hingecraft.global'
  },

  // Email Configuration
  email: {
    // Single account - marketingecraft@gmail.com only
    fromAddress: 'marketingecraft@gmail.com',
    fromName: 'HingeCraft',
    replyTo: 'marketingecraft@gmail.com',
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
  },

  // Google Gemini AI Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAngHYLqf83H-hT7tqYhaEaEMq01FFyN2U',
    projectId: process.env.GEMINI_PROJECT_ID || '560092674546',
    clientId: process.env.GEMINI_CLIENT_ID || 'gen-lang-client-0591481817',
    model: 'gemini-pro'
  }
};
