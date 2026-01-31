import React, { useState, useEffect } from 'react';
import './App.css';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import StatsBar from './components/StatsBar';

function App() {
  const [selectedApi, setSelectedApi] = useState('enrichment');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch stats on mount and after each request
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Map API selection to endpoint
      const endpointMap = {
        'enrichment': '/api/nufi/enrichment',
        'blacklist': '/api/nufi/blacklist',
        'enrichmentByPhone': '/api/nufi/enrichment/phone',
        'enrichmentByEmail': '/api/nufi/enrichment/email',
        'enrichmentByName': '/api/nufi/enrichment/name',
        'profilingPhone': '/api/nufi/profiling/phone',
        'profilingEmail': '/api/nufi/profiling/email',
        'renapo': '/api/nufi/renapo/curp'
      };

      const endpoint = endpointMap[selectedApi];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Request failed');
      }

      // Refresh stats after request
      await fetchStats();
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Guardian Fusion</h1>
          <p>Data Intelligence and Verification Platform</p>
        </div>

        <StatsBar stats={stats} />

        <div className="main-content">
          <InputPanel
            selectedApi={selectedApi}
            onApiChange={setSelectedApi}
            onSubmit={handleSubmit}
            loading={loading}
          />

          <ResultsPanel
            results={results}
            error={error}
            loading={loading}
            selectedApi={selectedApi}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
