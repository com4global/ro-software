import React, { useState, useEffect, useRef } from 'react';
import WaterAnalysis from './components/WaterAnalysis';
import PreTreatment from './components/PreTreatment';
import SystemDesign from './components/SystemDesign';
import PostTreatment from './components/PostTreatment';
import Report from './components/Report';
import MembraneEditor from './components/MembraneEditor';
import initialMembraneData from './membranes.json';

const App = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [showHelp, setShowHelp] = useState(false); // Quick Start Guide State
  const fileInputRef = useRef(null);

  // --- CORE STATE ---
  const [membranes, setMembranes] = useState(initialMembraneData);
  const [waterData, setWaterData] = useState({
    projectName: 'New Project', clientName: 'Standard Client',
    waterType: 'Brackish Well', ca: 80, mg: 30, na: 150, k: 5, ba: 0.05, sr: 0.1, 
    cl: 200, so4: 120, hco3: 180, no3: 2, sio2: 15, temp: 25, ph: 7.2, tds: 582.15
  });
  const [pretreatment, setPretreatment] = useState({ antiscalantDose: 3.5, sbsDose: 2.0, chlorineInlet: 0.5 });
  const [systemConfig, setSystemConfig] = useState({
    feedFlow: 100, recovery: 75, stage1Vessels: 4, stage2Vessels: 2,
    elementsPerVessel: 6, membraneModel: 'espa2', energyCostPerKwh: 0.12 
  });
  const [postTreatment, setPostTreatment] = useState({ causticDose: 0, targetPh: 8.2 });
  const [projectNotes, setProjectNotes] = useState(""); 
  const [projection, setProjection] = useState({ alerts: {} });

  // 1. PERSISTENCE: LOAD
  useEffect(() => {
    const saved = localStorage.getItem('ro_pro_v3_data');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.waterData) setWaterData(p.waterData);
      if (p.pretreatment) setPretreatment(p.pretreatment);
      if (p.systemConfig) setSystemConfig(p.systemConfig);
      if (p.postTreatment) setPostTreatment(p.postTreatment);
      if (p.membranes) setMembranes(p.membranes);
      if (p.projectNotes) setProjectNotes(p.projectNotes);
    } else {
      setShowHelp(true); // Show help for first-time users
    }
    const promoState = localStorage.getItem('promo_hidden');
    if (promoState === 'true') setShowPromo(false);
    setIsLoaded(true);
  }, []);

  // 2. AUTO-SAVE
  useEffect(() => {
    if (isLoaded) {
      const data = { waterData, pretreatment, systemConfig, postTreatment, membranes, projectNotes };
      localStorage.setItem('ro_pro_v3_data', JSON.stringify(data));
    }
  }, [waterData, pretreatment, systemConfig, postTreatment, membranes, projectNotes, isLoaded]);

  // 3. MATH ENGINE (Flux, Power, Scaling)
  useEffect(() => {
    const selectedMembrane = membranes.find(m => m.id === systemConfig.membraneModel) || membranes[0];
    const totalVessels = (systemConfig.stage1Vessels || 0) + (systemConfig.stage2Vessels || 0);
    const totalArea = totalVessels * systemConfig.elementsPerVessel * (selectedMembrane?.area || 400);
    const flux = totalArea > 0 ? (systemConfig.feedFlow * 1000 / (totalArea * 0.0929)) : 0;
    const CF = 1 / (1 - (systemConfig.recovery / 100));

    const silicaLimit = 120 + (waterData.temp - 25) * 2;
    const lsi = (waterData.ph + Math.log10(waterData.tds * CF) - 9.5).toFixed(2);
    const caSo4Saturation = ((waterData.ca * CF * waterData.so4 * CF) / 1000) > 2000;

    const osmoticFactor = waterData.waterType === 'Sea Water' ? 0.00080 : 0.00076;
    const avgOsmotic = (waterData.tds * osmoticFactor) * ((1 + CF) / 2);
    const permeability = selectedMembrane?.type === 'Seawater' ? 0.06 : 0.18;
    const pumpPressure = (flux / (permeability * 10)) + avgOsmotic + 1.2;
    const power = (systemConfig.feedFlow * pumpPressure) / (36 * 0.75);

    setProjection({
      flux: flux.toFixed(1), pumpPressure: pumpPressure.toFixed(2), powerKW: power.toFixed(2),
      dailyCost: (power * 24 * systemConfig.energyCostPerKwh).toFixed(2),
      antiscalantKgDay: ((systemConfig.feedFlow * (pretreatment?.antiscalantDose || 0) * 24) / 1000).toFixed(2),
      sbsKgDay: ((systemConfig.feedFlow * (pretreatment?.sbsDose || 0) * 24) / 1000).toFixed(2),
      alerts: { silica: (waterData.sio2 * CF) > silicaLimit, caSo4: caSo4Saturation, lsi }
    });
  }, [waterData, systemConfig, membranes, pretreatment]);

  // --- ACTIONS ---
  const saveProjectToFile = () => {
    const blob = new Blob([JSON.stringify({ waterData, systemConfig, postTreatment, pretreatment, projectNotes, membranes }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${waterData.projectName}_Design.json`;
    link.click();
  };

  const loadProjectFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      if (json.waterData) setWaterData(json.waterData);
      if (json.systemConfig) setSystemConfig(json.systemConfig);
      // ... (repeat for all other states)
      alert("Project Loaded!");
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* DISMISSIBLE PROMO */}
      {showPromo && (
        <div style={{ backgroundColor: '#f39c12', color: '#fff', textAlign: 'center', padding: '10px', fontSize: '0.9rem', position: 'relative' }}>
          🚀 Visit <a href="https://zenzeecom.vercel.app/" target="_blank" rel="noreferrer" style={{ color: '#fff', fontWeight: 'bold' }}>Zenzeecom</a> for more insights!
          <button onClick={() => { setShowPromo(false); localStorage.setItem('promo_hidden', 'true'); }} style={{ position: 'absolute', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', top: '5px' }}>&times;</button>
        </div>
      )}

      {/* HEADER */}
      <header style={{ backgroundColor: '#002f5d', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>IMSDesign Pro 3.0</h2>
        <nav style={{ display: 'flex', gap: '2px' }}>
          {['analysis', 'pretreatment', 'design', 'post', 'report', 'database'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '10px 15px', border: 'none', background: activeTab === t ? '#f39c12' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', fontSize: '0.8rem' }}>{t.toUpperCase()}</button>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowHelp(true)} style={{ background: '#3498db', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>❓ Help</button>
          <button onClick={() => fileInputRef.current.click()} style={{ background: '#f39c12', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>📂 Load</button>
          <button onClick={saveProjectToFile} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>💾 Save</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={loadProjectFromFile} />
        </div>
      </header>

      {/* QUICK START MODAL */}
      {showHelp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', maxWidth: '600px', lineHeight: '1.6' }}>
            <h2 style={{ color: '#002f5d', marginTop: 0 }}>Welcome to IMSDesign Pro 3.0</h2>
            <p>Follow these steps for a perfect RO design:</p>
            <ul>
              <li><strong>Analysis:</strong> Enter your feed water ions. The app calculates TDS automatically.</li>
              <li><strong>Pre-treatment:</strong> Set chemical doses. SBS is vital for chlorine removal.</li>
              <li><strong>Design:</strong> Arrange your pressure vessels. Watch the <strong>Scaling Alerts</strong> to avoid membrane fouling.</li>
              <li><strong>Database:</strong> Use this to add new membrane models to the system.</li>
              <li><strong>Report:</strong> Add engineering notes and print your submittal to PDF.</li>
            </ul>
            <button onClick={() => setShowHelp(false)} style={{ background: '#002f5d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '20px' }}>Got it, let's build!</button>
          </div>
        </div>
      )}

      <main style={{ padding: '25px' }}>
        {activeTab === 'analysis' && <WaterAnalysis waterData={waterData} setWaterData={setWaterData} />}
        {activeTab === 'pretreatment' && <PreTreatment waterData={waterData} pretreatment={pretreatment} setPretreatment={setPretreatment} projection={projection} />}
        {activeTab === 'design' && <SystemDesign membranes={membranes} systemConfig={systemConfig} setSystemConfig={setSystemConfig} projection={projection} />}
        {activeTab === 'post' && <PostTreatment projection={projection} postTreatment={postTreatment} setPostTreatment={setPostTreatment} />}
        {activeTab === 'report' && <Report waterData={waterData} systemConfig={systemConfig} projection={projection} postTreatment={postTreatment} pretreatment={pretreatment} projectNotes={projectNotes} setProjectNotes={setProjectNotes} />}
        {activeTab === 'database' && <MembraneEditor membranes={membranes} setMembranes={setMembranes} />}
      </main>
    </div>
  );
};

export default App;