const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createBooking, getBookings } = require('../controllers/bookingController');

// Upload directory and multer config
const uploadDir = path.join(__dirname, '..', 'uploads');

// Multer storage: generate safe filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    // keep original extension
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const safeName = `${timestamp}_${base}${ext}`; // e.g. 1612345678900_receipt.pdf
    cb(null, safeName);
  }
});

// File filter for pdf, png, jpg, jpeg
const fileFilter = function (req, file, cb) {
  const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG and JPEG are allowed.'));
  }
};

// Limit: 8MB
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter
});

// Routes
// POST booking (multipart/form-data)
router.post('/', upload.single('paymentProof'), createBooking);

// GET all bookings
router.get('/', getBookings);

module.exports = router;
