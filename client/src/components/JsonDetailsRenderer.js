import React, { useState } from 'react';
function PersonInfoCompact({ person, availableData }) {
  if (!person) return null;

  const dossier = buildDossier(person);

  const primaryName = dossier.names[0]?.display || `${dossier.names[0]?.first || ''} ${dossier.names[0]?.last || ''}`.trim() || 'Unknown';
  const primaryPhone = dossier.phones[0]?.display_international || dossier.phones[0]?.display || dossier.phones[0]?.number || 'N/A';
  const primaryEmail = dossier.emails[0]?.address || dossier.emails[0] || 'N/A';
  const primaryAddress = dossier.addresses[0]?.display || `${dossier.addresses[0]?.city || ''}, ${dossier.addresses[0]?.state || ''}`.trim() || 'N/A';
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
        <div className="dossier-row">
          <span className="dossier-label">📱 Phone</span>
          <span className="dossier-value">{primaryPhone}</span>
        </div>
        <div className="dossier-row">
          <span className="dossier-label">📧 Email</span>
          <span className="dossier-value">{primaryEmail}</span>
        </div>
        <div className="dossier-row">
          <span className="dossier-label">📍 Location</span>
          <span className="dossier-value">{primaryAddress}</span>
        </div>
      </div>

      {/* Premium Coverage */}
      {premiumCounts.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">💎 Premium Coverage</div>
          <div className="dossier-grid">
            {premiumCounts.map(([key, value]) => (
              <div key={key} className="dossier-item">
                <div className="dossier-item-label">{formatKey(key)}</div>
                <div className="dossier-item-value">{formatDisplayValue(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Names */}
      {dossier.names.length > 0 && (
        <div className="dossier-section">
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
        <div className="dossier-section">
          <div className="dossier-section-title">📞 Phone Numbers</div>
          <ExpandableTable
            items={dossier.phones}
            columns={[
              { key: 'address', label: 'Email', render: (item) => item.address || item.email || item }
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
        <div className="dossier-section">
          <div className="dossier-section-title">📧 Email Addresses</div>
          <ExpandableTable
            items={dossier.emails}
            columns={[
              { key: 'address', label: 'Email' },
              { key: '@type', label: 'Type' },
              { key: '@valid_since', label: 'Valid Since', render: (item) => formatDisplayValue(item['@valid_since'], 'date') },
              { key: '@current', label: 'Current', render: (item) => item['@current'] ? '✓' : '-' }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* All Addresses */}
      {dossier.addresses.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">📍 Addresses</div>
          <ExpandableTable
            items={dossier.addresses}
            columns={[
              {
                key: 'display',
                label: 'Address',
                render: (item) => item.display || `${item.city || ''} ${item.state || ''} ${item.country || ''}`.trim()
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
        <div className="dossier-section">
          <div className="dossier-section-title">🔑 Usernames</div>
          <ExpandableTable
            items={dossier.usernames}
            columns={[
              { key: 'content', label: 'Username' },
              { key: 'platform', label: 'Platform' }
            ]}
            maxRows={5}
          />
        </div>
      )}

      {/* All User IDs */}
      {dossier.user_ids.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">🆔 User IDs</div>
          <ExpandableTable
            items={dossier.user_ids}
            columns={[
              { key: 'id', label: 'ID', render: (item) => item.id || item.content || item.value || item },
              { key: 'type', label: 'Type' }
            ]}
            maxRows={5}
          />
        </div>
      )}

      {/* All URLs */}
      {dossier.urls.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">🔗 URLs</div>
          <ExpandableTable
            items={dossier.urls}
            columns={[
              {
                key: 'url',
                label: 'URL',
                render: (item) => (
                  <a href={item.url || item} target="_blank" rel="noopener noreferrer" className="dossier-link">
                    {String(item.url || item).substring(0, 60)}...
                  </a>
                )
              },
              { key: 'type', label: 'Type' }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* Relationships */}
      {dossier.relationships.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">👥 Relationships</div>
          <ExpandableTable
            items={dossier.relationships}
            columns={[
              { key: 'name', label: 'Name', render: (item) => item.name || item.display || item.content || item },
              { key: 'relationship', label: 'Relationship' },
              { key: 'type', label: 'Type' }
            ]}
            maxRows={3}
          />
        </div>
      )}

      {/* Personal Info */}
      {(dossier.gender || dossier.dob || dossier.languages.length > 0) && (
        <div className="dossier-section">
          <div className="dossier-section-title">ℹ️ Personal Information</div>
          <div className="dossier-grid">
            {dossier.gender && (
              <div className="dossier-item">
                <div className="dossier-item-label">Gender</div>
                <div className="dossier-item-value">
                  {dossier.gender.content || dossier.gender}
                </div>
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
      )}
    </div>
  );
}

// Component: Render an object
function ObjectRenderer({ obj, depth = 0 }) {
  if (!obj || typeof obj !== 'object') {
    return <PrimitiveValue value={obj} />;
  }

  const entries = Object.entries(obj);
  
  if (entries.length === 0) {
    return <span className="empty-value">(empty object)</span>;
  }

  return (
    <div className="object-container" style={{ marginLeft: depth > 0 ? '15px' : '0' }}>
      {entries.map(([key, value]) => (
        <div key={key} className={`object-field ${isMetadataKey(key) ? 'metadata-field' : ''}`}>
          <div className="field-key">{formatKey(key)}:</div>
          <div className="field-value">
            <ValueRenderer value={value} keyName={key} depth={depth} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Component: Main value router
function ValueRenderer({ value, keyName, depth = 0 }) {
  if (value === null || value === undefined) {
    return <span className="null-value">null</span>;
  }

  if (Array.isArray(value)) {
    return <ArrayRenderer array={value} keyName={keyName} depth={depth} />;
  }

  if (typeof value === 'object') {
    return <ObjectRenderer obj={value} depth={depth} />;
  }

  // Primitive types
  return <PrimitiveValue value={value} keyName={keyName} />;
}

// Component: Expandable section
function ExpandableSection({ title, icon, children, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="expandable-section">
      <div className="section-header" onClick={() => setExpanded(!expanded)}>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
      </div>
      {expanded && <div className="section-content">{children}</div>}
    </div>
  );
}

// Component: Expandable table with "View all"
function ExpandableTable({ items, columns, maxRows = 3 }) {
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

// Component: Dossier/Baseball Card View
function PersonInfoCompact({ person }) {
  if (!person) return null;

  // Extract key data
  const names = person.names || [];
  const phones = person.phones || [];
  const emails = person.emails || [];
  const addresses = person.addresses || [];
  const jobs = person.jobs || [];
  const educations = person.educations || [];
  const images = person.images || [];
  const languages = person.languages || [];
  const usernames = person.usernames || [];
  const urls = person.urls || [];

  // Get primary data
  const primaryName = names[0]?.display || `${names[0]?.first || ''} ${names[0]?.last || ''}`.trim() || 'Unknown';
  const primaryPhone = phones[0]?.display_international || phones[0]?.display || phones[0]?.number || 'N/A';
  const primaryEmail = emails[0]?.address || emails[0] || 'N/A';
  const primaryAddress = addresses[0]?.display || `${addresses[0]?.city || ''}, ${addresses[0]?.state || ''}`.trim() || 'N/A';
  const primaryImage = images[0]?.url || images[0] || null;
  const gender = person.gender?.content || person.gender || 'N/A';
  const dob = person.dob?.display || person.dob?.date_range?.start || person.dob || 'N/A';
  const matchScore = person['@match'] !== undefined ? Math.round(person['@match'] * 100) : null;

  return (
    <div className="dossier-card">
      {/* Header Section with Photo */}
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
        <div className="dossier-row">
          <span className="dossier-label">📱 Phone</span>
          <span className="dossier-value">{primaryPhone}</span>
        </div>
        <div className="dossier-row">
          <span className="dossier-label">📧 Email</span>
          <span className="dossier-value">{primaryEmail}</span>
        </div>
        <div className="dossier-row">
          <span className="dossier-label">📍 Location</span>
          <span className="dossier-value">{primaryAddress}</span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="dossier-section">
        <div className="dossier-section-title">Personal Information</div>
        <div className="dossier-grid">
          <div className="dossier-item">
            <div className="dossier-item-label">Gender</div>
            <div className="dossier-item-value">{gender}</div>
          </div>
          <div className="dossier-item">
            <div className="dossier-item-label">Date of Birth</div>
            <div className="dossier-item-value">{dob}</div>
          </div>
          {languages.length > 0 && (
            <div className="dossier-item">
              <div className="dossier-item-label">Languages</div>
              <div className="dossier-item-value">
                {languages.map(l => l.display || l.language).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Contact Methods */}
      {(phones.length > 1 || emails.length > 1) && (
        <div className="dossier-section">
          <div className="dossier-section-title">Additional Contacts</div>
          {phones.length > 1 && (
            <div className="dossier-list">
              <strong>Phones:</strong>
              {phones.slice(1).map((p, idx) => (
                <span key={idx} className="dossier-tag">
                  {p.display_international || p.display || p.number}
                </span>
              ))}
            </div>
          )}
          {emails.length > 1 && (
            <div className="dossier-list">
              <strong>Emails:</strong>
              {emails.slice(1).map((e, idx) => (
                <span key={idx} className="dossier-tag">
                  {e.address || e}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employment */}
      {jobs.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">💼 Employment</div>
          {jobs.map((job, idx) => (
            <div key={idx} className="dossier-entry">
              <div className="entry-title">{job.title || 'Position'}</div>
              <div className="entry-subtitle">
                {job.organization || 'Company'} {job.industry && `• ${job.industry}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section-title">🎓 Education</div>
          {educations.map((edu, idx) => (
            <div key={idx} className="dossier-entry">
              <div className="entry-title">{edu.degree || 'Degree'}</div>
              <div className="entry-subtitle">{edu.school || 'School'}</div>
            </div>
          ))}
        </div>
      )}

      {/* Online Presence */}
      {(usernames.length > 0 || urls.length > 0) && (
        <div className="dossier-section">
          <div className="dossier-section-title">🌐 Online Presence</div>
          {usernames.length > 0 && (
            <div className="dossier-list">
              <strong>Usernames:</strong>
              {usernames.map((u, idx) => (
                <span key={idx} className="dossier-tag">{u.content || u}</span>
              ))}
            </div>
          )}
          {urls.length > 0 && (
            <div className="dossier-list">
              <strong>URLs:</strong>
              {urls.slice(0, 3).map((url, idx) => (
                <a key={idx} href={url.url || url} target="_blank" rel="noopener noreferrer" className="dossier-link">
                  🔗 Link {idx + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Additional Images */}
      {images.length > 1 && (
        <div className="dossier-section">
          <div className="dossier-section-title">📷 Additional Photos</div>
          <div className="dossier-gallery">
            {images.slice(1, 5).map((img, idx) => (
              <img key={idx} src={img.url || img} alt={`${primaryName} ${idx + 2}`} />
            ))}
          </div>
        </div>
      )}

      {/* All Addresses */}
      {addresses.length > 1 && (
        <div className="dossier-section">
          <div className="dossier-section-title">📍 Known Addresses</div>
          {addresses.slice(1).map((addr, idx) => (
            <div key={idx} className="dossier-tag">
              {addr.display || `${addr.city || ''} ${addr.state || ''} ${addr.country || ''}`.trim()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main component
export default function JsonDetailsRenderer({ data }) {
  if (!data || typeof data !== 'object') {
    return <div className="no-data">No data to display</div>;
  }

  // Sanitize data to remove unwanted fields
  const cleanData = sanitizeForDisplay(data);

  // Extract known structures from NUFI API response
  const nufiData = cleanData.data?.data || cleanData.data || cleanData;
  const person = nufiData.person;
  const query = nufiData.query;
  const availableData = nufiData.available_data;
  const metadata = cleanData.metadata;
  const status = {
    status: cleanData.status || nufiData.status,
    code: cleanData.code || nufiData.code,
    message: cleanData.message || nufiData.message
  };

  return (
    <div className="json-details-renderer">
      {/* Status Section */}
      {(status.status || status.code) && (
        <ExpandableSection 
          title="API Response Status" 
          icon="📊" 
          defaultExpanded={true}
        >
          <ObjectRenderer obj={status} />
        </ExpandableSection>
      )}

      {/* Request Metadata */}
      {metadata && (
        <ExpandableSection 
          title="Request Metadata" 
          icon="🔍" 
          defaultExpanded={true}
        >
          <ObjectRenderer obj={metadata} />
        </ExpandableSection>
      )}

      {/* Person Data - Most Important */}
      {person && (
        <ExpandableSection 
          title="Person Information" 
          icon="👤" 
          defaultExpanded={true}
        >
          <PersonInfoCompact person={person} availableData={availableData} />
        </ExpandableSection>
      )}

      {/* Query Data */}
      {query && (
        <ExpandableSection 
          title="Query Details" 
          icon="🔎" 
          defaultExpanded={false}
        >
          <ObjectRenderer obj={query} />
        </ExpandableSection>
      )}

      {/* Available Premium Data */}
      {availableData && (
        <ExpandableSection 
          title="Available Premium Data" 
          icon="💎" 
          defaultExpanded={true}
        >
          <ObjectRenderer obj={availableData} />
        </ExpandableSection>
      )}

      {/* Search Metadata (IDs, counts, etc.) */}
      {nufiData['@search_id'] && (
        <ExpandableSection 
          title="Search Metadata" 
          icon="🆔" 
          defaultExpanded={false}
        >
          <ObjectRenderer obj={{
            search_id: nufiData['@search_id'],
            persons_count: nufiData['@persons_count'],
            top_match: nufiData.top_match,
            ...Object.fromEntries(
              Object.entries(nufiData).filter(([k]) => k.startsWith('@'))
            )
          }} />
        </ExpandableSection>
      )}

      {/* Quota Information */}
      {(nufiData.QpsAllotted || nufiData.QuotaAllotted) && (
        <ExpandableSection 
          title="API Quota & Rate Limits" 
          icon="⚡" 
          defaultExpanded={false}
        >
          <ObjectRenderer obj={{
            QpsAllotted: nufiData.QpsAllotted,
            QpsCurrent: nufiData.QpsCurrent,
            QuotaAllotted: nufiData.QuotaAllotted,
            QuotaCurrent: nufiData.QuotaCurrent,
            QuotaReset: nufiData.QuotaReset,
            QpsLiveAllotted: nufiData.QpsLiveAllotted,
            QpsLiveCurrent: nufiData.QpsLiveCurrent
          }} />
        </ExpandableSection>
      )}
    </div>
  );
}

// Export helper functions for testing
export { formatKey, formatDate, isMetadataKey, sanitizeForDisplay, buildDossier, formatDisplayValue };
