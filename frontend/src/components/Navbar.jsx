import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Function to check if the current route matches
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav>
      <div className="container">
        <div className="navbar-brand">
          <Link to="/">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ticketsystem
          </Link>
        </div>
        
        <div className="nav-links">
          {currentUser ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
              <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>Profile</Link>
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>Admin</Link>
                  <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>Users</Link>
                </>
              )}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link>
              <Link to="/register" className={isActive('/register') ? 'active' : ''}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
