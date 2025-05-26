import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const UpdateProfileForm = ({ onCancel }) => {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pictureInputMethod, setPictureInputMethod] = useState('file'); // 'file' or 'url'

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      if (currentUser.profilePictureUrl) {
        setPreviewUrl(currentUser.profilePictureUrl);
      }
    }
  }, [currentUser]);

  const handleNameChange = (e) => setName(e.target.value);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePictureUrl(''); // Clear URL when file is selected
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePictureUrlChange = (e) => {
    const url = e.target.value;
    setProfilePictureUrl(url);
    setProfilePicture(null); // Clear file when URL is entered
    setPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      
      // Handle profile picture based on input method
      if (pictureInputMethod === 'file' && profilePicture) {
        formData.append('profilePicture', profilePicture);
      } else if (pictureInputMethod === 'url' && profilePictureUrl) {
        formData.append('profilePictureUrl', profilePictureUrl);
      }

      const result = await updateProfile(formData);

      if (result && result.data) {
        toast.success('Profile updated successfully');
        onCancel();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );

  return (
    <div className="profile-card">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <h1 className="form-title">Edit Profile</h1>
        </div>

        <div className="avatar-container">
          <div
            className="avatar edit-avatar"
            style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover' } : {}}
          >
            {!previewUrl && getInitials()}

            <div className="picture-input-options">
              <select 
                value={pictureInputMethod} 
                onChange={(e) => setPictureInputMethod(e.target.value)}
                className="picture-input-select"
              >
                <option value="file">Upload File</option>
                <option value="url">Enter URL</option>
              </select>
            </div>

            {pictureInputMethod === 'file' ? (
              <>
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="profile-picture-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="profile-picture" className="change-avatar-button">
                  Change
                </label>
              </>
            ) : (
              <div className="url-input-container">
                <input
                  type="url"
                  value={profilePictureUrl}
                  onChange={handlePictureUrlChange}
                  className="form-input"
                  placeholder="Enter image URL"
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="input-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="form-input"
              placeholder="Enter your name"
            />
          </div>

          <div className="input-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={currentUser?.email || ''}
              className="form-input disabled"
              disabled
            />
            <p className="helper-text">Email cannot be changed</p>
          </div>

          {currentUser?.phone && (
            <div className="input-group">
              <label className="form-label">Phone</label>
              <div className="form-value">{currentUser.phone}</div>
            </div>
          )}

          {currentUser?.bio && (
            <div className="input-group">
              <label className="form-label">About me</label>
              <div className="form-value bio-preview">{currentUser.bio}</div>
            </div>
          )}
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={onCancel}
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
    </div>
  );
};

export default UpdateProfileForm;
