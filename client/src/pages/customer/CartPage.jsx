import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount, totalCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="py-5 bg-white rounded-4 shadow-sm my-4 mx-auto" style={{ maxWidth: '550px' }}>
          <i className="bi bi-cart-x display-2 text-muted"></i>
          <h3 className="brand-font fw-bold mt-3 mb-2">Your Food Cart is Empty</h3>
          <p className="text-muted small mb-4">
            Explore our rich tandoori specialties and mouth-watering curries to add dishes to your order.
          </p>
          <Link to="/menu" className="btn btn-primary-custom rounded-pill px-4">
            <i className="bi bi-book-half me-1"></i> Browse Royal Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="brand-font fw-bold mb-1">Your Order Cart</h2>
            <p className="text-muted small mb-0">Review dishes and choose how you would like to dine.</p>
          </div>
          <button onClick={clearCart} className="btn btn-outline-danger btn-sm rounded-pill">
            <i className="bi bi-trash3 me-1"></i> Clear Cart
          </button>
        </div>

        <div className="row g-4">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Dish</th>
                      <th>Unit Price</th>
                      <th className="text-center" style={{ width: '140px' }}>Quantity</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-center pe-4" style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.menuItemId}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="rounded-3"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold">{item.name}</div>
                              <small className={item.isVeg ? 'text-success' : 'text-danger'}>
                                {item.isVeg ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="fw-semibold">₹{item.price}</td>
                        <td className="text-center">
                          <div className="input-group input-group-sm justify-content-center">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="input-group-text px-3 bg-white fw-bold">{item.quantity}</span>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end fw-bold text-danger">₹{item.price * item.quantity}</td>
                        <td className="text-center pe-4">
                          <button
                            onClick={() => removeFromCart(item.menuItemId)}
                            className="btn btn-sm btn-light text-danger rounded-circle p-1"
                            title="Remove item"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="brand-font fw-bold mb-3 pb-2 border-bottom">Order Summary</h5>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted">Total Food Items:</span>
                <span className="fw-semibold">{totalCount} items</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Food Subtotal:</span>
                <span className="fw-bold fs-5 text-danger">₹{totalAmount}</span>
              </div>
              <div className="small text-muted py-2">
                Applicable taxes (GST 5%) will be calculated upon bill generation.
              </div>

              <div className="d-grid gap-2 mt-4">
                <Link to="/book-table" className="btn btn-primary-custom py-2 rounded-pill fw-bold">
                  <i className="bi bi-calendar-check me-2"></i> Reserve Table With These Items
                </Link>
                <Link to="/menu" className="btn btn-outline-secondary py-2 rounded-pill">
                  <i className="bi bi-arrow-left me-1"></i> Add More Dishes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
