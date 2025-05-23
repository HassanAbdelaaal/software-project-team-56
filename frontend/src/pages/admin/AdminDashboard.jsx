import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchAdminStats, fetchAllEvents, approveEvent } from '../../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    usersByRole: []
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        setLoading(true);
        // In a real app, this would come from your API:
        // const data = await fetchAdminStats();
        
        // Mock data for demonstration
        const mockData = {
          totalUsers: 1245,
          activeUsers: 872,
          pendingApprovals: 21,
          usersByRole: [
            { name: 'Admin', value: 12 },
            { name: 'Manager', value: 58 },
            { name: 'Editor', value: 124 },
            { name: 'User', value: 1051 }
          ]
        };
        
        setStats(mockData);
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
        const response = await fetchAllEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events data');
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
      case 'active': return 'status-badge active';
      case 'cancelled': return 'status-badge cancelled';
      case 'completed': return 'status-badge completed';
      default: return 'status-badge pending';
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
      <div className="text-center p-6">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="tab-nav -mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-button py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'active border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`tab-button py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'active border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Event Management
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="stats-card bg-white p-6 rounded shadow">
              <h3 className="text-gray-500 mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="stats-card bg-white p-6 rounded shadow">
              <h3 className="text-gray-500 mb-2">Active Users</h3>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="stats-card bg-white p-6 rounded shadow">
              <h3 className="text-gray-500 mb-2">Total Events</h3>
              <p className="text-3xl font-bold">{events.length}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="chart-container bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
              <div className="h-64">
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
            
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <ul className="space-y-3">
                <li className="activity-item flex items-center space-x-3 text-sm">
                  <span className="status-dot green"></span>
                  <span>New user registered: <b>John Smith</b></span>
                  <span className="text-gray-400 ml-auto">2 min ago</span>
                </li>
                <li className="activity-item flex items-center space-x-3 text-sm">
                  <span className="status-dot yellow"></span>
                  <span>Role change: <b>Susan Lee</b> from User to Editor</span>
                  <span className="text-gray-400 ml-auto">45 min ago</span>
                </li>
                <li className="activity-item flex items-center space-x-3 text-sm">
                  <span className="status-dot red"></span>
                  <span>Account locked: <b>Michael Brown</b> (Failed attempts)</span>
                  <span className="text-gray-400 ml-auto">2 hours ago</span>
                </li>
                <li className="activity-item flex items-center space-x-3 text-sm">
                  <span className="status-dot blue"></span>
                  <span>Password reset requested: <b>Karen Wilson</b></span>
                  <span className="text-gray-400 ml-auto">5 hours ago</span>
                </li>
                <li className="activity-item flex items-center space-x-3 text-sm">
                  <span className="status-dot green"></span>
                  <span>New admin approved: <b>David Johnson</b></span>
                  <span className="text-gray-400 ml-auto">1 day ago</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}

      {activeTab === 'events' && (
        <div className="events-table bg-white rounded shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Event Management</h2>
            <p className="text-gray-600 text-sm mt-1">Approve, decline, or manage all events in the system</p>
          </div>
          
          {eventsLoading ? (
            <div className="text-center p-6">
              <div className="loading-spinner"></div>
              <span className="ml-2">Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center p-6 text-gray-500">No events found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organizer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event._id} className="table-row hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.category}</div>
                          <div className="text-sm text-gray-500">${event.ticketPrice}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.organizer?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.organizer?.email || 'No Email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                        <div className="text-sm text-gray-500">{event.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{event.remainingTickets}/{event.totalTickets}</div>
                        <div className="text-xs text-gray-500">
                          {((event.totalTickets - event.remainingTickets) / event.totalTickets * 100).toFixed(0)}% sold
                        </div>
                        <div className="progress-bar mt-1">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${((event.totalTickets - event.remainingTickets) / event.totalTickets * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {event.status !== 'active' && (
                          <button
                            onClick={() => handleEventApproval(event._id, 'active')}
                            className="action-btn text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {event.status !== 'cancelled' && (
                          <button
                            onClick={() => handleEventApproval(event._id, 'cancelled')}
                            className="action-btn text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        )}
                        {event.status !== 'completed' && (
                          <button
                            onClick={() => handleEventApproval(event._id, 'completed')}
                            className="action-btn text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-xs"
                          >
                            Complete
                          </button>
                        )}
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
  );
};

export default AdminDashboard;