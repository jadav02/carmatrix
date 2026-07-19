// ==========================================
// Protected Route Component
// ==========================================
// Wraps routes that require JWT authentication.
// Redirects unauthenticated users to /login.
// ==========================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo gradient-text">
          <Car size={36} className="text-indigo-400" />
          <span>CarMatrix</span>
        </div>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
