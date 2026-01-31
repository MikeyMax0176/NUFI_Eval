import React from 'react';

function StatsBar({ stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-label">Total Requests</span>
        <span className="stat-value">{stats.totalRequests}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Enrichment</span>
        <span className="stat-value">{stats.enrichmentRequests}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Blacklist</span>
        <span className="stat-value">{stats.blacklistRequests}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Errors</span>
        <span className="stat-value" style={{ color: stats.errors > 0 ? '#e74c3c' : '#3498db' }}>
          {stats.errors}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Uptime</span>
        <span className="stat-value" style={{ fontSize: '16px' }}>
          {Math.floor(stats.uptime / 60)}m {stats.uptime % 60}s
        </span>
      </div>
    </div>
  );
}

export default StatsBar;
