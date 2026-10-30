import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qrService } from '../../services/api';

const QrVerificationPage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await qrService.verifyToken(token);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('QR verification error:', err);
        setError(err.response?.data?.message || 'Invalid or expired QR verification token.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="fs-1">🍛</span>
              <h3 className="brand-font fw-bold mt-2 mb-1">Royal Spice Haveli</h3>
              <p className="text-muted small">Reservation & Table Verification System</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status"></div>
                <div className="mt-2 text-muted small">Verifying cryptographic QR pass...</div>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <div className="text-danger display-4 mb-3">
                  <i className="bi bi-x-circle-fill"></i>
                </div>
                <h4 className="fw-bold text-danger">Verification Failed</h4>
                <p className="text-muted small mb-4">{error}</p>
                <Link to="/" className="btn btn-outline-dark rounded-pill px-4">
                  Return to Home
                </Link>
              </div>
            ) : data ? (
              <div>
                <div className="text-center mb-4">
                  <span className="badge bg-success-subtle text-success px-4 py-2 rounded-pill fw-bold fs-6">
                    <i className="bi bi-patch-check-fill me-1"></i> VERIFIED RESERVATION
                  </span>
                  <h4 className="fw-bold mt-3 text-dark">{data.booking.bookingId}</h4>
                  <div className="text-muted small">
                    Created on {new Date(data.booking.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-light p-4 rounded-4 border mb-4">
                  <h6 className="fw-bold border-bottom pb-2 mb-3 text-danger">
                    <i className="bi bi-info-circle me-1"></i> Booking & Table Details
                  </h6>
                  <div className="row g-2 small">
                    <div className="col-6"><strong>Customer Name:</strong> {data.booking.customerName}</div>
                    <div className="col-6"><strong>Phone:</strong> {data.booking.customerPhone}</div>
                    <div className="col-6"><strong>Assigned Table:</strong> Table {data.booking.tableNumber}</div>
                    <div className="col-6"><strong>Table Type:</strong> {data.booking.tableType}</div>
                    <div className="col-6"><strong>Date:</strong> {data.booking.bookingDate}</div>
                    <div className="col-6"><strong>Time:</strong> {data.booking.startTime}</div>
                    <div className="col-6"><strong>Party Size:</strong> {data.booking.numberOfGuests} Guests</div>
                    <div className="col-6">
                      <strong>Booking Status:</strong>{' '}
                      <span className="badge bg-success">{data.booking.bookingStatus}</span>
                    </div>
                  </div>
                  {data.booking.specialRequests && (
                    <div className="mt-3 pt-2 border-top small">
                      <strong>Special Requests:</strong> {data.booking.specialRequests}
                    </div>
                  )}
                </div>

                {/* Associated Orders if any */}
                {data.orders && data.orders.length > 0 && (
                  <div className="bg-light p-4 rounded-4 border mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3 text-danger">
                      <i className="bi bi-basket me-1"></i> Pre-Ordered Dishes
                    </h6>
                    {data.orders.map((ord) => (
                      <div key={ord._id} className="mb-3">
                        <div className="d-flex justify-content-between small text-muted mb-2">
                          <span>Order: <strong>{ord.orderId}</strong></span>
                          <span className="badge bg-dark">{ord.orderStatus}</span>
                        </div>
                        <ul className="list-unstyled small mb-2">
                          {ord.items.map((it, idx) => (
                            <li key={idx} className="d-flex justify-content-between py-1 border-bottom">
                              <span>{it.quantity} &times; {it.itemName}</span>
                              <span className="fw-semibold">₹{it.subtotal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Billing and Payment status */}
                {data.bill && (
                  <div className="p-3 bg-white border border-2 rounded-3 text-center mb-4">
                    <div className="small text-muted mb-1">Billing Summary</div>
                    <div className="fs-5 fw-bold text-danger">Total: ₹{data.bill.grandTotal}</div>
                    <div className="mt-2">
                      <span
                        className={`badge ${data.bill.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'} px-3 py-1 fs-6`}
                      >
                        Payment: {data.bill.paymentStatus}
                      </span>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-center gap-2">
                  <button onClick={() => window.print()} className="btn btn-outline-dark rounded-pill px-4">
                    <i className="bi bi-printer me-1"></i> Print Verification Pass
                  </button>
                  <Link to="/" className="btn btn-primary-custom rounded-pill px-4">
                    Home
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrVerificationPage;
