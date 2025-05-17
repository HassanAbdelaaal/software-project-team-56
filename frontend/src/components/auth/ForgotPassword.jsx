import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Use the custom hook
import './AuthForm.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: New password
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use the useAuth hook to access auth context functions
  const { requestPasswordReset, verifyResetCode, resetUserPassword } = useAuth();

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await resetUserPassword(email, otp, newPassword);
      
      setMessage('Password reset successfully. You can now login with your new password.');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
  
        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}
  
        {step === 1 && (
          <form className="auth-form" onSubmit={handleRequestOTP}>
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              className="auth-input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
  
        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <label className="auth-label" htmlFor="otp">Enter OTP</label>
            <input
              className="auth-input"
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
  
        {step === 3 && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <label className="auth-label" htmlFor="newPassword">New Password</label>
            <input
              className="auth-input"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
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