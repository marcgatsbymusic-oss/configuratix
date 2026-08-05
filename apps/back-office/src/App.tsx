import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Login } from './Login';
import { Layout } from './Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { AppAction } from './PermissionMatrix';
import { Dashboard } from './pages/Dashboard';
import { UserAdmin } from './pages/UserAdmin';
import { DeliveryReconciliation } from './pages/DeliveryReconciliation';
import { LabelsPrint } from './pages/LabelsPrint';

import { Orders } from './pages/Orders';

const AuditLog = () => <div><h1 className="page-title">Audit Log</h1><p className="text-muted">Audit log viewer with filtering by actor, action type and date range goes here.</p></div>;
const Overrides = () => <div><h1 className="page-title">Overrides</h1><p className="text-muted">Manual override approval screen.</p></div>;
const Analytics = () => <div><h1 className="page-title">Analytics</h1><p className="text-muted">Management analytics across jobs.</p></div>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              
              {/* Role-gated routes */}
              <Route element={<ProtectedRoute requiredAction={AppAction.MANAGE_USERS_ROLES} />}>
                <Route path="/users" element={<UserAdmin />} />
                <Route path="/audit" element={<AuditLog />} />
              </Route>

              <Route element={<ProtectedRoute requiredAction={AppAction.IMPORT_ORDERS_CREATE_JOBS} />}>
                <Route path="/orders" element={<Orders />} />
              </Route>

              <Route element={<ProtectedRoute requiredAction={AppAction.GENERATE_QR_LABELS} />}>
                <Route path="/labels" element={<LabelsPrint />} />
              </Route>

              <Route element={<ProtectedRoute requiredAction={AppAction.APPROVE_OVERRIDES} />}>
                <Route path="/overrides" element={<Overrides />} />
              </Route>

              <Route element={<ProtectedRoute requiredAction={AppAction.RESOLVE_DISCREPANCIES} />}>
                <Route path="/discrepancies" element={<DeliveryReconciliation />} />
              </Route>

              <Route element={<ProtectedRoute requiredAction={AppAction.VIEW_ANALYTICS} />}>
                <Route path="/analytics" element={<Analytics />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
