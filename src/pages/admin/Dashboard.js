import React, { useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const stats = [
    {
      count: 45,
      label: 'Tour',
      color: '#3498db',
      icon: '🏖️',
      onViewDetails: () => navigate('/admin/tours')
    },
    {
      count: 120,
      label: 'Người dùng',
      color: '#2ecc71',
      icon: '👥',
      onViewDetails: () => navigate('/admin/users')
    },
    {
      count: 20,
      label: 'Tour đã đặt',
      color: '#f1c40f',
      icon: '✅',
      onViewDetails: () => navigate('/admin/bookings')
    },
    {
      count: 15,
      label: 'Khuyến mãi',
      color: '#e74c3c',
      icon: '🎫',
      onViewDetails: () => navigate('/admin/promotions')
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Thực hiện tìm kiếm dựa vào searchTerm
      console.log('Searching for:', searchTerm);
      
      // Ví dụ: Nếu tìm kiếm chứa từ "tour", chuyển đến trang quản lý tour
      if (searchTerm.toLowerCase().includes('tour')) {
        navigate('/admin/tours');
      }
      // Nếu tìm kiếm chứa từ "user" hoặc "người dùng", chuyển đến trang quản lý user
      else if (searchTerm.toLowerCase().includes('user') || searchTerm.toLowerCase().includes('người dùng')) {
        navigate('/admin/users');
      }
      // Tương tự cho các trường hợp khác...
    }
  };

  return (
    <Container fluid className="dashboard-container py-4">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Xem tổng quan về hệ thống</p>
          </div>
          <Form onSubmit={handleSearch} className="dashboard-search">
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm..."
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <BsSearch />
              </Button>
            </InputGroup>
          </Form>
        </div>
      </div>

      <Row className="g-4">
        {stats.map((stat, index) => (
          <Col key={index} xs={12} sm={6} xl={3}>
            <div className="dashboard-card" style={{ borderColor: stat.color }}>
              <div className="card-icon" style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
              <div className="card-content">
                <h3 className="card-count">{stat.count}</h3>
                <p className="card-label">{stat.label}</p>
              </div>
              <Button 
                variant="link" 
                className="card-action"
                onClick={stat.onViewDetails}
              >
                Xem chi tiết
              </Button>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Dashboard; 