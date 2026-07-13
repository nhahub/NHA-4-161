import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import RolePlaceholder from '../components/RolePlaceholder';
import AuthPage from '../features/auth/AuthPage';
import DashboardLayout from '../features/dashboard/DashboardLayout';
import DashboardHome from '../features/dashboard/DashboardHome';
import StaffPage from '../features/staff/StaffPage';
import DepartmentsPage from '../features/departments/DepartmentsPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import DoctorDashboard from '../features/doctor-dashboard/DoctorDashboard';
import PatientDashboard from '../features/patient-dashboard/PatientDashboard';
import './App.css';

function RootRedirect() {
  const { user } = useAuth();
  if (user === undefined) return null; // loading
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
  if (user.role === 'patient') return <Navigate to="/patient-dashboard" replace />;
  if (user.role === 'receptionist') return <Navigate to="/receptionist-dashboard" replace />;
  return <Navigate to="/dashboard/staff" replace />;
}

function LoginRoute() {
  const { user } = useAuth();
  if (user === undefined) return null; // loading
  if (user) {
    if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
    if (user.role === 'patient') return <Navigate to="/patient-dashboard" replace />;
    if (user.role === 'receptionist') return <Navigate to="/receptionist-dashboard" replace />;
    return <Navigate to="/dashboard/staff" replace />;
  }
  return <AuthPage />;
}

function DoctorDashboardRoute() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (user === undefined) return null;

  async function handleSignOut() {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
    navigate('/login');
  }

  return (
    <DoctorDashboard
      doctorId={user._id || user.userId}
      doctorName={user.name}
      onSignOut={handleSignOut}
    />
  );
}

function PatientDashboardRoute() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (user === undefined) return null;

  async function handleSignOut() {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
    navigate('/login');
  }

  return (
    <PatientDashboard
      patientId={user._id || user.userId}
      patientName={user.name}
      onSignOut={handleSignOut}
    />
  );
}
function ReceptionistDashboardRoute() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (user === undefined) return null;

  async function handleSignOut() {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
    navigate('/login');
  }

  return (
    <RolePlaceholder
      role={user.role}
      name={user.name}
      onSignOut={handleSignOut}
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

          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboardRoute />
              </ProtectedRoute>
            }
          />

          <Route
            path="/receptionist-dashboard"
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionistDashboardRoute />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}