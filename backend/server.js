const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Atlas Connection String
// (Replace with your actual Atlas URI or environment variable process.env.MONGO_URI)
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_ATLAS_CONNECTION_STRING';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas successfully!'))
.catch((err) => console.error('MongoDB connection error:', err));

// ==========================================
// Mongoose Schemas & Models
// ==========================================
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  posterUrl: { type: String, required: true },
  theaterName: { type: String, required: true },
  place: { type: String, required: true },
  ticketPrice: { type: Number, required: true },
  time: { type: String, required: true },
  language: { type: String, default: 'English' },
  format: { type: String, default: '2D' },
  category: { type: String, default: 'event' }
}, { timestamps: true });

const Play = mongoose.model('Play', itemSchema);
const Sport = mongoose.model('Sport', itemSchema);
const Movie = mongoose.model('Movie', itemSchema);

// ==========================================
// API Routes: Plays
// ==========================================
app.get('/api/plays', async (req, res) => {
  try {
    const plays = await Play.find({});
    res.status(200).json({ success: true, plays });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Routes: Sports
// ==========================================
app.get('/api/sports', async (req, res) => {
  try {
    const sports = await Sport.find({});
    res.status(200).json({ success: true, sports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Routes: Movies
// ==========================================
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// API Route: List Your Show / Movie / Sport
// ==========================================
app.post('/api/shows/list-your-show', async (req, res) => {
  try {
    const { title, category, theaterName, place, ticketPrice, time, posterUrl, language, format } = req.body;

    let savedDoc;

    if (category === 'play') {
      savedDoc = new Play({
        title,
        category: 'play',
        theaterName,
        place,
        ticketPrice: Number(ticketPrice),
        time,
        posterUrl,
        language: language || 'Kannada/English',
        format: '2D'
      });
    } else if (category === 'sport') {
      savedDoc = new Sport({
        title,
        category: 'sport',
        theaterName,
        place,
        ticketPrice: Number(ticketPrice),
        time,
        posterUrl,
        language: language || 'English',
        format: '2D'
      });
    } else {
      savedDoc = new Movie({
        title,
        category: 'movie',
        theaterName,
        place,
        ticketPrice: Number(ticketPrice),
        time,
        posterUrl,
        language: language || 'English',
        format: format || '2D'
      });
    }

    await savedDoc.save();

    res.status(201).json({ 
      success: true, 
      message: `${category.toUpperCase()} listed successfully!`, 
      show: savedDoc 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// Server Listener
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT}`);
});