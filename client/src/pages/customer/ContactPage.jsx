import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Thank you for contacting us! Our guest relations team will respond promptly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div>
      <div
        className="py-5 text-white text-center position-relative"
        style={{
          background: 'linear-gradient(rgba(100, 30, 22, 0.9), rgba(28, 7, 5, 0.95)), url("https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80") center/cover',
        }}
      >
        <div className="container py-4">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
            CONNECT WITH US
          </span>
          <h1 className="brand-font display-4 fw-bold">Contact & Location</h1>
          <p className="lead text-light opacity-90 mx-auto" style={{ maxWidth: '650px' }}>
            We are here to assist with banquet inquiries, catering, private celebrations, or table assistance.
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          {/* Contact Details */}
          <div className="col-lg-5">
            <h3 className="brand-font fw-bold mb-4">Restaurant Information</h3>

            <div className="d-flex align-items-start gap-3 mb-4">
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <i className="bi bi-geo-alt-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Our Location</h6>
                <p className="text-muted small mb-0">
                  Heritage Square, Palace Road, Connaught Place, New Delhi 110001
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-4">
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <i className="bi bi-telephone-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Phone Enquiries</h6>
                <p className="text-muted small mb-0">
                  +91 98765 43210 (Reservations)<br />
                  +91 11 2345 6789 (Banquets)
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-4">
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <i className="bi bi-envelope-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Email Address</h6>
                <p className="text-muted small mb-0">
                  reservations@royalspicehaveli.com<br />
                  support@royalspicehaveli.com
                </p>
              </div>
            </div>

            <div className="p-4 bg-light rounded-4 border">
              <h6 className="fw-bold mb-2 text-danger">Table Reservation Note</h6>
              <p className="small text-muted mb-0">
                For instant booking with live table confirmation and QR token, please use our{' '}
                <a href="/book-table" className="text-danger fw-semibold">Table Reservation Module</a>.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <h3 className="brand-font fw-bold mb-3">Send us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Your Message or Inquiry</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary-custom rounded-pill px-4 py-2 fw-semibold">
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
