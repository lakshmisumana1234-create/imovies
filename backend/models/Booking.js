const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Changed to String to support guest and custom user IDs
  show: { type: String, required: true }, // Changed to String to support sample/default show IDs
  seats: [{ type: String, required: true }],
  totalPrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);