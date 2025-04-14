const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v > Date.now(); // Ensure event date is in the future
      },
      message: 'Event date must be in the future.'
    }
  },
  location: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['Music', 'Sports', 'Theater', 'Conference', 'Other'] // Predefined event categories
  },
  image: { 
    type: String, 
    default: null // Store image URL, default to null if no image provided
  },
  ticketPrice: { 
    type: Number, 
    required: true, 
    min: [0, 'Price must be positive'] // Ensure the ticket price is a positive number
  },
  totalTickets: { 
    type: Number, 
    required: true, 
    min: [0, 'Total tickets must be at least 0'] // Ensure the total tickets is non-negative
  },
  remainingTickets: { 
    type: Number, 
    required: true, 
    min: [0, 'Remaining tickets cannot be less than 0'],
    default: function() { return this.totalTickets; } // Initially, remaining tickets equal total tickets
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Link to the User model (Organizer)
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'completed'], 
    default: 'active' // Default status is 'active'
  }
}, { timestamps: true }); // Adds createdAt & updatedAt fields

// Middleware to update remainingTickets after a booking
EventSchema.methods.updateRemainingTickets = function(ticketsBooked) {
  if (this.remainingTickets - ticketsBooked < 0) {
    throw new Error('Not enough tickets available');
  }
  this.remainingTickets -= ticketsBooked;
  return this.save();
};

module.exports = mongoose.model('Event', EventSchema);
