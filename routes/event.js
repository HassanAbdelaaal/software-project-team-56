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
  getAllEvents,
} = require('../controllers/eventController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Public routes
router.route('/').get(getEvents);

// Protected routes - require authentication
router.use(protect);

// Admin route - check if user is admin in the controller instead
router.route('/all').get(getAllEvents);

// Routes for authenticated users
router.route('/user/my-events').get(getMyEvents);
router.route('/').post(createEvent);
router.route('/organizer/analytics').get(getEventAnalytics);

// Put wildcard routes last
router.route('/:id').get(getEvent).put(updateEvent).delete(deleteEvent);
router.route('/:id/approve').put(approveEvent);

module.exports = router;