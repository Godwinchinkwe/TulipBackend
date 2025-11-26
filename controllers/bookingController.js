const asyncHandler = require('express-async-handler');
const path = require('path');
const Bookings = require('../models/Bookings');
const sendMail = require('../utils/sendEmail');

/**
 * POST /api/bookings
 * Accepts form-data (including file via multer)
 */

const formatNaira = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0
  }).format(Number(amount));
};

const createBooking = asyncHandler(async (req, res) => {
  // Multer adds file to req.file (if provided)
  const {
    roomType,
    checkIn,
    checkOut,
    guests,
    firstName,
    lastName,
    email,
    phone,
    specialRequests,
    paymentChoice,
    total
  } = req.body;

  

  // Simple validation (more robust validation can be added)
  if (!roomType || !checkIn || !checkOut || !firstName || !lastName || !email || !phone || !paymentChoice) {
    res.status(400);
    throw new Error('Missing required booking fields');
  }

  // Compute nights if not provided
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1;

  // Generate 9-digit reference (100,000,000 → 999,999,999)
const bookingReference = Math.floor(100000000 + Math.random() * 900000000).toString();


  // Build paymentProof object if file exists
  let paymentProof = {};
  if (req.file) {
    paymentProof = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      path: `/uploads/${req.file.filename}`
    };
  }

  // Set status depending on paymentChoice
  const status = paymentChoice === 'arrival' ? 'confirmed' : 'pending';

  // Save booking to DB
  const booking = await Bookings.create({
    roomType,
    checkIn,
    checkOut,
    nights,
    guests: guests || 1,
    firstName,
    lastName,
    email,
    phone,
    specialRequests,
    paymentChoice,
    paymentProof,
    total: total || 0,
    status,
    bookingReference
  });

  // Prepare email content
  const bookingDetailsText = `
Booking Reference: ${booking.bookingReference}
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Room Type: ${roomType}
Check-in: ${new Date(checkIn).toLocaleString()}
Check-out: ${new Date(checkOut).toLocaleString()}
Nights: ${nights}
Guests: ${guests}
Total:${formatNaira(booking.total)}
Payment Choice: ${paymentChoice}
Status: ${status}
Special Requests: ${specialRequests || 'None'}
  `;

  const customerHtml = `
    <h2>Booking ${status === 'confirmed' ? 'Confirmed' : 'Pending Verification'}</h2>
    <p>Hi ${firstName},</p>
    <p>Thank you for choosing Airport Golden Tulip Hotel. We have received your booking request. Below are your booking details:</p>
    <pre>${bookingDetailsText}</pre>
    <p>${status === 'pending' ? 'Your payment proof will be verified by our team. You will receive an email once confirmation is complete.' : 'Please pay on arrival.'}</p>
    <p>Regards,<br/>Airport Golden Tulip Hotel</p>
  `;

  const hotelHtml = `
    <h2>New Booking Received</h2>
    <p>A new booking has been placed. Details:</p>
    <pre>${bookingDetailsText}</pre>
  `;

  // Email the customer
  try {
    await sendMail({
      to: email,
      subject: `Golden Tulip Booking ${status === 'confirmed' ? 'Confirmed' : 'Pending Verification'}`,
      text: bookingDetailsText,
      html: customerHtml
    });
  } catch (err) {
    console.error('Error sending email to customer:', err);
    // don't throw - the booking is already saved; log and continue
  }

  // Email the hotel front desk (attach payment proof if uploaded)
  const hotelAttachments = [];
  if (req.file) {
    hotelAttachments.push({
      filename: req.file.originalname,
      path: req.file.path
    });
  }

  try {
    await sendMail({
      to: process.env.HOTEL_EMAIL,
      subject: `New Booking Received - ${booking._id}`,
      text: bookingDetailsText,
      html: hotelHtml,
      attachments: hotelAttachments
    });
  } catch (err) {
    console.error('Error sending email to hotel:', err);
  }

  // Return booking to frontend
  res.status(201).json(booking);
});

/**
 * GET /api/bookings
 * Returns all bookings (for admin dashboard)
 */
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Bookings.find().sort({ createdAt: -1 });
  res.json(bookings);
});

module.exports = {
  createBooking,
  getBookings
};
