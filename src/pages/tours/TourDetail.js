import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Carousel } from "react-bootstrap";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { API_URL } from "../../config";
import "./TourDetail.css";

const TourDetail = () => {
  const { id } = useParams();
    const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        loadTourDetails();
    }, [id]);

    const loadTourDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/tours/${id}`);
            console.log("Tour detail:", response);
            if (response?.data?.data) {
                setTour(response.data.data);
            }
        } catch (error) {
            console.error("Error loading tour:", error);
            toast.error("Không thể tải thông tin tour");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await axios.get(`${API_URL}/tours/${id}/export/pdf`, {
                responseType: 'blob'
            });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
            link.setAttribute('download', `tour-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
            link.remove();
      window.URL.revokeObjectURL(url);
            toast.success('Tải PDF thành công!');
        } catch (error) {
            console.error('Lỗi khi tải PDF:', error);
            toast.error('Không thể tải PDF. Vui lòng thử lại sau.');
        }
    };

    const handleBookTour = () => {
        navigate(`/tours/${id}/book`);
    };

  if (loading) {
        return (
            <Container className="mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </Container>
        );
    }

    if (!tour) {
    return (
            <Container className="mt-4">
                <div className="alert alert-warning">Không tìm thấy thông tin tour</div>
            </Container>
    );
  }

  return (
        <Container className="mt-4">
            <Toaster position="top-right" />
            <div className="mb-3">
                <Button variant="link" onClick={() => navigate('/tours')}>
                    ← Quay lại danh sách tour
                </Button>
      </div>

            <Row>
                <Col md={8}>
        {tour.images && tour.images.length > 0 && (
                        <Card className="mb-4">
                            <Carousel>
                                {tour.images.map((image, index) => (
                                    <Carousel.Item key={image.id}>
                                        <img
                                            className="d-block w-100"
                                            src={image.url}
                                            alt={`Hình ảnh tour ${index + 1}`}
                                            style={{ height: '400px', objectFit: 'cover' }}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </Card>
                    )}

                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title as="h2">{tour.title}</Card.Title>
                            <Card.Subtitle className="mb-3 text-muted">
                                Mã tour: {tour.code}
                            </Card.Subtitle>

                            <h4 className="mt-4">Thông tin chung</h4>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Điểm đến:</strong> {tour.destination}</p>
                                    <p><strong>Thời gian:</strong> {tour.durationDays} ngày {tour.durationNights} đêm</p>
                                    <p><strong>Ngày khởi hành:</strong> {formatDate(tour.startDate)}</p>
                                    <p><strong>Ngày kết thúc:</strong> {formatDate(tour.endDate)}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Hãng bay:</strong> {tour.airline || 'Chưa cập nhật'}</p>
                                    <p><strong>Loại tour:</strong> {tour.category || 'Chưa cập nhật'}</p>
                                    <p><strong>Khu vực:</strong> {tour.region === 'INTERNATIONAL' ? 'Quốc tế' : 'Trong nước'}</p>
                                    <p><strong>Số chỗ:</strong> {tour.capacity} người</p>
                                </Col>
                            </Row>

                            <h4 className="mt-4">Mô tả</h4>
                            <p>{tour.description}</p>

                            <h4 className="mt-4">Lịch trình</h4>
                            <ul className="list-unstyled">
              {tour.itinerary.map((item, index) => (
                                    <li key={index} className="mb-2">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="sticky-top" style={{ top: '20px' }}>
                        <Card.Body>
                            <h3 className="mb-4">Đặt tour này</h3>
                            <div className="mb-3">
                                <p className="mb-1">Giá người lớn:</p>
                                <h4 className="text-danger">
                                    {tour.priceAdults?.toLocaleString('vi-VN')} VNĐ
                                </h4>
                                <p className="mb-1 mt-3">Giá trẻ em:</p>
                                <h5 className="text-danger">
                                    {tour.priceChildren?.toLocaleString('vi-VN')} VNĐ
                                </h5>
              </div>
                            <Button 
                                variant="primary" 
                                className="w-100 mb-3"
                                onClick={handleBookTour}
                            >
                                Đặt ngay
                            </Button>
                            <Button 
                                variant="outline-primary" 
                                className="w-100"
                                onClick={handleDownloadPDF}
                            >
                                Tải thông tin tour (PDF)
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
  );
};

export default TourDetail; 