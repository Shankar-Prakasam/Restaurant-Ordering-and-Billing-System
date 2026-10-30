import React, { useState, useEffect } from 'react';
import { bookingService, tableService } from '../../services/api';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const StaffBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedQrBooking, setSelectedQrBooking] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // New Booking on behalf of customer form
  const [newBookingData, setNewBookingData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tableId: '',
    bookingDate: new Date().toISOString().slice(0, 10),
    startTime: '19:00',
    duration: 90,
    numberOfGuests: 2,
    specialRequests: '',
  });
  const [creating, setCreating] = useState(false);

  // Edit / Reassign table form
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
        if (res.data.tables.length > 0) {
          setNewBookingData((prev) => ({ ...prev, tableId: res.data.tables[0]._id }));
        }
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

  const handleCreateOnBehalf = async (e) => {
    e.preventDefault();
    if (!newBookingData.customerName || !newBookingData.customerPhone || !newBookingData.tableId) {
      toast.error('Please fill in guest name, phone, and table.');
      return;
    }

    setCreating(true);
    try {
      const res = await bookingService.createBooking(newBookingData);
      if (res.data.success) {
        toast.success(`Walk-in reservation created: ${res.data.booking.bookingId}`);
        setShowCreateModal(false);
        fetchBookings();
        setSelectedQrBooking(res.data.booking);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create booking';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

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
        toast.success('Reservation updated successfully');
        setEditingBooking(null);
        fetchBookings();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update booking';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelBooking = async (id, bookingRef) => {
    const reason = window.prompt(`Reason for cancellation of ${bookingRef}:`, 'Cancelled by staff');
    if (reason === null) return;

    try {
      const res = await bookingService.cancelBooking(id, { cancellationReason: reason });
      if (res.data.success) {
        toast.success(`Booking ${bookingRef} cancelled.`);
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
          <h2 className="brand-font fw-bold mb-0">Floor Reservations Desk</h2>
          <small className="text-muted">Manage guest bookings, seat walk-ins, scan QR passes and assign tables</small>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary-custom rounded-pill">
          <i className="bi bi-person-plus-fill me-1"></i> Book on Behalf of Guest
        </button>
      </div>

      {/* Filter and Search Bar */}
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
            <button
              onClick={() => {
                setDateFilter(new Date().toISOString().slice(0, 10));
              }}
              className="btn btn-outline-danger btn-sm rounded-pill"
            >
              Today Only
            </button>
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
                <th>Guest</th>
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
                    No reservations found for current criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="ps-4">
                      <span className="font-monospace fw-bold">{b.bookingId}</span>
                      <small className="text-muted d-block">{new Date(b.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <div className="fw-bold">{b.customerName}</div>
                      <small className="text-muted">{b.customerPhone}</small>
                    </td>
                    <td>
                      <span className="badge bg-danger-subtle text-danger fs-6 fw-bold border">
                        {b.tableId?.tableNumber || '-'}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold">{b.bookingDate}</div>
                      <small className="text-muted">{b.startTime}</small>
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
                        } text-uppercase px-2 py-1`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        onClick={() => setSelectedQrBooking(b)}
                        className="btn btn-sm btn-outline-dark rounded-circle p-1 me-1"
                        title="Show QR Code"
                      >
                        <i className="bi bi-qr-code"></i>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="btn btn-sm btn-outline-primary rounded-circle p-1 me-1"
                        title="Reassign Table / Status"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create On Behalf Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">Seat Walk-In / Phone Booking</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOnBehalf}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Customer Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newBookingData.customerName}
                      onChange={(e) => setNewBookingData({ ...newBookingData, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newBookingData.customerPhone}
                        onChange={(e) => setNewBookingData({ ...newBookingData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="guest@example.com"
                        value={newBookingData.customerEmail}
                        onChange={(e) => setNewBookingData({ ...newBookingData, customerEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Reservation Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newBookingData.bookingDate}
                        onChange={(e) => setNewBookingData({ ...newBookingData, bookingDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Time Slot *</label>
                      <select
                        className="form-select"
                        value={newBookingData.startTime}
                        onChange={(e) => setNewBookingData({ ...newBookingData, startTime: e.target.value })}
                        required
                      >
                        <option value="12:00">12:00 PM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="13:30">01:30 PM</option>
                        <option value="19:00">07:00 PM</option>
                        <option value="19:30">07:30 PM</option>
                        <option value="20:00">08:00 PM</option>
                        <option value="20:30">08:30 PM</option>
                        <option value="21:00">09:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Number of Guests *</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="form-control"
                        value={newBookingData.numberOfGuests}
                        onChange={(e) => setNewBookingData({ ...newBookingData, numberOfGuests: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Select Table *</label>
                      <select
                        className="form-select"
                        value={newBookingData.tableId}
                        onChange={(e) => setNewBookingData({ ...newBookingData, tableId: e.target.value })}
                        required
                      >
                        {tables.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.tableNumber} (Cap {t.capacity} &bull; {t.tableType})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Special Requests</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="E.g., Window seat, anniversary"
                      value={newBookingData.specialRequests}
                      onChange={(e) => setNewBookingData({ ...newBookingData, specialRequests: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="btn btn-primary-custom rounded-pill px-4">
                    {creating ? 'Reserving...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

export default StaffBookingsPage;
