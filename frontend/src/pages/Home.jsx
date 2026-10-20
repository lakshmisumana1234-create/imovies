import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home({ activeTab = 'Movies', searchQuery = '', onSelectMovie, onLoginSuccess }) {
  const [allItems, setAllItems] = useState([]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch master data from /api/shows endpoint
  useEffect(() => {
    axios.get('https://imovies-backend-91io.onrender.com/api/shows')
      .then((res) => {
        const rawData = res.data.shows;
        const showsArray = Array.isArray(rawData) ? rawData : (rawData?.shows || []);
        
        if (showsArray.length > 0) {
          const uniqueShows = Array.from(new Set(showsArray.map(s => s.title)))
            .map(title => showsArray.find(s => s.title === title));
          setAllItems(uniqueShows);
        }
      })
      .catch((err) => console.error("Error fetching shows:", err));
  }, []);

  // Filter categories dynamically from the master list
  const movies = allItems.filter(item => item.category === 'movie' || !item.category);
  const plays = allItems.filter(item => item.category === 'play' || item.category === 'event');
  const sports = allItems.filter(item => item.category === 'sport' || item.category === 'activity');

  // Global search filtering using searchQuery prop from App.jsx
  const query = (searchQuery || '').toLowerCase();
  const filteredMovies = movies.filter(item => item.title.toLowerCase().includes(query));
  const filteredPlays = plays.filter(item => item.title.toLowerCase().includes(query));
  const filteredSports = sports.filter(item => item.title.toLowerCase().includes(query));

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        const res = await axios.post('https://imovies-backend-91io.onrender.com/api/auth/register', { name, email, password });
        if (res.data.success) {
          alert('Registration successful! You are now logged in.');
          setCurrentUser(res.data.user);
          if (onLoginSuccess) onLoginSuccess(res.data.user);
          setShowAuthModal(false);
        }
      } else {
        const res = await axios.post('https://imovies-backend-91io.onrender.com/api/auth/login', { email, password });
        if (res.data.success) {
          alert('Login successful!');
          setCurrentUser(res.data.user);
          if (onLoginSuccess) onLoginSuccess(res.data.user);
          setShowAuthModal(false);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* TAB CONTENT - MOVIES & STREAM */}
      {(activeTab === 'Movies' || activeTab === 'Stream') && (
        <>
          <div style={{ maxWidth: '1200px', margin: '30px auto', borderRadius: '12px', overflow: 'hidden', height: '280px', background: 'linear-gradient(90deg, #1e1b4b 0%, #311042 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', border: '1px solid #374151' }}>
            <div>
              <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>PREMIERE</span>
              <h2 style={{ fontSize: '32px', margin: '10px 0', fontWeight: '800' }}>Avatar: The Way of Water</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>English &bull; 3D / IMAX</p>
            </div>
            <img src="https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" alt="Banner" style={{ height: '220px', borderRadius: '8px', objectFit: 'cover' }} />
          </div>

          <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Recommended Movies in Bengaluru</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '20px' }}>
              {filteredMovies.map((show) => (
                <div 
                  key={show._id} 
                  onClick={() => onSelectMovie(show)}
                  style={{ backgroundColor: '#111827', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1f2937', cursor: 'pointer', transition: 'transform 0.2s' }}
                >
                  <img src={show.posterUrl} alt={show.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>⭐ 9.1/10 (15K Votes)</div>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{show.title}</h4>
                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{show.language}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TAB CONTENT - PLAYS & EVENTS */}
      {(activeTab === 'Plays' || activeTab === 'Events') && (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Plays & Theatre in Bengaluru</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '20px' }}>
            {filteredPlays.map((play) => (
              <div 
                key={play._id} 
                onClick={() => onSelectMovie(play)}
                style={{ backgroundColor: '#111827', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1f2937', cursor: 'pointer' }}
              >
                <img src={play.posterUrl} alt={play.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>📍 {play.theaterName || 'Venue TBA'}</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{play.title}</h4>
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{play.language} &bull; ₹{play.ticketPrice || '250'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT - SPORTS & ACTIVITIES */}
      {(activeTab === 'Sports' || activeTab === 'Activities') && (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Sports & Matches in Bengaluru</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '20px' }}>
            {filteredSports.map((sport) => (
              <div 
                key={sport._id} 
                onClick={() => onSelectMovie(sport)}
                style={{ backgroundColor: '#111827', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1f2937', cursor: 'pointer' }}
              >
                <img src={sport.posterUrl} alt={sport.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>📍 {sport.theaterName || 'Stadium TBA'}</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{sport.title}</h4>
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{sport.language} &bull; ₹{sport.ticketPrice || '300'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111827', padding: '30px', borderRadius: '12px', width: '380px', border: '1px solid #374151', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>{isRegisterMode ? 'Register' : 'Sign In'}</h2>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {isRegisterMode && (
                <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
              )}
              <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
              <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
              <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{isRegisterMode ? 'Register' : 'Sign In'}</button>
            </form>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '20px' }}>
              {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={() => setIsRegisterMode(!isRegisterMode)} style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>{isRegisterMode ? 'Sign In' : 'Register'}</span>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}