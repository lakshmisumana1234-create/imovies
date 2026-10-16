import React, { useState } from 'react';

export default function ListYourShowModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'play', // 'play', 'sport', or 'movie'
    theaterName: '',
    place: 'Bengaluru',
    ticketPrice: '',
    time: '7:30 PM',
    posterUrl: '',
    language: 'English',
    format: '2D' // default format for movies
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://imovies-backend-91io.onrender.com/api/shows/list-your-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert('Event/Show successfully listed!');
        if (onSuccess) onSuccess(result.show);
        onClose();
      } else {
        setError(result.message || 'Failed to list show. Please check your fields.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#111827', color: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid #1f2937', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>List Your Show / Movie / Event</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {error && <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={labelStyle}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
            <option value="play">Play / Theatre Event</option>
            <option value="sport">Sport / Match</option>
            <option value="movie">Movie</option>
          </select>

          <label style={labelStyle}>Title</label>
          <input type="text" name="title" placeholder="e.g. RCB vs CSK T20 / Tughlaq" value={formData.title} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Venue / Theater Name</label>
          <input type="text" name="theaterName" placeholder="e.g. M. Chinnaswamy Stadium" value={formData.theaterName} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Location / Place</label>
          <input type="text" name="place" placeholder="e.g. Cubbon Park, Bengaluru" value={formData.place} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Ticket Price (₹)</label>
          <input type="number" name="ticketPrice" placeholder="300" value={formData.ticketPrice} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Showtime</label>
          <input type="text" name="time" placeholder="7:30 PM" value={formData.time} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Language</label>
          <input type="text" name="language" placeholder="English / Kannada" value={formData.language} onChange={handleChange} required style={inputStyle} />

          {formData.category === 'movie' && (
            <>
              <label style={labelStyle}>Format</label>
              <input type="text" name="format" placeholder="2D / 3D / IMAX" value={formData.format} onChange={handleChange} required style={inputStyle} />
            </>
          )}

          <label style={labelStyle}>Poster Image URL</label>
          <input type="url" name="posterUrl" placeholder="https://image.url/poster.jpg" value={formData.posterUrl} onChange={handleChange} required style={inputStyle} />

          <button type="submit" disabled={loading} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  color: '#ffffff',
  padding: '10px 14px',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
  width: '100%'
};

const labelStyle = {
  fontSize: '13px',
  color: '#9ca3af',
  fontWeight: '600'
};