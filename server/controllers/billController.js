const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Setting = require('../models/Setting');
const { generateBillId } = require('../utils/idGenerator');

// @desc    Generate customer bill
// @route   POST /api/bills/generate
// @access  Staff / Admin
const generateBill = async (req, res, next) => {
  try {
    const { orderId, discount = 0, taxPercentage } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Please provide orderId to bill' });
    }

    const order = await Order.findById(orderId).populate('tableId').populate('bookingId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isBilled) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been billed. Duplicate billing prevented.',
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate a bill for a cancelled order.',
      });
    }

    // Check if bill already exists for this order
    const existingBill = await Bill.findOne({ orderId: order._id });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'A bill already exists for this order.',
      });
    }

    // Determine tax percentage: parameter -> Setting DB -> default 5%
    let finalTaxPct = Number(taxPercentage);
    if (isNaN(finalTaxPct) || finalTaxPct < 0) {
      const taxSetting = await Setting.findOne({ key: 'taxPercentage' });
      finalTaxPct = taxSetting ? Number(taxSetting.value) : (Number(process.env.DEFAULT_TAX_PERCENTAGE) || 5);
    }

    const subtotal = order.subtotal;
    const taxAmount = Number(((subtotal * finalTaxPct) / 100).toFixed(2));
    const discountAmount = Math.max(0, Number(discount) || 0);
    const grandTotal = Math.max(0, Number((subtotal + taxAmount - discountAmount).toFixed(2)));

    // Customer name & table number
    let customerName = 'Walk-in Guest';
    let customerId = order.customerId;
    let tableNumber = order.tableId ? order.tableId.tableNumber : 'Table';

    if (order.bookingId) {
      customerName = order.bookingId.customerName;
      customerId = order.bookingId.customerId;
    }

    const bill = await Bill.create({
      billId: generateBillId(),
      bookingId: order.bookingId ? order.bookingId._id : null,
      orderId: order._id,
      customerId,
      tableNumber,
      customerName,
      items: order.items,
      subtotal,
      taxPercentage: finalTaxPct,
      taxAmount,
      discount: discountAmount,
      grandTotal,
      paymentStatus: 'Pending',
    });

    // Mark order as billed so it cannot be altered
    order.isBilled = true;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res, next) => {
  try {
    const { paymentStatus, search, bookingId } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (bookingId) {
      query.bookingId = bookingId;
    }

    if (search) {
      query.$or = [
        { billId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { tableNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const bills = await Bill.find(query)
      .populate('orderId')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('orderId')
      .populate('bookingId')
      .populate('customerId', 'name email phone');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.user.role === 'customer' && bill.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this bill' });
    }

    // Fetch payment if already made
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ billId: bill._id });

    res.status(200).json({
      success: true,
      bill,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateBill,
  getBills,
  getBillById,
};
