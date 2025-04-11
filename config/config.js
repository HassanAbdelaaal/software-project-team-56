// Application configuration constants
module.exports = {
    // JWT configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    
    // Password reset token configuration
    passwordReset: {
      // Token expiration time in minutes
      tokenExpiration: 60,
    },
    
    // Email configuration (for password reset)
    email: {
      from: process.env.EMAIL_FROM || 'no-reply@eventticketing.com',
      // Add any other email configuration needed
    }
  };