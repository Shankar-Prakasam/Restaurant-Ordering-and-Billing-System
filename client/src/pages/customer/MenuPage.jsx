import React, { useState, useEffect } from 'react';
import { menuService, categoryService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vegFilter, setVegFilter] = useState(''); // '', 'true', 'false'
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch menu items with filters
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const params = {
          availableOnly: 'true',
        };
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (vegFilter) params.isVeg = vegFilter;
        if (sortBy) params.sort = sortBy;

        const res = await menuService.getItems(params);
        if (res.data.success) {
          setItems(res.data.items);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchMenu();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchTerm, vegFilter, sortBy]);

  const handleAdd = (item) => {
    addToCart(item, 1);
    toast.success(`Added ${item.name} to cart!`, { autoClose: 1800 });
  };

  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
            ROYAL KITCHEN MENU
          </span>
          <h1 className="brand-font display-5 fw-bold mb-3">Our Culinary Delicacies</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Browse through our authentic royal preparations. Add your favorites to cart to pre-order with your table reservation or order directly.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-lg-4 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by dish name or ingredient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-light border" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Veg / Non-Veg filter */}
            <div className="col-lg-3 col-md-6">
              <select
                className="form-select bg-light"
                value={vegFilter}
                onChange={(e) => setVegFilter(e.target.value)}
              >
                <option value="">Dietary: All Dietary Types</option>
                <option value="true">🟢 Pure Vegetarian</option>
                <option value="false">🔴 Non-Vegetarian</option>
              </select>
            </div>

            {/* Price sort */}
            <div className="col-lg-3 col-md-6">
              <select
                className="form-select bg-light"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Item count */}
            <div className="col-lg-2 col-md-6 text-lg-end text-muted small">
              Found: <strong className="text-dark">{items.length}</strong> items
            </div>
          </div>

          {/* Category Pills */}
          <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                selectedCategory === 'all' ? 'btn-primary-custom' : 'btn-outline-secondary'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  selectedCategory === cat._id ? 'btn-primary-custom' : 'btn-outline-secondary'
                }`}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading menu...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm my-4">
            <i className="bi bi-emoji-neutral fs-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No dishes matched your filters</h4>
            <p className="small text-muted">Try clearing the search query or changing category.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setVegFilter('');
                setSortBy('');
              }}
              className="btn btn-outline-primary-custom btn-sm rounded-pill mt-2"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {items.map((item) => (
              <div key={item._id} className="col-lg-4 col-md-6">
                <div className="card h-100 custom-card border-0 overflow-hidden shadow-sm d-flex flex-column">
                  <div className="position-relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="card-img-top"
                      style={{ height: '220px', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div className="position-absolute top-0 start-0 m-3">
                      <span className="badge bg-dark bg-opacity-75 text-white">
                        {item.categoryId?.categoryName || 'Special'}
                      </span>
                    </div>
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-white shadow-sm">
                        {item.isVeg ? (
                          <span className="text-success fw-bold">🟢 Pure Veg</span>
                        ) : (
                          <span className="text-danger fw-bold">🔴 Non-Veg</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                      <h5 className="card-title fw-bold mb-0 text-truncate">{item.name}</h5>
                      <span className="fs-5 fw-bold text-danger ms-2">₹{item.price}</span>
                    </div>

                    <p className="card-text text-muted small flex-grow-1" style={{ minHeight: '40px' }}>
                      {item.description || 'Crafted with authentic spices and royal recipes.'}
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        <i className="bi bi-check-circle-fill me-1"></i> Available
                      </span>
                      <button
                        onClick={() => handleAdd(item)}
                        className="btn btn-primary-custom btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-cart-plus"></i> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
