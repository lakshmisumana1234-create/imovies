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
    theater: { type: String, required: true },
    theatreName: { type: String },
    poster: { type: String, required: true },
    startTime: { type: Date, required: true },
    ticketPrice: { type: Number, default: 250 },
    isActive: { type: Boolean, default: true },
    seats: [seatSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Show', showSchema);