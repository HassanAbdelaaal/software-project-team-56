const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event", 
    required: true 
  },
  ticketsBooked: { 
    type: Number, 
    required: true,
    min: [1, 'At least one ticket must be booked'], // Ensure at least one ticket is booked
  },
  totalPrice: { 
    type: Number, 
    required: true,
    min: [0, 'Total price cannot be negative'], // Ensure price is non-negative
  },
  // Add status field back to track booking status
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

// Middleware to calculate totalPrice and update remainingTickets after booking
BookingSchema.pre('save', async function(next) {
  if (this.isNew) {  // Only run this logic when creating a new booking
    // Fetch the event associated with this booking
    const event = await mongoose.model('Event').findById(this.event);
    
    // Validate that there are enough remaining tickets
    if (event.remainingTickets < this.ticketsBooked) {
      return next(new Error('Not enough tickets available.'));
    }
    
    // Calculate the total price based on the ticket price
    this.totalPrice = event.ticketPrice * this.ticketsBooked;
    
    // Update remaining tickets in the event
    event.remainingTickets -= this.ticketsBooked;
    
    // Save the event changes before proceeding with the booking
    await event.save();
  }
  
  next();
});

// Method to release tickets if booking is deleted
BookingSchema.pre('remove', async function(next) {
  // When a booking is deleted, restore tickets to the event
  const event = await mongoose.model('Event').findById(this.event);
  event.remainingTickets += this.ticketsBooked;
  await event.save();
  next();
});

// Add methods for confirming and canceling bookings
BookingSchema.methods.confirmBooking = async function() {
  this.status = 'Confirmed';
  return this.save();
};

BookingSchema.methods.cancelBooking = async function() {
  if (this.status !== 'Cancelled') {
    // Only return tickets if the booking wasn't already cancelled
    const event = await mongoose.model('Event').findById(this.event);
    event.remainingTickets += this.ticketsBooked;
    await event.save();
    
    this.status = 'Cancelled';
    return this.save();
  }
  return this;
};

module.exports = mongoose.model("Booking", BookingSchema);