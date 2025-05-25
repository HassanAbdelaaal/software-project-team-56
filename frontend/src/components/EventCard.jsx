import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event, compact = false }) => {
  const navigate = useNavigate();

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Calculate if event is upcoming
  const isUpcoming = new Date(event.date) > new Date();
  
  // Format ticket price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    navigate(`/events/${event._id}?action=book`);
  };

  const handleMoreInfo = (e) => {
    e.preventDefault();
    navigate(`/events/${event._id}`);
  };

  const dateFormatted = formatDate(event.date);

  if (compact) {
    return (
      <div className="event-card compact">
        <div className="event-image">
          <img 
            src={event.image || '/default-event.jpg'} 
            alt={event.title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="placeholder-image" style={{ display: 'none' }}>
            <span>{event.title.charAt(0)}</span>
          </div>
          <div className="event-overlay">
            <div className="event-date-badge">
              <span className="day">{dateFormatted.day}</span>
              <span className="month">{dateFormatted.month}</span>
            </div>
            <div className="event-actions">
              <button className="btn-book" onClick={handleBookNow}>
                <i className="fas fa-ticket-alt"></i>
              </button>
              <button className="btn-info" onClick={handleMoreInfo}>
                <i className="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="event-content">
          <h3 className="event-title">{event.title}</h3>
          <p className="event-location">
            <i className="fas fa-map-marker-alt"></i>
            {event.location}
          </p>
          <div className="event-footer">
            <span className="event-price">{formatPrice(event.ticketPrice)}</span>
            <span className="event-time">{dateFormatted.time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-card">
      <div className="event-image">
        <img 
          src={event.image || '/default-event.jpg'} 
          alt={event.title}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="placeholder-image" style={{ display: 'none' }}>
          <span>{event.title.charAt(0)}</span>
        </div>
        <div className="event-overlay">
          <div className="event-badges">
            {isUpcoming && <span className="event-badge upcoming">Upcoming</span>}
            {(!event.ticketPrice || event.ticketPrice === 0) && 
              <span className="event-badge free">Free</span>
            }
          </div>
          <div className="event-date-badge">
            <span className="day">{dateFormatted.day}</span>
            <span className="month">{dateFormatted.month}</span>
          </div>
        </div>
      </div>
      
      <div className="event-content">
        <div className="event-meta">
          <h3 className="event-title">{event.title}</h3>
          <p className="event-time">
            <i className="fas fa-clock"></i> {dateFormatted.time}
          </p>
          <p className="event-location">
            <i className="fas fa-map-marker-alt"></i> {event.location}
          </p>
        </div>
        
        <p className="event-description">
          {event.description?.substring(0, 120)}...
        </p>
        
        <div className="event-footer">
          <div className="event-price-section">
            <span className="price-label">From</span>
            <span className="event-price">{formatPrice(event.ticketPrice)}</span>
          </div>
          <div className="event-actions">
            <button className="btn-more-info" onClick={handleMoreInfo}>
              More Info
            </button>
            <button className="btn-book-now" onClick={handleBookNow}>
              <i className="fas fa-ticket-alt"></i>
              Book Now
            </button>
          </div>
        </div>
        
        {event.remainingTickets <= 10 && event.remainingTickets > 0 && (
          <div className="tickets-remaining low">
            <i className="fas fa-exclamation-triangle"></i>
            Only {event.remainingTickets} tickets left!
          </div>
        )}
        
        {event.remainingTickets === 0 && (
          <div className="tickets-remaining sold-out">
            <i className="fas fa-times-circle"></i>
            Sold Out
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;