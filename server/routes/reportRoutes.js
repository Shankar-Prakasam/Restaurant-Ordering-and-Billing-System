const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getSalesReport,
  getPopularDishes,
  getBookingsReport,
  getOrdersReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', authorize('staff', 'admin'), getDashboardSummary);
router.get('/sales', authorize('admin'), getSalesReport);
router.get('/popular-dishes', authorize('staff', 'admin'), getPopularDishes);
router.get('/bookings', authorize('admin'), getBookingsReport);
router.get('/orders', authorize('admin'), getOrdersReport);

module.exports = router;
