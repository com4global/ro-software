import React from 'react';
import membraneData from '../membranes.json';

const Report = ({ waterData, systemConfig, projection }) => {
  const selectedMembrane = membraneData.find(m => m.id === systemConfig.membraneModel) || {};
  const reportDate = new Date().toLocaleDateString();

  const sectionStyle = { marginBottom: '30px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' };
  const headerStyle = { backgroundColor: '#f8f9fa', padding: '10px 15px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' };
  const rowStyle = { display: 'flex', padding: '8px 15px', borderBottom: '1px solid #eee' };

  return (
    <div id="report-content" style={{ maxWidth: '900px', margin: '20px auto', backgroundColor: '#fff', padding: '40px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #2c3e50', paddingBottom: '20px' }}>
        <h1>RO System Design Report</h1>
        <p>Generated on: {reportDate}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={sectionStyle}>
          <div style={headerStyle}>Water Analysis Summary</div>
          <div style={rowStyle}><span>TDS</span><span style={{marginLeft:'auto'}}>{waterData.tds} mg/L</span></div>
          <div style={rowStyle}><span>Temp</span><span style={{marginLeft:'auto'}}>{waterData.temp} °C</span></div>
        </div>
        <div style={sectionStyle}>
          <div style={headerStyle}>System Configuration</div>
          <div style={rowStyle}><span>Membrane</span><span style={{marginLeft:'auto'}}>{selectedMembrane.name}</span></div>
          <div style={rowStyle}><span>Total Elements</span><span style={{marginLeft:'auto'}}>{systemConfig.vessels * systemConfig.elementsPerVessel}</span></div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ ...headerStyle, backgroundColor: '#2c3e50', color: '#fff' }}>Performance Projection</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '20px', textAlign: 'center' }}>
          <div><div style={{color:'#666'}}>Pump Pressure</div><div style={{fontSize:'1.5rem', fontWeight:'bold'}}>{projection.pumpPressure} bar</div></div>
          <div><div style={{color:'#666'}}>Average Flux</div><div style={{fontSize:'1.5rem', fontWeight:'bold'}}>{projection.flux} LMH</div></div>
          <div><div style={{color:'#666'}}>Recovery</div><div style={{fontSize:'1.5rem', fontWeight:'bold'}}>{systemConfig.recovery} %</div></div>
        </div>
      </div>

      <button onClick={() => window.print()} style={{ marginTop: '20px', padding: '10px 25px', backgroundColor: '#34495e', color: 'white', border: 'none', cursor: 'pointer', display: 'block', margin: '0 auto' }}>
        Print / Save as PDF
      </button>
    </div>
  );
};

export default Report;