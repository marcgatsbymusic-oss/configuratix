import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'Daniel Keller',
    email: 'daniel.kellermartinez@csem.ch',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'ADMIN' } }]
  },
  {
    id: 'user-dispatcher',
    name: 'Daniel Keller (Dispatcher)',
    email: 'daniel.kellermartinez+dispatcher@csem.ch',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'DISPATCHER' } }]
  },
  {
    id: 'user-supervisor',
    name: 'Daniel Keller (Supervisor)',
    email: 'daniel.kellermartinez+supervisor@csem.ch',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'SUPERVISOR' } }]
  },
  {
    id: 'user-management',
    name: 'Daniel Keller (Management)',
    email: 'daniel.kellermartinez+management@csem.ch',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'MANAGEMENT' } }]
  },
  {
    id: 'user-crewlead',
    name: 'Daniel Keller (Crew Lead)',
    email: 'daniel.kellermartinez+crewlead@csem.ch',
    status: 'ACTIVE',
    roleAssignments: [{ role: { name: 'CREW_LEAD' } }]
  },
  {
    id: 'user-installer',
    name: 'Daniel Keller (Installer)',
    email: 'daniel.kellermartinez+installer@csem.ch',
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/identity/users', {
        headers: {
          'x-mock-role': token || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          localStorage.setItem('backoffice_users', JSON.stringify(data.users));
          return;
        }
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to localStorage/mock users:", e);
    }

    // Fallback to localStorage or defaults
    const local = localStorage.getItem('backoffice_users');
    if (local) {
      setUsers(JSON.parse(local));
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem('backoffice_users', JSON.stringify(DEFAULT_USERS));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      status: 'ACTIVE',
      roleAssignments: [{ role: { name: role } }]
    };

    // 1. Save locally
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('backoffice_users', JSON.stringify(updatedUsers));
    setEmail('');
    setName('');

    // 2. Try posting to backend
    try {
      await fetch('http://localhost:3001/api/identity/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': token || ''
        },
        body: JSON.stringify({ email, name, roleName: role })
      });
    } catch (e) {
      console.warn("Backend offline, user saved only locally:", e);
    }
  };

  const handleToggleSuspend = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('backoffice_users', JSON.stringify(updatedUsers));
  };

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
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
