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
  profilePictureUrl: { type: String, default: null }, // Store image URL, default to null
  password: { 
    type: String, 
    required: true,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: Object.values(UserRoles),
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);