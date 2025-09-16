import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`header glass${isAuthPage ? ' header--auth' : ''}`}>
      <div className="container">
        <nav className="header__nav">
          <Link to="/" className="header__logo hover-scale animate-fadeIn">
            <span className="text-3xl">🛒</span>
            <span className="gradient-text">WeShop</span>
          </Link>
          
          <ul className="header__links">
            <li><Link to="/shops" className="header__link hover-glow">Shops</Link></li>
            <li><Link to="/products" className="header__link hover-glow">Products</Link></li>
            <li><ThemeToggle /></li>
            
            {user ? (
              <>
                <li><Link to="/orders" className="header__link hover-glow">Orders</Link></li>
                {user.role === 'seller' && (
                  <li><Link to="/dashboard" className="header__link hover-glow">Dashboard</Link></li>
                )}
                {user.role === 'admin' && (
                  <>
                    <li><Link to="/dashboard" className="header__link hover-glow">Dashboard</Link></li>
                    <li><Link to="/admin" className="header__link hover-glow animate-glow">Admin Panel</Link></li>
                  </>
                )}
                <li className="dropdown">
                  <span className="header__link hover-glow">
                    <span className={`badge ${
                      user.role === 'admin' ? 'badge--purple' : 
                      user.role === 'seller' ? 'badge--teal' : 
                      'badge--indigo'
                    }`}>{user.role}</span>
                    {user.username}
                  </span>
                  <div className="dropdown__content">
                    <div className="dropdown__item">
                      <strong>Welcome, {user.username}!</strong>
                    </div>
                    <div className="dropdown__item">
                      Role: <span className={`badge ${
                        user.role === 'admin' ? 'badge--purple' : 
                        user.role === 'seller' ? 'badge--teal' : 
                        'badge--indigo'
                      }`}>{user.role}</span>
                    </div>
                  </div>
                </li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="header__link hover-glow"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span className="text-lg">👋</span> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="header__link hover-glow animate-bounce">Login</Link></li>
                <li><Link to="/register" className="header__link hover-glow animate-pulse">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
