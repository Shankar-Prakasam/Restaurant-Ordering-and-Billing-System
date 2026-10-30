const express = require('express');
const router = express.Router();
const {
  generateBill,
  getBills,
  getBillById,
} = require('../controllers/billController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/generate', authorize('staff', 'admin'), generateBill);
router.get('/', getBills);
router.get('/:id', getBillById);

module.exports = router;
