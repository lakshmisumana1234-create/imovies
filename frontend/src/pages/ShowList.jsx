import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ShowList({ onSelectShow }) {
  const [shows, setShows] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('https://imovies-backend-cthn.onrender.com/api/shows')
      .then((res) => { 
        if (res.data && res.data.shows) {
          setShows(res.data.shows);
        }
      })
      .catch((err) => console.error("Error fetching shows:", err));
  }, []);

  const filteredShows = shows.filter(show => {
    const title = show?.title || '';
    const theater = show?.theaterName || '';
    const query = search.toLowerCase();
    return title.toLowerCase().includes(query) || theater.toLowerCase().includes(query);
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Bangalore Movie Theaters & Shows</h1>
        <p style={{ color: '#94a3b8' }}>Explore cinemas across Bangalore, select your preferred format & language</p>
        
        <input
          type="text"
          placeholder="Search movies or theaters in Bangalore..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '500px', padding: '12px 20px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', marginTop: '15px', fontSize: '16px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {filteredShows.map((show) => (
          <div key={show._id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <img 
              src={show.posterUrl} 
              alt={show.title} 
              style={{ width: '100%', height: '360px', objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
            />
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{show.title}</h3>
                <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 6px 0', fontWeight: '600' }}>📍 {show.theaterName}</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 4px 0' }}>🎬 Format: <strong style={{ color: '#34d399' }}>{show.format}</strong></p>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 4px 0' }}>🗣 Language: {show.language}</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 15px 0' }}>⏰ Time: {show.time} | ₹{show.ticketPrice}</p>
              </div>

              <button
                onClick={() => onSelectShow(show)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Select Seats & Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}