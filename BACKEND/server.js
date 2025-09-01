const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// In-memory storage for bookings (fallback when MongoDB is not available)
let inMemoryBookings = [];
let bookingIdCounter = 1;

// Try to connect to MongoDB, but don't fail if it's not available
let isMongoConnected = false;

const connectToMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-bookings';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    isMongoConnected = true;
    console.log("✅ MongoDB connected successfully!");
    
    // Import Booking model only if MongoDB is connected
    const Booking = require('./models/Booking');
    global.Booking = Booking;
  } catch (err) {
    console.log("⚠️  MongoDB not available, using in-memory storage");
    console.log("   This is fine for testing - bookings will be stored in memory");
    isMongoConnected = false;
  }
};

// Connect to MongoDB
connectToMongo();

// ===== Auth: User model and routes =====
const User = require('./models/User');

// Middleware to authenticate and get user from token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const user = new User({ firstName, lastName, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// POST /api/book - Create a new booking (requires authentication)
app.post('/api/book', authenticateToken, async (req, res) => {
  try {
    const { title, firstName, lastName, email, phone, restaurant, date, time, guests, comments } = req.body;
    
    // Basic validation
    if (!title || !firstName || !lastName || !email || !phone || !restaurant || !date || !time || !guests) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    // Create booking object (attach authenticated user)
    const bookingData = {
      user: req.user.userId,
      title,
      firstName,
      lastName,
      email,
      phone,
      restaurant,
      date,
      time,
      guests: parseInt(guests),
      comments: comments || '',
      createdAt: new Date()
    };

    let savedBooking;

    if (isMongoConnected && global.Booking) {
      // Save to MongoDB
      const booking = new global.Booking(bookingData);
      savedBooking = await booking.save();
      console.log("✅ Booking saved to MongoDB:", savedBooking._id);
    } else {
      // Save to in-memory storage
      const inMemoryBooking = {
        _id: `mem_${bookingIdCounter++}`,
        ...bookingData
      };
      inMemoryBookings.push(inMemoryBooking);
      savedBooking = inMemoryBooking;
      console.log("✅ Booking saved to memory:", savedBooking._id);
    }
    
    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking: savedBooking,
      _id: savedBooking._id 
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    
    // Provide a more helpful error message
    let errorMessage = 'Server error occurred while creating booking';
    
    if (err.name === 'ValidationError') {
      errorMessage = 'Invalid booking data: ' + Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.code === 11000) {
      errorMessage = 'A booking with this information already exists';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings - List bookings for the logged-in user
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    let bookings = [];
    if (isMongoConnected && global.Booking) {
      bookings = await global.Booking.find({ user: req.user.userId }).sort({ createdAt: -1 });
    } else {
      bookings = [...inMemoryBookings].filter(b => b.user === req.user.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bookings', details: err.message });
  }
});

// DELETE /api/bookings/:id - Delete a booking that belongs to the logged-in user
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected && global.Booking) {
      const booking = await global.Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      if (String(booking.user) !== String(req.user.userId)) {
        return res.status(403).json({ error: 'You can cancel only your own bookings' });
      }
      const deleted = await global.Booking.findByIdAndDelete(id);
      return res.json({ message: 'Booking cancelled successfully', booking: deleted });
    }

    // In-memory fallback
    const index = inMemoryBookings.findIndex(b => String(b._id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (String(inMemoryBookings[index].user) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'You can cancel only your own bookings' });
    }
    const [deleted] = inMemoryBookings.splice(index, 1);
    return res.json({ message: 'Booking cancelled successfully', booking: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking', details: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString(),
    memoryBookings: inMemoryBookings.length
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/book`);
  console.log(`   GET  http://localhost:${PORT}/api/bookings`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`Storage: ${isMongoConnected ? 'MongoDB' : 'In-Memory'}`);
});
