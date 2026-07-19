// ==========================================
// Dashboard Home Page
// ==========================================
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, Boxes, ShieldCheck, User, Calendar, Key, Sparkles } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, token, logout } = useAuth();

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner glass-panel">
        <div className="welcome-text">
          <div className="welcome-tag">
            <Sparkles size={16} />
            <span>Authenticated Session Active</span>
          </div>
          <h1>Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>!</h1>
          <p>
            You are signed in as <strong style={{ color: 'var(--primary)' }}>{user?.email}</strong> with role{' '}
            <span className="role-pill">{user?.role || 'Sales'}</span>.
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
          <div className="metric-value">{user?.name}</div>
          <div className="metric-sub">{user?.email}</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">System Role</span>
            <div className="metric-icon-bg violet">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ textTransform: 'capitalize' }}>
            {user?.role || 'Sales'}
          </div>
          <div className="metric-sub">JWT Permission Granted</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Vehicles Module</span>
            <div className="metric-icon-bg cyan">
              <Car size={20} />
            </div>
          </div>
          <div className="metric-value">Ready</div>
          <div className="metric-sub">Backend API endpoints active</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Inventory Module</span>
            <div className="metric-icon-bg emerald">
              <Boxes size={20} />
            </div>
          </div>
          <div className="metric-value">Ready</div>
          <div className="metric-sub">Backend service logic active</div>
        </div>
      </div>

      {/* Security & Token Info Card */}
      <div className="info-grid">
        <div className="info-card glass-panel">
          <div className="info-card-header">
            <Key size={20} className="text-indigo-400" />
            <h2>Security & Session Authentication</h2>
          </div>
          <div className="info-card-body">
            <div className="info-row">
              <span className="info-label">Authentication Type:</span>
              <span className="info-val">Bearer JWT Token</span>
            </div>
            <div className="info-row">
              <span className="info-label">Session Token:</span>
              <code className="token-preview">
                {token ? `${token.substring(0, 32)}...` : 'None'}
              </code>
            </div>
            <div className="info-row">
              <span className="info-label">Storage Method:</span>
              <span className="info-val">Browser localStorage</span>
            </div>
            <div className="info-row">
              <span className="info-label">Protected Routes:</span>
              <span className="info-val success-text">Active & Enforced</span>
            </div>
          </div>
        </div>

        <div className="info-card glass-panel">
          <div className="info-card-header">
            <Calendar size={20} className="text-violet-400" />
            <h2>System Overview</h2>
          </div>
          <div className="info-card-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6' }}>
              The application foundation is fully set up with React Router, custom AuthContext, secure JWT persistence, and layout components.
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
