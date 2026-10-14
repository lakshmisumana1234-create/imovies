import React, { useState } from 'react';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelector from './pages/SeatSelector';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingShow, setBookingShow] = useState(null);
  const [user, setUser] = useState({ id: 'user_123', name: 'Sumana', email: 'lakshmisumana1234@gmail.com' });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      {!selectedMovie ? (
        <Home 
          onSelectMovie={(movie) => setSelectedMovie(movie)} 
          onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} 
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
  );
}