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

// Create a separate router section specifically for organizer routes
// Place these BEFORE any routes with :id parameters
router.get('/organizer/events', protect, authorize('Organizer'), getUserEvents);
router.get('/organizer/analytics', protect, authorize('Organizer'), getEventAnalytics);

// Standard User Routes
router.get('/users/bookings', protect, authorize('Standard User'), getUserBookings);

// Admin Routes
router.get('/users', protect, authorize('System Admin'), getAllUsers);
router.get('/users/:id', protect, authorize('System Admin'), getUserDetails);
router.put('/users/:id', protect, authorize('System Admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('System Admin'), deleteUser);

module.exports = router;