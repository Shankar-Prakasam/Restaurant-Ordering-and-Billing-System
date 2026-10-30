const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Table = require('../models/Table');
const Booking = require('../models/Booking');

let customerToken;
let customerUser;
let testTable;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // Login as existing seed customer
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'rahul@example.com',
      password: 'Customer@123456',
    });

  customerToken = loginRes.body.token;
  customerUser = loginRes.body.user;

  // Find a table with capacity 4
  testTable = await Table.findOne({ capacity: 4, isActive: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Booking API & Rules Tests', () => {
  const futureDate = '2026-12-15';
  let createdBookingId;

  it('should reject booking for past date', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        tableId: testTable._id,
        bookingDate: '2020-01-01',
        startTime: '19:00',
        numberOfGuests: 2,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/past date/i);
  });

  it('should reject booking if guests exceed table capacity', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        tableId: testTable._id,
        bookingDate: futureDate,
        startTime: '19:00',
        numberOfGuests: testTable.capacity + 3,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/seats/i);
  });

  it('should create a valid booking successfully', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        tableId: testTable._id,
        bookingDate: futureDate,
        startTime: '19:00',
        duration: 90,
        numberOfGuests: 2,
        specialRequests: 'Candlelight dinner please',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingId).toBeDefined();
    expect(res.body.booking.qrToken).toBeDefined();
    createdBookingId = res.body.booking._id;
  });

  it('should prevent double booking for overlapping time on same table', async () => {
    // Attempt to book the same table at overlapping time: 19:30 (existing booking is 19:00 to 20:30)
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        tableId: testTable._id,
        bookingDate: futureDate,
        startTime: '19:30',
        duration: 90,
        numberOfGuests: 2,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already booked/i);
  });

  it('should allow customer to cancel booking when start time is more than 30 minutes away', async () => {
    // futureDate is far in the future
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        cancellationReason: 'Change of plans',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toBe('Cancelled');
  });

  it('should reject customer cancellation if booking is within 30 minutes or already past', async () => {
    // Create a booking for today with start time 10 minutes ago
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startHour = String(Math.max(0, now.getHours())).padStart(2, '0');
    const startMin = String(Math.max(0, now.getMinutes() - 10)).padStart(2, '0');

    const pastBooking = await Booking.create({
      bookingId: `BKG-TEST-${Date.now()}`,
      customerId: customerUser._id,
      customerName: customerUser.name,
      customerPhone: customerUser.phone,
      customerEmail: customerUser.email,
      tableId: testTable._id,
      bookingDate: todayStr,
      startTime: `${startHour}:${startMin}`,
      duration: 90,
      numberOfGuests: 2,
      bookingStatus: 'Confirmed',
      qrToken: `test_token_${Date.now()}`,
    });

    const res = await request(app)
      .patch(`/api/bookings/${pastBooking._id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ cancellationReason: 'Late cancel' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/more than 30 minutes/i);

    // Clean up test booking
    await Booking.findByIdAndDelete(pastBooking._id);
  });
});
