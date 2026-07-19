// ==========================================
// Main Dashboard Layout Shell
// ==========================================
// Combines Sidebar, Navbar, and Content area.
// ==========================================

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="main-content">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
