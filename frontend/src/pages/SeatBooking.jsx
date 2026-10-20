import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, socket } from '../api';
import { AuthContext } from '../context/AuthContext';

export default function SeatBooking() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    api.get(`/shows/${showId}`).then((res) => setShow(res.data));

    socket.connect();
    socket.emit('join_show', showId);

    socket.on('seat_updated', ({ seatNumber, status }) => {
      setShow((prev) => {
        if (!prev) return prev;
        const updatedSeats = prev.seats.map((s) =>
          s.seatNumber === seatNumber ? { ...s, status } : s
        );
        return { ...prev, seats: updatedSeats };
      });
    });

    return () => {
      socket.off('seat_updated');
      socket.disconnect();
    };
  }, [showId]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return;

    if (selectedSeats.some((s) => s.seatNumber === seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
      socket.emit('unlock_seat', { showId, seatNumber: seat.seatNumber });
    } else {
      setSelectedSeats([...selectedSeats, seat]);
      socket.emit('lock_seat', { showId, seatNumber: seat.seatNumber });
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);

    try {
      await api.post('/bookings', {
        showId,
        seats: selectedSeats.map((s) => s.seatNumber),
      });

      alert('🎟️ Booking confirmed! View your tickets in your profile.');
      setSelectedSeats([]);
      const res = await api.get(`/shows/${showId}`);
      setShow(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!show) return <p style={{ textAlign: 'center', paddingTop: '50px' }}>Loading cinema layout...</p>;

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.currentPrice || seat.price || 250), 0);

  const vipSeats = show.seats.filter((s) => s.tier === 'VIP' || s.seatNumber.startsWith('A'));
  const premiumSeats = show.seats.filter((s) => s.tier === 'Premium' || s.seatNumber.startsWith('B'));
  const standardSeats = show.seats.filter((s) => s.tier === 'Standard' || s.seatNumber.startsWith('C'));

  const renderSeatRow = (seats, tierTitle, price) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '0.85rem', color: '#999', borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '12px', textAlign: 'left' }}>
        {tierTitle} — ₹{price}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 36px)', gap: '8px', justifyContent: 'center' }}>
        {seats.map((seat) => {
          const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
          const isBooked = seat.status === 'booked';
          const isLocked = seat.status === 'locked' && !isSelected;

          let bgColor = '#ffffff';
          let textColor = '#1ea83c';
          let border = '1px solid #1ea83c';

          if (isBooked) {
            bgColor = '#e0e0e0';
            textColor = '#a0a0a0';
            border = '1px solid #e0e0e0';
          } else if (isLocked) {
            bgColor = '#f84464';
            textColor = '#ffffff';
            border = '1px solid #f84464';
          } else if (isSelected) {
            bgColor = '#1ea83c';
            textColor = '#ffffff';
            border = '1px solid #1ea83c';
          }

          return (
            <button
              key={seat.seatNumber}
              disabled={isBooked || isLocked}
              onClick={() => toggleSeat({ ...seat, currentPrice: seat.currentPrice || price })}
              style={{
                width: '36px',
                height: '34px',
                backgroundColor: bgColor,
                color: textColor,
                border: border,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: isBooked || isLocked ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px', textAlign: 'center' }}>
      <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem' }}>{show.movieTitle || show.movie}</h1>
      <p style={{ color: '#999', margin: '0 0 20px 0' }}>{show.theatreName || show.theater}</p>

      <div className="bms-screen-container">
        <div className="bms-screen" />
        <div className="bms-screen-text">All eyes this way</div>
      </div>

      {vipSeats.length > 0 && renderSeatRow(vipSeats, 'ROYAL RECLINER', vipSeats[0]?.currentPrice || 350)}
      {premiumSeats.length > 0 && renderSeatRow(premiumSeats, 'PRIME CLUB', premiumSeats[0]?.currentPrice || 280)}
      {standardSeats.length > 0 && renderSeatRow(standardSeats, 'CLASSIC', standardSeats[0]?.currentPrice || 220)}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.85rem', color: '#ccc', margin: '30px 0' }}>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #1ea83c', background: '#fff', marginRight: '6px' }} /> Available</span>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#1ea83c', marginRight: '6px' }} /> Selected</span>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#f84464', marginRight: '6px' }} /> Locked</span>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#e0e0e0', marginRight: '6px' }} /> Sold Out</span>
      </div>

      {selectedSeats.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1f2533',
          borderTop: '1px solid #333',
          padding: '16px 40px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Seats: {selectedSeats.map(s => s.seatNumber).join(', ')}</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>Total: ₹{totalPrice}</div>
          </div>
          <button
            onClick={handleBooking}
            disabled={bookingLoading}
            style={{
              backgroundColor: '#f84464',
              color: '#fff',
              border: 'none',
              padding: '12px 36px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {bookingLoading ? 'Processing...' : `Pay ₹${totalPrice}`}
          </button>
        </div>
      )}
    </div>
  );
}