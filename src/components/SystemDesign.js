import React, { useEffect } from 'react';
import membraneData from '../membranes.json';

const SystemDesign = ({ waterData, systemConfig, setSystemConfig, projection }) => {
  
  const getValidationMessages = () => {
    let messages = [];
    if (waterData.ca > 100 && systemConfig.recovery > 75) {
      messages.push({ type: 'error', text: "⚠️ High Scaling Risk: Calcium levels are high for the selected recovery." });
    }
    if (parseFloat(projection.flux) > 30) {
      messages.push({ type: 'error', text: `⚠️ Flux too high (${projection.flux} LMH). Add more vessels.` });
    }
    return messages;
  };

  const activeMessages = getValidationMessages();
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2c3e50' }}>System Design & Projection</h2>

      <div style={{ ...cardStyle, background: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-around' }}>
        <div><strong>Feed TDS:</strong> {waterData.tds} mg/L</div>
        <div><strong>Osmotic Pressure:</strong> {projection.osmoticPressure} bar</div>
        <div style={{ fontSize: '1.2rem', color: '#3498db' }}>
          <strong>Req. Pump Pressure: {projection.pumpPressure} bar</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={cardStyle}>
          <h3>Configuration</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Feed Flow (m³/h)</label>
            <input type="number" value={systemConfig.feedFlow} style={{ width: '100%', padding: '8px' }}
              onChange={(e) => setSystemConfig({...systemConfig, feedFlow: parseFloat(e.target.value) || 0})} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Recovery (%)</label>
            <input type="number" value={systemConfig.recovery} style={{ width: '100%', padding: '8px' }}
              onChange={(e) => setSystemConfig({...systemConfig, recovery: parseFloat(e.target.value) || 0})} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div><label>Vessels</label>
              <input type="number" value={systemConfig.vessels} style={{ width: '100%', padding: '8px' }}
                onChange={(e) => setSystemConfig({...systemConfig, vessels: parseInt(e.target.value) || 1})} />
            </div>
            <div><label>Elements/Vessel</label>
              <input type="number" value={systemConfig.elementsPerVessel} style={{ width: '100%', padding: '8px' }}
                onChange={(e) => setSystemConfig({...systemConfig, elementsPerVessel: parseInt(e.target.value) || 1})} />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3>Membrane Selection</h3>
          <select value={systemConfig.membraneModel} style={{ width: '100%', padding: '10px' }}
            onChange={(e) => setSystemConfig({...systemConfig, membraneModel: e.target.value})}>
            {membraneData.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px' }}>
            <p><strong>Calculated Flux:</strong> {projection.flux} LMH</p>
            <p><strong>Total Elements:</strong> {systemConfig.vessels * systemConfig.elementsPerVessel}</p>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, border: '1px solid #eee' }}>
        <h4>Messages & Warnings</h4>
        <div style={{ padding: '10px', borderRadius: '4px', background: activeMessages.length > 0 ? '#fff5f5' : '#f6ffed' }}>
          {activeMessages.length === 0 ? <div style={{ color: '#52c41a' }}>✓ Design is technically feasible.</div> : 
            <ul style={{ color: '#cf1322', margin: 0 }}>{activeMessages.map((msg, i) => <li key={i}>{msg.text}</li>)}</ul>
          }
        </div>
      </div>
    </div>
  );
};

export default SystemDesign;