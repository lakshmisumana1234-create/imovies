import React, { useState } from 'react';

export default function MovieDetails({ item, onBack, onSelectSeat }) {
  const isEvent = item.category === 'play' || item.category === 'sport' || !item.formats;
  const [selectedFormat, setSelectedFormat] = useState('2D');

  const handleBooking = (timeSlot) => {
    // Construct selected payload for seat selection
    const bookingPayload = {
      ...item,
      showId: item._id,
      selectedTime: timeSlot || item.time || '7:30 PM',
      selectedFormat: isEvent ? 'Live' : selectedFormat,
      ticketPrice: item.ticketPrice || 300,
      theaterName: item.theaterName || 'Venue',
      place: item.place || 'Bengaluru'
    };

    if (onSelectSeat) {
      onSelectSeat(bookingPayload);
    } else {
      console.error("onSelectSeat prop is missing in MovieDetails!");
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ padding: '16px 40px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }}>
        <button 
          onClick={onBack} 
          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }}
        >
          &larr; Back
        </button>
      </div>

      {/* Main Banner */}
      <div style={{ backgroundColor: '#111827', padding: '40px', borderBottom: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <img 
            src={item.posterUrl} 
            alt={item.title} 
            style={{ width: '220px', height: '320px', borderRadius: '12px', objectFit: 'cover' }} 
          />

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 12px 0' }}>{item.title}</h1>
            
            <p style={{ color: '#d1d5db', fontSize: '15px', margin: '0 0 24px 0' }}>
              {item.language} &bull; {item.place || 'Bengaluru'}
            </p>

            {/* Cinema Format Selector (Movies Only) */}
            {!isEvent && (
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '14px', color: '#9ca3af', marginRight: '12px', fontWeight: 'bold' }}>Select Format:</span>
                {['2D', '3D', '4DX', 'IMAX 2D'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    style={{
                      backgroundColor: selectedFormat === fmt ? '#ef4444' : '#1f2937',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      marginRight: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}

            <div>
              <button 
                onClick={() => handleBooking(item.time)}
                style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
              >
                Book Tickets &bull; ₹{item.ticketPrice || 300}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot / Venue Display */}
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', borderLeft: '4px solid #ef4444', paddingLeft: '12px' }}>
          {isEvent ? 'Available Venue & Time Slot' : `Available Theaters (${selectedFormat})`}
        </h2>

        <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#f3f4f6' }}>
              📍 {item.theaterName || 'Venue'}
            </h3>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
              {item.place || 'Bengaluru'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => handleBooking(item.time)}
              style={{ backgroundColor: 'transparent', border: '1.5px solid #10b981', color: '#10b981', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              {item.time || '7:30 PM'}
            </button>

            <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>
              ₹{item.ticketPrice || 300}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}