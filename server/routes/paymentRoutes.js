const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPayments,
  getPaymentById,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', recordPayment);
router.get('/', getPayments);
router.get('/:id', getPaymentById);

module.exports = router;
