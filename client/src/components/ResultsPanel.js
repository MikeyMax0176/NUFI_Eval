import React, { useState } from 'react';
import { exportToCSV, exportToJSON, exportToDOC } from '../utils/exportUtils';
import JsonDetailsRenderer from './JsonDetailsRenderer';

function ResultsPanel({ results, error, loading, selectedApi }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'

  if (loading) {
    return (
      <div className="results-panel">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Querying NUFI API...</p>
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
      profilingPhone: 'Profiling_Phone',
      profilingEmail: 'Profiling_Email',
      renapo: 'CURP_Name_Search'
    };
    const apiName = apiNameMap[selectedApi] || 'NUFI';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `NUFI_${apiName}_${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(results, filename); // Now passing full results for comprehensive export
        break;
      case 'json':
        exportToJSON(results, filename);
        break;
      case 'doc':
        exportToDOC(results, filename, apiName);
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
        <div className="view-toggle">
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button
            className={viewMode === 'json' ? 'active' : ''}
            onClick={() => setViewMode('json')}
          >
            JSON
          </button>
        </div>
      </div>

      {results.metadata && (
        <div className="metadata">
          <strong>Query Info:</strong> {results.metadata.endpoint} API | 
          Parameters: {results.metadata.paramsUsed.join(', ')} | 
          Timestamp: {new Date(results.metadata.timestamp).toLocaleString()}
        </div>
      )}

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

      {viewMode === 'table' ? (
        <JsonDetailsRenderer data={results} />
      ) : (
        <JsonView data={results} />
      )}
    </div>
  );
}

// JSON view component - Raw JSON display
function JsonView({ data }) {
  return (
    <div className="json-view">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default ResultsPanel;
