import React, { useState } from 'react';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelector from './pages/SeatSelector';
import ListYourShowModal from './pages/ListYourShowModal';
import axios from 'axios';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingShow, setBookingShow] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  
  // User state
  const [user, setUser] = useState({ id: 'user_123', name: 'Sumana', email: 'lakshmisumana1234@gmail.com' });
  
  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Search state & Active tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Movies');

  const handleLogout = () => {
    setUser(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        const res = await axios.post('https://imovies-backend-91io.onrender.com/api/auth/register', { name, email, password });
        if (res.data.success) {
          alert('Registration successful! You are now logged in.');
          setUser(res.data.user);
          setShowAuthModal(false);
        }
      } else {
        const res = await axios.post('https://imovies-backend-91io.onrender.com/api/auth/login', { email, password });
        if (res.data.success) {
          alert('Login successful!');
          setUser(res.data.user);
          setShowAuthModal(false);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Bar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 
            style={{ color: '#ef4444', margin: 0, fontSize: '24px', fontWeight: '800', cursor: 'pointer', fontStyle: 'italic' }} 
            onClick={() => { setSelectedMovie(null); setBookingShow(null); setActiveTab('Movies'); setSearchQuery(''); }}
          >
            iMovies
          </h1>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Movies, Events, Plays, Sports..." 
            style={{ width: '350px', padding: '8px 14px', borderRadius: '6px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>📍 Bengaluru</span>
          <button 
            onClick={() => setIsListModalOpen(true)}
            style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            ListYourShow
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px', color: '#fff' }}>Hi, {user.name}</span>
              <button 
                onClick={handleLogout}
                style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)} // Opens the auth modal!
              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navbar Links (Interactive Loop) */}
      <div style={{ display: 'flex', gap: '25px', padding: '10px 40px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937', fontSize: '14px', color: '#d1d5db' }}>
        {['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities'].map((tab) => (
          <span 
            key={tab}
            onClick={() => {
              setSelectedMovie(null);
              setBookingShow(null);
              setActiveTab(tab); 
              setSearchQuery(''); 
            }}
            style={{ 
              cursor: 'pointer', 
              color: activeTab === tab ? '#ef4444' : '#d1d5db', 
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              paddingBottom: '4px',
              borderBottom: activeTab === tab ? '2px solid #ef4444' : 'none'
            }}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Main Content Area / View Router */}
      <div style={{ flex: 1, padding: '20px 40px' }}>
        {!selectedMovie ? (
          <Home 
            activeTab={activeTab} 
            searchQuery={searchQuery} 
            onSelectMovie={(movie) => setSelectedMovie(movie)} 
          />
        ) : !bookingShow ? (
          <MovieDetails 
            show={selectedMovie} 
            onBack={() => setSelectedMovie(null)} 
            onProceedToSeats={(theaterShow) => setBookingShow(theaterShow)} 
          />
        ) : (
          <SeatSelector 
            show={bookingShow} 
            user={user} 
            onBack={() => setBookingShow(null)} 
          />
        )}
      </div>

      {/* List Your Show Modal Popup */}
      <ListYourShowModal 
        isOpen={isListModalOpen} 
        onClose={() => setIsListModalOpen(false)} 
        onSuccess={(newShow) => {
          console.log('New show listed:', newShow);
          window.location.reload();
        }} 
      />

      {/* GLOBAL AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111827', padding: '30px', borderRadius: '12px', width: '380px', border: '1px solid #374151', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: '#fff' }}>{isRegisterMode ? 'Register' : 'Sign In'}</h2>
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