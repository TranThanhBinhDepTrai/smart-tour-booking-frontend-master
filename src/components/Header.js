import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import logo512 from '../assets/images/logo512.png';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const isAdminPage = location.pathname.startsWith('/admin');
  const [menuOpen, setMenuOpen] = useState(false);

  // Đóng menu khi chuyển route
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    console.log('Header mounted with user:', currentUser);
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="travelvn-header">
      <div className="header-top">
        <div className="header-logo">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <img src={logo512} alt="Logo" className="logo-img" />
            <span className="logo-title">SMART TOUR</span>
          </Link>
        </div>
        <div className="header-hotline">
          <span className="hotline-label"><i className="fas fa-phone-alt"></i> Hotline:</span>
          <a href="tel:19001839" className="hotline-number">1900 1839</a>
        </div>
        {/* Hamburger menu icon */}
        <button className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
      <nav className={`header-nav${menuOpen ? ' open' : ''}`} style={{ position: window.innerWidth <= 992 ? 'absolute' : 'static' }}>
        <ul className="nav-list">
          <li className={location.pathname === '/' ? 'active' : ''}><Link to="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link></li>
          <li className={location.pathname.startsWith('/tours') ? 'active' : ''}><Link to="/tours" onClick={() => setMenuOpen(false)}>Tour du lịch</Link></li>
          <li className={location.pathname.startsWith('/custom-tour') ? 'active' : ''}><Link to="/custom-tour" onClick={() => setMenuOpen(false)}>Tour theo yêu cầu</Link></li>
          <li className={location.pathname.startsWith('/promotions') ? 'active' : ''}><Link to="/promotions" onClick={() => setMenuOpen(false)}>Khuyến mãi</Link></li>
          <li className={location.pathname.startsWith('/check-booking') ? 'active' : ''}><Link to="/check-booking" onClick={() => setMenuOpen(false)}>Kiểm tra đơn hàng</Link></li>
          {currentUser && (
            <li className={location.pathname.startsWith('/history') ? 'active' : ''}><Link to="/history" onClick={() => setMenuOpen(false)}>Lịch sử</Link></li>
          )}
        </ul>
        <ul className="nav-auth">
          {currentUser ? (
            <>
              {isAdmin() && !isAdminPage && (
                <li><Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}><i className="fas fa-cogs"></i> Quản trị</Link></li>
              )}
              <li><Link to={isAdminPage ? "/admin/profile" : "/profile"} onClick={() => setMenuOpen(false)}><i className="fas fa-user"></i> {currentUser.name || 'Tài khoản'}</Link></li>
              <li><button className="logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}><i className="fas fa-sign-out-alt"></i> Đăng xuất</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setMenuOpen(false)}><i className="fas fa-sign-in-alt"></i> Đăng nhập</Link></li>
              <li><Link to="/register" onClick={() => setMenuOpen(false)}><i className="fas fa-user-plus"></i> Đăng ký</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header; 