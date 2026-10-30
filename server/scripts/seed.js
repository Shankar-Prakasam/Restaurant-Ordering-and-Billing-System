require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const { generateBookingId, generateOrderId, generateBillId, generatePaymentId, generateQrToken } = require('../utils/idGenerator');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      MenuItem.deleteMany(),
      Table.deleteMany(),
      Booking.deleteMany(),
      Order.deleteMany(),
      Bill.deleteMany(),
      Payment.deleteMany(),
      Setting.deleteMany(),
    ]);

    console.log('Seeding default settings...');
    await Setting.create([
      { key: 'taxPercentage', value: 5, description: 'Default GST / Restaurant Tax Percentage' },
      { key: 'restaurantName', value: 'Royal Spice Haveli', description: 'Restaurant Brand Name' },
      { key: 'currency', value: 'INR', description: 'Currency Code' },
      { key: 'currencySymbol', value: '₹', description: 'Currency Symbol' },
    ]);

    console.log('Seeding users (Admin, Staff, Customers)...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'Super Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@royalspice.com').toLowerCase(),
      phone: '+91 98765 43210',
      password: adminPassword,
      role: 'admin',
    });

    const staffUser1 = await User.create({
      name: 'Vikram Singh (Head Steward)',
      email: 'staff@royalspice.com',
      phone: '+91 98765 43211',
      password: 'Staff@123456',
      role: 'staff',
    });

    const staffUser2 = await User.create({
      name: 'Anjali Sharma (Floor Manager)',
      email: 'anjali.staff@royalspice.com',
      phone: '+91 98765 43212',
      password: 'Staff@123456',
      role: 'staff',
    });

    const customer1 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      phone: '+91 98111 22233',
      password: 'Customer@123456',
      role: 'customer',
    });

    const customer2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 98222 33344',
      password: 'Customer@123456',
      role: 'customer',
    });

    console.log('Seeding categories...');
    const categoriesData = [
      {
        categoryName: 'Starters',
        description: 'Crisp appetizers and savory street delicacies to begin your royal feast.',
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
      },
      {
        categoryName: 'Indian Cuisine',
        description: 'Traditional North and South Indian curries, aromatic gravies, and tandoori classics.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
      },
      {
        categoryName: 'Main Course',
        description: 'Freshly baked tandoori naans, fragrant basmati biryanis, and hearty platters.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      },
      {
        categoryName: 'Chinese',
        description: 'Indo-Chinese sizzling wok noodles, Manchurian bowls, and spicy gravies.',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
      },
      {
        categoryName: 'Desserts',
        description: 'Rich artisanal sweets, warm gulab jamun, and saffron kulfi.',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      },
      {
        categoryName: 'Beverages',
        description: 'Chilled Punjabi lassi, fresh mocktails, and aromatic spiced masala chai.',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.categoryName] = c._id; });

    console.log('Seeding menu items...');
    const menuItemsData = [
      // Starters
      {
        name: 'Paneer Tikka Angaare',
        description: 'Cottage cheese cubes marinated in spiced yogurt and grilled in traditional clay oven.',
        categoryId: catMap['Starters'],
        price: 240,
        image: 'https://images.unsplash.com/photo-1567184109411-b28f2703e1e2?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Crispy Corn & Water Chestnut',
        description: 'Golden fried sweet corn tossed with spring onions, pepper, and garlic butter.',
        categoryId: catMap['Starters'],
        price: 190,
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Dahi Ke Kebab',
        description: 'Melt-in-mouth hung curd kebabs seasoned with green cardamom and coriander.',
        categoryId: catMap['Starters'],
        price: 220,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Amritsari Fish Fingers',
        description: 'Crispy batter-fried river sole fish seasoned with ajwain and mint chutney.',
        categoryId: catMap['Starters'],
        price: 320,
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: false,
      },

      // Indian Cuisine
      {
        name: 'Paneer Butter Masala',
        description: 'Succulent paneer batons simmered in a creamy, velvety tomato and cashew nut gravy.',
        categoryId: catMap['Indian Cuisine'],
        price: 280,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Dal Makhani Bukhara',
        description: 'Slow-cooked whole black lentils infused overnight with cream, butter, and mild spices.',
        categoryId: catMap['Indian Cuisine'],
        price: 240,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Murgh Makhani (Butter Chicken)',
        description: 'Tender tandoori chicken simmered in rich satin smooth tomato gravy with fenugreek.',
        categoryId: catMap['Indian Cuisine'],
        price: 360,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: false,
      },
      {
        name: 'Kadhai Paneer',
        description: 'Cottage cheese, bell peppers, and crushed coriander seeds cooked in spicy onion gravy.',
        categoryId: catMap['Indian Cuisine'],
        price: 270,
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },

      // Main Course (Breads & Rice)
      {
        name: 'Hyderabadi Dum Biryani',
        description: 'Long grain basmati rice cooked on dum with aromatic spices, saffron, and fresh herbs.',
        categoryId: catMap['Main Course'],
        price: 310,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Garlic Butter Naan',
        description: 'Tandoor-baked leavened bread brushed generously with garlic butter and fresh cilantro.',
        categoryId: catMap['Main Course'],
        price: 60,
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Lachha Paratha',
        description: 'Crisp, multi-layered whole wheat tandoori flatbread topped with desi ghee.',
        categoryId: catMap['Main Course'],
        price: 50,
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },

      // Chinese
      {
        name: 'Veg Hakka Noodles',
        description: 'Wok-tossed noodles with shredded cabbage, capsicum, carrots, and light soya garlic sauce.',
        categoryId: catMap['Chinese'],
        price: 210,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Chilli Paneer Dry',
        description: 'Crisp paneer cubes tossed in zesty schezwan sauce with scallions and green chillies.',
        categoryId: catMap['Chinese'],
        price: 250,
        image: 'https://images.unsplash.com/photo-1567184109411-b28f2703e1e2?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Vegetable Manchurian Gravy',
        description: 'Crisp vegetable dumplings simmered in savory garlic coriander gravy.',
        categoryId: catMap['Chinese'],
        price: 230,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },

      // Desserts
      {
        name: 'Shahi Gulab Jamun (2 Pcs)',
        description: 'Warm, golden khoya dumplings soaked in rose and saffron infused cardamom sugar syrup.',
        categoryId: catMap['Desserts'],
        price: 110,
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Royal Saffron Rasmalai',
        description: 'Soft cottage cheese patties steeped in thick saffron milk garnished with pistachios.',
        categoryId: catMap['Desserts'],
        price: 140,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },

      // Beverages
      {
        name: 'Special Amritsari Sweet Lassi',
        description: 'Thick, creamy churned sweet yogurt topped with malai, cardamom, and roasted almonds.',
        categoryId: catMap['Beverages'],
        price: 90,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Fresh Mint Lime Soda',
        description: 'Sparkling soda mixed with freshly squeezed lime juice, crushed mint, and rock salt.',
        categoryId: catMap['Beverages'],
        price: 75,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Masala Spiced Kulhad Chai',
        description: 'Brewed Assam tea leaves simmered with fresh ginger, lemongrass, and green cardamom.',
        categoryId: catMap['Beverages'],
        price: 60,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
    ];

    const createdMenuItems = await MenuItem.insertMany(menuItemsData);
    console.log(`Seeded ${createdMenuItems.length} menu items.`);

    console.log('Seeding tables (12 tables with varied capacity and types)...');
    const tablesData = [
      { tableNumber: 'T-01', capacity: 2, tableType: 'Indoor' },
      { tableNumber: 'T-02', capacity: 2, tableType: 'Indoor' },
      { tableNumber: 'T-03', capacity: 4, tableType: 'Indoor' },
      { tableNumber: 'T-04', capacity: 4, tableType: 'Indoor' },
      { tableNumber: 'T-05', capacity: 4, tableType: 'Family Booth' },
      { tableNumber: 'T-06', capacity: 6, tableType: 'Family Booth' },
      { tableNumber: 'T-07', capacity: 6, tableType: 'Outdoor' },
      { tableNumber: 'T-08', capacity: 8, tableType: 'Family Booth' },
      { tableNumber: 'T-09', capacity: 4, tableType: 'Rooftop' },
      { tableNumber: 'T-10', capacity: 6, tableType: 'Rooftop' },
      { tableNumber: 'T-11', capacity: 2, tableType: 'VIP Window' },
      { tableNumber: 'T-12', capacity: 4, tableType: 'VIP Window' },
    ];

    const createdTables = await Table.insertMany(tablesData);
    console.log(`Seeded ${createdTables.length} tables.`);

    console.log('Seeding sample bookings, orders, bills, and payments...');
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    // 1. Completed Booking with Order, Bill, and Payment (for analytics history)
    const booking1 = await Booking.create({
      bookingId: generateBookingId(),
      customerId: customer1._id,
      customerName: customer1.name,
      customerPhone: customer1.phone,
      customerEmail: customer1.email,
      tableId: createdTables[2]._id, // T-03 (Cap 4)
      bookingDate: todayStr,
      startTime: '13:00',
      duration: 90,
      numberOfGuests: 3,
      specialRequests: 'Anniversary celebration. Window view preferred.',
      bookingStatus: 'Completed',
      qrToken: generateQrToken(),
    });

    const paneer = createdMenuItems.find(i => i.name === 'Paneer Butter Masala');
    const naan = createdMenuItems.find(i => i.name === 'Garlic Butter Naan');
    const lassi = createdMenuItems.find(i => i.name === 'Special Amritsari Sweet Lassi');

    const orderItems1 = [
      { menuItemId: paneer._id, itemName: paneer.name, quantity: 2, unitPrice: paneer.price, subtotal: paneer.price * 2 },
      { menuItemId: naan._id, itemName: naan.name, quantity: 4, unitPrice: naan.price, subtotal: naan.price * 4 },
      { menuItemId: lassi._id, itemName: lassi.name, quantity: 3, unitPrice: lassi.price, subtotal: lassi.price * 3 },
    ];
    const subtotal1 = orderItems1.reduce((sum, item) => sum + item.subtotal, 0);

    const order1 = await Order.create({
      orderId: generateOrderId(),
      bookingId: booking1._id,
      customerId: customer1._id,
      tableId: createdTables[2]._id,
      items: orderItems1,
      subtotal: subtotal1,
      orderStatus: 'Served',
      isBilled: true,
      notes: 'Please make paneer medium spicy',
    });

    const taxAmount1 = Number(((subtotal1 * 5) / 100).toFixed(2));
    const grandTotal1 = subtotal1 + taxAmount1;

    const bill1 = await Bill.create({
      billId: generateBillId(),
      bookingId: booking1._id,
      orderId: order1._id,
      customerId: customer1._id,
      tableNumber: createdTables[2].tableNumber,
      customerName: customer1.name,
      items: orderItems1,
      subtotal: subtotal1,
      taxPercentage: 5,
      taxAmount: taxAmount1,
      discount: 0,
      grandTotal: grandTotal1,
      paymentStatus: 'Paid',
    });

    await Payment.create({
      paymentId: generatePaymentId(),
      billId: bill1._id,
      customerId: customer1._id,
      amount: grandTotal1,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      transactionReference: 'TXN-UPI-992381283',
    });

    // 2. Upcoming Confirmed Booking for tomorrow
    const booking2 = await Booking.create({
      bookingId: generateBookingId(),
      customerId: customer2._id,
      customerName: customer2.name,
      customerPhone: customer2.phone,
      customerEmail: customer2.email,
      tableId: createdTables[5]._id, // T-06 (Cap 6)
      bookingDate: tomorrowStr,
      startTime: '19:30',
      duration: 120,
      numberOfGuests: 5,
      specialRequests: 'High chair needed for child',
      bookingStatus: 'Confirmed',
      qrToken: generateQrToken(),
    });

    // 3. Active order currently in kitchen for T-01
    const biryani = createdMenuItems.find(i => i.name === 'Hyderabadi Dum Biryani');
    const gulab = createdMenuItems.find(i => i.name === 'Shahi Gulab Jamun (2 Pcs)');

    const orderItems2 = [
      { menuItemId: biryani._id, itemName: biryani.name, quantity: 2, unitPrice: biryani.price, subtotal: biryani.price * 2 },
      { menuItemId: gulab._id, itemName: gulab.name, quantity: 2, unitPrice: gulab.price, subtotal: gulab.price * 2 },
    ];
    const subtotal2 = orderItems2.reduce((sum, item) => sum + item.subtotal, 0);

    await Order.create({
      orderId: generateOrderId(),
      customerId: customer2._id,
      tableId: createdTables[0]._id, // T-01
      items: orderItems2,
      subtotal: subtotal2,
      orderStatus: 'Preparing',
      isBilled: false,
      notes: 'Extra raita with biryani please',
    });

    console.log('Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Test Credentials:');
    console.log(`Admin User:    ${adminUser.email} / ${adminPassword}`);
    console.log(`Staff User:    staff@royalspice.com / Staff@123456`);
    console.log(`Customer User: rahul@example.com / Customer@123456`);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
