import React, { useState, useEffect } from 'react';
import { reportService, tableService } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#641E16', '#D4A017', '#2E7D32', '#1976D2', '#E65100', '#6A1B9A'];

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [popularDishes, setPopularDishes] = useState([]);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [dashRes, popularRes, salesRes] = await Promise.all([
          reportService.getDashboardSummary(),
          reportService.getPopularDishes(),
          reportService.getSalesReport(),
        ]);

        if (dashRes.data.success) {
          setData(dashRes.data.data);
        }
        if (popularRes.data.success) {
          setPopularDishes(popularRes.data.popularItems);
        }
        if (salesRes.data.success) {
          setSalesData(salesRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <div className="mt-2 text-muted">Loading live dashboard metrics...</div>
      </div>
    );
  }

  const summary = data?.summary || {};

  // Format data for status charts
  const orderChartData = Object.entries(data?.orderStatusCounts || {}).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  const revenueByMethodData = (salesData?.revenueByMethod || []).map((m) => ({
    name: m._id,
    amount: m.totalAmount,
  }));

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Executive Admin Dashboard</h2>
          <small className="text-muted">Live restaurant performance, table occupancy, orders, and revenue metrics</small>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/reports" className="btn btn-outline-danger btn-sm rounded-pill">
            <i className="bi bi-file-earmark-bar-graph me-1"></i> Full Analytics
          </Link>
          <Link to="/book-table" className="btn btn-primary-custom btn-sm rounded-pill">
            <i className="bi bi-plus-circle me-1"></i> New Walk-In
          </Link>
        </div>
      </div>

      {/* 8 Key Metric Statistic Cards */}
      <div className="row g-3 mb-4">
        {/* Total Customers */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Registered Customers
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-dark">{summary.totalCustomers}</h3>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                <i className="bi bi-people-fill fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Active patrons in database</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Total Paid Revenue
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-success">₹{summary.totalRevenue}</h3>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-4">
                <i className="bi bi-cash-stack fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Across all completed bills</div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Total Bookings
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-dark">{summary.totalBookings}</h3>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4">
                <i className="bi bi-calendar-check-fill fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">
              Today: <strong className="text-danger">{summary.todayBookings} reservations</strong>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Total Food Orders
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-dark">{summary.totalOrders}</h3>
              </div>
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-4">
                <i className="bi bi-fire fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Kitchen orders recorded</div>
          </div>
        </div>

        {/* Table Occupancy (Available vs Occupied) */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Available Tables
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-success">{summary.availableTables} / {summary.totalTables}</h3>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-4">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Free for walk-in seating</div>
          </div>
        </div>

        {/* Occupied Tables */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Occupied Right Now
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-danger">{summary.occupiedTables}</h3>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-4">
                <i className="bi bi-person-walking fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Diners currently seated</div>
          </div>
        </div>

        {/* Staff Members */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Staff & Admin Crew
                </small>
                <h3 className="fw-bold mb-0 mt-1 text-dark">{summary.totalStaff}</h3>
              </div>
              <div className="p-3 bg-secondary bg-opacity-10 text-secondary rounded-4">
                <i className="bi bi-person-badge-fill fs-4"></i>
              </div>
            </div>
            <div className="mt-2 small text-muted">Service personnel & managers</div>
          </div>
        </div>

        {/* Quick Tables View Link */}
        <div className="col-xl-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-center text-center">
            <Link to="/admin/tables" className="btn btn-outline-dark rounded-pill btn-sm py-2">
              <i className="bi bi-grid-3x3-gap me-1"></i> Visual Table Board
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Daily Revenue Chart */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="brand-font fw-bold mb-3">Daily Revenue Trend (₹)</h5>
            {salesData?.dailySales && salesData.dailySales.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={salesData.dailySales}>
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip formatter={(val) => `₹${val}`} />
                    <Bar dataKey="totalRevenue" fill="#641E16" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-5 text-muted small">No completed sales recorded for this period yet.</div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="brand-font fw-bold mb-3">Order Status Breakdown</h5>
            {orderChartData.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={orderChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-5 text-muted small">No active orders yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Dishes & Recent Bookings */}
      <div className="row g-4">
        {/* Popular Dishes */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="brand-font fw-bold mb-0">Top Performing Dishes</h5>
              <Link to="/admin/menu" className="small text-danger text-decoration-none fw-semibold">
                Manage Menu &rarr;
              </Link>
            </div>
            {popularDishes.length === 0 ? (
              <div className="text-center py-4 text-muted small">No order items data yet.</div>
            ) : (
              <ul className="list-group list-group-flush small">
                {popularDishes.slice(0, 5).map((dish, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-danger rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="fw-bold">{dish.itemName}</div>
                        <small className="text-muted">{dish.ordersCount} distinct orders</small>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-warning text-dark fw-bold">{dish.totalOrderedQty} sold</span>
                      <div className="fw-semibold text-danger">₹{dish.totalRevenue}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="brand-font fw-bold mb-0">Recent Reservations</h5>
              <Link to="/admin/bookings" className="small text-danger text-decoration-none fw-semibold">
                View All &rarr;
              </Link>
            </div>
            {(!data?.recentBookings || data.recentBookings.length === 0) ? (
              <div className="text-center py-4 text-muted small">No recent bookings.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ref</th>
                      <th>Guest</th>
                      <th>Table</th>
                      <th>Date / Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings.map((b) => (
                      <tr key={b._id}>
                        <td className="font-monospace text-muted">{b.bookingId}</td>
                        <td className="fw-semibold">{b.customerName}</td>
                        <td>{b.tableId?.tableNumber || '-'}</td>
                        <td>{b.bookingDate} {b.startTime}</td>
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
      </div>
    </div>
  );
};

export default AdminDashboardPage;
