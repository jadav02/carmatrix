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
            <span className="brand-name gradient-text">AutoVault</span>
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

        <div className="nav-item disabled" title="Vehicle module coming in next update">
          <Car size={20} />
          <span>Vehicles</span>
          <span className="badge-soon">Soon</span>
        </div>

        <div className="nav-item disabled" title="Inventory module coming in next update">
          <Boxes size={20} />
          <span>Inventory</span>
          <span className="badge-soon">Soon</span>
        </div>
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
