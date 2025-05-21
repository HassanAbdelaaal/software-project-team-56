import React, { useState, useEffect } from 'react';
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

  const categories = ['all', ...new Set(events.map(event => event.category).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    if (filter === 'all') return matchesSearch && matchesCategory;
    if (filter === 'upcoming') {
      return matchesSearch && matchesCategory && new Date(event.date) > new Date();
    }
    if (filter === 'free') {
      return matchesSearch && matchesCategory && (!event.ticketPrice || event.ticketPrice === 0);
    }
    
    return matchesSearch && matchesCategory;
  });

  const featuredEvents = events.slice(0, 3); // top 3 events for carousel

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true
  };

  return (
    <div className="events-page">
      <div className="events-hero">
        <div className="hero-content">
          <h1>Discover Extraordinary Events</h1>
          <p>Explore and secure your spot at the most exciting gatherings in your area</p>
          <div className="hero-search-container">
            <input
              type="text"
              placeholder="Search for events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
            <button className="hero-search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {!loading && featuredEvents.length > 0 && (
        <div className="featured-events-section">
          <h2 className="section-title">Featured Events</h2>
          <div className="featured-carousel">
            <Slider {...sliderSettings}>
              {featuredEvents.map(event => (
                <div key={event._id} className="carousel-slide">
                  <div className="featured-card">
                    <div className="featured-image" style={{ backgroundImage: `url(${event.imageUrl || '/default-event.jpg'})` }}>
                      {event.ticketPrice === 0 && <span className="event-badge free-badge">Free</span>}
                      {new Date(event.date) > new Date() && <span className="event-badge upcoming-badge">Upcoming</span>}
                    </div>
                    <div className="featured-content">
                      <h3>{event.title}</h3>
                      <p className="featured-date">
                        <i className="far fa-calendar-alt"></i> {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="featured-location">
                        <i className="fas fa-map-marker-alt"></i> {event.location}
                      </p>
                      <p className="featured-description">{event.description?.substring(0, 120)}...</p>
                      <button className="view-details-btn">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

      <div className="events-container">
        <div className="filter-bar">
          <div className="filter-group">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="free">Free Events</option>
            </select>
            
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

          <div className="search-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div className="events-results">
          <div className="results-header">
            <h2 className="section-title">
              {searchTerm ? `Results for "${searchTerm}"` : 'All Events'}
            </h2>
            <span className="event-count">{filteredEvents.length} events found</span>
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
    </div>
  );
};

export default EventsPage;