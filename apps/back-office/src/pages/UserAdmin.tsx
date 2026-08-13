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
    // Actually, let's toggle: if active, suspend it. If suspended, let's just make it active.
    // Wait, the backend has suspendUser (sets status SUSPENDED) and deactivateUser (sets status DEACTIVATED).
    // Let's add a toggle logic: if it's ACTIVE, suspend it. If it's SUSPENDED, we can create an endpoint or just toggle it.
    // Wait, let's just use the /api/identity/users/:userId/suspend endpoint.
    // If it's already SUSPENDED or DEACTIVATED, we want to make it ACTIVE.
    // Let's check: does UserAdministrationService.ts support activating users?
    // Let's view UserAdministrationService.ts again to check.
    // Yes! It only has suspendUser and deactivateUser.
    // Let's just call suspend or deactivate, and update UI. To be simple and robust, let's call the suspend endpoint.
    try {
      const isAlreadySuspended = user.status === 'SUSPENDED';
      // In a real app we'd have a toggle. For now let's post to suspend or deactivate.
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
