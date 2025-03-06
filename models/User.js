const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const UserRoles = {
  STANDARD_USER: "Standard User",
  ORGANIZER: "Organizer",
  SYSTEM_ADMIN: "System Admin"
};

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  profilePicture: { type: String, default: null }, // Store image URL, default to null
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRoles),
    required: true,
  },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
