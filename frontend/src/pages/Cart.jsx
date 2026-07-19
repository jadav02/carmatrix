// ==========================================
// Customer Shopping Cart Page
// ==========================================
import React from 'react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Car, 
  CreditCard 
} from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const totalAmount = getCartTotal();

  return (
    <div className="cart-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Shopping Cart</h1>
          <p className="page-subtitle">Review your selected dealership vehicles before proceeding to checkout</p>
        </div>
        {cart.length > 0 && (
          <button className="btn btn-secondary" onClick={clearCart}>
            <Trash2 size={16} />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="table-card glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <ShoppingBag size={64} className="empty-icon text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3>Your Shopping Cart is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Explore our vehicle catalog and add your favorite car to the cart!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <Car size={18} />
            <span>Browse Vehicles</span>
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Table */}
          <div className="table-card glass-panel" style={{ flex: 1 }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Category</th>
                    <th>Unit Price (₹)</th>
                    <th>Quantity</th>
                    <th>Subtotal (₹)</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700 }}>
                        <div className="cart-item-name">
                          <Car size={20} className="text-indigo-400" />
                          <span>{item.make} {item.model}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill">{item.category}</span>
                      </td>
                      <td>{formatINR(item.price)}</td>
                      <td>
                        <div className="qty-controls">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="col-price">{formatINR(item.price * item.quantity)}</td>
                      <td className="col-actions">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="cart-summary-card glass-panel">
            <h2>Order Summary</h2>
            
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                <span>{formatINR(totalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Registration & Processing</span>
                <span className="text-success">FREE</span>
              </div>
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span className="total-price">{formatINR(totalAmount)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate('/checkout')}
              style={{ marginTop: '1.25rem' }}
            >
              <CreditCard size={18} />
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn btn-secondary btn-full"
              onClick={() => navigate('/dashboard')}
              style={{ marginTop: '0.75rem' }}
            >
              <ArrowLeft size={18} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
