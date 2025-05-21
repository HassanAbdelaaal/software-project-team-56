import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventById } from '../api';
import { toast } from 'react-toastify';
import './EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchEventById(eventId);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error(error.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    getEventDetails();
  }, [eventId]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format ticket price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  // Calculate if event is upcoming
  const isUpcoming = event && new Date(event.date) > new Date();
  
  // Check if event is sold out
  const isSoldOut = event && event.remainingTickets === 0;
  
  // Calculate total price
  const calculateTotal = () => {
    if (!event || !event.ticketPrice) return 0;
    return (event.ticketPrice * ticketCount).toFixed(2);
  };

  // Handle ticket purchase
  const handlePurchase = () => {
    toast.success(`Successfully reserved ${ticketCount} ticket(s) for ${event.title}`);
    // In a real application, you would make an API call here to reserve the tickets
  };

  if (loading) {
    return (
      <div className="event-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-not-found">
        <div className="not-found-icon">
          <i className="fas fa-calendar-times"></i>
        </div>
        <h2>Event Not Found</h2>
        <p>The event you're looking for could not be found.</p>
        <Link to="/events" className="back-to-events">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        <div className="event-details-header">
          <Link to="/events" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Events
          </Link>
          <div className="event-badges">
            {isUpcoming && <span className="event-badge upcoming">Upcoming</span>}
            {(!event.ticketPrice || event.ticketPrice === 0) && 
              <span className="event-badge free">Free</span>
            }
            {event.category && 
              <span className="event-badge category">{event.category}</span>
            }
          </div>
        </div>

        <div className="event-details-content">
          <div className="event-details-main">
            {event.imageUrl ? (
              <div className="event-full-image">
                <img src={event.imageUrl} alt={event.title} />
              </div>
            ) : (
              <div className="event-placeholder-large">
                <span>{event.title.charAt(0)}</span>
              </div>
            )}

            <h1 className="event-details-title">{event.title}</h1>
            
            <div className="event-meta">
              <div className="event-meta-item">
                <i className="fas fa-calendar"></i>
                <div>
                  <span className="meta-label">Date & Time</span>
                  <span className="meta-value">{formatDate(event.date)}</span>
                </div>
              </div>
              
              <div className="event-meta-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{event.location}</span>
                </div>
              </div>
              
              <div className="event-meta-item">
                <i className="fas fa-ticket-alt"></i>
                <div>
                  <span className="meta-label">Price</span>
                  <span className="meta-value">{formatPrice(event.ticketPrice)}</span>
                </div>
              </div>
            </div>

            <div className="event-description-section">
              <h3>About This Event</h3>
              <div className="event-full-description">
                {event.description}
              </div>
            </div>

            {event.organizer && (
              <div className="event-organizer-section">
                <h3>Organizer</h3>
                <div className="organizer-info">
                  <div className="organizer-avatar">
                    {event.organizer.avatar ? (
                      <img src={event.organizer.avatar} alt={event.organizer.name} />
                    ) : (
                      <span>{event.organizer.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="organizer-details">
                    <h4>{event.organizer.name}</h4>
                    {event.organizer.bio && <p>{event.organizer.bio}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="event-ticket-section">
            <div className="ticket-card">
              <h3>Get Tickets</h3>
              
              {isSoldOut ? (
                <div className="sold-out-message">
                  <i className="fas fa-ticket-alt"></i>
                  <span>Sold Out</span>
                  <p>This event is no longer available for booking.</p>
                </div>
              ) : !isUpcoming ? (
                <div className="event-passed-message">
                  <i className="fas fa-calendar-times"></i>
                  <span>Event Has Ended</span>
                  <p>This event is no longer available for booking.</p>
                </div>
              ) : (
                <>
                  <div className="ticket-info">
                    <div className="price-display">
                      <span className="price-label">Price:</span>
                      <span className="price-amount">{formatPrice(event.ticketPrice)}</span>
                    </div>
                    
                    {event.remainingTickets > 0 && (
                      <div className="tickets-left">
                        <i className="fas fa-ticket-alt"></i>
                        {event.remainingTickets <= 10 ? (
                          <span className="low-tickets">Only {event.remainingTickets} tickets left!</span>
                        ) : (
                          <span>{event.remainingTickets} tickets available</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ticket-quantity">
                    <label htmlFor="ticket-count">Number of Tickets:</label>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn minus"
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        disabled={ticketCount <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input 
                        type="number" 
                        id="ticket-count"
                        min="1" 
                        max={event.remainingTickets} 
                        value={ticketCount} 
                        onChange={(e) => setTicketCount(Math.min(event.remainingTickets, Math.max(1, parseInt(e.target.value) || 1)))}
                      />
                      <button 
                        className="quantity-btn plus"
                        onClick={() => setTicketCount(Math.min(event.remainingTickets, ticketCount + 1))}
                        disabled={ticketCount >= event.remainingTickets}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  {event.ticketPrice > 0 && (
                    <div className="total-price">
                      <span>Total:</span>
                      <span className="total-amount">${calculateTotal()}</span>
                    </div>
                  )}
                  
                  <button 
                    className="purchase-btn"
                    onClick={handlePurchase}
                    disabled={isSoldOut || !isUpcoming}
                  >
                    {event.ticketPrice > 0 ? 'Purchase Tickets' : 'Register for Free'}
                  </button>
                </>
              )}
            </div>

            {event.location && (
              <div className="location-card">
                <h3>Location</h3>
                <p className="location-address">{event.location}</p>
                <div className="location-map">
                  {/* In a real application, you would integrate with Google Maps or similar */}
                  <div className="map-placeholder">
                    <i className="fas fa-map-marked-alt"></i>
                    <span>Map view not available in demo</span>
                  </div>
                </div>
              </div>
            )}
            
            {event.additionalInfo && (
              <div className="additional-info-card">
                <h3>Additional Information</h3>
                <div className="additional-info-content">
                  {event.additionalInfo}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;