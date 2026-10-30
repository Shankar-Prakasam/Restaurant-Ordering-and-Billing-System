import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await orderService.getOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load food orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Status update failed';
      toast.error(msg);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this kitchen order?')) return;
    try {
      const res = await orderService.cancelOrder(orderId);
      if (res.data.success) {
        toast.success('Order cancelled.');
        fetchOrders();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Cancellation rejected.';
      toast.error(msg);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font fw-bold mb-0">Kitchen & Dining Orders</h2>
          <small className="text-muted">Live queue of culinary orders across all dining tables and reservations</small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control bg-light"
              placeholder="Search order reference (e.g. ORD-)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Served">Served</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-md-3 text-md-end text-muted small">
            Total Orders: <strong className="text-dark">{orders.length}</strong>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Order Ref</th>
                <th>Table</th>
                <th>Items Ordered</th>
                <th>Subtotal</th>
                <th>Status</th>
                <th>Billing</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-danger" role="status"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No orders matching search or status.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  let statusBadge = 'bg-secondary';
                  if (order.orderStatus === 'Pending') statusBadge = 'bg-warning text-dark';
                  if (order.orderStatus === 'Confirmed') statusBadge = 'bg-info text-dark';
                  if (order.orderStatus === 'Preparing') statusBadge = 'bg-primary';
                  if (order.orderStatus === 'Ready') statusBadge = 'bg-success';
                  if (order.orderStatus === 'Served') statusBadge = 'bg-dark';
                  if (order.orderStatus === 'Cancelled') statusBadge = 'bg-danger';

                  return (
                    <tr key={order._id}>
                      <td className="ps-4">
                        <span className="font-monospace fw-bold">{order.orderId}</span>
                        <small className="text-muted d-block">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-danger text-white fs-6">
                          {order.tableId?.tableNumber || 'Table'}
                        </span>
                      </td>
                      <td>
                        <div className="small">
                          {order.items.slice(0, 2).map((it, idx) => (
                            <div key={idx}>
                              {it.quantity} &times; {it.itemName}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-muted fst-italic">+{order.items.length - 2} more items</span>
                          )}
                        </div>
                      </td>
                      <td className="fw-bold text-danger">₹{order.subtotal}</td>
                      <td>
                        {/* Quick Status Dropdown */}
                        <select
                          className={`form-select form-select-sm fw-bold border-0 ${statusBadge}`}
                          style={{ width: '130px' }}
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          disabled={order.isBilled && order.orderStatus === 'Served'}
                        >
                          <option value="Pending" className="bg-white text-dark">Pending</option>
                          <option value="Confirmed" className="bg-white text-dark">Confirmed</option>
                          <option value="Preparing" className="bg-white text-dark">Preparing</option>
                          <option value="Ready" className="bg-white text-dark">Ready</option>
                          <option value="Served" className="bg-white text-dark">Served</option>
                          <option value="Cancelled" className="bg-white text-dark">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${order.isBilled ? 'bg-success' : 'bg-secondary'}`}>
                          {order.isBilled ? 'Billed' : 'Unbilled'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn btn-sm btn-outline-dark rounded-circle p-1 me-1"
                          title="View Order Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {!order.isBilled && order.orderStatus !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="btn btn-sm btn-outline-danger rounded-circle p-1"
                            title="Cancel Order"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">
                  Order Details: {selectedOrder.orderId}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body py-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="badge bg-danger fs-6">{selectedOrder.tableId?.tableNumber}</span>
                    <span className="text-muted small ms-2">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="badge bg-dark text-uppercase">{selectedOrder.orderStatus}</span>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm small">
                    <thead className="table-light">
                      <tr>
                        <th>Dish</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.itemName}</td>
                          <td className="text-center">{it.quantity}</td>
                          <td className="text-end">₹{it.unitPrice}</td>
                          <td className="text-end fw-semibold">₹{it.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">Total Food Subtotal:</td>
                        <td className="text-end fw-bold text-danger">₹{selectedOrder.subtotal}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.notes && (
                  <div className="alert alert-light border small mt-2">
                    <strong>Special Instructions:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <button onClick={() => setSelectedOrder(null)} className="btn btn-dark rounded-pill px-4">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
