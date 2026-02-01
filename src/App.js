import React, { useState, useEffect, useRef } from 'react';
import WaterAnalysis from './components/WaterAnalysis';
import PreTreatment from './components/PreTreatment';
import SystemDesign from './components/SystemDesign';
import PostTreatment from './components/PostTreatment';
import Report from './components/Report';
import MembraneEditor from './components/MembraneEditor';
import DesignGuidelines from './components/DesignGuidelines';
import ValidationBanner from './components/ValidationBanner';

// Internal Unit Conversion Constants
const FLOW_CONVERSION = {
  gpm: 1,
  gpd: 1 / 1440,
  mgd: 694.44,
  migd: 833.95,
  'm3/h': 4.403,
  'm3/d': 0.1834,
  mld: 183.45
};

const App = () => {
  const [activeTab, setActiveTab] = useState('design');
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. STATE MANAGEMENT ---
  const [membranes, setMembranes] = useState([
    { id: 'espa2ld', name: 'ESPA2-LD', area: 400, aValue: 0.18, rejection: 99.7, type: 'Brackish' },
    { id: 'cpa3', name: 'CPA3', area: 400, aValue: 0.12, rejection: 99.7, type: 'Brackish' },
    { id: 'lfc3ld4040', name: 'LFC3-LD-4040', area: 80, aValue: 0.14, rejection: 99.7, type: 'Brackish' }
  ]);

  const [systemConfig, setSystemConfig] = useState({
    feedPh: 7.0,
    recovery: 55.0,
    permeateFlow: 10.0,
    flowUnit: 'gpm',
    numTrains: 1,
    membraneAge: 0.0,
    fluxDeclinePerYear: 5.0,
    foulingFactor: 1.0,
    spIncreasePerYear: 7.0,
    chemicalDose: 0.0,
    doseUnit: 'mg/l',
    membraneModel: 'lfc3ld4040',
    stage1Vessels: 2,
    elementsPerVessel: 7
  });

  const [waterData, setWaterData] = useState({ projectName: 'saravanan', temp: 77, ph: 7.0 });
  const [projection, setProjection] = useState({
    feedFlow: "0.00",
    concentrateFlow: "0.00",
    fluxGfd: "0.0",
    totalPlantFlow: "0.00",
    foulingFactorApplied: "1.00",
    displayDose: "0.000"
  });

  // --- 2. MASTER CALCULATION ENGINE ---
  useEffect(() => {
    const pFlow = Number(systemConfig.permeateFlow) || 0;
    const recovery = Number(systemConfig.recovery) || 1;
    
    // Standardize to GPM for internal math
    const pFlowGpm = pFlow * (FLOW_CONVERSION[systemConfig.flowUnit] || 1);
    const recDecimal = recovery / 100;
    
    // Hydraulic Balance
    const feedGpm = recDecimal > 0 ? pFlowGpm / recDecimal : 0;
    const concGpm = feedGpm - pFlowGpm;

    // Membrane & Area logic
    const activeMem = membranes.find(m => m.id === systemConfig.membraneModel) || membranes[0];
    const totalElements = Number(systemConfig.stage1Vessels || 0) * Number(systemConfig.elementsPerVessel || 0);
    const totalArea = totalElements * (activeMem.area || 80);
    
    // Flux Calculation
    const flux = totalArea > 0 ? (pFlowGpm * 1440) / totalArea : 0;

    // Ageing & Fouling
    const years = Number(systemConfig.membraneAge) || 0;
    const fFactor = Number(systemConfig.foulingFactor || 1) * Math.pow((1 - (Number(systemConfig.fluxDeclinePerYear || 0) / 100)), years);
    
    // Dose Unit Conversion
    let doseVal = Number(systemConfig.chemicalDose) || 0;
    if (systemConfig.doseUnit === 'lb/hr') doseVal = (doseVal * feedGpm * 60 * 8.34) / 1000000;
    if (systemConfig.doseUnit === 'kg/hr') doseVal = (doseVal * feedGpm * 60 * 8.34) / 2204622;

    setProjection({
      feedFlow: (feedGpm / (FLOW_CONVERSION[systemConfig.flowUnit] || 1)).toFixed(2),
      concentrateFlow: (concGpm / (FLOW_CONVERSION[systemConfig.flowUnit] || 1)).toFixed(2),
      fluxGfd: flux.toFixed(1),
      totalPlantFlow: (pFlowGpm * (Number(systemConfig.numTrains) || 1) / (FLOW_CONVERSION[systemConfig.flowUnit] || 1)).toFixed(2),
      foulingFactorApplied: fFactor.toFixed(2),
      displayDose: doseVal.toFixed(3),
      activeMembrane: activeMem
    });
  }, [systemConfig, membranes]);

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('ro_pro_v3_state');
    if (saved) {
      try { setSystemConfig(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('ro_pro_v3_state', JSON.stringify(systemConfig));
  }, [systemConfig, isLoaded]);

  if (!isLoaded) return <div>Initialising Design Engine...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#002f5d', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>IMSDesign Pro 3.0</h2>
        <nav style={{ display: 'flex', gap: '5px' }}>
          {['analysis', 'design', 'report'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ background: activeTab === t ? '#f39c12' : 'transparent', border: 'none', color: 'white', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
              {t.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        {activeTab === 'analysis' && <WaterAnalysis waterData={waterData} setWaterData={setWaterData} />}
        {activeTab === 'design' && (
          <SystemDesign 
            membranes={membranes}
            systemConfig={systemConfig}
            setSystemConfig={setSystemConfig}
            projection={projection}
          />
        )}
        {activeTab === 'report' && <Report systemConfig={systemConfig} projection={projection} waterData={waterData} />}
      </main>

      <footer style={{ background: '#fff', borderTop: '1px solid #ddd', padding: '10px 20px', position: 'fixed', bottom: 0, width: '100%', display: 'flex', gap: '30px', fontSize: '0.8rem' }}>
        <span>Project: <strong>{waterData.projectName}</strong></span>
        <span>Total Plant Flow: <strong>{projection.totalPlantFlow} {systemConfig.flowUnit}</strong></span>
        <span>Active Membrane: <strong>{projection.activeMembrane?.name}</strong></span>
      </footer>
    </div>
  );
};

export default App;