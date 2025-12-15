/**
 * System Watcher Service
 * Monitors and logs every single portion of the entire system
 * Tracks complete pipeline flow from file drop to email sending
 */

const logger = require('../utils/logger');
const db = require('../utils/database');
const fs = require('fs').promises;
const path = require('path');

class SystemWatcher {
  constructor() {
    this.isWatching = false;
    this.mode = 'standby'; // 'standby', 'active', 'stopped'
    this.pipelineLogs = [];
    this.componentStatus = {};
    this.activePipelines = new Map(); // Track active pipeline runs
    this.logFilePath = path.join(__dirname, '../../logs/pipeline.log');
    this.waitingForFile = true; // Standby mode - waiting for file input
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  async ensureLogDirectory() {
    const logDir = path.join(__dirname, '../../logs');
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Start watching the entire system (standby mode - waiting for file)
   */
  async startWatching() {
    if (this.isWatching && this.mode === 'active') {
      logger.warn('System watcher already running');
      return;
    }

    this.isWatching = true;
    this.mode = 'standby';
    this.waitingForFile = true;
    
    logger.info('🔍 SYSTEM WATCHER IN STANDBY MODE - Waiting for file input');
    logger.info('⏳ Status: WAITING ON INPUT STAGE');
    this.logPipelineEvent('SYSTEM', 'WATCHER_STANDBY', { 
      timestamp: new Date(),
      status: 'waiting_for_file',
      message: 'System ready - waiting for file in Google Drive'
    });

    // Initialize component status (all in standby)
    this.componentStatus = {
      googleDrive: { status: 'standby', lastCheck: null, waiting: true },
      leadProcessor: { status: 'standby', lastCheck: null, waiting: true },
      hubspot: { status: 'standby', lastCheck: null, waiting: true },
      anymail: { status: 'standby', lastCheck: null, waiting: true },
      emailWaveSender: { status: 'standby', lastCheck: null, waiting: true },
      sequenceEngine: { status: 'standby', lastCheck: null, waiting: true },
      database: { status: 'standby', lastCheck: null, waiting: true }
    };

    return true;
  }

  /**
   * Activate watcher when file is detected
   */
  activateWatcher(fileId, fileName) {
    if (this.mode === 'standby' && this.waitingForFile) {
      this.mode = 'active';
      this.waitingForFile = false;
      
      logger.info('🚀 SYSTEM WATCHER ACTIVATED - File detected!');
      logger.info(`📁 File: ${fileName}`);
      logger.info('🔍 Now tracking complete pipeline flow...');
      
      this.logPipelineEvent('SYSTEM', 'WATCHER_ACTIVATED', {
        timestamp: new Date(),
        fileId: fileId,
        fileName: fileName,
        status: 'tracking_active'
      });

      // Update component status to active
      Object.keys(this.componentStatus).forEach(component => {
        this.componentStatus[component].status = 'active';
        this.componentStatus[component].waiting = false;
        this.componentStatus[component].lastCheck = new Date();
      });
    }
  }

  /**
   * Stop watching
   */
  stopWatching() {
    this.isWatching = false;
    logger.info('🔍 SYSTEM WATCHER STOPPED');
    this.logPipelineEvent('SYSTEM', 'WATCHER_STOPPED', { timestamp: new Date() });
  }

  /**
   * Log pipeline event with full context
   */
  logPipelineEvent(component, event, data = {}) {
    const eventLog = {
      timestamp: new Date().toISOString(),
      component,
      event,
      data,
      pipelineId: data.pipelineId || 'system'
    };

    // Add to in-memory logs (keep last 1000)
    this.pipelineLogs.push(eventLog);
    if (this.pipelineLogs.length > 1000) {
      this.pipelineLogs.shift();
    }

    // Write to file
    this.writeToLogFile(eventLog);

    // Update component status
    if (this.componentStatus[component]) {
      this.componentStatus[component].lastCheck = new Date();
      this.componentStatus[component].lastEvent = event;
    }

    // Log to winston
    logger.info(`[${component}] ${event}`, data);
  }

  /**
   * Write event to log file
   */
  async writeToLogFile(eventLog) {
    try {
      const logLine = JSON.stringify(eventLog) + '\n';
      await fs.appendFile(this.logFilePath, logLine);
    } catch (error) {
      logger.error('Error writing to pipeline log file:', error);
    }
  }

  /**
   * Start tracking a new pipeline run
   */
  startPipelineTracking(pipelineId, fileId, fileName) {
    const pipeline = {
      id: pipelineId,
      fileId,
      fileName,
      startTime: new Date(),
      status: 'started',
      stages: {
        fileDetection: { status: 'pending', startTime: null, endTime: null, data: {} },
        fileProcessing: { status: 'pending', startTime: null, endTime: null, data: {} },
        leadProcessing: { status: 'pending', startTime: null, endTime: null, data: {} },
        emailCollection: { status: 'pending', startTime: null, endTime: null, data: {} },
        databaseIntegration: { status: 'pending', startTime: null, endTime: null, data: {} },
        hubspotSync: { status: 'pending', startTime: null, endTime: null, data: {} },
        sequenceInit: { status: 'pending', startTime: null, endTime: null, data: {} },
        emailSending: { status: 'pending', startTime: null, endTime: null, data: {} },
        eventTracking: { status: 'pending', startTime: null, endTime: null, data: {} }
      }
    };

    this.activePipelines.set(pipelineId, pipeline);
    this.logPipelineEvent('PIPELINE', 'STARTED', { pipelineId, fileId, fileName });
    
    return pipeline;
  }

  /**
   * Update pipeline stage
   */
  updatePipelineStage(pipelineId, stage, status, data = {}) {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) {
      logger.warn(`Pipeline ${pipelineId} not found`);
      return;
    }

    const stageData = pipeline.stages[stage];
    if (!stageData) {
      logger.warn(`Stage ${stage} not found in pipeline`);
      return;
    }

    if (status === 'started' && !stageData.startTime) {
      stageData.startTime = new Date();
    }
    if (status === 'completed' || status === 'failed') {
      stageData.endTime = new Date();
      if (stageData.startTime) {
        stageData.duration = stageData.endTime - stageData.startTime;
      }
    }

    stageData.status = status;
    stageData.data = { ...stageData.data, ...data };

    this.logPipelineEvent('PIPELINE', `STAGE_${stage.toUpperCase()}_${status.toUpperCase()}`, {
      pipelineId,
      stage,
      ...data
    });

    // Update overall pipeline status
    const allStages = Object.values(pipeline.stages);
    const completedStages = allStages.filter(s => s.status === 'completed').length;
    const failedStages = allStages.filter(s => s.status === 'failed').length;

    if (failedStages > 0) {
      pipeline.status = 'failed';
    } else if (completedStages === allStages.length) {
      pipeline.status = 'completed';
      pipeline.endTime = new Date();
      pipeline.totalDuration = pipeline.endTime - pipeline.startTime;
    } else {
      pipeline.status = 'in_progress';
    }
  }

  /**
   * Complete pipeline tracking
   */
  completePipelineTracking(pipelineId, summary = {}) {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) return;

    pipeline.endTime = new Date();
    pipeline.totalDuration = pipeline.endTime - pipeline.startTime;
    pipeline.status = 'completed';
    pipeline.summary = summary;

    this.logPipelineEvent('PIPELINE', 'COMPLETED', {
      pipelineId,
      totalDuration: pipeline.totalDuration,
      ...summary
    });

    // Keep in memory for 1 hour, then remove
    setTimeout(() => {
      this.activePipelines.delete(pipelineId);
    }, 3600000); // 1 hour
  }

  /**
   * Get pipeline status
   */
  getPipelineStatus(pipelineId) {
    return this.activePipelines.get(pipelineId) || null;
  }

  /**
   * Get all active pipelines
   */
  getAllActivePipelines() {
    return Array.from(this.activePipelines.values());
  }

  /**
   * Get component status
   */
  getComponentStatus() {
    return this.componentStatus;
  }

  /**
   * Get current status (includes mode, waiting state, etc.)
   */
  getStatus() {
    return {
      isWatching: this.isWatching,
      mode: this.mode,
      waitingForFile: this.waitingForFile,
      activePipelines: this.activePipelines.size,
      componentStatus: this.componentStatus
    };
  }

  /**
   * Get recent pipeline logs
   */
  getRecentLogs(limit = 100) {
    return this.pipelineLogs.slice(-limit);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component, limit = 100) {
    return this.pipelineLogs
      .filter(log => log.component === component)
      .slice(-limit);
  }

  /**
   * Get logs by pipeline ID
   */
  getLogsByPipeline(pipelineId, limit = 1000) {
    return this.pipelineLogs
      .filter(log => log.pipelineId === pipelineId)
      .slice(-limit);
  }

  /**
   * Watch Google Drive file detection (TRIGGER POINT)
   */
  watchFileDetection(fileId, fileName, mimeType) {
    // Activate watcher when file is detected
    this.activateWatcher(fileId, fileName);
    
    this.logPipelineEvent('GOOGLE_DRIVE', 'FILE_DETECTED', {
      fileId,
      fileName,
      mimeType,
      detectedAt: new Date(),
      trigger: 'pipeline_started'
    });
  }

  /**
   * Watch file processing
   */
  watchFileProcessing(fileId, fileType, rowCount, columnCount) {
    this.logPipelineEvent('FILE_PROCESSOR', 'FILE_PROCESSED', {
      fileId,
      fileType,
      rowCount,
      columnCount,
      processedAt: new Date()
    });
  }

  /**
   * Watch lead processing
   */
  watchLeadProcessing(processed, errors, enriched, validated) {
    this.logPipelineEvent('LEAD_PROCESSOR', 'LEADS_PROCESSED', {
      processed,
      errors,
      enriched,
      validated,
      processedAt: new Date()
    });
  }

  /**
   * Watch email collection
   */
  watchEmailCollection(found, enriched, total) {
    this.logPipelineEvent('ANYMAIL', 'EMAILS_COLLECTED', {
      found,
      enriched,
      total,
      collectedAt: new Date()
    });
  }

  /**
   * Watch database operations
   */
  watchDatabaseOperation(operation, table, count, duration) {
    this.logPipelineEvent('DATABASE', 'OPERATION', {
      operation,
      table,
      count,
      duration,
      timestamp: new Date()
    });
  }

  /**
   * Watch HubSpot sync
   */
  watchHubSpotSync(contactId, leadId, status, duration) {
    this.logPipelineEvent('HUBSPOT', 'SYNC', {
      contactId,
      leadId,
      status,
      duration,
      syncedAt: new Date()
    });
  }

  /**
   * Watch email sending
   */
  watchEmailSending(waveNumber, emailsInWave, sent, failed, duration) {
    this.logPipelineEvent('EMAIL_WAVE', 'SENT', {
      waveNumber,
      emailsInWave,
      sent,
      failed,
      duration,
      sentAt: new Date()
    });
  }

  /**
   * Watch sequence operations
   */
  watchSequenceOperation(leadId, sequenceId, step, action, result) {
    this.logPipelineEvent('SEQUENCE_ENGINE', 'OPERATION', {
      leadId,
      sequenceId,
      step,
      action,
      result,
      timestamp: new Date()
    });
  }

  /**
   * Generate pipeline report
   */
  generatePipelineReport(pipelineId) {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) {
      return { error: 'Pipeline not found' };
    }

    const logs = this.getLogsByPipeline(pipelineId);
    
    return {
      pipeline: {
        id: pipeline.id,
        fileName: pipeline.fileName,
        status: pipeline.status,
        startTime: pipeline.startTime,
        endTime: pipeline.endTime,
        totalDuration: pipeline.totalDuration
      },
      stages: pipeline.stages,
      logs: logs,
      summary: pipeline.summary || {}
    };
  }
}

module.exports = new SystemWatcher();



