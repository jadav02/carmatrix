// ==========================================
// Inventory Management Page with Purchase & Sale Price Profit Metrics
// ==========================================
import React, { useState, useEffect } from 'react';
import { getVehicles } from '../api/vehicles';
import { purchaseStock, restockStock } from '../api/inventory';
import { formatINR } from '../utils/formatters';
import { 
  Boxes, 
  ShoppingCart, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Car, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import './Inventory.css';

export default function Inventory() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [purchaseForm, setPurchaseForm] = useState({ vehicle_id: '', quantity: '1' });
  const [restockForm, setRestockForm] = useState({ vehicle_id: '', quantity: '5' });

  const [submittingPurchase, setSubmittingPurchase] = useState(false);
  const [submittingRestock, setSubmittingRestock] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active transaction tab: 'purchase' | 'restock'
  const [activeTab, setActiveTab] = useState('purchase');

  const fetchInventory = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getVehicles();
      setVehicles(data || []);

      if (data && data.length > 0) {
        const firstId = String(data[0].id);
        const purchaseValid = data.some(v => String(v.id) === purchaseForm.vehicle_id);
        if (!purchaseValid) {
          setPurchaseForm(prev => ({ ...prev, vehicle_id: firstId }));
        }
        const restockValid = data.some(v => String(v.id) === restockForm.vehicle_id);
        if (!restockValid) {
          setRestockForm(prev => ({ ...prev, vehicle_id: firstId }));
        }
      }
    } catch (err) {
      setVehicles([]);
      setErrorMessage('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handle Purchase submission
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseForm.vehicle_id || !purchaseForm.quantity) {
      setErrorMessage('Please select a vehicle and enter a valid quantity.');
      return;
    }

    const qty = parseInt(purchaseForm.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Purchase quantity must be greater than 0.');
      return;
    }

    const targetVehicle = vehicles.find(v => v.id === Number(purchaseForm.vehicle_id));
    if (targetVehicle && qty > targetVehicle.quantity) {
      setErrorMessage(`Insufficient stock. Only ${targetVehicle.quantity} units available for ${targetVehicle.make} ${targetVehicle.model}.`);
      return;
    }

    setSubmittingPurchase(true);
    setErrorMessage('');

    try {
      const res = await purchaseStock(purchaseForm.vehicle_id, qty);
      showSuccess(`Successfully processed purchase/sale of ${qty} unit(s) of ${res.make} ${res.model}! New Stock: ${res.new_quantity}`);
      fetchInventory();
    } catch (err) {
      setErrorMessage(err.message || 'Purchase transaction failed');
    } finally {
      setSubmittingPurchase(false);
    }
  };

  // Handle Restock submission
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockForm.vehicle_id || !restockForm.quantity) {
      setErrorMessage('Please select a vehicle and enter a valid quantity.');
      return;
    }

    const qty = parseInt(restockForm.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Restock quantity must be greater than 0.');
      return;
    }

    setSubmittingRestock(true);
    setErrorMessage('');

    try {
      const res = await restockStock(restockForm.vehicle_id, qty);
      showSuccess(`Successfully restocked ${qty} unit(s) of ${res.make} ${res.model}! New Stock: ${res.new_quantity}`);
      fetchInventory();
    } catch (err) {
      setErrorMessage(err.message || 'Restock transaction failed');
    } finally {
      setSubmittingRestock(false);
    }
  };

  // Quick Action triggers from table rows
  const handleQuickSelect = (v, actionType) => {
    if (actionType === 'purchase') {
      setPurchaseForm({ vehicle_id: String(v.id), quantity: '1' });
      setActiveTab('purchase');
    } else {
      setRestockForm({ vehicle_id: String(v.id), quantity: '5' });
      setActiveTab('restock');
    }
  };

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Inventory Management</h1>
          <p className="page-subtitle">Perform vehicle stock purchases, restock inventory, and view procurement cost & selling price profit margins</p>
        </div>
        <button className="btn btn-secondary icon-only-btn" onClick={fetchInventory} title="Refresh Inventory">
          <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
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

      {/* Operations Panel */}
      <div className="operations-grid">
        <div className="operation-card glass-panel">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'purchase' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchase')}
            >
              <ShoppingCart size={18} />
              <span>Purchase / Sell Stock</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'restock' ? 'active' : ''}`}
              onClick={() => setActiveTab('restock')}
            >
              <PlusCircle size={18} />
              <span>Restock Inventory</span>
            </button>
          </div>

          {activeTab === 'purchase' ? (
            <form onSubmit={handlePurchaseSubmit} className="op-form">
              <div className="op-desc">
                <ArrowDownRight size={18} className="text-danger" />
                <span>Decreases stock quantity for a vehicle purchase/sale transaction.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="purchase-vehicle">Select Vehicle</label>
                <div className="input-wrapper">
                  <select
                    id="purchase-vehicle"
                    className="form-input select-input"
                    value={purchaseForm.vehicle_id}
                    onChange={e => setPurchaseForm({ ...purchaseForm, vehicle_id: e.target.value })}
                    required
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} (#{v.id}) — Selling: {formatINR(v.selling_price || v.price)} | Stock: {v.quantity} units
                      </option>
                    ))}
                  </select>
                  <Car className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="purchase-quantity">Units to Purchase/Sell</label>
                <div className="input-wrapper">
                  <input
                    id="purchase-quantity"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Quantity"
                    value={purchaseForm.quantity}
                    onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    required
                  />
                  <Boxes className="input-icon" size={18} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submittingPurchase || vehicles.length === 0}
              >
                {submittingPurchase ? (
                  <>
                    <div className="spinner" />
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Confirm Stock Purchase</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRestockSubmit} className="op-form">
              <div className="op-desc">
                <ArrowUpRight size={18} className="text-success" />
                <span>Increases stock quantity for incoming vehicle shipments.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="restock-vehicle">Select Vehicle</label>
                <div className="input-wrapper">
                  <select
                    id="restock-vehicle"
                    className="form-input select-input"
                    value={restockForm.vehicle_id}
                    onChange={e => setRestockForm({ ...restockForm, vehicle_id: e.target.value })}
                    required
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} (#{v.id}) — Procurement Cost: {formatINR(v.purchase_price || 0)} | Current Stock: {v.quantity} units
                      </option>
                    ))}
                  </select>
                  <Car className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="restock-quantity">Units to Add</label>
                <div className="input-wrapper">
                  <input
                    id="restock-quantity"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Quantity"
                    value={restockForm.quantity}
                    onChange={e => setRestockForm({ ...restockForm, quantity: e.target.value })}
                    required
                  />
                  <Boxes className="input-icon" size={18} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submittingRestock || vehicles.length === 0}
                style={{ background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)' }}
              >
                {submittingRestock ? (
                  <>
                    <div className="spinner" />
                    <span>Processing Restock...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    <span>Confirm Vehicle Restock</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stock Overview Table */}
      <div className="table-card glass-panel">
        <div className="table-card-header">
          <Boxes size={20} className="text-indigo-400" />
          <h2>Current Vehicle Stock Inventory & Unit Profit Breakdown</h2>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
            <p>Loading stock inventory levels...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="table-empty">
            <Boxes size={48} className="empty-icon" />
            <h3>No Inventory Items Available</h3>
            <p>Add vehicles to the system to manage stock purchases and restocking.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle Model</th>
                  <th>Category</th>
                  <th>Purchase Cost (₹)</th>
                  <th>Selling Price (₹)</th>
                  <th>Profit / Unit (₹)</th>
                  <th>Current Stock</th>
                  <th style={{ textAlign: 'right' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => {
                  const sPrice = v.selling_price || v.price;
                  const pPrice = v.purchase_price || (sPrice * 0.75);
                  const unitProfit = v.profit_per_unit !== undefined ? v.profit_per_unit : (sPrice - pPrice);

                  return (
                    <tr key={v.id}>
                      <td className="col-id">#{v.id}</td>
                      <td>
                        <div className="vehicle-name">{v.make} {v.model}</div>
                      </td>
                      <td>
                        <span className="category-pill">{v.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatINR(pPrice)}</td>
                      <td className="col-price">{formatINR(sPrice)}</td>
                      <td style={{ color: unitProfit >= 0 ? 'var(--accent-emerald)' : 'var(--danger)', fontWeight: 600 }}>
                        {formatINR(unitProfit)}
                      </td>
                      <td>
                        <span className={`stock-badge ${v.quantity === 0 ? 'out' : v.quantity <= 3 ? 'low' : 'good'}`}>
                          {v.quantity} Units {v.quantity === 0 ? '(Out of Stock)' : v.quantity <= 3 ? '(Low Stock)' : ''}
                        </span>
                      </td>
                      <td className="col-actions">
                        <button
                          className="btn btn-secondary quick-btn"
                          onClick={() => handleQuickSelect(v, 'purchase')}
                          disabled={v.quantity === 0}
                          title="Purchase stock for this vehicle"
                        >
                          <ShoppingCart size={14} />
                          <span>Purchase</span>
                        </button>
                        <button
                          className="btn btn-secondary quick-btn restock-btn"
                          onClick={() => handleQuickSelect(v, 'restock')}
                          title="Restock units for this vehicle"
                        >
                          <PlusCircle size={14} />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
