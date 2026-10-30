const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Booking = require('../models/Booking');
const { generateOrderId } = require('../utils/idGenerator');

// Helper to calculate order items strictly using database prices
const computeOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const itemIds = items.map(i => i.menuItemId);
  const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
  const menuMap = new Map(dbMenuItems.map(m => [m._id.toString(), m]));

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const dbItem = menuMap.get(item.menuItemId.toString());
    if (!dbItem) {
      throw new Error(`Menu item not found: ${item.menuItemId}`);
    }
    if (!dbItem.isAvailable) {
      throw new Error(`Menu item "${dbItem.name}" is currently unavailable`);
    }

    const qty = Number(item.quantity) || 1;
    if (qty <= 0) {
      throw new Error(`Invalid quantity for item "${dbItem.name}"`);
    }

    const itemSubtotal = dbItem.price * qty;
    subtotal += itemSubtotal;

    verifiedItems.push({
      menuItemId: dbItem._id,
      itemName: dbItem.name,
      quantity: qty,
      unitPrice: dbItem.price,
      subtotal: itemSubtotal,
    });
  }

  return { verifiedItems, subtotal };
};

// @desc    Create new food order
// @route   POST /api/orders
// @access  Customer / Staff / Admin
const createOrder = async (req, res, next) => {
  try {
    const { bookingId, tableId, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one item to order' });
    }

    let finalTableId = tableId;
    let customerId = req.user._id;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Associated booking not found' });
      }
      finalTableId = booking.tableId;
      if (req.user.role === 'customer') {
        customerId = booking.customerId;
      }
    }

    if (!finalTableId) {
      return res.status(400).json({ success: false, message: 'Please specify a table for this order' });
    }

    const { verifiedItems, subtotal } = await computeOrderItems(items);

    const order = await Order.create({
      orderId: generateOrderId(),
      bookingId: bookingId || null,
      customerId,
      tableId: finalTableId,
      items: verifiedItems,
      subtotal,
      orderStatus: 'Pending',
      isBilled: false,
      notes: notes || '',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('tableId', 'tableNumber')
      .populate('bookingId', 'bookingId customerName bookingDate startTime');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const { status, bookingId, isBilled, search } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (bookingId) {
      query.bookingId = bookingId;
    }

    if (isBilled !== undefined) {
      query.isBilled = isBilled === 'true';
    }

    if (search) {
      query.orderId = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .populate('tableId', 'tableNumber capacity tableType')
      .populate('bookingId', 'bookingId customerName bookingDate startTime')
      .populate('customerId', 'name email phone')
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

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('tableId', 'tableNumber capacity tableType')
      .populate('bookingId', 'bookingId customerName bookingDate startTime')
      .populate('customerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order items / quantity (Strictly prohibited after billing!)
// @route   PUT /api/orders/:id
// @access  Staff / Admin / Customer (before billing)
const updateOrder = async (req, res, next) => {
  try {
    const { items, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Prohibit modification if order has been billed!
    if (order.isBilled) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been billed and cannot be modified.',
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cancelled order cannot be modified.',
      });
    }

    if (items && items.length > 0) {
      const { verifiedItems, subtotal } = await computeOrderItems(items);
      order.items = verifiedItems;
      order.subtotal = subtotal;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('tableId', 'tableNumber')
      .populate('bookingId', 'bookingId customerName');

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Staff / Admin)
// @route   PATCH /api/orders/:id/status
// @access  Staff / Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Served', 'Cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isBilled && orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an order that has already been billed.',
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (before billing)
// @route   PATCH /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.isBilled) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an order that has already been billed.',
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
};
