import React, { useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="ms-3">
          <img src="/logo.png" alt="Smart Tour" height="40" />
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
                <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                <Nav.Link as={Link} to="/tours">Tour du lịch</Nav.Link>
                <Nav.Link as={Link} to="/promotions">Khuyến mãi</Nav.Link>
                <Nav.Link as={Link} to="/check-booking">Kiểm tra đơn hàng</Nav.Link>
                <Nav.Link as={Link} to="/contact">Liên hệ</Nav.Link>
                {currentUser && <Nav.Link as={Link} to="/history">Lịch sử</Nav.Link>}
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
                      className="me-3 text-dark"
                      style={{ textDecoration: 'none' }}
                    >
                      <i className="fas fa-cogs me-2"></i>
                      Trang quản trị
                    </Nav.Link>
                  )}
                  <Nav.Link 
                    as={Link} 
                    to={isAdminPage ? "/admin/profile" : "/profile"}
                    className="me-3 text-dark"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fas fa-user me-2"></i>
                    {currentUser.name || 'Tài khoản'}
                  </Nav.Link>
                  <Nav.Link 
                    onClick={handleLogout}
                    className="text-dark"
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
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
                  className="me-3 text-dark"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Đăng nhập
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register"
                  className="text-dark"
                  style={{ textDecoration: 'none' }}
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