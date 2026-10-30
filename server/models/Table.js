const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: [true, 'Please provide table number'],
    unique: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide seating capacity'],
    min: 1,
  },
  tableType: {
    type: String,
    enum: ['Indoor', 'Outdoor', 'Rooftop', 'Family Booth', 'VIP Window'],
    default: 'Indoor',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
