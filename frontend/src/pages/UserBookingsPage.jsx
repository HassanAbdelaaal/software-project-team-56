import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookingCard from './BookingCard';
import { fetchMyBookings } from '../api'; // Import the API function
import './Profile.css';

const UserBookingsPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  const getBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API function
      const result = await fetchMyBookings(currentUser._id);

      
      // Check the structure of the result to handle it properly
      if (result && (result.data || result.bookings)) {
        // Handle both possible response structures
        const bookingsData = result.data || result.bookings || [];
        setBookings(bookingsData);
        console.log('Bookings loaded:', bookingsData);
      } else {
        console.error('Unexpected response format:', result);
        setError('Failed to load bookings - unexpected data format');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'An error occurred while fetching your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getBookings();
    }
  }, [currentUser]);

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    // Safely handle possible missing data
    const bookingDate = booking?.event?.date ? new Date(booking.event.date) : null;
    const today = new Date();
    const status = (booking?.status || '').toLowerCase();
    
    switch (filter) {
      case 'upcoming':
        return bookingDate && bookingDate >= today && status !== 'cancelled';
      case 'past':
        return bookingDate && bookingDate < today && status !== 'cancelled';
      case 'cancelled':
        return status === 'cancelled';
      default:
        return true; // 'all' filter
    }
  });

  const handleStatusChange = (bookingId, newStatus) => {
    // Update booking status locally for immediate UI feedback
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking._id === bookingId ? {...booking, status: newStatus} : booking
      )
    );
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <div className="filter-controls">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-button ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past
          </button>
          <button 
            className={`filter-button ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      <div className="bookings-list">
        {loading ? (
          <div className="loading-spinner">Loading bookings...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-button" onClick={getBookings}>Try Again</button>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <BookingCard 
              key={booking._id} 
              booking={booking} 
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="no-bookings">
            <p>No {filter !== 'all' ? filter : ''} bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingsPage;