import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService, bookingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const BookTablePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 10);

  const [bookingDate, setBookingDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('19:00');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [includeCartOrder, setIncludeCartOrder] = useState(cart.length > 0);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone) setCustomerPhone(user.phone);
      if (!customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Fetch available tables whenever date, time or guests change
  useEffect(() => {
    const fetchAvailable = async () => {
      if (!bookingDate || !startTime || !numberOfGuests) return;
      setLoadingTables(true);
      setSelectedTable(null);

      try {
        const res = await tableService.getAvailableTables({
          date: bookingDate,
          time: startTime,
          guests: numberOfGuests,
          duration: 90,
        });

        if (res.data.success) {
          setAvailableTables(res.data.availableTables);
          if (res.data.availableTables.length > 0) {
            setSelectedTable(res.data.availableTables[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching available tables:', error);
        toast.error('Failed to check table availability');
      } finally {
        setLoadingTables(false);
      }
    };

    fetchAvailable();
  }, [bookingDate, startTime, numberOfGuests]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please log in or create an account to complete your table reservation.');
      navigate('/login', { state: { from: { pathname: '/book-table' } } });
      return;
    }

    if (!selectedTable) {
      toast.error('Please select an available table.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tableId: selectedTable._id,
        bookingDate,
        startTime,
        duration: 90,
        numberOfGuests: Number(numberOfGuests),
        specialRequests,
        customerName,
        customerPhone,
        customerEmail,
      };

      if (includeCartOrder && cart.length > 0) {
        payload.orderedItems = cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        }));
      }

      const res = await bookingService.createBooking(payload);

      if (res.data.success) {
        setConfirmedBooking(res.data.booking);
        if (includeCartOrder) {
          clearCart();
        }
        toast.success('Table reserved successfully! Your QR code is generated.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to complete booking. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Today min date string to prevent past date
  const todayStr = new Date().toISOString().slice(0, 10);

  // If confirmed, show confirmation view with QR code
  if (confirmedBooking) {
    const clientUrl = window.location.origin;
    const verifyUrl = `${clientUrl}/verify/${confirmedBooking.qrToken}`;

    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden text-center p-4 p-md-5 bg-white">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle-fill display-3"></i>
              </div>
              <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold mx-auto mb-2">
                RESERVATION CONFIRMED
              </span>
              <h2 className="brand-font fw-bold mb-1">Your Table is Reserved!</h2>
              <p className="text-muted small mb-4">
                We look forward to hosting you at Royal Spice Haveli. Show this QR code upon arrival.
              </p>

              {/* QR Code Card */}
              <div className="p-4 bg-light rounded-4 border d-inline-block mx-auto mb-4 shadow-sm">
                <QRCodeSVG
                  id="booking-qr-code"
                  value={verifyUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#641E16"
                />
                <div className="mt-2 text-muted font-monospace small">
                  Ref: {confirmedBooking.bookingId}
                </div>
              </div>

              {/* Booking Details Table */}
              <div className="text-start bg-light p-3 rounded-3 mb-4 small">
                <div className="row g-2">
                  <div className="col-6"><strong>Guest Name:</strong> {confirmedBooking.customerName}</div>
                  <div className="col-6"><strong>Table Number:</strong> {confirmedBooking.tableId?.tableNumber}</div>
                  <div className="col-6"><strong>Date:</strong> {confirmedBooking.bookingDate}</div>
                  <div className="col-6"><strong>Time:</strong> {confirmedBooking.startTime}</div>
                  <div className="col-6"><strong>Guests:</strong> {confirmedBooking.numberOfGuests} Persons</div>
                  <div className="col-6"><strong>Table Type:</strong> {confirmedBooking.tableId?.tableType}</div>
                </div>
                {confirmedBooking.specialRequests && (
                  <div className="mt-2 pt-2 border-top">
                    <strong>Special Requests:</strong> {confirmedBooking.specialRequests}
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  onClick={() => window.print()}
                  className="btn btn-outline-dark rounded-pill px-4"
                >
                  <i className="bi bi-printer me-1"></i> Print Confirmation
                </button>
                <button
                  onClick={() => navigate('/customer/bookings')}
                  className="btn btn-primary-custom rounded-pill px-4"
                >
                  <i className="bi bi-calendar-check me-1"></i> View in My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
            TABLE RESERVATION
          </span>
          <h1 className="brand-font display-5 fw-bold mb-3">Reserve Your Dining Experience</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Choose your preferred date, time and party size. Select from live available tables with instant digital confirmation.
          </p>
        </div>

        <form onSubmit={handleBookingSubmit}>
          <div className="row g-4">
            {/* Left Col: Reservation Details & Table Picker */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h4 className="brand-font fw-bold mb-3 pb-2 border-bottom">1. Select Date, Time & Guests</h4>

                <div className="row g-3">
                  {/* Date */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Reservation Date</label>
                    <input
                      type="date"
                      className="form-control"
                      min={todayStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Time */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Time Slot</label>
                    <select
                      className="form-select"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    >
                      <option value="12:00">12:00 PM (Lunch)</option>
                      <option value="12:30">12:30 PM (Lunch)</option>
                      <option value="13:00">01:00 PM (Lunch)</option>
                      <option value="13:30">01:30 PM (Lunch)</option>
                      <option value="14:00">02:00 PM (Lunch)</option>
                      <option value="19:00">07:00 PM (Dinner)</option>
                      <option value="19:30">07:30 PM (Dinner)</option>
                      <option value="20:00">08:00 PM (Dinner)</option>
                      <option value="20:30">08:30 PM (Dinner)</option>
                      <option value="21:00">09:00 PM (Dinner)</option>
                      <option value="21:30">09:30 PM (Dinner)</option>
                    </select>
                  </div>

                  {/* Guests */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Number of Guests</label>
                    <select
                      className="form-select"
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Available Tables Visual Board */}
                <h5 className="brand-font fw-bold mt-4 mb-2">2. Choose an Available Table</h5>
                <p className="text-muted small mb-3">
                  Tables that accommodate at least <strong>{numberOfGuests}</strong> guests and are free during this time:
                </p>

                {loadingTables ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-danger spinner-border-sm me-2"></div>
                    <span className="small text-muted">Checking real-time table availability...</span>
                  </div>
                ) : availableTables.length === 0 ? (
                  <div className="alert alert-warning py-3 small">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    No tables available for <strong>{numberOfGuests} guests</strong> on {bookingDate} at {startTime}. Please select a different time slot or date.
                  </div>
                ) : (
                  <div className="row g-2">
                    {availableTables.map((table) => {
                      const isSelected = selectedTable?._id === table._id;
                      return (
                        <div key={table._id} className="col-sm-4 col-6">
                          <div
                            onClick={() => setSelectedTable(table)}
                            className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-danger bg-danger-subtle shadow-sm'
                                : 'border-secondary-subtle bg-white hover-shadow'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="fw-bold fs-5 mb-1 text-danger">{table.tableNumber}</div>
                            <div className="small text-muted">
                              <i className="bi bi-people-fill me-1"></i> {table.capacity} Seats
                            </div>
                            <span className="badge bg-secondary-subtle text-dark small mt-1">
                              {table.tableType}
                            </span>
                            {isSelected && (
                              <div className="badge bg-danger text-white d-block mt-2">
                                <i className="bi bi-check2"></i> Selected
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="brand-font fw-bold mb-3">3. Special Requests (Optional)</h5>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="E.g., High chair required, birthday celebration, quiet corner preferred..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Right Col: Customer Info & Pre-order summary */}
            <div className="col-lg-5">
              {/* Contact Info Card */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h4 className="brand-font fw-bold mb-3 pb-2 border-bottom">Guest Contact Details</h4>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Optional Food Pre-Order Card */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <h5 className="brand-font fw-bold mb-0">Pre-Order Food</h5>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="preorderSwitch"
                      checked={includeCartOrder}
                      onChange={(e) => setIncludeCartOrder(e.target.checked)}
                      disabled={cart.length === 0}
                    />
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="small text-muted py-2">
                    <i className="bi bi-info-circle me-1"></i> Your food cart is currently empty. You can browse the{' '}
                    <a href="/menu" target="_blank" rel="noreferrer" className="text-danger fw-semibold">
                      Menu Page
                    </a>{' '}
                    to add items, or pre-order is optional.
                  </div>
                ) : (
                  <div>
                    <div className="small text-muted mb-2">
                      Include current cart items with this table reservation:
                    </div>
                    <ul className="list-group list-group-flush small mb-3">
                      {cart.map((item) => (
                        <li key={item.menuItemId} className="list-group-item d-flex justify-content-between px-0 py-2">
                          <span>
                            {item.quantity} &times; {item.name}
                          </span>
                          <span className="fw-semibold">₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="d-flex justify-content-between fw-bold pt-2 border-top">
                      <span>Pre-order Food Total:</span>
                      <span className="text-danger">₹{totalAmount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary & Submit Button */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="brand-font fw-bold mb-3">Booking Summary</h5>
                <div className="small mb-3">
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Date & Time:</span>
                    <span className="fw-semibold">{bookingDate} at {startTime}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Party Size:</span>
                    <span className="fw-semibold">{numberOfGuests} Guests</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Selected Table:</span>
                    <span className="fw-bold text-danger">
                      {selectedTable ? `${selectedTable.tableNumber} (${selectedTable.tableType})` : 'None selected'}
                    </span>
                  </div>
                </div>

                <div className="alert alert-light border small text-muted mb-4">
                  <i className="bi bi-shield-check text-success me-1"></i>
                  <strong>Cancellation Policy:</strong> Free cancellation up to 30 minutes before booking start time.
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedTable}
                  className="btn btn-primary-custom w-100 py-3 rounded-pill fw-bold fs-6 shadow"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Reserving Table...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-check me-2"></i> Confirm Reservation & Get QR Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookTablePage;
