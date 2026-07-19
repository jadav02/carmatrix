// ==========================================
// Vehicle Add/Edit Modal Form
// ==========================================
import React, { useState, useEffect } from 'react';
import { X, Save, Car, IndianRupee, Layers, Hash, AlertCircle } from 'lucide-react';
import './VehicleModal.css';

const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Hybrid', 'Convertible', 'Wagon', 'Van'];

export default function VehicleModal({ isOpen, onClose, onSave, vehicle = null }) {
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    category: 'Sedan',
    price: '',
    quantity: '0',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        category: vehicle.category || 'Sedan',
        price: vehicle.price !== undefined ? String(vehicle.price) : '',
        quantity: vehicle.quantity !== undefined ? String(vehicle.quantity) : '0',
      });
    } else {
      setFormData({
        make: '',
        model: '',
        category: 'Sedan',
        price: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.make.trim() || !formData.model.trim()) {
      setErrorMessage('Please provide both vehicle make and model.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Vehicle price must be greater than 0.');
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
        price: priceNum,
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
            <h2>{isEditing ? 'Edit Vehicle Details' : 'Add New Vehicle'}</h2>
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
                  placeholder="e.g. Toyota, Tata, Hyundai"
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
                  placeholder="e.g. Harrier, Creta, City"
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
              <label className="form-label" htmlFor="vehicle-price">Price (₹)</label>
              <div className="input-wrapper">
                <input
                  id="vehicle-price"
                  type="number"
                  name="price"
                  step="1"
                  min="1"
                  className="form-input"
                  placeholder="1250000"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                <IndianRupee className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group full-width">
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
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEditing ? 'Update Vehicle' : 'Add Vehicle'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
