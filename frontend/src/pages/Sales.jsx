// ==========================================
// Sales Management Page (Sales Representative & Administrator)
// ==========================================
import React, { useState, useEffect } from 'react';
import { getVehicles } from '../api/vehicles';
import { sellVehicle, getSales } from '../api/sales';
import { formatINR } from '../utils/formatters';
import { 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Car, 
  User, 
  IndianRupee, 
  Boxes,
  History
} from 'lucide-react';
import './Sales.css';

export default function Sales() {
  const [vehicles, setVehicles] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    customer_name: '',
    quantity: '1',
    unit_price: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [vData, sData] = await Promise.all([
        getVehicles({ in_stock_only: true }).catch(() => []),
        getSales().catch(() => []),
      ]);
      setVehicles(vData || []);
      setSalesHistory(sData || []);

      if (vData && vData.length > 0 && !formData.vehicle_id) {
        setFormData(prev => ({
          ...prev,
          vehicle_id: String(vData[0].id),
          unit_price: String(vData[0].price),
        }));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch sales data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVehicleSelect = (vId) => {
    const selected = vehicles.find(v => String(v.id) === String(vId));
    setFormData(prev => ({
      ...prev,
      vehicle_id: vId,
      unit_price: selected ? String(selected.price) : prev.unit_price,
    }));
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.customer_name.trim() || !formData.quantity || !formData.unit_price) {
      setErrorMessage('Please fill out all sales fields.');
      return;
    }

    const qty = parseInt(formData.quantity, 10);
    const price = parseFloat(formData.unit_price);

    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Quantity must be greater than 0.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      setErrorMessage('Unit price must be greater than 0.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await sellVehicle({
        vehicle_id: Number(formData.vehicle_id),
        customer_name: formData.customer_name.trim(),
        quantity: qty,
        unit_price: price,
      });

      showSuccess(`Successfully processed sale of ${qty} unit(s) of ${res.vehicle_make} ${res.vehicle_model} to ${res.customer_name}!`);
      setFormData({
        vehicle_id: vehicles.length > 0 ? String(vehicles[0].id) : '',
        customer_name: '',
        quantity: '1',
        unit_price: vehicles.length > 0 ? String(vehicles[0].price) : '',
      });
      fetchData();
    } catch (err) {
      setErrorMessage(err.message || 'Sale transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Vehicle Sales</h1>
          <p className="page-subtitle">Record customer sales transactions and view complete dealership sales history</p>
        </div>
        <button className="btn btn-secondary icon-only-btn" onClick={fetchData} title="Refresh Sales">
          <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
        </button>
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

      {/* Sell Vehicle Form */}
      <div className="sell-form-card glass-panel">
        <div className="card-title">
          <ShoppingCart size={20} className="text-indigo-400" />
          <h2>Process New Customer Sale</h2>
        </div>

        <form onSubmit={handleSubmit} className="sell-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="sale-vehicle">Select Vehicle</label>
              <div className="input-wrapper">
                <select
                  id="sale-vehicle"
                  className="form-input select-input"
                  value={formData.vehicle_id}
                  onChange={e => handleVehicleSelect(e.target.value)}
                  required
                >
                  {vehicles.length === 0 ? (
                    <option value="">No stock available</option>
                  ) : (
                    vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} (#{v.id}) — Available: {v.quantity} units
                      </option>
                    ))
                  )}
                </select>
                <Car className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sale-customer">Customer Name</label>
              <div className="input-wrapper">
                <input
                  id="sale-customer"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.customer_name}
                  onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
                <User className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sale-quantity">Quantity Sold</label>
              <div className="input-wrapper">
                <input
                  id="sale-quantity"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
                <Boxes className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sale-price">Sale Price per Unit (₹)</label>
              <div className="input-wrapper">
                <input
                  id="sale-price"
                  type="number"
                  min="1"
                  step="1"
                  className="form-input"
                  placeholder="1250000"
                  value={formData.unit_price}
                  onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                  required
                />
                <IndianRupee className="input-icon" size={18} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting || vehicles.length === 0}
            style={{ marginTop: '1rem' }}
          >
            {submitting ? (
              <>
                <div className="spinner" />
                <span>Processing Transaction...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Complete Customer Sale</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Sales History Table */}
      <div className="table-card glass-panel">
        <div className="table-card-header">
          <History size={20} className="text-indigo-400" />
          <h2>Customer Sales History</h2>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
            <p>Loading sales records...</p>
          </div>
        ) : salesHistory.length === 0 ? (
          <div className="table-empty">
            <ShoppingCart size={48} className="empty-icon" />
            <h3>No Sales Records Found</h3>
            <p>Process your first sale above to populate sales history.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Vehicle</th>
                  <th>Customer Name</th>
                  <th>Units Sold</th>
                  <th>Unit Price (₹)</th>
                  <th>Total Sale Amount (₹)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.map(s => (
                  <tr key={s.id}>
                    <td className="col-id">#{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.vehicle_make} {s.vehicle_model}</td>
                    <td>{s.customer_name}</td>
                    <td>{s.quantity} Units</td>
                    <td>{formatINR(s.unit_price)}</td>
                    <td className="col-price">{formatINR(s.total_price)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
