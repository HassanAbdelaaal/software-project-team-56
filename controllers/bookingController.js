const Booking = require("../models/Booking");
const Event = require("../models/Event");
const mongoose = require("mongoose");

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, eventId, ticketsBooked } = req.body;
    const event = await Event.findById(eventId).session(session);
    if (!event) throw new Error("Event not found.");
    if (event.remainingTickets < ticketsBooked) throw new Error("Not enough tickets available.");

    const totalPrice = event.ticketPrice * ticketsBooked;

    const booking = new Booking({
      user: userId,
      event: eventId,
      ticketsBooked,
      totalPrice,
      status: "Pending",
    });

    await booking.save({ session });

    event.remainingTickets -= ticketsBooked;
    await event.save({ session });

    await session.commitTransaction();
    res.status(201).json(booking);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate("event");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("event");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    await booking.cancelBooking(); // uses schema method
    res.json({ message: "Booking canceled", booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json({
      eventId: event._id,
      remainingTickets: event.remainingTickets,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.calculatePrice = async (req, res) => {
  try {
    const { tickets } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const totalPrice = event.ticketPrice * tickets;
    res.json({ totalPrice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
