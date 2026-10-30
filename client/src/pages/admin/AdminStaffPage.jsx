import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminStaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ role: 'staff' });
      if (res.data.success) {
        setStaffList(res.data.users);
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingStaff(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '', // blank unless updating
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStaff) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const res = await userService.updateUser(editingStaff._id, payload);
        if (res.data.success) {
          toast.success('Staff account updated!');
        }
      } else {
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters.');
          setSaving(false);
          return;
        }
        const res = await userService.createUser(formData);
        if (res.data.success) {
          toast.success('New staff account created successfully!');
        }
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently remove staff account for ${name}?`)) return;
    try {
      const res = await userService.deleteUser(id);
      if (res.data.success) {
        toast.success(`Staff account for ${name} removed.`);
        fetchStaff();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete staff';
      toast.error(msg);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font fw-bold mb-0">Staff & Service Personnel Management</h2>
          <small className="text-muted">Create floor managers, captains, and billing stewards with restricted operational access</small>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary-custom rounded-pill">
          <i className="bi bi-person-plus-fill me-1"></i> Register Staff
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Staff Member</th>
                <th>Contact Phone</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Registered On</th>
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
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No staff accounts found.
                  </td>
                </tr>
              ) : (
                staffList.map((st) => (
                  <tr key={st._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: '42px', height: '42px' }}
                        >
                          {st.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="fw-bold">{st.name}</div>
                          <small className="text-muted">{st.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{st.phone}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle text-uppercase">
                        {st.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${st.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {st.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="small text-muted">{new Date(st.createdAt).toLocaleDateString()}</td>
                    <td className="text-end pe-4">
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="btn btn-sm btn-outline-primary rounded-circle p-1 me-2"
                        title="Edit Account"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(st._id, st.name)}
                        className="btn btn-sm btn-outline-danger rounded-circle p-1"
                        title="Delete Account"
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

      {/* Staff Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">
                  {editingStaff ? 'Edit Staff Account' : 'Register Staff Account'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      disabled={!!editingStaff}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      {editingStaff ? 'Password (Leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder={editingStaff ? '••••••••' : 'At least 6 characters'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingStaff}
                    />
                  </div>

                  {editingStaff && (
                    <div className="form-check form-switch mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="staffActiveSwitch"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="staffActiveSwitch">
                        Account Active
                      </label>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary-custom rounded-pill px-4">
                    {saving ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff Member'}
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

export default AdminStaffPage;
