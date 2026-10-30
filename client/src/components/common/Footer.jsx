import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="pt-5 pb-3 border-top mt-auto" style={{ backgroundColor: '#1c0705', color: '#f5ebe6' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Col 1: About */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: '2rem' }}>🍛</span>
              <div>
                <h4 className="brand-font text-white mb-0">Royal Spice Haveli</h4>
                <small style={{ color: 'var(--accent-color)' }}>ESTD. 2018 &bull; FINE DINING</small>
              </div>
            </div>
            <p className="small text-secondary" style={{ lineHeight: '1.7' }}>
              Experience authentic Indian gastronomy, tandoori delicacies, and royal court recipes curated with pure saffron, cold-pressed ghee, and secret heirloom spices.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#instagram" className="btn btn-outline-warning btn-sm rounded-circle p-2" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#facebook" className="btn btn-outline-warning btn-sm rounded-circle p-2" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#twitter" className="btn btn-outline-warning btn-sm rounded-circle p-2" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#tripadvisor" className="btn btn-outline-warning btn-sm rounded-circle p-2" aria-label="Tripadvisor">
                <i className="bi bi-star-fill"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="text-warning brand-font mb-3">Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/" className="text-decoration-none text-light opacity-75 hover-opacity-100">Home</Link></li>
              <li><Link to="/menu" className="text-decoration-none text-light opacity-75 hover-opacity-100">Food Menu</Link></li>
              <li><Link to="/book-table" className="text-decoration-none text-light opacity-75 hover-opacity-100">Reserve a Table</Link></li>
              <li><Link to="/about" className="text-decoration-none text-light opacity-75 hover-opacity-100">Our Heritage</Link></li>
              <li><Link to="/contact" className="text-decoration-none text-light opacity-75 hover-opacity-100">Contact & Location</Link></li>
            </ul>
          </div>

          {/* Col 3: Hours */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-warning brand-font mb-3">Opening Hours</h5>
            <div className="small text-secondary">
              <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                <span>Monday – Thursday:</span>
                <span className="text-light">12:00 PM – 10:30 PM</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                <span>Friday – Saturday:</span>
                <span className="text-light">12:00 PM – 11:30 PM</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                <span>Sunday (Royal Buffet):</span>
                <span className="text-light">11:30 AM – 11:00 PM</span>
              </div>
            </div>
            <div className="mt-3 p-2 rounded bg-dark border border-secondary border-opacity-25 small text-center">
              <span className="text-warning">Table Booking:</span> Instant QR Confirmation
            </div>
          </div>

          {/* Col 4: Contact */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-warning brand-font mb-3">Get in Touch</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
              <li className="d-flex gap-2">
                <i className="bi bi-geo-alt-fill text-warning"></i>
                <span>Heritage Square, Palace Road, Connaught Place, New Delhi 110001</span>
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-telephone-fill text-warning"></i>
                <span>+91 98765 43210 / +91 11 2345 6789</span>
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-envelope-fill text-warning"></i>
                <span>reservations@royalspicehaveli.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-top border-dark pt-3 text-center small text-secondary">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Royal Spice Haveli. Built for SEAP Academic Project Demonstration. Fully functional with MongoDB, Express & React.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
