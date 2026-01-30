import React from 'react';

const WaterAnalysis = ({ waterData, setWaterData }) => {
  
  const waterPresets = {
    "Municipal Waste (Treated)": {
      ca: 60, mg: 20, na: 250, k: 15, ba: 0.01, sr: 0.05,
      hco3: 250, so4: 100, cl: 300, no3: 25, sio2: 20, ph: 7.5, temp: 25
    },
    "Brackish Well": {
      ca: 150, mg: 50, na: 300, k: 5, ba: 0.1, sr: 1.5,
      hco3: 200, so4: 400, cl: 500, no3: 2, sio2: 15, ph: 7.2, temp: 20
    },
    "Brackish Surface": {
      ca: 80, mg: 30, na: 180, k: 5, ba: 0.05, sr: 0.1,
      hco3: 150, so4: 120, cl: 220, no3: 10, sio2: 12, ph: 7.8, temp: 25
    },
    "Sea Water (Surface)": {
      ca: 410, mg: 1290, na: 10800, k: 390, ba: 0.02, sr: 8.0,
      hco3: 140, so4: 2700, cl: 19400, no3: 0.5, sio2: 1, ph: 8.2, temp: 25
    },
    "Sea Water (Well)": {
      ca: 400, mg: 1250, na: 10500, k: 380, ba: 0.05, sr: 7.0,
      hco3: 160, so4: 2600, cl: 19000, no3: 0.1, sio2: 5, ph: 7.9, temp: 22
    }
  };

  // Equivalent weights for meq/L calculation
  const eqWeights = {
    ca: 20.04, mg: 12.15, na: 22.99, k: 39.1, ba: 68.67, sr: 43.81,
    hco3: 61.02, so4: 48.03, cl: 35.45, no3: 62.0
  };

  // --- CALCULATION LOGIC ---
  const catMeq = (waterData.ca / eqWeights.ca) + (waterData.mg / eqWeights.mg) + (waterData.na / eqWeights.na) + (waterData.k / eqWeights.k) + (waterData.ba / eqWeights.ba) + (waterData.sr / eqWeights.sr);
  const aniMeq = (waterData.hco3 / eqWeights.hco3) + (waterData.so4 / eqWeights.so4) + (waterData.cl / eqWeights.cl) + (waterData.no3 / eqWeights.no3);
  
  const balanceError = Math.abs(((catMeq - aniMeq) / (catMeq + aniMeq)) * 100).toFixed(2);
  const isHighError = balanceError > 5;

  const balanceIons = () => {
    const diff = catMeq - aniMeq;
    if (diff > 0) {
      const newCl = (Number(waterData.cl) + (diff * eqWeights.cl)).toFixed(2);
      setWaterData({ ...waterData, cl: newCl });
    } else {
      const newNa = (Number(waterData.na) + (Math.abs(diff) * eqWeights.na)).toFixed(2);
      setWaterData({ ...waterData, na: newNa });
    }
  };

  const handleTypeChange = (e) => {
    const preset = waterPresets[e.target.value];
    if (preset) setWaterData({ ...waterData, waterType: e.target.value, ...preset });
  };

  const handleInputChange = (key, value) => setWaterData({ ...waterData, [key]: value });

  const calculatedTds = (
    Number(waterData.ca) + Number(waterData.mg) + Number(waterData.na) + Number(waterData.k) +
    Number(waterData.ba) + Number(waterData.sr) + Number(waterData.hco3) + Number(waterData.so4) +
    Number(waterData.cl) + Number(waterData.no3) + Number(waterData.sio2)
  ).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER AD LINK */}
      <div style={{ background: '#f39c12', color: 'white', textAlign: 'center', padding: '5px', fontSize: '0.85rem', fontWeight: 'bold', margin: '-20px -20px 0 -20px' }}>
        🚀 Visit <a href="https://Zenzeecom.com" target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Zenzeecom</a> for more insights!
      </div>

      {/* TOP CONFIG BAR */}
      <div style={{ backgroundColor: '#004a80', padding: '15px', borderRadius: '4px', display: 'flex', gap: '20px', alignItems: 'center', color: 'white' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', display: 'block' }}>Project Name</label>
          <input type="text" value={waterData.projectName} onChange={(e) => handleInputChange('projectName', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '100%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', display: 'block' }}>Water Type</label>
          <select value={waterData.waterType} onChange={handleTypeChange} style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '100%' }}>
            {Object.keys(waterPresets).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', display: 'block' }}>Temp °C</label>
          <input type="number" value={waterData.temp} onChange={(e) => handleInputChange('temp', e.target.value)} style={{ width: '60px', padding: '6px', border: 'none', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', display: 'block' }}>pH</label>
          <input type="number" step="0.1" value={waterData.ph} onChange={(e) => handleInputChange('ph', e.target.value)} style={{ width: '60px', padding: '6px', border: 'none', borderRadius: '4px' }} />
        </div>
      </div>

      {/* ION TABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #c2d1df' }}>
          <div style={{ background: '#004a80', color: 'white', padding: '8px', margin: '-15px -15px 15px -15px' }}>Cations (mg/L)</div>
          <table style={{ width: '100%' }}>
            <tbody>
              {[['Ca', 'ca'], ['Mg', 'mg'], ['Na', 'na'], ['K', 'k'], ['Ba', 'ba'], ['Sr', 'sr']].map(([l, k]) => (
                <tr key={k}><td>{l}</td><td align="right"><input type="number" value={waterData[k]} onChange={(e) => handleInputChange(k, e.target.value)} style={{ width: '80px', textAlign: 'right' }} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #c2d1df' }}>
          <div style={{ background: '#004a80', color: 'white', padding: '8px', margin: '-15px -15px 15px -15px' }}>Anions (mg/L)</div>
          <table style={{ width: '100%' }}>
            <tbody>
              {[['HCO3', 'hco3'], ['SO4', 'so4'], ['Cl', 'cl'], ['NO3', 'no3'], ['SiO2', 'sio2']].map(([l, k]) => (
                <tr key={k}><td>{l}</td><td align="right"><input type="number" value={waterData[k]} onChange={(e) => handleInputChange(k, e.target.value)} style={{ width: '80px', textAlign: 'right' }} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BALANCE AND WARNING SECTION */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ background: 'white', padding: '15px', border: '1px solid #c2d1df', minWidth: '280px' }}>
          <div style={{ background: '#004a80', color: 'white', padding: '8px', margin: '-15px -15px 10px -15px' }}>Saturations & Summary</div>
          <p>TDS: <strong>{calculatedTds} mg/L</strong></p>
          <p>Balance Error: <strong style={{ color: isHighError ? '#d9534f' : '#5cb85c' }}>{balanceError}%</strong></p>
          <p>LSI: <strong style={{ color: (waterData.ph - 7.8) > 0 ? '#d9534f' : '#5cb85c' }}>{(waterData.ph - 7.81).toFixed(2)}</strong></p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={balanceIons} 
            style={{ background: '#f39c12', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            ⚖️ Balance Ions (Auto-Adjust Na/Cl)
          </button>

          {isHighError && (
            <div style={{ background: '#f2dede', border: '1px solid #ebccd1', color: '#a94442', padding: '12px', borderRadius: '4px', fontSize: '0.9rem' }}>
              <strong>⚠️ Warning:</strong> Ion balance error is high ({balanceError}%). Please check your lab report or click the balance button above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterAnalysis;