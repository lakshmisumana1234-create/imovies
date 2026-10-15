import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MovieDetails({ show, onBack, onProceedToSeats }) {
  const [selectedFormat, setSelectedFormat] = useState('2D');
  const [allShows, setAllShows] = useState([]);

  const formats = ['2D', '3D', '4DX', 'IMAX 2D'];

  useEffect(() => {
    axios.get('https://imovies-backend-9iio.onrender.com/api/shows')
      .then((res) => {
        if (res.data && res.data.shows) {
          const movieShows = res.data.shows.filter(s => s.title.toLowerCase() === show.title.toLowerCase());
          setAllShows(movieShows);
        }
      })
      .catch((err) => console.error("Error fetching shows:", err));
  }, [show.title]);

  const matchingTheaters = allShows.filter(s => s.format.toLowerCase().includes(selectedFormat.toLowerCase()));

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }}>
        <h1 style={{ color: '#ef4444', fontSize: '24px', fontWeight: '900', margin: 0, cursor: 'pointer' }} onClick={onBack}>iMovies</h1>
        <span style={{ fontSize: '14px', color: '#9ca3af' }}>📍 Bengaluru</span>
      </nav>

      <div style={{ position: 'relative', width: '100%', background: 'linear-gradient(90deg, #0b0f19 0%, #111827 100%)', display: 'flex', alignItems: 'center', padding: '40px 80px', gap: '40px', borderBottom: '1px solid #1f2937' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: '20px', left: '40px', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '15px' }}>
          &larr; Back to Movies
        </button>

        <img src={show.posterUrl} alt={show.title} style={{ width: '220px', height: '320px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 10px 25px rgba(0,0,0,0.6)' }} />

        <div>
          <h2 style={{ fontSize: '38px', fontWeight: '800', margin: '0 0 10px 0' }}>{show.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1f2937', padding: '8px 14px', borderRadius: '8px', width: 'fit-content', marginBottom: '20px' }}>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>⭐ 9.1 / 10</span>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>(15.2K Votes)</span>
          </div>

          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 20px 0' }}>
            2h 41m &bull; Action, Adventure, Sci-Fi &bull; UA13+ &bull; {show.language}
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#9ca3af' }}>Select Format:</span>
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  backgroundColor: selectedFormat === fmt ? '#ef4444' : '#1f2937',
                  color: '#fff',
                  border: selectedFormat === fmt ? 'none' : '1px solid #374151',
                  cursor: 'pointer'
                }}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#e5e7eb' }}>
          Available Theaters in Bengaluru ({selectedFormat})
        </h3>

        {matchingTheaters.length === 0 ? (
          <div style={{ backgroundColor: '#111827', padding: '30px', borderRadius: '10px', textAlign: 'center', color: '#9ca3af', border: '1px solid #1f2937' }}>
            No shows available for {show.title} in {selectedFormat}. Try selecting another format above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {matchingTheaters.map((theaterShow) => (
              <div key={theaterShow._id} style={{ backgroundColor: '#111827', padding: '20px 25px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#fff' }}>📍 {theaterShow.theaterName}</h4>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Format: <strong style={{ color: '#10b981' }}>{theaterShow.format}</strong> &bull; Language: {theaterShow.language}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>{theaterShow.time}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>₹{theaterShow.ticketPrice} onwards</span>
                  </div>

                  <button
                    onClick={() => onProceedToSeats(theaterShow)}
                    style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}