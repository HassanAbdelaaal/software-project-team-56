const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Get logged-in user's profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      profilePicture: req.body.profilePicture
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get single user by ID
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update user role
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for current user
// @route   GET /api/v1/users/bookings
// @access  Private/Standard User
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('event');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events created by current organizer
// @route   GET /api/v1/users/events
// @access  Private/Organizer
exports.getUserEvents = async (req, res, next) => {
    try {
      // Change "Organizer" to "organizer" to match your schema
      const events = await Event.find({ organizer: req.user.id });
      res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
      next(error);
    }
  };

// @desc    Get analytics for organizer's events
// @route   GET /api/v1/users/events/analytics
// @access  Private/Organizer
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const events = await Event.find({ Organizer: req.user.id });

    const analytics = await Promise.all(events.map(async (event) => {
      const bookingCount = await Booking.countDocuments({ event: event._id });
      return {
        eventId: event._id,
        title: event.title,
        bookingCount
      };
    }));

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};
