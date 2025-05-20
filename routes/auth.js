const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  updatePassword,
  requestPasswordResetOTP,
  verifyOTP,
  resetPasswordWithOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.put('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);

// OTP-based password reset routes
router.post('/forgetPassword/request', requestPasswordResetOTP);
router.post('/forgetPassword/verify', verifyOTP); // New route for OTP verification
router.put('/forgetPassword/reset', resetPasswordWithOTP);

// Protected routes
router.put('/updatePassword', protect, updatePassword);

module.exports = router;