import React from 'react';

const Report = ({ waterData, systemConfig, projection, postTreatment, pretreatment, projectNotes, setProjectNotes, snapshots = [] }) => {
  const reportDate = new Date().toLocaleDateString();
  const safeSnapshots = Array.isArray(snapshots) ? snapshots : [];

  // Monthly Calculations
  const monthlyAS = ((systemConfig.feedFlow * pretreatment.antiscalantDose * 24 * 30) / 1000).toFixed(1);
  const monthlyCaustic = ((systemConfig.feedFlow * postTreatment.causticDose * 24 * 30) / 1000).toFixed(1);

  const sectionStyle = { marginBottom: '25px', border: '1px solid #004a80', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff' };
  const headerStyle = { backgroundColor: '#004a80', color: '#fff', padding: '12px 15px', fontWeight: 'bold' };

  return (
    <div id="printable-report" style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px', fontFamily: 'Arial' }}>
      <style>{`@page { size: landscape; margin: 15mm; } @media print { .no-print { display: none !important; } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #004a80', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>TECHNICAL SUBMITTAL</h1>
        <div style={{ textAlign: 'right' }}>
          <p><strong>Project:</strong> {waterData.projectName}</p>
          <p><strong>Date:</strong> {reportDate}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>
        <div>
          {/* OPEX SUMMARY */}
          <div style={sectionStyle}>
            <div style={headerStyle}>Monthly Operational Cost Estimator</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>⚡ Electricity ({systemConfig.energyCostPerKwh}/kWh)</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${projection.monthlyEnergyCost}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>🧪 Antiscalant ({monthlyAS} kg)</td>
                  <td style={{ textAlign: 'right' }}>Calculated by Dose</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px' }}>🧪 Caustic Soda ({monthlyCaustic} kg)</td>
                  <td style={{ textAlign: 'right' }}>Calculated by Dose</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SNAPSHOT COMPARISON PRESERVED */}
          {safeSnapshots.length > 0 && (
            <div style={sectionStyle}>
              <div style={headerStyle}>Design Alternatives Comparison</div>
              <table style={{ width: '100%', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#f4f4f4' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Metric</th>
                    {safeSnapshots.map((s, i) => <th key={i}>{s.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px' }}>Flux (GFD)</td>
                    {safeSnapshots.map((s, i) => <td key={i} style={{ textAlign: 'center' }}>{s.results.fluxGFD}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div style={sectionStyle}>
            <div style={headerStyle}>System Performance</div>
            <div style={{ padding: '15px' }}>
              <p>Feed Pressure: <strong>{projection.pumpPressure} bar</strong></p>
              <p>Final pH: <strong>{projection.finalPh}</strong></p>
              <p>LSI Post-Treatment: <strong>{projection.postTreatmentLsi}</strong></p>
            </div>
          </div>
          <textarea 
            className="no-print" 
            value={projectNotes} 
            onChange={(e) => setProjectNotes(e.target.value)}
            style={{ width: '100%', height: '100px', marginBottom: '10px' }}
            placeholder="Add notes..."
          />
          <button onClick={() => window.print()} className="no-print" style={{ width: '100%', padding: '15px', background: '#004a80', color: '#fff', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}>PRINT REPORT</button>
        </div>
      </div>
    </div>
  );
};

export default Report;