// ==========================================
// Vehicle Add/Edit Modal Form with Purchase & Selling Price Profit Calculation
// ==========================================
import React, { useState, useEffect } from 'react';
import { X, Save, Car, IndianRupee, Layers, Hash, AlertCircle, TrendingUp, Percent } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import './VehicleModal.css';

const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Hybrid', 'Convertible', 'Wagon', 'Van'];

export default function VehicleModal({ isOpen, onClose, onSave, vehicle = null }) {
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    category: 'Sedan',
    purchase_price: '',
    selling_price: '',
    quantity: '0',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (vehicle) {
      const sPrice = vehicle.selling_price !== undefined && vehicle.selling_price > 0 
        ? vehicle.selling_price 
        : (vehicle.price !== undefined ? vehicle.price : '');
      const pPrice = vehicle.purchase_price !== undefined && vehicle.purchase_price > 0 
        ? vehicle.purchase_price 
        : (sPrice ? Math.round(sPrice * 0.75) : '');

      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        category: vehicle.category || 'Sedan',
        purchase_price: pPrice !== '' ? String(pPrice) : '',
        selling_price: sPrice !== '' ? String(sPrice) : '',
        quantity: vehicle.quantity !== undefined ? String(vehicle.quantity) : '0',
      });
    } else {
      setFormData({
        make: '',
        model: '',
        category: 'Sedan',
        purchase_price: '',
        selling_price: '',
        quantity: '0',
      });
    }
    setErrorMessage('');
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Live profit calculation
  const pPriceNum = parseFloat(formData.purchase_price) || 0;
  const sPriceNum = parseFloat(formData.selling_price) || 0;
  const unitProfit = sPriceNum - pPriceNum;
  const marginPercent = sPriceNum > 0 ? ((unitProfit / sPriceNum) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.make.trim() || !formData.model.trim()) {
      setErrorMessage('Please provide both vehicle make and model.');
      return;
    }

    if (isNaN(pPriceNum) || pPriceNum <= 0) {
      setErrorMessage('Vehicle procurement purchase cost must be greater than 0.');
      return;
    }

    if (isNaN(sPriceNum) || sPriceNum <= 0) {
      setErrorMessage('Vehicle selling price must be greater than 0.');
      return;
    }

    const qtyNum = parseInt(formData.quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setErrorMessage('Stock quantity cannot be negative.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await onSave({
        make: formData.make.trim(),
        model: formData.model.trim(),
        category: formData.category,
        purchase_price: pPriceNum,
        selling_price: sPriceNum,
        price: sPriceNum,
        quantity: qtyNum,
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Car size={22} className="text-indigo-400" />
            <h2>{isEditing ? 'Edit Vehicle Details' : 'Add New Vehicle to Stock'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" style={{ margin: '1rem 1.5rem 0' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="vehicle-make">Make / Brand</label>
              <div className="input-wrapper">
                <input
                  id="vehicle-make"
                  type="text"
                  name="make"
                  className="form-input"
                  placeholder="e.g. Porsche, BMW, Mercedes, Tata"
                  value={formData.make}
                  onChange={handleChange}
                  required
                />
                <Car className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="vehicle-model">Model Name</label>
              <div className="input-wrapper">
                <input
                  id="vehicle-model"
                  type="text"
                  name="model"
                  className="form-input"
                  placeholder="e.g. 911 GT3, M4, C-Class, Harrier"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
                <Car className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="vehicle-category">Category</label>
              <div className="input-wrapper">
                <select
                  id="vehicle-category"
                  name="category"
                  className="form-input select-input"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Layers className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="vehicle-quantity">Initial Stock Quantity</label>
              <div className="input-wrapper">
                <input
                  id="vehicle-quantity"
                  type="number"
                  name="quantity"
                  min="0"
                  className="form-input"
                  placeholder="5"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
                <Hash className="input-icon" size={18} />
              </div>
            </div>

            {/* Purchase Price (Cost to Dealership) */}
            <div className="form-group">
              <label className="form-label" htmlFor="purchase-price">
                Purchase Price / Cost (₹)
                <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.4rem' }}>(Dealership procurement cost)</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="purchase-price"
                  type="number"
                  name="purchase_price"
                  step="1"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 150000000"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  required
                />
                <IndianRupee className="input-icon text-muted" size={18} />
              </div>
            </div>

            {/* Selling Price (Price to Customer) */}
            <div className="form-group">
              <label className="form-label" htmlFor="selling-price">
                Selling Price (₹)
                <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.4rem' }}>(Customer list price)</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="selling-price"
                  type="number"
                  name="selling_price"
                  step="1"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 200000000"
                  value={formData.selling_price}
                  onChange={handleChange}
                  required
                />
                <IndianRupee className="input-icon text-indigo-400" size={18} />
              </div>
            </div>
          </div>

          {/* Live Profit Calculation Badge */}
          {(pPriceNum > 0 || sPriceNum > 0) && (
            <div 
              style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: unitProfit >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${unitProfit >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={20} style={{ color: unitProfit >= 0 ? 'var(--accent-emerald)' : 'var(--danger)' }} />
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>
                    Calculated Profit per Unit:
                  </span>
                  <strong style={{ fontSize: '1.1rem', color: unitProfit >= 0 ? 'var(--accent-emerald)' : 'var(--danger)' }}>
                    {formatINR(unitProfit)} {unitProfit < 0 ? '(Loss)' : ''}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <Percent size={15} className="text-muted" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {marginPercent}% Margin
                </span>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="spinner" />
                  <span>Saving Vehicle...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEditing ? 'Update Vehicle' : 'Add Vehicle to Inventory'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
