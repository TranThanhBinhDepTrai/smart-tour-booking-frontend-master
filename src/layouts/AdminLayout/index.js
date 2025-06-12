import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    const location = useLocation();

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col md={2} className="sidebar">
                    <Nav className="flex-column">
                        <Nav.Link 
                            as={Link} 
                            to="/admin/dashboard"
                            className={location.pathname === '/admin/dashboard' ? 'active' : ''}
                        >
                            Dashboard
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/admin/users"
                            className={location.pathname === '/admin/users' ? 'active' : ''}
                        >
                            Số người dùng
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/admin/tours"
                            className={location.pathname === '/admin/tours' ? 'active' : ''}
                        >
                            Quản lý tour
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/admin/promotions"
                            className={location.pathname === '/admin/promotions' ? 'active' : ''}
                        >
                            Quản lý khuyến mãi
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/admin/bookings"
                            className={location.pathname === '/admin/bookings' ? 'active' : ''}
                        >
                            Đặt tour
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/admin/revenue"
                            className={location.pathname === '/admin/revenue' ? 'active' : ''}
                        >
                            Doanh thu
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/admin/support"
                            className={location.pathname === '/admin/support' ? 'active' : ''}
                        >
                            Hỗ trợ
                        </Nav.Link>
                    </Nav>
                </Col>

                {/* Main content */}
                <Col md={10} className="main-content">
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLayout; 