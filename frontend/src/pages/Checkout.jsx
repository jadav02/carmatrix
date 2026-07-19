// ==========================================
// Customer Checkout & Billing Page
// ==========================================
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkout } from '../api/orders';
import { formatINR } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Car, 
  ShieldCheck, 
  Smartphone, 
  Banknote,
  Lock
} from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipping_address: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'Credit/Debit Card',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const totalAmount = getCartTotal();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    if (!formData.shipping_address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      setErrorMessage('Please fill out all required billing & shipping fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const fullAddress = `${formData.shipping_address.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.pincode.trim()}`;

    const items = cart.map(item => ({
      vehicle_id: item.id,
      quantity: item.quantity,
    }));

    try {
      const order = await checkout({
        shipping_address: fullAddress,
        payment_method: formData.payment_method,
        items: items,
      });

      setOrderSuccess(order);
      clearCart();
    } catch (err) {
      setErrorMessage(err.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Checkout & Billing</h1>
          <p className="page-subtitle">Enter your shipping details and select your preferred payment method</p>
        </div>
      </div>

      {orderSuccess ? (
        <div className="table-card glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <CheckCircle size={64} className="text-success" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Thank you, <strong>{orderSuccess.customer_name}</strong>! Your order <strong>#{orderSuccess.id}</strong> has been confirmed.
          </p>

          <div className="order-receipt-summary glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div className="receipt-row">
              <span>Order Number:</span>
              <strong>#{orderSuccess.id}</strong>
            </div>
            <div className="receipt-row">
              <span>Total Amount Paid:</span>
              <strong className="text-emerald">{formatINR(orderSuccess.total_amount)}</strong>
            </div>
            <div className="receipt-row">
              <span>Payment Method:</span>
              <span>{orderSuccess.payment_method}</span>
            </div>
            <div className="receipt-row">
              <span>Shipping Address:</span>
              <span>{orderSuccess.shipping_address}</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/customer/orders')}>
            <span>View Purchase History</span>
          </button>
        </div>
      ) : cart.length === 0 ? (
        <div className="table-card glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Car size={64} className="empty-icon text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3>No Items to Checkout</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your cart is empty. Add vehicles to your cart before proceeding to checkout.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <span>Browse Showroom</span>
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          {/* Checkout Billing Form */}
          <div className="checkout-form-card glass-panel">
            <h2 className="card-section-title">
              <MapPin size={20} className="text-indigo-400" />
              <span>Billing & Delivery Address</span>
            </h2>

            {errorMessage && (
              <div className="alert alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label className="form-label" htmlFor="billing-name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    id="billing-name"
                    type="text"
                    className="form-input"
                    value={user?.name || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="billing-address">Street Address / Landmark</label>
                <div className="input-wrapper">
                  <input
                    id="billing-address"
                    type="text"
                    name="shipping_address"
                    className="form-input"
                    placeholder="e.g. 104 MG Road, Indiranagar"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required
                  />
                  <MapPin className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="billing-city">City</label>
                  <input
                    id="billing-city"
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="billing-state">State</label>
                  <input
                    id="billing-state"
                    type="text"
                    name="state"
                    className="form-input"
                    placeholder="Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="billing-pincode">Pincode</label>
                  <input
                    id="billing-pincode"
                    type="text"
                    name="pincode"
                    className="form-input"
                    placeholder="560038"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <h2 className="card-section-title" style={{ marginTop: '1.5rem' }}>
                <CreditCard size={20} className="text-violet-400" />
                <span>Select Payment Method</span>
              </h2>

              <div className="payment-options">
                <label className={`payment-option ${formData.payment_method === 'Credit/Debit Card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="Credit/Debit Card"
                    checked={formData.payment_method === 'Credit/Debit Card'}
                    onChange={handleChange}
                  />
                  <CreditCard size={20} />
                  <span>Credit / Debit Card</span>
                </label>

                <label className={`payment-option ${formData.payment_method === 'UPI / Net Banking' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="UPI / Net Banking"
                    checked={formData.payment_method === 'UPI / Net Banking'}
                    onChange={handleChange}
                  />
                  <Smartphone size={20} />
                  <span>UPI / Net Banking</span>
                </label>

                <label className={`payment-option ${formData.payment_method === 'Cash on Delivery' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="Cash on Delivery"
                    checked={formData.payment_method === 'Cash on Delivery'}
                    onChange={handleChange}
                  />
                  <Banknote size={20} />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
                style={{ marginTop: '1.75rem' }}
              >
                {submitting ? (
                  <>
                    <div className="spinner" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Confirm Order & Pay {formatINR(totalAmount)}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Checkout Invoice Item Breakdown */}
          <div className="checkout-invoice-card glass-panel">
            <h2>Order Invoice Breakdown</h2>

            <div className="invoice-items">
              {cart.map(item => (
                <div key={item.id} className="invoice-item">
                  <div className="invoice-item-info">
                    <span className="item-title">{item.make} {item.model}</span>
                    <span className="item-qty">{item.quantity} x {formatINR(item.price)}</span>
                  </div>
                  <span className="item-subtotal">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-rows" style={{ marginTop: '1.25rem' }}>
              <div className="summary-row total-row">
                <span>Total Amount Due</span>
                <span className="total-price">{formatINR(totalAmount)}</span>
              </div>
            </div>

            <div className="security-note">
              <ShieldCheck size={16} className="text-emerald" />
              <span>Encrypted 256-bit Secure Dealership Transaction</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
