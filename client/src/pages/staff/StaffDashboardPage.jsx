import React, { useState, useEffect } from 'react';
import { reportService, orderService, bookingService, tableService } from '../../services/api';
import { Link } from 'react-router-dom';

const StaffDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      setLoading(true);
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [sumRes, bkgRes, ordRes] = await Promise.all([
          reportService.getDashboardSummary(),
          bookingService.getBookings({ date: todayStr }),
          orderService.getOrders({ isBilled: 'false' }),
        ]);

        if (sumRes.data.success) setSummary(sumRes.data.data.summary);
        if (bkgRes.data.success) setTodayBookings(bkgRes.data.bookings);
        if (ordRes.data.success) {
          // Keep unbilled orders that are not cancelled
          setActiveOrders(ordRes.data.orders.filter(o => o.orderStatus !== 'Cancelled'));
        }
      } catch (error) {
        console.error('Error fetching staff dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <div className="mt-2 text-muted">Loading floor operations...</div>
      </div>
    );
  }

  // Count orders by status
  const pendingCount = activeOrders.filter(o => o.orderStatus === 'Pending').length;
  const preparingCount = activeOrders.filter(o => o.orderStatus === 'Preparing').length;
  const readyCount = activeOrders.filter(o => o.orderStatus === 'Ready').length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Floor Manager & Kitchen Hub</h2>
          <small className="text-muted">Today's reservations, live table availability, and pending culinary orders</small>
        </div>
        <div className="d-flex gap-2">
          <Link to="/staff/orders" className="btn btn-primary-custom btn-sm rounded-pill">
            <i className="bi bi-plus-circle me-1"></i> New Table Order
          </Link>
          <Link to="/staff/billing" className="btn btn-outline-danger btn-sm rounded-pill">
            <i className="bi bi-receipt me-1"></i> Bill Desk
          </Link>
        </div>
      </div>

      {/* Operational Highlights Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Today's Bookings
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-dark">{todayBookings.length}</h3>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                <i className="bi bi-calendar-event fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Guests expected today</div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Tables Available
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-success">
                  {summary?.availableTables || 0} / {summary?.totalTables || 12}
                </h3>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-4">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Ready for walk-in seating</div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Kitchen Queue
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-danger">{activeOrders.length}</h3>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-4">
                <i className="bi bi-fire fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">
              {preparingCount} in prep &bull; {readyCount} ready to serve
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Orders Ready to Serve
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-warning">{readyCount}</h3>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4">
                <i className="bi bi-bell-fill fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Food plated on pass</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Today's Reservations Table */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="brand-font fw-bold mb-0">Today's Table Reservations</h5>
              <Link to="/staff/bookings" className="small text-danger fw-semibold text-decoration-none">
                Manage All &rarr;
              </Link>
            </div>
            {todayBookings.length === 0 ? (
              <div className="text-center py-5 text-muted small">No reservations booked for today.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      <th>Guest Name</th>
                      <th>Table</th>
                      <th>Party Size</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayBookings.map((b) => (
                      <tr key={b._id}>
                        <td className="fw-bold">{b.startTime}</td>
                        <td>{b.customerName}</td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger border">
                            {b.tableId?.tableNumber || '-'}
                          </span>
                        </td>
                        <td>{b.numberOfGuests} Guests</td>
                        <td>
                          <span
                            className={`badge ${
                              b.bookingStatus === 'Confirmed'
                                ? 'bg-success'
                                : b.bookingStatus === 'Completed'
                                ? 'bg-primary'
                                : 'bg-danger'
                            }`}
                          >
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Live Active Kitchen Orders */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="brand-font fw-bold mb-0">Active Kitchen Orders</h5>
              <Link to="/staff/orders" className="small text-danger fw-semibold text-decoration-none">
                Kitchen Board &rarr;
              </Link>
            </div>
            {activeOrders.length === 0 ? (
              <div className="text-center py-5 text-muted small">No pending orders in the kitchen.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {activeOrders.slice(0, 4).map((ord) => (
                  <div key={ord._id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-danger fs-6">{ord.tableId?.tableNumber || 'Table'}</span>
                      <span className="badge bg-dark text-uppercase">{ord.orderStatus}</span>
                    </div>
                    <div className="small text-muted mb-2">
                      {ord.items.map((it) => `${it.quantity}x ${it.itemName}`).join(', ')}
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-1 border-top small">
                      <span className="text-muted">Subtotal: ₹{ord.subtotal}</span>
                      <Link to="/staff/orders" className="text-danger fw-semibold">
                        Update Status
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
