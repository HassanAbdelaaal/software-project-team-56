import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { updateUserSettings, currentUser } = useAuth();
  const [settings, setSettings] = useState({
    notifications: currentUser?.settings?.notifications || {
      email: true,
      push: true,
      sms: false
    },
    theme: currentUser?.settings?.theme || 'light',
    language: currentUser?.settings?.language || 'en'
  });
  const [loading, setLoading] = useState(false);

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked
      }
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUserSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <form onSubmit={handleSubmit}>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  name="email"
                  checked={settings.notifications.email}
                  onChange={handleNotificationChange}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor="email-notifications">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-notifications"
                  name="push"
                  checked={settings.notifications.push}
                  onChange={handleNotificationChange}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor="push-notifications">
                  Push Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sms-notifications"
                  name="sms"
                  checked={settings.notifications.sms}
                  onChange={handleNotificationChange}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor="sms-notifications">
                  SMS Notifications
                </label>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Theme</label>
              <select
                name="theme"
                value={settings.theme}
                onChange={handleSelectChange}
                className="w-full p-2 border rounded"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Language & Region</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Language</label>
              <select
                name="language"
                value={settings.language}
                onChange={handleSelectChange}
                className="w-full p-2 border rounded"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </section>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;