import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home({ onSelectMovie, onLoginSuccess }) {
  const [shows, setShows] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Movies');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    axios.get('https://imovies-backend-9iio.onrender.com/api/shows')
      .then((res) => {
        if (res.data && res.data.shows) {
          // Remove duplicates by title for the home grid view
          const uniqueMovies = Array.from(new Set(res.data.shows.map(s => s.title)))
            .map(title => res.data.shows.find(s => s.title === title));
          setShows(uniqueMovies);
        }
      })
      .catch((err) => console.error("Error fetching shows:", err));
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        const res = await axios.post('https://imovies-backend-9iio.onrender.com/api/auth/register', { name, email, password });
        if (res.data.success) {
          alert('Registration successful! You are now logged in.');
          setCurrentUser(res.data.user);
          if (onLoginSuccess) onLoginSuccess(res.data.user);
          setShowAuthModal(false);
        }
      } else {
        const res = await axios.post('https://imovies-backend-9iio.onrender.com/api/auth/login', { email, password });
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

  const filteredShows = shows.filter(show => 
    show.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 onClick={() => setActiveTab('Movies')} style={{ color: '#ef4444', fontSize: '24px', fontWeight: '900', margin: 0, fontStyle: 'italic', cursor: 'pointer' }}>iMovies</h1>
          <input
            type="text"
            placeholder="Search for Movies, Events, Plays, Sports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '400px', padding: '10px 15px', borderRadius: '6px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>📍 Bengaluru</span>
          {currentUser ? (
            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>Hi, {currentUser.name}</span>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
          )}
        </div>
      </nav>

      {/* Secondary Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 40px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937', fontSize: '14px', color: '#d1d5db' }}>
        <div style={{ display: 'flex', gap: '25px' }}>
          {['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities'].map((tab) => (
            <span 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{ cursor: 'pointer', color: activeTab === tab ? '#ef4444' : '#d1d5db', fontWeight: activeTab === tab ? 'bold' : 'normal', paddingBottom: '4px', borderBottom: activeTab === tab ? '2px solid #ef4444' : 'none' }}
            >
              {tab}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '20px', color: '#9ca3af', fontSize: '13px' }}>
          <span onClick={() => setActiveTab('ListYourShow')} style={{ cursor: 'pointer', color: activeTab === 'ListYourShow' ? '#ef4444' : '#9ca3af' }}>ListYourShow</span>
          <span>Corporates</span>
          <span>Offers</span>
          <span>Gift Cards</span>
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'Movies' && (
        <>
          <div style={{ maxWidth: '1200px', margin: '30px auto', borderRadius: '12px', overflow: 'hidden', height: '280px', background: 'linear-gradient(90deg, #1e1b4b 0%, #311042 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', border: '1px solid #374151' }}>
            <div>
              <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>PREMIERE</span>
              <h2 style={{ fontSize: '32px', margin: '10px 0', fontWeight: '800' }}>Avatar: The Way of Water</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>English &bull; 3D / IMAX</p>
              <button style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Explore Showtimes</button>
            </div>
            <img src="https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" alt="Banner" style={{ height: '220px', borderRadius: '8px', objectFit: 'cover' }} />
          </div>

          <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Recommended Movies in Bengaluru</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '20px' }}>
              {filteredShows.map((show) => (
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

      {activeTab === 'Stream' && (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', color: '#ef4444', marginBottom: '10px' }}>iMovies Stream</h2>
          <p style={{ color: '#9ca3af', marginBottom: '30px' }}>New cinematic releases streaming every Friday.</p>
        </div>
      )}

      {activeTab === 'Events' && (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Live Events & Concerts in Bengaluru</h2>
        </div>
      )}

      {activeTab === 'Plays' && (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Plays & Theatre in Bengaluru</h2>
        </div>
      )}

      {activeTab === 'Sports' && (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Sports & Marathons in Bengaluru</h2>
        </div>
      )}

      {activeTab === 'Activities' && (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Fun Activities & Amusement Parks</h2>
        </div>
      )}

      {activeTab === 'ListYourShow' && (
        <div style={{ maxWidth: '700px', margin: '40px auto', backgroundColor: '#111827', padding: '40px', borderRadius: '12px', border: '1px solid #1f2937' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '10px' }}>List your Show or Event</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '25px' }}>Partner with iMovies to publish ticketing and manage gate entries.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert("Request submitted successfully!"); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" required placeholder="Full Name" style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
            <input type="email" required placeholder="Company Email" style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
            <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Receive a callback</button>
          </form>
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