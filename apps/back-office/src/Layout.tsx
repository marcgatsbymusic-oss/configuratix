import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AppAction, hasPermission } from './PermissionMatrix';
import { Users, FileText, QrCode, ClipboardList, CheckCircle, AlertTriangle, BarChart, LogOut, ExternalLink } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          Insta-Exec BO
        </div>
        
        <div className="nav-links">
          <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" className="nav-link">
            <ExternalLink className="w-5 h-5" />
            e-portal
          </a>
          {hasPermission(user.roles, AppAction.MANAGE_USERS_ROLES) && (
            <Link to="/users" className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}>
              <Users className="w-5 h-5" />
              User Admin
            </Link>
          )}
          {hasPermission(user.roles, AppAction.MANAGE_USERS_ROLES) && (
            <Link to="/audit" className={`nav-link ${location.pathname === '/audit' ? 'active' : ''}`}>
              <FileText className="w-5 h-5" />
              Audit Log
            </Link>
          )}
          {hasPermission(user.roles, AppAction.IMPORT_ORDERS_CREATE_JOBS) && (
            <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
              <ClipboardList className="w-5 h-5" />
              Orders & Jobs
            </Link>
          )}
          {hasPermission(user.roles, AppAction.GENERATE_QR_LABELS) && (
            <Link to="/labels" className={`nav-link ${location.pathname === '/labels' ? 'active' : ''}`}>
              <QrCode className="w-5 h-5" />
              QR Labels
            </Link>
          )}
          {hasPermission(user.roles, AppAction.APPROVE_OVERRIDES) && (
            <Link to="/overrides" className={`nav-link ${location.pathname === '/overrides' ? 'active' : ''}`}>
              <CheckCircle className="w-5 h-5" />
              Overrides
            </Link>
          )}
          {hasPermission(user.roles, AppAction.RESOLVE_DISCREPANCIES) && (
            <Link to="/discrepancies" className={`nav-link ${location.pathname === '/discrepancies' ? 'active' : ''}`}>
              <AlertTriangle className="w-5 h-5" />
              Discrepancies
            </Link>
          )}
          {hasPermission(user.roles, AppAction.VIEW_ANALYTICS) && (
            <Link to="/analytics" className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}>
              <BarChart className="w-5 h-5" />
              Analytics
            </Link>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.roles.join(', ')}</span>
          </div>
          <button onClick={logout} className="btn-icon">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};
