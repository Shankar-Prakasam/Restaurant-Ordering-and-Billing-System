const Booking = require('../models/Booking');

/**
 * Convert HH:mm to minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks if two time windows overlap on the same day:
 * Window 1: [start1, start1 + duration1]
 * Window 2: [start2, start2 + duration2]
 */
const isTimeOverlapping = (start1, duration1, start2, duration2) => {
  const s1 = timeToMinutes(start1);
  const e1 = s1 + duration1;
  const s2 = timeToMinutes(start2);
  const e2 = s2 + duration2;

  return s1 < e2 && s2 < e1;
};

/**
 * Get unavailable table IDs for a specific date, start time, and duration
 */
const getUnavailableTableIds = async (bookingDate, startTime, duration = 90, excludeBookingId = null) => {
  const query = {
    bookingDate,
    bookingStatus: { $nin: ['Cancelled'] }, // Cancelled bookings do not block availability
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await Booking.find(query);
  const unavailableTableIds = [];

  for (const b of existingBookings) {
    if (isTimeOverlapping(startTime, duration, b.startTime, b.duration || 90)) {
      unavailableTableIds.push(b.tableId.toString());
    }
  }

  return [...new Set(unavailableTableIds)];
};

/**
 * Validates if a booking can be cancelled according to the rule:
 * Booking start time must be MORE THAN 30 MINUTES away.
 */
const canCancelBooking = (bookingDate, startTime) => {
  const now = new Date();
  
  // Create Date object for booking start time
  // bookingDate format: 'YYYY-MM-DD', startTime format: 'HH:mm'
  const [year, month, day] = bookingDate.split('-').map(Number);
  const [hour, minute] = startTime.split(':').map(Number);
  
  const bookingDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

  const diffInMs = bookingDateTime.getTime() - now.getTime();
  const diffInMinutes = diffInMs / (1000 * 60);

  return {
    canCancel: diffInMinutes > 30,
    minutesRemaining: Math.round(diffInMinutes),
  };
};

module.exports = {
  timeToMinutes,
  isTimeOverlapping,
  getUnavailableTableIds,
  canCancelBooking,
};
