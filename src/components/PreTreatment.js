import React, { useState } from 'react';

const PreTreatment = ({ waterData, pretreatment, setPretreatment, systemConfig }) => {
  const [chemicalPrices, setChemicalPrices] = useState({ antiscalant: 4.5, sbs: 2.5 });

  const handleInputChange = (key, value) => {
    setPretreatment({ ...pretreatment, [key]: value });
  };

  const handlePriceChange = (key, value) => {
    setChemicalPrices({ ...chemicalPrices, [key]: value });
  };

  // --- CALCULATIONS WITH SAFETY FALLBACKS ---
  // If systemConfig is missing, we use 0 to prevent crashes
  const feedFlow = Number(systemConfig?.feedFlow || 0); 
  
  // Safe calculation using optional chaining for pretreatment doses
  const antiscalantUsage = ((feedFlow * (pretreatment?.antiscalantDose || 0) * 24 * 30) / 1000).toFixed(2);
  const antiscalantMonthlyCost = (antiscalantUsage * (chemicalPrices?.antiscalant || 0)).toFixed(2);

  const sbsUsage = ((feedFlow * (pretreatment?.sbsDose || 0) * 24 * 30) / 1000).toFixed(2);
  const sbsMonthlyCost = (sbsUsage * (chemicalPrices?.sbs || 0)).toFixed(2);

  const totalChemCost = (Number(antiscalantMonthlyCost) + Number(sbsMonthlyCost)).toFixed(2);

  const cardStyle = { background: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #c2d1df', marginBottom: '20px' };
  const headerStyle = { background: '#004a80', color: 'white', padding: '8px', margin: '-15px -15px 15px -15px', fontWeight: 'bold' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      
      {/* DOSAGE INPUTS */}
      <div style={cardStyle}>
        <div style={headerStyle}>Chemical Dosage Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', display: 'block' }}>Antiscalant Dose (mg/L)</label>
            <input 
              type="number" 
              step="0.1" 
              value={pretreatment?.antiscalantDose || ''} 
              onChange={(e) => handleInputChange('antiscalantDose', e.target.value)} 
              style={{ width: '100%', padding: '8px' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', display: 'block' }}>SBS Dose (mg/L)</label>
            <input 
              type="number" 
              step="0.1" 
              value={pretreatment?.sbsDose || ''} 
              onChange={(e) => handleInputChange('sbsDose', e.target.value)} 
              style={{ width: '100%', padding: '8px' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', display: 'block' }}>Free Chlorine at Inlet (mg/L)</label>
            <input 
              type="number" 
              step="0.1" 
              value={pretreatment?.chlorineInlet || ''} 
              onChange={(e) => handleInputChange('chlorineInlet', e.target.value)} 
              style={{ width: '100%', padding: '8px' }} 
            />
          </div>
        </div>
      </div>

      {/* COST CALCULATOR */}
      <div style={cardStyle}>
        <div style={headerStyle}>Operational Cost Estimates (OPEX)</div>
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th>Chemical</th>
              <th>Usage (kg/mo)</th>
              <th>Price ($/kg)</th>
              <th>Total ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px 0' }}>Antiscalant</td>
              <td>{antiscalantUsage}</td>
              <td>
                <input type="number" value={chemicalPrices.antiscalant} onChange={(e) => handlePriceChange('antiscalant', e.target.value)} style={{ width: '50px' }} />
              </td>
              <td style={{ fontWeight: 'bold' }}>${antiscalantMonthlyCost}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 0' }}>SBS</td>
              <td>{sbsUsage}</td>
              <td>
                <input type="number" value={chemicalPrices.sbs} onChange={(e) => handlePriceChange('sbs', e.target.value)} style={{ width: '50px' }} />
              </td>
              <td style={{ fontWeight: 'bold' }}>${sbsMonthlyCost}</td>
            </tr>
            <tr>
              <td colSpan="3" style={{ textAlign: 'right', padding: '15px' }}><strong>Total Monthly Chemical Cost:</strong></td>
              <td style={{ fontSize: '1.1rem', color: '#27ae60', fontWeight: 'bold' }}>${totalChemCost}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TECHNICAL NOTE */}
      <div style={{ ...cardStyle, gridColumn: 'span 2', background: '#eef6fc' }}>
        <strong>💡 Pro Tip:</strong> 
        Antiscalant dosage is calculated based on the <strong>Feed Flow</strong> of {feedFlow} m³/h. 
        Higher recovery designs may require specialized antiscalants to prevent {waterData?.sio2 > 15 ? 'Silica scaling' : 'Calcium Carbonate scaling'}.
      </div>

    </div>
  );
};

export default PreTreatment;