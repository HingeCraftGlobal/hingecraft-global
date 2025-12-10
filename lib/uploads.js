/**
 * File Upload Handling
 * S3 pre-signed URL generation and upload management
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

let s3Client = null;
let bucketName = null;
let bucketRegion = null;

/**
 * Initialize S3 client
 */
function initS3(config) {
  bucketName = config.bucket;
  bucketRegion = config.region || 'us-east-1';

  const s3Config = {
    region: bucketRegion,
    signatureVersion: 'v4'
  };

  if (config.endpoint) {
    s3Config.endpoint = config.endpoint;
    s3Config.s3ForcePathStyle = true;
  }

  if (config.accessKeyId && config.secretAccessKey) {
    s3Config.accessKeyId = config.accessKeyId;
    s3Config.secretAccessKey = config.secretAccessKey;
  }

  s3Client = new AWS.S3(s3Config);
}

/**
 * Generate pre-signed PUT URL for upload
 */
function generateUploadUrl(filename, contentType, expiresInMinutes = 15) {
  if (!s3Client || !bucketName) {
    throw new Error('S3 not initialized');
  }

  const key = `uploads/${uuidv4()}/${filename}`;
  const expires = expiresInMinutes * 60; // Convert to seconds

  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    Expires: expires
  };

  const uploadUrl = s3Client.getSignedUrl('putObject', params);
  const fileUrl = s3Client.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: key,
    Expires: 31536000 // 1 year for GET URLs
  });

  return {
    uploadUrl,
    fileUrl: fileUrl.split('?')[0], // Remove query params for public URLs if bucket is public
    s3Key: key
  };
}

/**
 * Verify file exists in S3
 */
async function verifyFileExists(s3Key) {
  if (!s3Client || !bucketName) {
    throw new Error('S3 not initialized');
  }

  try {
    await s3Client.headObject({
      Bucket: bucketName,
      Key: s3Key
    }).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Request upload (create upload record and return signed URL)
 */
async function requestUpload(uploadData) {
  const {
    filename,
    contentType,
    size,
    userId,
    channel,
    messageTempId
  } = uploadData;

  // Validate file size (12MB max)
  const maxSize = 12 * 1024 * 1024;
  if (size > maxSize) {
    throw new Error('File size exceeds 12MB limit');
  }

  // Generate upload URLs
  const { uploadUrl, fileUrl, s3Key } = generateUploadUrl(filename, contentType);

  // Create upload record
  const uploadId = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const upload = await db.createUpload({
    upload_id: uploadId,
    user_id: userId,
    filename,
    content_type: contentType,
    size,
    file_url: fileUrl,
    s3_key: s3Key,
    expires_at: expiresAt
  });

  return {
    uploadId,
    uploadUrl,
    fileUrl,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Complete upload (verify file exists and update status)
 */
async function completeUpload(uploadId, messageTempId) {
  const upload = await db.getUploadById(uploadId);
  
  if (!upload) {
    throw new Error('Upload not found');
  }

  // Verify file exists in S3
  const exists = await verifyFileExists(upload.s3_key);
  if (!exists) {
    throw new Error('File not found in storage');
  }

  // Update upload status
  const updated = await db.updateUploadStatus(uploadId, 'complete', upload.file_url);
  
  return {
    uploadId: updated.upload_id,
    fileUrl: updated.file_url,
    filename: updated.filename,
    contentType: updated.content_type,
    size: updated.size
  };
}

/**
 * Scan file for viruses (placeholder - integrate with virus scanning service)
 */
async function scanFileForViruses(fileUrl) {
  // TODO: Integrate with virus scanning service
  // For now, return safe
  return { safe: true };
}

module.exports = {
  initS3,
  generateUploadUrl,
  verifyFileExists,
  requestUpload,
  completeUpload,
  scanFileForViruses
};





