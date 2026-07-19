// ==========================================
// Protected Route Component with Role Protection
// ==========================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';
import AccessDenied from '../pages/AccessDenied';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

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

  // Normalize user role
  const userRole = (user?.role || 'sales').toLowerCase();
  const normalizedUserRole = userRole.includes('admin') ? 'admin' : userRole.includes('manager') ? 'manager' : 'sales';

  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedUserRole)) {
    return <AccessDenied />;
  }

  return <Outlet />;
}
