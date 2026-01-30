import React from 'react';

const SystemDesign = ({ membranes, systemConfig, setSystemConfig, projection, snapshots }) => {
  
  const handleInputChange = (key, value) => {
    setSystemConfig({ ...systemConfig, [key]: value });
  };

  // --- RECOVERY VALIDATION LOGIC ---
  // If LSI is positive and recovery > 75%, or if recovery > 90% regardless of LSI
  const recoveryValue = Number(systemConfig.recovery);
  const lsiValue = parseFloat(projection.postTreatmentLsi || 0);
  
  const isRecoveryRisky = (recoveryValue > 85) || (lsiValue > 0.2 && recoveryValue > 75);

  const cardStyle = { background: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #c2d1df', marginBottom: '20px' };
  const labelStyle = { display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '5px' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      
      {/* LEFT COLUMN: INPUTS */}
      <div>
        <div style={cardStyle}>
          <div style={{ background: '#004a80', color: 'white', padding: '8px', margin: '-15px -15px 15px -15px', fontWeight: 'bold' }}>Configuration</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Feed Flow (m³/h)</label>
              <input type="number" value={systemConfig.feedFlow} onChange={(e) => handleInputChange('feedFlow', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>System Recovery (%)</label>
              <input 
                type="number" 
                value={systemConfig.recovery} 
                onChange={(e) => handleInputChange('recovery', e.target.value)} 
                style={{ ...inputStyle, border: isRecoveryRisky ? '2px solid #d9534f' : '1px solid #ccc' }} 
              />
            </div>
            <div>
              <label style={labelStyle}>Stage 1 Vessels</label>
              <input type="number" value={systemConfig.stage1Vessels} onChange={(e) => handleInputChange('stage1Vessels', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stage 2 Vessels</label>
              <input type="number" value={systemConfig.stage2Vessels} onChange={(e) => handleInputChange('stage2Vessels', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Membrane Model</label>
              <select value={systemConfig.membraneModel} onChange={(e) => handleInputChange('membraneModel', e.target.value)} style={inputStyle}>
                {membranes.map(m => <option key={m.id} value={m.id}>{m.name} ({m.area} sq.ft)</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* RECOVERY WARNING ALERT */}
        {isRecoveryRisky && (
          <div style={{ background: '#fcf8e3', border: '1px solid #faebcc', color: '#8a6d3b', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <strong>⚠️ Scaling Risk Detected</strong>
            <p style={{ margin: '5px 0 0', fontSize: '0.85rem' }}>
              Current recovery of {recoveryValue}% exceeds the safe limit for your water chemistry (LSI: {lsiValue}). 
              Consider adding antiscalant or reducing recovery to prevent membrane fouling.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: RESULTS */}
      <div>
        <div style={{ ...cardStyle, borderLeft: '5px solid #f39c12' }}>
          <div style={{ background: '#004a80', color: 'white', padding: '8px', margin: '-15px -15px 15px -15px', fontWeight: 'bold' }}>Live Projection</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f9f9f9' }}>
              <span style={labelStyle}>Average Flux</span>
              <strong style={{ fontSize: '1.2rem', color: Number(projection.fluxGFD) > 18 ? '#d9534f' : '#2c3e50' }}>
                {projection.fluxGFD} GFD
              </strong>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f9f9f9' }}>
              <span style={labelStyle}>Pump Pressure</span>
              <strong style={{ fontSize: '1.2rem' }}>{projection.pumpPressure} bar</strong>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f9f9f9' }}>
              <span style={labelStyle}>Energy Cost</span>
              <strong style={{ fontSize: '1.2rem' }}>${projection.monthlyEnergyCost} /mo</strong>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f9f9f9' }}>
              <span style={labelStyle}>Permeate Flow</span>
              <strong style={{ fontSize: '1.2rem' }}>{(systemConfig.feedFlow * (systemConfig.recovery/100)).toFixed(2)} m³/h</strong>
            </div>
          </div>
        </div>

        {/* SNAPSHOT LIST */}
        <div style={cardStyle}>
          <div style={{ background: '#004a80', color: 'white', padding: '8px', margin: '-15px -15px 10px -15px', fontWeight: 'bold' }}>Design Snapshots</div>
          {snapshots.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.85rem' }}>No snapshots saved yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {snapshots.map((s, i) => (
                <li key={i} style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📸 {s.name || `Design ${i+1}`}</span>
                  <strong>{s.config.recovery}% Recovery</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemDesign;