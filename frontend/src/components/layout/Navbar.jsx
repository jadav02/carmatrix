// ==========================================
// Top Navigation Bar Component
// ==========================================
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-title">
          <span>CarMatrix Dealership Portal</span>
        </div>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="user-profile-badge">
            <div className="avatar">
              <UserIcon size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">
                <Shield size={12} />
                {user.role || 'Sales Representative'}
              </span>
            </div>
          </div>
        )}

        <button 
          onClick={logout} 
          className="btn btn-danger btn-logout"
          title="Sign out of your account"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
