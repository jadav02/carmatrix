// ==========================================
// Access Denied Page Component
// ==========================================
import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.css';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="access-denied-container">
      <div className="access-denied-card glass-panel">
        <div className="icon-wrapper">
          <ShieldAlert size={64} className="text-danger" />
        </div>
        <h1 className="error-title gradient-text">Access Denied</h1>
        <p className="error-desc">
          You do not have permission to view this page or perform this operation.
          Please contact your Administrator if you believe this is an error.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
