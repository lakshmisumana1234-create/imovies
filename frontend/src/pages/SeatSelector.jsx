import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('https://imovies-backend-91io.onrender.com');

export default function SeatSelector({ show, user, onBack }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Ensure a robust unique showId per movie/play/sport
  const showId = show?._id ? String(show._id) : (show?.title ? `show_${show.title.replace(/\s+/g, '_')}` : 'default_show');
  
  const rows = ['A', 'B', 'C', 'D'];
  const cols = [1, 2, 3, 4, 5, 6];
  const ticketPrice = show?.ticketPrice || 350;
  const totalAmount = selectedSeats.length * ticketPrice;

  useEffect(() => {
    socket.emit('join-show', showId);

    const handleInitialLocks = (seats) => setLockedSeats(seats);
    const handleSeatLocked = ({ seatId }) => setLockedSeats((prev) => [...new Set([...prev, seatId])]);
    const handleSeatUnlocked = ({ seatId }) => setLockedSeats((prev) => prev.filter((id) => id !== seatId));

    socket.on('initial-locks', handleInitialLocks);
    socket.on('seat-locked', handleSeatLocked);
    socket.on('seat-unlocked', handleSeatUnlocked);

    return () => {
      socket.off('initial-locks', handleInitialLocks);
      socket.off('seat-locked', handleSeatLocked);
      socket.off('seat-unlocked', handleSeatUnlocked);
    };
  }, [showId]);

  const handleSeatClick = (seatId) => {
    // 1. If it's already selected by YOU, let you unselect/unlock it
    if (selectedSeats.includes(seatId)) {
      const updated = selectedSeats.filter(s => s !== seatId);
      setSelectedSeats(updated);
      socket.emit('unlock-seat', { showId, seatId });
      return;
    }

    // 2. If it's locked by someone else, block interaction
    if (lockedSeats.includes(seatId)) return;

    // 3. Otherwise, select and lock it
    const updated = [...selectedSeats, seatId];
    setSelectedSeats(updated);
    socket.emit('lock-seat', { showId, seatId });
  };

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return alert('Please select at least one seat!');
    if (!acceptedTerms) return alert('Please accept the Terms & Conditions before proceeding!');
    if (!email || !phone) return alert('Please enter your email and phone number for booking confirmation!');
    
    setLoading(true);

    try {
      const orderRes = await axios.post('https://imovies-backend-91io.onrender.com/api/payment/create-order', {
        amount: totalAmount * 100,
      });

      const { order_id, amount, currency, isMock } = orderRes.data;

      if (isMock) {
        await axios.post('https://imovies-backend-91io.onrender.com/api/payment/verify-payment', {
          razorpay_order_id: order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          userId: user?.id || 'guest_user',
          showId: showId,
          seats: selectedSeats,
          totalPrice: totalAmount,
          userEmail: email,
          userPhone: phone,
          movieTitle: show?.title,
        });

        alert('Payment successful (Mock Mode)! Booking confirmed and saved to database.');
        window.location.reload();
        return;
      }

      const options = {
        key: 'rzp_test_TpJqcyjlrycB4Q',
        amount: amount,
        currency: currency,
        name: 'iMovies Ticket Booking',
        description: `Booking for ${show?.title} (${show?.format})`,
        order_id,
        handler: async function (response) {
          try {
            await axios.post('https://imovies-backend-91io.onrender.com/api/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.id || 'guest_user',
              showId: showId,
              seats: selectedSeats,
              totalPrice: totalAmount,
              userEmail: email,
              userPhone: phone,
              movieTitle: show?.title,
            });

            alert('Payment successful! Booking confirmation sent.');
            window.location.reload();
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name,
          email: email,
          contact: phone,
        },
        theme: { color: '#ef4444' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      alert('Failed to initiate payment order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '30px', backgroundColor: '#111827', color: '#ffffff', borderRadius: '16px', fontFamily: 'sans-serif', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
      <div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', marginBottom: '20px' }}>
          &larr; Back to Theater Selection
        </button>
      </div>

      <div style={{ textAlign: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '15px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>
          {show?.title} <span style={{ color: '#ef4444', fontSize: '18px' }}>({show?.format})</span>
        </h2>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          {show?.theaterName} &bull; Time: {show?.time} &bull; Price: <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{ticketPrice}</span>
        </p>
      </div>

      <div style={{ backgroundColor: '#1f2937', padding: '15px 20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #374151' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#d1d5db', lineHeight: '1.5' }}>
          <input 
            type="checkbox" 
            checked={acceptedTerms} 
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#ef4444', cursor: 'pointer' }}
          />
          <span>
            I agree to the <strong style={{ color: '#ef4444' }}>Terms & Conditions</strong>. Tickets once booked cannot be cancelled or refunded. Patrons must present a valid ID at the theater gate.
          </span>
        </label>
      </div>

      <div style={{ backgroundColor: '#1f2937', padding: '15px 20px', borderRadius: '10px', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>Email for Confirmation *</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0b0f19', border: '1px solid #374151', color: '#fff', fontSize: '14px' }} 
          />
        </div>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>WhatsApp Mobile Number *</label>
          <input 
            type="tel" 
            placeholder="9999999999" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0b0f19', border: '1px solid #374151', color: '#fff', fontSize: '14px' }} 
          />
        </div>
      </div>

      <div style={{ width: '70%', margin: '0 auto 35px auto', backgroundColor: '#1f2937', padding: '10px', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '3px', color: '#9ca3af', fontSize: '13px', border: '1px solid #374151' }}>
        SCREEN THIS WAY
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '35px' }}>
        {rows.map((row) => (
          <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ width: '24px', fontWeight: 'bold', color: '#9ca3af', textAlign: 'center', fontSize: '15px' }}>{row}</span>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {cols.map((col) => {
                const seatId = `${row}${col}`;
                const isSelected = selectedSeats.includes(seatId);
                const isLocked = lockedSeats.includes(seatId) && !isSelected;

                let bg = '#1f2937';
                let color = '#ffffff';
                let border = '1px solid #374151';

                if (isLocked) {
                  bg = '#0b0f19';
                  color = '#4b5563';
                  border = '1px solid #1f2937';
                } else if (isSelected) {
                  bg = '#10b981';
                  color = '#ffffff';
                  border = '1px solid #10b981';
                }

                return (
                  <button
                    key={seatId}
                    disabled={isLocked}
                    onClick={() => handleSeatClick(seatId)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: bg,
                      color: color,
                      border: border,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #1f2937', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '15px' }}>
            Selected Seats: <strong style={{ color: '#ffffff' }}>{selectedSeats.join(', ') || 'None'}</strong>
          </p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            Total Amount: <span style={{ color: '#10b981' }}>₹{totalAmount}</span>
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={selectedSeats.length === 0 || !acceptedTerms || loading}
          style={{
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: (selectedSeats.length > 0 && acceptedTerms) ? '#ef4444' : '#1f2937',
            color: (selectedSeats.length > 0 && acceptedTerms) ? '#ffffff' : '#4b5563',
            border: (selectedSeats.length > 0 && acceptedTerms) ? 'none' : '1px solid #374151',
            cursor: (selectedSeats.length > 0 && acceptedTerms) ? 'pointer' : 'not-allowed',
            boxShadow: (selectedSeats.length > 0 && acceptedTerms) ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Processing...' : `Pay ₹${totalAmount}`}
        </button>
      </div>
    </div>
  );
}