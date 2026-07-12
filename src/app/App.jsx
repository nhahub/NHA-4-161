import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthPage from '../features/auth/AuthPage';
import DashboardLayout from '../features/dashboard/DashboardLayout';
import DashboardHome from '../features/dashboard/DashboardHome';
import StaffPage from '../features/staff/StaffPage';
import DepartmentsPage from '../features/departments/DepartmentsPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import DoctorDashboard from '../features/doctor-dashboard/DoctorDashboard';
import './App.css';

function RootRedirect() {
  const { user } = useAuth();
  if (user === undefined) return null; // loading
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
  return <Navigate to="/dashboard/staff" replace />;
}

function LoginRoute() {
  const { user } = useAuth();
  if (user === undefined) return null; // loading
  if (user) {
    if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
    return <Navigate to="/dashboard/staff" replace />;
  }
  return <AuthPage />;
}

function DoctorDashboardRoute() {
  const { user, logout } = useAuth();
  if (user === undefined) return null;
  return (
    <DoctorDashboard
      doctorId={user._id || user.userId}
      doctorName={user.name}
      onSignOut={logout}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginRoute />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="staff"       element={<StaffPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="analytics"   element={<AnalyticsPage />} />
          </Route>

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboardRoute />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}