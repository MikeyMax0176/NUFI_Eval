import React, { useState } from 'react';

function InputPanel({ onSubmit, loading }) {
  const [phoneData, setPhoneData] = useState({ phone: '' });
  const [emailData, setEmailData] = useState({ email: '' });
  const [nameData, setNameData] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });
  const [curpData, setCurpData] = useState({ curp: '' });

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phoneData.phone.trim()) {
      alert('Please enter a phone number');
      return;
    }
    onSubmit({ phone: phoneData.phone.trim() }, 'enrichmentByPhone');
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailData.email.trim()) {
      alert('Please enter an email address');
      return;
    }
    onSubmit({ email: emailData.email.trim() }, 'enrichmentByEmail');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!nameData.nombre.trim() && !nameData.apellidoPaterno.trim()) {
      alert('Please enter at least a first name or paternal surname');
      return;
    }
    const cleanData = {
      ...(nameData.nombre.trim() && { nombre: nameData.nombre.trim() }),
      ...(nameData.apellidoPaterno.trim() && { apellidoPaterno: nameData.apellidoPaterno.trim() }),
      ...(nameData.apellidoMaterno.trim() && { apellidoMaterno: nameData.apellidoMaterno.trim() })
    };
    onSubmit(cleanData, 'enrichmentByName');
  };

  const handleCurpSubmit = (e) => {
    e.preventDefault();
    if (!curpData.curp.trim()) {
      alert('Please enter a CURP');
      return;
    }
    onSubmit({ curp: curpData.curp.trim() }, 'renapo');
  };

  return (
    <div className="input-panel">
      <h2 className="section-title">Search Options</h2>

      {/* Phone Search Section */}
      <div className="search-section">
        <div className="search-header">
          <span className="search-icon">📱</span>
          <h3>Data Enrichment by Phone</h3>
        </div>
        <form onSubmit={handlePhoneSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="text"
              placeholder="e.g., +525512345678 or 526221069217"
              value={phoneData.phone}
              onChange={(e) => setPhoneData({ phone: e.target.value })}
              disabled={loading}
            />
            <small>Phone number with country code</small>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Phone'}
          </button>
        </form>
      </div>

      {/* Email Search Section */}
      <div className="search-section">
        <div className="search-header">
          <span className="search-icon">📧</span>
          <h3>Data Enrichment by Email</h3>
        </div>
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="text"
              placeholder="e.g., example@domain.com"
              value={emailData.email}
              onChange={(e) => setEmailData({ email: e.target.value })}
              disabled={loading}
            />
            <small>Valid email address</small>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Email'}
          </button>
        </form>
      </div>

      {/* Name Search Section */}
      <div className="search-section">
        <div className="search-header">
          <span className="search-icon">👤</span>
          <h3>Data Enrichment by Name</h3>
        </div>
        <form onSubmit={handleNameSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">First Name</label>
            <input
              id="nombre"
              type="text"
              placeholder="e.g., Juan"
              value={nameData.nombre}
              onChange={(e) => setNameData({ ...nameData, nombre: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="apellidoPaterno">Paternal Surname</label>
            <input
              id="apellidoPaterno"
              type="text"
              placeholder="e.g., García"
              value={nameData.apellidoPaterno}
              onChange={(e) => setNameData({ ...nameData, apellidoPaterno: e.target.value })}
              disabled={loading}
            />
            <small>Father's last name</small>
          </div>
          <div className="form-group">
            <label htmlFor="apellidoMaterno">Maternal Surname (Optional)</label>
            <input
              id="apellidoMaterno"
              type="text"
              placeholder="e.g., López"
              value={nameData.apellidoMaterno}
              onChange={(e) => setNameData({ ...nameData, apellidoMaterno: e.target.value })}
              disabled={loading}
            />
            <small>Mother's last name</small>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Name'}
          </button>
        </form>
      </div>

      {/* CURP/RENAPO Search Section */}
      <div className="search-section">
        <div className="search-header">
          <span className="search-icon">🇲🇽</span>
          <h3>RENAPO - CURP Validation</h3>
        </div>
        <form onSubmit={handleCurpSubmit}>
          <div className="form-group">
            <label htmlFor="curp">CURP (Citizen ID)</label>
            <input
              id="curp"
              type="text"
              placeholder="e.g., XEXX010101HNEXXXA4"
              value={curpData.curp}
              onChange={(e) => setCurpData({ curp: e.target.value })}
              disabled={loading}
            />
            <small>Mexican unique citizen registry code</small>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Validate CURP'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '20px', fontSize: '11px', color: '#7f8c8d', borderTop: '1px solid #34495e', paddingTop: '15px' }}>
        <strong>Note:</strong> Each search type queries a different NUFI API endpoint. Results will appear on the right.
      </div>
    </div>
  );
}

export default InputPanel;
