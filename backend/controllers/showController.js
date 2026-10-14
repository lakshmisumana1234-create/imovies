const Show = require('../models/Show');

const calculateDynamicPrice = (seat, show) => {
  const totalSeats = show.seats.length;
  if (totalSeats === 0) return seat.price || show.ticketPrice || 250;

  const occupiedSeats = show.seats.filter((s) => s.status === 'booked' || s.status === 'locked').length;
  const occupancyRatio = occupiedSeats / totalSeats;
  let basePrice = seat.price || show.ticketPrice || 250;

  if (seat.tier === 'VIP') basePrice *= 1.4;
  else if (seat.tier === 'Premium') basePrice *= 1.2;

  if (occupancyRatio >= 0.85) basePrice *= 1.3;
  else if (occupancyRatio >= 0.7) basePrice *= 1.15;

  return Math.round(basePrice);
};

// GET /api/shows
const getShows = async (req, res) => {
  try {
    const shows = await Show.find({});
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/shows/theaters
const getShowsByTheater = async (req, res) => {
  try {
    const shows = await Show.find({ isActive: true });

    const groupedByTheater = shows.reduce((acc, show) => {
      const theaterName = show.theatreName || show.theater || 'PVR Cinemas';
      if (!acc[theaterName]) {
        acc[theaterName] = {
          theaterName,
          totalCapacity: 0,
          totalAvailableSeats: 0,
          movies: [],
        };
      }

      const availableSeats = show.seats.filter((s) => s.status === 'available').length;
      const capacity = show.seats.length;

      acc[theaterName].totalCapacity += capacity;
      acc[theaterName].totalAvailableSeats += availableSeats;

      acc[theaterName].movies.push({
        showId: show._id,
        movieTitle: show.movieTitle || show.movie,
        category: show.category || 'Movies',
        formats: show.formats && show.formats.length > 0 ? show.formats : ['2D'],
        language: show.language || 'English',
        poster: show.poster,
        startTime: show.startTime,
        ticketPrice: show.ticketPrice,
        totalSeats: capacity,
        availableSeats,
      });

      return acc;
    }, {});

    res.json(Object.values(groupedByTheater));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/shows/:id
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    const showObj = show.toObject();
    showObj.seats = showObj.seats.map((seat) => ({
      ...seat,
      currentPrice: calculateDynamicPrice(seat, showObj),
    }));

    res.json(showObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to auto-generate seat layout for ListYourShow
const generateDefaultSeats = (basePrice) => {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D'];
  rows.forEach((row) => {
    for (let i = 1; i <= 8; i++) {
      const isVip = row === 'A';
      seats.push({
        seatNumber: `${row}${i < 10 ? '0' + i : i}`,
        tier: isVip ? 'VIP' : 'Standard',
        price: isVip ? Math.round(basePrice * 1.3) : basePrice,
        status: 'available',
      });
    }
  });
  return seats;
};

// POST /api/shows/list-your-show
const createShow = async (req, res) => {
  try {
    const { title, category, theater, poster, startTime, ticketPrice } = req.body;

    if (!title || !theater) {
      return res.status(400).json({ message: 'Title and Theater location are required.' });
    }

    const newPrice = Number(ticketPrice) || 300;

    const newShow = new Show({
      movieTitle: title,
      movie: title,
      category: category || 'Events',
      theater: theater,
      theatreName: theater,
      poster: poster || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
      startTime: startTime ? new Date(startTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      ticketPrice: newPrice,
      isActive: true,
      seats: generateDefaultSeats(newPrice),
    });

    const savedShow = await newShow.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('show_created', savedShow);
    }

    res.status(201).json({ message: 'Event published successfully!', show: savedShow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getShows,
  getShowsByTheater,
  getShowById,
  createShow,
};