import React from 'react';

const SystemDesign = ({ membranes, systemConfig, setSystemConfig, projection }) => {
  
  const handleInputChange = (key, value) => {
    setSystemConfig({ ...systemConfig, [key]: value });
  };

  const panelStyle = { 
    background: '#c2d1df', 
    padding: '15px', 
    borderRadius: '4px', 
    border: '1px solid #8ba4bb',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
  };

  const headerStyle = { 
    background: '#004a80', 
    color: 'white', 
    padding: '5px 10px', 
    fontWeight: 'bold', 
    fontSize: '0.85rem',
    marginBottom: '15px',
    borderRadius: '2px'
  };

  const rowStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '8px',
    fontSize: '0.85rem'
  };

  const inputStyle = { width: '90px', padding: '3px', textAlign: 'right', border: '1px solid #999' };
  const readOnlyStyle = { ...inputStyle, background: '#e9ecef', color: '#495057' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* INPUT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: '15px' }}>
        
        {/* PANEL: TRAIN INFORMATION */}
        <div style={panelStyle}>
          <div style={headerStyle}>Train Information (Pass 1)</div>
          <div style={rowStyle}>
            <span>Feed pH</span>
            <input style={inputStyle} type="number" value={systemConfig.feedPh} onChange={(e) => handleInputChange('feedPh', e.target.value)} />
          </div>
          <div style={rowStyle}>
            <span>Permeate recovery %</span>
            <input style={inputStyle} type="number" value={systemConfig.recovery} onChange={(e) => handleInputChange('recovery', e.target.value)} />
          </div>
          <div style={rowStyle}>
            <span>Permeate flow</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select style={{fontSize: '0.75rem'}} value={systemConfig.flowUnit} onChange={(e) => handleInputChange('flowUnit', e.target.value)}>
                <option value="gpm">gpm</option>
                <option value="m3/h">m3/h</option>
                <option value="gpd">gpd</option>
              </select>
              <input style={inputStyle} type="number" value={systemConfig.permeateFlow} onChange={(e) => handleInputChange('permeateFlow', e.target.value)} />
            </div>
          </div>
          <div style={rowStyle}>
            <span>Average flux (gfd)</span>
            <input style={readOnlyStyle} value={projection.fluxGfd} readOnly />
          </div>
          <div style={rowStyle}>
            <span>Feed flow</span>
            <input style={readOnlyStyle} value={projection.feedFlow} readOnly />
          </div>
          <div style={rowStyle}>
            <span>Concentrate flow</span>
            <input style={readOnlyStyle} value={projection.concentrateFlow} readOnly />
          </div>
        </div>

        {/* PANEL: CHEMICALS & AGEING */}
        <div style={panelStyle}>
          <div style={headerStyle}>Chemicals & Ageing</div>
          <div style={rowStyle}>
            <span>Chemical Dose</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select style={{fontSize: '0.75rem'}} value={systemConfig.doseUnit} onChange={(e) => handleInputChange('doseUnit', e.target.value)}>
                <option value="mg/l">mg/l</option>
                <option value="lb/hr">lb/hr</option>
                <option value="kg/hr">kg/hr</option>
              </select>
              <input style={inputStyle} type="number" value={systemConfig.chemicalDose} onChange={(e) => handleInputChange('chemicalDose', e.target.value)} />
            </div>
          </div>
          <div style={rowStyle}>
            <span>Membrane age (years)</span>
            <input style={inputStyle} type="number" value={systemConfig.membraneAge} onChange={(e) => handleInputChange('membraneAge', e.target.value)} />
          </div>
          <div style={rowStyle}>
            <span>Flux decline %, per year</span>
            <input style={inputStyle} type="number" value={systemConfig.fluxDeclinePerYear} onChange={(e) => handleInputChange('fluxDeclinePerYear', e.target.value)} />
          </div>
          <div style={rowStyle}>
            <span>Fouling factor</span>
            <input style={inputStyle} type="number" value={systemConfig.foulingFactor} onChange={(e) => handleInputChange('foulingFactor', e.target.value)} />
          </div>
        </div>

        {/* PANEL: SYSTEM */}
        <div style={panelStyle}>
          <div style={headerStyle}>System</div>
          <div style={rowStyle}>
            <span>Total plant flow ({systemConfig.flowUnit})</span>
            <input style={readOnlyStyle} value={projection.totalPlantFlow} readOnly />
          </div>
          <div style={rowStyle}>
            <span>Number of trains</span>
            <input style={inputStyle} type="number" value={systemConfig.numTrains} onChange={(e) => handleInputChange('numTrains', e.target.value)} />
          </div>
        </div>
      </div>

      {/* PANEL: SYSTEM SPECIFICATIONS */}
      <div style={{ ...panelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={headerStyle}>System Specifications</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={rowStyle}>
                <span>Membrane type</span>
                <select style={{ width: '130px' }} value={systemConfig.membraneModel} onChange={(e) => handleInputChange('membraneModel', e.target.value)}>
                  {membranes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={rowStyle}>
                <span>Membranes/vessel</span>
                <input style={inputStyle} type="number" value={systemConfig.elementsPerVessel} onChange={(e) => handleInputChange('elementsPerVessel', e.target.value)} />
              </div>
              <div style={rowStyle}>
                <span>No. of vessels</span>
                <input style={inputStyle} type="number" value={systemConfig.stage1Vessels} onChange={(e) => handleInputChange('stage1Vessels', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px' }}>
          <button style={{ background: '#0066cc', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Recalculate array
          </button>
        </div>
      </div>

    </div>
  );
};

export default SystemDesign;