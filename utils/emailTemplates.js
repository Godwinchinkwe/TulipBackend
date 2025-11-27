exports.guestBookingTemplate = (booking) => `
  <h2>Your Booking is Confirmed!</h2>
  <p>Dear ${booking.firstName} ${booking.lastName},</p>
  <p>Your reservation at <strong>Golden Tulip Airport Hotel</strong> is confirmed.</p>

  <h3>Booking Details:</h3>
  <ul>
    <li><strong>Room:</strong> ${booking.roomType}</li>
    <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toDateString()}</li>
    <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toDateString()}</li>
    <li><strong>Total:</strong> ₦${booking.total.toLocaleString()}</li>
    <li><strong>Status:</strong> Confirmed</li>
    <li><strong>Reference:</strong> ${booking.bookingReference}</li>
  </ul>

  <p>We look forward to hosting you.</p>
`;

exports.hotelNotificationTemplate = (booking) => `
  <h2>New Booking Received</h2>
  <p>A guest has made a reservation.</p>

  <h3>Details:</h3>
  <ul>
    <li><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</li>
    <li><strong>Email:</strong> ${booking.email}</li>
    <li><strong>Phone:</strong> ${booking.phone}</li>
    <li><strong>Room:</strong> ${booking.roomType}</li>
    <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toDateString()}</li>
    <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toDateString()}</li>
    <li><strong>Total:</strong> ₦${booking.total.toLocaleString()}</li>
    <li><strong>Reference:</strong> ${booking.bookingReference}</li>
  </ul>
`;
