import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forgotPasswordWithEmail, resetPasswordWithToken } from '../../api';
import './AuthForm.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMethod, setResetMethod] = useState('otp'); // 'otp' or 'email'
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: New password
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetToken } = useParams(); // For email-based reset
  const navigate = useNavigate();
  
  // Use the useAuth hook to access auth context functions
  const { requestPasswordReset, verifyResetCode, resetUserPassword } = useAuth();

  // Handle OTP-based password reset
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await requestPasswordReset(email);
      
      setMessage('OTP sent to your email address');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await verifyResetCode(email, otp);
      
      setMessage('OTP verified successfully');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithOTP = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await resetUserPassword(email, otp, newPassword);
      
      setMessage('Password reset successfully. You can now login with your new password.');
      // Redirect to login after successful reset
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Handle email-based password reset
  const handleRequestEmailReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await forgotPasswordWithEmail(email);
      
      setMessage('Password reset link sent to your email address. Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset with token (from email link)
  const handleResetPasswordWithToken = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await resetPasswordWithToken(resetToken, newPassword);
      
      setMessage('Password reset successfully. You can now login with your new password.');
      // Redirect to login after successful reset
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  // If there's a reset token in the URL, show password reset form
  if (resetToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Your Password</h2>
          
          {message && <div className="auth-success">{message}</div>}
          {error && <div className="auth-error">{error}</div>}
          
          <form className="auth-form" onSubmit={handleResetPasswordWithToken}>
            <label className="auth-label" htmlFor="newPassword">New Password</label>
            <input
              className="auth-input"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              minLength="6"
            />
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="auth-link">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        
        {/* Reset method selection */}
        {step === 1 && (
          <div className="reset-method-selector" style={{ marginBottom: '20px' }}>
            <div className="method-buttons">
              <button
                type="button"
                className={`method-button ${resetMethod === 'otp' ? 'active' : ''}`}
                onClick={() => setResetMethod('otp')}
              >
                Reset with OTP
              </button>
              <button
                type="button"
                className={`method-button ${resetMethod === 'email' ? 'active' : ''}`}
                onClick={() => setResetMethod('email')}
              >
                Reset with Email Link
              </button>
            </div>
            <p className="method-description">
              {resetMethod === 'otp' 
                ? 'We\'ll send a 6-digit code to your email for verification.' 
                : 'We\'ll send a password reset link to your email address.'
              }
            </p>
          </div>
        )}

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        {/* Email input form */}
        {step === 1 && (
          <form 
            className="auth-form" 
            onSubmit={resetMethod === 'otp' ? handleRequestOTP : handleRequestEmailReset}
          >
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              className="auth-input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            <button className="auth-button" type="submit" disabled={loading}>
              {loading 
                ? 'Sending...' 
                : resetMethod === 'otp' 
                  ? 'Send OTP' 
                  : 'Send Reset Link'
              }
            </button>
          </form>
        )}

        {/* OTP verification form - only for OTP method */}
        {step === 2 && resetMethod === 'otp' && (
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <label className="auth-label" htmlFor="otp">Enter OTP</label>
            <input
              className="auth-input"
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the 6-digit code"
              maxLength="6"
              required
            />
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="auth-link" style={{ marginTop: '10px' }}>
              <button 
                type="button" 
                className="link-button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                  setMessage('');
                }}
              >
                Request New OTP
              </button>
            </div>
          </form>
        )}

        {/* New password form - only for OTP method */}
        {step === 3 && resetMethod === 'otp' && (
          <form className="auth-form" onSubmit={handleResetPasswordWithOTP}>
            <label className="auth-label" htmlFor="newPassword">New Password</label>
            <input
              className="auth-input"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              minLength="6"
            />
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-link">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;