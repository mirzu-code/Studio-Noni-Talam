import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Studio', badge: 'Bengkel' },
    { path: '/product', label: 'Product', badge: 'TikTok Shop' },
    { path: '/learn', label: 'Learn', badge: 'Video & Game' },
    { path: '/admin', label: 'Admin', badge: 'Portal' }
  ];

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-circle">
            <span className="brand-leaf-icon">🍃</span>
          </div>
          <div className="brand-info">
            <span className="brand-name">NONI TALAM</span>
            <span className="brand-tagline">Studio & Warisan Tradisi</span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button 
          className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Items */}
        <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <div className="nav-item-content">
                  <span className="nav-item-label">{item.label}</span>
                  {item.badge && <span className="nav-item-sub">{item.badge}</span>}
                </div>
                {isActive && <span className="active-indicator" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
