exports.guestBookingTemplate = (booking) => {
  const guestsPerRoom = (booking.guestsPerRoom || [])
    .map(
      (guests, index) =>
        `<li><strong>Room ${index + 1}:</strong> ${guests} Guest${
          Number(guests) > 1 ? "s" : ""
        }</li>`
    )
    .join("");

  return `
    <h2>Your Booking is Confirmed!</h2>

    <p>
      Dear ${booking.firstName} ${booking.lastName},
    </p>

    <p>
      Your reservation at
      <strong>Golden Tulip Airport Hotel</strong>
      is confirmed.
    </p>

    <h3>Booking Details:</h3>

    <ul>
      <li>
        <strong>Room:</strong>
        ${booking.roomType}
      </li>

      <li>
        <strong>Number of Rooms:</strong>
        ${booking.numberOfRooms}
      </li>

      ${guestsPerRoom}

      <li>
        <strong>Total Guests:</strong>
        ${booking.guests}
      </li>

      <li>
        <strong>Check-in:</strong>
        ${new Date(booking.checkIn).toDateString()}
      </li>

      <li>
        <strong>Check-out:</strong>
        ${new Date(booking.checkOut).toDateString()}
      </li>

      <li>
        <strong>Nights:</strong>
        ${booking.nights}
      </li>

      <li>
        <strong>Original Price:</strong>
        ₦${Number(booking.subtotal || 0).toLocaleString()}
      </li>

      ${
        booking.discount > 0
          ? `
            <li>
              <strong>Weekend Discount:</strong>
              -₦${Number(booking.discount).toLocaleString()}
            </li>

            <li>
              <strong>Promotion:</strong>
              ${booking.promotion || "Weekend Special 30%"}
            </li>
          `
          : ""
      }

      <li>
        <strong>Total:</strong>
        ₦${Number(booking.total).toLocaleString()}
      </li>

      <li>
        <strong>Status:</strong>
        Confirmed
      </li>

      <li>
        <strong>Reference:</strong>
        ${booking.bookingReference}
      </li>
    </ul>

    <p>
      We look forward to hosting you.
    </p>
  `;
};


exports.hotelNotificationTemplate = (booking) => {
  const guestsPerRoom = (booking.guestsPerRoom || [])
    .map(
      (guests, index) =>
        `<li><strong>Room ${index + 1}:</strong> ${guests} Guest${
          Number(guests) > 1 ? "s" : ""
        }</li>`
    )
    .join("");

  return `
    <h2>New Booking Received</h2>

    <p>
      A guest has made a reservation.
    </p>

    <h3>Guest Details:</h3>

    <ul>
      <li>
        <strong>Name:</strong>
        ${booking.firstName} ${booking.lastName}
      </li>

      <li>
        <strong>Email:</strong>
        ${booking.email}
      </li>

      <li>
        <strong>Phone:</strong>
        ${booking.phone}
      </li>
    </ul>

    <h3>Booking Details:</h3>

    <ul>
      <li>
        <strong>Room:</strong>
        ${booking.roomType}
      </li>

      <li>
        <strong>Number of Rooms:</strong>
        ${booking.numberOfRooms}
      </li>

      ${guestsPerRoom}

      <li>
        <strong>Total Guests:</strong>
        ${booking.guests}
      </li>

      <li>
        <strong>Check-in:</strong>
        ${new Date(booking.checkIn).toDateString()}
      </li>

      <li>
        <strong>Check-out:</strong>
        ${new Date(booking.checkOut).toDateString()}
      </li>

      <li>
        <strong>Nights:</strong>
        ${booking.nights}
      </li>

      <li>
        <strong>Original Price:</strong>
        ₦${Number(booking.subtotal || 0).toLocaleString()}
      </li>

      ${
        booking.discount > 0
          ? `
            <li>
              <strong>Weekend Discount:</strong>
              -₦${Number(booking.discount).toLocaleString()}
            </li>

            <li>
              <strong>Promotion:</strong>
              ${booking.promotion || "Weekend Special 30%"}
            </li>
          `
          : ""
      }

      <li>
        <strong>Total:</strong>
        ₦${Number(booking.total).toLocaleString()}
      </li>

      <li>
        <strong>Payment:</strong>
        ${booking.paymentChoice}
      </li>

      <li>
        <strong>Status:</strong>
        ${booking.status}
      </li>

      <li>
        <strong>Reference:</strong>
        ${booking.bookingReference}
      </li>
    </ul>

    ${
      booking.specialRequests
        ? `
          <h3>Special Requests:</h3>
          <p>${booking.specialRequests}</p>
        `
        : ""
    }
  `;
};