import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowsePage from './pages/BrowsePage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import DashboardPage from './pages/DashboardPage';
import MyReportsPage from './pages/MyReportsPage';
import MatchesPage from './pages/MatchesPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import NearbyPage from './pages/NearbyPage';
import ClaimsPage from './pages/ClaimsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AdminReportsPage from './pages/AdminReportsPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import AccountStatusPage from './pages/AccountStatusPage';
import CampusAlertsPage from './pages/CampusAlertsPage';
import CampusMapPage from './pages/CampusMapPage';

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const titleMap = {
      '/': 'CampusFind | Campus Lost & Found Portal',
      '/login': 'CampusFind | Student Login',
      '/register': 'CampusFind | Student Registration',
      '/registration-success': 'CampusFind | Registration Submitted',
      '/account-status': 'CampusFind | Account Status',
      '/dashboard': 'CampusFind | Dashboard',
      '/browse': 'CampusFind | Browse Items',
      '/report-lost': 'CampusFind | Report Lost Item',
      '/report-found': 'CampusFind | Report Found Item',
      '/my-reports': 'CampusFind | My Reports',
      '/matches': 'CampusFind | Potential Matches',
      '/claims': 'CampusFind | Claims & Recovery',
      '/messages': 'CampusFind | Messages',
      '/notifications': 'CampusFind | Notifications',
      '/campus-alerts': 'CampusFind | Campus Alerts',
      '/campus-map': 'CampusFind | Campus Map',
      '/profile': 'CampusFind | Student Profile',
      '/admin': 'CampusFind | Admin Dashboard',
      '/admin/dashboard': 'CampusFind | Admin Dashboard',
      '/admin/reports': 'CampusFind | Admin Reports',
      '/admin/students': 'CampusFind | Student Directory',
      '/admin/student-approvals': 'CampusFind | Student Approvals',
      '/admin/alerts': 'CampusFind | Campus Alerts',
      '/admin/analytics': 'CampusFind | Campus Analytics',
      '/admin/locations': 'CampusFind | Campus Locations',
      '/admin/audit-logs': 'CampusFind | Audit Logs',
      '/admin/system-status': 'CampusFind | System & Deployment Diagnostics',
      '/admin/audit': 'CampusFind | Audit Logs',
      '/admin/fraud': 'CampusFind | Fraud Detection',
    };

    if (titleMap[pathname]) {
      document.title = titleMap[pathname];
    } else if (pathname.startsWith('/items/')) {
      document.title = 'CampusFind | Item Details';
    } else if (pathname.startsWith('/matches/')) {
      document.title = 'CampusFind | Match Details';
    } else {
      document.title = 'CampusFind | Campus Lost & Found Portal';
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <PageTitleUpdater />
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public & Student Accessible Pages */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/registration-success" element={<RegistrationSuccessPage />} />
                  <Route path="/account-status" element={<AccountStatusPage />} />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/nearby" element={<NearbyPage />} />
                  <Route path="/campus-map" element={<CampusMapPage />} />
                  <Route path="/campus-alerts" element={<CampusAlertsPage />} />
                  <Route path="/items/:id" element={<ItemDetailsPage />} />

                  {/* Protected User Pages */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-reports"
                    element={
                      <ProtectedRoute>
                        <MyReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report-lost"
                    element={
                      <ProtectedRoute>
                        <ReportLostPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report-found"
                    element={
                      <ProtectedRoute>
                        <ReportFoundPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches"
                    element={
                      <ProtectedRoute>
                        <MatchesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches/:id"
                    element={
                      <ProtectedRoute>
                        <MatchDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/claims"
                    element={
                      <ProtectedRoute>
                        <ClaimsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Only Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="DASHBOARD" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="DASHBOARD" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="USERS" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/students"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="STUDENTS" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/student-approvals"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="STUDENT_APPROVALS" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/alerts"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="ALERTS" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="ANALYTICS" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/locations"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="LOCATIONS" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit-logs"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="AUDIT" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/system-status"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="SYSTEM_STATUS" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="AUDIT" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/fraud"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPage defaultTab="FRAUD" />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
