const nodemailer = require('nodemailer');
const config = require('../config/config');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Email body (text)
 * @param {String} options.html - Email body (HTML)
 */
exports.sendEmail = async (options) => {
  try {
    let transporter;
    
    // Check if real email should be used (regardless of environment)
    if (process.env.USE_REAL_EMAIL === 'true') {
      // Configure real email provider (works in any environment)
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false
        },
        debug: true, // Enable debugging
        logger: true // Log information to the console
      });
      console.log('Using real email service:', process.env.EMAIL_HOST);
    } else if (process.env.NODE_ENV === 'production') {
      // Configure production email provider as fallback
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      // Use ethereal.email for development/testing if real email not requested
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Email message options
    const message = {
      from: options.from || config.email.from || process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(message);

    // Log email URL for development environment with ethereal
    if (process.env.NODE_ENV !== 'production' && process.env.USE_REAL_EMAIL !== 'true') {
      console.log(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`Email sent to: ${options.to}`);
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} resetToken - Password reset token
 * @param {String} resetUrl - Reset URL with token
 */
exports.sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const subject = 'Password Reset Request';
  const text = `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
    Please click the following link or paste it into your browser to complete the process:\n\n
    ${resetUrl}\n\n
    This link will expire in ${config.passwordReset.tokenExpiration} minutes.\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.`;

  const html = `
    <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
    <p>Please click the following link or paste it into your browser to complete the process:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link will expire in ${config.passwordReset.tokenExpiration} minutes.</p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  await this.sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

/**
 * Send OTP for password reset
 * @param {String} email - Recipient email
 * @param {String} otp - One-time password
 */
exports.sendOTP = async (email, otp) => {
  const subject = 'Password Reset OTP';
  const text = `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
    Your OTP for password reset is: ${otp}\n\n
    This OTP will expire in 10 minutes.\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <h3 style="margin-top: 0;">Your OTP Code</h3>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4a6ee0;">${otp}</p>
      </div>
      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  await this.sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};