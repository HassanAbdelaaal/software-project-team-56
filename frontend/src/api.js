import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1',
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
    // Change to POST /forgetPassword/verify
    const response = await api.post('/forgetPassword/verify', otpData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPasswordWithOTP = async (resetData) => {
  try {
    const response = await api.put('/forgetPassword/reset', resetData);
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

/* ------------------------- */
/* Events endpoints          */
/* ------------------------- */

export const fetchEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

// Alias for getEventById to match our new EventDetails component
export const fetchEventById = getEventById;

export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const fetchMyEvents = async () => {
  try {
    const response = await api.get('/events/user/my-events');
    return response.data;
  } catch (error) {
    console.error('Error fetching my events:', error);
    throw error;
  }
};

export const getEventAnalytics = async () => {
  try {
    const response = await api.get('/events/organizer/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// New function for purchasing tickets - wrapper around createBooking for consistency with EventDetails component
export const purchaseTickets = async (eventId, purchaseData) => {
  try {
    // Adapt the existing createBooking function for ticket purchases
    const bookingData = {
      eventId,
      numberOfTickets: purchaseData.ticketCount,
      ...purchaseData
    };
    return await createBooking(bookingData);
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    throw error;
  }
};


/* ------------------------- */
/* User Management endpoints */
/* ------------------------- */

export const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/users/${userId}`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Add these functions to your existing api.js file

/* ------------------------- */
/* Admin Event Management    */
/* ------------------------- */

export const fetchAllEvents = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/events/all?${queryString}` : '/events/all';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
};

export const approveEvent = async (eventId, status) => {
  try {
    const response = await api.put(`/events/${eventId}/approve`, { status });
    return response.data;
  } catch (error) {
    console.error('Error approving/updating event:', error);
    throw error;
  }
};

/* ------------------------- */
/* Admin Stats (Optional)    */
/* ------------------------- */

export const fetchAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};




export default api;