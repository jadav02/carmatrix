// ==========================================
// Customer Purchase History Page
// ==========================================
import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../api/orders';
import { formatINR } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { 
  PackageCheck, 
  RefreshCw, 
  Car, 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  MapPin 
} from 'lucide-react';
import './CustomerOrders.css';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getMyOrders();
      setOrders(data || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch purchase history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="customer-orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">My Purchase History</h1>
          <p className="page-subtitle">View your past vehicle purchases, receipts, and order invoices</p>
        </div>
        <button className="btn btn-secondary icon-only-btn" onClick={fetchOrders} title="Refresh Orders">
          <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="table-loading" style={{ padding: '3rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
          <p>Loading your purchase history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="table-card glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <PackageCheck size={64} className="empty-icon text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You haven't placed any car purchases yet. Browse our showroom and make your first purchase!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <Car size={18} />
            <span>Browse Showroom</span>
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card glass-panel">
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id}</span>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <CreditCard size={14} />
                    <span>{order.payment_method}</span>
                  </div>
                </div>
                <div className="order-status-badge">
                  <CheckCircle size={14} />
                  <span>{order.status}</span>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-items-table">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item-row">
                      <div className="item-car">
                        <Car size={18} className="text-indigo-400" />
                        <span className="item-name">{item.vehicle_make} {item.vehicle_model}</span>
                      </div>
                      <span className="item-qty-badge">{item.quantity} Unit{item.quantity > 1 ? 's' : ''}</span>
                      <span className="item-price">{formatINR(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="address-info">
                    <MapPin size={14} className="text-muted" style={{ flexShrink: 0 }} />
                    <span>{order.shipping_address}</span>
                  </div>
                  <div className="order-total-price">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-val">{formatINR(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
