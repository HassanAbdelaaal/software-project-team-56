import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network Error: Unable to connect to server',
        status: 0
      });
    }
    
    const originalRequest = error.config;
    
    // Handle token expiration/invalid token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Format the error for consistent handling
    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

/* ------------------------- */
/* Authentication endpoints  */
/* ------------------------- */

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgetPassword/request', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (otpData) => {
  try {
    const response = await api.post('/auth/forgotPassword/verify', otpData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPasswordWithOTP = async (resetData) => {
  try {
    const response = await api.put('/forgetPassword/request', resetData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// For backward compatibility with existing code
export const resetPassword = resetPasswordWithOTP;

export const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fixed cancel booking function
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
};

export const fetchMyBookings = async () => {
  try {
    const response = await api.get('/bookings/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const updateUserSettings = async (settings) => {
  try {
    const response = await api.put('/users/settings', settings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;