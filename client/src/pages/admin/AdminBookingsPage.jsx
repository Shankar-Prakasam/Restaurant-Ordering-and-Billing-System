import React, { useState, useEffect } from 'react';
import { bookingService, tableService } from '../../services/api';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected for QR
  const [selectedQrBooking, setSelectedQrBooking] = useState(null);

  // Edit / Reassign table modal
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    tableId: '',
    bookingStatus: '',
    numberOfGuests: '',
    specialRequests: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await bookingService.getBookings(params);
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await tableService.getTables();
      if (res.data.success) {
        setTables(res.data.tables);
      }
    } catch (e) {
      console.error('Error loading tables:', e);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 250);
    return () => clearTimeout(timer);
  }, [dateFilter, statusFilter, search]);

  const handleOpenEdit = (b) => {
    setEditingBooking(b);
    setEditFormData({
      tableId: b.tableId?._id || b.tableId || '',
      bookingStatus: b.bookingStatus,
      numberOfGuests: b.numberOfGuests,
      specialRequests: b.specialRequests || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await bookingService.updateBooking(editingBooking._id, editFormData);
      if (res.data.success) {
        toast.success('Booking updated successfully!');
        setEditingBooking(null);
        fetchBookings();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelBooking = async (id, bookingRef) => {
    const reason = window.prompt(`Provide cancellation reason for ${bookingRef}:`, 'Cancelled by admin');
    if (reason === null) return;

    try {
      const res = await bookingService.cancelBooking(id, { cancellationReason: reason });
      if (res.data.success) {
        toast.success(`Booking ${bookingRef} cancelled. Table released.`);
        fetchBookings();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Cancellation rejected.';
      toast.error(msg);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Customer Table Reservations</h2>
          <small className="text-muted">Master log of table bookings, arrival verification QR codes and reassignments</small>
        </div>
        <a href="/book-table" target="_blank" rel="noreferrer" className="btn btn-primary-custom rounded-pill">
          <i className="bi bi-plus-lg me-1"></i> Create Booking
        </a>
      </div>

      {/* Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control bg-light"
              placeholder="Search reference, guest name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control bg-light"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Booking Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end">
            {(dateFilter || statusFilter !== 'all' || search) && (
              <button
                onClick={() => {
                  setDateFilter('');
                  setStatusFilter('all');
                  setSearch('');
                }}
                className="btn btn-outline-secondary btn-sm rounded-pill"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Booking Ref</th>
                <th>Guest Details</th>
                <th>Table</th>
                <th>Date & Time</th>
                <th>Party Size</th>
                <th>Status</th>
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
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No reservations found matching current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  let badge = 'bg-secondary';
                  if (b.bookingStatus === 'Confirmed') badge = 'bg-success';
                  if (b.bookingStatus === 'Completed') badge = 'bg-primary';
                  if (b.bookingStatus === 'Cancelled') badge = 'bg-danger';

                  return (
                    <tr key={b._id}>
                      <td className="ps-4">
                        <span className="font-monospace fw-bold text-dark">{b.bookingId}</span>
                        <small className="text-muted d-block">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="fw-bold">{b.customerName}</div>
                        <small className="text-muted">{b.customerPhone}</small>
                      </td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger fs-6 fw-bold border border-danger-subtle">
                          {b.tableId?.tableNumber || 'T-??'}
                        </span>
                        <small className="text-muted d-block">{b.tableId?.tableType}</small>
                      </td>
                      <td>
                        <div className="fw-semibold">{b.bookingDate}</div>
                        <small className="text-muted">{b.startTime} ({b.duration || 90}m)</small>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-dark">
                          {b.numberOfGuests} Guests
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${badge} text-uppercase px-2 py-1`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          onClick={() => setSelectedQrBooking(b)}
                          className="btn btn-sm btn-outline-dark rounded-circle p-1 me-1"
                          title="View QR Token Pass"
                        >
                          <i className="bi bi-qr-code"></i>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="btn btn-sm btn-outline-primary rounded-circle p-1 me-1"
                          title="Edit / Reassign Table"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {b.bookingStatus !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(b._id, b.bookingId)}
                            className="btn btn-sm btn-outline-danger rounded-circle p-1"
                            title="Cancel Booking"
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

      {/* QR Code Modal */}
      {selectedQrBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 text-center">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">Reservation QR Code</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedQrBooking(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="p-3 bg-light rounded-4 d-inline-block border shadow-sm mb-3">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${selectedQrBooking.qrToken}`}
                    size={220}
                    level="H"
                    includeMargin={true}
                    fgColor="#641E16"
                  />
                </div>
                <div className="fw-bold fs-5 text-danger">{selectedQrBooking.bookingId}</div>
                <div className="text-muted small">
                  Guest: <strong>{selectedQrBooking.customerName}</strong> ({selectedQrBooking.customerPhone})
                </div>
                <div className="text-muted small">
                  Table {selectedQrBooking.tableId?.tableNumber} &bull; {selectedQrBooking.bookingDate} at {selectedQrBooking.startTime}
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button onClick={() => window.print()} className="btn btn-outline-dark rounded-pill px-4">
                  <i className="bi bi-printer me-1"></i> Print Pass
                </button>
                <button onClick={() => setSelectedQrBooking(null)} className="btn btn-secondary rounded-pill px-4">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">
                  Modify Booking: {editingBooking.bookingId}
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditingBooking(null)}></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Assigned Table *</label>
                    <select
                      className="form-select"
                      value={editFormData.tableId}
                      onChange={(e) => setEditFormData({ ...editFormData, tableId: e.target.value })}
                      required
                    >
                      {tables.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.tableNumber} ({t.tableType} &bull; Cap {t.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Status *</label>
                      <select
                        className="form-select"
                        value={editFormData.bookingStatus}
                        onChange={(e) => setEditFormData({ ...editFormData, bookingStatus: e.target.value })}
                        required
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Guests *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={editFormData.numberOfGuests}
                        onChange={(e) => setEditFormData({ ...editFormData, numberOfGuests: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Special Requests</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editFormData.specialRequests}
                      onChange={(e) => setEditFormData({ ...editFormData, specialRequests: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setEditingBooking(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={savingEdit} className="btn btn-primary-custom rounded-pill px-4">
                    {savingEdit ? 'Saving...' : 'Save Updates'}
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

export default AdminBookingsPage;
