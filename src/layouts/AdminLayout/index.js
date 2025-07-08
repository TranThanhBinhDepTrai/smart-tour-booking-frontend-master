import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 900);
            if (window.innerWidth > 900) setMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Container fluid>
            {/* Header admin */}
            <div className="admin-header">
                <span className="admin-title">ADMIN</span>
                {!isDesktop && (
                  <button className="admin-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu">
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                  </button>
                )}
            </div>
            <Row>
                {/* Sidebar */}
                {(menuOpen || isDesktop) && (
                  <Col md={2} className="sidebar">
                      <Nav className="flex-column">
                          <Nav.Link 
                              as={Link} 
                              to="/admin/dashboard"
                              className={location.pathname === '/admin/dashboard' ? 'active' : ''}
                              onClick={() => setMenuOpen(false)}
                          >
                              Dashboard
                          </Nav.Link>
                          <Nav.Link 
                              as={Link} 
                              to="/admin/users"
                              className={location.pathname === '/admin/users' ? 'active' : ''}
                              onClick={() => setMenuOpen(false)}
                          >
                              Số người dùng
                          </Nav.Link>
                          <Nav.Link 
                              as={Link} 
                              to="/admin/tours"
                              className={location.pathname === '/admin/tours' ? 'active' : ''}
                              onClick={() => setMenuOpen(false)}
                          >
                              Quản lý tour
                          </Nav.Link>
                          <Nav.Link 
                              as={Link} 
                              to="/admin/promotions"
                              className={location.pathname === '/admin/promotions' ? 'active' : ''}
                              onClick={() => setMenuOpen(false)}
                          >
                              Quản lý khuyến mãi
                          </Nav.Link>
                          <Nav.Link 
                              as={Link} 
                              to="/admin/bookings"
                              className={location.pathname === '/admin/bookings' ? 'active' : ''}
                              onClick={() => setMenuOpen(false)}
                          >
                              Đặt tour
                          </Nav.Link>
                          <Nav.Link 
                              as={Link} 
                              to="/admin/revenue"
                              className={location.pathname === '/admin/revenue' ? 'active' : ''}
                              onClick={() => setMenuOpen(false)}
                          >
                              Doanh thu
                          </Nav.Link>
                          <Nav.Link 
                              as={Link} 
                              to="/admin/support"
                              className={location.pathname === '/admin/support' ? 'active' : ''}
                              onClick={() => setMenuOpen(false)}
                          >
                              Hỗ trợ
                          </Nav.Link>
                      </Nav>
                  </Col>
                )}
                {/* Main content */}
                <Col md={10} className="main-content">
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLayout; 