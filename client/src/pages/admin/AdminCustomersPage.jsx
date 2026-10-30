import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ role: 'customer', search });
      if (res.data.success) {
        setCustomers(res.data.users);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font fw-bold mb-0">Registered Customers Directory</h2>
          <small className="text-muted">Review diner patron profiles, contact details and registration timelines</small>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search customers by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 text-md-end text-muted small mt-2 mt-md-0">
            Total Customers: <strong className="text-dark">{customers.length}</strong>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Customer</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Member Since</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-danger" role="status"></div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: '40px', height: '40px' }}
                        >
                          {c.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="fw-bold">{c.name}</div>
                          <small className="text-muted">Role: {c.role}</small>
                        </div>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td className="small text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${c.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
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

export default AdminCustomersPage;
