const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/book - Create a new booking
router.post('/book', async (req, res) => {
  try {
    const {
      title, firstName, lastName, email, phone,
      restaurant, date, time, guests, comments
    } = req.body;

    // Validate required fields
    if (!title || !firstName || !lastName || !email || !phone || !restaurant || !date || !time || !guests) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    // Create and save new booking
    const booking = new Booking({
      title, firstName, lastName, email, phone,
      restaurant, date, time, guests, comments
    });

    await booking.save();
    res.status(201).json({ message: 'Booking saved successfully', booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/bookings - Fetch all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/bookings/:tableNo - Fetch bookings by number of guests
router.get('/bookings/:tableNo', async (req, res) => {
  try {
    const tableNo = parseInt(req.params.tableNo);
    if (isNaN(tableNo)) {
      return res.status(400).json({ error: 'Invalid guest count' });
    }

    const bookings = await Booking.find({ guests: tableNo });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/booking/:id - Fetch a booking by ID
router.get('/booking/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
