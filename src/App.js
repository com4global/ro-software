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

  const FLOW_TO_M3H = {
    gpm: 0.2271,
    gpd: 0.0001577,
    mgd: 157.725,
    migd: 189.27,
    'm3/h': 1,
    'm3/d': 1 / 24,
    mld: 41.667
  };

  const DEFAULT_SYSTEM_CONFIG = {
    // Inputs (follow IMSDesign layout: System-level total + trains; Train values are calculated)
    feedPh: 7.0,
    recovery: 55,
    flowUnit: 'gpm', // gpm/gpd/mgd/migd/m3/h/m3/d/mld
    permeateFlow: 77, // train permeate flow in selected unit
    numTrains: 1,

    // Array specification
    stage1Vessels: 4,
    stage2Vessels: 0,
    elementsPerVessel: 6,
    membraneModel: 'espa2ld',
    pass1Stages: 1, // Initially only 1 stage is active
    stages: [
      { membraneModel: 'espa2ld', elementsPerVessel: 6, vessels: 4 },
      { membraneModel: 'espa2ld', elementsPerVessel: 6, vessels: 0 },
      { membraneModel: 'espa2ld', elementsPerVessel: 6, vessels: 0 },
      { membraneModel: 'espa2ld', elementsPerVessel: 6, vessels: 0 },
      { membraneModel: 'espa2ld', elementsPerVessel: 6, vessels: 0 },
      { membraneModel: 'espa2ld', elementsPerVessel: 6, vessels: 0 }
    ],

    // Flux display
    fluxUnit: 'gfd', // gfd | lmh

    // Hydranautics behavior: flux stays 0 until "Recalculate array"
    designCalculated: false,

    // Conditions
    membraneAge: 0,
    fluxDeclinePerYear: 5,
    foulingFactor: 1,
    spIncreasePerYear: 7,

    // Chemical (as per IMSDesign "Pass 1")
    chemical: 'None',
    chemicalConcentration: 100, // %
    chemicalDose: 0,
    doseUnit: 'mg/l', // mg/l | lb/hr | kg/hr

    // Economics
    energyCostPerKwh: 0.12
  };

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
    const M3H_TO_GPD = 24 * 264.172052; // m3/h -> gal/day

    const unit = FLOW_TO_M3H[systemConfig.flowUnit] ? systemConfig.flowUnit : 'gpm';
    const unitFactor = FLOW_TO_M3H[unit] ?? 1;

    const trains = Math.max(Number(systemConfig.numTrains) || 1, 1);
    const trainPermeateInput = Number(systemConfig.permeateFlow) || 0;
    const perTrainProduct_m3h = trainPermeateInput * unitFactor;
    const totalProduct_m3h = perTrainProduct_m3h * trains;

    // Clamp recovery to avoid Infinity
    const recoveryPct = Math.min(Math.max(Number(systemConfig.recovery) || 15, 1), 99);
    const recovery = recoveryPct / 100;

    // Legacy train mass balance (as in screenshot 2)
    const perTrainFeed_m3h = perTrainProduct_m3h / recovery;
    const perTrainConc_m3h = perTrainFeed_m3h - perTrainProduct_m3h;

    // Calculate total elements across all active stages
    // Use stages array if available, otherwise fall back to legacy stage1Vessels/stage2Vessels
    let totalElements = 0;
    if (systemConfig.stages && systemConfig.stages.length > 0) {
      // Sum elements from all active stages (up to pass1Stages)
      const pass1Stages = Math.min(Math.max(Number(systemConfig.pass1Stages) || 1, 1), 6);
      for (let i = 0; i < pass1Stages; i++) {
        const stage = systemConfig.stages[i];
        if (stage) {
          const stageVessels = Number(stage.vessels) || 0;
          const stageElementsPerVessel = Number(stage.elementsPerVessel) || 0;
          totalElements += stageVessels * stageElementsPerVessel;
        }
      }
    } else {
      // Legacy fallback: use stage1Vessels and stage2Vessels
      totalElements = (Number(systemConfig.stage1Vessels) + Number(systemConfig.stage2Vessels)) * Number(systemConfig.elementsPerVessel);
    }
    
    // Get membrane area - use first stage's membrane if stages array exists, otherwise use membraneModel
    let activeMem;
    if (systemConfig.stages && systemConfig.stages.length > 0 && systemConfig.stages[0]) {
      activeMem = membranes.find(m => m.id === systemConfig.stages[0].membraneModel) || membranes[0];
    } else {
      activeMem = membranes.find(m => m.id === systemConfig.membraneModel) || membranes[0];
    }
    
    // Ensure we have a valid membrane with area
    const membraneArea = Number(activeMem?.area) || 400; // Default to 400 ft² if not found
    const totalArea_ft2 = totalElements * membraneArea;
    const totalArea_m2 = totalArea_ft2 * 0.09290304;

    const perTrainProduct_gpd = perTrainProduct_m3h * M3H_TO_GPD;
    
    // Calculate flux - always calculate, but only display if designCalculated is true
    let rawFluxGFD = 0;
    let rawFluxLMH = 0;
    if (totalArea_ft2 > 0 && perTrainProduct_gpd > 0) {
      rawFluxGFD = perTrainProduct_gpd / totalArea_ft2;
    }
    if (totalArea_m2 > 0 && perTrainProduct_m3h > 0) {
      rawFluxLMH = (perTrainProduct_m3h * 1000) / totalArea_m2;
    }
    
    // Only show flux value if designCalculated is true, otherwise show 0
    const fluxGFD = systemConfig.designCalculated ? rawFluxGFD : 0;
    const fluxLMH = systemConfig.designCalculated ? rawFluxLMH : 0;
    
    // Debug logging to understand why flux is 0 (only log when calculated but still 0)
    if (systemConfig.designCalculated && rawFluxGFD === 0 && rawFluxLMH === 0) {
      console.warn('Flux is 0 after calculation! Debug info:');
      console.log('  - designCalculated:', systemConfig.designCalculated);
      console.log('  - totalElements:', totalElements);
      console.log('  - membraneArea:', membraneArea);
      console.log('  - totalArea_ft2:', totalArea_ft2);
      console.log('  - totalArea_m2:', totalArea_m2);
      console.log('  - perTrainProduct_gpd:', perTrainProduct_gpd);
      console.log('  - perTrainProduct_m3h:', perTrainProduct_m3h);
      console.log('  - rawFluxGFD:', rawFluxGFD);
      console.log('  - rawFluxLMH:', rawFluxLMH);
      console.log('  - pass1Stages:', systemConfig.pass1Stages);
      console.log('  - stages:', systemConfig.stages?.map((s, i) => ({ 
        stage: i + 1, 
        vessels: s.vessels, 
        elements: s.elementsPerVessel,
        membrane: s.membraneModel 
      })));
    }

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