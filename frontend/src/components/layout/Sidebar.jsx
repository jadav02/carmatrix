// ==========================================
// Sidebar Navigation Component
// ==========================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Boxes, Sparkles } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <Car className="brand-icon" size={28} />
          <div className="brand-text">
            <span className="brand-name gradient-text">CarMatrix</span>
            <span className="brand-sub">Management</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>

        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
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
      </nav>

      <div className="sidebar-footer">
        <div className="pro-card">
          <Sparkles className="pro-icon" size={20} />
          <div className="pro-info">
            <span className="pro-title">System Status</span>
            <span className="pro-desc">FastAPI Backend Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
