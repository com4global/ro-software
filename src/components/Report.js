import React from 'react';
import membraneData from '../membranes.json';

const Report = ({ waterData, systemConfig, projection, postTreatment, pretreatment }) => {
  const selectedMembrane = membraneData.find(m => m.id === systemConfig.membraneModel) || {};
  const reportDate = new Date().toLocaleDateString();

  const sectionStyle = { marginBottom: '25px', border: '1px solid #004a80', borderRadius: '4px', overflow: 'hidden' };
  const headerStyle = { backgroundColor: '#004a80', color: '#fff', padding: '10px 15px', fontWeight: 'bold' };
  const rowStyle = { display: 'flex', padding: '8px 15px', borderBottom: '1px solid #eee', fontSize: '0.9rem' };
  const labelCol = { flex: 1, color: '#555' };
  const valueCol = { flex: 1, fontWeight: 'bold', textAlign: 'right' };

  return (
    <div id="printable-report" style={{ maxWidth: '950px', margin: '0 auto', backgroundColor: '#fff', padding: '50px', fontFamily: 'Arial' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #004a80', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#004a80' }}>MULTI-STAGE SYSTEM REPORT</h1>
          <p style={{ margin: 0, color: '#f39c12', fontWeight: 'bold' }}>Recovery Efficiency: {systemConfig.recovery}%</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
          <p><strong>Project:</strong> {waterData.projectName}</p>
          <p><strong>Date:</strong> {reportDate}</p>
        </div>
      </div>

      {/* STAGE ANALYSIS */}
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, backgroundColor: '#34495e' }}>Multi-Stage Array Analysis</div>
        <div style={{ display: 'flex', padding: '20px', textAlign: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Stage 1 Array</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{systemConfig.stage1Vessels} Vessels</div>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Stage 2 Array</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{systemConfig.stage2Vessels} Vessels</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Permeate Flow</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{(systemConfig.feedFlow * systemConfig.recovery / 100).toFixed(1)} m³/h</div>
          </div>
        </div>
      </div>

      {/* PRESSURE PROFILE */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Pressure Profile</div>
        <div style={rowStyle}><span style={labelCol}>Main Feed Pump Pressure</span><span style={valueCol}>{projection.pumpPressure} bar</span></div>
        <div style={rowStyle}><span style={labelCol}>Stage 2 Inlet Pressure (Interstage)</span><span style={valueCol}>{projection.stage2FeedPressure} bar</span></div>
        <div style={rowStyle}><span style={labelCol}>Concentrate (Brine) Pressure</span><span style={valueCol}>{(projection.stage2FeedPressure - 1.5).toFixed(2)} bar</span></div>
      </div>

      {/* OPEX & CHEMICALS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={sectionStyle}>
          <div style={{ ...headerStyle, backgroundColor: '#27ae60' }}>Daily Power</div>
          <div style={rowStyle}><span style={labelCol}>Total Power</span><span style={valueCol}>{projection.powerKW} kW</span></div>
          <div style={rowStyle}><span style={labelCol}>Daily Cost</span><span style={valueCol}>${projection.dailyCost}</span></div>
        </div>
        <div style={sectionStyle}>
          <div style={{ ...headerStyle, backgroundColor: '#e67e22' }}>Daily Chemicals</div>
          <div style={rowStyle}><span style={labelCol}>Antiscalant</span><span style={valueCol}>{projection.antiscalantKgDay} kg</span></div>
          <div style={rowStyle}><span style={labelCol}>SBS</span><span style={valueCol}>{projection.sbsKgDay} kg</span></div>
        </div>
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.8rem', color: '#999' }}>
        Disclaimer: This multi-stage projection assumes standard 1.5 bar differential pressure between stages and uniform flux distribution. 
        High recovery designs (>80%) require careful antiscalant selection to prevent silica and sulfate scaling.
      </div>

      <button onClick={() => window.print()} className="no-print" style={{ display: 'block', width: '250px', margin: '30px auto', padding: '15px', background: '#004a80', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        PRINT FINAL SUBMITTAL
      </button>

      <style>{`@media print { .no-print { display: none; } }`}</style>
    </div>
  );
};

export default Report;