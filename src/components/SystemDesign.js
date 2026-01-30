import React from 'react';

const SystemDesign = ({ membranes, systemConfig, setSystemConfig, projection }) => {
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' };
  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' };

  const renderVessels = (count, color) => Array.from({ length: count }).map((_, i) => (
    <div key={i} style={{ width: '50px', height: '12px', background: color, margin: '4px', borderRadius: '2px', border: '1px solid #444' }} />
  ));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#333' }}>System Array & Performance</h2>

      {/* SCALE WARNING DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', borderRadius: '8px', background: projection.alerts?.lsi > 0.5 ? '#fff3cd' : '#d4edda', border: '1px solid #ffeeba' }}>
          <strong>LSI Index: {projection.alerts?.lsi}</strong>
          <div style={{ fontSize: '0.7rem' }}>{projection.alerts?.lsi > 0.5 ? "⚠️ Scaling Risk" : "✅ CaCO3 Stable"}</div>
        </div>
        <div style={{ padding: '15px', borderRadius: '8px', background: projection.alerts?.caSo4 ? '#f8d7da' : '#d4edda', border: '1px solid #f5c6cb' }}>
          <strong>Sulfate Status</strong>
          <div style={{ fontSize: '0.7rem' }}>{projection.alerts?.caSo4 ? "🛑 CaSO4 Saturated" : "✅ No Sulfate Scale"}</div>
        </div>
        <div style={{ padding: '15px', borderRadius: '8px', background: projection.alerts?.silica ? '#f8d7da' : '#d4edda', border: '1px solid #f5c6cb' }}>
          <strong>Silica Status</strong>
          <div style={{ fontSize: '0.7rem' }}>{projection.alerts?.silica ? "🛑 Silica Over Limit" : "✅ Silica Stable"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <small>STAGE 1 ARRAY</small>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {renderVessels(systemConfig.stage1Vessels, '#3498db')}
          </div>
        </div>
        <div style={{ fontSize: '2rem', color: '#ccc' }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <small>STAGE 2 ARRAY</small>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {renderVessels(systemConfig.stage2Vessels, '#9b59b6')}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'right', borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Design Recovery</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27ae60' }}>{systemConfig.recovery}%</div>
          <small>Concentrate: {(systemConfig.feedFlow * (1 - systemConfig.recovery/100)).toFixed(1)} m³/h</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={cardStyle}>
          <h3>Hardware Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
             <div>
               <label>Stage 1 Vessels</label>
               <input type="number" value={systemConfig.stage1Vessels} style={inputStyle} onChange={e => setSystemConfig({...systemConfig, stage1Vessels: parseInt(e.target.value) || 1})} />
             </div>
             <div>
               <label>Stage 2 Vessels</label>
               <input type="number" value={systemConfig.stage2Vessels} style={inputStyle} onChange={e => setSystemConfig({...systemConfig, stage2Vessels: parseInt(e.target.value) || 0})} />
             </div>
          </div>
          <label style={{ marginTop: '10px', display: 'block' }}>Elements per Vessel</label>
          <input type="number" value={systemConfig.elementsPerVessel} style={inputStyle} onChange={e => setSystemConfig({...systemConfig, elementsPerVessel: parseInt(e.target.value) || 1})} />
          <label style={{ marginTop: '10px', display: 'block' }}>Recovery (%)</label>
          <input type="number" value={systemConfig.recovery} style={inputStyle} onChange={e => setSystemConfig({...systemConfig, recovery: parseFloat(e.target.value) || 0})} />
        </div>

        <div style={cardStyle}>
          <h3>Membrane & Economics</h3>
          <label>Membrane Model</label>
          <select value={systemConfig.membraneModel} style={inputStyle} onChange={e => setSystemConfig({...systemConfig, membraneModel: e.target.value})}>
            {membranes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <label style={{ marginTop: '10px', display: 'block' }}>Power Cost ($/kWh)</label>
          <input type="number" step="0.01" value={systemConfig.energyCostPerKwh} style={inputStyle} onChange={e => setSystemConfig({...systemConfig, energyCostPerKwh: parseFloat(e.target.value) || 0})} />
          <div style={{ marginTop: '20px', padding: '15px', background: '#002f5d', color: 'white', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <div>Flux: <strong>{projection.flux} LMH</strong></div>
            <div>Pressure: <strong>{projection.pumpPressure} bar</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDesign;