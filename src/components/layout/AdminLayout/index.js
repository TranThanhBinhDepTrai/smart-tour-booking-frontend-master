import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const AdminLayout = () => {
    const location = useLocation();

    return (
        <Nav className="flex-column">
            <Nav.Link as={Link} to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                Trang chính
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
                Quản lý người dùng
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/tours" className={location.pathname === '/admin/tours' ? 'active' : ''}>
                Quản lý tour
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/promotions" className={location.pathname === '/admin/promotions' ? 'active' : ''}>
                Quản lý khuyến mãi
            </Nav.Link>
        </Nav>
    );
};

export default AdminLayout; 