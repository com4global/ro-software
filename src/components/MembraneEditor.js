import React, { useState } from 'react';

const MembraneEditor = ({ membranes, setMembranes }) => {
  const [newMembrane, setNewMembrane] = useState({ 
    id: '', 
    name: '', 
    area: 400, 
    type: 'Brackish' 
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMembrane.id || !newMembrane.name) {
      alert("Please provide both an ID and a Model Name.");
      return;
    }
    
    // Check for duplicates
    if (membranes.find(m => m.id === newMembrane.id)) {
      alert("A membrane with this ID already exists.");
      return;
    }

    setMembranes([...membranes, newMembrane]);
    setNewMembrane({ id: '', name: '', area: 400, type: 'Brackish' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this membrane from your database?")) {
      setMembranes(membranes.filter(m => m.id !== id));
    }
  };

  const cardStyle = { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 };
  const thStyle = { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#666' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid #eee' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50' }}>Membrane Database Editor</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Add new membrane specifications here. These will immediately appear in your <strong>System Design</strong> dropdown.
      </p>

      {/* ADD NEW MEMBRANE FORM */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: '#004a80' }}>Add New Membrane Model</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            placeholder="ID (e.g., swc5)" 
            value={newMembrane.id} 
            onChange={e => setNewMembrane({...newMembrane, id: e.target.value.toLowerCase().replace(/\s/g, '')})} 
            style={inputStyle} 
          />
          <input 
            placeholder="Full Name (e.g., SWC5-LD)" 
            value={newMembrane.name} 
            onChange={e => setNewMembrane({...newMembrane, name: e.target.value})} 
            style={inputStyle} 
          />
          <input 
            type="number" 
            placeholder="Area (ft²)" 
            value={newMembrane.area} 
            onChange={e => setNewMembrane({...newMembrane, area: parseFloat(e.target.value) || 0})} 
            style={{ ...inputStyle, maxWidth: '100px' }} 
          />
          <select 
            value={newMembrane.type} 
            onChange={e => setNewMembrane({...newMembrane, type: e.target.value})} 
            style={inputStyle}
          >
            <option value="Brackish">Brackish</option>
            <option value="Seawater">Seawater</option>
          </select>
          <button type="submit" style={{ padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add Element
          </button>
        </form>
      </div>

      {/* DATABASE TABLE */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: '#004a80' }}>Current Library</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Model</th>
              <th style={thStyle}>Area (ft²)</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {membranes.map(m => (
              <tr key={m.id}>
                <td style={tdStyle}><code>{m.id}</code></td>
                <td style={tdStyle}>{m.name}</td>
                <td style={tdStyle}>{m.area}</td>
                <td style={tdStyle}>
                   <span style={{ 
                     padding: '2px 8px', 
                     borderRadius: '12px', 
                     fontSize: '0.75rem', 
                     background: m.type === 'Seawater' ? '#ebf5ff' : '#f0fff4',
                     color: m.type === 'Seawater' ? '#004a80' : '#27ae60'
                   }}>
                     {m.type}
                   </span>
                </td>
                <td style={tdStyle}>
                  <button 
                    onClick={() => handleDelete(m.id)} 
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
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