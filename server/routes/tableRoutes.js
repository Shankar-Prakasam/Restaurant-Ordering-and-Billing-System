const express = require('express');
const router = express.Router();
const {
  getTables,
  getAvailableTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/available', getAvailableTables);

router.route('/')
  .get(getTables)
  .post(protect, authorize('admin'), createTable);

router.route('/:id')
  .get(getTableById)
  .put(protect, authorize('admin'), updateTable)
  .delete(protect, authorize('admin'), deleteTable);

module.exports = router;
