import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents } from '../api';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './EventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error(error.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  const handleBookNow = (eventId) => {
    navigate(`/events/${eventId}?action=book`);
  };

  const handleMoreInfo = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const categories = ['all', ...new Set(events.map(event => event.category).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    // Filter by the main filter tabs
    let matchesFilter = true;
    if (filter === 'Music') {
      matchesFilter = event.category === 'Music';
    } else if (filter === 'Sports') {
      matchesFilter = event.category === 'Sports';
    }
    // 'all' filter shows all events regardless of category from filter tabs
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const featuredEvents = events.slice(0, 3);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: true,
    pauseOnHover: true,
    fade: true,
    cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)'
  };

  return (
    <div className="events-page">
      {/* Hero Featured Event */}
      {!loading && featuredEvents.length > 0 && (
        <div className="hero-featured-section">
          <Slider {...sliderSettings} className="hero-slider">
            {featuredEvents.map(event => (
              <div key={event._id} className="hero-slide">
                <div className="hero-content">
                  <div className="hero-left">
                    <div className="event-meta">
                      <h1 className="hero-title">{event.title}</h1>
                      <div className="hero-details">
                        <span className="hero-date">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })} | {new Date(event.date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                        <span className="hero-location">{event.location}</span>
                      </div>
                      <div className="organizer-info">
                        <span>Organized by</span>
                        <div className="organizer-logo">other.</div>
                      </div>
                      <div className="hero-actions">
                        <button 
                          className="book-now-btn"
                          onClick={() => handleBookNow(event._id)}
                        >
                          <i className="fas fa-ticket-alt"></i>
                          Book Now
                        </button>
                        <button 
                          className="more-info-btn"
                          onClick={() => handleMoreInfo(event._id)}
                        >
                          More Info
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="hero-right">
                    <div className="hero-image" style={{ backgroundImage: `url(${event.image || '/default-event.jpg'})` }}>
                      <div className="hero-brand">Cairo</div>
                      <div className="hero-event-text">
                        <div className="event-name">{event.title.toUpperCase()}</div>
                        <div className="event-date-large">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          }).toUpperCase()}
                        </div>
                        <div className="event-location-large">{event.location.split('-')[1]?.trim().toUpperCase() || 'CAIRO'}</div>
                        <div className="event-venue">{event.location.split('-')[0]?.trim().toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Hot Events Section */}
      <div className="hot-events-section">
        <div className="section-header">
          <h2 className="section-title">Hot Events</h2>
          <div className="navigation-arrows">
            <button className="nav-arrow prev">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="nav-arrow next">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="hot-events-grid">
          {filteredEvents.slice(0, 4).map(event => (
            <EventCard key={event._id} event={event} compact={true} />
          ))}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search for events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={`filter-tab ${filter === 'Sports' ? 'active' : ''}`}
            onClick={() => setFilter('Sports')}
          >
            Sports
          </button>
          <button 
            className={`filter-tab ${filter === 'Music' ? 'active' : ''}`}
            onClick={() => setFilter('Music')}
          >
            Music
          </button>
        </div>

        <div className="category-filter">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Results */}
      <div className="events-results-section">
        <div className="results-info">
          <h3 className="results-title">
            {searchTerm ? `Results for "${searchTerm}"` : 'All Events'}
          </h3>
          <span className="results-count">{filteredEvents.length} events found</span>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading amazing events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="no-events">
            <div className="no-events-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
            <h3>No events found</h3>
            <p>Try adjusting your search criteria or browse all events</p>
            <button 
              className="reset-button" 
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;