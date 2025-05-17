import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prevState => ({
        ...prevState,
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        phone: currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation if changing password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        return toast.error('New passwords do not match');
      }
      if (!formData.currentPassword) {
        return toast.error('Current password is required to change password');
      }
    }
    
    try {
      setLoading(true);
      
      // Only include password fields if updating password
      const profileData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone
      };
      
      if (formData.newPassword) {
        profileData.currentPassword = formData.currentPassword;
        profileData.newPassword = formData.newPassword;
      }
      
      await updateUserProfile(profileData);
      toast.success('Profile updated successfully');
      setEditMode(false);
      
      // Clear password fields
      setFormData(prevState => ({
        ...prevState,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Define pencil icon as an SVG component
  const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  );

  // Define save icon as an SVG component
  const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  );

  // Define lock icon as an SVG component
  const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  return (
    <div className="page-container">
      <div className="profile-container">
        <div className="profile-card">
          {!editMode ? (
            <>
              <div className="profile-view-header">
                <div className="avatar-area">
                  <div className="avatar" tabIndex="0">
                    {getInitials()}
                  </div>
                  <div className="user-info">
                    <h1 className="user-name">{currentUser?.name || 'User'}</h1>
                    <p className="user-role">{currentUser?.role || 'user'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="edit-button"
                  aria-label="Edit profile"
                >
                  <PencilIcon /> Edit
                </button>
              </div>
    
              <div className="profile-content">
                <div className="profile-grid">
                  <div className="profile-field">
                    <h3 className="profile-label">Email</h3>
                    <p className="profile-value">{currentUser?.email}</p>
                  </div>
                  <div className="profile-field">
                    <h3 className="profile-label">Phone</h3>
                    <p className="profile-value">{currentUser?.phone || 'Not provided'}</p>
                  </div>
                </div>
    
                <div className="bio-container">
                  <h3 className="profile-label">About</h3>
                  <div className="bio-content">
                    {currentUser?.bio || 'No bio information provided.'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-header">
                <h1 className="form-title">Edit Profile</h1>
              </div>
              
              <div className="avatar-container">
                <div className="avatar edit-avatar">
                  {getInitials()}
                </div>
              </div>
    
              <div className="form-section">
                <div className="input-group">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="input-grid">
                  <div className="input-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input disabled"
                      disabled
                    />
                    <p className="helper-text">Email cannot be changed</p>
                  </div>
                  
                  <div className="input-group">
                    <label className="form-label" htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
    
                <div className="input-group">
                  <label className="form-label" htmlFor="bio">About me</label>
                  <textarea
                    name="bio"
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
              </div>
              
              <div className="password-section-container">
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  <span className="password-section-title">
                    <LockIcon /> Change Password
                  </span>
                  <span className="toggle-icon">{passwordVisible ? '−' : '+'}</span>
                </button>
                
                {passwordVisible && (
                  <div className="password-fields">
                    <div className="input-group">
                      <label className="form-label" htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="input-grid">
                      <div className="input-group">
                        <label className="form-label" htmlFor="newPassword">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
    
              <div className="button-group">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (
                    <>
                      <SaveIcon />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;