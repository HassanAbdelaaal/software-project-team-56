const express = require('express');
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getBooking,
  confirmBooking,
  cancelBooking,
  deleteBooking,
  checkAvailability,
  getMyBookings  // Added this import
} = require('../controllers/bookingController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Public routes
router.get('/check-availability/:eventId', checkAvailability);

// Protected routes
router.post('/', protect, createBooking);
router.get('/:id', protect, getBooking);
router.put('/:id/confirm', protect, authorize('System Admin'), confirmBooking);
router.put('/:id/cancel', protect, cancelBooking);

// This route should come BEFORE the '/' route to prevent conflicts
router.get('/my', protect, getMyBookings);

// Admin routes
router.get('/', protect, authorize('System Admin'), getAllBookings);
router.delete('/:id', protect, authorize('System Admin'), deleteBooking);

module.exports = router;