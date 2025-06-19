import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { createCustomTour } from '../../services/tourService';
import './CustomTour.css';

const CustomTour = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    capacity: '',
    adultsCapacity: '',
    childrenCapacity: '',
    startDate: '',
    endDate: '',
    description: '',
    region: 'DOMESTIC'
  });

  const [status, setStatus] = useState({
    message: '',
    type: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuyển đổi định dạng ngày giờ
      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        capacity: parseInt(formData.capacity),
        adultsCapacity: parseInt(formData.adultsCapacity),
        childrenCapacity: parseInt(formData.childrenCapacity)
      };

      const response = await createCustomTour(formattedData);
      setStatus({
        message: 'Yêu cầu đặt tour của bạn đã được gửi thành công!',
        type: 'success'
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        destination: '',
        capacity: '',
        adultsCapacity: '',
        childrenCapacity: '',
        startDate: '',
        endDate: '',
        description: '',
        region: 'DOMESTIC'
      });
    } catch (error) {
      setStatus({
        message: 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!',
        type: 'danger'
      });
    }
  };

  return (
    <Container className="custom-tour-container py-5">
      <h2 className="text-center mb-4">Đặt Tour Theo Yêu Cầu</h2>
      {status.message && (
        <Alert variant={status.type} className="mb-4">
          {status.message}
        </Alert>
      )}
      <Form onSubmit={handleSubmit} className="custom-tour-form">
        <Form.Group className="mb-3">
          <Form.Label>Họ và tên</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Điểm đến</Form.Label>
          <Form.Control
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <div className="row">
          <Form.Group className="col-md-4 mb-3">
            <Form.Label>Tổng số người</Form.Label>
            <Form.Control
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
            />
          </Form.Group>

          <Form.Group className="col-md-4 mb-3">
            <Form.Label>Số người lớn</Form.Label>
            <Form.Control
              type="number"
              name="adultsCapacity"
              value={formData.adultsCapacity}
              onChange={handleChange}
              required
              min="1"
            />
          </Form.Group>

          <Form.Group className="col-md-4 mb-3">
            <Form.Label>Số trẻ em</Form.Label>
            <Form.Control
              type="number"
              name="childrenCapacity"
              value={formData.childrenCapacity}
              onChange={handleChange}
              required
              min="0"
            />
          </Form.Group>
        </div>

        <div className="row">
          <Form.Group className="col-md-6 mb-3">
            <Form.Label>Ngày bắt đầu</Form.Label>
            <Form.Control
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-md-6 mb-3">
            <Form.Label>Ngày kết thúc</Form.Label>
            <Form.Control
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Mô tả yêu cầu</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <div className="text-center">
          <Button variant="primary" type="submit" size="lg">
            Gửi Yêu Cầu
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CustomTour; 