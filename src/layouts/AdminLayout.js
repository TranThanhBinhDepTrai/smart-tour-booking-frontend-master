import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Form, Button, Dropdown, Modal } from 'react-bootstrap';
import { FaHome, FaMapMarkedAlt, FaUsers, FaCheckCircle, FaBullhorn, FaChartLine, FaHeadset, FaUserCircle, FaLock, FaUserShield, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import UserBookingHistory from '../components/UserBookingHistory';
import axios from 'axios';
import { exportService } from '../services/exportService';

function AdminLayout() {
  const navigate = useNavigate();
  const { logout, currentUser, isAdmin } = useAuth();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);
  
  // Kiểm tra quyền admin khi vào trang
  useEffect(() => {
    if (!currentUser || !isAdmin()) {
      navigate('/login');
    }
  }, [currentUser, isAdmin, navigate]);

  const handleExportPDF = async (e) => {
    e.preventDefault();
    try {
      await exportService.exportPDF();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const handleExportExcel = async (e) => {
    e.preventDefault();
    try {
      await exportService.exportExcel();
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  const menuItems = [
    { icon: <FaHome className="me-2" />, label: 'Trang chính', path: '/admin' },
    { 
      icon: <FaMapMarkedAlt className="me-2" />, 
      label: 'Quản lý tour', 
      path: '/admin/tours',
      subItems: [
        { icon: <FaFilePdf className="me-2" />, label: 'Export PDF', onClick: handleExportPDF, isExternal: true },
        { icon: <FaFileExcel className="me-2" />, label: 'Export Excel', onClick: handleExportExcel, isExternal: true }
      ] 
    },
    { icon: <FaUsers className="me-2" />, label: 'Số người dùng', path: '/admin/users' },
    { icon: <FaLock className="me-2" />, label: 'Phân quyền', path: '/admin/permissions' },
    { icon: <FaUserShield className="me-2" />, label: 'Vai trò', path: '/admin/roles' },
    { icon: <FaCheckCircle className="me-2" />, label: 'Quản lý đơn đặt tour', path: '/admin/bookings' },
    { icon: <FaBullhorn className="me-2" />, label: 'Quản lý khuyến mãi', path: '/admin/promotions' },
    {
      icon: <FaChartLine className="me-2" />,
      label: 'Tổng doanh thu',
      path: '/admin/revenue',
    },
    { icon: <FaHeadset className="me-2" />, label: 'Quản lý tour theo yêu cầu', path: '/admin/support' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleShowHistory = (user) => {
    setHistoryUser(user);
    setShowHistoryModal(true);
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
              <div key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link py-2 ${isActive ? 'active text-white' : 'text-secondary'}`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
                {item.subItems && (
                  <Nav className="flex-column ms-4">
                    {item.subItems.map((subItem, subIndex) => {
                      if (subItem.isExternal) {
                        return (
                          <a
                            key={subIndex}
                            href="#"
                            onClick={subItem.onClick}
                            className="nav-link py-2 text-secondary"
                            style={{ fontSize: '0.9em' }}
                          >
                            {subItem.icon}
                            {subItem.label}
                          </a>
                        );
                      }
                      return (
                        <NavLink
                          key={subIndex}
                          to={subItem.path}
                          className={({ isActive }) => 
                            `nav-link py-2 ${isActive ? 'active text-white' : 'text-secondary'}`
                          }
                          style={{ fontSize: '0.9em' }}
                        >
                          {subItem.icon}
                          {subItem.label}
                        </NavLink>
                      );
                    })}
                  </Nav>
                )}
              </div>
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
        <div className="p-4">
          <Outlet />
        </div>
      </div>

      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Lịch sử đặt tour: {historyUser?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historyUser && <UserBookingHistory userId={historyUser.id} />}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AdminLayout; 