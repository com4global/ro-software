import React from 'react';

const PreTreatment = ({ waterData, pretreatment, setPretreatment, projection }) => {
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const inputStyle = { width: '100px', padding: '5px', marginLeft: '10px' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50' }}>Chemical Pre-Treatment</h2>

      <div style={cardStyle}>
        <h3 style={{ color: '#005fa3', marginTop: 0 }}>Scale & Fouling Inhibition</h3>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>Antiscalants are injected to prevent $CaCO_3$ and $CaSO_4$ scaling on the membrane surface.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label>Antiscalant Dosage (mg/L):</label>
          <div>
            <input type="number" value={pretreatment.antiscalantDose} 
              onChange={(e) => setPretreatment({...pretreatment, antiscalantDose: parseFloat(e.target.value) || 0})} 
              style={inputStyle} />
            <span style={{ marginLeft: '20px', fontWeight: 'bold', color: '#27ae60' }}>{projection.antiscalantKgDay} kg/day</span>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: '#e67e22', marginTop: 0 }}>Dechlorination (SBS)</h3>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>Polyamide membranes are destroyed by chlorine. Sodium Bisulfite (SBS) is used to neutralize it.</p>
        <div style={{ marginBottom: '10px' }}>
          <label>Free Chlorine in Feed (mg/L):</label>
          <input type="number" value={pretreatment.chlorineInlet} 
            onChange={(e) => setPretreatment({...pretreatment, chlorineInlet: parseFloat(e.target.value) || 0})} 
            style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label>SBS Target Dosage (mg/L):</label>
          <div>
            <input type="number" value={pretreatment.sbsDose} 
              onChange={(e) => setPretreatment({...pretreatment, sbsDose: parseFloat(e.target.value) || 0})} 
              style={inputStyle} />
            <span style={{ marginLeft: '20px', fontWeight: 'bold', color: '#e67e22' }}>{projection.sbsKgDay} kg/day</span>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, background: '#fdf2f2', borderLeft: '5px solid #e74c3c' }}>
        <strong>Engineering Alert:</strong> 
        {pretreatment.chlorineInlet > 0 && pretreatment.sbsDose < (pretreatment.chlorineInlet * 1.5) ? 
          <span style={{ color: '#c0392b' }}> ⚠️ Warning: SBS dose might be too low to fully neutralize Chlorine! Recommended 3:1 ratio.</span> : 
          <span style={{ color: '#27ae60' }}> ✓ Chlorine neutralization is adequate.</span>
        }
      </div>
    </div>
  );
};

export default PreTreatment;