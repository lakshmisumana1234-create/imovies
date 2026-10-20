import React, { useEffect, useState } from 'react';

export default function UserBookingsPage({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await fetch(`https://imovies-backend-91io.onrender.com/api/bookings/user/${userId}`);
        const data = await response.json();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUserBookings();
  }, [userId]);

  if (loading) return <div style={{ padding: "40px", color: "#fff" }}>Loading your tickets...</div>;

  return (
    <div style={{ padding: "40px", color: "#fff", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🎟️ Digital Ticket Passes</h1>
      {bookings.length === 0 ? (
        <p>No active tickets found.</p>
      ) : (
        <div style={{ display: "grid", gap: "25px", marginTop: "20px" }}>
          {bookings.map((booking) => {
            // Generate QR Code URL based on Booking ID
            const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=iMovies-Pass-${booking._id}`;

            return (
              <div 
                key={booking._id} 
                style={{ 
                  backgroundColor: "#161616", 
                  padding: "24px", 
                  borderRadius: "12px", 
                  border: "1px solid #333",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                }}
              >
                <div>
                  <h2 style={{ color: "#3399cc", margin: "0 0 10px 0" }}>{booking.show?.title || "iMovies Screening"}</h2>
                  <p>Seats: <strong style={{ color: "#fff" }}>{booking.seats.join(', ')}</strong></p>
                  <p>Total Paid: <strong style={{ color: "#4caf50" }}>₹{booking.totalPrice}</strong></p>
                  <p style={{ fontSize: "12px", color: "#777", margin: "8px 0 0 0" }}>Booking ID: {booking._id}</p>
                </div>
                <div style={{ textAlign: "center", background: "#fff", padding: "8px", borderRadius: "8px" }}>
                  <img src={qrDataUrl} alt="Ticket QR Code" style={{ width: "110px", height: "110px", display: "block" }} />
                  <span style={{ fontSize: "10px", color: "#333", fontWeight: "bold" }}>SCAN AT CINEMA</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}