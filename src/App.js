import React, { useState, useEffect, useRef } from 'react';
import WaterAnalysis from './components/WaterAnalysis';
import PreTreatment from './components/PreTreatment';
import SystemDesign from './components/SystemDesign';
import PostTreatment from './components/PostTreatment';
import Report from './components/Report';
import MembraneEditor from './components/MembraneEditor';
import DesignGuidelines from './components/DesignGuidelines';
import ValidationBanner from './components/ValidationBanner';

const App = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGuidelineOpen, setIsGuidelineOpen] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. STATE MANAGEMENT ---
  const [snapshots, setSnapshots] = useState([]); 
  const [membranes, setMembranes] = useState([
    { id: 'espa2ld', name: 'ESPA2-LD', area: 400, aValue: 0.18, rejection: 99.7, type: 'Brackish' },
    { id: 'cpa3', name: 'CPA3', area: 400, aValue: 0.12, rejection: 99.7, type: 'Brackish' },
    { id: 'swc5ld', name: 'SWC5-LD', area: 400, aValue: 0.06, rejection: 99.8, type: 'Seawater' }
  ]); 
  
  const [projectNotes, setProjectNotes] = useState(""); 
  const [waterData, setWaterData] = useState({
    projectName: 'New_Project_V3',
    waterType: 'Well Water',
    temp: 25, ph: 7.5, ca: 60, mg: 20, na: 250, k: 15, 
    hco3: 250, so4: 100, cl: 300, no3: 25, sio2: 20
  });

  const [systemConfig, setSystemConfig] = useState({
    feedFlow: 100, recovery: 75, stage1Vessels: 4, stage2Vessels: 2,
    elementsPerVessel: 6, membraneModel: 'espa2ld', energyCostPerKwh: 0.12 
  });

  const [pretreatment, setPretreatment] = useState({ antiscalantDose: 3.5, sbsDose: 2.0 });
  const [postTreatment, setPostTreatment] = useState({ causticDose: 2.0 });
  
  const [projection, setProjection] = useState({ 
    fluxGFD: 0, pumpPressure: 0, monthlyEnergyCost: 0, permeateFlow: 0 
  });

  // --- 2. MASTER CALCULATION ENGINE ---
  useEffect(() => {
    const activeMem = membranes.find(m => m.id === systemConfig.membraneModel) || membranes[0];
    const totalElements = (Number(systemConfig.stage1Vessels) + Number(systemConfig.stage2Vessels)) * Number(systemConfig.elementsPerVessel);
    const totalArea = totalElements * activeMem.area;
    const feed = Number(systemConfig.feedFlow);
    const rec = Number(systemConfig.recovery) / 100;
    const permeate = feed * rec;
    const TCF = Math.exp(2640 * (1 / 298.15 - 1 / (Number(waterData.temp) + 273.15)));
    const CF = 1 / (1 - rec);
    const flux = (permeate * 10.5) / (totalArea / 400); 

    const tds = (Number(waterData.na) + Number(waterData.cl) + Number(waterData.so4));
    const osmoticP = (tds * CF * 0.76) / 1000; 
    const pumpPressure = (flux / (TCF * activeMem.aValue)) + osmoticP + 1.2;

    const powerKw = (pumpPressure * feed) / (36.7 * 0.75); 
    const monthlyEnergy = powerKw * 24 * 30 * Number(systemConfig.energyCostPerKwh);

    setProjection({
      pumpPressure: pumpPressure.toFixed(1),
      fluxGFD: flux.toFixed(1),
      monthlyEnergyCost: monthlyEnergy.toFixed(2),
      permeateFlow: permeate.toFixed(1),
      tcf: TCF.toFixed(2),
      activeMembrane: activeMem,
      totalElements: totalElements,
      concentrateFlow: (feed - permeate).toFixed(1)
    });
  }, [waterData, systemConfig, membranes]);

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('ro_pro_v3_master_final');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setWaterData(p.waterData);
        setSystemConfig(p.systemConfig);
        setMembranes(p.membranes || membranes);
        setProjectNotes(p.projectNotes || "");
        setSnapshots(p.snapshots || []);
      } catch (e) { console.error("Restore failed", e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { waterData, systemConfig, membranes, snapshots, projectNotes, pretreatment, postTreatment };
      localStorage.setItem('ro_pro_v3_master_final', JSON.stringify(dataToSave));
    }
  }, [waterData, systemConfig, membranes, snapshots, projectNotes, pretreatment, postTreatment, isLoaded]);

  // --- 4. ACTION HANDLERS ---
  const takeSnapshot = () => {
    const name = prompt("Enter snapshot name (e.g. 'Case 1 - Winter'):");
    if (name) {
      const newSnapshot = {
        id: Date.now(),
        name,
        timestamp: new Date().toLocaleTimeString(),
        results: { ...projection },
        config: { ...systemConfig }
      };
      setSnapshots([...snapshots, newSnapshot]);
      alert("Snapshot added to Report tab.");
    }
  };

  const handleReset = () => {
    if (window.confirm("WARNING: This will delete all design data and reset the app. Continue?")) {
      localStorage.removeItem('ro_pro_v3_master_final');
      window.location.reload();
    }
  };

  const handleSaveToFile = () => {
    const data = { waterData, systemConfig, pretreatment, postTreatment, snapshots, projectNotes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${waterData.projectName}_Design.json`;
    link.click();
  };

  const handleLoadFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.waterData) setWaterData(data.waterData);
        if (data.systemConfig) setSystemConfig(data.systemConfig);
        if (data.snapshots) setSnapshots(data.snapshots);
        alert("Success: Design Loaded!");
      } catch (err) { alert("Error: Invalid File Format"); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9', display: 'flex', flexDirection: 'column' }}>
      
      {/* GLOBAL HEADER */}
      <header style={{ backgroundColor: '#002f5d', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>IMSDesign Pro 3.0</h2>
        
        <nav style={{ display: 'flex', gap: '2px' }}>
          {['analysis', 'pretreatment', 'design', 'post', 'report', 'database'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '10px 15px', background: activeTab === t ? '#f39c12' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              {t}
            </button>
          ))}
        </nav>

        {/* RESTORED ACTION GROUP */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={takeSnapshot} style={{ background: '#9b59b6', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>📸 Snapshot</button>
          <button onClick={handleSaveToFile} style={{ background: '#27ae60', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>💾 Save</button>
          <button onClick={() => fileInputRef.current.click()} style={{ background: '#3498db', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>📁 Load</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleLoadFromFile} />
          <button onClick={handleReset} style={{ background: '#e74c3c', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reset</button>
        </div>
      </header>

      <ValidationBanner projection={projection} systemConfig={systemConfig} waterData={waterData} />

      <main style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'analysis' && <WaterAnalysis waterData={waterData} setWaterData={setWaterData} />}
        {activeTab === 'pretreatment' && <PreTreatment waterData={waterData} pretreatment={pretreatment} setPretreatment={setPretreatment} systemConfig={systemConfig} />}
        {activeTab === 'design' && <SystemDesign membranes={membranes} systemConfig={systemConfig} setSystemConfig={setSystemConfig} projection={projection} waterData={waterData} />}
        {activeTab === 'post' && <PostTreatment projection={projection} postTreatment={postTreatment} setPostTreatment={setPostTreatment} systemConfig={systemConfig} />}
        {activeTab === 'report' && (
          <Report 
            waterData={waterData} 
            systemConfig={systemConfig} 
            projection={projection} 
            pretreatment={pretreatment}
            postTreatment={postTreatment}
            projectNotes={projectNotes} 
            setProjectNotes={setProjectNotes} 
            snapshots={snapshots} 
            setSnapshots={setSnapshots}
          />
        )}
        {activeTab === 'database' && <MembraneEditor membranes={membranes} setMembranes={setMembranes} />}
      </main>

      <footer style={{ background: '#fff', borderTop: '1px solid #ddd', padding: '5px 20px', display: 'flex', gap: '20px', fontSize: '0.75rem', color: '#666' }}>
        <span>Project: <strong>{waterData.projectName}</strong></span>
        <span>Active Membrane: <strong>{projection.activeMembrane?.name}</strong></span>
        <span>Temp: <strong>{waterData.temp}°C</strong></span>
      </footer>

      <DesignGuidelines isOpen={isGuidelineOpen} onClose={() => setIsGuidelineOpen(false)} currentWaterType={waterData.waterType} />
    </div>
  );
};

export default App;