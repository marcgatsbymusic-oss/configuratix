import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AppAction, hasPermission } from './PermissionMatrix';

interface ProtectedRouteProps {
  requiredAction?: AppAction;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredAction }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // FR-1.1: User with no installation role (or only mobile roles with no back office capability)
  // Temporarily allowing INSTALLER and CREW_LEAD for web testing/inspection
  const hasBackOfficeAccess = user.roles.some(role => 
    ['ADMIN', 'DISPATCHER', 'SUPERVISOR', 'MANAGEMENT', 'CREW_LEAD', 'INSTALLER'].includes(role)
  );

  if (!hasBackOfficeAccess) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <h1 className="page-title">Access Denied</h1>
        <p>You do not have a back office role.</p>
        <button 
          onClick={logout} 
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Logout & Switch Role
        </button>
      </div>
    );
  }

  if (requiredAction && !hasPermission(user.roles, requiredAction)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <h1 className="page-title">Permission Denied</h1>
        <p>You do not have the required permission ({requiredAction}) to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
};
