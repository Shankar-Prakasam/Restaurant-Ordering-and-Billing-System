const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');

// @desc    Verify QR token and return booking, order, and billing details
// @route   GET /api/qr/verify/:token
// @access  Public (Used by QR scanner / staff verification page)
const verifyQrToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const booking = await Booking.findOne({ qrToken: token })
      .populate('tableId', 'tableNumber capacity tableType')
      .populate('customerId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Invalid or unrecognized QR Code reference. Reservation not found.',
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'This booking has been CANCELLED and is no longer valid.',
        booking: {
          bookingId: booking.bookingId,
          bookingStatus: booking.bookingStatus,
          cancelledAt: booking.cancelledAt,
          cancellationReason: booking.cancellationReason,
        },
      });
    }

    // Find associated orders
    const orders = await Order.find({ bookingId: booking._id });
    
    // Find associated bill & payment if any
    let bill = null;
    let payment = null;
    if (orders.length > 0) {
      bill = await Bill.findOne({ orderId: { $in: orders.map(o => o._id) } });
      if (bill) {
        payment = await Payment.findOne({ billId: bill._id });
      }
    }

    res.status(200).json({
      success: true,
      verified: true,
      message: 'Booking QR Code successfully verified!',
      data: {
        booking: {
          bookingId: booking.bookingId,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          tableNumber: booking.tableId?.tableNumber,
          tableType: booking.tableId?.tableType,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          duration: booking.duration,
          numberOfGuests: booking.numberOfGuests,
          specialRequests: booking.specialRequests,
          bookingStatus: booking.bookingStatus,
          createdAt: booking.createdAt,
        },
        orders,
        bill,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyQrToken,
};
