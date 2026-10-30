const express = require('express');
const router = express.Router();
const { verifyQrToken } = require('../controllers/qrController');

// Public route used to verify QR tokens
router.get('/verify/:token', verifyQrToken);

module.exports = router;
