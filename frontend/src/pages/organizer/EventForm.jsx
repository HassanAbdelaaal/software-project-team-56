import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createEvent, fetchEventById, updateEvent } from '../../api';
import './EventForm.css';

const EventForm = () => {
  const { eventId } = useParams(); // optional param for edit
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    capacity: '',
    totalTickets: '',
    remainingTickets: '',
    ticketPrice: '',
    category: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const isEditMode = Boolean(eventId);

  useEffect(() => {
    if (isEditMode) {
      const fetchEventData = async () => {
        try {
          setLoading(true);
          const event = await fetchEventById(eventId);
          setFormData({
            title: event.title || '',
            description: event.description || '',
            location: event.location || '',
            date: event.date?.substring(0, 16) || '',
            capacity: event.capacity?.toString() || '',
            totalTickets: event.totalTickets?.toString() || '',
            remainingTickets: event.remainingTickets?.toString() || '',
            ticketPrice: event.ticketPrice?.toString() || '',
            category: event.category || '',
            imageUrl: event.imageUrl || '',
          });
        } catch (err) {
          toast.error('Failed to load event data');
          setFormError('Unable to load event data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchEventData();
    }
  }, [eventId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10) || 0,
        totalTickets: parseInt(formData.totalTickets, 10) || 0,
        remainingTickets: parseInt(formData.remainingTickets, 10) || 0,
        ticketPrice: parseFloat(formData.ticketPrice) || 0,
      };

      if (isEditMode) {
        await updateEvent(eventId, payload);
        toast.success('Event updated successfully');
      } else {
        await createEvent(payload);
        toast.success('Event created successfully');
      }

      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
      toast.error(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="event-form-container">
        <div className="form-loading">
          <div className="form-loading-spinner"></div>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-page">
      <div className="event-form-container">
        <div className="form-header">
          <h2>{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
          <p className="form-subtitle">
            {isEditMode 
              ? 'Update your event details below' 
              : 'Fill in the details to create your event'
            }
          </p>
        </div>

        {formError && (
          <div className="form-error-message">
            <i className="fas fa-exclamation-circle"></i> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event location"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date & Time</label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Max attendees"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Event category"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalTickets">Total Tickets</label>
              <input
                type="number"
                id="totalTickets"
                name="totalTickets"
                value={formData.totalTickets}
                onChange={handleChange}
                placeholder="Available tickets"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="remainingTickets">Remaining Tickets</label>
              <input
                type="number"
                id="remainingTickets"
                name="remainingTickets"
                value={formData.remainingTickets}
                onChange={handleChange}
                placeholder="Tickets left"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ticketPrice">Ticket Price ($)</label>
              <input
                type="number"
                step="0.01"
                id="ticketPrice"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                placeholder="0.00 for free events"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL (Optional)</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="URL to event image"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={submitting}
            >
              {submitting 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Event' : 'Create Event')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;