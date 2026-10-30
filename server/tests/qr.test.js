const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Booking = require('../models/Booking');

let customerToken;
let validBooking;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  const custRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rahul@example.com', password: 'Customer@123456' });
  customerToken = custRes.body.token;

  validBooking = await Booking.findOne({ bookingStatus: { $ne: 'Cancelled' } });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('QR Code Generation and Verification Tests', () => {
  it('should generate QR code DataURL for a booking', async () => {
    const res = await request(app)
      .get(`/api/bookings/${validBooking._id}/qr`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(res.body.qrToken).toBe(validBooking.qrToken);
  });

  it('should verify a valid QR token without requiring authentication', async () => {
    const res = await request(app)
      .get(`/api/qr/verify/${validBooking.qrToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body.data.booking.bookingId).toBe(validBooking.bookingId);
  });

  it('should reject verification for a fake or non-existent token', async () => {
    const res = await request(app)
      .get('/api/qr/verify/fake_token_123456789');

    expect(res.statusCode).toBe(404);
    expect(res.body.verified).toBe(false);
  });
});
