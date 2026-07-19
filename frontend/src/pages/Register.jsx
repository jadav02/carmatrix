// ==========================================
// Register Page Component
// ==========================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, UserPlus, AlertCircle, Eye, EyeOff, Car } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow-bg"></div>

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <Car size={36} className="auth-logo-icon" />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register to join the dealership management system</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="register-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <User className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="register-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="john@dealership.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <Mail className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div className="input-wrapper">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <Lock className="input-icon" size={18} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-role">System Role</label>
            <div className="input-wrapper">
              <select
                id="register-role"
                name="role"
                className="form-input select-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="sales">Sales Representative</option>
                <option value="manager">Inventory Manager</option>
                <option value="admin">Administrator</option>
              </select>
              <Shield className="input-icon" size={18} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
            style={{ marginTop: '0.75rem' }}
          >
            {submitting ? (
              <>
                <div className="spinner" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
