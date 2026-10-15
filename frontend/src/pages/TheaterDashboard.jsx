import React, { useState, useEffect } from 'react';

export default function TheaterDashboard() {
  const [shows, setShows] = useState([]);
  const [form, setForm] = useState({ title: '', theaterName: '', ticketPrice: '', time: '' });

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const res = await fetch('https://imovies-backend-91io.onrender.com/api/shows');
      const data = await res.json();
      if (data.success) setShows(data.shows);
    } catch (err) {
      console.error("Error fetching shows:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://imovies-backend-91io.onrender.com/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        alert("Show published successfully!");
        setForm({ title: '', theaterName: '', ticketPrice: '', time: '' });
        fetchShows();
      }
    } catch (err) {
      console.error("Error creating show:", err);
    }
  };

  return (
    <div style={{ padding: "40px", color: "#fff", maxWidth: "900px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1>🎬 Theater Owner Dashboard</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: "#161616", padding: "24px", borderRadius: "8px", border: "1px solid #333", display: "grid", gap: "15px", marginTop: "20px" }}>
        <h3>List a New Movie Show</h3>
        <input type="text" placeholder="Movie Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{ padding: "10px", background: "#222", border: "1px solid #444", color: "#fff", borderRadius: "4px" }} />
        <input type="text" placeholder="Theater Name & Screen" value={form.theaterName} onChange={e => setForm({...form, theaterName: e.target.value})} required style={{ padding: "10px", background: "#222", border: "1px solid #444", color: "#fff", borderRadius: "4px" }} />
        <input type="number" placeholder="Ticket Price (₹)" value={form.ticketPrice} onChange={e => setForm({...form, ticketPrice: e.target.value})} required style={{ padding: "10px", background: "#222", border: "1px solid #444", color: "#fff", borderRadius: "4px" }} />
        <input type="text" placeholder="Show Time (e.g., 7:00 PM)" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required style={{ padding: "10px", background: "#222", border: "1px solid #444", color: "#fff", borderRadius: "4px" }} />
        <button type="submit" style={{ padding: "12px", background: "#3399cc", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Publish Show</button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Active Theater Shows</h2>
      <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
        {shows.map(show => (
          <div key={show._id} style={{ background: "#1a1a1a", padding: "16px", borderRadius: "6px", border: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "#3399cc" }}>{show.title}</h4>
              <p style={{ margin: "0", color: "#aaa" }}>{show.theaterName} | Time: {show.time}</p>
            </div>
            <strong>₹{show.ticketPrice}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}