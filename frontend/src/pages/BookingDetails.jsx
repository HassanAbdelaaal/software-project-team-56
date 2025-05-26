import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookingById } from '../api';
import './BookingDetails.css';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await getBookingById(bookingId);
        if (response.success) {
          setBooking(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch booking details');
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error(error.message || 'Error loading booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return <div className="booking-details-loading">Loading...</div>;
  }

  if (!booking) {
    return <div className="booking-details-error">Booking not found</div>;
  }

  return (
    <div className="booking-details-container">
      <h1>Booking Details</h1>
      
      <div className="booking-details-card">
        <div className="booking-details-section">
          <h2>{booking?.event?.title || 'Event'}</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="status-badge confirmed">
                Confirmed
              </span>
            </div>
            
            <div className="detail-item">
              <span className="label">Date:</span>
              <span>{formatDate(booking?.event?.date)}</span>
            </div>

            <div className="detail-item">
              <span className="label">Time:</span>
              <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
            </div>

            <div className="detail-item">
              <span className="label">Provider:</span>
              <span>{booking?.event?.providerName || 'N/A'}</span>
            </div>

            <div className="detail-item">
              <span className="label">Location:</span>
              <span>{booking?.event?.location || 'N/A'}</span>
            </div>

            <div className="detail-item">
              <span className="label">Tickets Booked:</span>
              <span>{booking.ticketsBooked || 'N/A'}</span>
            </div>

            <div className="detail-item">
              <span className="label">Total Price:</span>
              <span>${booking.totalPrice?.toFixed(2) || 'N/A'}</span>
            </div>
          </div>
        </div>

        {booking?.event?.description && (
          <div className="booking-details-section">
            <h3>Event Description</h3>
            <p>{booking.event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails; 


//<span className="label">Status:</span>
//<span className={`status-badge ${booking.status?.toLowerCase()}`}>
//{booking.status}
//</span>