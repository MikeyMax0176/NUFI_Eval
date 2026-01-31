import React, { useState, useEffect } from 'react';

// Field configurations based on NUFI API documentation
const API_FIELDS = {
  enrichment: [
    { name: 'rfc', label: 'RFC (Tax ID)', placeholder: 'e.g., XAXX010101000', hint: 'Mexican tax identification number' },
    { name: 'curp', label: 'CURP (Citizen ID)', placeholder: 'e.g., XEXX010101HNEXXXA4', hint: 'Mexican unique citizen registry code' },
    { name: 'nombre', label: 'First Name', placeholder: 'e.g., Juan' },
    { name: 'apellidoPaterno', label: 'Paternal Surname', placeholder: 'e.g., García', hint: 'Father\'s last name' },
    { name: 'apellidoMaterno', label: 'Maternal Surname', placeholder: 'e.g., López', hint: 'Mother\'s last name' },
    { name: 'fechaNacimiento', label: 'Birth Date', placeholder: 'YYYY-MM-DD', hint: 'Date of birth (ISO format)' },
    { name: 'entidadNacimiento', label: 'Birth State/Entity', placeholder: 'e.g., CDMX', hint: 'State or entity where person was born' }
  ],
  blacklist: [
    { name: 'nombre', label: 'First Name', placeholder: 'e.g., John' },
    { name: 'apellidoPaterno', label: 'Paternal Surname', placeholder: 'e.g., Doe', hint: 'Father\'s last name' },
    { name: 'apellidoMaterno', label: 'Maternal Surname', placeholder: 'e.g., Smith', hint: 'Mother\'s last name' },
    { name: 'fechaNacimiento', label: 'Birth Date', placeholder: 'YYYY-MM-DD', hint: 'Date of birth (ISO format)' },
    { name: 'pais', label: 'Country', placeholder: 'e.g., MX, US, UK', hint: 'ISO country code (2 letters)' }
  ],
  enrichmentByPhone: [
    { name: 'phone', label: 'Phone Number', placeholder: 'e.g., +525512345678', hint: 'Phone number with country code' }
  ],
  enrichmentByEmail: [
    { name: 'email', label: 'Email Address', placeholder: 'e.g., example@domain.com', hint: 'Valid email address' }
  ],
  enrichmentByName: [
    { name: 'nombre', label: 'First Name', placeholder: 'e.g., Juan' },
    { name: 'apellidoPaterno', label: 'Paternal Surname', placeholder: 'e.g., García', hint: 'Father\'s last name' },
    { name: 'apellidoMaterno', label: 'Maternal Surname', placeholder: 'e.g., López', hint: 'Mother\'s last name (optional)' }
  ],
  profilingPhone: [
    { name: 'phone', label: 'Phone Number', placeholder: 'e.g., +525512345678', hint: 'Phone number with country code' }
  ],
  profilingEmail: [
    { name: 'email', label: 'Email Address', placeholder: 'e.g., example@domain.com', hint: 'Valid email address' }
  ],
  renapo: [
    { name: 'curp', label: 'CURP (Citizen ID)', placeholder: 'e.g., XEXX010101HNEXXXA4', hint: 'Mexican unique citizen registry code to validate' }
  ]
};

function InputPanel({ selectedApi, onApiChange, onSubmit, loading }) {
  const [formData, setFormData] = useState({});

  // Reset form when API changes
  useEffect(() => {
    setFormData({});
  }, [selectedApi]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty fields
    const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value.trim();
      }
      return acc;
    }, {});

    if (Object.keys(cleanData).length === 0) {
      alert('Please fill in at least one field');
      return;
    }

    onSubmit(cleanData);
  };

  const currentFields = API_FIELDS[selectedApi];

  return (
    <div className="input-panel">
      <h2 className="section-title">API Configuration</h2>

      <div className="form-group">
        <label htmlFor="api-select">Select API Endpoint</label>
        <select
          id="api-select"
          value={selectedApi}
          onChange={(e) => onApiChange(e.target.value)}
          disabled={loading}
        >
          <option value="enrichment">General Data Enrichment</option>
          <option value="blacklist">International Blacklists</option>
          <option value="enrichmentByPhone">Data Enrichment by Phone</option>
          <option value="enrichmentByEmail">Data Enrichment by Email</option>
          <option value="enrichmentByName">Data Enrichment by Name</option>
          <option value="profilingPhone">Contact Profiling - Phone</option>
          <option value="profilingEmail">Contact Profiling - Email</option>
          <option value="renapo">RENAPO - CURP Validation</option>
        </select>
      </div>

      <div className="api-indicator">
        <strong>
          {selectedApi === 'enrichment' && '🔍 General Data Enrichment API'}
          {selectedApi === 'blacklist' && '⚠️ International Blacklists API'}
          {selectedApi === 'enrichmentByPhone' && '📱 Data Enrichment by Phone'}
          {selectedApi === 'enrichmentByEmail' && '📧 Data Enrichment by Email'}
          {selectedApi === 'enrichmentByName' && '👤 Data Enrichment by Name'}
          {selectedApi === 'profilingPhone' && '📊 Contact Profiling - Phone'}
          {selectedApi === 'profilingEmail' && '📊 Contact Profiling - Email'}
          {selectedApi === 'renapo' && '🇲🇽 RENAPO - CURP Validation'}
        </strong>
      </div>

      <form onSubmit={handleSubmit}>
        <h3 className="section-title" style={{ fontSize: '14px', marginTop: '25px' }}>
          Search Parameters
        </h3>

        {currentFields.map(field => (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              type="text"
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              disabled={loading}
            />
            {field.hint && <small>{field.hint}</small>}
          </div>
        ))}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Querying API...' : 'Submit Query'}
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '11px', color: '#7f8c8d', borderTop: '1px solid #34495e', paddingTop: '15px' }}>
        <strong>Note:</strong> Fill in at least one parameter. More parameters improve accuracy.
      </div>
    </div>
  );
}

export default InputPanel;
