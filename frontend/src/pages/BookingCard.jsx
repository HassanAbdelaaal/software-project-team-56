import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cancelBooking } from '../api';
import './Profile.css';
import './BookingCard.css';  // Make sure this points to the right location

const BookingCard = ({ booking, onStatusChange }) => {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  // Check if booking is upcoming by comparing event date with current date
  const isUpcoming = booking?.event?.date ? 
    new Date(booking.event.date) >= new Date() : 
    false;

  const handleCancelBooking = async () => {
    try {
      setIsProcessing(true);
      const response = await cancelBooking(booking._id);
      
      if (response && response.success) {
        toast.success('Booking cancelled successfully');
        // Update the booking status in the UI
        if (onStatusChange) {
          onStatusChange(booking._id, 'Cancelled');
        }
      } else {
        toast.error(response?.message || 'Failed to cancel booking');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
      console.error('Cancel booking error:', error);
    } finally {
      setIsProcessing(false);
      setIsConfirmingCancel(false);
    }
  };

  const getStatusBadgeClass = () => {
    // Convert status to lowercase for consistency
    const status = booking.status?.toLowerCase() || 'confirmed';
    
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      // For backward compatibility
      case 'canceled': return 'status-cancelled';
      default: return 'confirmed';
    }
  };

  const ServiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  // Standardize status display
  const displayStatus = () => {
    if (!booking.status) return 'Pending';
    
    // Ensure first letter is capitalized and the rest is lowercase
    return booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase();
  };

  // Check if booking is already cancelled (case insensitive)
  const isCancelled = booking.status?.toLowerCase() === 'cancelled' || 
                       booking.status?.toLowerCase() === 'canceled';

  return (
    <div className={`booking-card ${isCancelled ? 'cancelled' : ''}`}>
      <div className="booking-header">
        <div className="booking-service">
          <ServiceIcon />
          <h3>{booking?.event?.title || 'Service'}</h3>
        </div>
        <div className={`booking-status ${getStatusBadgeClass()}`}>
          {displayStatus()}
        </div>
      </div>

      <div className="booking-details">
        <div className="booking-detail">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{formatDate(booking?.event?.date)}</span>
        </div>
        {booking?.startTime && booking?.endTime && (
          <div className="booking-detail">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
          </div>
        )}
        <div className="booking-detail">
          <span className="detail-label">Provider:</span>
          <span className="detail-value">{booking?.event?.providerName || 'N/A'}</span>
        </div>
        {booking?.event?.location && (
          <div className="booking-detail">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{booking.event.location}</span>
          </div>
        )}
        {booking?.ticketsBooked && (
          <div className="booking-detail">
            <span className="detail-label">Tickets:</span>
            <span className="detail-value">{booking.ticketsBooked}</span>
          </div>
        )}
        {booking?.totalPrice && (
          <div className="booking-detail">
            <span className="detail-label">Total Price:</span>
            <span className="detail-value">${booking.totalPrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="booking-actions">
        <Link to={`/bookings/${booking._id}`} className="booking-action-button view-details">
          View Details
        </Link>

        {isUpcoming && !isCancelled && !isConfirmingCancel && (
          <button
            className="booking-action-button cancel"
            onClick={() => setIsConfirmingCancel(true)}
            disabled={isProcessing}
          >
            Cancel Booking
          </button>
        )}

        {isConfirmingCancel && (
          <div className="cancel-confirmation">
            <p>Are you sure you want to cancel?</p>
            <div className="cancel-actions">
              <button
                className="cancel-action-button confirm"
                onClick={handleCancelBooking}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Yes, Cancel'}
              </button>
              <button
                className="cancel-action-button reject"
                onClick={() => setIsConfirmingCancel(false)}
                disabled={isProcessing}
              >
                No, Keep
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;