import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, loading, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (loading) return <nav className="navbar"><NavLink to="/" className="navbar-brand">⚡ TaskFlow</NavLink></nav>;

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">⚡ TaskFlow</NavLink>
      {user ? (
        <>
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Projects</NavLink>
          </div>
          <div className="navbar-right">
            <span className="user-badge">👤 {user?.name}</span>
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
        <div className="navbar-right">
          <NavLink to="/login" className="btn btn-ghost btn-sm">Login</NavLink>
        </div>
      )}
    </nav>
  );
}