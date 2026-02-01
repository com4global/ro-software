import React from 'react';

const Report = ({ 
  waterData, 
  systemConfig, 
  projection, 
  pretreatment, 
  postTreatment, 
  projectNotes, 
  setProjectNotes, 
  snapshots, 
  setSnapshots 
}) => {

  // --- OPEX CALCULATIONS ---
  const feedFlow = Number(systemConfig.feedFlow);
  const permeateFlow = Number(projection.permeateFlow);
  
  // 1. Energy Cost per m3
  const hourlyEnergyCost = (Number(projection.monthlyEnergyCost) / 30 / 24);
  const energyPerM3 = permeateFlow > 0 ? hourlyEnergyCost / permeateFlow : 0;

  // 2. Chemical Costs (Assumed unit costs: AS=$3.00/kg, Caustic=$1.50/kg)
  const asCostHourly = (feedFlow * Number(pretreatment.antiscalantDose) * 3.00) / 1000;
  const causticCostHourly = (permeateFlow * Number(postTreatment.causticDose) * 1.50) / 1000;
  const chemPerM3 = permeateFlow > 0 ? (asCostHourly + causticCostHourly) / permeateFlow : 0;

  const totalOpexPerM3 = (energyPerM3 + chemPerM3).toFixed(3);

  const deleteSnapshot = (id) => {
    if (window.confirm("Delete this snapshot?")) {
      setSnapshots(snapshots.filter(s => s.id !== id));
    }
  };

  const sectionStyle = {
    background: 'white', padding: '20px', borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#002f5d', margin: 0 }}>Engineering & OPEX Report</h2>
        <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Print to PDF
        </button>
      </div>

      {/* FINANCIAL SUMMARY CARD */}
      <div style={{ ...sectionStyle, background: '#2c3e50', color: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>ENERGY / $m^3$</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${energyPerM3.toFixed(3)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>CHEMICALS / $m^3$</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${chemPerM3.toFixed(3)}</div>
          </div>
          <div style={{ borderLeft: '1px solid #456' }}>
            <div style={{ fontSize: '0.8rem', color: '#f39c12', fontWeight: 'bold' }}>TOTAL OPEX / $m^3$</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>${totalOpexPerM3}</div>
          </div>
        </div>
      </div>

      {/* SYSTEM PERFORMANCE */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, color: '#004a80' }}>System Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '8px 0' }}>Feed Flow</td><td style={{ textAlign: 'right' }}>{systemConfig.feedFlow} $m^3/h$</td></tr>
              <tr><td style={{ padding: '8px 0' }}>Permeate Flow</td><td style={{ textAlign: 'right' }}>{projection.permeateFlow} $m^3/h$</td></tr>
              <tr><td style={{ padding: '8px 0' }}>Recovery</td><td style={{ textAlign: 'right' }}>{systemConfig.recovery}%</td></tr>
            </tbody>
          </table>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '8px 0' }}>Design Flux</td><td style={{ textAlign: 'right' }}>{projection.fluxGFD} GFD</td></tr>
              <tr><td style={{ padding: '8px 0' }}>Feed Pressure</td><td style={{ textAlign: 'right' }}>{projection.pumpPressure} bar</td></tr>
              <tr><td style={{ padding: '8px 0' }}>Temperature</td><td style={{ textAlign: 'right' }}>{waterData.temp} °C</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SNAPSHOTS */}
      {snapshots.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, color: '#9b59b6' }}>Design Snapshots</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#666', fontSize: '0.8rem' }}>
                <th>NAME</th><th>FLUX</th><th>PRESSURE</th><th>OPEX/$m^3$</th><th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 0' }}><strong>{s.name}</strong></td>
                  <td>{s.results.fluxGFD}</td>
                  <td>{s.results.pumpPressure}</td>
                  <td>${(s.results.monthlyEnergyCost / 30 / 24 / s.results.permeateFlow).toFixed(3)}</td>
                  <td><button onClick={() => deleteSnapshot(s.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PROJECT NOTES */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, color: '#004a80' }}>Engineering Notes</h3>
        <textarea 
          style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          value={projectNotes}
          onChange={(e) => setProjectNotes(e.target.value)}
          placeholder="Enter site specific observations..."
        />
      </div>
    </div>
  );
};

export default Report;