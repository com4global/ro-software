import React, { useState } from 'react';

const MembraneEditor = ({ membranes, setMembranes }) => {
  const [newMembrane, setNewMembrane] = useState({ 
    id: '', 
    name: '', 
    area: 400, 
    aValue: 0.16, // Added: Permeability coefficient
    rejection: 99.7, // Added: Salt rejection %
    type: 'Brackish' 
  });

  // Industry Standard Defaults for seeding
  const seedLibrary = () => {
    const defaults = [
      { id: 'espa2ld', name: 'ESPA2-LD', area: 400, aValue: 0.18, rejection: 99.7, type: 'Brackish' },
      { id: 'cpa3', name: 'CPA3', area: 400, aValue: 0.12, rejection: 99.7, type: 'Brackish' },
      { id: 'swc5ld', name: 'SWC5-LD', area: 400, aValue: 0.06, rejection: 99.8, type: 'Seawater' }
    ];
    setMembranes(defaults);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMembrane.id || !newMembrane.name) {
      alert("Please provide both an ID and a Model Name.");
      return;
    }
    
    if (membranes.find(m => m.id === newMembrane.id)) {
      alert("A membrane with this ID already exists.");
      return;
    }

    setMembranes([...membranes, newMembrane]);
    setNewMembrane({ id: '', name: '', area: 400, aValue: 0.16, rejection: 99.7, type: 'Brackish' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this membrane?")) {
      setMembranes(membranes.filter(m => m.id !== id));
    }
  };

  const cardStyle = { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' };
  const thStyle = { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#666', fontSize: '0.85rem' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid #eee', fontSize: '0.9rem' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>Membrane Database Editor</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Manage physical specifications for hydraulic calculations.</p>
        </div>
        {membranes.length === 0 && (
          <button onClick={seedLibrary} style={{ padding: '10px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            ⚡ Load Standard Library
          </button>
        )}
      </div>

      {/* ADD NEW MEMBRANE FORM */}
      
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: '#004a80', fontSize: '1rem' }}>Add New Membrane Model</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Unique ID</label>
            <input 
              placeholder="swc5" 
              value={newMembrane.id} 
              onChange={e => setNewMembrane({...newMembrane, id: e.target.value.toLowerCase().replace(/\s/g, '')})} 
              style={inputStyle} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Model Name</label>
            <input 
              placeholder="SWC5-LD" 
              value={newMembrane.name} 
              onChange={e => setNewMembrane({...newMembrane, name: e.target.value})} 
              style={inputStyle} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Area ($ft^2$)</label>
            <input 
              type="number" 
              value={newMembrane.area} 
              onChange={e => setNewMembrane({...newMembrane, area: parseFloat(e.target.value) || 0})} 
              style={{ ...inputStyle, maxWidth: '90px' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>A-Value</label>
            <input 
              type="number" 
              step="0.01"
              value={newMembrane.aValue} 
              onChange={e => setNewMembrane({...newMembrane, aValue: parseFloat(e.target.value) || 0})} 
              style={{ ...inputStyle, maxWidth: '90px' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Type</label>
            <select 
              value={newMembrane.type} 
              onChange={e => setNewMembrane({...newMembrane, type: e.target.value})} 
              style={{ ...inputStyle, padding: '9px' }}
            >
              <option value="Brackish">Brackish</option>
              <option value="Seawater">Seawater</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '10px 25px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '40px' }}>
            Add Element
          </button>
        </form>
      </div>

      {/* DATABASE TABLE */}
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Model</th>
              <th style={thStyle}>Area ($ft^2$)</th>
              <th style={thStyle}>A-Value (Perm)</th>
              <th style={thStyle}>Nom. Rej (%)</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {membranes.map(m => (
              <tr key={m.id}>
                <td style={tdStyle}><code>{m.id}</code></td>
                <td style={tdStyle}><strong>{m.name}</strong></td>
                <td style={tdStyle}>{m.area}</td>
                <td style={tdStyle}>{m.aValue}</td>
                <td style={tdStyle}>{m.rejection}%</td>
                <td style={tdStyle}>
                   <span style={{ 
                     padding: '2px 8px', 
                     borderRadius: '12px', 
                     fontSize: '0.7rem', 
                     background: m.type === 'Seawater' ? '#ebf5ff' : '#f0fff4',
                     color: m.type === 'Seawater' ? '#004a80' : '#27ae60'
                   }}>
                     {m.type}
                   </span>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembraneEditor;