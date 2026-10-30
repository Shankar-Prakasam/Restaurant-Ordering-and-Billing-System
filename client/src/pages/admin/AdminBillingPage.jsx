import React, { useState, useEffect } from 'react';
import { billService, orderService, paymentService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminBillingPage = () => {
  const [bills, setBills] = useState([]);
  const [unbilledOrders, setUnbilledOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bills'); // 'bills' or 'unbilled'
  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Generate Bill Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedOrderToBill, setSelectedOrderToBill] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [taxPct, setTaxPct] = useState(5);
  const [generating, setGenerating] = useState(false);

  // View / Print Invoice Modal
  const [invoiceBill, setInvoiceBill] = useState(null);

  // Quick Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billForPayment, setBillForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (paymentStatusFilter !== 'all') params.paymentStatus = paymentStatusFilter;

      const res = await billService.getBills(params);
      if (res.data.success) {
        setBills(res.data.bills);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnbilledOrders = async () => {
    try {
      const res = await orderService.getOrders({ isBilled: 'false', status: 'all' });
      if (res.data.success) {
        // Exclude cancelled orders from billing
        const activeUnbilled = res.data.orders.filter(o => o.orderStatus !== 'Cancelled');
        setUnbilledOrders(activeUnbilled);
      }
    } catch (error) {
      console.error('Error loading unbilled orders:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills();
      fetchUnbilledOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, paymentStatusFilter]);

  const handleOpenGenerate = (order) => {
    setSelectedOrderToBill(order);
    setDiscount(0);
    setTaxPct(5);
    setShowGenerateModal(true);
  };

  const handleGenerateBillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderToBill) return;

    setGenerating(true);
    try {
      const res = await billService.generateBill({
        orderId: selectedOrderToBill._id,
        discount: Number(discount) || 0,
        taxPercentage: Number(taxPct) || 5,
      });

      if (res.data.success) {
        toast.success(`Bill ${res.data.bill.billId} generated successfully!`);
        setShowGenerateModal(false);
        fetchBills();
        fetchUnbilledOrders();
        setInvoiceBill(res.data.bill);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to generate bill';
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!billForPayment) return;

    setRecordingPayment(true);
    try {
      const res = await paymentService.recordPayment({
        billId: billForPayment._id,
        paymentMethod,
      });

      if (res.data.success) {
        toast.success(`Payment recorded via ${paymentMethod}!`);
        setShowPaymentModal(false);
        setBillForPayment(null);
        fetchBills();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Payment recording failed';
      toast.error(msg);
    } finally {
      setRecordingPayment(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Restaurant Invoicing & Billing</h2>
          <small className="text-muted">Generate combined dining bills, apply promotional discounts, calculate GST, and record settlements</small>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border d-inline-flex">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 fw-semibold ${activeTab === 'bills' ? 'active bg-danger text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('bills')}
          >
            <i className="bi bi-receipt me-1"></i> Generated Invoices ({bills.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 fw-semibold ${activeTab === 'unbilled' ? 'active bg-danger text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('unbilled')}
          >
            <i className="bi bi-clock-history me-1"></i> Orders Awaiting Bill ({unbilledOrders.length})
          </button>
        </li>
      </ul>

      {activeTab === 'bills' ? (
        <>
          {/* Filters Bar */}
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="Search invoice number, guest name, or table..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select bg-light"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="Pending">Pending Payment</option>
                  <option value="Paid">Paid in Full</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              <div className="col-md-3 text-md-end text-muted small">
                Invoices: <strong className="text-dark">{bills.length}</strong>
              </div>
            </div>
          </div>

          {/* Bills Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Invoice #</th>
                    <th>Guest / Table</th>
                    <th>Subtotal</th>
                    <th>Tax (GST)</th>
                    <th>Discount</th>
                    <th>Grand Total</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="spinner-border text-danger" role="status"></div>
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No bills found matching filters.
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill._id}>
                        <td className="ps-4">
                          <span className="font-monospace fw-bold text-dark">{bill.billId}</span>
                          <small className="text-muted d-block">
                            {new Date(bill.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <div className="fw-bold">{bill.customerName}</div>
                          <span className="badge bg-danger text-white">Table {bill.tableNumber}</span>
                        </td>
                        <td>₹{bill.subtotal}</td>
                        <td className="text-muted">₹{bill.taxAmount} ({bill.taxPercentage}%)</td>
                        <td className={bill.discount > 0 ? 'text-success fw-semibold' : 'text-muted'}>
                          {bill.discount > 0 ? `-₹${bill.discount}` : '₹0'}
                        </td>
                        <td className="fw-bold fs-6 text-danger">₹{bill.grandTotal}</td>
                        <td>
                          <span
                            className={`badge ${bill.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}
                          >
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button
                            onClick={() => setInvoiceBill(bill)}
                            className="btn btn-sm btn-outline-dark rounded-circle p-1 me-1"
                            title="View / Print Invoice"
                          >
                            <i className="bi bi-printer"></i>
                          </button>
                          {bill.paymentStatus === 'Pending' && (
                            <button
                              onClick={() => {
                                setBillForPayment(bill);
                                setShowPaymentModal(true);
                              }}
                              className="btn btn-sm btn-success rounded-pill px-3 fw-semibold"
                            >
                              <i className="bi bi-cash me-1"></i> Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Unbilled Orders List */
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Order Ref</th>
                  <th>Table</th>
                  <th>Items Ordered</th>
                  <th>Food Subtotal</th>
                  <th>Kitchen Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {unbilledOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No unbilled dining orders. All active orders have been billed!
                    </td>
                  </tr>
                ) : (
                  unbilledOrders.map((ord) => (
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
                      </td>
                      <td className="fw-bold text-danger fs-6">₹{ord.subtotal}</td>
                      <td>
                        <span className="badge bg-primary text-uppercase">{ord.orderStatus}</span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          onClick={() => handleOpenGenerate(ord)}
                          className="btn btn-primary-custom btn-sm rounded-pill px-3 fw-bold"
                        >
                          <i className="bi bi-receipt me-1"></i> Generate Bill
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showGenerateModal && selectedOrderToBill && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">Generate Customer Invoice</h5>
                <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)}></button>
              </div>
              <form onSubmit={handleGenerateBillSubmit}>
                <div className="modal-body py-3">
                  <div className="d-flex justify-content-between p-3 bg-light rounded-3 mb-3 small">
                    <div>
                      <strong>Order:</strong> {selectedOrderToBill.orderId}<br />
                      <strong>Table:</strong> {selectedOrderToBill.tableId?.tableNumber}
                    </div>
                    <div className="text-end">
                      <strong>Food Subtotal:</strong><br />
                      <span className="fs-5 fw-bold text-danger">₹{selectedOrderToBill.subtotal}</span>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Applicable Tax (% GST)</label>
                      <input
                        type="number"
                        min="0"
                        max="28"
                        step="0.5"
                        className="form-control"
                        value={taxPct}
                        onChange={(e) => setTaxPct(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Discount Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Dynamic calculation preview */}
                  {(() => {
                    const sub = selectedOrderToBill.subtotal;
                    const taxAmt = Number(((sub * taxPct) / 100).toFixed(2));
                    const disc = Number(discount) || 0;
                    const total = Math.max(0, sub + taxAmt - disc);
                    return (
                      <div className="p-3 border rounded-3 bg-white small">
                        <div className="d-flex justify-content-between py-1">
                          <span>Subtotal:</span>
                          <span>₹{sub}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1">
                          <span>GST ({taxPct}%):</span>
                          <span>₹{taxAmt}</span>
                        </div>
                        {disc > 0 && (
                          <div className="d-flex justify-content-between py-1 text-success">
                            <span>Discount:</span>
                            <span>-₹{disc}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between pt-2 border-top fw-bold fs-6 text-danger">
                          <span>Calculated Grand Total:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowGenerateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={generating} className="btn btn-primary-custom rounded-pill px-4">
                    {generating ? 'Generating...' : 'Confirm & Generate Bill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View / Print Modal */}
      {invoiceBill && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setInvoiceBill(null)}></button>
              </div>
              <div className="modal-body">
                <div className="invoice-box p-4 border rounded-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <div>
                      <h4 className="brand-font fw-bold text-danger mb-0">Royal Spice Haveli</h4>
                      <small className="text-muted">Authentic Indian Heritage Cuisine &bull; Tax Invoice</small>
                    </div>
                    <div className="text-end">
                      <h5 className="mb-0 fw-bold">{invoiceBill.billId}</h5>
                      <small className="text-muted">
                        Date: {new Date(invoiceBill.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  <div className="row g-2 mb-4 small">
                    <div className="col-6">
                      <strong>Customer Name:</strong> {invoiceBill.customerName}<br />
                      <strong>Assigned Table:</strong> {invoiceBill.tableNumber}
                    </div>
                    <div className="col-6 text-end">
                      <strong>Payment Status:</strong>{' '}
                      <span className={`badge ${invoiceBill.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {invoiceBill.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <table className="table table-bordered small">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceBill.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{it.itemName}</td>
                          <td className="text-center">{it.quantity}</td>
                          <td className="text-end">₹{it.unitPrice}</td>
                          <td className="text-end">₹{it.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end fw-semibold">Food Subtotal:</td>
                        <td className="text-end">₹{invoiceBill.subtotal}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end fw-semibold">GST ({invoiceBill.taxPercentage}%):</td>
                        <td className="text-end">₹{invoiceBill.taxAmount}</td>
                      </tr>
                      {invoiceBill.discount > 0 && (
                        <tr>
                          <td colSpan="4" className="text-end fw-semibold text-success">Discount:</td>
                          <td className="text-end text-success">-₹{invoiceBill.discount}</td>
                        </tr>
                      )}
                      <tr className="table-light">
                        <td colSpan="4" className="text-end fw-bold fs-6">Grand Total:</td>
                        <td className="text-end fw-bold fs-6 text-danger">₹{invoiceBill.grandTotal}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="text-center text-muted small mt-4 pt-2 border-top">
                    Thank you for dining with Royal Spice Haveli! Please visit again.
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button onClick={() => window.print()} className="btn btn-outline-dark rounded-pill px-4">
                  <i className="bi bi-printer me-1"></i> Print Bill
                </button>
                <button onClick={() => setInvoiceBill(null)} className="btn btn-secondary rounded-pill px-4">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && billForPayment && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">Record Customer Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-body py-3">
                  <div className="p-3 bg-light rounded-3 text-center mb-3">
                    <span className="text-muted small">Total Bill Amount</span>
                    <div className="display-6 fw-bold text-success">₹{billForPayment.grandTotal}</div>
                    <small className="text-muted">Invoice: {billForPayment.billId}</small>
                  </div>

                  <label className="form-label small fw-semibold">Select Payment Method</label>
                  <div className="d-flex gap-3 mb-3">
                    {['Cash', 'UPI', 'Card'].map((m) => (
                      <div key={m} className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="staffPayMethod"
                          id={`spm_${m}`}
                          value={m}
                          checked={paymentMethod === m}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label className="form-check-label fw-bold" htmlFor={`spm_${m}`}>
                          {m}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={recordingPayment} className="btn btn-success rounded-pill px-4 fw-bold">
                    {recordingPayment ? 'Recording...' : `Confirm Payment (₹${billForPayment.grandTotal})`}
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

export default AdminBillingPage;
