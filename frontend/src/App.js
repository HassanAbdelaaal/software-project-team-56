import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventsPage from './pages/EventsPage';
import EventDetails from './pages/EventDetails'; // Added EventDetails import
import EventForm from './pages/organizer/EventForm';
import EventAnalytics from './pages/organizer/EventAnalytics';
import MyEvents from './pages/organizer/MyEvents';
import BookingDetails from './pages/BookingDetails'; // Added BookingDetails import

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
import Footer from './components/Footer'; // Added Footer import

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app min-h-screen flex flex-col">
          <Navbar />
          <div className="content flex-grow">
            <Routes>
              {/* Default Route - Always show EventsPage first */}
              <Route path="/" element={<EventsPage />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ForgotPassword />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetails />} />
              
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
              
              {/* Add BookingDetails route */}
              <Route path="/bookings/:bookingId" element={
                <ProtectedRoute>
                  <BookingDetails />
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
              <Route path="/organizer/my-events" element={
                <ProtectedRoute>
                  <MyEvents />
                </ProtectedRoute>
              } />
              <Route path="/organizer/analytics" element={
                <ProtectedRoute>
                  <EventAnalytics />
                </ProtectedRoute>
              } />

              {/* Catch all route - redirect any unknown routes to events */}
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Routes>
          </div>
          <Footer /> {/* Added Footer component */}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;