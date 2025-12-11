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
    this.pipelineLogs = [];
    this.componentStatus = {};
    this.activePipelines = new Map(); // Track active pipeline runs
    this.logFilePath = path.join(__dirname, '../../logs/pipeline.log');
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
   * Start watching the entire system
   */
  async startWatching() {
    if (this.isWatching) {
      logger.warn('System watcher already running');
      return;
    }

    this.isWatching = true;
    logger.info('🔍 SYSTEM WATCHER STARTED - Monitoring all components');
    this.logPipelineEvent('SYSTEM', 'WATCHER_STARTED', { timestamp: new Date() });

    // Initialize component status
    this.componentStatus = {
      googleDrive: { status: 'monitoring', lastCheck: null },
      leadProcessor: { status: 'monitoring', lastCheck: null },
      hubspot: { status: 'monitoring', lastCheck: null },
      anymail: { status: 'monitoring', lastCheck: null },
      emailWaveSender: { status: 'monitoring', lastCheck: null },
      sequenceEngine: { status: 'monitoring', lastCheck: null },
      database: { status: 'monitoring', lastCheck: null }
    };

    return true;
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
   * Watch Google Drive file detection
   */
  watchFileDetection(fileId, fileName, mimeType) {
    this.logPipelineEvent('GOOGLE_DRIVE', 'FILE_DETECTED', {
      fileId,
      fileName,
      mimeType,
      detectedAt: new Date()
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
