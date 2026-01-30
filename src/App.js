import React, { useState, useEffect, useRef } from 'react';
import WaterAnalysis from './components/WaterAnalysis';
import PreTreatment from './components/PreTreatment';
import SystemDesign from './components/SystemDesign';
import PostTreatment from './components/PostTreatment';
import Report from './components/Report';
import MembraneEditor from './components/MembraneEditor';
import DesignGuidelines from './components/DesignGuidelines';

const App = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGuidelineOpen, setIsGuidelineOpen] = useState(false);
  const fileInputRef = useRef(null);

  // --- ALL STATES PRESERVED ---
  const [snapshots, setSnapshots] = useState([]); 
  const [membranes, setMembranes] = useState([]); // Assuming this loads from your JSON
  const [projectNotes, setProjectNotes] = useState(""); 
  const [waterData, setWaterData] = useState({
    projectName: 'New_Project', // Default name to prevent "undefined"
    waterType: 'Municipal Waste (Treated)',
    temp: 25, ph: 7.5, ca: 60, mg: 20, na: 250, k: 15, ba: 0.01, sr: 0.05, 
    hco3: 250, so4: 100, cl: 300, no3: 25, sio2: 20
  });
  const [pretreatment, setPretreatment] = useState({ antiscalantDose: 3.5, sbsDose: 2.0, chlorineInlet: 0.5 });
  const [systemConfig, setSystemConfig] = useState({
    feedFlow: 100, recovery: 75, stage1Vessels: 4, stage2Vessels: 2,
    elementsPerVessel: 6, membraneModel: 'espa2', energyCostPerKwh: 0.12 
  });
  const [postTreatment, setPostTreatment] = useState({ causticDose: 2.0, targetPh: 8.2 });
  const [projection, setProjection] = useState({ alerts: {}, fluxGFD: 0, pumpPressure: 0, monthlyEnergyCost: 0 });

  // 1. Persistence & Math Logic
  useEffect(() => {
    const saved = localStorage.getItem('ro_pro_master_v3');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.waterData) setWaterData(p.waterData);
        if (p.systemConfig) setSystemConfig(p.systemConfig);
        if (p.snapshots) setSnapshots(p.snapshots);
      } catch (e) { console.error("Load error", e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ro_pro_master_v3', JSON.stringify({ waterData, pretreatment, systemConfig, postTreatment, snapshots, projectNotes }));
    }
  }, [waterData, pretreatment, systemConfig, postTreatment, snapshots, projectNotes, isLoaded]);

  // 2. Persistence Handlers (SAVE & LOAD)
  const handleSave = () => {
    const data = { waterData, pretreatment, systemConfig, postTreatment, snapshots, projectNotes };
    const fileName = (waterData.projectName || "RO_Design").replace(/\s+/g, '_');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
  };

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.waterData) setWaterData(data.waterData);
        if (data.systemConfig) setSystemConfig(data.systemConfig);
        alert("Project Loaded!");
      } catch (err) { alert("Invalid File Format"); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9' }}>
      {/* HEADER WITH ALL BUTTONS IN THE CIRCLED AREA */}
      <header style={{ backgroundColor: '#002f5d', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>IMSDesign Pro 3.0</h2>
        
        <nav style={{ display: 'flex', gap: '5px' }}>
          {['analysis', 'pretreatment', 'design', 'post', 'report', 'database'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '10px', background: activeTab === t ? '#f39c12' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsGuidelineOpen(true)} style={{ background: '#5bc0de', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Guidelines</button>
          <button onClick={handleSave} style={{ background: '#27ae60', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>💾 Save</button>
          <button onClick={() => fileInputRef.current.click()} style={{ background: '#3498db', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>📁 Load</button>
          <input type="file" ref={fileInputRef} onChange={handleLoad} style={{ display: 'none' }} />
          <button onClick={() => setSnapshots([...snapshots, { name: prompt("Name:"), config: systemConfig }])} style={{ background: '#9b59b6', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>📸 Snapshot</button>
          <button onClick={() => window.location.reload()} style={{ background: '#e74c3c', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        {activeTab === 'analysis' && <WaterAnalysis waterData={waterData} setWaterData={setWaterData} />}
        {activeTab === 'pretreatment' && <PreTreatment waterData={waterData} pretreatment={pretreatment} setPretreatment={setPretreatment} projection={projection} />}
        {activeTab === 'design' && <SystemDesign membranes={membranes} systemConfig={systemConfig} setSystemConfig={setSystemConfig} projection={projection} snapshots={snapshots} />}
        {activeTab === 'post' && <PostTreatment projection={projection} postTreatment={postTreatment} setPostTreatment={setPostTreatment} />}
        {activeTab === 'report' && <Report waterData={waterData} systemConfig={systemConfig} projection={projection} snapshots={snapshots} />}
        {activeTab === 'database' && <MembraneEditor membranes={membranes} setMembranes={setMembranes} />}
      </main>

      {/* GUIDELINES MODAL */}
      <DesignGuidelines isOpen={isGuidelineOpen} onClose={() => setIsGuidelineOpen(false)} currentWaterType={waterData.waterType} />
    </div>
  );
};

export default App;