import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchUsers, fetchAllEvents, approveEvent } from '../../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    usersByRole: []
  });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#667eea', '#764ba2', '#10b981', '#f59e0b'];

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        setLoading(true);
        // Fetch real user data
        const userResponse = await fetchUsers();
        
        if (userResponse.success) {
          const userData = userResponse.data;
          setUsers(userData);
          
          // Calculate real statistics from user data
          const totalUsers = userData.length;
          const activeUsers = userData.filter(user => {
            // Consider users active if they were created in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(user.createdAt) > thirtyDaysAgo;
          }).length;
          
          // Count users by role
          const roleCounts = userData.reduce((acc, user) => {
            const role = user.role || 'Standard User';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {});
          
          const usersByRole = Object.entries(roleCounts).map(([name, value]) => ({
            name,
            value
          }));
          
          setStats({
            totalUsers,
            activeUsers,
            pendingApprovals: 0, // You can calculate this based on your business logic
            usersByRole
          });
        } else {
          throw new Error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error loading admin stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    const loadAllEvents = async () => {
      try {
        setEventsLoading(true);
        // Use real API call instead of mock data
        const response = await fetchAllEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events data');
        // Set empty array on error to prevent crashes
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    loadAdminStats();
    loadAllEvents();
  }, []);

  const handleEventApproval = async (eventId, status) => {
    try {
      const response = await approveEvent(eventId, status);
      
      // Update the events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, status: status }
            : event
        )
      );
      toast.success(`Event ${status === 'active' ? 'approved' : status} successfully`);
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error(`Failed to ${status} event`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage your platform with ease</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          >
            Event Management
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                <div className="stat-trend">↗ +12% from last month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Users</div>
                <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                <div className="stat-trend">↗ +{stats.activeUsers} in last 30 days</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Events</div>
                <div className="stat-value">{events.length}</div>
                <div className="stat-trend">↗ +{events.filter(e => e.status === 'pending').length} pending</div>
              </div>
            </div>
            
            {/* Overview Grid */}
            <div className="overview-grid">
              <div className="chart-card">
                <h2 className="card-title">Users by Role</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.usersByRole}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="activity-card">
                <h2 className="card-title">Recent Activity</h2>
                <ul className="activity-list">
                  {users.slice(-5).reverse().map((user, index) => (
                    <li key={user._id} className="activity-item">
                      <div className="activity-indicator success"></div>
                      <div className="activity-content">
                        New user registered: <span className="activity-user">{user.name}</span>
                      </div>
                      <div className="activity-time">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </li>
                  ))}
                  
                  {events.filter(e => e.status === 'pending').slice(0, 2).map((event) => (
                    <li key={`event-${event._id}`} className="activity-item">
                      <div className="activity-indicator warning"></div>
                      <div className="activity-content">
                        Event pending approval: <span className="activity-user">{event.title}</span>
                      </div>
                      <div className="activity-time">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </li>
                  ))}
                  
                  {users.length === 0 && events.length === 0 && (
                    <li className="activity-item">
                      <div className="activity-indicator info"></div>
                      <div className="activity-content">
                        No recent activity to display
                      </div>
                      <div className="activity-time">—</div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="events-header">
              <h2 className="events-title">Event Management</h2>
              <p className="events-subtitle">Approve, decline, or manage all events in the system</p>
            </div>
            
            {eventsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <span>Loading events...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-title">No events found</div>
                <div className="empty-state-description">Events will appear here once created</div>
              </div>
            ) : (
              <div className="events-table-container">
                <table className="events-table">
                  <thead className="table-header">
                    <tr>
                      <th>Event Details</th>
                      <th>Organizer</th>
                      <th>Date & Location</th>
                      <th>Status</th>
                      <th>Tickets</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id} className="table-row">
                        <td className="table-cell">
                          <div className="event-title">{event.title}</div>
                          <div className="event-category">{event.category}</div>
                          <div className="event-price">${event.ticketPrice}</div>
                        </td>
                        <td className="table-cell">
                          <div className="organizer-name">{event.organizer?.name || 'Unknown'}</div>
                          <div className="organizer-email">{event.organizer?.email || 'No Email'}</div>
                        </td>
                        <td className="table-cell">
                          <div className="event-date">{formatDate(event.date)}</div>
                          <div className="event-location">{event.location}</div>
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="ticket-info">{event.remainingTickets}/{event.totalTickets}</div>
                          <div className="ticket-percentage">
                            {((event.totalTickets - event.remainingTickets) / event.totalTickets * 100).toFixed(0)}% sold
                          </div>
                          <div className="ticket-progress">
                            <div 
                              className="ticket-progress-bar"
                              style={{ 
                                width: `${((event.totalTickets - event.remainingTickets) / event.totalTickets * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="action-buttons">
                            {event.status !== 'active' && (
                              <button
                                onClick={() => handleEventApproval(event._id, 'active')}
                                className="action-button btn-approve"
                              >
                                Approve
                              </button>
                            )}
                            {event.status !== 'cancelled' && (
                              <button
                                onClick={() => handleEventApproval(event._id, 'cancelled')}
                                className="action-button btn-cancel"
                              >
                                Cancel
                              </button>
                            )}
                            {event.status !== 'completed' && (
                              <button
                                onClick={() => handleEventApproval(event._id, 'completed')}
                                className="action-button btn-complete"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;