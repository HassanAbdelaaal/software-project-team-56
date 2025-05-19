const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create a new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketsBooked } = req.body;

    // Check if ticketsBooked is provided and valid
    if (!ticketsBooked || ticketsBooked < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid number of tickets (minimum 1)'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ticket availability
    if (event.remainingTickets < ticketsBooked) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.remainingTickets} tickets available for this event`
      });
    }

    // Create new booking
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      ticketsBooked,
      totalPrice: event.ticketPrice * ticketsBooked,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/v1/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'event',
        select: 'title date location ticketPrice'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'event',
        select: 'title date location ticketPrice'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the user is authorized to access this booking
    // Only allow the booking owner or admin to access it
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'System Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for current user
// @route   GET /api/v1/bookings/my
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title date location providerName ticketPrice'
      });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Update booking status (confirm)
// @route   PUT /api/v1/bookings/:id/confirm
// @access  Private/Admin
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Use the model method to confirm booking
    await booking.confirmBooking();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only allow the booking owner or admin to cancel it
    if (booking.user.toString() !== req.user.id && req.user.role !== 'System Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Use the model method to cancel booking
    await booking.cancelBooking();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking successfully canceled'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking (admin only)
// @route   DELETE /api/v1/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check ticket availability for an event
// @route   GET /api/v1/bookings/check-availability/:eventId
// @access  Public
exports.checkAvailability = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        eventId: event._id,
        title: event.title,
        remainingTickets: event.remainingTickets,
        ticketPrice: event.ticketPrice
      }
    });
  } catch (error) {
    next(error);
  }
};