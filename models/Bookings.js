const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true
  },

  checkIn: {
    type: Date,
    required: true
  },

  checkOut: {
    type: Date,
    required: true
  },

  nights: {
    type: Number,
    required: true
  },

  // Number of rooms booked
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1
  },

  // Number of guests assigned to each room
  // Example: [2, 1] = Room 1 has 2 guests, Room 2 has 1 guest
  guestsPerRoom: {
    type: [Number],
    required: true,
    validate: {
      validator: function (rooms) {
        return rooms.length === this.numberOfRooms;
      },
      message: "Number of guest entries must match number of rooms"
    }
  },

  // Total guests across all rooms
  guests: {
    type: Number,
    required: true,
    min: 1
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  specialRequests: {
    type: String
  },

  paymentChoice: {
    type: String,
    enum: ["deposit", "arrival"],
    required: true
  },

  paymentProof: {
    originalName: {
      type: String
    },
    storedName: {
      type: String
    },
    path: {
      type: String
    }
  },

  total: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "confirmed"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  bookingReference: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Booking", bookingSchema);