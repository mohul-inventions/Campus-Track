import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public & Student Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import SearchPage from './pages/SearchPage';
import MatchesPage from './pages/MatchesPage';
import MyReportsPage from './pages/MyReportsPage';
import ClaimsPage from './pages/ClaimsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminLostItemsPage from './pages/admin/AdminLostItemsPage';
import AdminFoundItemsPage from './pages/admin/AdminFoundItemsPage';
import AdminMatchesPage from './pages/admin/AdminMatchesPage';
import AdminClaimsPage from './pages/admin/AdminClaimsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-mono">Verifying credentials...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Admin Route Wrapper
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-mono">Verifying admin rights...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Do not show sidebar on Landing Page, Login, Register, or Admin Login
  const hideSidebar = ['/', '/login', '/register', '/admin/login'].includes(location.pathname);
  const showSidebar = isAuthenticated && !hideSidebar;

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 selection:bg-gold-500/30 selection:text-gold-300">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:pl-64' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Student Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/report-lost" element={<ProtectedRoute><ReportLostPage /></ProtectedRoute>} />
              <Route path="/report-found" element={<ProtectedRoute><ReportFoundPage /></ProtectedRoute>} />
              <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
              <Route path="/my-reports" element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
              <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin Protected Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/students" element={<AdminRoute><AdminStudentsPage /></AdminRoute>} />
              <Route path="/admin/lost-items" element={<AdminRoute><AdminLostItemsPage /></AdminRoute>} />
              <Route path="/admin/found-items" element={<AdminRoute><AdminFoundItemsPage /></AdminRoute>} />
              <Route path="/admin/matches" element={<AdminRoute><AdminMatchesPage /></AdminRoute>} />
              <Route path="/admin/claims" element={<AdminRoute><AdminClaimsPage /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MainLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
