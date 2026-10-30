import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await menuService.getItems({ availableOnly: 'true' });
        if (res.data.success) {
          // Select top 6 items as featured
          setFeaturedItems(res.data.items.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    toast.success(`Added ${item.name} to order cart!`);
  };

  return (
    <div>
      {/* Hero Banner */}
      <section
        className="position-relative text-white py-5 d-flex align-items-center"
        style={{
          background: 'linear-gradient(rgba(100, 30, 22, 0.88), rgba(28, 7, 5, 0.95)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat',
          minHeight: '75vh',
        }}
      >
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge rounded-pill px-3 py-2 text-dark bg-warning mb-3 fw-bold">
                ⭐ Fine Dining & Heritage Gastronomy
              </span>
              <h1 className="display-4 fw-bold mb-3 brand-font text-white">
                Savor the Regal Flavors of <span style={{ color: 'var(--accent-color)' }}>Royal India</span>
              </h1>
              <p className="lead mb-4 text-light opacity-90" style={{ maxWidth: '600px', lineHeight: '1.8' }}>
                Step into a timeless culinary haven where centuries-old recipes meet modern table booking convenience. Experience slow-cooked biryanis, velvety curries, and tandoori charcoal specialties.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/book-table" className="btn btn-warning btn-lg rounded-pill px-4 fw-bold text-dark shadow">
                  <i className="bi bi-calendar-check me-2"></i> Reserve a Table
                </Link>
                <Link to="/menu" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold">
                  <i className="bi bi-book-half me-2"></i> Browse Menu
                </Link>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80"
                  alt="Royal Thali Feast"
                  className="img-fluid rounded-4 shadow-lg border border-warning border-2"
                  style={{ maxHeight: '420px', objectFit: 'cover', width: '100%' }}
                />
                <div
                  className="position-absolute bottom-0 start-0 translate-middle-y bg-white text-dark p-3 rounded-3 shadow-lg m-3"
                  style={{ maxWidth: '240px' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-3 text-warning">🏆</span>
                    <div>
                      <div className="fw-bold small">Authentic Recipes</div>
                      <small className="text-muted">Master Chef Curated</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features Bar */}
      <section className="py-4 bg-white border-bottom shadow-sm">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3 col-6">
              <i className="bi bi-qr-code-scan fs-1 text-danger"></i>
              <h6 className="fw-bold mt-2 mb-1">Instant QR Reservation</h6>
              <small className="text-muted">Digital table pass with real-time updates</small>
            </div>
            <div className="col-md-3 col-6">
              <i className="bi bi-fire fs-1 text-danger"></i>
              <h6 className="fw-bold mt-2 mb-1">Clay Oven Charcoal</h6>
              <small className="text-muted">Authentic tandoori bread & smoky kebabs</small>
            </div>
            <div className="col-md-3 col-6">
              <i className="bi bi-bag-check-fill fs-1 text-danger"></i>
              <h6 className="fw-bold mt-2 mb-1">Pre-order Dining</h6>
              <small className="text-muted">Order dishes in advance while booking</small>
            </div>
            <div className="col-md-3 col-6">
              <i className="bi bi-shield-check fs-1 text-danger"></i>
              <h6 className="fw-bold mt-2 mb-1">Seamless Billing</h6>
              <small className="text-muted">UPI, Card & Cash with printed receipts</small>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
            <div>
              <span className="text-warning fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>
                Chef's Recommendations
              </span>
              <h2 className="brand-font fw-bold mb-0">Popular Signature Dishes</h2>
            </div>
            <Link to="/menu" className="btn btn-outline-primary-custom rounded-pill mt-2 mt-sm-0">
              View Full Menu <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredItems.map((item) => (
                <div key={item._id} className="col-lg-4 col-md-6">
                  <div className="card h-100 custom-card border-0 overflow-hidden shadow-sm">
                    <div className="position-relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="card-img-top"
                        style={{ height: '210px', objectFit: 'cover' }}
                      />
                      <span className="position-absolute top-0 end-0 m-3 badge bg-white text-dark shadow-sm">
                        {item.isVeg ? (
                          <span className="text-success fw-bold">🟢 Pure Veg</span>
                        ) : (
                          <span className="text-danger fw-bold">🔴 Non-Veg</span>
                        )}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0 text-truncate">{item.name}</h5>
                        <span className="fw-bold text-danger fs-5">₹{item.price}</span>
                      </div>
                      <p className="card-text text-muted small flex-grow-1" style={{ minHeight: '40px' }}>
                        {item.description || 'Prepared fresh with heirloom Indian spices and clarified butter.'}
                      </p>
                      <div className="d-flex gap-2 mt-3 pt-2 border-top">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="btn btn-primary-custom w-100 rounded-pill btn-sm d-flex align-items-center justify-content-center gap-1"
                        >
                          <i className="bi bi-cart-plus"></i> Add to Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story & Heritage Section */}
      <section className="py-5" style={{ backgroundColor: 'var(--secondary-color)' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                alt="Culinary Preparation"
                className="img-fluid rounded-4 shadow"
              />
            </div>
            <div className="col-lg-6">
              <span className="text-uppercase fw-bold text-danger small" style={{ letterSpacing: '1px' }}>
                Our Heritage & Passion
              </span>
              <h2 className="brand-font fw-bold display-6 mb-3">A Royal Feast Crafted For Connoisseurs</h2>
              <p className="text-muted" style={{ lineHeight: '1.8' }}>
                At Royal Spice Haveli, we believe dining is an art form. Inspired by royal feasts of Awadh and Rajputana, every dish is slow-cooked in copper degchis, capturing natural aromas of green cardamom, saffron threads, and stone-ground spices.
              </p>
              <div className="row g-3 mt-2">
                <div className="col-sm-6">
                  <div className="p-3 bg-white rounded-3 shadow-sm border">
                    <h4 className="fw-bold text-danger mb-0">100%</h4>
                    <small className="text-muted">Fresh & Handcrafted Ingredients</small>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 bg-white rounded-3 shadow-sm border">
                    <h4 className="fw-bold text-danger mb-0">30+</h4>
                    <small className="text-muted">Heirloom Royal Recipes</small>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/about" className="btn btn-outline-primary-custom rounded-pill px-4">
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation CTA Box */}
      <section className="py-5">
        <div className="container">
          <div className="p-5 rounded-4 text-white text-center shadow-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
            <h2 className="brand-font display-6 fw-bold mb-3">Planning an Unforgettable Evening?</h2>
            <p className="lead text-light mb-4 mx-auto" style={{ maxWidth: '650px' }}>
              Whether it’s a family gathering, business lunch, or romantic dinner, reserve your preferred table in seconds and receive your unique booking QR code.
            </p>
            <Link to="/book-table" className="btn btn-warning btn-lg rounded-pill px-5 fw-bold text-dark shadow">
              <i className="bi bi-calendar-event me-2"></i> Book Your Table Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
