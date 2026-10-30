# Royal Spice Haveli — Restaurant Ordering & Billing System

A complete, enterprise-grade, full-stack **Restaurant Ordering and Billing System** built from scratch for the **Software Engineering and Agile Practices (SEAP)** academic project demonstration.

Developed strictly using **React.js, Node.js, Express.js, MongoDB (Atlas), Bootstrap 5, JWT, and QR Code Cryptographic Verification**.

---

## 📌 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Architecture & Features](#key-architecture--features)
   - [Customer Module](#customer-module)
   - [Table Reservation & 30-Minute Cancellation Rule](#table-reservation--30-minute-cancellation-rule)
   - [Food Ordering & Dynamic Backend Price Verification](#food-ordering--dynamic-backend-price-verification)
   - [Staff Dashboard & KOT Board](#staff-dashboard--kot-board)
   - [Admin Control & Analytics Dashboard](#admin-control--analytics-dashboard)
   - [Billing & Simulated Payment Engine](#billing--simulated-payment-engine)
   - [QR Code Cryptographic Pass System](#qr-code-cryptographic-pass-system)
3. [Technology Stack](#technology-stack)
4. [Project Folder Structure](#project-folder-structure)
5. [Database Schema (MongoDB Collections)](#database-schema-mongodb-collections)
6. [API Endpoints Catalog](#api-endpoints-catalog)
7. [Automated Backend Test Suite](#automated-backend-test-suite)
8. [Sample Credentials & Seeder](#sample-credentials--seeder)
9. [Local Installation & Setup Guide](#local-installation--setup-guide)
10. [Deployment Guide](#deployment-guide)
    - [MongoDB Atlas Setup](#mongodb-atlas-cloud-database-setup)
    - [Render Deployment (Express Backend)](#render-deployment-express-backend)
    - [Vercel Deployment (React Frontend)](#vercel-deployment-react-frontend)
11. [Git Version Control & Repository Setup](#git-version-control--repository-setup)

---

## 🌟 Project Overview

**Royal Spice Haveli** is a full-featured restaurant management application designed to handle high-frequency restaurant operations seamlessly:
- Diners can browse menu items with dietary classifications (🟢 Pure Veg / 🔴 Non-Veg), reserve tables dynamically based on real-time availability and guest capacity, optionally pre-order meals, and access instant QR code verification passes.
- Kitchen staff and floor managers can track KOT (Kitchen Order Tickets), modify quantities before billing, seat walk-in guests, update kitchen preparation stages (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Served`), generate bills, and process simulated payments (UPI, Card, Cash).
- Restaurant administrators have full visibility over operations, menu catalog management, visual table floorplans, staff account control, and automated revenue/sales/booking reports with CSV export.

---

## 🚀 Key Architecture & Features

### 👤 Customer Module
- **Public Restaurant Website**: High-converting, responsive landing page featuring restaurant branding, heritage storytelling, opening hours, customer feedback, and chef's signature dishes.
- **Dietary Filtered Menu**: Live search, category pills (Starters, Indian Cuisine, Main Course, Chinese, Desserts, Beverages), Veg/Non-Veg filter, price sorting, and instant cart integration.
- **Cart Management**: Persistent food basket across reservations and orders.
- **Customer Portal**: Dedicated dashboard for logged-in patrons to view active table reservations, download QR passes, track order status, and settle invoices online.

### 🪑 Table Reservation & 30-Minute Cancellation Rule
- **Dynamic Slot Availability**: Overlap algorithm strictly validates whether a table is free for the selected date, time slot, and duration (90 minutes standard).
- **Capacity Enforcement**: Prevents booking a table whose seating capacity is lower than the requested party size.
- **Strict 30-Minute Cancellation Rule**: Implemented on the backend:
  $$\text{Minutes Remaining} = \frac{\text{Booking Date & Time} - \text{Current Time}}{60000}$$
  A customer can only cancel if $\text{Minutes Remaining} > 30$. Cancellations attempted within 30 minutes or after the reservation start time are strictly rejected by the server API.
- **Cancelled Bookings Safety**: Cancelled reservations immediately release table availability.

### 🍛 Food Ordering & Dynamic Backend Price Verification
- **Zero Client-Side Trust**: Item prices submitted by the browser are completely ignored. The backend retrieves the current canonical price from MongoDB and calculates all item subtotals and order totals on the server.
- **Immutable Post-Billing**: Once an order has been billed, any modification or deletion is blocked by database constraints.
- **Kitchen Lifecycle**: Orders flow through explicit statuses: `Pending` → `Confirmed` → `Preparing` → `Ready` → `Served` → `Cancelled`.

### 👨‍🍳 Staff Dashboard & KOT Board
- **Live Floor Status Board**: Visual table cards color-coded by computed status:
  - 🟢 **Available**: Ready for walk-in seating.
  - 🔵 **Reserved**: Upcoming confirmed booking scheduled today.
  - 🔴 **Occupied**: Diners currently seated.
  - ⚪ **Maintenance**: Table undergoing cleaning or repair.
- **Kitchen Order Management**: Real-time ticket updates, quantity adjustments, and dish dispatching.
- **Phone / Walk-In Reservations**: Create bookings on behalf of walk-in guests directly from the staff portal.

### 👑 Admin Control & Analytics Dashboard
- **Executive KPI Cards**: Live database counts for Customers, Staff, Total Bookings, Today's Reservations, Active Orders, Total Revenue, and Real-time Available/Occupied Tables.
- **Interactive Visual Charts**: Powered by Recharts for daily sales trends, payment method share, and order status distributions.
- **Full Catalog CRUD**: Create, edit, and delete food categories, menu items, prices, dietary tags, and restaurant tables.
- **Staff Account Management**: Provision new staff accounts securely with bcrypt password hashing and role-based privilege isolation.
- **Advanced Reports**: Filterable date ranges with summary statistics and 1-click **CSV export** for Sales, Bookings, Kitchen Orders, and Popular Dishes.

### 🧾 Billing & Simulated Payment Engine
- **Accurate Mathematical Engine**:
  $$\text{Item Subtotal} = \text{Quantity} \times \text{Unit Price}$$
  $$\text{Food Subtotal} = \sum \text{Item Subtotals}$$
  $$\text{Tax Amount} = \frac{\text{Food Subtotal} \times \text{Tax Rate (5\%)}}{100}$$
  $$\text{Grand Total} = \text{Food Subtotal} + \text{Tax Amount} - \text{Discount}$$
- **Duplicate Billing Prevention**: Unique MongoDB indexing ensures each order can only ever be billed once.
- **Payment Methods**: Simulated transactions for **UPI**, **Card (Debit/Credit)**, and **Cash at Counter** with generated transaction references.
- **Duplicate Payment Protection**: Paid bills reject duplicate payment calls.

### 📱 QR Code Cryptographic Pass System
- Every confirmed reservation automatically receives a unique non-guessable cryptographic token (`qrToken`).
- **Zero Sensitive Data Exposure**: Passwords, JWT secrets, and credit card details are NEVER stored in the QR code.
- Instead, the QR code encodes a secure verification URL:
  `https://your-domain.com/verify/:token`
- Restaurant staff can scan or click the pass to open the public verification endpoint, which displays guest names, table allocations, pre-ordered dishes, and bill payment statuses while rejecting cancelled or fake tokens.

---

## 💻 Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (v19) | Functional components with Hooks (`useState`, `useEffect`, `useContext`) |
| **Styling** | Bootstrap 5 & Custom CSS | Responsive layout, dark burgundy (`#641E16`) & warm cream (`#FFF8E7`) palette |
| **Routing** | React Router DOM (v7) | Declarative client-side routing with nested layouts and protected route wrappers |
| **Icons** | Bootstrap Icons | Clean scalable vector icons |
| **HTTP Client** | Axios | Interceptors with automated JWT `Bearer` token injection |
| **Visual Charts** | Recharts | Responsive SVG charts (BarChart, PieChart) |
| **Notifications** | React Toastify | Toast alert feedback |
| **QR Code** | `qrcode.react` & `qrcode` | SVG and PNG DataURL QR code rendering |
| **Backend** | Node.js & Express.js | Modular RESTful API architecture |
| **Database** | MongoDB & Mongoose | Document database with schema validation, indexing, and aggregation pipelines |
| **Security** | JWT & bcryptjs | Token-based authentication, salted password hashing, rate limiting |
| **Testing** | Jest & Supertest | Automated API test suite covering authentication, 30-min rules, ordering, billing & QR |
| **Deployment** | Vercel, Render & MongoDB Atlas | Cloud-native hosting ready |

---

## 📁 Project Folder Structure

```
restaurant-ordering-billing-system/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── layouts/
│   │   │   ├── CustomerLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── MenuPage.jsx
│   │   │   │   ├── BookTablePage.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── AboutPage.jsx
│   │   │   │   ├── ContactPage.jsx
│   │   │   │   ├── QrVerificationPage.jsx
│   │   │   │   ├── CustomerBookingsPage.jsx
│   │   │   │   ├── CustomerOrdersPage.jsx
│   │   │   │   └── CustomerBillsPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.jsx
│   │   │   │   ├── AdminMenuPage.jsx
│   │   │   │   ├── AdminCategoriesPage.jsx
│   │   │   │   ├── AdminTablesPage.jsx
│   │   │   │   ├── AdminStaffPage.jsx
│   │   │   │   ├── AdminCustomersPage.jsx
│   │   │   │   ├── AdminBookingsPage.jsx
│   │   │   │   ├── AdminOrdersPage.jsx
│   │   │   │   ├── AdminBillingPage.jsx
│   │   │   │   ├── AdminPaymentsPage.jsx
│   │   │   │   └── AdminReportsPage.jsx
│   │   │   └── staff/
│   │   │       ├── StaffDashboardPage.jsx
│   │   │       ├── StaffTablesPage.jsx
│   │   │       ├── StaffBookingsPage.jsx
│   │   │       ├── StaffOrdersPage.jsx
│   │   │       ├── StaffBillingPage.jsx
│   │   │       └── StaffPaymentsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vercel.json
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── menuController.js
│   │   ├── tableController.js
│   │   ├── bookingController.js
│   │   ├── orderController.js
│   │   ├── billController.js
│   │   ├── paymentController.js
│   │   ├── reportController.js
│   │   └── qrController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── MenuItem.js
│   │   ├── Table.js
│   │   ├── Booking.js
│   │   ├── Order.js
│   │   ├── Bill.js
│   │   ├── Payment.js
│   │   └── Setting.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── tableRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── billRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reportRoutes.js
│   │   └── qrRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── idGenerator.js
│   │   └── availability.js
│   ├── scripts/
│   │   └── seed.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── booking.test.js
│   │   ├── order_billing.test.js
│   │   └── qr.test.js
│   ├── app.js
│   ├── index.js
│   └── package.json
│
├── render.yaml
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

---

## 🗄️ Database Schema (MongoDB Collections)

- **`users`**: `_id`, `name`, `email` (unique index), `phone`, `password` (bcrypt salted hash), `role` (`customer`, `staff`, `admin`), `isActive`, `createdAt`.
- **`categories`**: `_id`, `categoryName` (unique), `description`, `image`, `createdAt`.
- **`menuItems`**: `_id`, `name`, `description`, `categoryId` (ref Category), `price`, `image`, `isAvailable`, `isVeg`, `createdAt`.
- **`tables`**: `_id`, `tableNumber` (unique), `capacity`, `tableType` (`Indoor`, `Outdoor`, `Rooftop`, `Family Booth`, `VIP Window`), `isActive`, `createdAt`.
- **`bookings`**: `_id`, `bookingId` (unique), `customerId` (ref User), `customerName`, `customerPhone`, `customerEmail`, `tableId` (ref Table), `bookingDate`, `startTime`, `duration`, `numberOfGuests`, `specialRequests`, `bookingStatus` (`Pending`, `Confirmed`, `Completed`, `Cancelled`), `qrToken` (unique), `cancellationReason`, `createdAt`.
- **`orders`**: `_id`, `orderId` (unique), `bookingId` (ref Booking), `customerId` (ref User), `tableId` (ref Table), `items` `[{ menuItemId, itemName, quantity, unitPrice, subtotal }]`, `subtotal`, `orderStatus` (`Pending`, `Confirmed`, `Preparing`, `Ready`, `Served`, `Cancelled`), `isBilled`, `notes`, `createdAt`.
- **`bills`**: `_id`, `billId` (unique), `bookingId`, `orderId` (unique constraint prevents double billing), `customerId`, `tableNumber`, `customerName`, `items`, `subtotal`, `taxPercentage`, `taxAmount`, `discount`, `grandTotal`, `paymentStatus` (`Pending`, `Paid`, `Failed`, `Refunded`), `createdAt`.
- **`payments`**: `_id`, `paymentId` (unique), `billId` (ref Bill), `customerId`, `amount`, `paymentMethod` (`Cash`, `UPI`, `Card`), `paymentStatus` (`Paid`), `transactionReference` (unique), `createdAt`.
- **`settings`**: Key-value pairs for configurable restaurant tax rate (5%), currency (`INR`, `₹`), and restaurant brand identity.

---

## 🌐 API Endpoints Catalog

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve current authenticated user profile |

### Table Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Private | Reserve table (with optional pre-ordered dishes) |
| `GET` | `/api/bookings` | Private | Get bookings (Patrons see own; Staff/Admin see all) |
| `GET` | `/api/bookings/:id` | Private | Get detailed booking information |
| `PUT` | `/api/bookings/:id` | Staff/Admin | Modify booking details or reassign table |
| `PATCH` | `/api/bookings/:id/cancel` | Private | Cancel booking (enforces strict 30-minute rule) |
| `GET` | `/api/bookings/:id/qr` | Private | Generate DataURL QR Code pass |

### Tables (`/api/tables`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tables` | Public | Get tables with real-time computed occupancy status |
| `GET` | `/api/tables/available`| Public | Query tables free for a given date, time & guest size |
| `POST` | `/api/tables` | Admin | Create new table |
| `PUT` | `/api/tables/:id` | Admin | Edit capacity, type, or maintenance status |
| `DELETE` | `/api/tables/:id` | Admin | Delete table (blocks if upcoming bookings exist) |

### Menu & Categories (`/api/menu`, `/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/menu` | Public | List dishes with search, category, veg & price filter |
| `POST` | `/api/menu` | Admin | Create menu item |
| `PUT` | `/api/menu/:id` | Admin | Update dish details, price, or availability |
| `DELETE` | `/api/menu/:id` | Admin | Delete menu item |
| `GET` | `/api/categories` | Public | List all categories |
| `POST` | `/api/categories` | Admin | Add category |
| `PUT` | `/api/categories/:id` | Admin | Update category |
| `DELETE` | `/api/categories/:id` | Admin | Delete category |

### Kitchen Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Private | Place kitchen food order (verified backend pricing) |
| `GET` | `/api/orders` | Private | Get orders with status/table filtering |
| `PUT` | `/api/orders/:id` | Staff/Admin | Modify quantities or remove items before billing |
| `PATCH` | `/api/orders/:id/status`| Staff/Admin | Transition kitchen status (`Preparing`, `Ready`, etc.) |
| `PATCH` | `/api/orders/:id/cancel`| Private | Cancel order before billing |

### Billing & Payments (`/api/bills`, `/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bills/generate` | Staff/Admin | Generate customer invoice with tax and discount |
| `GET` | `/api/bills` | Private | List bills |
| `GET` | `/api/bills/:id` | Private | View invoice breakdown and items |
| `POST` | `/api/payments` | Private | Record simulated payment (UPI, Card, Cash) |
| `GET` | `/api/payments` | Private | View master payment transactions ledger |

### Reports & Analytics (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard`| Staff/Admin | Live counts, table occupancy & recent activity |
| `GET` | `/api/reports/sales` | Admin | Daily, monthly & payment-method revenue trends |
| `GET` | `/api/reports/popular-dishes`| Staff/Admin | Top ordered dishes and generated revenue |
| `GET` | `/api/reports/bookings` | Admin | Date-range filtered bookings statistics |
| `GET` | `/api/reports/orders` | Admin | Date-range filtered kitchen orders |

### Cryptographic QR Verification (`/api/qr`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/qr/verify/:token`| Public | Scan & verify booking token, table, and pre-orders |

---

## 🧪 Automated Backend Test Suite

The backend includes 4 dedicated test suites using **Jest** and **Supertest**, verifying all critical operational rules:

1. **`tests/auth.test.js`**: Customer registration, duplicate email rejection, bcrypt password verification, invalid password rejection, protected route authorization.
2. **`tests/booking.test.js`**: Rejection of past dates, rejection when guests exceed table capacity, successful booking creation, overlapping double-booking prevention, cancellation $> 30$ mins allowed, cancellation $\le 30$ mins rejected.
3. **`tests/order_billing.test.js`**: Kitchen order creation with backend price verification (spoofed client price rejected), updating order quantities, bill generation with tax and discount calculation, duplicate billing prevention, immutability of billed orders, payment recording, and duplicate payment prevention.
4. **`tests/qr.test.js`**: Base64 DataURL QR code generation, valid cryptographic token verification, and invalid token rejection.

### Running Backend Tests:
```powershell
cd server
npm test
```

**Results:**
```text
PASS tests/order_billing.test.js
PASS tests/booking.test.js
PASS tests/auth.test.js
PASS tests/qr.test.js

Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
```

---

## 🔑 Sample Credentials & Seeder

The system includes a pre-configured database seeder populating categories, 19 authentic dishes, 12 tables across diverse zones, sample customers, bookings, and completed transactions.

To run or reset the database seeder:
```powershell
cd server
node scripts/seed.js
```

### Pre-Configured Test Accounts:
| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@royalspice.com` | `Admin@123456` | Full system control, menu/table CRUD, staff management, revenue reports |
| **Floor Staff** | `staff@royalspice.com` | `Staff@123456` | Table board, guest bookings, kitchen order tickets (KOT), billing & payments |
| **Customer** | `rahul@example.com` | `Customer@123456` | Browse menu, book table, cart, QR passes, view personal bills |

*(Tip: The Login page features a 1-click credential auto-fill widget for quick academic demonstration).*

---

## 💻 Local Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- Local MongoDB running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/restaurant-ordering-billing-system.git
cd restaurant-ordering-billing-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/restaurant_db
JWT_SECRET=super_secret_jwt_key_restaurant_2026_seap
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@royalspice.com
ADMIN_PASSWORD=Admin@123456
DEFAULT_TAX_PERCENTAGE=5
NODE_ENV=development
```

Seed initial demonstration data:
```bash
npm run seed
```

Start the Express backend:
```bash
npm start
```
*Backend runs at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file in the `client` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🚀 Deployment Guide

### MongoDB Atlas (Cloud Database Setup)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., `royal_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** and choose `0.0.0.0/0` (Allow Access from Anywhere) so Render servers can connect.
5. In **Database** → **Connect** → **Drivers**, copy your connection string:
   ```text
   mongodb+srv://royal_admin:<password>@cluster0.abcde.mongodb.net/restaurant_db?retryWrites=true&w=majority
   ```
6. Paste this URI into your backend environment variable `MONGODB_URI`.

---

### Render Deployment (Express Backend)
1. Push your repository to **GitHub**.
2. Log in to [Render](https://render.com/).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `royal-spice-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
6. Add the following **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A long random secure string>`
   - `CLIENT_URL`: `<Your Vercel Deployed Frontend URL>` (e.g., `https://royal-spice.vercel.app`)
   - `ADMIN_EMAIL`: `admin@royalspice.com`
   - `ADMIN_PASSWORD`: `Admin@123456`
   - `DEFAULT_TAX_PERCENTAGE`: `5`
7. Click **Create Web Service**.
8. Once deployed, run the seed script remotely via the Render Shell:
   ```bash
   node scripts/seed.js
   ```

---

### Vercel Deployment (React Frontend)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `client`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `<Your Render Backend API URL>/api` (e.g., `https://royal-spice-api.onrender.com/api`)
6. Click **Deploy**.
7. The included `client/vercel.json` ensures that Single Page Application (SPA) routes like `/verify/:token`, `/admin`, and `/customer/bookings` route smoothly through `index.html`.

---

## 📦 Git Version Control & Repository Setup

To push this codebase to a new GitHub repository:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all project files
git add .

# 3. Create initial commit
git commit -m "feat: complete full-stack restaurant ordering and billing system"

# 4. Set main branch
git branch -M main

# 5. Add remote origin and push
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 👨‍💻 Academic Project Acknowledgements
Built for the **Software Engineering and Agile Practices (SEAP)** course. Engineered following Clean Architecture, RESTful API standards, and Defect-Free Testing principles.
