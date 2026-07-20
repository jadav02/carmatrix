// ==========================================
// Vehicle Management Page with Purchase Cost & Selling Price Profit Analytics
// ==========================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import './Vehicles.css';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Hybrid', 'Convertible', 'Wagon', 'Van'];

export default function Vehicles() {
  const { user } = useAuth();
  const userRole = (user?.role || 'sales').toLowerCase();
  const role = userRole.includes('admin') ? 'admin' : userRole.includes('manager') ? 'manager' : 'sales';

  const canAddEdit = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin' || role === 'manager';

  const [vehicles, setVehicles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    in_stock_only: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

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
          total_purchase_cost: 0,
          potential_total_profit: 0,
          low_stock_count: 0
        })),
      ]);
      setVehicles(vehicleList || []);
      setSummary(summaryData || {
        total_vehicles: 0,
        total_quantity: 0,
        total_inventory_value: 0,
        total_purchase_cost: 0,
        potential_total_profit: 0,
        low_stock_count: 0
      });
    } catch (err) {
      setVehicles([]);
      setSummary({
        total_vehicles: 0,
        total_quantity: 0,
        total_inventory_value: 0,
        total_purchase_cost: 0,
        potential_total_profit: 0,
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

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

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

  const handleDeleteConfirm = async (id) => {
    await deleteVehicle(id);
    showSuccess('Vehicle record removed successfully.');
    fetchData();
  };

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">
            {role === 'sales' ? 'Available Vehicles' : 'Vehicle & Profit Inventory'}
          </h1>
          <p className="page-subtitle">
            {role === 'sales' 
              ? 'View current stock availability and vehicle specifications' 
              : 'Add vehicles with purchase cost & selling price, manage stock, and track unit profit margins'}
          </p>
        </div>

        {canAddEdit && (
          <button 
            className="btn btn-primary"
            onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
          >
            <Plus size={18} />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

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

      {summary && (
        <div className="summary-grid">
          <div className="summary-card glass-panel">
            <div className="summary-info">
              <span className="summary-label">Total Car Models</span>
              <span className="summary-num">{summary.total_vehicles}</span>
            </div>
            <div className="summary-icon indigo">
              <Car size={24} />
            </div>
          </div>

          <div className="summary-card glass-panel">
            <div className="summary-info">
              <span className="summary-label">Total Stock Units</span>
              <span className="summary-num">{summary.total_quantity}</span>
            </div>
            <div className="summary-icon cyan">
              <Boxes size={24} />
            </div>
          </div>

          {/* Show purchase cost & potential profit to Admin & Manager */}
          {role !== 'sales' && (
            <>
              <div className="summary-card glass-panel">
                <div className="summary-info">
                  <span className="summary-label">Total Purchase Cost</span>
                  <span className="summary-num">{formatINR(summary.total_purchase_cost)}</span>
                </div>
                <div className="summary-icon violet">
                  <IndianRupee size={24} />
                </div>
              </div>

              <div className="summary-card glass-panel">
                <div className="summary-info">
                  <span className="summary-label">Total Selling Value</span>
                  <span className="summary-num">{formatINR(summary.total_inventory_value)}</span>
                </div>
                <div className="summary-icon cyan">
                  <IndianRupee size={24} />
                </div>
              </div>

              <div className="summary-card glass-panel">
                <div className="summary-info">
                  <span className="summary-label">Potential Stock Profit</span>
                  <span className="summary-num" style={{ color: 'var(--accent-emerald)' }}>
                    {formatINR(summary.potential_total_profit)}
                  </span>
                </div>
                <div className="summary-icon emerald">
                  <TrendingUp size={24} />
                </div>
              </div>
            </>
          )}

          <div className="summary-card glass-panel">
            <div className="summary-info">
              <span className="summary-label">Low Stock Alert</span>
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

      <div className="table-card glass-panel">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
            <p>Loading vehicle inventory records...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="table-empty">
            <Car size={48} className="empty-icon" />
            <h3>No vehicles available</h3>
            <p>
              {canAddEdit 
                ? "Click 'Add Vehicle' to create your first vehicle entry with purchase cost and selling price."
                : "No matching vehicles are currently listed."}
            </p>
            {canAddEdit && (
              <button className="btn btn-primary" onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}>
                <Plus size={18} />
                <span>Add Vehicle</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle Info</th>
                  <th>Category</th>
                  {role !== 'sales' && <th>Purchase Cost (₹)</th>}
                  <th>Selling Price (₹)</th>
                  {role !== 'sales' && <th>Profit / Unit (₹)</th>}
                  <th>Stock Quantity</th>
                  {canAddEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => {
                  const sPrice = v.selling_price || v.price;
                  const pPrice = v.purchase_price || round(sPrice * 0.75);
                  const unitProfit = v.profit_per_unit !== undefined ? v.profit_per_unit : (sPrice - pPrice);

                  return (
                    <tr key={v.id}>
                      <td className="col-id">#{v.id}</td>
                      <td className="col-vehicle">
                        <div className="vehicle-name">{v.make} {v.model}</div>
                      </td>
                      <td>
                        <span className="category-pill">{v.category}</span>
                      </td>
                      {role !== 'sales' && (
                        <td style={{ color: 'var(--text-muted)' }}>
                          {formatINR(pPrice)}
                        </td>
                      )}
                      <td className="col-price">
                        {formatINR(sPrice)}
                      </td>
                      {role !== 'sales' && (
                        <td style={{ color: unitProfit >= 0 ? 'var(--accent-emerald)' : 'var(--danger)', fontWeight: 600 }}>
                          {formatINR(unitProfit)}
                        </td>
                      )}
                      <td>
                        <span className={`stock-badge ${v.quantity === 0 ? 'out' : v.quantity <= 3 ? 'low' : 'good'}`}>
                          {v.quantity === 0 ? 'Out of Stock (0)' : v.quantity <= 3 ? `Low Stock (${v.quantity})` : `${v.quantity} Units`}
                        </span>
                      </td>
                      {canAddEdit && (
                        <td className="col-actions">
                          <button
                            className="action-btn edit-btn"
                            title="Edit Vehicle & Pricing"
                            onClick={() => { setEditingVehicle(v); setIsModalOpen(true); }}
                          >
                            <Edit size={16} />
                          </button>
                          {canDelete && (
                            <button
                              className="action-btn delete-btn"
                              title="Delete Vehicle"
                              onClick={() => setDeletingVehicle(v)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canAddEdit && (
        <VehicleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVehicle}
          vehicle={editingVehicle}
        />
      )}

      {canDelete && (
        <DeleteConfirmModal
          isOpen={!!deletingVehicle}
          onClose={() => setDeletingVehicle(null)}
          onConfirm={handleDeleteConfirm}
          vehicle={deletingVehicle}
        />
      )}
    </div>
  );
}
