import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  loginUser,
  registerUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  fetchCurrentUser,
  updateUserProfile,
  updateUserSettings
} from '../api';

// Create context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Attempt to fetch current user with token
          const userData = await fetchCurrentUser();
          if (userData && userData.data) {
            setCurrentUser(userData.data);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error.message);
        // Clear any invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Handle login
  const login = async (email, password) => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await loginUser({ email, password });
      
      if (result && result.token) {
        // Save token and user data to localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Update current user state
        setCurrentUser(result.user);
        return result;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setAuthError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle register
  const register = async (userData) => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await registerUser(userData);
      
      if (result && result.token) {
        // Save token and user data to localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Update current user state
        setCurrentUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Registration error in context:', error);
      setAuthError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset current user state
    setCurrentUser(null);
  };

  // Handle forgot password - request OTP
  const requestPasswordReset = async (email) => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await forgotPassword(email);
      return result;
    } catch (error) {
      setAuthError(error.message || 'Failed to send reset code');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const verifyResetCode = async (email, otp) => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await verifyOtp({ email, otp });
      return result;
    } catch (error) {
      setAuthError(error.message || 'Invalid verification code');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset with OTP
  const resetUserPassword = async (email, otp, newPassword) => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await resetPassword({ email, otp, newPassword });
      return result;
    } catch (error) {
      setAuthError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await updateUserProfile(profileData);
      
      // Update the current user state with new profile data
      if (result && result.data) {
        setCurrentUser((prevUser) => ({
          ...prevUser,
          ...result.data
        }));
      }
      
      return result;
    } catch (error) {
      setAuthError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user settings
  const updateSettings = async (settingsData) => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await updateUserSettings(settingsData);
      
      // Update current user if settings affect user data
      if (result && result.data) {
        setCurrentUser((prevUser) => ({
          ...prevUser,
          ...result.data
        }));
      }
      
      return result;
    } catch (error) {
      setAuthError(error.message || 'Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const isAdmin = currentUser?.role === 'System Admin';
  const isOrganizer = currentUser?.role === 'Organizer';
  
  const value = {
    currentUser,
    isAdmin,
    isOrganizer,
    loading,
    authError,
    login,
    register,
    logout,
    requestPasswordReset,
    verifyResetCode,
    resetUserPassword,
    updateProfile,
    updateSettings
  };
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;