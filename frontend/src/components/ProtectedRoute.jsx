import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If requiredRole is specified, check if user has the required role
  if (requiredRole) {
    const hasRequiredRole = 
      requiredRole === 'admin' ? isAdmin : 
      currentUser.role === requiredRole;

    if (!hasRequiredRole) {
      // Redirect non-admin users trying to access admin routes to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;