import React, { useState } from 'react';
import './JsonDetailsRenderer.css';

/**
 * JsonDetailsRenderer - Complete dossier view with comprehensive data display
 * Shows all names, phones, emails, addresses, usernames, user_ids, urls, relationships
 * Includes valid_since/last_seen dates
 * Renders as compact tables with expandable "View all" sections
 */

// Utility: Sanitize data by removing unwanted fields
const sanitizeForDisplay = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForDisplay(item));
  }
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove search pointer, md5 hashes, and other internal fields
    if (key === '@search_pointer' || 
        key === 'search_pointer' || 
        key.endsWith('_md5') || 
        key === '@inferred' ||
        key === '@id') {
      continue;
    }
    
    if (value && typeof value === 'object') {
      cleaned[key] = sanitizeForDisplay(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

// Utility: Build comprehensive dossier from person object
const buildDossier = (person) => {
  if (!person) return null;

  const relationships = Array.isArray(person.relationships)
    ? person.relationships.flatMap((rel) => {
        const relNames = Array.isArray(rel.names) ? rel.names : [];
        if (relNames.length === 0) {
          return [{
            name: rel.name || rel.display || rel.content || 'Unknown',
            type: rel['@type'] || rel.type,
            valid_since: rel['@valid_since']
          }];
        }
        return relNames.map((n) => ({
          name: n.display || `${n.first || ''} ${n.middle || ''} ${n.last || ''}`.trim() || rel.name || 'Unknown',
          type: rel['@type'] || rel.type,
          valid_since: n['@valid_since'] || rel['@valid_since']
        }));
      })
    : [];

  return {
    names: person.names || [],
    phones: person.phones || [],
    emails: person.emails || [],
    addresses: person.addresses || [],
    usernames: person.usernames || [],
    user_ids: person.user_ids || [],
    urls: person.urls || [],
    relationships,
    gender: person.gender,
    dob: person.dob,
    languages: person.languages || [],
    jobs: person.jobs || [],
    educations: person.educations || [],
    images: person.images || [],
    ethnicities: person.ethnicities || [],
    origin_countries: person.origin_countries || [],
    match: person['@match'],
    id: person['@id'],
    inferred: person['@inferred']
  };
};

// Utility: Format key for display
const formatKey = (key) => {
  return String(key || '')
    .replace(/[@_]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Utility: Format date to mm/dd/yyyy
const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return 'N/A';
  }
};

// Utility: Format display value
const formatDisplayValue = (value, keyName) => {
  if (!value) return 'N/A';
  
  // Handle date fields FIRST (before checking type)
  if (keyName && (keyName.includes('date') || keyName.includes('since') || keyName.includes('seen'))) {
    return formatDate(value);
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    
    // Handle objects with display properties
    if (value.display) return value.display;
    if (value.content) return value.content;
    if (value.address) return value.address;
    if (value.url) return value.url;
    if (value.number) return value.number;
    if (value.first || value.middle || value.last) {
      return `${value.first || ''} ${value.middle || ''} ${value.last || ''}`.trim();
    }
    
    return JSON.stringify(value);
  }
  
  return String(value);
};

// Component: Expandable table with View All
function ExpandableTable({ items, columns, maxRows = 3, title }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!items || items.length === 0) return null;
  
  const displayItems = expanded ? items : items.slice(0, maxRows);
  const hasMore = items.length > maxRows;

  return (
    <div className="expandable-table-container">
      <table className="dossier-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {typeof col.render === 'function' 
                    ? col.render(item) 
                    : formatDisplayValue(item[col.key], col.key)
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button className="view-all-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▼ View Less' : `▶ View All (${items.length})`}
        </button>
      )}
    </div>
  );
}

// Component: Complete Dossier View
function PersonInfoCompact({ person, availableData }) {
  if (!person) return null;

  const dossier = buildDossier(person);
  
  // Get primary info for header
  const primaryName = dossier.names[0]?.display || 
    `${dossier.names[0]?.first || ''} ${dossier.names[0]?.last || ''}`.trim() || 'Unknown';
  const primaryPhone = dossier.phones[0]?.display_international || 
    dossier.phones[0]?.display || 
    dossier.phones[0]?.number || 'N/A';
  const primaryEmail = dossier.emails[0]?.address || dossier.emails[0] || 'N/A';
  const primaryAddress = dossier.addresses[0]?.display || 
    `${dossier.addresses[0]?.city || ''}, ${dossier.addresses[0]?.state || ''}`.trim() || 'N/A';
  const primaryImage = dossier.images[0]?.url || dossier.images[0] || null;
  const matchScore = dossier.match !== undefined ? Math.round(dossier.match * 100) : null;

  const premiumCounts = availableData?.premium && typeof availableData.premium === 'object'
    ? Object.entries(availableData.premium)
    : [];

  return (
    <div className="dossier-card">
      {/* Header */}
      <div className="dossier-header">
        {primaryImage && (
          <div className="dossier-photo">
            <img src={primaryImage} alt={primaryName} />
          </div>
        )}
        <div className="dossier-title">
          <h2>{primaryName}</h2>
          {matchScore !== null && (
            <div className="confidence-badge">{matchScore}% Match</div>
          )}
        </div>
      </div>

      {/* Primary Contact Info */}
      <div className="dossier-section">
        <div className="summaryGrid">
          <span className="dossier-label">📱 Phone</span>
          <span className="dossier-value">{primaryPhone}</span>
          <span className="dossier-label">📧 Email</span>
          <span className="dossier-value">{primaryEmail}</span>
          <span className="dossier-label">📍 Location</span>
          <span className="dossier-value">{primaryAddress}</span>
        </div>
      </div>

      {/* All Names */}
      {dossier.names.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">👤 Names</div>
          <ExpandableTable
            items={dossier.names}
            columns={[
              { key: 'display', label: 'Name' },
              { key: '@type', label: 'Type' },
              { key: '@valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item['@valid_since'], 'date') },
              { key: '@last_seen', label: 'Last Seen', render: (item) => formatDisplayValue(item['@last_seen'], 'date') }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* All Phones */}
      {dossier.phones.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">📞 Phone Numbers</div>
          <ExpandableTable
            items={dossier.phones}
            columns={[
              { 
                key: 'display_international', 
                label: 'Phone',
                render: (item) => item.display_international || item.display || item.number
              },
              { key: '@type', label: 'Type' },
              { key: '@valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item['@valid_since'], 'date') },
              { key: '@last_seen', label: 'Last Seen', render: (item) => formatDisplayValue(item['@last_seen'], 'date') }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* All Emails */}
      {dossier.emails.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">📧 Email Addresses</div>
          <ExpandableTable
            items={dossier.emails}
            columns={[
              { key: 'address', label: 'Email', render: (item) => item.address || item.email || item },
              { key: '@type', label: 'Type' },
              { key: '@email_provider', label: 'Provider', render: (item) => item['@email_provider'] ? '✓' : '-' },
              { key: '@valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item['@valid_since'], 'date') },
              { key: '@current', label: 'Current', render: (item) => item['@current'] ? '✓' : '-' }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* All Addresses */}
      {dossier.addresses.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">📍 Addresses</div>
          <ExpandableTable
            items={dossier.addresses}
            columns={[
              { 
                key: 'display', 
                label: 'Address',
                render: (item) => item.display || `${item.city || ''} ${item.state || ''}`.trim()
              },
              { key: 'city', label: 'City' },
              { key: 'state', label: 'State' },
              { key: 'country', label: 'Country' },
              { key: '@valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item['@valid_since'], 'date') }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* All Usernames */}
      {dossier.usernames.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">🔑 Usernames</div>
          <ExpandableTable
            items={dossier.usernames}
            columns={[
              { key: 'content', label: 'Username' },
              { key: 'platform', label: 'Platform' },
              { key: '@valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item['@valid_since'], 'date') }
            ]}
            maxRows={5}
          />
        </div>
      )}

      {/* All User IDs */}
      {dossier.user_ids.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">🆔 User IDs</div>
          <ExpandableTable
            items={dossier.user_ids}
            columns={[
              { key: 'id', label: 'ID', render: (item) => item.id || item.content || item.value || item },
              { key: 'type', label: 'Type' },
              { key: '@valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item['@valid_since'], 'date') }
            ]}
            maxRows={5}
          />
        </div>
      )}

      {/* All URLs */}
      {dossier.urls.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">🔗 URLs</div>
          <ExpandableTable
            items={dossier.urls}
            columns={[
              { 
                key: 'url', 
                label: 'URL',
                render: (item) => (
                  <a href={item.url || item} target="_blank" rel="noopener noreferrer" className="dossier-link">
                    {(item.url || item).substring(0, 60)}...
                  </a>
                )
              },
              { key: '@name', label: 'Name' },
              { key: '@domain', label: 'Domain' },
              { key: '@category', label: 'Category' }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* Relationships */}
      {dossier.relationships.length > 0 && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">👥 Relationships</div>
          <ExpandableTable
            items={dossier.relationships}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'type', label: 'Type' },
              { key: 'valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item.valid_since, 'date') }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* Personal Info */}
      {(dossier.gender || dossier.dob || dossier.languages.length > 0) && (
        <div className="dossier-section report-section-block">
          <div className="dossier-section-title">ℹ️ Personal Information</div>
          <div className="dossier-grid">
            {dossier.gender && (
              <div className="dossier-item">
                <div className="dossier-item-label">Gender</div>
                <div className="dossier-item-value">
                  {dossier.gender.content || dossier.gender}
                </div>
                {dossier.gender['@valid_since'] && (
                  <div className="dossier-item-subvalue">
                    Since {formatDisplayValue(dossier.gender['@valid_since'], 'date')}
                  </div>
                )}
              </div>
            )}
            {dossier.dob && (
              <div className="dossier-item">
                <div className="dossier-item-label">Date of Birth</div>
                <div className="dossier-item-value">
                  {formatDisplayValue(dossier.dob, 'date')}
                </div>
              </div>
            )}
            {dossier.languages.length > 0 && (
              <div className="dossier-item">
                <div className="dossier-item-label">Languages</div>
                <div className="dossier-item-value">
                  {dossier.languages.map(l => l.display || l.language).join(', ')}
                </div>
                {dossier.languages.some(l => l['@inferred']) && (
                  <div className="dossier-item-subvalue">Includes inferred</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employment */}
      {dossier.jobs.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">💼 Employment</div>
          <ExpandableTable
            items={dossier.jobs}
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'organization', label: 'Organization' },
              { key: 'industry', label: 'Industry' }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* Education */}
      {dossier.educations.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">🎓 Education</div>
          <ExpandableTable
            items={dossier.educations}
            columns={[
              { key: 'degree', label: 'Degree' },
              { key: 'school', label: 'School' }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* Additional Info */}
      {(dossier.ethnicities.length > 0 || dossier.origin_countries.length > 0) && (
        <div className="dossier-section">
          <div className="dossier-section-title">🌍 Additional Info</div>
          <div className="dossier-grid">
            {dossier.ethnicities.length > 0 && (
              <div className="dossier-item">
                <div className="dossier-item-label">Ethnicities</div>
                <div className="dossier-item-value">
                  {dossier.ethnicities.map(e => e.display || e.ethnicity).join(', ')}
                </div>
              </div>
            )}
            {dossier.origin_countries.length > 0 && (
              <div className="dossier-item">
                <div className="dossier-item-label">Origin Countries</div>
                <div className="dossier-item-value">
                  {dossier.origin_countries.map(c => c.display || c.country).join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images */}
      {dossier.images.length > 1 && (
        <div className="dossier-section">
          <div className="dossier-section-title">📷 Photos</div>
          <div className="dossier-gallery">
            {dossier.images.slice(1, 10).map((img, idx) => (
              <img 
                key={idx} 
                src={img.url || img} 
                alt={`${primaryName} ${idx + 2}`}
                className="gallery-image"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main JsonDetailsRenderer wrapper
function JsonDetailsRenderer({ data }) {
  if (!data || typeof data !== 'object') {
    return <div className="no-data">No data to display</div>;
  }

  const cleanData = sanitizeForDisplay(data);
  const nufiData = cleanData.data?.data || cleanData.data || cleanData;
  const person = nufiData.person || cleanData.person;
  const availableData = nufiData.available_data || cleanData.available_data;

  if (!person) {
    return <div className="no-data">No person data found</div>;
  }

  return <PersonInfoCompact person={person} availableData={availableData} />;
}

// Export utilities
export { sanitizeForDisplay, buildDossier, formatDisplayValue, formatKey };
export default JsonDetailsRenderer;
