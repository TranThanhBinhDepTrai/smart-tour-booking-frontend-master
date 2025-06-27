import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import './Navbar.css';

const Navbar = () => {
    return (
        <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="navbar">
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img
                        src="/logo.png"
                        width="40"
                        height="40"
                        className="d-inline-block align-top"
                        alt="Tour Thông Minh"
                    />
                    <div className="ms-2">
                        <div className="brand-name">TOUR THÔNG MINH</div>
                        <div className="company-text">CÔNG TY</div>
                    </div>
                </BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <Nav.Link as={Link} to="/" className="px-3">Trang chủ</Nav.Link>
                        <Nav.Link as={Link} to="/tours" className="px-3">Tour du lịch</Nav.Link>
                        <Nav.Link as={Link} to="/custom-tour" className="px-3">Tour theo yêu cầu</Nav.Link>
                        <Nav.Link as={Link} to="/promotions" className="px-3">Khuyến mãi</Nav.Link>
                        <Nav.Link as={Link} to="/check-booking" className="px-3">Kiểm tra đơn hàng</Nav.Link>
                        <Nav.Link as={Link} to="/history" className="px-3">Lịch sử</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/admin" className="px-3">Trang quản trị</Nav.Link>
                        <Nav.Link as={Link} to="/profile" className="px-3">Tài khoản</Nav.Link>
                        <Nav.Link as={Link} to="/logout" className="px-3">Đăng xuất</Nav.Link>
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar; 