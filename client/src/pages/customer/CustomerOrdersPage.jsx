import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import { toast } from 'react-toastify';

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderService.cancelOrder(orderId);
      if (res.data.success) {
        toast.success('Order cancelled successfully.');
        fetchOrders();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not cancel order.';
      toast.error(msg);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="brand-font fw-bold mb-1">My Food Orders</h3>
          <p className="text-muted small mb-0">Track kitchen preparation and dining order status in real time.</p>
        </div>
        <a href="/menu" className="btn btn-primary-custom btn-sm rounded-pill">
          <i className="bi bi-book-half me-1"></i> Order More Food
        </a>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-basket display-3 text-muted"></i>
          <h4 className="mt-3 brand-font">No Orders Placed Yet</h4>
          <p className="text-muted small mb-4">You have not ordered any dishes yet.</p>
          <a href="/menu" className="btn btn-primary-custom rounded-pill px-4 mx-auto">
            Explore Menu & Order
          </a>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => {
            let statusBadge = 'bg-secondary';
            if (order.orderStatus === 'Pending') statusBadge = 'bg-warning text-dark';
            if (order.orderStatus === 'Confirmed') statusBadge = 'bg-info text-dark';
            if (order.orderStatus === 'Preparing') statusBadge = 'bg-primary';
            if (order.orderStatus === 'Ready') statusBadge = 'bg-success';
            if (order.orderStatus === 'Served') statusBadge = 'bg-dark';
            if (order.orderStatus === 'Cancelled') statusBadge = 'bg-danger';

            return (
              <div key={order._id} className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="text-muted font-monospace small d-block">{order.orderId}</span>
                      <h5 className="fw-bold mb-0">Table {order.tableId?.tableNumber || 'Dining'}</h5>
                      <small className="text-muted">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    <span className={`badge ${statusBadge} text-uppercase px-3 py-2 rounded-pill`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="bg-light p-3 rounded-3 mb-3 flex-grow-1">
                    <div className="fw-bold small text-muted mb-2 pb-1 border-bottom">Ordered Items:</div>
                    <ul className="list-unstyled mb-0 small">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="d-flex justify-content-between py-1 border-bottom border-light">
                          <span>
                            {item.quantity} &times; {item.itemName}
                          </span>
                          <span className="fw-semibold">₹{item.subtotal}</span>
                        </li>
                      ))}
                    </ul>
                    {order.notes && (
                      <div className="mt-2 pt-1 small text-muted">
                        <strong>Chef Notes:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Footer subtotal & billing status */}
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      <span className="text-muted small">Subtotal: </span>
                      <strong className="text-danger fs-5">₹{order.subtotal}</strong>
                      <span className={`badge ms-2 ${order.isBilled ? 'bg-success' : 'bg-secondary'}`}>
                        {order.isBilled ? 'Billed' : 'Unbilled'}
                      </span>
                    </div>

                    {!order.isBilled && order.orderStatus !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-outline-danger btn-sm rounded-pill"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
