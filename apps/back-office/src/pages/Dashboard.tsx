import React from 'react';
import { useAuth } from '../AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isInstaller = user?.roles.includes('INSTALLER') || user?.roles.includes('CREW_LEAD');

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="page-title">Dashboard</h1>
      {isInstaller ? (
        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Installer Workspace</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            The installer execution steps, checklist, evidence photo uploads, and customer signature pads are designed for mobile devices.
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            You can access the simulated web version of the Installer Checklist and steps at:
          </p>
          <a 
            href="https://configuratix.vercel.app/installer" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            Open Web Installer Dashboard
          </a>
        </div>
      ) : (
        <p>Welcome to the Installation Execution Back Office.</p>
      )}
    </div>
  );
};
