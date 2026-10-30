const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
    unique: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true, // Prevent duplicate billing for the same order
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tableNumber: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  items: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
      itemName: String,
      quantity: Number,
      unitPrice: Number,
      subtotal: Number,
    }
  ],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxPercentage: {
    type: Number,
    required: true,
    default: 5,
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
