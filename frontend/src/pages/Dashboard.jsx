// ==========================================
// Dealership Employee Dashboard
// ==========================================
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, Boxes, ShieldCheck, User, Calendar, Sparkles } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const userRoleDisplay = user?.role 
    ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Executive`
    : 'Sales Executive';

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner glass-panel">
        <div className="welcome-text">
          <div className="welcome-tag">
            <Sparkles size={16} />
            <span>Dealership Account Active</span>
          </div>
          <h1>Welcome back, <span className="gradient-text">{user?.name || 'Employee'}</span>!</h1>
          <p>
            You are signed in as <strong style={{ color: 'var(--primary)' }}>{user?.email}</strong>.
          </p>
        </div>
        <div className="welcome-badge">
          <ShieldCheck size={48} className="shield-icon" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">User Account</span>
            <div className="metric-icon-bg indigo">
              <User size={20} />
            </div>
          </div>
          <div className="metric-value">{user?.name || 'Employee'}</div>
          <div className="metric-sub">{user?.email}</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Assigned Role</span>
            <div className="metric-icon-bg violet">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ textTransform: 'capitalize' }}>
            {user?.role || 'Sales'}
          </div>
          <div className="metric-sub">Role: {userRoleDisplay}</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Vehicle Management</span>
            <div className="metric-icon-bg cyan">
              <Car size={20} />
            </div>
          </div>
          <div className="metric-value">Ready</div>
          <div className="metric-sub">Vehicle Management Ready</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Inventory Control</span>
            <div className="metric-icon-bg emerald">
              <Boxes size={20} />
            </div>
          </div>
          <div className="metric-value">Ready</div>
          <div className="metric-sub">Inventory Ready</div>
        </div>
      </div>

      {/* Account Info & Overview Cards */}
      <div className="info-grid">
        <div className="info-card glass-panel">
          <div className="info-card-header">
            <User size={20} className="text-indigo-400" />
            <h2>Account Information</h2>
          </div>
          <div className="info-card-body">
            <div className="info-row">
              <span className="info-label">Account Type</span>
              <span className="info-val">Secure Login</span>
            </div>
            <div className="info-row">
              <span className="info-label">Login Status</span>
              <span className="info-val success-text">Signed in Successfully</span>
            </div>
            <div className="info-row">
              <span className="info-label">Account Access</span>
              <span className="info-val success-text">Active</span>
            </div>
          </div>
        </div>

        <div className="info-card glass-panel">
          <div className="info-card-header">
            <Calendar size={20} className="text-violet-400" />
            <h2>System Overview</h2>
          </div>
          <div className="info-card-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Welcome to CarMatrix. Manage vehicles, inventory, and dealership operations from one place.
            </p>
            <div className="quick-actions">
              <button onClick={logout} className="btn btn-danger">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
