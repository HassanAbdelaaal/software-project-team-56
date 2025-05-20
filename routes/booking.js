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
  getMyBookings
} = require('../controllers/bookingController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Public routes
router.get('/check-availability/:eventId', checkAvailability);

// Protected routes - Specific routes first
router.get('/my', protect, getMyBookings);  // This route MUST come before '/:id'

// Routes with path parameters
router.post('/', protect, createBooking);
router.get('/:id', protect, getBooking);
router.put('/:id/confirm', protect, authorize('System Admin'), confirmBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/', protect, authorize('System Admin'), getAllBookings);
router.delete('/:id', protect, authorize('System Admin'), deleteBooking);

module.exports = router;