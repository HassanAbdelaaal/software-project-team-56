import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UpdateProfileForm from './UpdateProfileForm';
import UserBookingsPage from './UserBookingsPage';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const getInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="page-container">
      <div className="profile-container">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
        </div>
        
        <div className="profile-content-container">
          {activeTab === 'profile' && (
            <div className="profile-card">
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
              
              <div className="button-container">
                <button 
                  onClick={() => setActiveTab('edit-profile')} 
                  className="edit-profile-button"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'edit-profile' && (
            <UpdateProfileForm 
              onCancel={() => setActiveTab('profile')} 
            />
          )}
          
          {activeTab === 'bookings' && (
            <UserBookingsPage />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;