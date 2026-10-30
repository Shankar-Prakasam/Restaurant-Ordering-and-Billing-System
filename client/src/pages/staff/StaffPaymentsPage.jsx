import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/api';
import { toast } from 'react-toastify';

const StaffPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('all');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (methodFilter !== 'all') params.paymentMethod = methodFilter;

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
    fetchPayments();
  }, [methodFilter]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font fw-bold mb-0">Floor Payment Records</h2>
          <small className="text-muted">Settled customer bills and payment confirmation slips</small>
        </div>
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div className="col-md-8 text-md-end text-muted small">
            Recorded Transactions: <strong className="text-dark">{payments.length}</strong>
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
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
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
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td className="ps-4">
                      <span className="font-monospace fw-bold">{p.paymentId}</span>
                    </td>
                    <td>
                      <span className="font-monospace text-muted">{p.transactionReference}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark border fw-semibold">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="fw-bold text-success fs-6">₹{p.amount}</td>
                    <td>
                      <span className="badge bg-success text-uppercase">{p.paymentStatus}</span>
                    </td>
                    <td className="small text-muted">{new Date(p.createdAt).toLocaleString()}</td>
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

export default StaffPaymentsPage;
