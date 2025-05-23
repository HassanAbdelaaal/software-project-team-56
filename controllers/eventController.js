const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/v1/events
// @access  Private (Organizers only)
exports.createEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'Organizer' && req.user.role !== 'System Admin') {
      return res.status(403).json({ success: false, message: 'Only organizers or admins can create events' });
    }

    req.body.organizer = req.user.id;
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc Get all events
// @route GET /api/v1/events
// @access Public
exports.getEvents = async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Add active events filter
    if (!reqQuery.status) {
      reqQuery.status = 'active';
    }

    let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let query = Event.find(JSON.parse(queryStr)).populate('organizer', 'name email');

    if (req.query.select) {
      query = query.select(req.query.select.split(',').join(' '));
    }
    
    query = req.query.sort ? query.sort(req.query.sort.split(',').join(' ')) : query.sort('-createdAt');
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await Event.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    const events = await query;
    
    const pagination = {};
    if ((page * limit) < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };
    
    res.status(200).json({ success: true, count: events.length, pagination, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizers only)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'System Admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizers only)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'System Admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized to delete this event' });
    }

    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Change event approval status
// @route   PUT /api/v1/events/:id/approve
// @access  Private (Admin only)
exports.approveEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'System Admin') {
      return res.status(403).json({ success: false, message: 'Only admins can approve events' });
    }

    const { status } = req.body;
    if (!['active', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events for current organizer
// @route   GET /api/v1/events/user/my-events
// @access  Private (Organizers only)
exports.getMyEvents = async (req, res, next) => {
  try {
    if (req.user.role !== 'Organizer' && req.user.role !== 'System Admin') {
      return res.status(403).json({ success: false, message: 'Only organizers can access their events' });
    }

    const events = await Event.find({ organizer: req.user.id });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event analytics for organizer
// @route   GET /api/v1/events/organizer/analytics
// @access  Private (Organizers only)
exports.getEventAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'Organizer' && req.user.role !== 'System Admin') {
      return res.status(403).json({ success: false, message: 'Only organizers can view analytics' });
    }

    const events = await Event.find({ organizer: req.user.id });

    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'active').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const cancelledEvents = events.filter(e => e.status === 'cancelled').length;

    let totalTickets = 0;
    let soldTickets = 0;
    let totalRevenue = 0;

    events.forEach(event => {
      const sold = event.totalTickets - event.remainingTickets;
      soldTickets += sold;
      totalTickets += event.totalTickets;
      totalRevenue += sold * event.ticketPrice;
    });

    const avgTicketPrice = totalEvents > 0
      ? events.reduce((sum, e) => sum + e.ticketPrice, 0) / totalEvents
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        activeEvents,
        completedEvents,
        cancelledEvents,
        totalTickets,
        soldTickets,
        ticketSalesRate: totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0,
        totalRevenue,
        avgTicketPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all events (including approved, pending, declined)
// @route GET /api/v1/events/all
// @access Admin only
exports.getAllEvents = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== "System Admin") {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let query = Event.find(JSON.parse(queryStr)).populate('organizer', 'name email');
    
    if (req.query.select) {
      query = query.select(req.query.select.split(',').join(' '));
    }
    
    query = req.query.sort ? query.sort(req.query.sort.split(',').join(' ')) : query.sort('-createdAt');
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await Event.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    const events = await query;
    
    const pagination = {};
    if ((page * limit) < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };
    
    res.status(200).json({ success: true, count: events.length, pagination, data: events });
  } catch (error) {
    next(error);
  }
};