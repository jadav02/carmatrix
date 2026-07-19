// ==========================================
// Dealership Role-Based Dashboard
// ==========================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getVehicles, getInventorySummary } from '../api/vehicles';
import { getUsers } from '../api/users';
import { getSales } from '../api/sales';
import { formatINR } from '../utils/formatters';
import { 
  Car, 
  Boxes, 
  Users, 
  ShoppingCart, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  ArrowRight 
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRole = (user?.role || 'sales').toLowerCase();
  const role = userRole.includes('admin') ? 'admin' : userRole.includes('manager') ? 'manager' : 'sales';

  const [summary, setSummary] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const sData = await getInventorySummary().catch(() => null);
        setSummary(sData);

        if (role === 'admin') {
          const uData = await getUsers().catch(() => []);
          setUserCount(uData ? uData.length : 0);
        }

        if (role === 'sales' || role === 'admin') {
          const salesData = await getSales().catch(() => []);
          setSalesCount(salesData ? salesData.length : 0);
        }
      } catch (err) {
        // Handle error gracefully
      }
    };
    loadDashboardData();
  }, [role]);

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner glass-panel">
        <div className="welcome-text">
          <div className="welcome-tag">
            <Sparkles size={16} />
            <span>
              {role === 'admin' && 'Administrator Portal'}
              {role === 'manager' && 'Inventory Management Portal'}
              {role === 'sales' && 'Sales Portal'}
            </span>
          </div>
          <h1>Welcome back, <span className="gradient-text">{user?.name || 'Employee'}</span>!</h1>
          <p>
            Welcome to CarMatrix. Manage vehicles, inventory, and dealership operations from one place.
          </p>
        </div>
        <div className="welcome-badge">
          <ShieldCheck size={48} className="shield-icon" />
        </div>
      </div>

      {/* Role-Based Widgets */}

      {/* Administrator Dashboard Widgets */}
      {role === 'admin' && (
        <div className="metrics-grid">
          <div className="metric-card glass-panel" onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">User Accounts</span>
              <div className="metric-icon-bg indigo">
                <Users size={20} />
              </div>
            </div>
            <div className="metric-value">{userCount}</div>
            <div className="metric-sub">Manage & Approve Users</div>
          </div>

          <div className="metric-card glass-panel" onClick={() => navigate('/vehicles')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Vehicle Models</span>
              <div className="metric-icon-bg cyan">
                <Car size={20} />
              </div>
            </div>
            <div className="metric-value">{summary?.total_vehicles || 0}</div>
            <div className="metric-sub">Full Vehicle CRUD</div>
          </div>

          <div className="metric-card glass-panel" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Total Units in Stock</span>
              <div className="metric-icon-bg emerald">
                <Boxes size={20} />
              </div>
            </div>
            <div className="metric-value">{summary?.total_quantity || 0}</div>
            <div className="metric-sub">Purchase & Restock Stock</div>
          </div>

          <div className="metric-card glass-panel" onClick={() => navigate('/reports')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Executive Reports</span>
              <div className="metric-icon-bg violet">
                <ShoppingCart size={20} />
              </div>
            </div>
            <div className="metric-value">{formatINR(summary?.total_inventory_value || 0)}</div>
            <div className="metric-sub">Revenue, Costs & Profit</div>
          </div>
        </div>
      )}

      {/* Inventory Manager Dashboard Widgets */}
      {role === 'manager' && (
        <div className="metrics-grid">
          <div className="metric-card glass-panel" onClick={() => navigate('/vehicles')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Vehicle Models</span>
              <div className="metric-icon-bg indigo">
                <Car size={20} />
              </div>
            </div>
            <div className="metric-value">{summary?.total_vehicles || 0}</div>
            <div className="metric-sub">Add & Update Vehicles</div>
          </div>

          <div className="metric-card glass-panel" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Total Units in Stock</span>
              <div className="metric-icon-bg emerald">
                <Boxes size={20} />
              </div>
            </div>
            <div className="metric-value">{summary?.total_quantity || 0}</div>
            <div className="metric-sub">Purchase & Restock Stock</div>
          </div>

          <div className="metric-card glass-panel" onClick={() => navigate('/inventory?filter=low_stock')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Low Stock Alerts</span>
              <div className="metric-icon-bg violet">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="metric-value" style={{ color: (summary?.low_stock_count || 0) > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {summary?.low_stock_count || 0}
            </div>
            <div className="metric-sub">Restock Urgent Items</div>
          </div>
        </div>
      )}

      {/* Sales Representative Dashboard Widgets */}
      {role === 'sales' && (
        <div className="metrics-grid">
          <div className="metric-card glass-panel" onClick={() => navigate('/vehicles')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Available Vehicles</span>
              <div className="metric-icon-bg indigo">
                <Car size={20} />
              </div>
            </div>
            <div className="metric-value">{summary?.total_vehicles || 0}</div>
            <div className="metric-sub">Check Stock Availability</div>
          </div>

          <div className="metric-card glass-panel" onClick={() => navigate('/sales')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">My Customer Sales</span>
              <div className="metric-icon-bg emerald">
                <ShoppingCart size={20} />
              </div>
            </div>
            <div className="metric-value">{salesCount}</div>
            <div className="metric-sub">Record Customer Sale</div>
          </div>

          <div className="metric-card glass-panel" onClick={() => navigate('/sales?view=history')} style={{ cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Available Units</span>
              <div className="metric-icon-bg cyan">
                <Boxes size={20} />
              </div>
            </div>
            <div className="metric-value">{summary?.total_quantity || 0}</div>
            <div className="metric-sub">Units Ready for Sale</div>
          </div>
        </div>
      )}

      {/* Role-based Quick Action Card */}
      <div className="info-grid" style={{ marginTop: '1rem' }}>
        <div className="info-card glass-panel">
          <div className="info-card-header">
            <Sparkles size={20} className="text-indigo-400" />
            <h2>Quick Shortcuts</h2>
          </div>
          <div className="info-card-body">
            <div className="quick-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {role === 'admin' && (
                <>
                  <button className="btn btn-primary" onClick={() => navigate('/users')}>
                    <Users size={18} />
                    <span>User Management</span>
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
                    <ArrowRight size={18} />
                    <span>View Financial Reports</span>
                  </button>
                </>
              )}

              {role === 'manager' && (
                <>
                  <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
                    <Plus size={18} />
                    <span>Add New Vehicle</span>
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>
                    <Boxes size={18} />
                    <span>Restock Inventory</span>
                  </button>
                </>
              )}

              {role === 'sales' && (
                <>
                  <button className="btn btn-primary" onClick={() => navigate('/sales')}>
                    <ShoppingCart size={18} />
                    <span>Sell Vehicle</span>
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/vehicles')}>
                    <Car size={18} />
                    <span>View Available Vehicles</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
