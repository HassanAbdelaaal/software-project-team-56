import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Standard User' // Default role
  });
  const [error, setError] = useState('');
  
  // Use the useAuth hook to access auth context
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password strength validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      // Prepare the data for API - ensure property names match what the API expects
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      await register(userData);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      // More detailed error handling
      if (err.status === 409) {
        setError('This email is already registered');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}
  
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="name">Full Name</label>
          <input
            className="auth-input"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
  
          <label className="auth-label" htmlFor="email">Email</label>
          <input
            className="auth-input"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
  
          <label className="auth-label" htmlFor="password">Password</label>
          <input
            className="auth-input"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
  
          <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            className="auth-input"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
  
          <label className="auth-label" htmlFor="role">Role</label>
          <select
            className="auth-input"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Standard User">Standard User</option>
            <option value="organizer">Organizer</option>
            <option value="System Admin">System Admin</option>
          </select>
  
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
  
        <div className="auth-link">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;