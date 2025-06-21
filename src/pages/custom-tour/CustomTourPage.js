import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { tourService } from '../../services/tourService';
import './CustomTourPage.css';

const CustomTourPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    capacity: 0,
    adultsCapacity: 0,
    childrenCapacity: 0,
    startDate: '',
    endDate: '',
    description: '',
    region: 'DOMESTIC',
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

  const handleCounterChange = (field, amount) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, parseInt(prev[field] || 0) + amount)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        destination: formData.destination,
        capacity: parseInt(formData.adultsCapacity) + parseInt(formData.childrenCapacity),
        adultsCapacity: parseInt(formData.adultsCapacity),
        childrenCapacity: parseInt(formData.childrenCapacity),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description,
        region: formData.region
      };

      const response = await tourService.createCustomTour(formattedData);
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
        capacity: 0,
        adultsCapacity: 0,
        childrenCapacity: 0,
        startDate: '',
        endDate: '',
        description: '',
        region: 'DOMESTIC',
      });
    } catch (error) {
      console.error('Error submitting custom tour request:', error);
      setStatus({
        message: 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!',
        type: 'danger'
      });
    }
  };

  return (
    <div className="custom-tour-page">
      <div className="custom-tour-header">
        <Container>
          <h1>Tour Theo Yêu Cầu</h1>
          <p>Thiết kế trải nghiệm du lịch riêng cho bạn và gia đình</p>
        </Container>
      </div>

      <Container className="py-4">
        {status.message && (
          <Alert variant={status.type} className="mb-4" onClose={() => setStatus({message: '', type: ''})} dismissible>
            {status.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <Card.Body>
              <h3 className="mb-3">Thông tin liên hệ</h3>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nguyễn Văn A"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="0912345678"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h3 className="mb-3">Thông tin chuyến đi</h3>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Điểm đến</Form.Label>
                    <Form.Control
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      placeholder="Ví dụ: Đà Lạt, Phú Quốc, ..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Khu vực</Form.Label>
                    <Form.Select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                    >
                      <option value="DOMESTIC">Trong nước</option>
                      <option value="INTERNATIONAL">Quốc tế</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ngày khởi hành:</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      (dd/mm/yyyy)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ngày kết thúc:</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      (dd/mm/yyyy)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="counter-section mb-4">
                <h5>Số lượng khách:</h5>
                <Row>
                  <Col md={6}>
                    <div className="counter-item">
                      <label>Người lớn</label>
                      <div className="counter-controls">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleCounterChange('adultsCapacity', -1)}
                          disabled={formData.adultsCapacity <= 0}
                        >
                          -
                        </Button>
                        <span className="counter-value">{formData.adultsCapacity}</span>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleCounterChange('adultsCapacity', 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="counter-item">
                      <label>Trẻ em</label>
                      <div className="counter-controls">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleCounterChange('childrenCapacity', -1)}
                          disabled={formData.childrenCapacity <= 0}
                        >
                          -
                        </Button>
                        <span className="counter-value">{formData.childrenCapacity}</span>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleCounterChange('childrenCapacity', 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                    <Col>
                        <p className="mt-3"><strong>Tổng cộng: {parseInt(formData.adultsCapacity, 10) + parseInt(formData.childrenCapacity, 10)} khách</strong></p>
                    </Col>
                </Row>
              </div>

              <Form.Group>
                <Form.Label>Mô tả chi tiết yêu cầu:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Mô tả chi tiết yêu cầu của bạn, bao gồm các địa điểm muốn tham quan, loại hình dịch vụ, và các yêu cầu đặc biệt khác."
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <Button variant="primary" type="submit" size="lg" className="px-5">
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default CustomTourPage; 