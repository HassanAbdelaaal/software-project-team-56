const express = require('express');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getMyEvents,
  getEventAnalytics,
} = require('../controllers/eventController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Public routes
router.route('/').get(getEvents);
router.route('/:id').get(getEvent);

// Protected routes - require authentication
router.use(protect);

// Routes for authenticated users
router.route('/user/my-events').get(getMyEvents);
router.route('/').post(createEvent);
router.route('/organizer/analytics').get(getEventAnalytics);
router.route('/:id').put(updateEvent).delete(deleteEvent);
router.route('/:id/approve').put(approveEvent);

module.exports = router;