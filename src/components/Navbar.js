import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const currentAdmin = authService.getCurrentAdmin();
    const user = currentAdmin || currentUser;

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <BootstrapNavbar expand="lg" className="bg-white shadow-sm">
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/">
                    Smart Tour Booking
                </BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        <Nav.Link as={Link} to="/tours">Tours</Nav.Link>
                        <Nav.Link as={Link} to="/about">Giới thiệu</Nav.Link>
                        <Nav.Link as={Link} to="/contact">Liên hệ</Nav.Link>
                    </Nav>
                    <Nav>
                        {user ? (
                            <NavDropdown 
                                title={
                                    <span className="user-name">
                                        {user.fullName || user.username}
                                    </span>
                                } 
                                id="user-nav-dropdown"
                            >
                                <NavDropdown.Item as={Link} to="/profile">
                                    Thông tin tài khoản
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/my-bookings">
                                    Đơn đặt tour
                                </NavDropdown.Item>
                                {currentAdmin && (
                                    <>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item as={Link} to="/admin/dashboard">
                                            Quản lý hệ thống
                                        </NavDropdown.Item>
                                    </>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    Đăng xuất
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                                <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
                            </>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar; 