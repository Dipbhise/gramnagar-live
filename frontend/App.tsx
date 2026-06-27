
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import OrganizationSelect from './pages/auth/OrganizationSelect';
import RoleSelect from './pages/auth/RoleSelect';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard';
import MyComplaints from './pages/citizen/MyComplaints';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import ComplaintDetails from './pages/citizen/ComplaintDetails';
import CitizenSchemes from './pages/citizen/Schemes';
import CitizenMyTaxes from './pages/citizen/MyTaxes';
import CitizenCertificates from './pages/citizen/Certificates';
import CertificateApplicationForm from './pages/citizen/CertificateApplicationForm';
import CitizenCertificateApplicationDetail from './pages/citizen/CertificateApplicationDetail';
import CitizenNotifications from './pages/citizen/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminWorkers from './pages/admin/Workers';
import AdminComplaints from './pages/admin/Complaints';
import AdminSchemes from './pages/admin/Schemes';
import AdminTaxManagement from './pages/admin/Taxes';
import AdminCertificates from './pages/admin/Certificates';
import CertificateApplicationDetail from './pages/admin/CertificateApplicationDetail';
import AdminNotifications from './pages/admin/Notifications';
// Worker Pages
import WorkerOverview from './pages/worker/Overview';
import WorkerTasks from './pages/worker/Tasks';
import WorkerHistory from './pages/worker/History';
// General
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<OrganizationSelect />} />
          <Route path="/auth/organization" element={<OrganizationSelect />} />
          <Route path="/auth/role" element={<RoleSelect />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Citizen Routes */}
          <Route element={<ProtectedRoute roles={[UserRole.CITIZEN]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/citizen/complaints" element={<MyComplaints />} />
              <Route path="/citizen/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/citizen/submit" element={<SubmitComplaint />} />
              <Route path="/citizen/taxes" element={<CitizenMyTaxes />} />
              <Route path="/schemes" element={<CitizenSchemes />} />
              <Route path="/citizen/certificates" element={<CitizenCertificates />} />
              <Route path="/citizen/certificates/apply/:typeId" element={<CertificateApplicationForm />} />
              <Route path="/citizen/certificates/application/:applicationId" element={<CitizenCertificateApplicationDetail />} />
              <Route path="/citizen/notifications" element={<CitizenNotifications />} />
            </Route>
          </Route>


          {/* Worker Routes */}
          <Route element={<ProtectedRoute roles={[UserRole.WORKER]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/worker" element={<WorkerOverview />} />
              <Route path="/worker/tasks" element={<WorkerTasks />} />
              <Route path="/worker/history" element={<WorkerHistory />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute roles={[UserRole.ADMIN]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/workers" element={<AdminWorkers />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              <Route path="/admin/schemes" element={<AdminSchemes />} />
              <Route path="/admin/taxes" element={<AdminTaxManagement />} />
              <Route path="/admin/certificates" element={<AdminCertificates />} />
              <Route path="/admin/certificates/:applicationId" element={<CertificateApplicationDetail />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </Route>
          </Route>

          {/* Default Redirects */}
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center text-red-500 font-bold">Unauthorized Access</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
