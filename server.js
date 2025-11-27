
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');


const app = express();

// Connect to local MongoDB
connectDB();

// Middleware
app.use(express.json()); // parse JSON bodies
app.options("*", cors());
app.use(express.urlencoded({ extended: true })); // parse form bodies
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "https://goldentulip-weld.vercel.app",
    "https://airport-golden-tulip-hotel.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/bookings', bookingRoutes);

// Basic health route
app.get('/', (req, res) => res.send('Golden Tulip Booking Backend is running'));

// Error handler (simple)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
