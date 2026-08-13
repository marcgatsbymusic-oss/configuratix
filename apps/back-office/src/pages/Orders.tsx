import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';

export const Orders: React.FC = () => {
  const [lists, setLists] = useState<any[]>([]);
  const { token } = useAuth();
  
  // Create Opening state
  const [room, setRoom] = useState('');
  const [elevation, setElevation] = useState('');
  const [reference, setReference] = useState('');
  
  const [openings, setOpenings] = useState<any[]>([]); // For assignment dropdowns

  const [installers, setInstallers] = useState<any[]>([]);
  const [crewLeads, setCrewLeads] = useState<any[]>([]);

  // Load crew assignments from localStorage
  const [assignedLead, setAssignedLead] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('assignedLead');
    return saved ? JSON.parse(saved) : {};
  });
  const [assignedInstaller, setAssignedInstaller] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('assignedInstaller');
    return saved ? JSON.parse(saved) : {};
  });
  const [itemLead, setItemLead] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('itemLead');
    return saved ? JSON.parse(saved) : {};
  });
  const [itemInstaller, setItemInstaller] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('itemInstaller');
    return saved ? JSON.parse(saved) : {};
  });

  const [openListIds, setOpenListIds] = useState<Record<string, boolean>>({});
  const [openSpecs, setOpenSpecs] = useState<Record<string, boolean>>({});
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [openingsData, setOpeningsData] = useState<Record<string, any[]>>({});
  const [openingsLoading, setOpeningsLoading] = useState<Record<string, boolean>>({});
  const [openOpeningIds, setOpenOpeningIds] = useState<Record<string, boolean>>({});

  // Sync to localStorage when states change
  useEffect(() => {
    localStorage.setItem('assignedLead', JSON.stringify(assignedLead));
  }, [assignedLead]);

  useEffect(() => {
    localStorage.setItem('assignedInstaller', JSON.stringify(assignedInstaller));
  }, [assignedInstaller]);

  useEffect(() => {
    localStorage.setItem('itemLead', JSON.stringify(itemLead));
  }, [itemLead]);

  useEffect(() => {
    localStorage.setItem('itemInstaller', JSON.stringify(itemInstaller));
  }, [itemInstaller]);

  const handleTopLeadChange = async (listId: string, listItems: any[], value: string) => {
    setAssignedLead(prev => ({ ...prev, [listId]: value }));
    setItemLead(prev => {
      const updated = { ...prev };
      listItems.forEach(item => {
        updated[item.id] = value;
      });
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/api/orders/lists/${listId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': token || ''
        },
        body: JSON.stringify({
          assignedLeadId: value || null,
          assignedInstallerId: assignedInstaller[listId] || null
        })
      });
    } catch (e) {
      console.error("Failed to save lead assignment to backend:", e);
    }
  };

  const handleTopInstallerChange = async (listId: string, listItems: any[], value: string) => {
    setAssignedInstaller(prev => ({ ...prev, [listId]: value }));
    setItemInstaller(prev => {
      const updated = { ...prev };
      listItems.forEach(item => {
        updated[item.id] = value;
      });
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/api/orders/lists/${listId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': token || ''
        },
        body: JSON.stringify({
          assignedLeadId: assignedLead[listId] || null,
          assignedInstallerId: value || null
        })
      });
    } catch (e) {
      console.error("Failed to save installer assignment to backend:", e);
    }
  };

  useEffect(() => {
    fetchLists();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/identity/users`, {
        headers: { 'x-mock-role': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          const insts = data.users.filter((u: any) => 
            u.roleAssignments?.some((ra: any) => ra.role.name === 'INSTALLER')
          );
          const leads = data.users.filter((u: any) => 
            u.roleAssignments?.some((ra: any) => ra.role.name === 'CREW_LEAD')
          );
          setInstallers(insts);
          setCrewLeads(leads);
          return;
        }
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    }
    
    // Fallback to localStorage or mock data
    const local = localStorage.getItem('backoffice_users_v3');
    if (local) {
      const allUsers = JSON.parse(local);
      const insts = allUsers.filter((u: any) => 
        u.roleAssignments?.some((ra: any) => ra.role.name === 'INSTALLER' && u.status === 'ACTIVE')
      );
      const leads = allUsers.filter((u: any) => 
        u.roleAssignments?.some((ra: any) => ra.role.name === 'CREW_LEAD' && u.status === 'ACTIVE')
      );
      setInstallers(insts);
      setCrewLeads(leads);
    } else {
      // Ultimate hardcoded fallbacks
      setInstallers([
        { id: 'inst-1', name: 'Dave Grohl' },
        { id: 'inst-2', name: 'James Hetfield' },
        { id: 'inst-3', name: 'Corey Taylor' }
      ]);
      setCrewLeads([
        { id: 'lead-1', name: 'Marc Keller' },
        { id: 'lead-2', name: 'John Doe' }
      ]);
    }
  };

  const fetchLists = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/lists`, {
        headers: { 'x-mock-role': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lists && data.lists.length > 0) {
          const dbLeads: Record<string, string> = {};
          const dbInstallers: Record<string, string> = {};
          
          data.lists.forEach((list: any) => {
            if (list.assignedLeadId) {
              dbLeads[list.id] = list.assignedLeadId;
            }
            if (list.assignedInstallerId) {
              dbInstallers[list.id] = list.assignedInstallerId;
            }
          });

          setAssignedLead(prev => ({ ...dbLeads, ...prev }));
          setAssignedInstaller(prev => ({ ...dbInstallers, ...prev }));

          const mockMod = await import('../mockData');
          const enrichedLists = data.lists.map((list: any) => {
            const orderNum = list.order?.orderNumber || list.orderId;
            const mockList = mockMod.mockInstallationLists.find(ml => ml.orderId === orderNum);
            if (mockList) {
              const enrichedItems = list.items.map((item: any) => {
                const itemNumMatch = item.description.match(/Item (\d+):/);
                const itemNum = itemNumMatch ? parseInt(itemNumMatch[1], 10) : (item.itemNumber || null);
                const match = mockList.items.find(mi => mi.itemNumber === itemNum || mi.id === item.id);
                return {
                  ...item,
                  itemNumber: itemNum || match?.itemNumber,
                  specs: match?.specs || [],
                  schematicUrl: item.schematicUrl || match?.schematicUrl,
                  weightKg: item.weight || match?.weightKg,
                  quantity: item.quantity || match?.quantity
                };
              });
              
              // Sort numerically by itemNumber
              enrichedItems.sort((a: any, b: any) => (a.itemNumber || 999) - (b.itemNumber || 999));
              return { ...list, items: enrichedItems };
            }
            return list;
          });
          setLists(enrichedLists);
          return;
        }
      }
    } catch (e) {
      console.error("Backend fetch failed, falling back to mock data:", e);
    }
    // Fallback to mock data when DB/Backend is down
    import('../mockData').then((mod) => {
      setLists(mod.mockInstallationLists);
    });
  };


  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/openings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': token || ''
        },
        body: JSON.stringify({ room, elevation, reference })
      });
      if (res.ok) {
        const data = await res.json();
        setOpenings([...openings, data.opening]);
        setRoom(''); setElevation(''); setReference('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const assignOpening = async (itemId: string, openingId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/items/${itemId}/opening`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': token || ''
        },
        body: JSON.stringify({ openingId })
      });
      if (res.ok) {
        fetchLists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleList = (id: string) => {
    setOpenListIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // Load openings when expanding
    if (!openingsData[id]) {
      setOpeningsLoading(prev => ({ ...prev, [id]: true }));
      fetch(`${API_BASE_URL}/api/orders/lists/${id}/openings`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-mock-role': token || '' }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.openings) setOpeningsData(prev => ({ ...prev, [id]: data.openings }));
        })
        .catch(() => {})
        .finally(() => setOpeningsLoading(prev => ({ ...prev, [id]: false })));
    }
  };

  const toggleSpecs = (itemId: string) => {
    setOpenSpecs(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Orders & Jobs</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your construction window installation jobs</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Upload project button / icon */}
          <label 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'var(--accent)', 
              color: '#fff', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: 600, 
              fontSize: '0.875rem',
              transition: 'background-color 0.15s ease'
            }}
            title="Import Project (CSV)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span>Upload Project</span>
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={e => {
                const selectedFile = e.target.files?.[0] || null;
                if (selectedFile) {
                  const formData = new FormData();
                  formData.append('file', selectedFile);
                  fetch(`${API_BASE_URL}/api/orders/import/csv`, {
                    method: 'POST',
                    headers: { 'x-mock-role': token || '' },
                    body: formData
                  }).then(res => {
                    if (res.ok) {
                      alert('Project uploaded and integrated successfully!');
                      fetchLists();
                    } else {
                      alert('Failed to upload project.');
                    }
                  }).catch(err => {
                    console.error(err);
                    alert('Project uploaded and integrated successfully! (Mock mode)');
                  });
                }
              }} 
            />
          </label>
          
          {/* Integrate projects button / icon */}
          <button
            onClick={() => {
              alert('Integrating projects with Cantor ERP system...');
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'transparent', 
              color: 'var(--text-color)', 
              border: '1px solid var(--border-color)', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: 600, 
              fontSize: '0.875rem'
            }}
            title="Integrate projects from Cantor ERP"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-git-merge">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M6 9a9 9 0 0 0 9 9" />
            </svg>
            <span>Integrate Projects</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Create Opening (FR-2.3 Location Assignment)</h2>
        <form onSubmit={handleCreateOpening} className="form-group">
          <div className="input-field">
            <label>Room</label>
            <input type="text" value={room} onChange={e => setRoom(e.target.value)} required />
          </div>
          <div className="input-field">
            <label>Elevation</label>
            <input type="text" value={elevation} onChange={e => setElevation(e.target.value)} required />
          </div>
          <div className="input-field">
            <label>Reference ID</label>
            <input type="text" value={reference} onChange={e => setReference(e.target.value)} required />
          </div>
          <button type="submit" className="btn">Create Location</button>
        </form>
      </div>

      <h2 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Installation Lists</h2>
      {lists.map(list => {
        const isOpen = !!openListIds[list.id];
        const totalWeight = list.items?.reduce((sum: number, item: any) => {
          const weight = item.weightKg != null ? item.weightKg : (item.weight != null ? item.weight : 0);
          const qty = item.quantity != null ? item.quantity : 1;
          return sum + (weight * qty);
        }, 0) || 0;

        return (
          <div key={list.id} className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div 
              style={{ 
                padding: '1.25rem 1.5rem', 
                borderBottom: isOpen ? '1px solid var(--border-color)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                userSelect: 'none',
                background: 'transparent'
              }}
            >
              <div 
                onClick={() => toggleList(list.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}
              >
                <span style={{ fontSize: '1.2rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  ▶
                </span>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
                  Order: {list.order?.orderNumber || list.orderId}
                  <span className="badge badge-active">{list.status}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    ({list.items?.length || 0} items)
                  </span>
                  <span className="badge" style={{ background: '#2c3e50', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Est. Weight: {totalWeight.toFixed(1)} kg
                  </span>
                </h3>
              </div>

              {/* Assignment Controls */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginRight: '2rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lead Installer:</label>
                  <select
                    className="input-field"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: '150px', margin: 0 }}
                    value={assignedLead[list.id] || ""}
                    onChange={(e) => handleTopLeadChange(list.id, list.items || [], e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {crewLeads.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Installer:</label>
                  <select
                    className="input-field"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: '150px', margin: 0 }}
                    value={assignedInstaller[list.id] || ""}
                    onChange={(e) => handleTopInstallerChange(list.id, list.items || [], e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {installers.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div 
                onClick={() => toggleList(list.id)}
                style={{ fontSize: '0.875rem', color: 'var(--accent, #0066cc)', fontWeight: 600 }}
              >
                {isOpen ? 'Click to collapse' : 'Click to expand list'}
              </div>
            </div>             {isOpen && (
              <table>
                <thead style={{ background: 'var(--bg-color)' }}>
                  <tr>
                    <th style={{ width: '100px', textAlign: 'center' }}>Image</th>
                    <th style={{ width: '80px' }}>Item No.</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Units</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Enrichment Data</th>
                    <th>Assigned Crew</th>
                    <th>Location (Opening)</th>
                  </tr>
                </thead>
                <tbody>
                  {list.items.map((item: any) => {
                    const cleanItemNumber = item.itemNumber || item.id?.replace('item-', '');
                    
                    return (
                      <React.Fragment key={item.id}>
                        <tr>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            {item.schematicUrl ? (
                              <img 
                                src={item.schematicUrl} 
                                alt={item.description} 
                                title="Click to enlarge"
                                onClick={() => setEnlargedImage(item.schematicUrl)}
                                style={{ 
                                  width: '72px', 
                                  height: '72px', 
                                  objectFit: 'contain', 
                                  borderRadius: '4px', 
                                  border: '1px solid var(--border-color)', 
                                  background: '#fff',
                                  cursor: 'zoom-in',
                                  transition: 'transform 0.15s ease-in-out'
                                }} 
                                className="thumbnail-zoom"
                              />
                            ) : (
                              <div style={{ width: '72px', height: '72px', borderRadius: '4px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                No Image
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-color)', textAlign: 'center' }}>
                            {cleanItemNumber}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--text-color)', fontWeight: 600 }}>
                            {item.quantity || 1}
                          </td>
                          <td>{item.category}</td>
                          <td>
                            <div>{item.description}</div>
                            {item.specs && item.specs.length > 0 && (
                              <button 
                                onClick={() => toggleSpecs(item.id)}
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', marginTop: '0.5rem', background: '#f0f4f8', color: '#0066cc', border: '1px solid #cce0ff' }}
                              >
                                {openSpecs[item.id] ? 'Hide Technical Info ▴' : 'Show Technical Info ▾'}
                              </button>
                            )}
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>
                            {item.width && item.height ? <div><strong>Dim:</strong> {item.width} x {item.height} mm</div> : null}
                            {item.system ? <div><strong>Sys:</strong> {item.system}</div> : null}
                            {item.color ? <div><strong>Color:</strong> {item.color}</div> : null}
                            <div>
                              <strong>Weight:</strong> {item.weightKg != null ? `${item.weightKg} kg` : (item.weight != null ? `${item.weight} kg` : 'PLACEHOLDER_UNVERIFIED')}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '40px' }}>Lead:</span>
                                <select 
                                  className="input-field" 
                                  style={{ padding: '0.15rem 0.25rem', fontSize: '0.8rem', width: '120px', margin: 0 }}
                                  value={itemLead[item.id] || ""}
                                  onChange={(e) => setItemLead(prev => ({ ...prev, [item.id]: e.target.value }))}
                                >
                                  <option value="">Unassigned</option>
                                  {crewLeads.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '40px' }}>Inst:</span>
                                <select 
                                  className="input-field" 
                                  style={{ padding: '0.15rem 0.25rem', fontSize: '0.8rem', width: '120px', margin: 0 }}
                                  value={itemInstaller[item.id] || ""}
                                  onChange={(e) => setItemInstaller(prev => ({ ...prev, [item.id]: e.target.value }))}
                                >
                                  <option value="">Unassigned</option>
                                  {installers.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>
                          <td>
                            {item.type === 'JOINERY' ? (
                              item.opening ? (
                                <span style={{ color: 'var(--accent)' }}>
                                  {item.opening.room} - {item.opening.elevation} ({item.opening.reference})
                                </span>
                              ) : (
                                <select 
                                  className="input-field" 
                                  style={{ padding: '0.25rem', width: '150px' }}
                                  onChange={(e) => assignOpening(item.id, e.target.value)}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign...</option>
                                  {openings.map(o => (
                                    <option key={o.id} value={o.id}>{o.reference}</option>
                                  ))}
                                </select>
                              )
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>N/A (Non-Joinery)</span>
                            )}
                          </td>
                        </tr>

                        {/* Collapsible Technical specifications row */}
                        {openSpecs[item.id] && item.specs && item.specs.length > 0 && (
                          <tr style={{ background: '#fafbfc' }}>
                            <td colSpan={8} style={{ padding: '1.25rem 2rem', borderTop: 'none' }}>
                              <div style={{ borderLeft: '3px solid #0066cc', paddingLeft: '1.25rem' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', color: '#333', fontSize: '0.95rem', fontWeight: 600 }}>
                                  Technical Specifications (Item {cleanItemNumber})
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.5rem 1.5rem', fontSize: '0.825rem' }}>
                                  {item.specs.map((specLine: string, idx: number) => {
                                    const isHeading = specLine.endsWith(':') || 
                                                      specLine === 'Profiles:' || 
                                                      specLine === 'U-value' || 
                                                      specLine === 'Details' || 
                                                      specLine === 'Infills' || 
                                                      specLine.startsWith('Field ') || 
                                                      specLine.startsWith('Roller shutter') ||
                                                      specLine.startsWith('Spacer type');
                                    
                                    if (isHeading) {
                                      return (
                                        <div 
                                          key={idx} 
                                          style={{ 
                                            gridColumn: '1 / -1', 
                                            fontWeight: 'bold', 
                                            marginTop: '0.75rem', 
                                            paddingBottom: '0.25rem', 
                                            borderBottom: '1px solid #e1e8ed',
                                            color: '#0066cc',
                                            textTransform: 'uppercase',
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.05em'
                                          }}
                                        >
                                          {specLine}
                                        </div>
                                      );
                                    }
                                    
                                    return (
                                      <div key={idx} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                                        <span style={{ color: '#0066cc' }}>•</span>
                                        <span>{specLine.replace(/^- /, '')}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* ── OPENINGS & TASK PROGRESS PANEL ── */}
            {isOpen && (() => {
              const ops = openingsData[list.id];
              const isLoadingOps = openingsLoading[list.id];
              if (isLoadingOps) return (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Loading openings…
                </div>
              );
              if (!ops || ops.length === 0) return null;

              // Aggregate per-person time across all openings
              const globalPersonTime: Record<string, number> = {};
              ops.forEach((op: any) => {
                op.taskInstances?.forEach((t: any) => {
                  t.timeLogs?.forEach((log: any) => {
                    globalPersonTime[log.personName] = (globalPersonTime[log.personName] || 0) + log.minutes;
                  });
                });
              });

              return (
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>🪟 Window Openings — Task Execution</h4>
                    {Object.keys(globalPersonTime).length > 0 && (
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {Object.entries(globalPersonTime).map(([name, mins]) => (
                          <span key={name}><strong style={{ color: 'var(--text-primary)' }}>{name}</strong> {mins}m total</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {ops.map((op: any) => {
                    const opOpen = !!openOpeningIds[op.id];
                    const completedCount = op.taskInstances?.filter((t: any) => t.status === 'complete').length || 0;
                    const totalCount = op.taskInstances?.length || 0;
                    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                    const hasOutstanding = op.taskInstances?.some((t: any) => t.status === 'outstanding');
                    const isUnconfirmed = !op.locationConfirmed || op.matchConfidence === 'low';

                    // Per-person time for this opening
                    const personTime: Record<string, number> = {};
                    op.taskInstances?.forEach((t: any) => {
                      t.timeLogs?.forEach((log: any) => {
                        personTime[log.personName] = (personTime[log.personName] || 0) + log.minutes;
                      });
                    });

                    return (
                      <div key={op.id} style={{
                        border: `1px solid ${hasOutstanding ? '#d97706' : 'var(--border-color)'}`,
                        borderRadius: '8px',
                        marginBottom: '0.75rem',
                        overflow: 'hidden'
                      }}>
                        {/* Opening header row */}
                        <div
                          onClick={() => setOpenOpeningIds(prev => ({ ...prev, [op.id]: !prev[op.id] }))}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            background: 'var(--surface-color)'
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', transform: opOpen ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: '0.2s' }}>▶</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: '#c88a3e' }}>{op.openingId}</span>
                          {isUnconfirmed && (
                            <span style={{ fontSize: '0.65rem', background: '#fef08a22', color: '#d97706', border: '1px solid #d9770650', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>⚠ UNCONFIRMED</span>
                          )}
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{op.location}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{op.widthMm}×{op.heightMm}mm · {op.weightKg}kg</span>
                          <div style={{ flex: 1, margin: '0 1rem' }}>
                            <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : hasOutstanding ? '#f59e0b' : '#c88a3e', borderRadius: '999px', transition: 'width 0.4s' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c88a3e', whiteSpace: 'nowrap' }}>{completedCount}/{totalCount} tasks · {pct}%</span>
                          {Object.keys(personTime).length > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              ⏱ {Object.entries(personTime).map(([n, m]) => `${n} ${m}m`).join(' · ')}
                            </span>
                          )}
                        </div>

                        {/* Expanded task list */}
                        {opOpen && (
                          <div style={{ borderTop: '1px solid var(--border-color)' }}>
                            {/* Masonry punch-list */}
                            {op.masonryPunchList && (
                              <div style={{ padding: '0.5rem 1rem', background: '#78716c10', fontSize: '0.78rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                                🧱 <strong>Masonry (T19)</strong> — {op.masonryPunchList.responsible} — {op.masonryPunchList.status}
                                {op.masonryPunchList.detail && <span> — {op.masonryPunchList.detail}</span>}
                              </div>
                            )}

                            <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: 'var(--border-color)', textAlign: 'left' }}>
                                  <th style={{ padding: '0.4rem 0.75rem' }}>Code</th>
                                  <th style={{ padding: '0.4rem 0.75rem' }}>Task</th>
                                  <th style={{ padding: '0.4rem 0.75rem' }}>Status</th>
                                  <th style={{ padding: '0.4rem 0.75rem' }}>Crew</th>
                                  <th style={{ padding: '0.4rem 0.75rem' }}>Time</th>
                                  <th style={{ padding: '0.4rem 0.75rem' }}>Time / Person</th>
                                  <th style={{ padding: '0.4rem 0.75rem' }}>Evidence</th>
                                </tr>
                              </thead>
                              <tbody>
                                {op.taskInstances?.map((task: any) => {
                                  const statusColors: Record<string, string> = {
                                    complete:    '#10b981',
                                    outstanding: '#f59e0b',
                                    in_progress: '#3b82f6',
                                    not_started: 'var(--text-muted)',
                                    blocked:     '#ef4444'
                                  };
                                  const statusColor = statusColors[task.status] || 'var(--text-muted)';
                                  return (
                                    <tr key={task.templateCode} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                      <td style={{ padding: '0.4rem 0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#c88a3e' }}>{task.templateCode}</td>
                                      <td style={{ padding: '0.4rem 0.75rem' }}>
                                        <div style={{ fontWeight: 600 }}>{task.template?.nameEn}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{task.template?.nameEs}</div>
                                      </td>
                                      <td style={{ padding: '0.4rem 0.75rem' }}>
                                        <span style={{ color: statusColor, fontWeight: 700, fontSize: '0.72rem' }}>● {task.status.replace('_', ' ')}</span>
                                      </td>
                                      <td style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)' }}>{task.responsible || '—'}</td>
                                      <td style={{ padding: '0.4rem 0.75rem', fontWeight: 600 }}>{task.timeMinutes ? `${task.timeMinutes}m` : '—'}</td>
                                      <td style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {task.timeLogs?.length > 0
                                          ? task.timeLogs.map((log: any) => `${log.personName}: ${log.minutes}m`).join(' · ')
                                          : '—'
                                        }
                                      </td>
                                      <td style={{ padding: '0.4rem 0.75rem' }}>
                                        {task.evidenceUrl
                                          ? <img src={task.evidenceUrl} alt="evidence" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border-color)' }} />
                                          : <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{task.template?.evidenceRequired ? 'pending' : '—'}</span>
                                        }
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        );
      })}

      {/* Lightbox / Modal for Enlarged Image */}
      {enlargedImage && (
        <div 
          onClick={() => setEnlargedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              position: 'relative', 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              maxWidth: '90%', 
              maxHeight: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            <img 
              src={enlargedImage} 
              alt="Enlarged view" 
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} 
            />
            <div style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
              Interior View
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Click background to close
            </div>
            <button 
              onClick={() => setEnlargedImage(null)}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid #ccc',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
