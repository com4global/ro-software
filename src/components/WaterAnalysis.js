import React from 'react';

const WaterAnalysis = ({ waterData, setWaterData }) => {
  
  // Presets based on typical Nitto/Hydranautics water categories
  const waterPresets = {
    "Brackish Well": { ca: 80, mg: 30, na: 150, k: 5, ba: 0.05, sr: 0.1, cl: 200, so4: 120, hco3: 180, no3: 2, sio2: 15, ph: 7.2, temp: 25 },
    "Sea Water": { ca: 410, mg: 1300, na: 10500, k: 390, ba: 0.02, sr: 8, cl: 19000, so4: 2700, hco3: 140, no3: 0, sio2: 2, ph: 8.1, temp: 25 },
    "Municipal Waste": { ca: 60, mg: 20, na: 250, k: 15, ba: 0.01, sr: 0.05, cl: 300, so4: 100, hco3: 250, no3: 25, sio2: 20, ph: 7.5, temp: 25 }
  };

  const handlePresetChange = (e) => {
    const preset = waterPresets[e.target.value];
    if (preset) {
      const tds = calculateTDS(preset);
      setWaterData({ ...preset, waterType: e.target.value, tds });
    }
  };

  const calculateTDS = (data) => {
    const ions = ['ca', 'mg', 'na', 'k', 'ba', 'sr', 'cl', 'so4', 'hco3', 'no3', 'sio2'];
    return parseFloat(ions.reduce((sum, ion) => sum + (data[ion] || 0), 0).toFixed(2));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newVal = parseFloat(value) || 0;
    const updatedData = { ...waterData, [name]: newVal };
    updatedData.tds = calculateTDS(updatedData);
    setWaterData(updatedData);
  };

  // Logic for LSI (Langelier Saturation Index) calculation
  const calculateLSI = () => {
    const { ca, hco3, tds, temp, ph } = waterData;
    if (!ca || !hco3) return "0.00";
    
    // Simplified LSI Constants
    const A = (Math.log10(tds) - 1) / 10;
    const B = -13.12 * Math.log10(temp + 273.15) + 34.55;
    const C = Math.log10(ca) - 0.4;
    const D = Math.log10(hco3);
    const pHs = (9.3 + A + B) - (C + D);
    return (ph - pHs).toFixed(2);
  };

  const sectionStyle = { border: '1px solid #005fa3', backgroundColor: '#e1f5fe', marginBottom: '10px' };
  const headerStyle = { backgroundColor: '#005fa3', color: 'white', padding: '4px 10px', fontSize: '0.85rem', fontWeight: 'bold' };
  const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '3px 10px', fontSize: '0.8rem' };
  const inputStyle = { width: '60px', textAlign: 'right', border: '1px solid #999', fontSize: '0.8rem' };

  return (
    <div style={{ padding: '15px', backgroundColor: '#f0f8ff', fontFamily: 'Segoe UI, Arial' }}>
      
      {/* Meta Header */}
      <div style={{ display: 'flex', gap: '20px', backgroundColor: '#004a80', color: 'white', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
        <div>Water Type: 
          <select onChange={handlePresetChange} value={waterData.waterType} style={{ marginLeft: '5px' }}>
            <option value="Brackish Well">Brackish Well Non-Fouling</option>
            <option value="Sea Water">Sea Water</option>
            <option value="Municipal Waste">Municipal Waste (Treated)</option>
          </select>
        </div>
        <div>Temp: <input name="temp" type="number" value={waterData.temp} onChange={handleChange} style={{ width: '40px' }} /> °C</div>
        <div>pH: <input name="ph" type="number" value={waterData.ph} onChange={handleChange} style={{ width: '40px' }} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* CATIONS */}
        <div style={sectionStyle}>
          <div style={headerStyle}>Cations (mg/L)</div>
          {['ca', 'mg', 'na', 'k', 'ba', 'sr'].map(ion => (
            <div key={ion} style={rowStyle}>
              <span>{ion.toUpperCase()}</span>
              <input name={ion} type="number" value={waterData[ion] || 0} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
        </div>

        {/* ANIONS */}
        <div style={sectionStyle}>
          <div style={headerStyle}>Anions (mg/L)</div>
          {['hco3', 'so4', 'cl', 'no3', 'sio2'].map(ion => (
            <div key={ion} style={rowStyle}>
              <span>{ion === 'sio2' ? 'Silica (SiO2)' : ion.toUpperCase()}</span>
              <input name={ion} type="number" value={waterData[ion] || 0} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER SUMMARY (Saturations) */}
      <div style={{ marginTop: '10px', display: 'flex', gap: '20px' }}>
        <div style={{ ...sectionStyle, width: '250px' }}>
          <div style={headerStyle}>Saturations & Summary</div>
          <div style={rowStyle}><span>Calculated TDS</span> <strong>{waterData.tds} mg/L</strong></div>
          <div style={rowStyle}><span>LSI (Scaling Index)</span> <strong style={{color: calculateLSI() > 0 ? 'red' : 'green'}}>{calculateLSI()}</strong></div>
          <div style={rowStyle}><span>Osmotic Pressure</span> <strong>{(waterData.tds * 0.00076).toFixed(2)} bar</strong></div>
        </div>
      </div>
    </div>
  );
};

export default WaterAnalysis;