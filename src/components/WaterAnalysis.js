import React from 'react';

const WaterAnalysis = ({ waterData, setWaterData }) => {
  // Conversion factors for meq/L
  const eqWeights = { ca: 20.04, mg: 12.16, na: 22.99, k: 39.1, cl: 35.45, so4: 48.03, hco3: 61.02, si: 60.08 };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newVal = parseFloat(value) || 0;
    const updatedData = { ...waterData, [name]: newVal };

    // Calculate TDS (Sum of all ions)
    const tds = updatedData.ca + updatedData.mg + updatedData.na + updatedData.k + 
                updatedData.cl + updatedData.so4 + updatedData.hco3 + updatedData.si;

    setWaterData({ ...updatedData, tds: parseFloat(tds.toFixed(2)) });
  };

  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' };
  const labelStyle = { display: 'inline-block', width: '120px', fontWeight: '500' };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Step 1: Water Chemistry Input</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
        {/* Cations Column */}
        <div>
          <h4 style={{ color: '#2980b9' }}>Cations (mg/L)</h4>
          {['ca', 'mg', 'na', 'k'].map(ion => (
            <div key={ion} style={{ marginBottom: '10px' }}>
              <span style={labelStyle}>{ion.toUpperCase()}:</span>
              <input name={ion} type="number" value={waterData[ion]} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
        </div>

        {/* Anions Column */}
        <div>
          <h4 style={{ color: '#c0392b' }}>Anions & Others (mg/L)</h4>
          {['cl', 'so4', 'hco3', 'si'].map(ion => (
            <div key={ion} style={{ marginBottom: '10px' }}>
              <span style={labelStyle}>{ion.toUpperCase()}:</span>
              <input name={ion} type="number" value={waterData[ion]} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>Total Dissolved Solids (TDS): <span style={{ color: '#27ae60' }}>{waterData.tds} mg/L</span></h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Temperature: {waterData.temp}°C | pH: {waterData.ph}</p>
      </div>
    </div>
  );
};

export default WaterAnalysis;