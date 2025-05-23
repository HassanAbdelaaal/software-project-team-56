import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventsPage from './pages/EventsPage';
import EventDetails from './pages/EventDetails'; // Added EventDetails import
import EventForm from './pages/organizer/EventForm';
import EventAnalytics from './pages/organizer/EventAnalytics';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Auth Context Provider
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetails />} /> {/* Added Event Details Route */}
              
              {/* Protected Routes - Regular Users */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } />

              {/* Organizer Routes */}
              <Route path="/organizer/events/new" element={
                <ProtectedRoute>
                  <EventForm />
                </ProtectedRoute>
              } />
              <Route path="/organizer/events/:eventId/edit" element={
                <ProtectedRoute>
                  <EventForm />
                </ProtectedRoute>
              } />
              <Route path="/organizer/analytics" element={
                <ProtectedRoute>
                  <EventAnalytics />
                </ProtectedRoute>
              } />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/events" />} />
            </Routes>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;