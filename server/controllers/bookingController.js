const Booking = require('../models/Booking');
const Table = require('../models/Table');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const QRCode = require('qrcode');
const { generateBookingId, generateOrderId, generateQrToken } = require('../utils/idGenerator');
const { isTimeOverlapping, canCancelBooking } = require('../utils/availability');

// @desc    Create a new booking (with optional food pre-order)
// @route   POST /api/bookings
// @access  Customer (or Staff on behalf of customer)
const createBooking = async (req, res, next) => {
  try {
    const {
      tableId,
      bookingDate,
      startTime,
      duration = 90,
      numberOfGuests,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail,
      orderedItems, // Optional array of { menuItemId, quantity }
    } = req.body;

    // Validate required fields
    if (!tableId || !bookingDate || !startTime || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tableId, bookingDate, startTime, and numberOfGuests',
      });
    }

    const guests = Number(numberOfGuests);
    if (guests < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of guests must be at least 1',
      });
    }

    // Validate date is not in the past
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (bookingDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a table for a past date',
      });
    }

    // Check if table exists and is active
    const table = await Table.findById(tableId);
    if (!table || !table.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected table is not available or does not exist',
      });
    }

    // Check table capacity
    if (table.capacity < guests) {
      return res.status(400).json({
        success: false,
        message: `Selected table only seats ${table.capacity} guests. You requested ${guests} guests.`,
      });
    }

    // Check for double booking overlap on the same table
    const existingBookings = await Booking.find({
      tableId,
      bookingDate,
      bookingStatus: { $ne: 'Cancelled' },
    });

    const hasOverlap = existingBookings.some(b =>
      isTimeOverlapping(startTime, Number(duration), b.startTime, b.duration || 90)
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'This table is already booked for the selected date and time window. Please choose another table or time.',
      });
    }

    // Set customer details
    const customerId = req.user._id;
    const finalCustomerName = (req.user.role === 'customer') ? req.user.name : (customerName || req.user.name);
    const finalCustomerPhone = (req.user.role === 'customer') ? req.user.phone : (customerPhone || req.user.phone);
    const finalCustomerEmail = (req.user.role === 'customer') ? req.user.email : (customerEmail || req.user.email);

    const bookingId = generateBookingId();
    const qrToken = generateQrToken();

    const booking = await Booking.create({
      bookingId,
      customerId,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerEmail: finalCustomerEmail,
      tableId,
      bookingDate,
      startTime,
      duration: Number(duration),
      numberOfGuests: guests,
      specialRequests: specialRequests || '',
      bookingStatus: 'Confirmed',
      qrToken,
    });

    // Handle optional food ordering during booking
    let createdOrder = null;
    if (orderedItems && Array.isArray(orderedItems) && orderedItems.length > 0) {
      // Calculate prices strictly from database
      const itemIds = orderedItems.map(item => item.menuItemId);
      const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
      const menuMap = new Map(dbMenuItems.map(m => [m._id.toString(), m]));

      let orderSubtotal = 0;
      const verifiedItems = [];

      for (const item of orderedItems) {
        const dbItem = menuMap.get(item.menuItemId.toString());
        if (!dbItem) {
          return res.status(400).json({
            success: false,
            message: `Menu item with id ${item.menuItemId} does not exist`,
          });
        }
        if (!dbItem.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Menu item "${dbItem.name}" is currently unavailable`,
          });
        }

        const qty = Number(item.quantity) || 1;
        const itemSubtotal = dbItem.price * qty;
        orderSubtotal += itemSubtotal;

        verifiedItems.push({
          menuItemId: dbItem._id,
          itemName: dbItem.name,
          quantity: qty,
          unitPrice: dbItem.price,
          subtotal: itemSubtotal,
        });
      }

      createdOrder = await Order.create({
        orderId: generateOrderId(),
        bookingId: booking._id,
        customerId,
        tableId,
        items: verifiedItems,
        subtotal: orderSubtotal,
        orderStatus: 'Confirmed',
        isBilled: false,
        notes: 'Pre-ordered with table reservation',
      });
    }

    const populatedBooking = await Booking.findById(booking._id).populate('tableId');

    res.status(201).json({
      success: true,
      message: 'Table booked successfully!',
      booking: populatedBooking,
      order: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Customers only see their own, Staff & Admin see all with filters)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const { date, status, search } = req.query;
    const query = {};

    // Customer can only see their own bookings
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    if (date) {
      query.bookingDate = date;
    }

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('tableId', 'tableNumber capacity tableType')
      .populate('customerId', 'name email phone')
      .sort({ bookingDate: -1, startTime: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tableId')
      .populate('customerId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Role check: Customer can only view their own booking
    if (req.user.role === 'customer' && booking.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    // Find associated order & bill if any
    const order = await Order.findOne({ bookingId: booking._id });
    let bill = null;
    if (order) {
      const Bill = require('../models/Bill');
      bill = await Bill.findOne({ orderId: order._id });
    }

    res.status(200).json({
      success: true,
      booking,
      order,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (Enforcing the strict 30-minute rule!)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership if customer
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed booking cannot be cancelled' });
    }

    // STRICT 30-MINUTE RULE CHECK:
    // If user is a customer, they can only cancel if booking start time is MORE THAN 30 minutes away!
    if (req.user.role === 'customer') {
      const cancellationCheck = canCancelBooking(booking.bookingDate, booking.startTime);
      if (!cancellationCheck.canCancel) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation rejected: Bookings can only be cancelled more than 30 minutes before the scheduled time.',
          minutesRemaining: cancellationCheck.minutesRemaining,
        });
      }
    }

    booking.bookingStatus = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || (req.user.role === 'customer' ? 'Cancelled by customer' : 'Cancelled by staff/admin');
    await booking.save();

    // Also cancel any unbilled orders linked to this booking
    await Order.updateMany(
      { bookingId: booking._id, isBilled: false },
      { orderStatus: 'Cancelled' }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Table is now released.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking details (Staff / Admin)
// @route   PUT /api/bookings/:id
// @access  Staff / Admin
const updateBooking = async (req, res, next) => {
  try {
    const { tableId, bookingStatus, specialRequests, numberOfGuests } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (tableId && tableId !== booking.tableId.toString()) {
      // Validate new table availability
      const existing = await Booking.find({
        _id: { $ne: booking._id },
        tableId,
        bookingDate: booking.bookingDate,
        bookingStatus: { $ne: 'Cancelled' },
      });

      const overlap = existing.some(b =>
        isTimeOverlapping(booking.startTime, booking.duration || 90, b.startTime, b.duration || 90)
      );

      if (overlap) {
        return res.status(400).json({
          success: false,
          message: 'Target table is already booked for that time window',
        });
      }
      booking.tableId = tableId;
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;
    if (numberOfGuests) booking.numberOfGuests = Number(numberOfGuests);

    await booking.save();

    const populated = await Booking.findById(booking._id).populate('tableId');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate and retrieve QR Code for booking
// @route   GET /api/bookings/:id/qr
// @access  Private (Customer of booking, or Staff/Admin)
const getBookingQrCode = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tableId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verification URL pointing to the verification frontend / API route
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify/${booking.qrToken}`;

    // Generate base64 Data URL
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#641E16', // Primary burgundy color
        light: '#FFFFFF',
      },
    });

    res.status(200).json({
      success: true,
      qrToken: booking.qrToken,
      verificationUrl,
      qrDataUrl,
      booking: {
        bookingId: booking.bookingId,
        customerName: booking.customerName,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        tableNumber: booking.tableId?.tableNumber,
        bookingStatus: booking.bookingStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  updateBooking,
  getBookingQrCode,
};
