// ==========================================
// Customer Checkout & Billing Page with UPI Token & Bank Transfer Proof
// ==========================================
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkout } from '../api/orders';
import { formatINR } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Car, 
  ShieldCheck, 
  Smartphone, 
  Lock,
  QrCode,
  Upload,
  Image as ImageIcon,
  Check,
  Building2,
  Copy
} from 'lucide-react';
import './Checkout.css';

const TOKEN_AMOUNT = 100000; // ₹1,00,000 Token Amount

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipping_address: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'UPI Payment',
    payment_type: 'Token Payment', // 'Token Payment' | 'Full Payment'
  });

  const [paymentProofImage, setPaymentProofImage] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const totalAmount = getCartTotal();

  // Calculate payment amounts
  const isTokenPayment = formData.payment_type === 'Token Payment' || formData.payment_method === 'UPI Payment';
  const amountToPayNow = isTokenPayment ? TOKEN_AMOUNT : totalAmount;
  const balanceOnDelivery = isTokenPayment ? Math.max(0, totalAmount - TOKEN_AMOUNT) : 0;

  const upiId = '9408578951@upi';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=CarMatrix%20Motors&am=${amountToPayNow}&cu=INR`)}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'payment_method' && value === 'UPI Payment') {
        next.payment_type = 'Token Payment';
      }
      return next;
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload a valid screenshot image file (PNG, JPG, JPEG).');
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

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
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

    // Require payment proof screenshot for both UPI and Bank Transfer
    if (!paymentProofImage) {
      setErrorMessage('Please upload your payment screenshot proof before placing your order.');
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
        payment_type: isTokenPayment ? 'Token Payment' : 'Full Payment',
        payment_proof: paymentProofImage,
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
          <p className="page-subtitle">Pay Token Amount (₹1,00,000) or Full Amount via UPI or Bank Transfer</p>
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
              <span>Payment Option:</span>
              <strong>{orderSuccess.payment_method} ({orderSuccess.payment_type})</strong>
            </div>
            <div className="receipt-row">
              <span>Amount Paid Now:</span>
              <strong className="text-emerald">{formatINR(orderSuccess.amount_paid || TOKEN_AMOUNT)}</strong>
            </div>
            {orderSuccess.balance_due > 0 && (
              <div className="receipt-row">
                <span>Balance Payable on Delivery:</span>
                <strong style={{ color: '#f59e0b' }}>{formatINR(orderSuccess.balance_due)}</strong>
              </div>
            )}
            <div className="receipt-row">
              <span>Total Vehicle Price:</span>
              <span>{formatINR(orderSuccess.total_amount)}</span>
            </div>
            <div className="receipt-row">
              <span>Delivery Address:</span>
              <span>{orderSuccess.shipping_address}</span>
            </div>

            {orderSuccess.payment_proof && (
              <div className="receipt-row" style={{ flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)' }}>
                <span>Payment Screenshot Proof Verified:</span>
                <img 
                  src={orderSuccess.payment_proof} 
                  alt="Payment Proof" 
                  style={{ maxHeight: '150px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', objectFit: 'contain' }} 
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
                <Building2 size={20} className="text-violet-400" />
                <span>Select Payment Method</span>
              </h2>

              <div className="payment-options">
                <label className={`payment-option ${formData.payment_method === 'UPI Payment' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="UPI Payment"
                    checked={formData.payment_method === 'UPI Payment'}
                    onChange={handleChange}
                  />
                  <Smartphone size={20} />
                  <span>UPI Payment (Token Amount ₹1,00,000)</span>
                </label>

                <label className={`payment-option ${formData.payment_method === 'Bank Transfer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="Bank Transfer"
                    checked={formData.payment_method === 'Bank Transfer'}
                    onChange={handleChange}
                  />
                  <Building2 size={20} />
                  <span>Bank Transfer (NEFT / RTGS / IMPS)</span>
                </label>
              </div>

              {/* If Bank Transfer selected -> Choose Token Amount vs Full Payment */}
              {formData.payment_method === 'Bank Transfer' && (
                <div className="bank-mode-selector glass-panel" style={{ marginTop: '1rem', padding: '1.25rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.6rem' }}>Select Bank Transfer Payment Option:</label>
                  <div className="sub-payment-options" style={{ display: 'flex', gap: '1rem' }}>
                    <label className={`sub-option ${formData.payment_type === 'Token Payment' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment_type"
                        value="Token Payment"
                        checked={formData.payment_type === 'Token Payment'}
                        onChange={handleChange}
                      />
                      <span>Token Amount (₹1,00,000)</span>
                    </label>

                    <label className={`sub-option ${formData.payment_type === 'Full Payment' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment_type"
                        value="Full Payment"
                        checked={formData.payment_type === 'Full Payment'}
                        onChange={handleChange}
                      />
                      <span>Full Payment ({formatINR(totalAmount)})</span>
                    </label>
                  </div>
                </div>
              )}

              {/* UPI Payment Instructions & QR Code Box */}
              {formData.payment_method === 'UPI Payment' && (
                <div className="upi-qr-card glass-panel" style={{ marginTop: '1.25rem', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)' }}>
                    <QrCode size={20} />
                    <span>Scan & Pay Token Amount of ₹1,00,000</span>
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
                  <p style={{ fontSize: '0.82rem', color: '#f59e0b', marginTop: '0.35rem', fontWeight: '600' }}>
                    * Balance amount of {formatINR(balanceOnDelivery)} is payable at the time of delivery.
                  </p>
                </div>
              )}

              {/* Bank Transfer Details Box */}
              {formData.payment_method === 'Bank Transfer' && (
                <div className="bank-details-card glass-panel" style={{ marginTop: '1.25rem', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <Building2 size={20} />
                    <span>Company Bank Account Details</span>
                  </h3>

                  <div className="bank-info-grid">
                    <div className="bank-info-row">
                      <span className="bank-label">Company / Account Name:</span>
                      <div className="bank-value-group">
                        <strong>CarMatrix Motors Private Limited</strong>
                        <button type="button" className="copy-btn" onClick={() => copyToClipboard('CarMatrix Motors Private Limited', 'name')}>
                          {copiedField === 'name' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="bank-info-row">
                      <span className="bank-label">Bank Account Number:</span>
                      <div className="bank-value-group">
                        <strong className="text-indigo-400" style={{ fontSize: '1.1rem' }}>12345678901</strong>
                        <button type="button" className="copy-btn" onClick={() => copyToClipboard('12345678901', 'acc')}>
                          {copiedField === 'acc' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="bank-info-row">
                      <span className="bank-label">IFSC Code:</span>
                      <div className="bank-value-group">
                        <strong className="text-indigo-400" style={{ fontSize: '1.05rem' }}>IFSC0012131</strong>
                        <button type="button" className="copy-btn" onClick={() => copyToClipboard('IFSC0012131', 'ifsc')}>
                          {copiedField === 'ifsc' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="bank-info-row">
                      <span className="bank-label">Transfer Amount:</span>
                      <strong className="text-emerald" style={{ fontSize: '1.15rem' }}>{formatINR(amountToPayNow)}</strong>
                    </div>
                  </div>

                  {isTokenPayment && (
                    <p style={{ fontSize: '0.82rem', color: '#f59e0b', marginTop: '0.85rem', fontWeight: '600' }}>
                      * Balance amount of {formatINR(balanceOnDelivery)} is payable at the time of vehicle delivery.
                    </p>
                  )}
                </div>
              )}

              {/* Upload Screenshot Proof Section */}
              <div className="proof-upload-box glass-panel" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={18} className="text-indigo-400" />
                  <span>Upload Payment Screenshot Proof <strong style={{ color: 'var(--danger)' }}>*</strong></span>
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                  Please attach a screenshot image of your successful {formData.payment_method} transaction of {formatINR(amountToPayNow)}.
                </p>

                <div className="upload-input-container">
                  <input 
                    type="file" 
                    id="payment-proof-file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="payment-proof-file" className="btn btn-secondary upload-btn">
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

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
                style={{ marginTop: '1.75rem' }}
              >
                {submitting ? (
                  <>
                    <div className="spinner" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Place Order & Pay Token {formatINR(amountToPayNow)}</span>
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
              <div className="summary-row">
                <span>Total Vehicle Price</span>
                <span>{formatINR(totalAmount)}</span>
              </div>
              <div className="summary-row" style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>
                <span>Amount Paid Now ({isTokenPayment ? 'Token' : 'Full'})</span>
                <span>{formatINR(amountToPayNow)}</span>
              </div>
              {isTokenPayment && (
                <div className="summary-row" style={{ color: '#f59e0b', fontWeight: '700' }}>
                  <span>Payable at Delivery</span>
                  <span>{formatINR(balanceOnDelivery)}</span>
                </div>
              )}
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
