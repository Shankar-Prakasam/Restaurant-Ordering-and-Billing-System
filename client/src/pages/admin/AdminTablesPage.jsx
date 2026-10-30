import React, { useState, useEffect } from 'react';
import { tableService } from '../../services/api';
import { toast } from 'react-toastify';

const AdminTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    tableType: 'Indoor',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (capacityFilter) params.capacity = capacityFilter;
      if (search) params.search = search;

      const res = await tableService.getTables(params);
      if (res.data.success) {
        setTables(res.data.tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load restaurant tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTables();
    }, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, capacityFilter, search]);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: 4,
      tableType: 'Indoor',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      tableType: table.tableType,
      isActive: table.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tableNumber || !formData.capacity) {
      toast.error('Please enter table number and seating capacity.');
      return;
    }

    setSaving(true);
    try {
      if (editingTable) {
        const res = await tableService.updateTable(editingTable._id, formData);
        if (res.data.success) {
          toast.success('Table updated successfully!');
        }
      } else {
        const res = await tableService.createTable(formData);
        if (res.data.success) {
          toast.success('New table registered!');
        }
      }
      setShowModal(false);
      fetchTables();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save table';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, tableNumber) => {
    if (!window.confirm(`Are you sure you want to delete table ${tableNumber}?`)) return;
    try {
      const res = await tableService.deleteTable(id);
      if (res.data.success) {
        toast.success(`Table ${tableNumber} removed.`);
        fetchTables();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete table.';
      toast.error(msg);
    }
  };

  // Color mapping for dynamic status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return { bg: 'badge-available', label: '🟢 Available' };
      case 'Reserved':
        return { bg: 'badge-reserved', label: '🔵 Reserved (Upcoming)' };
      case 'Occupied':
        return { bg: 'badge-occupied', label: '🔴 Occupied (Seated)' };
      case 'Maintenance':
        return { bg: 'badge-maintenance', label: '⚪ Maintenance' };
      default:
        return { bg: 'badge-available', label: status };
    }
  };

  const getStatusCardBorder = (status) => {
    switch (status) {
      case 'Available':
        return 'border-success';
      case 'Reserved':
        return 'border-info';
      case 'Occupied':
        return 'border-danger';
      case 'Maintenance':
        return 'border-secondary';
      default:
        return 'border-light';
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="brand-font fw-bold mb-0">Restaurant Table Management</h2>
          <small className="text-muted">Real-time seating floorplan with dynamic occupancy and booking schedule sync</small>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary-custom rounded-pill">
          <i className="bi bi-plus-lg me-1"></i> Add New Table
        </button>
      </div>

      {/* Legend & Filter Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        {/* Status Legend */}
        <div className="d-flex flex-wrap gap-3 align-items-center mb-3 pb-3 border-bottom small">
          <span className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>
            Live Floor Legend:
          </span>
          <span className="badge badge-available px-3 py-2 rounded-pill">🟢 Available for Seating</span>
          <span className="badge badge-reserved px-3 py-2 rounded-pill">🔵 Reserved (Upcoming Today)</span>
          <span className="badge badge-occupied px-3 py-2 rounded-pill">🔴 Occupied (Diners Seated Now)</span>
          <span className="badge badge-maintenance px-3 py-2 rounded-pill">⚪ Inactive / Maintenance</span>
        </div>

        {/* Filter controls */}
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control bg-light"
              placeholder="Search table number (e.g. T-01)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select bg-light"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="">All Capacities</option>
              <option value="2">2+ Seats</option>
              <option value="4">4+ Seats</option>
              <option value="6">6+ Seats</option>
              <option value="8">8+ Seats</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end text-muted small">
            Tables: <strong className="text-dark">{tables.length}</strong>
          </div>
        </div>
      </div>

      {/* Visual Table Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : tables.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white text-muted">
          No tables found matching current filters.
        </div>
      ) : (
        <div className="row g-4">
          {tables.map((table) => {
            const statusInfo = getStatusBadge(table.computedStatus);
            const borderClass = getStatusCardBorder(table.computedStatus);

            return (
              <div key={table._id} className="col-xl-3 col-lg-4 col-md-6">
                <div
                  className={`card h-100 shadow-sm rounded-4 bg-white border-2 ${borderClass} p-3 d-flex flex-column`}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h4 className="fw-bold mb-0 text-danger">{table.tableNumber}</h4>
                      <small className="text-muted">{table.tableType}</small>
                    </div>
                    <span className={`badge ${statusInfo.bg} px-2 py-1 small rounded-pill`}>
                      {table.computedStatus}
                    </span>
                  </div>

                  {/* Seating Icons */}
                  <div className="my-3 p-3 bg-light rounded-3 text-center">
                    <div className="fs-3 text-dark mb-1">
                      <i className="bi bi-people-fill me-1"></i>
                      <span className="fw-bold fs-4">{table.capacity}</span>
                    </div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                      Seating Capacity
                    </small>
                  </div>

                  {/* Booking Details if occupied or reserved */}
                  {table.currentBooking && (
                    <div className="alert alert-danger p-2 small mb-2">
                      <div className="fw-bold text-truncate">Current: {table.currentBooking.customerName}</div>
                      <div>Time: {table.currentBooking.startTime} ({table.currentBooking.numberOfGuests} guests)</div>
                    </div>
                  )}

                  {table.upcomingBooking && !table.currentBooking && (
                    <div className="alert alert-info p-2 small mb-2">
                      <div className="fw-bold text-truncate">Next: {table.upcomingBooking.customerName}</div>
                      <div>At: {table.upcomingBooking.startTime} ({table.upcomingBooking.numberOfGuests} guests)</div>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="d-flex justify-content-end gap-2 mt-auto pt-2 border-top">
                    <button
                      onClick={() => handleOpenEdit(table)}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    >
                      <i className="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(table._id, table.tableNumber)}
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    >
                      <i className="bi bi-trash me-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title brand-font fw-bold">
                  {editingTable ? 'Edit Table Settings' : 'Add New Restaurant Table'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Table Number / Label *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="E.g., T-01, VIP-1"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Seating Capacity *</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        className="form-control"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Table Type / Zone</label>
                      <select
                        className="form-select"
                        value={formData.tableType}
                        onChange={(e) => setFormData({ ...formData, tableType: e.target.value })}
                      >
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                        <option value="Rooftop">Rooftop</option>
                        <option value="Family Booth">Family Booth</option>
                        <option value="VIP Window">VIP Window</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-check form-switch mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActiveSwitch"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="isActiveSwitch">
                      Active (Turn off if table is under maintenance)
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary-custom rounded-pill px-4">
                    {saving ? 'Saving...' : editingTable ? 'Save Changes' : 'Create Table'}
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

export default AdminTablesPage;
