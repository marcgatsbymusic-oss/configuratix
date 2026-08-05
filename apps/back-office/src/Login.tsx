import React from 'react';
import { useAuth } from './AuthContext';
import type { AppRole } from './PermissionMatrix';
import { useNavigate } from 'react-router-dom';

const roles: AppRole[] = [
  'ADMIN',
  'DISPATCHER',
  'SUPERVISOR',
  'MANAGEMENT',
  'CREW_LEAD',
  'INSTALLER',
];

export const Login: React.FC = () => {
  const { loginAs, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<AppRole>('ADMIN');
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'marc.truekalia@gmail.com' && password === 'STQ1234!*!') {
      loginAs(role);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">System Login</h1>
        <p className="login-subtitle">
          Please enter your credentials to access the system.
        </p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          <div className="input-field">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
            />
          </div>
          <div className="input-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>
          <div className="input-field">
            <label>Role</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value as AppRole)} 
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</div>}
          <button type="submit" className="btn" style={{ marginTop: '0.5rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
