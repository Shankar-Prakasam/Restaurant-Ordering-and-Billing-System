import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const role = user?.role || 'customer';

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Header */}
      <header className="navbar navbar-dark sticky-top px-3 py-2 shadow-sm d-flex justify-content-between" style={{ backgroundColor: 'var(--primary-color)' }}>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-light d-lg-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          <Link to="/" className="navbar-brand brand-font d-flex align-items-center gap-2 mb-0 fs-5 text-white">
            <span>🍛</span>
            <span className="fw-bold">Royal Spice Haveli</span>
            <span className="badge bg-warning text-dark text-uppercase ms-2" style={{ fontSize: '0.7rem' }}>
              {role} portal
            </span>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="btn btn-sm btn-outline-light rounded-pill px-3 d-none d-md-inline-block">
            <i className="bi bi-house-door me-1"></i> Visit Website
          </Link>
          <div className="text-white text-end d-none d-sm-block">
            <div className="fw-semibold lh-1">{user?.name}</div>
            <small style={{ color: 'var(--accent-color)', fontSize: '0.75rem' }}>{user?.email}</small>
          </div>
          <button onClick={handleLogout} className="btn btn-sm btn-danger rounded-pill px-3">
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <aside
          className={`dashboard-sidebar p-3 shadow-sm ${sidebarOpen ? 'd-block' : 'd-none d-lg-block'}`}
          style={{
            position: sidebarOpen ? 'fixed' : 'relative',
            zIndex: 1040,
            top: sidebarOpen ? '56px' : '0',
            left: 0,
            bottom: 0,
            overflowY: 'auto',
          }}
        >
          <div className="d-flex flex-column gap-1">
            {role === 'admin' && (
              <>
                <small className="text-uppercase fw-bold text-muted px-3 mt-2 mb-1" style={{ fontSize: '0.7rem' }}>
                  Overview
                </small>
                <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-speedometer2"></i> Dashboard
                </NavLink>

                <small className="text-uppercase fw-bold text-muted px-3 mt-3 mb-1" style={{ fontSize: '0.7rem' }}>
                  Operations
                </small>
                <NavLink to="/admin/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-calendar-check"></i> Bookings
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-basket3"></i> Orders
                </NavLink>
                <NavLink to="/admin/tables" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-grid-3x3-gap"></i> Table Management
                </NavLink>
                <NavLink to="/admin/billing" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-receipt"></i> Billing
                </NavLink>
                <NavLink to="/admin/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-credit-card"></i> Payments
                </NavLink>

                <small className="text-uppercase fw-bold text-muted px-3 mt-3 mb-1" style={{ fontSize: '0.7rem' }}>
                  Catalog & Users
                </small>
                <NavLink to="/admin/menu" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-menu-button-wide"></i> Menu Management
                </NavLink>
                <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-tags"></i> Categories
                </NavLink>
                <NavLink to="/admin/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-person-badge"></i> Staff Accounts
                </NavLink>
                <NavLink to="/admin/customers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-people"></i> Customers
                </NavLink>

                <small className="text-uppercase fw-bold text-muted px-3 mt-3 mb-1" style={{ fontSize: '0.7rem' }}>
                  Analytics & Reports
                </small>
                <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-bar-chart-line"></i> Advanced Reports
                </NavLink>
              </>
            )}

            {role === 'staff' && (
              <>
                <small className="text-uppercase fw-bold text-muted px-3 mt-2 mb-1" style={{ fontSize: '0.7rem' }}>
                  Staff Management
                </small>
                <NavLink to="/staff" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-speedometer2"></i> Staff Dashboard
                </NavLink>
                <NavLink to="/staff/tables" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-grid-3x3-gap"></i> Table Status Board
                </NavLink>
                <NavLink to="/staff/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-calendar-check"></i> Manage Bookings
                </NavLink>
                <NavLink to="/staff/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-fire"></i> Kitchen Orders
                </NavLink>
                <NavLink to="/staff/billing" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-receipt"></i> Generate Bills
                </NavLink>
                <NavLink to="/staff/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-wallet2"></i> Record Payments
                </NavLink>
              </>
            )}

            {role === 'customer' && (
              <>
                <small className="text-uppercase fw-bold text-muted px-3 mt-2 mb-1" style={{ fontSize: '0.7rem' }}>
                  My Account
                </small>
                <NavLink to="/customer/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-calendar-check"></i> My Reservations & QR
                </NavLink>
                <NavLink to="/customer/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-bag-check"></i> My Orders
                </NavLink>
                <NavLink to="/customer/bills" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-receipt"></i> Bills & Invoices
                </NavLink>
                <div className="mt-4 px-3">
                  <Link to="/book-table" className="btn btn-primary-custom w-100 btn-sm">
                    <i className="bi bi-plus-circle me-1"></i> New Booking
                  </Link>
                </div>
              </>
            )}

            <div className="mt-4 pt-3 border-top">
              <button onClick={handleLogout} className="sidebar-link w-100 text-start border-0 bg-transparent text-danger">
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-grow-1 p-3 p-md-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
