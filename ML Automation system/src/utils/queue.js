/**
 * Queue Management Utility
 * Simple in-memory queue for job processing
 */

const logger = require('./logger');

class Queue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.processing = false;
    this.processors = [];
  }

  /**
   * Add job to queue
   */
  async add(job) {
    const jobWithId = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: job,
      status: 'queued',
      createdAt: new Date(),
      attempts: 0
    };

    this.jobs.push(jobWithId);
    logger.debug(`Job ${jobWithId.id} added to queue ${this.name}`);

    // Process if not already processing
    if (!this.processing) {
      this.process();
    }

    return jobWithId.id;
  }

  /**
   * Register processor function
   */
  process(processor) {
    if (processor) {
      this.processors.push(processor);
    }

    // Start processing if jobs exist
    if (this.jobs.length > 0 && !this.processing) {
      this.startProcessing();
    }
  }

  /**
   * Start processing jobs
   */
  async startProcessing() {
    if (this.processing || this.processors.length === 0) {
      return;
    }

    this.processing = true;

    while (this.jobs.length > 0) {
      const job = this.jobs.shift();

      if (job.status === 'queued') {
        job.status = 'processing';
        job.startedAt = new Date();

        try {
          // Process with first available processor
          for (const processor of this.processors) {
            try {
              await processor(job.data);
              job.status = 'completed';
              job.completedAt = new Date();
              logger.info(`Job ${job.id} completed`);
              break;
            } catch (error) {
              logger.error(`Job ${job.id} failed:`, error);
              job.attempts++;
              
              if (job.attempts < 3) {
                // Retry
                job.status = 'queued';
                this.jobs.push(job);
              } else {
                job.status = 'failed';
                job.error = error.message;
              }
            }
          }
        } catch (error) {
          job.status = 'failed';
          job.error = error.message;
          logger.error(`Job ${job.id} failed:`, error);
        }
      }
    }

    this.processing = false;
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      name: this.name,
      queued: this.jobs.filter(j => j.status === 'queued').length,
      processing: this.jobs.filter(j => j.status === 'processing').length,
      completed: this.jobs.filter(j => j.status === 'completed').length,
      failed: this.jobs.filter(j => j.status === 'failed').length,
      total: this.jobs.length
    };
  }

  /**
   * Clear completed jobs
   */
  clearCompleted() {
    this.jobs = this.jobs.filter(j => j.status !== 'completed');
  }
}

// Create queue instances
const fileProcessingQueue = new Queue('file-processing');
const emailQueue = new Queue('email-sending');
const hubspotQueue = new Queue('hubspot-sync');

module.exports = {
  Queue,
  fileProcessingQueue,
  emailQueue,
  hubspotQueue
};
