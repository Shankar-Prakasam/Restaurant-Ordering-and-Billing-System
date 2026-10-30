import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div>
      {/* Banner */}
      <div
        className="py-5 text-white text-center position-relative"
        style={{
          background: 'linear-gradient(rgba(100, 30, 22, 0.9), rgba(28, 7, 5, 0.95)), url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80") center/cover',
        }}
      >
        <div className="container py-4">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
            OUR HERITAGE & PHILOSOPHY
          </span>
          <h1 className="brand-font display-4 fw-bold">About Royal Spice Haveli</h1>
          <p className="lead text-light opacity-90 mx-auto" style={{ maxWidth: '650px' }}>
            A culinary sanctuary established to preserve and celebrate India’s regal gastronomic traditions.
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <h2 className="brand-font fw-bold mb-3">Centuries of Spice Artistry, Reimagined</h2>
            <p className="text-muted" style={{ lineHeight: '1.8' }}>
              At Royal Spice Haveli, cooking is treated as an ancient ceremonial craft. Our chefs source whole hand-picked spices from organic spice gardens across Kerala, Kashmir, and Rajasthan. We stone-grind our masalas daily to ensure the natural essential oils and floral aromas remain vibrant.
            </p>
            <p className="text-muted" style={{ lineHeight: '1.8' }}>
              From charcoal-smoked paneer skewers to slow-simmered Awadhi dum biryanis sealed with whole wheat dough, every dish pays homage to historical culinary manuscripts.
            </p>
            <div className="d-flex gap-3 mt-4">
              <div className="border-start border-danger border-4 ps-3">
                <h4 className="fw-bold mb-0">100% Clarified Desi Ghee</h4>
                <small className="text-muted">Used in all authentic royal gravies and breads</small>
              </div>
              <div className="border-start border-warning border-4 ps-3">
                <h4 className="fw-bold mb-0">Zero Preservatives</h4>
                <small className="text-muted">Fresh local produce and ethically sourced ingredients</small>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80"
              alt="Restaurant Ambience"
              className="img-fluid rounded-4 shadow-lg border"
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="row g-4 text-center mt-3">
          <div className="col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border">
              <i className="bi bi-heart-fill fs-1 text-danger"></i>
              <h5 className="brand-font fw-bold mt-3 mb-2">Hospitality with Heart (Atithi Devo Bhava)</h5>
              <p className="small text-muted mb-0">
                In our tradition, guests are treated as divine. We pride ourselves on gracious, attentive, and personalized service.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border">
              <i className="bi bi-award-fill fs-1 text-warning"></i>
              <h5 className="brand-font fw-bold mt-3 mb-2">Culinary Precision</h5>
              <p className="small text-muted mb-0">
                Every marinade, sauce reduction, and tandoori skewer is measured with exacting time and temperature discipline.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border">
              <i className="bi bi-qr-code fs-1 text-danger"></i>
              <h5 className="brand-font fw-bold mt-3 mb-2">Modern Dining Technology</h5>
              <p className="small text-muted mb-0">
                Seamless digital table bookings with QR codes, real-time table status tracking, and transparent bills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
