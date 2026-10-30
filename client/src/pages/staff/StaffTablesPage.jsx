import React, { useState, useEffect } from 'react';
import { tableService } from '../../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const StaffTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTables = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await tableService.getTables(params);
      if (res.data.success) {
        setTables(res.data.tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load table status board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    // Auto refresh every 30 seconds for live table updates
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return { bg: 'badge-available', label: '🟢 Available' };
      case 'Reserved':
        return { bg: 'badge-reserved', label: '🔵 Reserved' };
      case 'Occupied':
        return { bg: 'badge-occupied', label: '🔴 Occupied' };
      case 'Maintenance':
        return { bg: 'badge-maintenance', label: '⚪ Maintenance' };
      default:
        return { bg: 'badge-available', label: status };
    }
  };

  const getStatusCardBorder = (status) => {
    switch (status) {
      case 'Available':
        return 'border-success';
      case 'Reserved':
        return 'border-info';
      case 'Occupied':
        return 'border-danger';
      case 'Maintenance':
        return 'border-secondary';
      default:
        return 'border-light';
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Live Floor Table Status Board</h2>
          <small className="text-muted">Real-time occupancy status computed dynamically from confirmed bookings</small>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchTables} className="btn btn-outline-dark btn-sm rounded-pill">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Floor
          </button>
          <a href="/book-table" target="_blank" rel="noreferrer" className="btn btn-primary-custom btn-sm rounded-pill">
            <i className="bi bi-plus-circle me-1"></i> Seat Walk-In
          </a>
        </div>
      </div>

      {/* Legend & Filter Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center mb-3 pb-3 border-bottom small">
          <span className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>
            Live Floor Legend:
          </span>
          <span className="badge badge-available px-3 py-2 rounded-pill">🟢 Available (Ready for Seating)</span>
          <span className="badge badge-reserved px-3 py-2 rounded-pill">🔵 Reserved (Upcoming Today)</span>
          <span className="badge badge-occupied px-3 py-2 rounded-pill">🔴 Occupied (Diners Seated)</span>
          <span className="badge badge-maintenance px-3 py-2 rounded-pill">⚪ Inactive / Cleaning</span>
        </div>

        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Filter by All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Reserved">Reserved Only</option>
              <option value="Occupied">Occupied Only</option>
              <option value="Maintenance">Maintenance Only</option>
            </select>
          </div>
          <div className="col-md-8 text-md-end text-muted small">
            Live Display: <strong className="text-dark">{tables.length} tables</strong>
          </div>
        </div>
      </div>

      {/* Visual Table Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {tables.map((table) => {
            const statusInfo = getStatusBadge(table.computedStatus);
            const borderClass = getStatusCardBorder(table.computedStatus);

            return (
              <div key={table._id} className="col-xl-3 col-lg-4 col-md-6">
                <div className={`card h-100 shadow-sm rounded-4 bg-white border-2 ${borderClass} p-3 d-flex flex-column`}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h4 className="fw-bold mb-0 text-danger">{table.tableNumber}</h4>
                      <small className="text-muted">{table.tableType}</small>
                    </div>
                    <span className={`badge ${statusInfo.bg} px-2 py-1 small rounded-pill`}>
                      {table.computedStatus}
                    </span>
                  </div>

                  <div className="my-3 p-3 bg-light rounded-3 text-center">
                    <div className="fs-3 text-dark mb-1">
                      <i className="bi bi-people-fill me-1"></i>
                      <span className="fw-bold fs-4">{table.capacity}</span>
                    </div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                      Seating Capacity
                    </small>
                  </div>

                  {table.currentBooking && (
                    <div className="alert alert-danger p-2 small mb-2">
                      <div className="fw-bold text-truncate">{table.currentBooking.customerName}</div>
                      <div>Time: {table.currentBooking.startTime} ({table.currentBooking.numberOfGuests} guests)</div>
                    </div>
                  )}

                  {table.upcomingBooking && !table.currentBooking && (
                    <div className="alert alert-info p-2 small mb-2">
                      <div className="fw-bold text-truncate">{table.upcomingBooking.customerName}</div>
                      <div>At: {table.upcomingBooking.startTime} ({table.upcomingBooking.numberOfGuests} guests)</div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                    <Link to="/staff/orders" className="btn btn-sm btn-outline-dark rounded-pill px-3">
                      <i className="bi bi-plus me-1"></i> Order
                    </Link>
                    <Link to="/staff/billing" className="btn btn-sm btn-outline-danger rounded-pill px-3">
                      <i className="bi bi-receipt me-1"></i> Bill
                    </Link>
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

export default StaffTablesPage;
