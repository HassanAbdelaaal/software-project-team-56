const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String, default: "" }, // Store image URL
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Standard User", "Organizer", "System Admin"],
    required: true,
  },
}, { timestamps: true }); // Adds createdAt & updatedAt

module.exports = mongoose.model("User", UserSchema);
