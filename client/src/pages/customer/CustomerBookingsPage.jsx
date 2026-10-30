import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/api';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const CustomerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForQr, setSelectedBookingForQr] = useState(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookings();
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Helper to compute minutes remaining to start time for the 30-min rule
  const getMinutesRemaining = (bookingDate, startTime) => {
    try {
      const now = new Date();
      const [year, month, day] = bookingDate.split('-').map(Number);
      const [hour, minute] = startTime.split(':').map(Number);
      const bookingDateTime = new Date(year, month - 1, day, hour, minute);
      return Math.round((bookingDateTime.getTime() - now.getTime()) / (1000 * 60));
    } catch (e) {
      return 0;
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;

    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(selectedBookingForCancel._id, {
        cancellationReason: cancelReason || 'Cancelled by customer',
      });
      if (res.data.success) {
        toast.success('Booking cancelled successfully.');
        setSelectedBookingForCancel(null);
        setCancelReason('');
        fetchBookings();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Cancellation rejected.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="brand-font fw-bold mb-1">My Reservations & QR Passes</h3>
          <p className="text-muted small mb-0">View your active table reservations and access your digital QR codes.</p>
        </div>
        <a href="/book-table" className="btn btn-primary-custom btn-sm rounded-pill">
          <i className="bi bi-plus-circle me-1"></i> Reserve Table
        </a>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-calendar-x display-3 text-muted"></i>
          <h4 className="mt-3 brand-font">No Reservations Found</h4>
          <p className="text-muted small mb-4">You have not booked any tables yet.</p>
          <a href="/book-table" className="btn btn-primary-custom rounded-pill px-4 mx-auto">
            Book Your First Table
          </a>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => {
            const minutesLeft = getMinutesRemaining(booking.bookingDate, booking.startTime);
            const canCancel = booking.bookingStatus === 'Confirmed' && minutesLeft > 30;

            let badgeClass = 'bg-secondary';
            if (booking.bookingStatus === 'Confirmed') badgeClass = 'bg-success';
            if (booking.bookingStatus === 'Completed') badgeClass = 'bg-primary';
            if (booking.bookingStatus === 'Cancelled') badgeClass = 'bg-danger';

            return (
              <div key={booking._id} className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="text-muted font-monospace small d-block">{booking.bookingId}</span>
                      <h5 className="fw-bold mb-0">Table {booking.tableId?.tableNumber || 'Assigned'}</h5>
                      <small className="text-muted">{booking.tableId?.tableType} &bull; Capacity {booking.tableId?.capacity} Seats</small>
                    </div>
                    <span className={`badge ${badgeClass} text-uppercase px-3 py-2 rounded-pill`}>
                      {booking.bookingStatus}
                    </span>
                  </div>

                  <div className="bg-light p-3 rounded-3 small mb-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <i className="bi bi-calendar3 me-1 text-danger"></i> <strong>Date:</strong> {booking.bookingDate}
                      </div>
                      <div className="col-6">
                        <i className="bi bi-clock me-1 text-danger"></i> <strong>Time:</strong> {booking.startTime}
                      </div>
                      <div className="col-6">
                        <i className="bi bi-people me-1 text-danger"></i> <strong>Guests:</strong> {booking.numberOfGuests} Persons
                      </div>
                      <div className="col-6">
                        <i className="bi bi-hourglass-split me-1 text-danger"></i> <strong>Duration:</strong> {booking.duration || 90} Mins
                      </div>
                    </div>
                    {booking.specialRequests && (
                      <div className="mt-2 pt-2 border-top">
                        <strong>Requests:</strong> {booking.specialRequests}
                      </div>
                    )}
                    {booking.bookingStatus === 'Cancelled' && (
                      <div className="mt-2 pt-2 border-top text-danger">
                        <strong>Reason:</strong> {booking.cancellationReason || 'Cancelled'}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mt-auto pt-2 border-top">
                    <button
                      onClick={() => setSelectedBookingForQr(booking)}
                      className="btn btn-outline-dark btn-sm rounded-pill d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-qr-code"></i> Show QR Pass
                    </button>

                    {booking.bookingStatus === 'Confirmed' && (
                      canCancel ? (
                        <button
                          onClick={() => setSelectedBookingForCancel(booking)}
                          className="btn btn-outline-danger btn-sm rounded-pill"
                        >
                          <i className="bi bi-x-circle me-1"></i> Cancel Booking
                        </button>
                      ) : (
                        <span className="badge bg-warning text-dark py-2 px-2 small" title="Cancellation locked within 30 mins">
                          <i className="bi bi-lock-fill me-1"></i> Cancellation Locked (&le;30m)
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedBookingForQr && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 text-center">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">Booking QR Pass</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedBookingForQr(null)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <div className="p-3 bg-light rounded-4 d-inline-block border shadow-sm mb-3">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${selectedBookingForQr.qrToken}`}
                    size={220}
                    level="H"
                    includeMargin={true}
                    fgColor="#641E16"
                  />
                </div>
                <div className="fw-bold fs-5 text-danger">{selectedBookingForQr.bookingId}</div>
                <div className="text-muted small">
                  Table {selectedBookingForQr.tableId?.tableNumber} &bull; {selectedBookingForQr.bookingDate} at {selectedBookingForQr.startTime}
                </div>
                <p className="text-muted small mt-2">
                  Staff can scan this QR code on arrival to confirm your table, orders, and billing.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button
                  onClick={() => window.print()}
                  className="btn btn-outline-secondary rounded-pill px-4"
                >
                  <i className="bi bi-printer me-1"></i> Print Pass
                </button>
                <button
                  onClick={() => setSelectedBookingForQr(null)}
                  className="btn btn-dark rounded-pill px-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {selectedBookingForCancel && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">Cancel Table Reservation?</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedBookingForCancel(null)}
                ></button>
              </div>
              <div className="modal-body py-3">
                <p className="small text-muted mb-3">
                  Are you sure you want to cancel reservation <strong>{selectedBookingForCancel.bookingId}</strong> for Table {selectedBookingForCancel.tableId?.tableNumber}? The table will be immediately released for other diners.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Reason for Cancellation (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E.g., Change in schedule, family emergency"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setSelectedBookingForCancel(null)}
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  className="btn btn-danger rounded-pill px-4 fw-semibold"
                  onClick={handleCancelBooking}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookingsPage;
