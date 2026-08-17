const asyncHandler = require("express-async-handler");
const Bookings = require("../models/Bookings");
const sendMail = require("../utils/sendEmail");


const ROOM_PRICES = {
  deluxe: 150000,
  executive: 180000,
  suite: 300000,
};

// =====================================================
// WEEKEND PROMOTION
// =====================================================

const WEEKEND_DISCOUNT = 0.30;

const PROMOTION_END = new Date("2026-12-31T23:59:59");

const ELIGIBLE_ROOMS = [
  "deluxe",
  "executive",
];


// =====================================================
// CURRENCY FORMATTER
// =====================================================

const formatNaira = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(amount));
};


// =====================================================
// CHECK PROMOTION
// =====================================================

const isPromotionActive = () => {
  return new Date() <= PROMOTION_END;
};


// =====================================================
// CHECK WEEKEND NIGHT
// Friday = 5
// Saturday = 6
// Sunday = 0
// =====================================================

const isWeekendNight = (date) => {
  const day = date.getUTCDay();

  return day === 5 || day === 6 || day === 0;
};


// =====================================================
// CREATE BOOKING
// =====================================================

const createBooking = asyncHandler(async (req, res) => {

  // ===================================================
  // GET DATA FROM FRONTEND
  // ===================================================

  const {
    roomType,
    checkIn,
    checkOut,
    numberOfRooms,
    guestsPerRoom,
    guests,
    firstName,
    lastName,
    email,
    phone,
    specialRequests,
    paymentChoice,
  } = req.body;


  // ===================================================
  // BASIC REQUIRED FIELD VALIDATION
  // ===================================================

  if (
    !roomType ||
    !checkIn ||
    !checkOut ||
    !numberOfRooms ||
    !guestsPerRoom ||
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !paymentChoice
  ) {
    res.status(400);
    throw new Error("Missing required booking fields");
  }


  // ===================================================
  // VALIDATE ROOM TYPE
  // ===================================================

  if (!ROOM_PRICES[roomType]) {
    res.status(400);
    throw new Error("Invalid room type");
  }


  // ===================================================
  // CONVERT NUMBER OF ROOMS
  // ===================================================

  const roomsCount = parseInt(numberOfRooms, 10);

  if (
    Number.isNaN(roomsCount) ||
    roomsCount < 1 ||
    roomsCount > 10
  ) {
    res.status(400);
    throw new Error("Number of rooms must be between 1 and 10");
  }


  // ===================================================
  // PARSE GUESTS PER ROOM
  // ===================================================

  let parsedGuestsPerRoom;

  try {
    parsedGuestsPerRoom =
      typeof guestsPerRoom === "string"
        ? JSON.parse(guestsPerRoom)
        : guestsPerRoom;
  } catch (error) {
    res.status(400);
    throw new Error("Invalid guests per room data");
  }


  // ===================================================
  // VALIDATE GUESTS PER ROOM
  // ===================================================

  if (!Array.isArray(parsedGuestsPerRoom)) {
    res.status(400);
    throw new Error("Guests per room must be an array");
  }


  if (parsedGuestsPerRoom.length !== roomsCount) {
    res.status(400);
    throw new Error(
      "Number of guest entries must match number of rooms"
    );
  }


  // ===================================================
  // VALIDATE EACH ROOM'S GUEST COUNT
  // ===================================================

  const validGuestsPerRoom =
    parsedGuestsPerRoom.every((roomGuests) => {
      const guestsNumber = Number(roomGuests);

      return (
        Number.isInteger(guestsNumber) &&
        guestsNumber >= 1 &&
        guestsNumber <= 3
      );
    });


  if (!validGuestsPerRoom) {
    res.status(400);
    throw new Error(
      "Each room must have between 1 and 3 guests"
    );
  }


  // ===================================================
  // CALCULATE TOTAL GUESTS
  // ===================================================

  const totalGuests =
    parsedGuestsPerRoom.reduce(
      (sum, roomGuests) =>
        sum + Number(roomGuests),
      0
    );


  // ===================================================
  // VERIFY FRONTEND TOTAL GUESTS
  // ===================================================

  if (
    guests !== undefined &&
    Number(guests) !== totalGuests
  ) {
    res.status(400);
    throw new Error(
      "Total guest count does not match guests per room"
    );
  }


  // ===================================================
  // VALIDATE DATES
  // ===================================================

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);


  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    res.status(400);
    throw new Error("Invalid check-in or check-out date");
  }


  if (checkOutDate <= checkInDate) {
    res.status(400);
    throw new Error(
      "Check-out date must be after check-in date"
    );
  }


  // ===================================================
  // CALCULATE NUMBER OF NIGHTS
  // ===================================================

  const nights = Math.ceil(
    (checkOutDate - checkInDate) /
      (1000 * 60 * 60 * 24)
  );


  // ===================================================
  // CALCULATE PRICE
  // ===================================================

  const roomPrice = ROOM_PRICES[roomType];

  let subtotal = 0;
  let discount = 0;

  let weekendNights = 0;
  let regularNights = 0;

  let currentDate = new Date(checkInDate);

  while (currentDate < checkOutDate) {

    // Price for ALL selected rooms
    subtotal +=
      roomPrice * roomsCount;


    // Check weekend promotion
    const eligibleRoom =
      ELIGIBLE_ROOMS.includes(roomType);


    if (
      eligibleRoom &&
      isPromotionActive() &&
      isWeekendNight(currentDate)
    ) {

      discount +=
        roomPrice *
        WEEKEND_DISCOUNT *
        roomsCount;

      weekendNights++;

    } else {

      regularNights++;
    }


    currentDate.setUTCDate(
      currentDate.getUTCDate() + 1
    );
  }


  // ===================================================
  // FINAL TOTAL
  // ===================================================

  const total = subtotal - discount;


  // ===================================================
  // GENERATE BOOKING REFERENCE
  // ===================================================

  const bookingReference =
    Math.floor(
      100000000 +
      Math.random() * 900000000
    ).toString();


  // ===================================================
  // PAYMENT PROOF
  // ===================================================

  let paymentProof = {};

  if (req.file) {

    paymentProof = {
      originalName:
        req.file.originalname,

      storedName:
        req.file.filename,

      path:
        `/uploads/${req.file.filename}`,
    };
  }


  // ===================================================
  // BOOKING STATUS
  // ===================================================

  const status =
    paymentChoice === "arrival"
      ? "confirmed"
      : "pending";


  // ===================================================
  // PROMOTION NAME
  // ===================================================

  const promotion =
    discount > 0
      ? "Weekend Special 30%"
      : "None";


  // ===================================================
  // SAVE BOOKING
  // ===================================================

  const booking =
    await Bookings.create({

      roomType,

      checkIn,

      checkOut,

      nights,

      numberOfRooms: roomsCount,

      guestsPerRoom:
        parsedGuestsPerRoom.map(
          Number
        ),

      guests: totalGuests,

      firstName,

      lastName,

      email,

      phone,

      specialRequests,

      paymentChoice,

      paymentProof,

      subtotal,

      discount,

      promotion,

      weekendNights,

      regularNights,

      total,

      status,

      bookingReference,
    });


  // ===================================================
  // EMAIL CONTENT
  // ===================================================

  const guestsPerRoomText =
    parsedGuestsPerRoom
      .map(
        (roomGuests, index) =>
          `Room ${index + 1}: ${roomGuests} Guest${
            Number(roomGuests) > 1
              ? "s"
              : ""
          }`
      )
      .join("\n");


  const bookingDetailsText = `
Booking Reference: ${booking.bookingReference}

Name: ${firstName} ${lastName}

Email: ${email}

Phone: ${phone}

Room Type: ${roomType}

Number of Rooms: ${roomsCount}

Guests Per Room:
${guestsPerRoomText}

Total Guests: ${totalGuests}

Check-in:
${new Date(checkIn).toLocaleString()}

Check-out:
${new Date(checkOut).toLocaleString()}

Nights: ${nights}

Original Price:
${formatNaira(subtotal)}

Weekend Discount:
${formatNaira(discount)}

Promotion:
${promotion}

Total:
${formatNaira(total)}

Payment Choice: ${paymentChoice}

Status: ${status}

Special Requests:
${specialRequests || "None"}
  `;


  // ===================================================
  // CUSTOMER EMAIL
  // ===================================================

  const customerHtml = `
    <h2>
      Booking ${
        status === "confirmed"
          ? "Confirmed"
          : "Pending Verification"
      }
    </h2>

    <p>Hi ${firstName},</p>

    <p>
      Thank you for choosing
      Airport Golden Tulip Hotel.
      We have received your booking request.
    </p>

    <pre>${bookingDetailsText}</pre>

    <p>
      ${
        status === "pending"
          ? "Your payment proof will be verified by our team. You will receive an email once confirmation is complete."
          : "Please pay on arrival."
      }
    </p>

    <p>
      Regards,<br/>
      Airport Golden Tulip Hotel
    </p>
  `;


  // ===================================================
  // HOTEL EMAIL
  // ===================================================

  const hotelHtml = `
    <h2>New Booking Received</h2>

    <p>
      A new booking has been placed.
    </p>

    <pre>${bookingDetailsText}</pre>
  `;


  // ===================================================
  // SEND CUSTOMER EMAIL
  // ===================================================

  try {

    await sendMail({
      to: email,

      subject:
        `Golden Tulip Booking ${
          status === "confirmed"
            ? "Confirmed"
            : "Pending Verification"
        }`,

      text: bookingDetailsText,

      html: customerHtml,
    });

  } catch (err) {

    console.error(
      "Error sending email to customer:",
      err
    );

  }


  // ===================================================
  // HOTEL EMAIL ATTACHMENT
  // ===================================================

  const hotelAttachments = [];

  if (req.file) {

    hotelAttachments.push({
      filename:
        req.file.originalname,

      path:
        req.file.path,
    });
  }


  // ===================================================
  // SEND HOTEL EMAIL
  // ===================================================

  try {

    await sendMail({

      to: process.env.HOTEL_EMAIL,

      subject:
        `New Booking Received - ${booking._id}`,

      text: bookingDetailsText,

      html: hotelHtml,

      attachments:
        hotelAttachments,
    });

  } catch (err) {

    console.error(
      "Error sending email to hotel:",
      err
    );

  }


  // ===================================================
  // RESPONSE
  // ===================================================

  res.status(201).json({

    success: true,

    booking,
  });
});


// =====================================================
// GET ALL BOOKINGS
// =====================================================

const getBookings =
  asyncHandler(async (req, res) => {

    const bookings =
      await Bookings
        .find()
        .sort({
          createdAt: -1
        });

    res.json(bookings);
  });


module.exports = {
  createBooking,
  getBookings,
};