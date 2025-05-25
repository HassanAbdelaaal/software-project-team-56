import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMyEvents, updateEvent, deleteEvent } from '../../api';
import { toast } from 'react-toastify';
import './MyEvents.css';

const MyEvents = () => {
  const { currentUser, isOrganizer } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!isOrganizer) {
      toast.error('Access denied. Only organizers can view this page.');
      return;
    }
    loadMyEvents();
  }, [isOrganizer]);

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      const response = await fetchMyEvents();
      setEvents(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event._id);
    setEditForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      category: event.category,
      ticketPrice: event.ticketPrice,
      totalTickets: event.totalTickets,
      image: event.image || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditForm({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateEvent = async (eventId) => {
    try {
      // Validate required fields
      if (!editForm.title || !editForm.description || !editForm.date || 
          !editForm.location || !editForm.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate date is in the future
      if (new Date(editForm.date) <= new Date()) {
        toast.error('Event date must be in the future');
        return;
      }

      // Validate ticket price and total tickets
      if (editForm.ticketPrice < 0) {
        toast.error('Ticket price must be positive');
        return;
      }

      if (editForm.totalTickets < 0) {
        toast.error('Total tickets must be at least 0');
        return;
      }

      const response = await updateEvent(eventId, editForm);
      
      // Update the events list with the updated event
      setEvents(prev => prev.map(event => 
        event._id === eventId ? response.data : event
      ));
      
      setEditingEvent(null);
      setEditForm({});
      toast.success('Event updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update event');
    }
  };

  const handleDeleteClick = (eventId) => {
    setDeleteConfirm(eventId);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event._id !== eventId));
      setDeleteConfirm(null);
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-active',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  if (!isOrganizer) {
    return (
      <div className="my-events-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only organizers can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-events-container">
        <div className="loading">Loading your events...</div>
      </div>
    );
  }

  return (
    <div className="my-events-container">
      <div className="header">
        <h1>My Events</h1>
        <p>Manage your events - edit details or remove events as needed</p>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <h3>No events found</h3>
          <p>You haven't created any events yet.</p>
          <a href="/organizer/events/new" className="btn btn-primary">Create Your First Event</a>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event._id} className="event-card">
              {editingEvent === event._id ? (
                // Edit Form
                <div className="edit-form">
                  <h3>Edit Event</h3>
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateEvent(event._id); }}>
                    <div className="form-group">
                      <label htmlFor="title">Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={editForm.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description *</label>
                      <textarea
                        id="description"
                        name="description"
                        value={editForm.description}
                        onChange={handleInputChange}
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="date">Date & Time *</label>
                        <input
                          type="datetime-local"
                          id="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="location">Location *</label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={editForm.location}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                          id="category"
                          name="category"
                          value={editForm.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Music">Music</option>
                          <option value="Sports">Sports</option>
                          <option value="Theater">Theater</option>
                          <option value="Conference">Conference</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="ticketPrice">Ticket Price ($) *</label>
                        <input
                          type="number"
                          id="ticketPrice"
                          name="ticketPrice"
                          value={editForm.ticketPrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="totalTickets">Total Tickets *</label>
                      <input
                        type="number"
                        id="totalTickets"
                        name="totalTickets"
                        value={editForm.totalTickets}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="image">Image URL</label>
                      <input
                        type="url"
                        id="image"
                        name="image"
                        value={editForm.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Event Display
                <div className="event-content">
                  {event.image && (
                    <div className="event-image">
                      <img src={event.image} alt={event.title} />
                    </div>
                  )}
                  
                  <div className="event-info">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-details">
                      <div className="detail-item">
                        <span className="icon">📅</span>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">🏷️</span>
                        <span>{event.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">💰</span>
                        <span>${event.ticketPrice}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">🎫</span>
                        <span>{event.remainingTickets} / {event.totalTickets} available</span>
                      </div>
                    </div>

                    <div className="event-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEditClick(event)}
                      >
                        Edit Event
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteClick(event._id)}
                      >
                        Delete Event
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteEvent(deleteConfirm)}
              >
                Yes, Delete
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;