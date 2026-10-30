const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  updateBooking,
  getBookingQrCode,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBookingById)
  .put(authorize('staff', 'admin'), updateBooking);

router.patch('/:id/cancel', cancelBooking);
router.get('/:id/qr', getBookingQrCode);

module.exports = router;
