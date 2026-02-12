/**
 * Export utilities for NUFI API results
 * Supports CSV, JSON, and DOC formats
 * 
 * Export Strategy: Plain English, matching GUI display
 * - Clean field names (Name, Email, Phone)
 * - Human-readable format
 * - Organized sections
 */

/**
 * Extract person data in plain English format matching the GUI display
 */
const extractPersonData = (data) => {
  const result = {};
  
  // Get the person object - handle triple nesting from NUFI API
  const person = data?.data?.data?.person || data?.data?.person || data?.person;
  const available_data = data?.data?.data?.available_data || data?.data?.available_data || data?.available_data;
  const query = data?.data?.data?.query || data?.data?.query || data?.query;
  const rawData = data?.data;
  
  // Handle demo mode simple format (no person object)
  if (!person && rawData && !rawData.data && !rawData.person) {
    if (rawData.name) result['Name'] = rawData.name;
    if (rawData.phone) result['Phone'] = rawData.phone;
    if (rawData.email) result['Email'] = rawData.email;
    if (rawData.emailValid !== undefined) result['Email Valid'] = rawData.emailValid ? 'Yes' : 'No';
    if (rawData.domain) result['Email Domain'] = rawData.domain;
    if (rawData.companyName) result['Company'] = rawData.companyName;
    if (rawData.location) result['Location'] = rawData.location;
    if (rawData.carrier) result['Carrier'] = rawData.carrier;
    if (rawData.lineType) result['Line Type'] = rawData.lineType;
    if (rawData.alternativePhones && rawData.alternativePhones.length > 0) {
      result['Alternative Phones'] = rawData.alternativePhones.join('; ');
    }
    if (rawData.socialNetworks) {
      if (rawData.socialNetworks.linkedin) result['LinkedIn'] = rawData.socialNetworks.linkedin;
      if (rawData.socialNetworks.twitter) result['Twitter'] = rawData.socialNetworks.twitter;
      if (rawData.socialNetworks.facebook) result['Facebook'] = rawData.socialNetworks.facebook;
    }
  }
  
  // Basic Information (NUFI API format with person object)
  if (person) {
    // Name
    const primaryName = person.names?.[0];
    if (primaryName) {
      result['Name'] = primaryName.display || `${primaryName.first || ''} ${primaryName.middle || ''} ${primaryName.last || ''}`.trim() || 'N/A';
      if (primaryName['@type']) result['Name Type'] = primaryName['@type'];
      if (primaryName['@valid_since']) result['Name Valid Since'] = primaryName['@valid_since'];
    }
    
    // All Names (if multiple)
    if (person.names && person.names.length > 1) {
      result['All Names'] = person.names.map(n => n.display || `${n.first || ''} ${n.last || ''}`.trim()).join('; ');
    }
    
    // Phone
    const primaryPhone = person.phones?.[0];
    if (primaryPhone) {
      result['Phone'] = primaryPhone.display_international || primaryPhone.display || primaryPhone.number || 'N/A';
      if (primaryPhone['@type']) result['Phone Type'] = primaryPhone['@type'];
    }
    
    // All Phones (if multiple)
    if (person.phones && person.phones.length > 1) {
      result['All Phones'] = person.phones.map(p => p.display_international || p.display || p.number).filter(Boolean).join('; ');
    }
    
    // Email
    const primaryEmail = person.emails?.[0];
    if (primaryEmail) {
      result['Email'] = primaryEmail.address || primaryEmail.email || primaryEmail || 'N/A';
      if (primaryEmail['@type']) result['Email Type'] = primaryEmail['@type'];
    }
    
    // All Emails (if multiple)
    if (person.emails && person.emails.length > 1) {
      result['All Emails'] = person.emails.map(e => e.address || e.email || e).filter(Boolean).join('; ');
    }
    
    // Address
    const primaryAddress = person.addresses?.[0];
    if (primaryAddress) {
      result['Address'] = primaryAddress.display || `${primaryAddress.city || ''} ${primaryAddress.state || ''}`.trim() || 'N/A';
      if (primaryAddress.city) result['City'] = primaryAddress.city;
      if (primaryAddress.state) result['State'] = primaryAddress.state;
      if (primaryAddress.country) result['Country'] = primaryAddress.country;
      if (primaryAddress.zip_code) result['Zip Code'] = primaryAddress.zip_code;
    }
    
    // Gender
    if (person.gender?.content) {
      result['Gender'] = person.gender.content;
    }
    
    // Date of Birth
    if (person.dob) {
      result['Date of Birth'] = person.dob.display || person.dob;
    }
    
    // Languages
    if (person.languages && person.languages.length > 0) {
      result['Languages'] = person.languages.map(l => l.display || l.language).filter(Boolean).join(', ');
    }
    
    // Jobs
    if (person.jobs && person.jobs.length > 0) {
      result['Job Title'] = person.jobs[0].title || person.jobs[0].display || 'N/A';
      if (person.jobs[0].organization) result['Organization'] = person.jobs[0].organization;
    }
    
    // Education
    if (person.educations && person.educations.length > 0) {
      result['Education'] = person.educations[0].display || person.educations[0].school || 'N/A';
    }
    
    // Usernames
    if (person.usernames && person.usernames.length > 0) {
      result['Usernames'] = person.usernames.map(u => u.content || u).filter(Boolean).join(', ');
    }
    
    // URLs
    if (person.urls && person.urls.length > 0) {
      result['URLs'] = person.urls.map(u => u.url || u).filter(Boolean).join(', ');
    }
    
    // Match Score
    if (person['@match'] !== null && person['@match'] !== undefined) {
      result['Match Score'] = `${Math.round(person['@match'] * 100)}%`;
    }
    
    // Relationships
    if (person.relationships && person.relationships.length > 0) {
      const relationships = person.relationships.map(rel => {
        const relName = rel.names?.[0]?.display || rel.name || 'Unknown';
        const relType = rel['@type'] || rel.type || 'Relation';
        return `${relName} (${relType})`;
      });
      result['Relationships'] = relationships.join('; ');
    }
  }
  
  // Query information (what was searched)
  if (query) {
    if (query.phones?.[0]) {
      result['Searched Phone'] = query.phones[0].display_international || query.phones[0].display || query.phones[0].number;
    }
    if (query.emails?.[0]) {
      result['Searched Email'] = query.emails[0].address || query.emails[0].email;
    }
    if (query.names?.[0]) {
      result['Searched Name'] = query.names[0].display || query.names[0];
    }
  }
  
  // Premium data availability
  if (available_data?.premium) {
    const premium = available_data.premium;
    const premiumFields = [];
    if (premium.names) premiumFields.push(`Names (${premium.names})`);
    if (premium.phones) premiumFields.push(`Phones (${premium.phones})`);
    if (premium.emails) premiumFields.push(`Emails (${premium.emails})`);
    if (premium.addresses) premiumFields.push(`Addresses (${premium.addresses})`);
    if (premiumFields.length > 0) {
      result['Premium Data Available'] = premiumFields.join(', ');
    }
  }
  
  // Metadata
  const metadata = data?.metadata;
  if (metadata) {
    if (metadata.timestamp) result['Query Timestamp'] = new Date(metadata.timestamp).toLocaleString();
    if (metadata.endpoint) result['API Endpoint'] = metadata.endpoint;
  }
  
  return result;
};

/**
 * Legacy flatten function for JSON structure (fallback)
 */
const flattenObject = (obj, prefix = '') => {
  let result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        result[newKey] = '';
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        result[newKey] = value.map(item => JSON.stringify(item)).join(' | ');
      } else {
        result[newKey] = value.join('; ');
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
};

/**
 * Export results to CSV format in plain English
 * Matches what the GUI displays
 */
export const exportToCSV = (data, filename) => {
  try {
    // Extract data in human-readable format
    const cleanData = extractPersonData(data);
    
    if (Object.keys(cleanData).length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content with clean column names
    const headers = Object.keys(cleanData);
    const values = Object.values(cleanData);

    const csvContent = [
      headers.join(','),
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
 * Uses plain English labels matching the GUI
 */
export const exportToDOC = (data, filename, apiName) => {
  try {
    // Extract data in human-readable format
    const cleanData = extractPersonData(data);
    
    if (Object.keys(cleanData).length === 0) {
      alert('No data to export');
      return;
    }

    // Create HTML document structure
    const timestamp = new Date().toLocaleString();
    const metadata = data.metadata || {};
    const person = data?.data?.person || data?.person;
    
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
      margin-top: 25px;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .summary {
      background-color: #ecf0f1;
      padding: 20px;
      border-left: 4px solid #3498db;
      margin-bottom: 30px;
    }
    .summary h2 {
      margin-top: 0;
    }
    .summary p {
      margin: 8px 0;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 20px;
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
      width: 35%;
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
  
  <div class="summary">
    <h2>Report Summary</h2>
    <p><strong>Generated:</strong> ${timestamp}</p>
    ${metadata.endpoint ? `<p><strong>API Endpoint:</strong> ${metadata.endpoint}</p>` : ''}
    ${metadata.paramsUsed ? `<p><strong>Search Parameters:</strong> ${metadata.paramsUsed.join(', ')}</p>` : ''}
    ${person?.['@match'] ? `<p><strong>Match Confidence:</strong> ${Math.round(person['@match'] * 100)}%</p>` : ''}
  </div>

  <h2>Contact Information</h2>
  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
`;

    // Add data rows with clean field names
    for (const [key, value] of Object.entries(cleanData)) {
      // Skip metadata fields in the main table
      if (key.includes('Timestamp') || key.includes('Endpoint')) continue;
      
      docContent += `
      <tr>
        <td><strong>${key}</strong></td>
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
