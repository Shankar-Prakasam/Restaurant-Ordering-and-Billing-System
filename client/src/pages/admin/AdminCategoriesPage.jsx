import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ categoryName: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ categoryName: '', description: '', image: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      categoryName: cat.categoryName,
      description: cat.description || '',
      image: cat.image || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryName.trim()) {
      toast.error('Please enter category name');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory._id, formData);
        if (res.data.success) {
          toast.success('Category updated successfully');
        }
      } else {
        const res = await categoryService.createCategory(formData);
        if (res.data.success) {
          toast.success('New category created');
        }
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Dishes linked to this category may lose association.`)) return;
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.data.success) {
        toast.success(`Category "${name}" deleted.`);
        fetchCategories();
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font fw-bold mb-0">Food Categories</h2>
          <small className="text-muted">Organize menu items by authentic culinary genres and dining courses</small>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary-custom rounded-pill">
          <i className="bi bi-plus-lg me-1"></i> Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {categories.map((cat) => (
            <div key={cat._id} className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 d-flex flex-column">
                <div style={{ height: '140px', overflow: 'hidden' }}>
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80'}
                    alt={cat.categoryName}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body d-flex flex-column p-4">
                  <h5 className="brand-font fw-bold mb-2 text-danger">{cat.categoryName}</h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {cat.description || 'Authentic dishes prepared fresh in our kitchen.'}
                  </p>
                  <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    >
                      <i className="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.categoryName)}
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    >
                      <i className="bi bi-trash me-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      required
                    />
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
                    <label className="form-label small fw-semibold">Banner Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary-custom rounded-pill px-4">
                    {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
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

export default AdminCategoriesPage;
