import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationToast from './components/NotificationToast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import CreateJob from './pages/CreateJob';
import Applications from './pages/Applications';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return children;
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      {/* Swap navbar based on route */}
      {window.location.pathname.startsWith('/admin') ? <AdminNavbar /> : <Navbar />}
      <NotificationToast />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard'} replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard'} replace /> : <Register />
        } />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Admin Routes (placed before catch-all) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />

        {/* Protected Student Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="applications" element={<Applications />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Protected Recruiter Routes */}
        <Route path="/recruiter/*" element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <Routes>
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="create-job" element={<CreateJob />} />
              <Route path="jobs/:id/applications" element={<Applications />} />
              <Route path="applications" element={<Applications />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// App Component with Providers
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AdminAuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
