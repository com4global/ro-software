import React from 'react';

const SystemDesign = ({ membranes, systemConfig, setSystemConfig, projection, waterData, onRun }) => {

  const handleInputChange = (key, value) => {
    const resetsDesign = [
      'permeateFlow',
      'recovery',
      'numTrains',
      'elementsPerVessel',
      'stage1Vessels',
      'stage2Vessels',
      'membraneModel'
    ].includes(key);
    setSystemConfig({ ...systemConfig, [key]: value, ...(resetsDesign ? { designCalculated: false } : {}) });
  };

  const handleFlowUnitChange = (nextUnit) => {
    // Get decimal precision for the new unit (matching Hydranautics)
    const getFlowDecimals = (flowUnit) => {
      if (['gpm', 'm3/h'].includes(flowUnit)) return 2;
      if (['gpd', 'm3/d'].includes(flowUnit)) return 1;
      if (['mgd', 'migd', 'mld'].includes(flowUnit)) return 3;
      return 2; // default
    };
    
    // DO NOT convert the permeate flow value - keep it the same, only change unit and precision
    const prevVal = Number(systemConfig.permeateFlow) || 0;
    const nextDecimals = getFlowDecimals(nextUnit);

    setSystemConfig({
      ...systemConfig,
      flowUnit: nextUnit,
      // Keep the same numeric value, only format with new precision
      permeateFlow: prevVal.toFixed(nextDecimals),
      designCalculated: false
    });
  };

  // Get decimal precision for flow unit (matching Hydranautics)
  const getFlowDecimals = (flowUnit) => {
    if (['gpm', 'm3/h'].includes(flowUnit)) return 2;
    if (['gpd', 'm3/d'].includes(flowUnit)) return 1;
    if (['mgd', 'migd', 'mld'].includes(flowUnit)) return 3;
    return 2; // default
  };

  // Format flux to match flow unit decimal precision when value is 0
  const formatFluxDisplay = (fluxValue, flowUnit) => {
    if (!fluxValue || fluxValue === '0' || fluxValue === '0.0' || fluxValue === '0.00' || fluxValue === '0.000') {
      const decimals = getFlowDecimals(flowUnit);
      return '0.' + '0'.repeat(decimals); // e.g., '0.00', '0.0', '0.000'
    }
    return fluxValue; // Use the value as-is when calculated
  };

  const panelStyle = { background: '#c2d1df', border: '1px solid #8ba4bb', padding: '10px', borderRadius: '2px' };
  const headerStyle = { background: '#004a80', color: 'white', padding: '4px 8px', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '10px' };
  const rowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.75rem' };
  const inputStyle = { width: '70px', textAlign: 'right', border: '1px solid #999' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: 'Arial' }}>
      
      {/* TOP SECTION: INPUT PANELS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr', gap: '10px' }}>
        <div style={panelStyle}>
          <div style={headerStyle}>Train Information</div>
          <div style={rowStyle}><span>Feed pH</span> <input style={inputStyle} value={systemConfig.feedPh} onChange={e => handleInputChange('feedPh', e.target.value)} /></div>
          <div style={rowStyle}><span>Permeate recovery %</span> <input style={inputStyle} value={systemConfig.recovery} onChange={e => handleInputChange('recovery', e.target.value)} /></div>
          <div style={rowStyle}>
            <span>Permeate flow</span>
            <div style={{display:'flex', gap:'2px'}}>
              <select style={{fontSize:'0.7rem'}} value={systemConfig.flowUnit} onChange={e => handleFlowUnitChange(e.target.value)}>
                <option value="gpm">gpm</option>
                <option value="gpd">gpd</option>
                <option value="mgd">mgd</option>
                <option value="migd">migd</option>
                <option value="m3/h">m3/h</option>
                <option value="m3/d">m3/d</option>
                <option value="mld">mld</option>
              </select>
              <input style={inputStyle} value={systemConfig.permeateFlow} onChange={e => handleInputChange('permeateFlow', e.target.value)} />
            </div>
          </div>
          <div style={rowStyle}>
            <span>Average flux</span>
            <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
              <select style={{fontSize:'0.7rem'}} value={systemConfig.fluxUnit || 'gfd'} onChange={e => handleInputChange('fluxUnit', e.target.value)}>
                <option value="gfd">gfd</option>
                <option value="lmh">lmh</option>
              </select>
              <div style={{...inputStyle, background: '#eee'}}>
                {formatFluxDisplay(
                  systemConfig.fluxUnit === 'lmh' ? (projection?.fluxLMH ?? '0.000') : (projection?.fluxGFD ?? '0.000'),
                  systemConfig.flowUnit || 'gpm'
                )}
              </div>
            </div>
          </div>
          <div style={rowStyle}>
            <span>Feed flow</span>
            <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
              <div style={{...inputStyle, background: '#eee'}}>{projection?.feedFlow ?? '0.00'}</div>
              <span style={{ fontSize: '0.7rem', color: '#333' }}>{systemConfig.flowUnit || 'gpm'}</span>
            </div>
          </div>
          <div style={rowStyle}>
            <span>Concentrate flow</span>
            <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
              <div style={{...inputStyle, background: '#eee'}}>{projection?.concentrateFlow ?? '0.00'}</div>
              <span style={{ fontSize: '0.7rem', color: '#333' }}>{systemConfig.flowUnit || 'gpm'}</span>
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <div style={headerStyle}>Conditions</div>
          <div style={{ ...rowStyle, fontWeight: 'bold', marginTop: '2px' }}><span>Pass 1</span></div>
          <div style={rowStyle}>
            <span>Chemical</span>
            <select style={{ ...inputStyle, width: '110px', textAlign: 'left' }} value={systemConfig.chemical} onChange={e => handleInputChange('chemical', e.target.value)}>
              <option value="None">None</option>
              <option value="Antiscalant">Antiscalant</option>
              <option value="SBS">SBS</option>
              <option value="Acid">Acid</option>
              <option value="Caustic">Caustic</option>
            </select>
          </div>
          <div style={rowStyle}>
            <span>Chemical concentration</span>
            <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
              <input style={inputStyle} value={systemConfig.chemicalConcentration} onChange={e => handleInputChange('chemicalConcentration', e.target.value)} />
              <span style={{ fontSize: '0.7rem', color: '#333' }}>%</span>
            </div>
          </div>
          <div style={rowStyle}>
            <span>Chemical dose</span>
            <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
              <input style={inputStyle} value={systemConfig.chemicalDose} onChange={e => handleInputChange('chemicalDose', e.target.value)} />
              <select style={{fontSize:'0.7rem'}} value={systemConfig.doseUnit} onChange={e => handleInputChange('doseUnit', e.target.value)}>
                <option value="mg/l">mg/l</option>
                <option value="lb/hr">lb/hr</option>
                <option value="kg/hr">kg/hr</option>
              </select>
            </div>
          </div>
          <div style={rowStyle}><span>Membrane age (years)</span> <input style={inputStyle} value={systemConfig.membraneAge} onChange={e => handleInputChange('membraneAge', e.target.value)} /></div>
          <div style={rowStyle}><span>Flux decline %/yr</span> <input style={inputStyle} value={systemConfig.fluxDeclinePerYear} onChange={e => handleInputChange('fluxDeclinePerYear', e.target.value)} /></div>
          <div style={rowStyle}><span>Fouling factor</span> <input style={inputStyle} value={systemConfig.foulingFactor} onChange={e => handleInputChange('foulingFactor', e.target.value)} /></div>
          <div style={rowStyle}><span>SP increase % per year</span> <input style={inputStyle} value={systemConfig.spIncreasePerYear} onChange={e => handleInputChange('spIncreasePerYear', e.target.value)} /></div>
        </div>

        <div style={panelStyle}>
          <div style={headerStyle}>System</div>
          <div style={rowStyle}>
            <span>Total plant product flow</span>
            <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
              <input style={{...inputStyle, background:'#eee'}} value={projection?.totalPlantProductFlowDisplay ?? '0.00'} readOnly />
              <span style={{ fontSize: '0.7rem', color: '#333' }}>{systemConfig.flowUnit || 'gpm'}</span>
            </div>
          </div>
          <div style={rowStyle}><span>Number of trains</span> <input style={inputStyle} value={systemConfig.numTrains} onChange={e => handleInputChange('numTrains', e.target.value)} /></div>
        </div>
      </div>

      {/* MIDDLE SECTION: SPECIFICATIONS & RUN BUTTON */}
      <div style={panelStyle}>
        <div style={headerStyle}>System Specifications</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={rowStyle}>
              <span style={{width: '120px'}}>Membrane type</span>
              <select style={{width: '150px'}} value={systemConfig.membraneModel} onChange={e => handleInputChange('membraneModel', e.target.value)}>
                {membranes.map(m => <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div style={rowStyle}><span>Membranes/vessel</span> <input style={inputStyle} value={systemConfig.elementsPerVessel} onChange={e => handleInputChange('elementsPerVessel', e.target.value)} /></div>
            <div style={rowStyle}><span>No. of vessels</span> <input style={inputStyle} value={systemConfig.stage1Vessels} onChange={e => handleInputChange('stage1Vessels', e.target.value)} /></div>
          </div>
          <button onClick={onRun} style={{ 
            background: 'linear-gradient(#3498db, #2980b9)', color: 'white', padding: '10px 30px', 
            borderRadius: '20px', border: '1px solid #004a80', cursor: 'pointer', fontWeight: 'bold' 
          }}>
            Recalculate array
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: CALCULATION RESULTS (VISIBLE ONLY AFTER RUN) */}
      {projection && (
        <div style={{ ...panelStyle, background: '#d9e4f0' }}>
          <div style={headerStyle}>Calculation Results</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'center', background: 'white' }}>
            <thead style={{ background: '#eee' }}>
              <tr>
                <th style={{ border: '1px solid #ccc' }}>Array</th>
                <th style={{ border: '1px solid #ccc' }}>Vessels</th>
                <th style={{ border: '1px solid #ccc' }}>Feed (psi)</th>
                <th style={{ border: '1px solid #ccc' }}>Conc (psi)</th>
                <th style={{ border: '1px solid #ccc' }}>Flux (gfd)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc' }}>1 - 1</td>
                <td style={{ border: '1px solid #ccc' }}>{systemConfig.stage1Vessels}</td>
                <td style={{ border: '1px solid #ccc' }}>126.2</td>
                <td style={{ border: '1px solid #ccc' }}>117.3</td>
                <td style={{ border: '1px solid #ccc' }}>{projection.fluxGFD}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px', fontSize: '0.7rem' }}>
             <div>Na: {waterData.na}</div>
             <div>Cl: {waterData.cl}</div>
             <div>TDS: 2209.5 mg/l</div>
             <div style={{ fontWeight: 'bold' }}>Osmotic: 25.4 psi</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemDesign;