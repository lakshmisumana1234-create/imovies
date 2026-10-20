import React from 'react';

export default function MovieDetails({ show, onBack, onProceedToSeats }) {
  // 🛡️ Guard Clause: Prevents blank screen if show object is null or undefined
  if (!show) {
    return (
      <div style={{ 
        backgroundColor: '#0b0f19', 
        color: '#ffffff', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'sans-serif' 
      }}>
        <h2>No show selected</h2>
        <button 
          onClick={onBack} 
          style={{ 
            backgroundColor: '#ef4444', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            marginTop: '15px',
            fontWeight: 'bold'
          }}
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  // Safe category check with optional chaining fallback
  const category = show?.category || 'movie';

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      
      {/* Back Button */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 20px auto' }}>
        <button 
          onClick={onBack} 
          style={{ 
            backgroundColor: '#1f2937', 
            color: '#9ca3af', 
            border: '1px solid #374151', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Main Details Section */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        backgroundColor: '#111827', 
        borderRadius: '12px', 
        border: '1px solid #1f2937', 
        display: 'flex', 
        gap: '30px', 
        padding: '30px',
        flexWrap: 'wrap'
      }}>
        
        {/* Poster Image */}
        <img 
          src={show?.posterUrl || 'https://via.placeholder.com/300x420'} 
          alt={show?.title || 'Poster'} 
          style={{ width: '280px', height: '400px', borderRadius: '8px', objectFit: 'cover' }} 
        />

        {/* Info Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Category Tag */}
            <span style={{ 
              backgroundColor: category === 'play' ? '#8b5cf6' : category === 'sport' ? '#3b82f6' : '#ef4444', 
              color: '#fff', 
              padding: '4px 12px', 
              borderRadius: '4px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {category}
            </span>

            <h1 style={{ fontSize: '32px', margin: '15px 0 10px 0', fontWeight: '800' }}>
              {show?.title || 'Untitled Show'}
            </h1>

            <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
              ⭐ 9.1/10 (15K Votes)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#d1d5db', fontSize: '14px', margin: '20px 0' }}>
              <p style={{ margin: 0 }}>📍 <strong>Venue / Theater:</strong> {show?.theaterName || 'Bengaluru Venue'}</p>
              <p style={{ margin: 0 }}>🏙️ <strong>Location:</strong> {show?.place || 'Bengaluru'}</p>
              <p style={{ margin: 0 }}>🕒 <strong>Show Time:</strong> {show?.time || '7:00 PM'}</p>
              <p style={{ margin: 0 }}>🌐 <strong>Language & Format:</strong> {show?.language || 'English'} ({show?.format || '2D'})</p>
              <p style={{ margin: 0 }}>🎟️ <strong>Ticket Price:</strong> ₹{show?.ticketPrice || 250}</p>
            </div>
          </div>

          {/* Proceed to Seat Selection Button */}
          <button 
            onClick={() => onProceedToSeats && onProceedToSeats(show)} 
            style={{ 
              backgroundColor: '#ef4444', 
              color: '#fff', 
              border: 'none', 
              padding: '14px 28px', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              width: 'fit-content'
            }}
          >
            Select Seats
          </button>
        </div>

      </div>
    </div>
  );
}