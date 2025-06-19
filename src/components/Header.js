import React, { useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const isAdminPage = location.pathname.startsWith('/admin');

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

  // Logo style with inline SVG
  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="ms-3 d-flex align-items-center">
          <div style={logoStyle}>
            {/* SVG Logo */}
            <svg width="50" height="50" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="190" stroke="#00E5E5" strokeWidth="20"/>
              <path d="M200 20L200 380" stroke="white" strokeWidth="5" strokeDasharray="10 10"/>
              <path d="M20 200L380 200" stroke="white" strokeWidth="5" strokeDasharray="10 10"/>
              <path d="M200 60V340" stroke="#00E5E5" strokeWidth="10"/>
              <path d="M60 200H340" stroke="#00E5E5" strokeWidth="10"/>
              <path d="M200 200L150 120L200 80L250 120L200 200Z" fill="#00E5E5"/>
              <path d="M200 200L120 150L80 200L120 250L200 200Z" fill="#00E5E5"/>
              <path d="M200 200L250 280L200 320L150 280L200 200Z" fill="#00E5E5"/>
              <path d="M200 200L280 250L320 200L280 150L200 200Z" fill="#00E5E5"/>
              <circle cx="200" cy="200" r="15" fill="#00E5E5"/>
              <path d="M120 120C120 120 150 90 200 90C250 90 280 120 280 120C280 120 250 150 200 150C150 150 120 120 120 120Z" fill="#00E5E5"/>
              <path d="M120 280C120 280 150 310 200 310C250 310 280 280 280 280C280 280 250 250 200 250C150 250 120 280 120 280Z" fill="#00E5E5"/>
            </svg>
            <div>
              <div className="text-light fw-bold fs-4 mb-0">SMART TOUR</div>
              <div className="text-info fs-6">COMPANY</div>
            </div>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAdminPage ? (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/users">Quản lý Users</Nav.Link>
                <Nav.Link as={Link} to="/admin/tours">Quản lý Tours</Nav.Link>
                <Nav.Link as={Link} to="/admin/bookings">Quản lý Đặt tour</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>Trang chủ</Nav.Link>
                <Nav.Link as={Link} to="/tours" className={location.pathname.includes('/tours') ? 'active' : ''}>Tour du lịch</Nav.Link>
                <Nav.Link as={Link} to="/custom-tour" className={location.pathname.includes('/custom-tour') ? 'active' : ''}>Tour theo yêu cầu</Nav.Link>
                <Nav.Link as={Link} to="/promotions" className={location.pathname.includes('/promotions') ? 'active' : ''}>Khuyến mãi</Nav.Link>
                <Nav.Link as={Link} to="/check-booking" className={location.pathname.includes('/check-booking') ? 'active' : ''}>Kiểm tra đơn hàng</Nav.Link>
                <Nav.Link as={Link} to="/contact" className={location.pathname.includes('/contact') ? 'active' : ''}>Liên hệ</Nav.Link>
                {currentUser && <Nav.Link as={Link} to="/history" className={location.pathname.includes('/history') ? 'active' : ''}>Lịch sử</Nav.Link>}
              </>
            )}
          </Nav>
          <Nav className="d-flex align-items-center">
            {currentUser ? (
              <>
                <div className="d-flex align-items-center">
                  {isAdmin() && !isAdminPage && (
                    <Nav.Link 
                      as={Link} 
                      to="/admin/dashboard"
                      className={`me-3 ${location.pathname.includes('/admin') ? 'active' : ''}`}
                    >
                      <i className="fas fa-cogs me-2"></i>
                      Trang quản trị
                    </Nav.Link>
                  )}
                  <Nav.Link 
                    as={Link} 
                    to={isAdminPage ? "/admin/profile" : "/profile"}
                    className={`me-3 ${location.pathname.includes('/profile') ? 'active' : ''}`}
                  >
                    <i className="fas fa-user me-2"></i>
                    {currentUser.name || 'Tài khoản'}
                  </Nav.Link>
                  <Nav.Link 
                    onClick={handleLogout}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Đăng xuất
                  </Nav.Link>
                </div>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className={`me-3 ${location.pathname.includes('/login') ? 'active' : ''}`}
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Đăng nhập
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register"
                  className={location.pathname.includes('/register') ? 'active' : ''}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Đăng ký
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header; 