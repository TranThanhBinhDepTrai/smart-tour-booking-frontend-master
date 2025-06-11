import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Smart Tour Booking</Link>
      </div>
      <nav className="nav">
        <ul>
          {!user ? (
            <>
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/profile">Tài khoản</Link></li>
              <li><button onClick={handleLogout} className="logout-btn">Đăng xuất</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header; 