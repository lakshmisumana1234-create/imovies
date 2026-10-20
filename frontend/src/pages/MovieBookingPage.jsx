import React from 'react';
import CheckoutButton from '../components/CheckoutButton';

const MovieBookingPage = () => {
  const movieTitle = "Interstellar";
  const ticketAmount = 450;
  const userDetails = {
    name: "Sumana",
    email: "sumana@example.com",
    phone: "+919876543210" // Make sure to include your country code for Twilio WhatsApp sandbox testing
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>🎬 iMovies Ticket Checkout</h1>
      <h2>{movieTitle}</h2>
      <p style={{ fontSize: "18px" }}>Total Amount: <strong>₹{ticketAmount}</strong></p>
      
      <br />
      <CheckoutButton 
        ticketAmount={ticketAmount} 
        movieTitle={movieTitle} 
        userDetails={userDetails} 
      />
    </div>
  );
};

export default MovieBookingPage;