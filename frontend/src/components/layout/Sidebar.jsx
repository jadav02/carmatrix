// ==========================================
// Sidebar Navigation Component with Customer & RBAC Menus
// ==========================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Boxes, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  History,
  ShoppingBag,
  CreditCard,
  PackageCheck,
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ isOpen }) {
  const { user } = useAuth();

  const userRole = (user?.role || 'customer').toLowerCase();
  let role = 'customer';
  if (userRole.includes('admin')) role = 'admin';
  else if (userRole.includes('manager')) role = 'manager';
  else if (userRole.includes('sales')) role = 'sales';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <Car className="brand-icon" size={28} />
          <div className="brand-text">
            <span className="brand-name gradient-text">CarMatrix</span>
            <span className="brand-sub">{role === 'customer' ? 'Storefront' : 'Management'}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">
          {role === 'admin' && 'Administrator Menu'}
          {role === 'manager' && 'Inventory Menu'}
          {role === 'sales' && 'Sales Menu'}
          {role === 'customer' && 'Customer Menu'}
        </div>

        {/* Customer Sidebar */}
        {role === 'customer' ? (
          <>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Car size={20} />
              <span>Browse Vehicles</span>
            </NavLink>

            <NavLink 
              to="/cart" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ShoppingBag size={20} />
              <span>Shopping Cart</span>
            </NavLink>

            <NavLink 
              to="/checkout" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={20} />
              <span>Checkout & Billing</span>
            </NavLink>

            <NavLink 
              to="/customer/orders" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <PackageCheck size={20} />
              <span>Purchase History</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* Staff / Admin Common Dashboard */}
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            {/* Administrator Sidebar */}
            {role === 'admin' && (
              <>
                <NavLink 
                  to="/users" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Users size={20} />
                  <span>Users</span>
                </NavLink>

                <NavLink 
                  to="/vehicles" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Car size={20} />
                  <span>Vehicles</span>
                </NavLink>

                <NavLink 
                  to="/inventory" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Boxes size={20} />
                  <span>Inventory</span>
                </NavLink>

                <NavLink 
                  to="/sales" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <ShoppingCart size={20} />
                  <span>Sales</span>
                </NavLink>

                <NavLink 
                  to="/reports" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <BarChart3 size={20} />
                  <span>Reports</span>
                </NavLink>

                <NavLink 
                  to="/settings" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </NavLink>
              </>
            )}

            {/* Inventory Manager Sidebar */}
            {role === 'manager' && (
              <>
                <NavLink 
                  to="/vehicles" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Car size={20} />
                  <span>Vehicles</span>
                </NavLink>

                <NavLink 
                  to="/inventory" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Boxes size={20} />
                  <span>Inventory</span>
                </NavLink>

                <NavLink 
                  to="/inventory?filter=low_stock" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <AlertTriangle size={20} />
                  <span>Low Stock</span>
                </NavLink>
              </>
            )}

            {/* Sales Representative Sidebar */}
            {role === 'sales' && (
              <>
                <NavLink 
                  to="/vehicles" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Car size={20} />
                  <span>Available Vehicles</span>
                </NavLink>

                <NavLink 
                  to="/sales" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <ShoppingCart size={20} />
                  <span>Sell Vehicle</span>
                </NavLink>

                <NavLink 
                  to="/sales?view=history" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <History size={20} />
                  <span>Sales History</span>
                </NavLink>
              </>
            )}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="pro-card">
          <Sparkles className="pro-icon" size={20} />
          <div className="pro-info">
            <span className="pro-title">Connection Status</span>
            <span className="pro-desc">System Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
