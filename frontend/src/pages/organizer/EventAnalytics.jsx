import React, { useState, useEffect } from 'react';
import { getEventAnalytics } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import './EventAnalytics.css';

const EventAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isOrganizer } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isOrganizer) {
        setError('Access denied. Only organizers can view analytics.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getEventAnalytics();
        if (response.success) {
          setAnalytics(response.data);
        } else {
          setError('Failed to fetch analytics data');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isOrganizer]);

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <div className="no-data">
          <h2>No Analytics Data Available</h2>
          <p>Create some events to see your analytics.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Event Analytics Dashboard</h1>
        <p>Welcome back, {currentUser?.name}! Here's your event performance overview.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon events-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H9V12H7ZM11 10H13V12H11ZM15 10H17V12H15Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="metric-content">
            <h3>Total Events</h3>
            <p className="metric-number">{analytics.totalEvents}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon active-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="metric-content">
            <h3>Active Events</h3>
            <p className="metric-number">{analytics.activeEvents}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon revenue-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13.5 6C14.33 6 15 6.67 15 7.5S14.33 9 13.5 9 12 8.33 12 7.5 12.67 6 13.5 6ZM9.5 9C10.33 9 11 9.67 11 10.5S10.33 12 9.5 12 8 11.33 8 10.5 8.67 9 9.5 9ZM11.99 17.5C10.84 17.5 9.72 17.19 8.78 16.61L10.27 15.12C10.65 15.36 11.1 15.5 11.99 15.5S13.33 15.36 13.71 15.12L15.2 16.61C14.26 17.19 13.14 17.5 11.99 17.5Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-number">{formatCurrency(analytics.totalRevenue)}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon tickets-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 10V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V10C3.1 10 4 10.9 4 12S3.1 14 2 14V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V14C20.9 14 20 13.1 20 12S20.9 10 22 10ZM13 17.5H11V16.5H13V17.5ZM13 15.5H11V14.5H13V15.5ZM13 13.5H11V12.5H13V13.5ZM13 11.5H11V10.5H13V11.5ZM13 9.5H11V8.5H13V9.5ZM13 7.5H11V6.5H13V7.5Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="metric-content">
            <h3>Tickets Sold</h3>
            <p className="metric-number">{analytics.soldTickets}</p>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Event Status Breakdown</h3>
            <div className="stat-item">
              <span className="stat-label">Active Events</span>
              <span className="stat-value">{analytics.activeEvents}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed Events</span>
              <span className="stat-value">{analytics.completedEvents}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cancelled Events</span>
              <span className="stat-value">{analytics.cancelledEvents}</span>
            </div>
          </div>

          <div className="stat-card">
            <h3>Ticket Performance</h3>
            <div className="stat-item">
              <span className="stat-label">Total Tickets Available</span>
              <span className="stat-value">{analytics.totalTickets}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tickets Sold</span>
              <span className="stat-value">{analytics.soldTickets}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sales Rate</span>
              <span className="stat-value">{formatPercentage(analytics.ticketSalesRate)}</span>
            </div>
          </div>

          <div className="stat-card">
            <h3>Revenue Insights</h3>
            <div className="stat-item">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">{formatCurrency(analytics.totalRevenue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Ticket Price</span>
              <span className="stat-value">{formatCurrency(analytics.avgTicketPrice)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Revenue per Event</span>
              <span className="stat-value">
                {analytics.totalEvents > 0 
                  ? formatCurrency(analytics.totalRevenue / analytics.totalEvents)
                  : formatCurrency(0)
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars for Visual Appeal */}
      <div className="progress-section">
        <h3>Performance Indicators</h3>
        <div className="progress-items">
          <div className="progress-item">
            <div className="progress-header">
              <span>Ticket Sales Rate</span>
              <span>{formatPercentage(analytics.ticketSalesRate)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(analytics.ticketSalesRate, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Event Completion Rate</span>
              <span>
                {analytics.totalEvents > 0 
                  ? formatPercentage((analytics.completedEvents / analytics.totalEvents) * 100)
                  : '0%'
                }
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill completed" 
                style={{ 
                  width: analytics.totalEvents > 0 
                    ? `${(analytics.completedEvents / analytics.totalEvents) * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;