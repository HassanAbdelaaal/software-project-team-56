const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getUserBookings,
  getUserEvents,
  getEventAnalytics
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Authenticated Users
router.get('/users/profile', protect, getProfile);
router.put('/users/profile', protect, updateProfile);

// Standard User Routes
router.get('/users/bookings', protect, authorize('Standard User'), getUserBookings);

// Organizer Routes - Updated to match the requested paths
router.get('/users/events', protect, authorize('Organizer'), getUserEvents);
router.get('/users/events/analytics', protect, authorize('Organizer'), getEventAnalytics);

// Admin Routes
router.get('/users', protect, authorize('System Admin'), getAllUsers);
router.get('/users/:id', protect, authorize('System Admin'), getUserDetails);
router.put('/users/:id', protect, authorize('System Admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('System Admin'), deleteUser);

module.exports = router;