/**
 * Validation Utilities
 * Input validation and sanitization functions
 */

/**
 * Validate email address
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalized = email.toLowerCase().trim();

  if (!emailRegex.test(normalized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for common invalid patterns
  if (normalized.includes('..') || normalized.startsWith('.') || normalized.endsWith('.')) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, email: normalized };
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
  if (!phone) {
    return { valid: true, phone: null }; // Phone is optional
  }

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.length < 10) {
    return { valid: false, error: 'Phone number too short' };
  }

  if (cleaned.length > 15) {
    return { valid: false, error: 'Phone number too long' };
  }

  return { valid: true, phone: cleaned };
}

/**
 * Validate URL
 */
function validateUrl(url) {
  if (!url) {
    return { valid: true, url: null }; // URL is optional
  }

  try {
    let normalized = url.trim();
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }

    const urlObj = new URL(normalized);
    
    // Validate domain
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return { valid: false, error: 'Invalid domain' };
    }

    return { valid: true, url: normalized };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate name
 */
function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const cleaned = name.trim();
  
  if (cleaned.length < 1) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (cleaned.length > 100) {
    return { valid: false, error: 'Name too long' };
  }

  // Check for suspicious patterns
  if (/[<>{}[\]\\]/.test(cleaned)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true, name: cleaned };
}

/**
 * Sanitize string input
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Validate lead data
 */
function validateLead(lead) {
  const errors = [];
  const warnings = [];

  // Email validation (required)
  const emailValidation = validateEmail(lead.email);
  if (!emailValidation.valid) {
    errors.push(`Email: ${emailValidation.error}`);
  }

  // Name validation (at least first or last name)
  if (!lead.first_name && !lead.last_name) {
    warnings.push('Name: At least first or last name recommended');
  } else {
    if (lead.first_name) {
      const firstNameValidation = validateName(lead.first_name);
      if (!firstNameValidation.valid) {
        errors.push(`First name: ${firstNameValidation.error}`);
      }
    }
    if (lead.last_name) {
      const lastNameValidation = validateName(lead.last_name);
      if (!lastNameValidation.valid) {
        errors.push(`Last name: ${lastNameValidation.error}`);
      }
    }
  }

  // Phone validation (optional)
  if (lead.phone) {
    const phoneValidation = validatePhone(lead.phone);
    if (!phoneValidation.valid) {
      warnings.push(`Phone: ${phoneValidation.error}`);
    }
  }

  // URL validation (optional)
  if (lead.website) {
    const urlValidation = validateUrl(lead.website);
    if (!urlValidation.valid) {
      warnings.push(`Website: ${urlValidation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: {
      email: emailValidation.valid ? emailValidation.email : null,
      first_name: lead.first_name ? sanitizeString(lead.first_name) : null,
      last_name: lead.last_name ? sanitizeString(lead.last_name) : null,
      organization: lead.organization ? sanitizeString(lead.organization) : null,
      title: lead.title ? sanitizeString(lead.title) : null,
      phone: lead.phone ? validatePhone(lead.phone).phone : null,
      website: lead.website ? validateUrl(lead.website).url : null,
      city: lead.city ? sanitizeString(lead.city) : null,
      state: lead.state ? sanitizeString(lead.state) : null,
      country: lead.country ? sanitizeString(lead.country) : null
    }
  };
}

/**
 * Validate webhook signature
 */
function validateWebhookSignature(payload, signature, secret) {
  if (!secret) {
    return { valid: false, error: 'Webhook secret not configured' };
  }

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const computed = hmac.digest('hex');

  // Use timing-safe comparison
  const crypto = require('crypto');
  return {
    valid: crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computed)
    ),
    computed,
    received: signature
  };
}

module.exports = {
  validateEmail,
  validatePhone,
  validateUrl,
  validateName,
  sanitizeString,
  validateLead,
  validateWebhookSignature
};
