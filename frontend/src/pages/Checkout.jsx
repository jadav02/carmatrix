// ==========================================
// Customer Checkout & Billing Page with UPI QR Code & Payment Proof Upload
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
  Lock,
  QrCode,
  Upload,
  Image as ImageIcon,
  Check
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
    payment_method: 'UPI Payment (9408578951@upi)',
  });

  const [paymentProofImage, setPaymentProofImage] = useState('');
  const [proofFileName, setProofFileName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const totalAmount = getCartTotal();
  const upiId = '9408578951@upi';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=CarMatrix%20Dealership&am=${totalAmount}&cu=INR`)}`;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload a valid image file (PNG, JPG, JPEG).');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofImage(reader.result);
        if (errorMessage) setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
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

    // Require payment proof if UPI payment is chosen
    if (formData.payment_method.includes('UPI') && !paymentProofImage) {
      setErrorMessage('Please upload your UPI payment screenshot proof before placing your order.');
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
        payment_proof: paymentProofImage || null,
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
          <p className="page-subtitle">Enter your shipping details, scan UPI QR code, upload payment proof, and complete your purchase</p>
        </div>
      </div>

      {orderSuccess ? (
        <div className="table-card glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
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
            {orderSuccess.payment_proof && (
              <div className="receipt-row" style={{ flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)' }}>
                <span>Payment Screenshot Proof Verified:</span>
                <img 
                  src={orderSuccess.payment_proof} 
                  alt="UPI Payment Proof" 
                  style={{ maxHeight: '140px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', objectFit: 'contain' }} 
                />
              </div>
            )}
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
                <label className={`payment-option ${formData.payment_method.includes('UPI') ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="UPI Payment (9408578951@upi)"
                    checked={formData.payment_method.includes('UPI')}
                    onChange={handleChange}
                  />
                  <Smartphone size={20} />
                  <span>UPI Payment (QR Code + Upload Proof)</span>
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

              {/* Display UPI QR Code & Payment Proof Upload Box */}
              {formData.payment_method.includes('UPI') && (
                <div className="upi-qr-card glass-panel" style={{ marginTop: '1.25rem', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)' }}>
                    <QrCode size={20} />
                    <span>Scan & Pay via any UPI App</span>
                  </div>

                  <div className="qr-container" style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'inline-block', border: '2px solid var(--primary)' }}>
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI QR Code 9408578951@upi" 
                      style={{ width: '180px', height: '180px', display: 'block' }} 
                    />
                  </div>

                  <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    UPI ID: <strong style={{ color: 'var(--accent-emerald)', fontSize: '1rem' }}>{upiId}</strong>
                  </div>

                  {/* Payment Proof Upload Section */}
                  <div className="proof-upload-box" style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', textAlign: 'left' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={18} className="text-indigo-400" />
                      <span>Upload Payment Screenshot Proof <strong style={{ color: 'var(--danger)' }}>*</strong></span>
                    </label>

                    <div className="upload-input-container">
                      <input 
                        type="file" 
                        id="upi-proof-file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="upi-proof-file" className="btn btn-secondary upload-btn">
                        <Upload size={18} />
                        <span>{proofFileName ? 'Change Screenshot' : 'Choose Screenshot Image'}</span>
                      </label>
                      {proofFileName && (
                        <span className="file-name-badge">
                          <Check size={14} className="text-success" />
                          <span>{proofFileName}</span>
                        </span>
                      )}
                    </div>

                    {paymentProofImage && (
                      <div className="proof-preview-container" style={{ marginTop: '0.85rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Payment Screenshot Preview:</p>
                        <img 
                          src={paymentProofImage} 
                          alt="Payment Screenshot Proof Preview" 
                          style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                    <span>Place Order & Pay {formatINR(totalAmount)}</span>
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
