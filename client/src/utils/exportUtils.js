/**
 * Export utilities for NUFI API results
 * Supports CSV, JSON, and DOC formats
 * 
 * CSV Export Strategy:
 * - Recursively flattens nested objects with dot notation (e.g., person.name)
 * - Arrays of objects: Creates multiple rows (one per array item)
 * - Arrays of primitives: Joins with semicolon separator
 * - Preserves all metadata including @-prefixed keys
 */

/**
 * Flatten nested object for CSV export
 * Now handles deep nesting and creates multiple rows for arrays of objects
 * Removes internal fields like @search_pointer
 */
const flattenObject = (obj, prefix = '') => {
  let result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip internal/metadata fields
    if (key === '@search_pointer' || 
        key === 'search_pointer' || 
        key.endsWith('_md5') || 
        key === '@inferred' ||
        key === '@id' ||
        key === 'metadata') {
      continue;
    }
    
    if (value === null || value === undefined) {
      continue; // Skip null/undefined but preserve empty strings
    }

    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        result[newKey] = '';
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        // Array of objects: join with semicolon, flatten each object
        result[newKey] = value.map(item => JSON.stringify(item)).join(' | ');
      } else {
        // Array of primitives: join with semicolon
        result[newKey] = value.join('; ');
      }
    } else if (typeof value === 'object' && value !== null) {
      // Nested object: recursively flatten
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
};

/**
 * Export results to CSV format
 * Now includes ALL fields from the response with clean formatting
 */
export const exportToCSV = (data, filename) => {
  try {
    // Sanitize then flatten the data
    const sanitized = sanitizeForExport(data);
    const flatData = flattenObject(sanitized);
    
    if (Object.keys(flatData).length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const headers = Object.keys(flatData);
    const values = Object.values(flatData);
    
    // Format column names - convert dot notation and clean up
    const cleanHeaders = headers.map(h => {
      return h
        .replace(/@/g, '')  // Remove @ symbols
        .replace(/\./g, '_') // Replace dots with underscores
        .replace(/([A-Z])/g, '_$1') // Add underscore before capitals
        .toLowerCase()
        .replace(/_+/g, '_') // Remove multiple underscores
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });

    const csvContent = [
      cleanHeaders.join(','),
      values.map(v => {
        const str = String(v).replace(/"/g, '""'); // Escape quotes
        return `"${str}"`;
      }).join(',')
    ].join('\n');

    // Download
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  } catch (error) {
    console.error('CSV export error:', error);
    alert('Failed to export CSV: ' + error.message);
  }
};

/**
 * Sanitize data for export - remove internal fields, vendor strings, and quota/QPS data
 */
const sanitizeForExport = (obj, debugMode = false) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForExport(item, debugMode));
  }
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove internal/metadata fields
    if (key === '@search_pointer' || 
        key === 'search_pointer' || 
        key.endsWith('_md5') || 
        key === '@inferred' ||
        key === '@id') {
      continue;
    }
    
    // Remove quota/QPS fields unless debug mode is enabled
    if (!debugMode && (
        key === 'quota_allotted' ||
        key === 'quota_current' ||
        key === 'quota_reset' ||
        key === 'qps_allotted' ||
        key === 'qps_current' ||
        key.includes('quota') ||
        key.includes('qps'))) {
      continue;
    }
    
    // Remove endpoint reference
    if (key === 'endpoint') {
      continue;
    }
    
    if (value && typeof value === 'object') {
      cleaned[key] = sanitizeForExport(value, debugMode);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

/**
 * Export results to JSON format
 */
export const exportToJSON = (data, filename) => {
  try {
    const sanitized = sanitizeForExport(data);
    const jsonContent = JSON.stringify(sanitized, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  } catch (error) {
    console.error('JSON export error:', error);
    alert('Failed to export JSON');
  }
};

/**
 * Format a value for clean display in the document
 */
const formatValue = (value) => {
  if (value === null || value === undefined) return '<em style="color: #999;">N/A</em>';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return value || '<em style="color: #999;">Empty</em>';
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) {
    if (value.length === 0) return '<em style="color: #999;">Empty array</em>';
    if (typeof value[0] === 'object' && value[0] !== null) {
      // Array of objects - render each as a sub-section
      return value.map((item, i) => `
        <div style="margin-left: 20px; margin-top: 10px; padding: 10px; background: #fff; border-left: 3px solid #3498db;">
          <strong>Item ${i + 1}:</strong><br/>
          ${Object.entries(item).map(([k, v]) => 
            `<div style="margin-left: 10px;"><strong>${k}:</strong> ${formatValue(v)}</div>`
          ).join('')}
        </div>
      `).join('');
    }
    // Array of primitives
    return value.join(', ');
  }
  if (typeof value === 'object') {
    // Nested object - render inline
    return `<div style="margin-left: 15px; margin-top: 5px;">${
      Object.entries(value).map(([k, v]) => 
        `<div><strong>${k}:</strong> ${formatValue(v)}</div>`
      ).join('')
    }</div>`;
  }
  return String(value);
};

/**
 * Render a nested object as clean HTML sections
 */
const renderObjectSection = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object') {
    return `<p>No data available</p>`;
  }
  
  let html = '';
  const indent = depth > 0 ? 'margin-left: 20px;' : '';
  
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '<p><em>No data available</em></p>';
  }
  
  for (const [key, value] of entries) {
    // Skip metadata and internal fields in the data section
    if (key === 'metadata' || key.startsWith('@')) continue;
    
    const label = key
      .replace(/([A-Z])/g, ' $1') // Add space before capitals
      .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 3) {
      // Large nested object - create subsection
      html += `
        <div style="${indent}">
          <h3 style="color: #2c3e50; font-size: 15px; margin-top: 15px; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px;">${label}</h3>
          ${renderObjectSection(value, depth + 1)}
        </div>`;
    } else {
      // Simple field or small object - show as key-value pair
      const formattedValue = formatValue(value);
      html += `
        <div style="${indent} margin-bottom: 10px;">
          <strong style="color: #2c3e50; display: inline-block; min-width: 150px;">${label}:</strong> 
          <span style="color: #34495e;">${formattedValue}</span>
        </div>`;
    }
  }
  
  return html || '<p><em>No data to display</em></p>';
};

/**
 * Export results to DOC format - Professional Word document
 * Now generates true .docx files with proper styling via server endpoint
 */
export const exportToDOC = async (data, filename, apiName, phoneNumber = '') => {
  try {
    // Handle different data structures
    let responseData;
    if (data.data) {
      responseData = data;
    } else if (data.results) {
      responseData = { data: data.results, metadata: data.metadata };
    } else {
      responseData = { data: data };
    }
    
    if (!responseData.data || (typeof responseData.data === 'object' && Object.keys(responseData.data).length === 0)) {
      alert('No data to export');
      return;
    }

    // Call server endpoint to generate professional DOCX
    const response = await fetch('/api/export/docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: responseData.data,
        apiName: apiName || 'Enrichment Report',
        phoneNumber: phoneNumber,
        metadata: responseData.metadata || {}
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to generate document');
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Extract filename from Content-Disposition header if present
    let docFilename = 'Enrichment_Report.docx';
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        docFilename = filenameMatch[1];
      }
    }

    // Download the file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Successfully exported ${docFilename}`);
  } catch (error) {
    console.error('DOC export error:', error);
    alert('Failed to export DOC: ' + error.message);
  }
};

/**
 * Helper function to trigger file download
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
