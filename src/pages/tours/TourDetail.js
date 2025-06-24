import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Carousel, Badge } from "react-bootstrap";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { API_URL } from "../../config";
import { tourService } from "../../services/tourService";
import "./TourDetail.css";

const CATEGORY_LABELS = {
  ADVENTURE: 'Phiêu lưu mạo hiểm',
  CULTURAL: 'Văn hóa',
  HOLIDAY: 'Nghỉ hè',
  SEASONAL: 'Theo mùa',
  RELAX: 'Nghỉ dưỡng',
};

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedTours, setRelatedTours] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

  useEffect(() => {
    setRelatedTours([]);      // Reset danh sách tour liên quan
    setRelatedError(null);    // Reset lỗi
    loadTourDetails();
  }, [id]);

  const loadTourDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tours/${id}`);
      if (response?.data?.data) {
        setTour(response.data.data);
        // Sau khi lấy thông tin tour, gọi API lấy tour gợi ý
        loadRelatedTours(response.data.data.id);
      }
    } catch (error) {
      setTour(null);
      console.error("Error loading tour:", error);
      toast.error("Không thể tải thông tin tour");
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedTours = async (tourId) => {
    setRelatedTours([]);      // Reset trước khi gọi API
    setRelatedError(null);
    setLoadingRelated(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/tour-recommendations?tour_id=${tourId}`);
      if (
        response &&
        response.data &&
        response.data.related_tours &&
        response.data.related_tours.length > 0
      ) {
        // Lấy chi tiết của từng tour gợi ý
        const tourDetails = await Promise.all(
          response.data.related_tours.map(async (relatedId) => {
            try {
              const tourDetail = await axios.get(`${API_URL}/tours/${relatedId}`);
              console.log('Tour detail for related:', relatedId, tourDetail.data.data);
              return tourDetail.data.data;
            } catch (error) {
              console.error('Error loading related tour', relatedId, error);
              return null;
            }
          })
        );
        const filtered = tourDetails.filter(tour => tour !== null);
        if (filtered.length > 0) {
          setRelatedTours(filtered);
        } else {
          setRelatedError("Không thể tải tour liên quan. Vui lòng thử lại sau.");
        }
      } else {
        setRelatedError("Không có tour liên quan");
        setRelatedTours([]);
      }
    } catch (error) {
      setRelatedTours([]); // Khi lỗi, xóa danh sách tour liên quan
      setRelatedError("Không thể tải tour liên quan. Vui lòng thử lại sau.");
    } finally {
      setLoadingRelated(false);
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

  const navigateToTourDetail = (tourId) => {
    navigate(`/tours/${tourId}`);
    // Tải lại trang để hiển thị thông tin tour mới
    window.location.reload();
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
          {tour.images && tour.images.length > 0 ? (
            <Card className="mb-4">
              <Carousel>
                {tour.images.map((image, index) => (
                  <Carousel.Item key={image.id || index}>
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
          ) : (
            <Card className="mb-4">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/800x400?text=Không+có+hình+ảnh"
                alt={tour.title}
                style={{ height: '400px', objectFit: 'cover' }}
              />
            </Card>
          )}

          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Card.Title as="h2">{tour.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Mã tour: {tour.code}
                  </Card.Subtitle>
                </div>
                {tour.category && (
                  <Badge bg="success" className="p-2">
                    {CATEGORY_LABELS[tour.category] || tour.category}
                  </Badge>
                )}
              </div>

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
                  <p><strong>Loại tour:</strong> {CATEGORY_LABELS[tour.category] || 'Chưa cập nhật'}</p>
                  <p><strong>Khu vực:</strong> {tour.region === 'INTERNATIONAL' ? 'Quốc tế' : 'Trong nước'}</p>
                  <p><strong>Số chỗ:</strong> {tour.capacity} người</p>
                </Col>
              </Row>

              <h4 className="mt-4">Mô tả</h4>
              <p>{tour.description || "Chưa có mô tả chi tiết cho tour này."}</p>

              <h4 className="mt-4">Lịch trình</h4>
              {tour.itinerary && tour.itinerary.length > 0 ? (
                <ul className="list-unstyled">
                  {tour.itinerary.map((item, index) => (
                    <li key={index} className="mb-2">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có thông tin lịch trình chi tiết.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="booking-card">
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
                className="w-100 mb-4"
                onClick={handleDownloadPDF}
              >
                Tải thông tin tour (PDF)
              </Button>
            </Card.Body>
          </Card>

          {/* Phần hiển thị tour gợi ý */}
          <Card className="mt-4">
            <Card.Body>
              <h4 className="mb-3">Tour liên quan</h4>
              {loadingRelated ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : relatedError ? (
                <p className="text-center text-danger">{relatedError}</p>
              ) : relatedTours.length > 0 ? (
                <div className="related-tours-list">
                  {relatedTours.map((relatedTour) => (
                    <Card key={relatedTour.id} className="mb-3 related-tour-card">
                      <div className="related-tour-image">
                        <img 
                          src={relatedTour.images && relatedTour.images.length > 0 ? relatedTour.images[0].url : "https://via.placeholder.com/300x150?text=Không+có+hình+ảnh"} 
                          alt={relatedTour.title}
                          className="related-tour-img"
                        />
                      </div>
                      <Card.Body className="p-3">
                        <Card.Title className="fs-6 related-tour-title">{relatedTour.title}</Card.Title>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="text-danger fw-bold">
                            {relatedTour.priceAdults?.toLocaleString('vi-VN')} VNĐ
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => navigateToTourDetail(relatedTour.id)}
                          >
                            Chi tiết
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : null}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TourDetail; 