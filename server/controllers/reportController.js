const User = require('../models/User');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Table = require('../models/Table');
const { isTimeOverlapping } = require('../utils/availability');

// @desc    Get live dashboard analytics & summary counts
// @route   GET /api/reports/dashboard
// @access  Admin / Staff
const getDashboardSummary = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    // Parallel aggregate queries
    const [
      totalCustomers,
      totalStaff,
      totalBookings,
      todayBookings,
      totalOrders,
      billsTotal,
      tables,
      recentBookings,
      recentOrders,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: { $in: ['staff', 'admin'] } }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingDate: todayStr }),
      Order.countDocuments(),
      Bill.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
      ]),
      Table.find({ isActive: true }),
      Booking.find().populate('tableId', 'tableNumber').sort({ createdAt: -1 }).limit(5),
      Order.find().populate('tableId', 'tableNumber').sort({ createdAt: -1 }).limit(5),
      Payment.find().populate('billId').sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = billsTotal.length > 0 ? Number(billsTotal[0].totalRevenue.toFixed(2)) : 0;

    // Calculate occupied vs available tables currently
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    const activeTodayBookings = await Booking.find({
      bookingDate: todayStr,
      bookingStatus: { $in: ['Confirmed', 'Pending'] },
    });

    let occupiedTablesCount = 0;
    tables.forEach(table => {
      const isOccupied = activeTodayBookings.some(b =>
        b.tableId.toString() === table._id.toString() &&
        isTimeOverlapping(currentTimeStr, 15, b.startTime, b.duration || 90)
      );
      if (isOccupied) occupiedTablesCount++;
    });

    const availableTablesCount = Math.max(0, tables.length - occupiedTablesCount);

    // Order status breakdown for charts
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Booking status breakdown
    const bookingStatusCounts = await Booking.aggregate([
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          totalStaff,
          totalBookings,
          todayBookings,
          totalOrders,
          totalRevenue,
          totalTables: tables.length,
          availableTables: availableTablesCount,
          occupiedTables: occupiedTablesCount,
        },
        orderStatusCounts: orderStatusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        bookingStatusCounts: bookingStatusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentBookings,
        recentOrders,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sales and Revenue Report (Daily, Weekly, Monthly & By Payment Method)
// @route   GET /api/reports/sales
// @access  Admin
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { paymentStatus: 'Paid' };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Revenue by Payment Method
    const revenueByMethod = await Payment.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Daily Sales (Last 14 days or filtered)
    const dailySales = await Bill.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$grandTotal' },
          subtotal: { $sum: '$subtotal' },
          taxAmount: { $sum: '$taxAmount' },
          discountAmount: { $sum: '$discount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly Sales
    const monthlySales = await Bill.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalRevenue: { $sum: '$grandTotal' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalSalesAmount = dailySales.reduce((sum, item) => sum + item.totalRevenue, 0);

    res.status(200).json({
      success: true,
      data: {
        totalSalesAmount: Number(totalSalesAmount.toFixed(2)),
        revenueByMethod,
        dailySales,
        monthlySales,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Popular Food Items Report
// @route   GET /api/reports/popular-dishes
// @access  Admin / Staff
const getPopularDishes = async (req, res, next) => {
  try {
    const popularItems = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          itemName: { $first: '$items.itemName' },
          totalOrderedQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { totalOrderedQty: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      count: popularItems.length,
      popularItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bookings Report with date filtering
// @route   GET /api/reports/bookings
// @access  Admin
const getBookingsReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.bookingDate = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('tableId', 'tableNumber capacity tableType')
      .sort({ bookingDate: -1, startTime: -1 });

    const statusCounts = bookings.reduce((acc, curr) => {
      acc[curr.bookingStatus] = (acc[curr.bookingStatus] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: bookings.length,
      statusCounts,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Orders Report
// @route   GET /api/reports/orders
// @access  Admin
const getOrdersReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const orders = await Order.find(query)
      .populate('tableId', 'tableNumber')
      .populate('bookingId', 'bookingId customerName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getSalesReport,
  getPopularDishes,
  getBookingsReport,
  getOrdersReport,
};
