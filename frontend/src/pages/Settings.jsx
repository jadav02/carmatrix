// ==========================================
// Settings Page Component (Administrator Only)
// ==========================================
import React, { useState } from 'react';
import { Settings, Shield, Building2, Bell, CheckCircle } from 'lucide-react';
import './Settings.css';

export default function DealershipSettings() {
  const [saved, setSaved] = useState(false);
  const [dealershipName, setDealershipName] = useState('CarMatrix Operations');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">System Settings</h1>
          <p className="page-subtitle">Configure dealership business preferences, security options, and RBAC rules</p>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Dealership configuration saved successfully!</span>
        </div>
      )}

      <div className="table-card glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="dealership-name">Dealership Business Name</label>
            <div className="input-wrapper">
              <input
                id="dealership-name"
                type="text"
                className="form-input"
                value={dealershipName}
                onChange={e => setDealershipName(e.target.value)}
                required
              />
              <Building2 className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">User Account Registration Policy</label>
            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Strict Approval Policy Active: All newly registered accounts are set to <strong>Pending Approval</strong> until an Administrator approves them.
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
            <Settings size={18} />
            <span>Save Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
}
