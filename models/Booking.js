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
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Canceled"],
    default: "Pending",
  },
}, { timestamps: true });

// Middleware to calculate totalPrice and update remainingTickets after booking
BookingSchema.pre('save', async function(next) {
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

  next();
});

// Method to confirm booking
BookingSchema.methods.confirmBooking = async function() {
  if (this.status === "Pending") {
    this.status = "Confirmed";
    await this.save();
  } else {
    throw new Error('Booking is already confirmed or canceled.');
  }
};

// Method to cancel booking
BookingSchema.methods.cancelBooking = async function() {
  if (this.status === "Confirmed") {
    this.status = "Canceled";
    const event = await mongoose.model('Event').findById(this.event);
    event.remainingTickets += this.ticketsBooked; // Restore the remaining tickets
    await event.save();
    await this.save();
  } else {
    throw new Error('Booking is already canceled or not confirmed yet.');
  }
};

module.exports = mongoose.model("Booking", BookingSchema);
