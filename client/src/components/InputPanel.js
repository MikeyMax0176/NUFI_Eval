import React, { useState } from 'react';

function InputPanel({ onSubmit, loading }) {
  const [phoneData, setPhoneData] = useState({ phone: '' });
  const [emailData, setEmailData] = useState({ email: '' });
  const [nameData, setNameData] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '' });
  const [curpData, setCurpData] = useState({
    tipo_busqueda: 'datos',
    clave_entidad: '',
    dia_nacimiento: '',
    mes_nacimiento: '',
    anio_nacimiento: '',
    nombres: '',
    primer_apellido: '',
    segundo_apellido: '',
    sexo: ''
  });
  
  // Collapse states
  const [phoneExpanded, setPhoneExpanded] = useState(true);
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [nameExpanded, setNameExpanded] = useState(false);
  const [curpExpanded, setCurpExpanded] = useState(false);

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

    const requiredFields = [
      'clave_entidad',
      'dia_nacimiento',
      'mes_nacimiento',
      'anio_nacimiento',
      'nombres',
      'primer_apellido',
      'sexo'
    ];

    const missingFields = requiredFields.filter((field) => !curpData[field].trim());
    if (missingFields.length > 0) {
      alert('Please fill all required fields for CURP name search');
      return;
    }

    const cleanData = {
      tipo_busqueda: 'datos',
      clave_entidad: curpData.clave_entidad.trim(),
      dia_nacimiento: curpData.dia_nacimiento.trim(),
      mes_nacimiento: curpData.mes_nacimiento.trim(),
      anio_nacimiento: curpData.anio_nacimiento.trim(),
      nombres: curpData.nombres.trim(),
      primer_apellido: curpData.primer_apellido.trim(),
      ...(curpData.segundo_apellido.trim() && { segundo_apellido: curpData.segundo_apellido.trim() }),
      sexo: curpData.sexo.trim()
    };

    onSubmit(cleanData, 'renapo');
  };

  return (
    <div className="input-panel">
      <h2 className="section-title">Search Options</h2>

      {/* Phone Search Section */}
      <div className="search-section">
        <div className="search-header" onClick={() => setPhoneExpanded(!phoneExpanded)}>
          <span className="search-icon">📱</span>
          <h3>Phone</h3>
          <span className="collapse-arrow">{phoneExpanded ? '▼' : '▶'}</span>
        </div>
        {phoneExpanded && (
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
        )}
      </div>

      {/* Email Search Section */}
      <div className="search-section">
        <div className="search-header" onClick={() => setEmailExpanded(!emailExpanded)}>
          <span className="search-icon">📧</span>
          <h3>Email</h3>
          <span className="collapse-arrow">{emailExpanded ? '▼' : '▶'}</span>
        </div>
        {emailExpanded && (
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
        )}
      </div>

      {/* Name Search Section */}
      <div className="search-section">
        <div className="search-header" onClick={() => setNameExpanded(!nameExpanded)}>
          <span className="search-icon">👤</span>
          <h3>Name</h3>
          <span className="collapse-arrow">{nameExpanded ? '▼' : '▶'}</span>
        </div>
        {nameExpanded && (
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
        )}
      </div>

      {/* CURP Name Search Section */}
      <div className="search-section">
        <div className="search-header" onClick={() => setCurpExpanded(!curpExpanded)} style={{ cursor: 'pointer' }}>
          <span className="search-icon">🇲🇽</span>
          <h3>CURP Name Search</h3>
          <span className="collapse-arrow">{curpExpanded ? '▼' : '▶'}</span>
        </div>
        {curpExpanded && (
        <form onSubmit={handleCurpSubmit}>
          <div className="form-group">
            <label htmlFor="curp-nombres">First Name(s)</label>
            <input
              id="curp-nombres"
              type="text"
              placeholder="e.g., ALBERTO"
              value={curpData.nombres}
              onChange={(e) => setCurpData({ ...curpData, nombres: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="curp-primer-apellido">Paternal Surname</label>
            <input
              id="curp-primer-apellido"
              type="text"
              placeholder="e.g., AGUILERA"
              value={curpData.primer_apellido}
              onChange={(e) => setCurpData({ ...curpData, primer_apellido: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="curp-segundo-apellido">Maternal Surname (Optional)</label>
            <input
              id="curp-segundo-apellido"
              type="text"
              placeholder="e.g., VALADEZ"
              value={curpData.segundo_apellido}
              onChange={(e) => setCurpData({ ...curpData, segundo_apellido: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="curp-dia">Day of Birth</label>
              <input
                id="curp-dia"
                type="text"
                placeholder="e.g., 07"
                value={curpData.dia_nacimiento}
                onChange={(e) => setCurpData({ ...curpData, dia_nacimiento: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="curp-mes">Month of Birth</label>
              <input
                id="curp-mes"
                type="text"
                placeholder="e.g., 01"
                value={curpData.mes_nacimiento}
                onChange={(e) => setCurpData({ ...curpData, mes_nacimiento: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="curp-anio">Year of Birth</label>
              <input
                id="curp-anio"
                type="text"
                placeholder="e.g., 1950"
                value={curpData.anio_nacimiento}
                onChange={(e) => setCurpData({ ...curpData, anio_nacimiento: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="curp-clave-entidad">State Code</label>
            <input
              id="curp-clave-entidad"
              type="text"
              placeholder="e.g., MN"
              value={curpData.clave_entidad}
              onChange={(e) => setCurpData({ ...curpData, clave_entidad: e.target.value })}
              disabled={loading}
            />
            <small>Two-letter state code (clave_entidad)</small>
          </div>
          <div className="form-group">
            <label htmlFor="curp-sexo">Sex</label>
            <select
              id="curp-sexo"
              value={curpData.sexo}
              onChange={(e) => setCurpData({ ...curpData, sexo: e.target.value })}
              disabled={loading}
            >
              <option value="">Select</option>
              <option value="H">H</option>
              <option value="M">M</option>
            </select>
            <small>H for male, M for female</small>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search CURP'}
          </button>
        </form>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '11px', color: '#7f8c8d', borderTop: '1px solid #34495e', paddingTop: '15px' }}>
        <strong>Note:</strong> Each search type queries a different API endpoint. Results will appear on the right.
      </div>
    </div>
  );
}

export default InputPanel;
