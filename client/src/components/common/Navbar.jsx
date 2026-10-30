import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'staff') return '/staff';
    return '/customer/bookings';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm" style={{ backgroundColor: 'var(--primary-color)' }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.7rem' }}>🍛</span>
          <div>
            <span className="brand-font fw-bold text-white fs-4 d-block lh-1">Royal Spice Haveli</span>
            <small style={{ color: 'var(--accent-color)', fontSize: '0.72rem', letterSpacing: '1px' }}>
              AUTHENTIC INDIAN HERITAGE CUISINE
            </small>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#royalNavbar"
          aria-controls="royalNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="royalNavbar">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'text-warning fw-bold' : 'text-white'}`} to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'text-warning fw-bold' : 'text-white'}`} to="/menu">
                Food Menu
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'text-warning fw-bold' : 'text-white'}`} to="/book-table">
                Book a Table
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'text-warning fw-bold' : 'text-white'}`} to="/about">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'text-warning fw-bold' : 'text-white'}`} to="/contact">
                Contact Us
              </NavLink>
            </li>
          </ul>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {/* Cart Button */}
            <Link to="/cart" className="btn btn-outline-light position-relative rounded-pill px-3 py-1 me-2">
              <i className="bi bi-cart3 me-1"></i> Cart
              {totalCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                  {totalCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-warning dropdown-toggle rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user?.name?.split(' ')[0] || 'User'}</span>
                  <span className="badge bg-dark ms-1" style={{ fontSize: '0.65rem' }}>
                    {user?.role?.toUpperCase()}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                  <li className="px-3 py-2 border-bottom">
                    <div className="fw-bold">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to={getDashboardPath()}>
                      <i className="bi bi-speedometer2 me-2 text-primary"></i>
                      {user?.role === 'customer' ? 'My Bookings & Orders' : 'Dashboard'}
                    </Link>
                  </li>
                  {user?.role === 'customer' && (
                    <li>
                      <Link className="dropdown-item py-2" to="/customer/bookings">
                        <i className="bi bi-calendar-check me-2 text-primary"></i> My Reservations
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light rounded-pill px-3 py-1">
                  Login
                </Link>
                <Link to="/register" className="btn btn-warning rounded-pill px-3 py-1 fw-semibold">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
