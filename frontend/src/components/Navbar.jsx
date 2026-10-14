import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ activeCategory, setActiveCategory, onOpenListShowModal }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'Movies', icon: '🎬', category: 'Movies' },
    { label: 'Stream', icon: '📺', category: 'Stream' },
    { label: 'Events', icon: '🎟️', category: 'Events' },
    { label: 'Plays', icon: '🎭', category: 'Plays' },
    { label: 'Sports', icon: '⚽', category: 'Sports' },
    { label: 'Activities', icon: '🎡', category: 'Activities' },
  ];

  return (
    <header style={{ width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#333545', padding: '12px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px' }}>
            🎬 <span style={{ color: '#f84464' }}>I</span>MOVIES
          </Link>
          <input
            type="text"
            placeholder="Search for Movies, Events, Plays, Sports and Activities"
            style={{ width: '420px', padding: '8px 16px', borderRadius: '4px', border: 'none', outline: 'none', backgroundColor: '#fff', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/theaters" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#2b3148', padding: '6px 12px', borderRadius: '4px' }}>
            🏢 Theaters & Capacities
          </Link>
          <span style={{ color: '#ccc', fontSize: '0.85rem', cursor: 'pointer' }}>📍 Bengaluru ▾</span>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '0.9rem', color: '#fff' }}>Hi, {user.name || 'User'}</span>
              <button onClick={() => { logout(); navigate('/'); }} style={{ backgroundColor: 'transparent', border: '1px solid #f84464', color: '#f84464', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button style={{ backgroundColor: '#f84464', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#222531', padding: '10px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2d3142' }}>
        <div style={{ display: 'flex', gap: '28px' }}>
          {navigationItems.map((item) => (
            <span
              key={item.label}
              onClick={() => { setActiveCategory(item.category); navigate('/'); }}
              style={{
                color: activeCategory === item.category ? '#f84464' : '#cccccc',
                fontWeight: activeCategory === item.category ? 'bold' : 'normal',
                fontSize: '0.9rem',
                cursor: 'pointer',
                borderBottom: activeCategory === item.category ? '2px solid #f84464' : 'none',
                paddingBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{item.icon}</span> {item.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: '#cccccc' }}>
          <span onClick={onOpenListShowModal} style={{ cursor: 'pointer', color: '#f84464', fontWeight: 'bold' }}>ListYourShow</span>
          <span style={{ cursor: 'pointer' }}>Corporates</span>
          <span style={{ cursor: 'pointer' }}>Offers</span>
        </div>
      </div>
    </header>
  );
}