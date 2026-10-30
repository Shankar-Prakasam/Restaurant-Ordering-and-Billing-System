const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  bookingDate: {
    type: String, // 'YYYY-MM-DD'
    required: [true, 'Please provide booking date (YYYY-MM-DD)'],
  },
  startTime: {
    type: String, // 'HH:mm' e.g. '19:00'
    required: [true, 'Please provide booking time (HH:mm)'],
  },
  duration: {
    type: Number, // Duration in minutes
    default: 90,
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Please provide number of guests'],
    min: 1,
  },
  specialRequests: {
    type: String,
    default: '',
  },
  bookingStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Confirmed',
  },
  qrToken: {
    type: String,
    required: true,
    unique: true,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  }
}, {
  timestamps: true
});

// Compound index for querying bookings by date and status
bookingSchema.index({ bookingDate: 1, bookingStatus: 1 });
bookingSchema.index({ tableId: 1, bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
