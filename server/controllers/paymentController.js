const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const crypto = require('crypto');
const { generatePaymentId } = require('../utils/idGenerator');

// @desc    Record payment for a bill
// @route   POST /api/payments
// @access  Customer / Staff / Admin
const recordPayment = async (req, res, next) => {
  try {
    const { billId, paymentMethod } = req.body;

    const allowedMethods = ['Cash', 'UPI', 'Card'];
    if (!billId || !paymentMethod || !allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Please provide billId and a valid paymentMethod (${allowedMethods.join(', ')})`,
      });
    }

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Check if already paid to prevent duplicate payment
    if (bill.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This bill has already been paid in full. Duplicate payment prevented.',
      });
    }

    // Check existing payment records
    const existingPayment = await Payment.findOne({ billId: bill._id, paymentStatus: 'Paid' });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'A successful payment already exists for this bill.',
      });
    }

    // Generate unique simulated transaction reference
    const txnRef = `TXN-${paymentMethod.toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const payment = await Payment.create({
      paymentId: generatePaymentId(),
      billId: bill._id,
      customerId: bill.customerId || req.user._id,
      amount: bill.grandTotal,
      paymentMethod,
      paymentStatus: 'Paid',
      transactionReference: txnRef,
    });

    // Update bill status
    bill.paymentStatus = 'Paid';
    await bill.save();

    // If order exists, update status to Served
    if (bill.orderId) {
      await Order.findByIdAndUpdate(bill.orderId, { orderStatus: 'Served' });
    }

    // If booking exists, update bookingStatus to Completed
    if (bill.bookingId) {
      await Booking.findByIdAndUpdate(bill.bookingId, { bookingStatus: 'Completed' });
    }

    res.status(201).json({
      success: true,
      message: 'Payment processed and recorded successfully!',
      payment,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Customer sees own, Staff/Admin see all)
const getPayments = async (req, res, next) => {
  try {
    const { paymentMethod, search } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { paymentId: { $regex: search, $options: 'i' } },
        { transactionReference: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'billId',
        populate: [
          { path: 'bookingId', select: 'bookingId customerName tableId bookingDate' },
          { path: 'orderId', select: 'orderId items' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('billId');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (req.user.role === 'customer' && payment.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  getPayments,
  getPaymentById,
};
