const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  tier: { type: String, enum: ['VIP', 'Premium', 'Standard'], default: 'Standard' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
  lockedBy: { type: String, default: null },
  lockedUntil: { type: Date, default: null },
});

const showSchema = new mongoose.Schema(
  {
    movieTitle: { type: String, required: true },
    movie: { type: String },
    category: { 
      type: String, 
      enum: ['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities'], 
      default: 'Movies' 
    },
    formats: {
      type: [String],
      default: ['2D'],
    },
    language: {
      type: String,
      default: 'English',
    },
    theater: { 
      type: String, 
      default: 'PVR Cinemas' 
    },
    theaterName: { 
      type: String, 
      default: 'PVR Cinemas' 
    },
    theatreName: { 
      type: String, 
      default: 'PVR Cinemas' 
    },
    poster: { 
      type: String, 
      default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80' 
    },
    posterUrl: { 
      type: String, 
      default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80' 
    },
    startTime: { 
      type: Date, 
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
    },
    ticketPrice: { type: Number, default: 250 },
    isActive: { type: Boolean, default: true },
    seats: [seatSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Show', showSchema);