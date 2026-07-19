// ==========================================
// Login Page Component
// ==========================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Car } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your dealership inventory</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="name@dealership.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <Mail className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
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

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
            style={{ marginTop: '0.75rem' }}
          >
            {submitting ? (
              <>
                <div className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
