import React, { useState, useEffect } from 'react';
import { orderService, tableService, menuService } from '../../services/api';
import { toast } from 'react-toastify';

const StaffOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Order Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderItems, setOrderItems] = useState([]); // [{ menuItem, quantity }]
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Edit Items Modal State (Before Billing)
  const [editingOrder, setEditingOrder] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await orderService.getOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load kitchen orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [tblRes, menuRes] = await Promise.all([
        tableService.getTables(),
        menuService.getItems({ availableOnly: 'true' }),
      ]);
      if (tblRes.data.success) {
        setTables(tblRes.data.tables);
        if (tblRes.data.tables.length > 0) {
          setSelectedTableId(tblRes.data.tables[0]._id);
        }
      }
      if (menuRes.data.success) {
        setMenuItems(res => menuRes.data.items);
      }
    } catch (e) {
      console.error('Error loading tables or menu:', e);
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Order creation helpers
  const handleAddItemToNewOrder = (menuItem) => {
    setOrderItems((prev) => {
      const exists = prev.find((i) => i.menuItemId === menuItem._id);
      if (exists) {
        return prev.map((i) =>
          i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateNewOrderQty = (menuItemId, qty) => {
    if (qty <= 0) {
      setOrderItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
    );
  };

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTableId) {
      toast.error('Please select a table.');
      return;
    }
    if (orderItems.length === 0) {
      toast.error('Please add at least one dish to the order.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        tableId: selectedTableId,
        items: orderItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        notes: orderNotes,
      };

      const res = await orderService.createOrder(payload);
      if (res.data.success) {
        toast.success(`Kitchen Order ${res.data.order.orderId} placed successfully!`);
        setShowCreateModal(false);
        setOrderItems([]);
        setOrderNotes('');
        fetchOrders();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Order creation failed';
      toast.error(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Status transition handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.data.success) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrders();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    }
  };

  // Cancel order before billing
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this kitchen order before billing?')) return;
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

  // Edit Items Modal Handlers
  const handleOpenEditItems = (order) => {
    if (order.isBilled) {
      toast.warning('Order has already been billed and cannot be modified.');
      return;
    }
    setEditingOrder(order);
    setEditItems(order.items.map(it => ({
      menuItemId: it.menuItemId?._id || it.menuItemId,
      itemName: it.itemName,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
    })));
  };

  const handleSaveEditItems = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (editItems.length === 0) {
      toast.error('Order must have at least one item.');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await orderService.updateOrder(editingOrder._id, {
        items: editItems.map(it => ({ menuItemId: it.menuItemId, quantity: it.quantity })),
      });
      if (res.data.success) {
        toast.success('Order quantities and items updated successfully!');
        setEditingOrder(null);
        fetchOrders();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update order items';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const currentOrderTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Kitchen Order Management (KOT)</h2>
          <small className="text-muted">Take table orders, adjust quantities before billing, dispatch dishes and track preparation stages</small>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary-custom rounded-pill">
          <i className="bi bi-plus-lg me-1"></i> New Table Order
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Kitchen Statuses</option>
              <option value="Pending">Pending (Just Received)</option>
              <option value="Confirmed">Confirmed (Fired to Kitchen)</option>
              <option value="Preparing">Preparing (Cooking on Tandoor/Wok)</option>
              <option value="Ready">Ready (Plated on Pass)</option>
              <option value="Served">Served (On Table)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-md-8 text-md-end text-muted small">
            Active Orders: <strong className="text-dark">{orders.length}</strong>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Order Ref</th>
                <th>Table</th>
                <th>Dishes & Quantities</th>
                <th>Subtotal</th>
                <th>Kitchen Stage</th>
                <th>Billing Status</th>
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
                    No orders matching status filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  let statusBadge = 'bg-secondary';
                  if (ord.orderStatus === 'Pending') statusBadge = 'bg-warning text-dark';
                  if (ord.orderStatus === 'Confirmed') statusBadge = 'bg-info text-dark';
                  if (ord.orderStatus === 'Preparing') statusBadge = 'bg-primary';
                  if (ord.orderStatus === 'Ready') statusBadge = 'bg-success';
                  if (ord.orderStatus === 'Served') statusBadge = 'bg-dark';
                  if (ord.orderStatus === 'Cancelled') statusBadge = 'bg-danger';

                  return (
                    <tr key={ord._id}>
                      <td className="ps-4">
                        <span className="font-monospace fw-bold">{ord.orderId}</span>
                        <small className="text-muted d-block">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-danger text-white fs-6">
                          {ord.tableId?.tableNumber || 'Table'}
                        </span>
                      </td>
                      <td>
                        <div className="small">
                          {ord.items.map((it, idx) => (
                            <span key={idx} className="badge bg-light text-dark border me-1 mb-1">
                              {it.quantity} &times; {it.itemName}
                            </span>
                          ))}
                        </div>
                        {ord.notes && (
                          <small className="text-muted fst-italic d-block">Note: {ord.notes}</small>
                        )}
                      </td>
                      <td className="fw-bold text-danger fs-6">₹{ord.subtotal}</td>
                      <td>
                        <select
                          className={`form-select form-select-sm fw-bold border-0 ${statusBadge}`}
                          style={{ width: '135px' }}
                          value={ord.orderStatus}
                          onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                          disabled={ord.isBilled && ord.orderStatus === 'Served'}
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
                        <span className={`badge ${ord.isBilled ? 'bg-success' : 'bg-secondary'}`}>
                          {ord.isBilled ? 'Billed' : 'Unbilled'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        {!ord.isBilled && ord.orderStatus !== 'Cancelled' && (
                          <>
                            <button
                              onClick={() => handleOpenEditItems(ord)}
                              className="btn btn-sm btn-outline-primary rounded-circle p-1 me-1"
                              title="Modify Quantities / Items"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleCancelOrder(ord._id)}
                              className="btn btn-sm btn-outline-danger rounded-circle p-1"
                              title="Cancel Order"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">Create New Table Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOrderSubmit}>
                <div className="modal-body py-3">
                  {/* Select Table */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Dining Table *</label>
                    <select
                      className="form-select"
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      required
                    >
                      {tables.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.tableNumber} ({t.tableType} &bull; Cap {t.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add Dishes from Menu */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Click Dish to Add</label>
                      <div className="border rounded-3 p-2 bg-light overflow-auto" style={{ maxHeight: '250px' }}>
                        {menuItems.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => handleAddItemToNewOrder(item)}
                            className="p-2 bg-white rounded-2 border mb-1 d-flex justify-content-between align-items-center cursor-pointer hover-shadow"
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="small fw-semibold">{item.name}</span>
                            <span className="badge bg-danger">₹{item.price} +</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Basket */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Current Order Items</label>
                      <div className="border rounded-3 p-2 bg-white overflow-auto" style={{ maxHeight: '250px' }}>
                        {orderItems.length === 0 ? (
                          <div className="text-center py-4 text-muted small">No items added yet. Click dishes on the left.</div>
                        ) : (
                          orderItems.map((item) => (
                            <div key={item.menuItemId} className="d-flex justify-content-between align-items-center py-1 border-bottom small">
                              <div>
                                <div className="fw-bold">{item.name}</div>
                                <span className="text-muted">₹{item.price} each</span>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary px-2 py-0"
                                  onClick={() => handleUpdateNewOrderQty(item.menuItemId, item.quantity - 1)}
                                >
                                  -
                                </button>
                                <span className="px-1 fw-bold">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary px-2 py-0"
                                  onClick={() => handleUpdateNewOrderQty(item.menuItemId, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="d-flex justify-content-between fw-bold pt-2 fs-6">
                        <span>Total:</span>
                        <span className="text-danger">₹{currentOrderTotal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label small fw-semibold">Kitchen Notes / Special Requests</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="E.g., Extra garlic naan, mild spice, no onions..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingOrder || orderItems.length === 0} className="btn btn-primary-custom rounded-pill px-4 fw-bold">
                    {submittingOrder ? 'Placing Order...' : 'Fire to Kitchen (Send KOT)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modify Items Modal (Before Billing) */}
      {editingOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">Modify Items: {editingOrder.orderId}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingOrder(null)}></button>
              </div>
              <form onSubmit={handleSaveEditItems}>
                <div className="modal-body py-3">
                  <p className="small text-muted mb-3">
                    Adjust dish quantities or remove items before generating the final bill.
                  </p>
                  <ul className="list-group list-group-flush small mb-3">
                    {editItems.map((item, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div>
                          <div className="fw-bold">{item.itemName}</div>
                          <span className="text-muted">₹{item.unitPrice} each</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => {
                              const newQty = item.quantity - 1;
                              if (newQty <= 0) {
                                setEditItems(editItems.filter((_, i) => i !== idx));
                              } else {
                                setEditItems(editItems.map((it, i) => i === idx ? { ...it, quantity: newQty } : it));
                              }
                            }}
                          >
                            -
                          </button>
                          <span className="fw-bold px-1">{item.quantity}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => {
                              setEditItems(editItems.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it));
                            }}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light text-danger ms-2 p-1"
                            onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="d-flex justify-content-between fw-bold pt-2 border-top">
                    <span>New Food Subtotal:</span>
                    <span className="text-danger fs-6">
                      ₹{editItems.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0)}
                    </span>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setEditingOrder(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={savingEdit} className="btn btn-primary-custom rounded-pill px-4">
                    {savingEdit ? 'Saving...' : 'Save Order Adjustments'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrdersPage;
