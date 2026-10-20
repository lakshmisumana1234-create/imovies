const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const Booking = require('./models/Booking');

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
  theaterName: { type: String, required: true },
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

io.on('connection', (socket) => {
  console.log("A user connected via WebSocket:", socket.id);
  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
  });
});

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      try {
        const newBooking = await Booking.create({
          user: userId,
          show: showId,
          seats: seats,
          totalPrice: totalPrice,
        });
        console.log("Booking successfully saved to MongoDB:", newBooking._id);
      } catch (dbError) {
        console.error("Error saving booking to database:", dbError);
      }

      if (userEmail) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: `Booking Confirmed: ${movieTitle || 'iMovies Ticket'}`,
          html: `
            <h2>Thank you for your booking!</h2>
            <p>Your seats have been successfully reserved.</p>
            <ul>
              <li><strong>Movie:</strong> ${movieTitle || 'N/A'}</li>
              <li><strong>Seats:</strong> ${seats ? seats.join(', ') : 'N/A'}</li>
              <li><strong>Total Paid:</strong> ₹${totalPrice}</li>
              <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
            </ul>
            <p>Enjoy the show!</p>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.error("Error sending email:", error);
          else console.log("Confirmation email sent: ", info.response);
        });
      }

      if (userPhone) {
        try {
          const formattedPhone = userPhone.startsWith('whatsapp:') ? userPhone : `whatsapp:${userPhone}`;
          const seatList = seats ? seats.join(', ') : 'N/A';

          await twilioClient.messages.create({
            body: `🎬 *iMovies Booking Confirmed!*\n\nYour booking for *${movieTitle || 'Movie'}* is confirmed.\n\n• *Seats:* ${seatList}\n• *Total Paid:* ₹${totalPrice}\n• *Payment ID:* ${razorpay_payment_id}\n\nEnjoy your show!`,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: formattedPhone,
          });
          console.log("WhatsApp confirmation sent successfully");
        } catch (waError) {
          console.error("Error sending WhatsApp message:", waError);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified, saved to database, and notifications dispatched successfully",
        paymentId: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature, verification failed",
      });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ user: userId })
      .populate('show')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/shows', async (req, res) => {
  try {
    const newShow = await Show.create(req.body);
    res.status(201).json({ success: true, show: newShow });
  } catch (error) {
    console.error("Create Show Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/shows', async (req, res) => {
  try {
    const shows = await Show.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, shows });
  } catch (error) {
    console.error("Fetch Shows Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/seed-shows', async (req, res) => {
  try {
    await Show.insertMany([
      { title: "Inception", theaterName: "PVR Cinemas: Screen 1", ticketPrice: 300, time: "7:00 PM" },
      { title: "The Dark Knight", theaterName: "IMAX Screen: Hall 2", ticketPrice: 350, time: "9:30 PM" },
      { title: "Interstellar", theaterName: "Cinepolis: Premium Screen", ticketPrice: 280, time: "4:15 PM" },
      { title: "The Hangover", theaterName: "INOX: Multiplex 3", ticketPrice: 220, time: "6:00 PM" },
      { title: "Avengers: Endgame", theaterName: "PVR Cinemas: Superplex", ticketPrice: 400, time: "8:00 PM" }
    ]);
    res.status(200).json({ success: true, message: "Sample shows added successfully!" });
  } catch (error) {
    console.error("Seed Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});