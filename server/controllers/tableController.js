const Table = require('../models/Table');
const Booking = require('../models/Booking');
const { getUnavailableTableIds, isTimeOverlapping } = require('../utils/availability');

// @desc    Get all tables with computed status for current date/time
// @route   GET /api/tables
// @access  Public (or Staff/Admin for management)
const getTables = async (req, res, next) => {
  try {
    const { capacity, tableType, status, search } = req.query;
    const query = { isActive: true };

    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    if (tableType) {
      query.tableType = tableType;
    }

    if (search) {
      query.tableNumber = { $regex: search, $options: 'i' };
    }

    const tables = await Table.find(query).sort({ tableNumber: 1 });

    // Compute dynamic status for today / right now
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // Find active bookings today
    const todayBookings = await Booking.find({
      bookingDate: todayStr,
      bookingStatus: { $in: ['Confirmed', 'Pending'] }
    });

    const tablesWithStatus = tables.map(table => {
      const tableObj = table.toObject();
      
      // Check if table has a booking happening right now
      const currentBooking = todayBookings.find(b => {
        if (b.tableId.toString() !== table._id.toString()) return false;
        return isTimeOverlapping(currentTimeStr, 15, b.startTime, b.duration || 90);
      });

      // Check if table has a future booking today
      const upcomingBooking = todayBookings.find(b => {
        if (b.tableId.toString() !== table._id.toString()) return false;
        return b.startTime > currentTimeStr;
      });

      if (!table.isActive) {
        tableObj.computedStatus = 'Maintenance';
      } else if (currentBooking) {
        tableObj.computedStatus = 'Occupied';
        tableObj.currentBooking = currentBooking;
      } else if (upcomingBooking) {
        tableObj.computedStatus = 'Reserved';
        tableObj.upcomingBooking = upcomingBooking;
      } else {
        tableObj.computedStatus = 'Available';
      }

      return tableObj;
    });

    // If status filter is passed
    let filtered = tablesWithStatus;
    if (status) {
      filtered = tablesWithStatus.filter(t => t.computedStatus.toLowerCase() === status.toLowerCase());
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      tables: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available tables for a specific booking date, time, and guest count
// @route   GET /api/tables/available
// @access  Public
const getAvailableTables = async (req, res, next) => {
  try {
    const { date, time, guests, duration = 90 } = req.query;

    if (!date || !time || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking date, time, and number of guests',
      });
    }

    const guestCount = Number(guests);
    if (guestCount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Guests count must be at least 1',
      });
    }

    // 1. Get all active tables with capacity >= guestCount
    const suitableTables = await Table.find({
      isActive: true,
      capacity: { $gte: guestCount },
    }).sort({ capacity: 1, tableNumber: 1 });

    // 2. Find which tables are already booked at that overlapping time
    const unavailableTableIds = await getUnavailableTableIds(date, time, Number(duration));

    // 3. Mark availability
    const availableTables = suitableTables.filter(
      table => !unavailableTableIds.includes(table._id.toString())
    );

    res.status(200).json({
      success: true,
      count: availableTables.length,
      availableTables,
      allSuitableTablesCount: suitableTables.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Public
const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, table });
  } catch (error) {
    next(error);
  }
};

// @desc    Create table
// @route   POST /api/tables
// @access  Admin only
const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, tableType, isActive } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide table number and seating capacity',
      });
    }

    const existing = await Table.findOne({ tableNumber: tableNumber.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Table with this number already exists',
      });
    }

    const table = await Table.create({
      tableNumber: tableNumber.trim(),
      capacity: Number(capacity),
      tableType: tableType || 'Indoor',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Admin only
const updateTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, tableType, isActive } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    if (tableNumber) table.tableNumber = tableNumber.trim();
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (tableType) table.tableType = tableType;
    if (typeof isActive === 'boolean') table.isActive = isActive;

    await table.save();

    res.status(200).json({
      success: true,
      message: 'Table updated successfully',
      table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Admin only
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // Check if table has active future bookings
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeBooking = await Booking.findOne({
      tableId: table._id,
      bookingDate: { $gte: todayStr },
      bookingStatus: { $in: ['Pending', 'Confirmed'] },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete table with active upcoming bookings. Deactivate it instead.',
      });
    }

    await Table.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTables,
  getAvailableTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
};
