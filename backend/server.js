require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const MONGO_URI = process.env.MONGO_URI;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TpJqcyjlrycB4Q';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'BqLaGDmR7GQJCkSRLHHmmIhj';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
  credentials: CORS_ORIGIN !== '*'
}));

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

if (!MONGO_URI) {
  console.error('MONGO_URI is missing. Please add it to your .env file.');
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ==========================================
// Mongoose Schemas & Models
// ==========================================
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  posterUrl: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80' 
  },
  theaterName: { 
    type: String, 
    default: 'PVR Cinemas' 
  },
  place: { 
    type: String, 
    default: 'Bengaluru' 
  },
  ticketPrice: { type: Number, default: 250 },
  time: { 
    type: String, 
    default: '7:30 PM' 
  },
  language: { type: String, default: 'English' },
  format: { type: String, default: '2D' },
  category: { type: String, default: 'movie' }
}, { timestamps: true });

const Play = mongoose.model('Play', itemSchema);
const Sport = mongoose.model('Sport', itemSchema);
const Movie = mongoose.model('Movie', itemSchema);

// Booking Schema & Model
const bookingSchema = new mongoose.Schema({
  userId: String,
  showId: String,
  seats: [String],
  totalPrice: Number,
  userEmail: String,
  userPhone: String,
  movieTitle: String,
  paymentId: String,
  orderId: String
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// ==========================================
// API Routes: Authentication (Register & Login)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// API Routes: Get All Shows (Unified)
// ==========================================
app.get('/api/shows', async (req, res) => {
  try {
    const movies = await Movie.find({});
    const plays = await Play.find({});
    const sports = await Sport.find({});

    const allShows = [
      ...movies.map(m => ({ ...m.toObject(), category: 'movie' })),
      ...plays.map(p => ({ ...p.toObject(), category: 'play' })),
      ...sports.map(s => ({ ...s.toObject(), category: 'sport' }))
    ];

    res.status(200).json({ success: true, shows: allShows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Routes: Movies, Plays, Sports
// ==========================================
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/plays', async (req, res) => {
  try {
    const plays = await Play.find({});
    res.status(200).json({ success: true, plays });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sports', async (req, res) => {
  try {
    const sports = await Sport.find({});
    res.status(200).json({ success: true, sports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Route: Create Razorpay Payment Order
// ==========================================
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const options = {
      amount: Math.round(amount),
      currency: 'INR',
      receipt: 'receipt_order_' + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      isMock: false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// API Route: Verify Payment & Save Booking
// ==========================================
app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      showId,
      seats,
      totalPrice,
      userEmail,
      userPhone,
      movieTitle
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const newBooking = new Booking({
      userId,
      showId,
      seats,
      totalPrice,
      userEmail,
      userPhone,
      movieTitle,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    await newBooking.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking saved to database successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Route: List Your Show
// ==========================================
app.post('/api/shows/list-your-show', async (req, res) => {
  try {
    const { title, category, theaterName, theater, venue, place, ticketPrice, time, posterUrl, poster, language, format } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Show title is required' });
    }

    const finalTheater = theaterName || theater || venue || 'PVR Cinemas';
    const finalPlace = place || 'Bengaluru';
    const finalPoster = posterUrl || poster || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80';
    const finalTime = time || '7:30 PM';

    const catLower = (category || '').toLowerCase();
    let savedDoc;

    if (catLower.includes('play')) {
      savedDoc = new Play({
        title,
        category: 'Play',
        theaterName: finalTheater,
        place: finalPlace,
        ticketPrice: Number(ticketPrice) || 250,
        time: finalTime,
        posterUrl: finalPoster,
        language: language || 'English',
        format: 'seat'
      });
    } else if (catLower.includes('sport')) {
      savedDoc = new Sport({
        title,
        category: 'Sport',
        theaterName: finalTheater,
        place: finalPlace,
        ticketPrice: Number(ticketPrice) || 250,
        time: finalTime,
        posterUrl: finalPoster,
        language: language || 'English',
        format: 'seat'
      });
    } else {
      savedDoc = new Movie({
        title,
        category: category || 'Movie',
        theaterName: finalTheater,
        place: finalPlace,
        ticketPrice: Number(ticketPrice) || 250,
        time: finalTime,
        posterUrl: finalPoster,
        language: language || 'English',
        format: format || '2D'
      });
    }

    await savedDoc.save();

    res.status(201).json({ 
      success: true, 
      message: `Event listed successfully!`, 
      show: savedDoc 
    });
  } catch (error) {
    console.error('Error in list-your-show:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Route: Health Check
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    await Movie.findOne({});
    res.status(200).json({ success: true, message: 'Cluster is active!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Routes: Bookings & Admin Helpers
// ==========================================
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [users, movies, plays, sports, bookings] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Play.countDocuments(),
      Sport.countDocuments(),
      Booking.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users,
        movies,
        plays,
        sports,
        bookings,
        totalShows: movies + plays + sports
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ==========================================
// Socket.io Real-Time Seat Locking Layer
// ==========================================
const lockedSeatsMap = {}; // { showId: [seatId1, seatId2] }
const socketSeatTracker = {}; // { socketId: { showId, seats: [seatId] } }

io.on('connection', (socket) => {
  socket.on('join-show', (showId) => {
    socket.join(showId);
    socketSeatTracker[socket.id] = { showId, seats: [] };
    const currentLocks = lockedSeatsMap[showId] || [];
    socket.emit('initial-locks', currentLocks);
  });

  socket.on('lock-seat', ({ showId, seatId }) => {
    if (!lockedSeatsMap[showId]) {
      lockedSeatsMap[showId] = [];
    }
    if (!lockedSeatsMap[showId].includes(seatId)) {
      lockedSeatsMap[showId].push(seatId);
    }
    if (socketSeatTracker[socket.id]) {
      if (!socketSeatTracker[socket.id].seats.includes(seatId)) {
        socketSeatTracker[socket.id].seats.push(seatId);
      }
    }
    io.to(showId).emit('seat-locked', { seatId });
  });

  socket.on('unlock-seat', ({ showId, seatId }) => {
    if (lockedSeatsMap[showId]) {
      lockedSeatsMap[showId] = lockedSeatsMap[showId].filter(id => id !== seatId);
    }
    if (socketSeatTracker[socket.id]) {
      socketSeatTracker[socket.id].seats = socketSeatTracker[socket.id].seats.filter(id => id !== seatId);
    }
    io.to(showId).emit('seat-unlocked', { seatId });
  });

  socket.on('disconnect', () => {
    const tracker = socketSeatTracker[socket.id];
    if (tracker && tracker.showId && tracker.seats.length > 0) {
      const { showId, seats } = tracker;
      if (lockedSeatsMap[showId]) {
        lockedSeatsMap[showId] = lockedSeatsMap[showId].filter(id => !seats.includes(id));
        seats.forEach(seatId => {
          io.to(showId).emit('seat-unlocked', { seatId });
        });
      }
    }
    delete socketSeatTracker[socket.id];
  });
});

// ==========================================
// Server Listener
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server and Socket.io running smoothly on port ${PORT}`);
});