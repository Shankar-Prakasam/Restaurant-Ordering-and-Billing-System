import React, { useState, useEffect } from 'react';
import { menuService, categoryService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminMenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    image: '',
    isAvailable: true,
    isVeg: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await menuService.getItems(params);
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      categoryId: categories[0]?._id || '',
      price: '',
      image: '',
      isAvailable: true,
      isVeg: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId?._id || item.categoryId,
      price: item.price,
      image: item.image || '',
      isAvailable: item.isAvailable,
      isVeg: item.isVeg,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.price) {
      toast.error('Please fill in required fields: name, category, price');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const res = await menuService.updateItem(editingItem._id, formData);
        if (res.data.success) {
          toast.success('Menu item updated successfully!');
        }
      } else {
        const res = await menuService.createItem(formData);
        if (res.data.success) {
          toast.success('New menu item created!');
        }
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await menuService.deleteItem(id);
      if (res.data.success) {
        toast.success(`"${name}" deleted from menu.`);
        fetchItems();
      }
    } catch (error) {
      toast.error('Failed to delete item.');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await menuService.updateItem(item._id, { isAvailable: !item.isAvailable });
      if (res.data.success) {
        toast.success(`Availability changed for "${item.name}"`);
        fetchItems();
      }
    } catch (error) {
      toast.error('Could not update availability');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Menu Catalog Management</h2>
          <small className="text-muted">Create, edit prices, dietary classification, and toggle dish availability</small>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary-custom rounded-pill">
          <i className="bi bi-plus-lg me-1"></i> Add New Menu Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search food items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 text-md-end text-muted small">
            Total Items: <strong className="text-dark">{items.length}</strong>
          </div>
        </div>
      </div>

      {/* Menu Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Item Details</th>
                <th>Category</th>
                <th>Dietary</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-danger" role="status"></div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No menu items found matching criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          className="rounded-3"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold">{item.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: '280px' }}>
                            {item.description || 'No description provided.'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark">
                        {item.categoryId?.categoryName || 'General'}
                      </span>
                    </td>
                    <td>
                      {item.isVeg ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          🟢 Pure Veg
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                          🔴 Non-Veg
                        </span>
                      )}
                    </td>
                    <td className="fw-bold text-danger fs-6">₹{item.price}</td>
                    <td>
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                          item.isAvailable ? 'btn-success' : 'btn-outline-secondary'
                        }`}
                        title="Click to toggle availability"
                      >
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="btn btn-sm btn-outline-primary rounded-circle p-1 me-2"
                        title="Edit Item"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        className="btn btn-sm btn-outline-danger rounded-circle p-1"
                        title="Delete Item"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Item Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Price in ₹ *</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  <div className="d-flex gap-4 mt-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isVegSwitch"
                        checked={formData.isVeg}
                        onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="isVegSwitch">
                        Pure Vegetarian (Veg)
                      </label>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="availSwitch"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="availSwitch">
                        Available in Kitchen
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary-custom rounded-pill px-4">
                    {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
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

export default AdminMenuPage;
