import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💰</div>
        <span>Vault</span>
      </div>

      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">⬛</span> Dashboard
      </NavLink>
      <NavLink to="/send" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">↗</span> Send Money
      </NavLink>
      <NavLink to="/statement" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📋</span> Statement
      </NavLink>

      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="email">{user?.email}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
