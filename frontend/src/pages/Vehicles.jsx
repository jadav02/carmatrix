// ==========================================
// Vehicle Management Page
// ==========================================
import React, { useState, useEffect } from 'react';
import { 
  getVehicles, 
  getInventorySummary, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../api/vehicles';
import { formatINR } from '../utils/formatters';
import VehicleModal from '../components/vehicles/VehicleModal';
import DeleteConfirmModal from '../components/vehicles/DeleteConfirmModal';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Boxes, 
  IndianRupee, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import './Vehicles.css';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Hybrid', 'Convertible', 'Wagon', 'Van'];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    in_stock_only: false,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

  // Fetch vehicles & summary data
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [vehicleList, summaryData] = await Promise.all([
        getVehicles(filters).catch(() => []),
        getInventorySummary().catch(() => ({
          total_vehicles: 0,
          total_quantity: 0,
          total_inventory_value: 0,
          low_stock_count: 0
        })),
      ]);
      setVehicles(vehicleList || []);
      setSummary(summaryData || {
        total_vehicles: 0,
        total_quantity: 0,
        total_inventory_value: 0,
        low_stock_count: 0
      });
    } catch (err) {
      // If fetching fails, default to empty list gracefully instead of displaying technical errors
      setVehicles([]);
      setSummary({
        total_vehicles: 0,
        total_quantity: 0,
        total_inventory_value: 0,
        low_stock_count: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.category, filters.in_stock_only]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Toast message helper
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handle Add / Edit save
  const handleSaveVehicle = async (vehicleData) => {
    if (editingVehicle) {
      const updated = await updateVehicle(editingVehicle.id, vehicleData);
      showSuccess(`Updated ${updated.make} ${updated.model} successfully!`);
    } else {
      const created = await createVehicle(vehicleData);
      showSuccess(`Created new vehicle record for ${created.make} ${created.model}!`);
    }
    fetchData();
  };

  // Handle Delete confirm
  const handleDeleteConfirm = async (id) => {
    await deleteVehicle(id);
    showSuccess('Vehicle record removed successfully.');
    fetchData();
  };

  return (
    <div className="vehicles-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Vehicle Management</h1>
          <p className="page-subtitle">View, add, edit, and manage dealership car models and pricing</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
        >
          <Plus size={18} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card glass-panel">
            <div className="summary-info">
              <span className="summary-label">Total Models</span>
              <span className="summary-num">{summary.total_vehicles}</span>
            </div>
            <div className="summary-icon indigo">
              <Car size={24} />
            </div>
          </div>

          <div className="summary-card glass-panel">
            <div className="summary-info">
              <span className="summary-label">Total Units in Stock</span>
              <span className="summary-num">{summary.total_quantity}</span>
            </div>
            <div className="summary-icon cyan">
              <Boxes size={24} />
            </div>
          </div>

          <div className="summary-card glass-panel">
            <div className="summary-info">
              <span className="summary-label">Inventory Valuation</span>
              <span className="summary-num">
                {formatINR(summary.total_inventory_value)}
              </span>
            </div>
            <div className="summary-icon emerald">
              <IndianRupee size={24} />
            </div>
          </div>

          <div className="summary-card glass-panel">
            <div className="summary-info">
              <span className="summary-label">Low Stock Warning</span>
              <span className="summary-num" style={{ color: summary.low_stock_count > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                {summary.low_stock_count}
              </span>
            </div>
            <div className="summary-icon violet">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="controls-bar glass-panel">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <input
            type="text"
            className="form-input"
            placeholder="Search by make or model..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Search className="input-icon" size={18} />
          <button type="submit" className="btn btn-secondary search-btn">
            Search
          </button>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} className="text-muted" />
            <select
              className="form-input select-input filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.in_stock_only}
              onChange={(e) => handleFilterChange('in_stock_only', e.target.checked)}
            />
            <span>In Stock Only</span>
          </label>

          <button className="btn btn-secondary icon-only-btn" onClick={fetchData} title="Refresh Vehicles">
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-card glass-panel">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
            <p>Loading vehicle records...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="table-empty">
            <Car size={48} className="empty-icon" />
            <h3>No vehicles available</h3>
            <p>Click 'Add Vehicle' to create your first record.</p>
            <button className="btn btn-primary" onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}>
              <Plus size={18} />
              <span>Add Vehicle</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle Info</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Stock Quantity</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td className="col-id">#{v.id}</td>
                    <td className="col-vehicle">
                      <div className="vehicle-name">{v.make} {v.model}</div>
                    </td>
                    <td>
                      <span className="category-pill">{v.category}</span>
                    </td>
                    <td className="col-price">
                      {formatINR(v.price)}
                    </td>
                    <td>
                      <span className={`stock-badge ${v.quantity === 0 ? 'out' : v.quantity <= 3 ? 'low' : 'good'}`}>
                        {v.quantity === 0 ? 'Out of Stock (0)' : v.quantity <= 3 ? `Low Stock (${v.quantity})` : `${v.quantity} Units`}
                      </span>
                    </td>
                    <td className="col-actions">
                      <button
                        className="action-btn edit-btn"
                        title="Edit Vehicle"
                        onClick={() => { setEditingVehicle(v); setIsModalOpen(true); }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete Vehicle"
                        onClick={() => setDeletingVehicle(v)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={editingVehicle}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleDeleteConfirm}
        vehicle={deletingVehicle}
      />
    </div>
  );
}
