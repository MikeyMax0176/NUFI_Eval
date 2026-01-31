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
 */
const flattenObject = (obj, prefix = '') => {
  let result = {};
  
  for (const [key, value] of Object.entries(obj)) {
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
 * Now includes ALL fields from the response
 */
export const exportToCSV = (data, filename) => {
  try {
    // Flatten the entire response object
    const flatData = flattenObject(data);
    
    if (Object.keys(flatData).length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const headers = Object.keys(flatData);
    const values = Object.values(flatData);
    
    // Format column names (keep dots for clarity, clean up)
    const cleanHeaders = headers.map(h => 
      h.replace(/@/g, 'meta_') // Replace @ with meta_
    );

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
 * Export results to JSON format
 */
export const exportToJSON = (data, filename) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  } catch (error) {
    console.error('JSON export error:', error);
    alert('Failed to export JSON');
  }
};

/**
 * Export results to DOC format (HTML-based Word-compatible document)
 */
export const exportToDOC = (data, filename, apiName) => {
  try {
    const flatData = flattenObject(data.data || data);
    
    if (Object.keys(flatData).length === 0) {
      alert('No data to export');
      return;
    }

    // Create HTML document structure
    const timestamp = new Date().toLocaleString();
    const metadata = data.metadata || {};
    
    let docContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NUFI API Report - ${apiName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
    }
    .metadata {
      background-color: #ecf0f1;
      padding: 15px;
      border-left: 4px solid #3498db;
      margin-bottom: 30px;
    }
    .metadata p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #bdc3c7;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #34495e;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #7f8c8d;
      border-top: 1px solid #bdc3c7;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <h1>NUFI API Report: ${apiName}</h1>
  
  <div class="metadata">
    <h2>Query Information</h2>
    <p><strong>Generated:</strong> ${timestamp}</p>
    ${metadata.endpoint ? `<p><strong>Endpoint:</strong> ${metadata.endpoint}</p>` : ''}
    ${metadata.paramsUsed ? `<p><strong>Parameters Used:</strong> ${metadata.paramsUsed.join(', ')}</p>` : ''}
    ${metadata.timestamp ? `<p><strong>API Query Time:</strong> ${new Date(metadata.timestamp).toLocaleString()}</p>` : ''}
  </div>

  <h2>Results</h2>
  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
`;

    // Add data rows
    for (const [key, value] of Object.entries(flatData)) {
      const cleanKey = key.split(/[._]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      docContent += `
      <tr>
        <td><strong>${cleanKey}</strong></td>
        <td>${String(value)}</td>
      </tr>`;
    }

    docContent += `
    </tbody>
  </table>

  <div class="footer">
    <p>Report generated by NUFI API Testing Interface</p>
    <p>This document is for internal evaluation and testing purposes only.</p>
  </div>
</body>
</html>`;

    // Download as .doc (HTML-based, opens in Word)
    downloadFile(docContent, `${filename}.doc`, 'application/msword');
  } catch (error) {
    console.error('DOC export error:', error);
    alert('Failed to export DOC');
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
