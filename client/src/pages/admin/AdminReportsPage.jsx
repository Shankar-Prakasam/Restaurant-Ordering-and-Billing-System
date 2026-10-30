import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#641E16', '#D4A017', '#2E7D32', '#1976D2', '#E65100', '#6A1B9A'];

const AdminReportsPage = () => {
  const [reportType, setReportType] = useState('sales'); // 'sales', 'bookings', 'orders', 'popular'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Report Data
  const [salesReport, setSalesReport] = useState(null);
  const [bookingsReport, setBookingsReport] = useState(null);
  const [ordersReport, setOrdersReport] = useState(null);
  const [popularReport, setPopularReport] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      if (reportType === 'sales') {
        const res = await reportService.getSalesReport(params);
        if (res.data.success) setSalesReport(res.data.data);
      } else if (reportType === 'bookings') {
        const res = await reportService.getBookingsReport(params);
        if (res.data.success) setBookingsReport(res.data);
      } else if (reportType === 'orders') {
        const res = await reportService.getOrdersReport(params);
        if (res.data.success) setOrdersReport(res.data);
      } else if (reportType === 'popular') {
        const res = await reportService.getPopularDishes();
        if (res.data.success) setPopularReport(res.data);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  // Export CSV Helper
  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) {
      toast.info('No data available to export.');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report downloaded successfully!');
  };

  const handleExport = () => {
    if (reportType === 'sales') {
      const rows = (salesReport?.dailySales || []).map((d) => ({
        Date: d._id,
        Total_Revenue: d.totalRevenue,
        Subtotal: d.subtotal,
        Tax_Amount: d.taxAmount,
        Discount: d.discountAmount,
        Orders_Count: d.orderCount,
      }));
      exportToCSV('Sales_Revenue_Report', rows);
    } else if (reportType === 'bookings') {
      const rows = (bookingsReport?.bookings || []).map((b) => ({
        Booking_ID: b.bookingId,
        Guest_Name: b.customerName,
        Table_Number: b.tableId?.tableNumber,
        Date: b.bookingDate,
        Time: b.startTime,
        Guests: b.numberOfGuests,
        Status: b.bookingStatus,
      }));
      exportToCSV('Table_Bookings_Report', rows);
    } else if (reportType === 'orders') {
      const rows = (ordersReport?.orders || []).map((o) => ({
        Order_ID: o.orderId,
        Table_Number: o.tableId?.tableNumber,
        Subtotal: o.subtotal,
        Status: o.orderStatus,
        Is_Billed: o.isBilled,
        Created_At: o.createdAt,
      }));
      exportToCSV('Kitchen_Orders_Report', rows);
    } else if (reportType === 'popular') {
      const rows = (popularReport?.popularItems || []).map((p) => ({
        Item_Name: p.itemName,
        Total_Units_Ordered: p.totalOrderedQty,
        Total_Sales_Revenue: p.totalRevenue,
        Distinct_Orders_Count: p.ordersCount,
      }));
      exportToCSV('Popular_Dishes_Report', rows);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Analytics & Operations Reports</h2>
          <small className="text-muted">Exportable management reports backed directly by MongoDB collections</small>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => window.print()} className="btn btn-outline-dark rounded-pill btn-sm">
            <i className="bi bi-printer me-1"></i> Print Report
          </button>
          <button onClick={handleExport} className="btn btn-success rounded-pill btn-sm fw-semibold">
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export to CSV
          </button>
        </div>
      </div>

      {/* Report Switcher & Date Range Form */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Select Report Type</label>
            <select
              className="form-select bg-light"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="sales">💰 Sales & Revenue Report</option>
              <option value="bookings">📅 Table Bookings Report</option>
              <option value="orders">🍳 Food Orders Report</option>
              <option value="popular">⭐ Most Popular Dishes</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold">Start Date</label>
            <input
              type="date"
              className="form-control bg-light"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold">End Date</label>
            <input
              type="date"
              className="form-control bg-light"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="btn btn-primary-custom w-100 rounded-pill fw-semibold"
            >
              {loading ? 'Filtering...' : 'Apply Date Filter'}
            </button>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="btn btn-outline-secondary rounded-pill"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REPORT CONTENT VIEWS */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
          <div className="mt-2 text-muted small">Generating live report...</div>
        </div>
      ) : (
        <>
          {/* 1. SALES REPORT */}
          {reportType === 'sales' && salesReport && (
            <div>
              {/* Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <small className="text-muted fw-bold text-uppercase">Total Period Revenue</small>
                    <h3 className="fw-bold mb-0 text-success mt-1">₹{salesReport.totalSalesAmount}</h3>
                    <small className="text-muted">Settled dining bills</small>
                  </div>
                </div>
              </div>

              {/* Revenue Charts */}
              <div className="row g-4 mb-4">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="brand-font fw-bold mb-3">Daily Sales Breakdown</h5>
                    {salesReport.dailySales?.length > 0 ? (
                      <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <BarChart data={salesReport.dailySales}>
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip formatter={(v) => `₹${v}`} />
                            <Bar dataKey="totalRevenue" fill="#641E16" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">No sales records in selected date range.</div>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="brand-font fw-bold mb-3">Revenue by Payment Method</h5>
                    {salesReport.revenueByMethod?.length > 0 ? (
                      <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={salesReport.revenueByMethod}
                              dataKey="totalAmount"
                              nameKey="_id"
                              cx="50%"
                              cy="50%"
                              outerRadius={75}
                              label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                            >
                              {salesReport.revenueByMethod.map((entry, index) => (
                                <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v) => `₹${v}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">No method breakdown.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Sales Table */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Date</th>
                        <th>Orders Count</th>
                        <th>Subtotal</th>
                        <th>Tax Collected</th>
                        <th>Discounts</th>
                        <th className="text-end pe-4">Net Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.dailySales?.map((d) => (
                        <tr key={d._id}>
                          <td className="ps-4 fw-bold">{d._id}</td>
                          <td>{d.orderCount} orders</td>
                          <td>₹{d.subtotal}</td>
                          <td>₹{d.taxAmount}</td>
                          <td className="text-success">-₹{d.discountAmount}</td>
                          <td className="text-end pe-4 fw-bold text-danger">₹{d.totalRevenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. BOOKINGS REPORT */}
          {reportType === 'bookings' && bookingsReport && (
            <div>
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex flex-wrap gap-4 align-items-center">
                  <div>
                    <small className="text-muted fw-bold">TOTAL BOOKINGS</small>
                    <h3 className="fw-bold mb-0 text-dark">{bookingsReport.count}</h3>
                  </div>
                  <div>
                    <small className="text-muted fw-bold">CONFIRMED</small>
                    <h4 className="fw-bold mb-0 text-success">{bookingsReport.statusCounts?.Confirmed || 0}</h4>
                  </div>
                  <div>
                    <small className="text-muted fw-bold">COMPLETED</small>
                    <h4 className="fw-bold mb-0 text-primary">{bookingsReport.statusCounts?.Completed || 0}</h4>
                  </div>
                  <div>
                    <small className="text-muted fw-bold">CANCELLED</small>
                    <h4 className="fw-bold mb-0 text-danger">{bookingsReport.statusCounts?.Cancelled || 0}</h4>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Booking Ref</th>
                        <th>Guest</th>
                        <th>Table</th>
                        <th>Date & Time</th>
                        <th>Guests</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsReport.bookings?.map((b) => (
                        <tr key={b._id}>
                          <td className="ps-4 font-monospace fw-bold">{b.bookingId}</td>
                          <td>{b.customerName}</td>
                          <td>Table {b.tableId?.tableNumber}</td>
                          <td>{b.bookingDate} {b.startTime}</td>
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
              </div>
            </div>
          )}

          {/* 3. ORDERS REPORT */}
          {reportType === 'orders' && ordersReport && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Order Ref</th>
                      <th>Table</th>
                      <th>Items Count</th>
                      <th>Subtotal</th>
                      <th>Status</th>
                      <th>Billed Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersReport.orders?.map((o) => (
                      <tr key={o._id}>
                        <td className="ps-4 font-monospace fw-bold">{o.orderId}</td>
                        <td>Table {o.tableId?.tableNumber || '-'}</td>
                        <td>{o.items?.length || 0} items</td>
                        <td className="fw-bold text-danger">₹{o.subtotal}</td>
                        <td><span className="badge bg-secondary text-uppercase">{o.orderStatus}</span></td>
                        <td>
                          <span className={`badge ${o.isBilled ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {o.isBilled ? 'Billed' : 'Unbilled'}
                          </span>
                        </td>
                        <td className="small text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. POPULAR DISHES REPORT */}
          {reportType === 'popular' && popularReport && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Rank</th>
                      <th>Dish Name</th>
                      <th>Units Ordered</th>
                      <th>Number of Orders</th>
                      <th className="text-end pe-4">Total Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularReport.popularItems?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="ps-4">
                          <span className="badge bg-danger rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="fw-bold">{it.itemName}</td>
                        <td>
                          <span className="badge bg-warning text-dark fw-bold fs-6">
                            {it.totalOrderedQty} Units
                          </span>
                        </td>
                        <td>{it.ordersCount} distinct orders</td>
                        <td className="text-end pe-4 fw-bold text-success fs-6">₹{it.totalRevenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;
