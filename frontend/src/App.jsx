import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuthPage from './pages/AuthPage';
import AIMatchPage from './pages/AIMatchPage';

// ─── Auth-Protected Route wrapper ───────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard if wrong role
    const redirectMap = { student: '/', organizer: '/organizer', admin: '/admin' };
    return <Navigate to={redirectMap[role] || '/'} replace />;
  }

  return children;
}

// ─── App Shell (with Navbar + Sidebar + Footer) ──────────────────
function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F8FAFD', fontFamily: "'Inter', sans-serif" }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
            <Route
              path="/ai-match"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AIMatchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public login route — full screen, no shell */}
            <Route path="/login" element={<AuthPage />} />
            {/* Legacy /auth redirect */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            {/* All other routes via AppShell */}
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
