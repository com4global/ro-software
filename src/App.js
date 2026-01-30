import React, { useState, useEffect } from 'react';
import WaterAnalysis from './components/WaterAnalysis';
import SystemDesign from './components/SystemDesign';
import Report from './components/Report';
import membraneData from './membranes.json';

const App = () => {
  const [activeTab, setActiveTab] = useState('analysis');

  // 1. Shared State for Water Chemistry
  const [waterData, setWaterData] = useState({
    ca: 0, mg: 0, na: 0, k: 0, cl: 0, so4: 0, hco3: 0, si: 0,
    temp: 25, ph: 7.5, tds: 0
  });

  // 2. Shared State for System Hardware
  const [systemConfig, setSystemConfig] = useState({
    feedFlow: 100,
    recovery: 75,
    vessels: 6,
    elementsPerVessel: 6,
    membraneModel: 'espa2'
  });

  // 3. Calculation Result State
  const [projection, setProjection] = useState({
    osmoticPressure: 0,
    pumpPressure: 0,
    flux: 0
  });

  // 4. Central Math Engine (Re-runs on any change)
  useEffect(() => {
    const selectedMembrane = membraneData.find(m => m.id === systemConfig.membraneModel) || membraneData[0];
    const totalElements = systemConfig.vessels * systemConfig.elementsPerVessel;
    const totalArea = totalElements * selectedMembrane.area;

    // Flux Calculation (Liters per square meter per hour)
    const flux = totalArea > 0 ? (systemConfig.feedFlow * 1000 / (totalArea * 0.0929)) : 0;

    // Osmotic Pressure Logic
    const osmoticPressureFeed = (waterData.tds / 1000) * 0.76;
    const concentrationFactor = 1 / (1 - (systemConfig.recovery / 100));
    const avgOsmoticPressure = osmoticPressureFeed * ((1 + concentrationFactor) / 2);

    // Pressure Calculation
    const permeability = selectedMembrane.id.includes('swc') ? 0.06 : 0.18;
    const netDrivingPressure = flux / (permeability * 10);
    const estimatedPumpPressure = netDrivingPressure + avgOsmoticPressure + 1.2;

    setProjection({
      flux: flux.toFixed(1),
      osmoticPressure: avgOsmoticPressure.toFixed(2),
      pumpPressure: estimatedPumpPressure.toFixed(2)
    });
  }, [waterData, systemConfig]);

  // Tab Styles
  const tabStyle = (tab) => ({
    padding: '15px 30px',
    cursor: 'pointer',
    backgroundColor: activeTab === tab ? '#3498db' : '#2c3e50',
    color: 'white',
    border: 'none',
    borderBottom: activeTab === tab ? '4px solid #fff' : 'none',
    fontSize: '1rem',
    fontWeight: '600'
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9' }}>
      <header style={{ backgroundColor: '#2c3e50', color: '#fff', padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>RO Designer Pro</h2>
        <div style={{ marginLeft: '40px' }}>
          <button style={tabStyle('analysis')} onClick={() => setActiveTab('analysis')}>1. Water Analysis</button>
          <button style={tabStyle('design')} onClick={() => setActiveTab('design')}>2. System Design</button>
          <button style={tabStyle('report')} onClick={() => setActiveTab('report')}>3. Final Report</button>
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        {activeTab === 'analysis' && (
          <WaterAnalysis waterData={waterData} setWaterData={setWaterData} />
        )}
        
        {activeTab === 'design' && (
          <SystemDesign 
            waterData={waterData} 
            systemConfig={systemConfig} 
            setSystemConfig={setSystemConfig}
            projection={projection}
          />
        )}

        {activeTab === 'report' && (
          <Report 
            waterData={waterData} 
            systemConfig={systemConfig} 
            projection={projection} 
          />
        )}
      </main>
    </div>
  );
};

export default App;