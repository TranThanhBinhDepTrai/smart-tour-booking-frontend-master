import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Form, Button, Dropdown } from 'react-bootstrap';
import { FaHome, FaMapMarkedAlt, FaUsers, FaCheckCircle, FaBullhorn, FaChartLine, FaHeadset, FaUserCircle, FaLock, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout() {
  const navigate = useNavigate();
  const { logout, currentUser, isAdmin } = useAuth();
  
  // Kiểm tra quyền admin khi vào trang
  useEffect(() => {
    if (!currentUser || !isAdmin()) {
      navigate('/login');
    }
  }, [currentUser, isAdmin, navigate]);

  const menuItems = [
    { icon: <FaHome className="me-2" />, label: 'Trang chính', path: '/admin' },
    { icon: <FaMapMarkedAlt className="me-2" />, label: 'Số tour đang hoạt động', path: '/admin/tours' },
    { icon: <FaUsers className="me-2" />, label: 'Số người dùng', path: '/admin/users' },
    { icon: <FaLock className="me-2" />, label: 'Phân quyền', path: '/admin/permissions' },
    { icon: <FaUserShield className="me-2" />, label: 'Vai trò', path: '/admin/roles' },
    { icon: <FaCheckCircle className="me-2" />, label: 'Số tour được đặt', path: '/admin/bookings' },
    { icon: <FaBullhorn className="me-2" />, label: 'Khuyến mãi', path: '/admin/promotions' },
    { icon: <FaChartLine className="me-2" />, label: 'Tổng doanh thu', path: '/admin/revenue' },
    { icon: <FaHeadset className="me-2" />, label: 'Hỗ trợ chờ phản hồi', path: '/admin/support' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nếu không phải admin, không render gì cả
  if (!currentUser || !isAdmin()) {
    return null;
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div 
        className="bg-dark text-white" 
        style={{ 
          width: '280px', 
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflowY: 'auto'
        }}
      >
        <div className="p-3">
          <Form className="mb-4">
            <Form.Control
              type="search"
              placeholder="Tìm kiếm..."
              className="bg-dark text-white border-secondary"
            />
          </Form>
          <Nav className="flex-column">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => 
                  `nav-link py-2 ${isActive ? 'active text-white' : 'text-secondary'}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </Nav>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
        {/* Header */}
        <Navbar bg="black" variant="dark" className="px-4 py-2">
          <Container fluid className="px-0">
            <div>
              <Button variant="link" className="text-white text-decoration-none fw-bold p-0">
                ADMIN
              </Button>
              <Button 
                variant="link" 
                className="text-secondary text-decoration-none ms-3 p-0"
                onClick={() => navigate('/')}
              >
                Website
              </Button>
            </div>
            <div className="d-flex align-items-center">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-white text-decoration-none p-0">
                  <FaUserCircle className="me-2" />
                  {currentUser.fullName || currentUser.email}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate('/admin/profile')}>
                    <FaUserCircle className="me-2" />
                    Thông tin tài khoản
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Container>
        </Navbar>

        {/* Page content */}
        <div className="p-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout; 