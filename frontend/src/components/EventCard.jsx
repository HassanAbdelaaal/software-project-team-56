import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate if event is upcoming
  const isUpcoming = new Date(event.date) > new Date();
  
  // Format ticket price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="event-card">
      <div className="event-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <div className="placeholder-image">
            <span>{event.title.charAt(0)}</span>
          </div>
        )}
        {isUpcoming && <span className="event-badge upcoming">Upcoming</span>}
        {(!event.ticketPrice || event.ticketPrice === 0) && 
          <span className="event-badge free">Free</span>
        }
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date">
          <i className="fas fa-calendar"></i> {formatDate(event.date)}
        </p>
        <p className="event-location">
          <i className="fas fa-map-marker-alt"></i> {event.location}
        </p>
        <p className="event-description">{event.description?.substring(0, 100)}...</p>
        
        <div className="event-footer">
          <span className="event-price">{formatPrice(event.ticketPrice)}</span>
          <Link to={`/events/${event._id}`} className="view-details">
            View Details
          </Link>
        </div>
        
        {event.remainingTickets <= 10 && event.remainingTickets > 0 && (
          <div className="tickets-remaining low">
            Only {event.remainingTickets} tickets remaining!
          </div>
        )}
        
        {event.remainingTickets === 0 && (
          <div className="tickets-remaining sold-out">
            Sold Out
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;