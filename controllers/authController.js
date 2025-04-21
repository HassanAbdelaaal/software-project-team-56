const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwtUtils = require('../utils/jwtUtils');
const emailService = require('../utils/emailService');
const crypto = require('crypto');


/**
 * @desc    Register new user
 * @route   POST /api/v1/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by the pre-save middleware in User model
      role: role || 'Standard User',
    });

    // Generate JWT token
    const token = jwtUtils.generateToken(user);

    // Send response with token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwtUtils.generateToken(user);

    // Send response with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - generate reset token
 * @route   POST /api/v1/forgotPassword
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email',
      });
    }

    // Generate reset token
    const { resetToken, resetTokenHash, resetExpires } = jwtUtils.generateResetToken();

    // Save reset token to user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = resetExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

    try {
      // Send password reset email
      await emailService.sendPasswordResetEmail(user.email, resetToken, resetUrl);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (err) {
      // If email fails, remove reset token from user
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   PUT /api/v1/resetPassword/:resetToken
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password',
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: jwtUtils.hashResetToken(resetToken),
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password and clear reset token
    user.password = password; // Will be hashed by the pre-save middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate JWT token
    const token = jwtUtils.generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/v1/updatePassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user from database (include password)
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by the pre-save middleware
    await user.save();

    // Generate new JWT token
    const token = jwtUtils.generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};






/**
 * @desc    Request password reset OTP
 * @route   POST /api/v1/forgetPassword/request
 * @access  Public
 */
exports.requestPasswordResetOTP = async (req, res, next) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an email address',
        });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No user found with this email',
        });
      }
  
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash OTP before saving to database
      const otpHash = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
  
      // Set OTP expiration (10 minutes)
      const otpExpires = Date.now() + 10 * 60 * 1000;
  
      // Save OTP to user
      user.resetPasswordToken = otpHash;
      user.resetPasswordExpire = otpExpires;
      await user.save();
  
      try {
        // Send OTP via email
        await emailService.sendOTP(user.email, otp);
  
        // Send response
        res.status(200).json({
          success: true,
          message: 'Password reset OTP sent to your email',
          // Only include OTP in development for testing purposes
          ...(process.env.NODE_ENV !== 'production' && { otp }),
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        
        // If email fails, remove OTP from user
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
  
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please try again later.',
        });
      }
    } catch (error) {
      console.error('OTP generation error:', error);
      next(error);
    }
  };
  
  /**
   * @desc    Reset password using OTP
   * @route   PUT /api/v1/forgetPassword/reset
   * @access  Public
   */
  exports.resetPasswordWithOTP = async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
  
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email, OTP, and new password',
        });
      }
  
      // Hash the provided OTP for comparison
      const otpHash = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
  
      // Find user by email and OTP hash
      const user = await User.findOne({
        email,
        resetPasswordToken: otpHash,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }
  
      // Set new password and clear reset token fields
      user.password = newPassword; // Will be hashed by the pre-save middleware
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      // Generate JWT token
      const token = jwtUtils.generateToken(user);
  
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
        token,
      });
    } catch (error) {
      console.error('Password reset error:', error);
      next(error);
    }
  };