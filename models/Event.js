const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, default: "" }, 
  ticketPrice: { type: Number, required: true },
  totalTickets: { type: Number, required: true },
  remainingTickets: { type: Number, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true }); // Adds createdAt & updatedAt

module.exports = mongoose.model("Event", EventSchema);