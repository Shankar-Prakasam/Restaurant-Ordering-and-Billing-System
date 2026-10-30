import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public / Customer Pages
import HomePage from './pages/customer/HomePage';
import MenuPage from './pages/customer/MenuPage';
import BookTablePage from './pages/customer/BookTablePage';
import CartPage from './pages/customer/CartPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';
import QrVerificationPage from './pages/customer/QrVerificationPage';

// Customer Protected Pages
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerBillsPage from './pages/customer/CustomerBillsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminTablesPage from './pages/admin/AdminTablesPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminBillingPage from './pages/admin/AdminBillingPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Staff Pages
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffTablesPage from './pages/staff/StaffTablesPage';
import StaffBookingsPage from './pages/staff/StaffBookingsPage';
import StaffOrdersPage from './pages/staff/StaffOrdersPage';
import StaffBillingPage from './pages/staff/StaffBillingPage';
import StaffPaymentsPage from './pages/staff/StaffPaymentsPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* 1. Public Customer Facing Website */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/book-table" element={<BookTablePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/verify/:token" element={<QrVerificationPage />} />
            </Route>

            {/* 2. Customer Dashboard & Account Portal */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/customer/bookings" replace />} />
              <Route path="bookings" element={<CustomerBookingsPage />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
              <Route path="bills" element={<CustomerBillsPage />} />
            </Route>

            {/* 3. Admin Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="menu" element={<AdminMenuPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="tables" element={<AdminTablesPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="billing" element={<AdminBillingPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            {/* 4. Staff Portal */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboardPage />} />
              <Route path="tables" element={<StaffTablesPage />} />
              <Route path="bookings" element={<StaffBookingsPage />} />
              <Route path="orders" element={<StaffOrdersPage />} />
              <Route path="billing" element={<StaffBillingPage />} />
              <Route path="payments" element={<StaffPaymentsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
