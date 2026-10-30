const crypto = require('crypto');

const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BKG-${dateStr}-${randomStr}`;
};

const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
};

const generateBillId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-${dateStr}-${randomStr}`;
};

const generatePaymentId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PAY-${dateStr}-${randomStr}`;
};

const generateQrToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

module.exports = {
  generateBookingId,
  generateOrderId,
  generateBillId,
  generatePaymentId,
  generateQrToken,
};
