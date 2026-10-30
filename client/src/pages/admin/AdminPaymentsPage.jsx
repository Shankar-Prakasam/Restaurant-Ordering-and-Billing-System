import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (methodFilter !== 'all') params.paymentMethod = methodFilter;
      if (search) params.search = search;

      const res = await paymentService.getPayments(params);
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 250);
    return () => clearTimeout(timer);
  }, [methodFilter, search]);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font fw-bold mb-0">Payments & Collections Ledger</h2>
          <small className="text-muted">Master transaction records across UPI, credit/debit cards, and cash tenders</small>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>
              Total Filtered Collections
            </small>
            <h3 className="fw-bold mb-0 mt-1 text-success">₹{totalCollected.toFixed(2)}</h3>
            <small className="text-muted">{payments.length} transactions processed</small>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control bg-light"
              placeholder="Search by Payment ID or Transaction Reference (e.g. TXN-)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI Transfer</option>
              <option value="Card">Card (Debit/Credit)</option>
              <option value="Cash">Cash at Counter</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end text-muted small">
            Records: <strong className="text-dark">{payments.length}</strong>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Payment ID</th>
                <th>Transaction Reference</th>
                <th>Method</th>
                <th>Amount Collected</th>
                <th>Status</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-danger" role="status"></div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No payment records found matching filters.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td className="ps-4">
                      <span className="font-monospace fw-bold text-dark">{p.paymentId}</span>
                    </td>
                    <td>
                      <span className="font-monospace text-muted">{p.transactionReference}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark border fw-semibold">
                        {p.paymentMethod === 'UPI' && '📱 UPI'}
                        {p.paymentMethod === 'Card' && '💳 Card'}
                        {p.paymentMethod === 'Cash' && '💵 Cash'}
                      </span>
                    </td>
                    <td className="fw-bold text-success fs-6">₹{p.amount}</td>
                    <td>
                      <span className="badge bg-success text-uppercase">{p.paymentStatus}</span>
                    </td>
                    <td className="small text-muted">
                      {new Date(p.createdAt).toLocaleDateString()} at{' '}
                      {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
