const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Booking = require('./models/Booking');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iMovies', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB successfully"))
.catch((err) => console.error("MongoDB connection error:", err));

const showSchema = new mongoose.Schema({
  title: { type: String, required: true },
  posterUrl: { type: String, required: true },
  theaterName: { type: String, required: true },
  format: { type: String, required: true },
  language: { type: String, required: true },
  ticketPrice: { type: Number, required: true },
  time: { type: String, required: true },
}, { timestamps: true });

const Show = mongoose.model('Show', showSchema);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ================= WEBSOCKET / REAL-TIME SEAT LOCKING ================= //
const activeLocks = {}; 

io.on('connection', (socket) => {
  console.log("A user connected via WebSocket:", socket.id);

  socket.on('join-show', (showId) => {
    socket.join(showId);
    if (activeLocks[showId]) {
      socket.emit('initial-locks', Array.from(activeLocks[showId]));
    }
  });

  socket.on('lock-seat', ({ showId, seatId }) => {
    if (!activeLocks[showId]) {
      activeLocks[showId] = new Set();
    }
    activeLocks[showId].add(seatId);
    socket.to(showId).emit('seat-locked', { seatId });
  });

  socket.on('unlock-seat', ({ showId, seatId }) => {
    if (activeLocks[showId]) {
      activeLocks[showId].delete(seatId);
    }
    socket.to(showId).emit('seat-unlocked', { seatId });
  });

  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= AUTH ROUTES ================= //
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });

    res.status(201).json({ success: true, token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

// ================= PAYMENT & BOOKING ROUTES (WITH DEBUG LOGS) ================= //
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR", receipt: `receipt_${Date.now()}` });
    res.status(200).json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, showId, seats, totalPrice, userEmail, userPhone, movieTitle } = req.body;
    
    console.log("Secret Key loaded:", process.env.RAZORPAY_KEY_SECRET ? "Yes (Length: " + process.env.RAZORPAY_KEY_SECRET.length + ")" : "MISSING!");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      await Booking.create({ user: userId, show: showId, seats, totalPrice });

      if (userEmail) {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: `Booking Confirmed: ${movieTitle}`,
          html: `<h2>Booking Confirmed!</h2><p>Seats: ${seats.join(', ')}</p><p>Total Paid: ₹${totalPrice}</p>`
        }).catch(err => console.error("Email error:", err));
      }

      if (userPhone) {
        try {
          await twilioClient.messages.create({
            body: `🎬 iMovies Booking Confirmed for ${seats.join(', ')}! Total: ₹${totalPrice}`,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: userPhone.startsWith('whatsapp:') ? userPhone : `whatsapp:${userPhone}`,
          });
        } catch (waErr) { console.error("WhatsApp error:", waErr); }
      }

      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      console.error("Signature mismatch!");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verification server error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= SHOWS & SEED ROUTES ================= //
app.get('/api/shows', async (req, res) => {
  try {
    const shows = await Show.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, shows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/seed-shows', async (req, res) => {
  try {
    await Show.deleteMany({});
    await Show.insertMany([
      { title: "The Dark Knight", posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", theaterName: "PVR: Orion Mall, Rajajinagar", format: "2D", language: "English", ticketPrice: 350, time: "7:00 PM" },
      { title: "The Dark Knight", posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", theaterName: "INOX: Garuda Mall, Magrath Road", format: "IMAX 2D", language: "English", ticketPrice: 450, time: "9:30 PM" },
      { title: "Inception", posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", theaterName: "Cinepolis: Forum Shantiniketan, Whitefield", format: "4DX", language: "English", ticketPrice: 450, time: "9:30 PM" },
      { title: "Inception", posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", theaterName: "PVR: Forum Nexus, Koramangala", format: "2D", language: "English", ticketPrice: 350, time: "4:30 PM" },
      { title: "Avatar: The Way of Water", posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", theaterName: "PVR Director's Cut: UB City", format: "3D", language: "English", ticketPrice: 600, time: "6:15 PM" },
      { title: "Avatar: The Way of Water", posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", theaterName: "PVR: Orion Mall, Rajajinagar", format: "3D", language: "English", ticketPrice: 500, time: "1:00 PM" }
    ]);
    res.status(200).json({ success: true, message: "Shows seeded successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));