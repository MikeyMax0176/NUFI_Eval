import React from 'react';
import { exportToCSV, exportToJSON, exportToDOC } from '../utils/exportUtils';
import JsonDetailsRenderer from './JsonDetailsRenderer';

function ResultsPanel({ results, error, loading, selectedApi }) {

  if (loading) {
    return (
      <div className="results-panel">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Querying API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-panel">
        <div className="error-state">
          <strong>Error</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-panel">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Results Yet</h3>
          <p>Fill in the search parameters and submit a query to see results here.</p>
        </div>
      </div>
    );
  }

  const handleExport = (format) => {
    const apiNameMap = {
      enrichment: 'Enrichment',
      blacklist: 'Blacklist',
      enrichmentByPhone: 'Enrichment_Phone',
      enrichmentByEmail: 'Enrichment_Email',
      enrichmentByName: 'Enrichment_Name',
      renapo: 'Renapo_CURP'
    };
    const apiName = apiNameMap[selectedApi] || 'Enrichment';
    
    // Extract the search value (phone, email, or name) for the filename
    let searchIdentifier = '';
    
    // Try to get from query data first
    if (results.data && results.data.query) {
      // Check for phone numbers
      if (results.data.query.phones && results.data.query.phones.length > 0) {
        searchIdentifier = results.data.query.phones[0].number || results.data.query.phones[0].raw;
      }
      // Check for emails
      else if (results.data.query.emails && results.data.query.emails.length > 0) {
        searchIdentifier = results.data.query.emails[0].address || results.data.query.emails[0];
      }
      // Check for names
      else if (results.data.query.names && results.data.query.names.length > 0) {
        const name = results.data.query.names[0];
        searchIdentifier = name.display || `${name.first || ''}_${name.last || ''}`.replace(/__/g, '_');
      }
      // Direct email or phone in query
      else if (results.data.query.email) {
        searchIdentifier = results.data.query.email;
      }
      else if (results.data.query.phone) {
        searchIdentifier = results.data.query.phone;
      }
    }
    
    // Fallback: extract from top-level data fields
    if (!searchIdentifier && results.data) {
      searchIdentifier = results.data.phone || 
                       results.data.telefono || 
                       results.data.celular ||
                       results.data.correo ||
                       results.data.email ||
                       results.data.curp ||
                       results.data.rfc ||
                       '';
      
      // Try to get name if nothing else found
      if (!searchIdentifier && results.data.nombre) {
        searchIdentifier = `${results.data.nombre || ''}_${results.data.apellidoPaterno || ''}`.replace(/__/g, '_');
      }
    }
    
    // Clean identifier for filename (remove special characters)
    searchIdentifier = String(searchIdentifier)
      .trim()
      .replace(/[^a-zA-Z0-9@._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    // Create filename: use search identifier as the main filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = searchIdentifier || `${apiName}_${timestamp}`;

    // Extract phone number for document metadata (if applicable)
    let phoneNumber = '';
    if (results.data && results.data.query && results.data.query.phones && results.data.query.phones.length > 0) {
      phoneNumber = results.data.query.phones[0].number || results.data.query.phones[0].raw || '';
      phoneNumber = phoneNumber.replace(/\D/g, '');
    }

    switch (format) {
      case 'csv':
        exportToCSV(results, filename);
        break;
      case 'json':
        exportToJSON(results, filename);
        break;
      case 'doc':
        exportToDOC(results, filename, apiName, phoneNumber);
        break;
      default:
        break;
    }
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    // Could add a toast notification here
  };

  return (
    <div className="results-panel">
      <div className="results-header">
        <h2 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
          Results
        </h2>
      </div>

      <div className="export-buttons">
        <button className="btn-export" onClick={() => handleExport('csv')}>
          Export CSV
        </button>
        <button className="btn-export" onClick={() => handleExport('json')}>
          Export JSON
        </button>
        <button className="btn-export" onClick={() => handleExport('doc')}>
          Export DOC
        </button>
        <button className="btn-export" onClick={copyJsonToClipboard} style={{ backgroundColor: '#9b59b6' }}>
          📋 Copy JSON
        </button>
      </div>

      <JsonDetailsRenderer data={results} />
    </div>
  );
}

export default ResultsPanel;
