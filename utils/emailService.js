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
    // In development/testing, use ethereal.email for testing
    // In production, configure real email service credentials
    let transporter;
    
    if (process.env.NODE_ENV === 'production') {
      // Configure production email provider
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
      // Use ethereal.email for development/testing
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
      from: options.from || config.email.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(message);

    // Log email URL for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
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