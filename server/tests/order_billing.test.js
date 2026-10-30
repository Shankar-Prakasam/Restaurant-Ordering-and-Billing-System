const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');

let staffToken;
let customerToken;
let testTable;
let menuItem1;
let menuItem2;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // Login staff
  const staffRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'staff@royalspice.com', password: 'Staff@123456' });
  staffToken = staffRes.body.token;

  // Login customer
  const custRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rahul@example.com', password: 'Customer@123456' });
  customerToken = custRes.body.token;

  testTable = await Table.findOne({ tableNumber: 'T-04' });
  const items = await MenuItem.find({ isAvailable: true }).limit(2);
  menuItem1 = items[0];
  menuItem2 = items[1];
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Ordering, Billing and Payment API Tests', () => {
  let createdOrderId;
  let createdBillId;

  it('should create a food order and compute totals using backend DB prices (preventing price tampering)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        tableId: testTable._id,
        items: [
          // Attempting to spoof unitPrice to ₹1
          { menuItemId: menuItem1._id, quantity: 2, unitPrice: 1 },
          { menuItemId: menuItem2._id, quantity: 1, unitPrice: 1 },
        ],
        notes: 'Less spicy',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const expectedSubtotal = (menuItem1.price * 2) + (menuItem2.price * 1);
    expect(res.body.order.subtotal).toBe(expectedSubtotal);
    expect(res.body.order.items[0].unitPrice).toBe(menuItem1.price);
    createdOrderId = res.body.order._id;
  });

  it('should allow updating order items before billing', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        items: [
          { menuItemId: menuItem1._id, quantity: 3 },
        ],
      });

    expect(res.statusCode).toBe(200);
    const expectedSubtotal = menuItem1.price * 3;
    expect(res.body.order.subtotal).toBe(expectedSubtotal);
  });

  it('should generate a bill with correct tax and grand total', async () => {
    const res = await request(app)
      .post('/api/bills/generate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        orderId: createdOrderId,
        discount: 20,
        taxPercentage: 5,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const expectedSubtotal = menuItem1.price * 3;
    const expectedTax = Number(((expectedSubtotal * 5) / 100).toFixed(2));
    const expectedGrandTotal = Number((expectedSubtotal + expectedTax - 20).toFixed(2));

    expect(res.body.bill.subtotal).toBe(expectedSubtotal);
    expect(res.body.bill.taxAmount).toBe(expectedTax);
    expect(res.body.bill.discount).toBe(20);
    expect(res.body.bill.grandTotal).toBe(expectedGrandTotal);
    expect(res.body.bill.paymentStatus).toBe('Pending');

    createdBillId = res.body.bill._id;
  });

  it('should prevent duplicate billing for the same order', async () => {
    const res = await request(app)
      .post('/api/bills/generate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ orderId: createdOrderId });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already been billed/i);
  });

  it('should reject order modification after the order is billed', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        items: [{ menuItemId: menuItem1._id, quantity: 5 }],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already been billed/i);
  });

  it('should record payment and update bill status to Paid', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        billId: createdBillId,
        paymentMethod: 'Card',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.payment.paymentStatus).toBe('Paid');
    expect(res.body.bill.paymentStatus).toBe('Paid');
  });

  it('should prevent duplicate payment for an already paid bill', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        billId: createdBillId,
        paymentMethod: 'UPI',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already been paid/i);
  });
});
