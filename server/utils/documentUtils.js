/**
 * Document Sanitization and Formatting Utilities
 * Clean up data for professional document export
 */

/**
 * Remove duplicate brand blocks and headers
 */
const removeDuplicateBrandBlocks = (content) => {
  if (typeof content !== 'string') return content;
  
  // Remove multiple occurrences of brand blocks
  const brandPattern = /Blueline\s*\|\s*Global Technologies\s*\/?\s*ITERATIVE TASKING/gi;
  const matches = content.match(brandPattern);
  
  if (matches && matches.length > 1) {
    // Keep only the first occurrence
    let cleaned = content;
    for (let i = 1; i < matches.length; i++) {
      cleaned = cleaned.replace(matches[i], '');
    }
    return cleaned;
  }
  
  return content;
};

/**
 * Collapse multiple blank lines into single line breaks
 */
const collapseBlankLines = (content) => {
  if (typeof content !== 'string') return content;
  
  // Replace 3+ consecutive newlines with 2
  return content.replace(/\n{3,}/g, '\n\n');
};

/**
 * Clean up bullet points - ensure consistent formatting
 */
const normalizeBulletPoints = (content) => {
  if (typeof content !== 'string') return content;
  
  // Replace various bullet characters with standard •
  return content
    .replace(/[▪▫■□●○◆◇]/g, '•')
    .replace(/^[\s]*[-*]\s/gm, '• '); // Convert - and * at line start to bullets
};

/**
 * Format phone numbers consistently
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 12) {
    // International format: +XX XXX XXX XXXX
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.length === 10) {
    // US/MX format: XXX XXX XXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    // +1 format: +X XXX XXX XXXX
    return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone; // Return as-is if doesn't match expected format
};

/**
 * Format dates consistently (MM-DD-YYYY)
 */
const formatDate = (dateString, format = 'MM-DD-YYYY') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'LONG':
        return date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      default:
        return `${month}-${day}-${year}`;
    }
  } catch (error) {
    return dateString;
  }
};

/**
 * Format timestamps consistently
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return timestamp;
  }
};

/**
 * Remove all-caps paragraphs (except for small labels)
 */
const normalizeCapitalization = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Split into words
  const words = text.split(/\s+/);
  
  // If entire text is caps and longer than 20 chars, convert to title case
  if (text === text.toUpperCase() && text.length > 20) {
    return words
      .map(word => {
        // Keep acronyms (2-3 letter all-caps words)
        if (word.length <= 3 && word === word.toUpperCase()) {
          return word;
        }
        // Convert to title case
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
  
  return text;
};

/**
 * Sanitize complete content for document export
 */
const sanitizeForDocument = (content) => {
  let sanitized = content;
  
  if (typeof content === 'string') {
    sanitized = removeDuplicateBrandBlocks(sanitized);
    sanitized = collapseBlankLines(sanitized);
    sanitized = normalizeBulletPoints(sanitized);
    sanitized = normalizeCapitalization(sanitized);
  } else if (typeof content === 'object' && content !== null) {
    // Recursively sanitize object properties
    sanitized = {};
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeForDocument(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeForDocument(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Extract phone number from various possible locations in data
 */
const extractPhoneNumber = (data) => {
  if (!data) return null;
  
  // Try common phone field names
  const phoneFields = [
    'phone', 'telefono', 'celular', 'mobile', 
    'phoneNumber', 'msisdn', 'number'
  ];
  
  // Check top level
  for (const field of phoneFields) {
    if (data[field]) {
      return formatPhoneNumber(data[field]);
    }
  }
  
  // Check nested objects
  if (data.person) {
    for (const field of phoneFields) {
      if (data.person[field]) {
        return formatPhoneNumber(data.person[field]);
      }
    }
  }
  
  if (data.query && data.query.phones && Array.isArray(data.query.phones)) {
    const phone = data.query.phones[0];
    if (phone.display_international) {
      return phone.display_international;
    }
    if (phone.display) {
      return phone.display;
    }
  }
  
  return null;
};

/**
 * Validate document data before generation
 */
const validateDocumentData = (data, apiName) => {
  const errors = [];
  
  if (!data) {
    errors.push('No data provided');
    return {
      isValid: false,
      errors
    };
  }
  
  if (!apiName || apiName.trim() === '') {
    errors.push('API name is required');
  }
  
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    errors.push('Data object is empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  removeDuplicateBrandBlocks,
  collapseBlankLines,
  normalizeBulletPoints,
  formatPhoneNumber,
  formatDate,
  formatTimestamp,
  normalizeCapitalization,
  sanitizeForDocument,
  extractPhoneNumber,
  validateDocumentData
};
