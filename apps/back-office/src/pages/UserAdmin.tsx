import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';

const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'Marc Keller',
    email: 'marc.truekalia@gmail.com',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'ADMIN' } }]
  },
  {
    id: 'user-dispatcher',
    name: 'Marc Keller (Dispatcher)',
    email: 'marc.truekalia+dispatcher@gmail.com',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'DISPATCHER' } }]
  },
  {
    id: 'user-supervisor',
    name: 'Marc Keller (Supervisor)',
    email: 'marc.truekalia+supervisor@gmail.com',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'SUPERVISOR' } }]
  },
  {
    id: 'user-management',
    name: 'Marc Keller (Management)',
    email: 'marc.truekalia+management@gmail.com',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'MANAGEMENT' } }]
  },
  {
    id: 'user-crewlead',
    name: 'Marc Keller (Crew Lead)',
    email: 'marc.truekalia+crewlead@gmail.com',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'CREW_LEAD' } }]
  },
  {
    id: 'user-installer',
    name: 'Marc Keller (Installer)',
    email: 'marc.truekalia+installer@gmail.com',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'INSTALLER' } }]
  }
];

export const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const { token } = useAuth();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('INSTALLER');

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/identity/users`, {
        headers: {
          'x-mock-role': token || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          localStorage.setItem('backoffice_users_v3', JSON.stringify(data.users));
          return;
        }
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to localStorage/mock users:", e);
    }

    // Fallback to localStorage or defaults
    const local = localStorage.getItem('backoffice_users_v3');
    if (local) {
      setUsers(JSON.parse(local));
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem('backoffice_users_v3', JSON.stringify(DEFAULT_USERS));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/identity/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': token || ''
        },
        body: JSON.stringify({ email, name, roleName: role })
      });
      if (res.ok) {
        setEmail('');
        setName('');
        fetchUsers();
      } else {
        const err = await res.json();
        alert(`Failed to create user: ${err.error}`);
      }
    } catch (e) {
      alert("Backend connection failed. Cannot create user.");
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    try {
      const isAlreadySuspended = user.status === 'SUSPENDED';
      const action = isAlreadySuspended ? 'deactivate' : 'suspend';
      const res = await fetch(`${API_BASE_URL}/api/identity/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'x-mock-role': token || ''
        }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(`Failed to update status: ${err.error}`);
      }
    } catch (e) {
      alert("Backend connection failed. Cannot update user status.");
    }
  };

  const handleSystemGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let generated = '';
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(generated);
  };

  const handleSavePassword = async () => {
    if (!selectedUser) return;
    setIsSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/identity/users/${selectedUser.id}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': token || ''
        },
        body: JSON.stringify({ password: tempPassword })
      });
      if (res.ok) {
        fetchUsers();
        setSelectedUser(null);
      } else {
        const err = await res.json();
        alert(`Failed to save password: ${err.error}`);
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to local updates:", e);
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          return { ...u, password: tempPassword };
        }
        return u;
      });
      setUsers(updatedUsers);
      localStorage.setItem('backoffice_users_v3', JSON.stringify(updatedUsers));
      setSelectedUser(null);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const currentUserInState = selectedUser ? users.find(usr => usr.id === selectedUser.id) : null;
  const currentPassword = currentUserInState?.password;

  return (
    <div>
      <h1 className="page-title">User Administration</h1>
      
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Invite New User</h2>
        <form onSubmit={handleCreate} className="form-group">
          <div className="input-field">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-field">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="ADMIN">ADMIN</option>
              <option value="DISPATCHER">DISPATCHER</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="MANAGEMENT">MANAGEMENT</option>
              <option value="CREW_LEAD">CREW_LEAD</option>
              <option value="INSTALLER">INSTALLER</option>
            </select>
          </div>
          <button type="submit" className="btn">Invite User</button>
        </form>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Passwords are not set here. The user will receive an invite email.
        </p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead style={{ background: 'var(--bg-color)' }}>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Roles</th>
              <th>PW</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  {u.roleAssignments?.map((ra: any) => ra.role.name).join(', ')}
                </td>
                <td>
                  <button 
                    onClick={() => {
                      setSelectedUser(u);
                      setTempPassword(u.password || '');
                    }}
                    className="btn-icon"
                    title="Manage Password"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleSuspend(u.id)}
                    className={u.status === 'ACTIVE' ? 'text-danger' : 'text-success'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div 
          onClick={() => setSelectedUser(null)}
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
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'var(--bg-panel)', 
              padding: '2rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              width: '100%',
              maxWidth: '450px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Password Management: {selectedUser.name}
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Current Password
              </label>
              <div style={{ 
                background: 'var(--bg-color)', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                border: '1px solid var(--border-color)', 
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                color: currentPassword ? 'var(--text-main)' : 'var(--text-muted)'
              }}>
                {currentPassword ? currentPassword : 'No password set'}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                New Password
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={tempPassword} 
                  onChange={e => setTempPassword(e.target.value)} 
                  placeholder="Enter password manually..."
                  style={{ 
                    flex: 1,
                    background: 'var(--bg-color)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-main)', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '4px', 
                    outline: 'none' 
                  }}
                />
                <button 
                  onClick={handleSystemGeneratePassword}
                  className="btn" 
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                >
                  System Generate
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button 
                onClick={() => setSelectedUser(null)}
                className="btn-icon" 
                style={{ border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePassword}
                disabled={isSavingPassword}
                className="btn" 
                style={{ padding: '0.5rem 1.25rem' }}
              >
                {isSavingPassword ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
