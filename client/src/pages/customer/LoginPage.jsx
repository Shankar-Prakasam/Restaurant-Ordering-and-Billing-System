import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.name}!`);

      // Determine redirect path
      const role = res.user.role;
      const origin = location.state?.from?.pathname;

      if (origin) {
        navigate(origin);
      } else if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/customer/bookings');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill buttons for testing/demo
  const handleQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="fs-1">🍛</span>
                <h3 className="brand-font fw-bold mt-2 mb-1">Welcome Back</h3>
                <p className="text-muted small">Log in to manage bookings, orders, and dining bills</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary-custom w-100 py-2 rounded-pill fw-bold mt-2 shadow"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Authenticating...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top small text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-danger fw-semibold text-decoration-none">
                  Register as Customer
                </Link>
              </div>

              {/* Demo Credentials Helper Pill Box */}
              <div className="mt-4 p-3 bg-light rounded-3 border small">
                <div className="fw-bold text-dark mb-2 text-center">Academic Demo One-Click Fill:</div>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@royalspice.com', 'Admin@123456')}
                    className="btn btn-sm btn-outline-dark"
                  >
                    👑 Admin Login (admin@royalspice.com)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('staff@royalspice.com', 'Staff@123456')}
                    className="btn btn-sm btn-outline-dark"
                  >
                    🧑‍🍳 Staff Login (staff@royalspice.com)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rahul@example.com', 'Customer@123456')}
                    className="btn btn-sm btn-outline-dark"
                  >
                    👤 Customer Login (rahul@example.com)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
