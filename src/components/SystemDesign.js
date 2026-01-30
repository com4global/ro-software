import React, { useMemo } from 'react';

const SystemDesign = ({ membranes, systemConfig, setSystemConfig, projection, waterData }) => {

  // --- TECHNICAL CALCULATIONS (IMSDesign Logic) ---
  const calculation = useMemo(() => {
    const temp = Number(waterData?.temp || 25);
    const feedFlow = Number(systemConfig.feedFlow || 0);
    const recovery = Number(systemConfig.recovery || 0) / 100;
    const permeateFlow = feedFlow * recovery;
    
    // 1. Temperature Correction Factor (Standard RO Formula)
    // TCF adjusts for water viscosity changes based on 25°C reference
    const TCF = Math.exp(2640 * (1 / 298.15 - 1 / (temp + 273.15)));

    // 2. Osmotic Pressure Estimation (Simplified Van't Hoff)
    // TDS approx sum of ions
    const tds = Number(waterData.ca || 0) + Number(waterData.na || 0) + 
                Number(waterData.cl || 0) + Number(waterData.hco3 || 0) + 
                Number(waterData.so4 || 0);
    
    // Average TDS in the system (Feed + Concentrate / 2)
    const avgTds = tds * (1 + (1 / (1 - recovery))) / 2;
    const osmoticPressureBar = (avgTds / 1000) * 0.75; // Approx 0.75 bar per 1000 mg/L

    // 3. Pump Pressure Calculation (NDP)
    // Flux (GFD) = (Flow / Area) -> Here we estimate pressure required for target flux
    // Required Pressure = (Flux / TCF * A-Value) + Osmotic Pressure + Hydraulic Losses
    const estimatedFlux = (permeateFlow * 10.5) / 10; // Placeholder conversion
    const pumpPressure = (estimatedFlux / (TCF * 0.15)) + osmoticPressureBar + 1.5; 

    // 4. Energy (Specific Energy Consumption - SEC)
    const efficiency = 0.75;
    const powerKw = (pumpPressure * feedFlow) / (36.7 * efficiency);
    const sec = powerKw / permeateFlow; // kWh/m3

    return {
      tcf: TCF.toFixed(2),
      osmotic: osmoticPressureBar.toFixed(2),
      pressure: pumpPressure.toFixed(1),
      sec: sec.toFixed(2),
      power: powerKw.toFixed(1),
      permeate: permeateFlow.toFixed(1)
    };
  }, [systemConfig, waterData]);

  const handleInputChange = (key, value) => {
    setSystemConfig({ ...systemConfig, [key]: value });
  };

  const cardStyle = { background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #c2d1df', marginBottom: '20px' };
  const headerStyle = { background: '#004a80', color: 'white', padding: '10px', margin: '-20px -20px 20px -20px', borderRadius: '8px 8px 0 0', fontWeight: 'bold' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
      
      {/* LEFT: INPUTS */}
      <div style={cardStyle}>
        <div style={headerStyle}>Design Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>Feed Flow (m³/h)</label>
            <input style={{ width: '100%', padding: '8px' }} type="number" value={systemConfig.feedFlow} onChange={(e) => handleInputChange('feedFlow', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>Recovery (%)</label>
            <input style={{ width: '100%', padding: '8px' }} type="number" value={systemConfig.recovery} onChange={(e) => handleInputChange('recovery', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>Stage 1 Vessels</label>
            <input style={{ width: '100%', padding: '8px' }} type="number" value={systemConfig.stage1Vessels} onChange={(e) => handleInputChange('stage1Vessels', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>Stage 2 Vessels</label>
            <input style={{ width: '100%', padding: '8px' }} type="number" value={systemConfig.stage2Vessels} onChange={(e) => handleInputChange('stage2Vessels', e.target.value)} />
          </div>
        </div>
      </div>

      {/* RIGHT: REAL-TIME PERFORMANCE */}
      <div style={{ ...cardStyle, background: '#f0f4f8', border: '2px solid #004a80' }}>
        <div style={{ ...headerStyle, background: '#002f5d' }}>Projected Performance</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pump Pressure:</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#004a80' }}>{calculation.pressure} bar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Osmotic Pressure:</span>
            <span>{calculation.osmotic} bar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Temp. Correction (TCF):</span>
            <span>{calculation.tcf}</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #ccc' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60', fontWeight: 'bold' }}>
            <span>SEC (Specific Energy):</span>
            <span>{calculation.sec} kWh/m³</span>
          </div>
        </div>
      </div>

      {/* BOTTOM: FLOW MASS BALANCE DIAGRAM */}
      <div style={{ ...cardStyle, gridColumn: 'span 2', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>INLET</div>
            <div style={{ fontWeight: 'bold' }}>{systemConfig.feedFlow} m³/h</div>
            <div style={{ width: '50px', height: '2px', background: '#3498db', margin: '5px auto' }}></div>
          </div>

          <div style={{ padding: '20px', border: '2px solid #333', borderRadius: '4px', background: '#eee' }}>
            <div style={{ fontSize: '0.8rem' }}>RO ARRAY</div>
            <div style={{ fontSize: '0.6rem' }}>{systemConfig.stage1Vessels} : {systemConfig.stage2Vessels}</div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#27ae60' }}>
               <span style={{ fontSize: '0.7rem' }}>PERMEATE</span><br/>
               <strong>{calculation.permeate} m³/h</strong>
            </div>
            <div style={{ color: '#e74c3c', marginTop: '10px' }}>
               <span style={{ fontSize: '0.7rem' }}>CONCENTRATE</span><br/>
               <strong>{(systemConfig.feedFlow - calculation.permeate).toFixed(1)} m³/h</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SystemDesign;