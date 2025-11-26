const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights: { type: Number, required: true },
  guests: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialRequests: { type: String },
  paymentChoice: { type: String, enum: ['deposit', 'arrival'], required: true },
  paymentProof: {
    originalName: { type: String },
    storedName: { type: String },
    path: { type: String }
  },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  bookingReference: { type: String, required: true, unique: true }

});

module.exports = mongoose.model('Booking', bookingSchema);
