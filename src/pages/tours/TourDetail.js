import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Carousel, Badge } from "react-bootstrap";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { API_URL } from "../../config";
import { tourService } from "../../services/tourService";
import "./TourDetail.css";
import { FaStar, FaCalendarAlt, FaMapMarkerAlt, FaTag, FaUsers, FaMoneyBillWave, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

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
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setRelatedTours([]);      // Reset danh sách tour liên quan
    setRelatedError(null);    // Reset lỗi
    loadTourDetails();
    loadTourReviews();
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

  const loadTourReviews = async () => {
    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/reviews/tour/${id}`);
      setReviewStats(res.data.data);
    } catch (err) {
      setReviewError('Không thể tải đánh giá tour');
    } finally {
      setReviewLoading(false);
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
    <Container className="mt-4 tour-detail">
      <Toaster position="top-right" />
      <div className="mb-3">
        <Button variant="link" onClick={() => navigate('/tours')} className="back-button">
          <FaArrowLeft style={{ marginRight: 6 }} /> Quay lại danh sách tour
        </Button>
      </div>
      <div className="tour-detail-header">
        <h1>{tour.title}</h1>
        <div className="tour-price-main">
          <FaMoneyBillWave style={{ color: '#ffd600', marginRight: 6 }} />
          {new Intl.NumberFormat('vi-VN').format(tour.priceAdults)} đ
        </div>
      </div>
      <div className="detail-carousel">
        <Carousel>
          {tour.images && tour.images.length > 0 ? (
            tour.images.map((image, index) => (
                  <Carousel.Item key={image.id || index}>
                    <img
                      className="d-block w-100"
                      src={image.url}
                      alt={`Hình ảnh tour ${index + 1}`}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                  </Carousel.Item>
            ))
          ) : (
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/800x400?text=Không+có+hình+ảnh"
                alt={tour.title}
                style={{ height: '400px', objectFit: 'cover' }}
              />
            </Carousel.Item>
          )}
        </Carousel>
      </div>
      <div className="tour-info-quick">
        <div className="info-item"><FaCalendarAlt /> Khởi hành: <span>{tour.startDate ? formatDate(tour.startDate) : 'N/A'}</span></div>
        <div className="info-item"><FaMapMarkerAlt /> Điểm đến: <span>{tour.destination || 'N/A'}</span></div>
        <div className="info-item"><FaTag /> Mã tour: <span>{tour.code || tour.id}</span></div>
        <div className="info-item"><FaUsers /> Số chỗ còn: <span>{tour.availableSlots || 'N/A'}</span></div>
        <div className="info-item"><FaStar style={{ color: '#ffd600' }} /> Đánh giá: <span>{reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : 'Chưa có'} / 5</span></div>
      </div>
      <div className="tour-detail-actions">
        <Button className="booking-button" onClick={handleBookTour}>
          Đặt tour ngay
        </Button>
        <Button className="export-pdf-button" onClick={handleDownloadPDF}>
          <FaFilePdf style={{ marginRight: 6 }} /> Tải PDF
        </Button>
      </div>
      <div className="tour-section">
        <h2>Thông tin chi tiết</h2>
        <div className="tour-description">{tour.description}</div>
                </div>
      <div className="tour-section">
        <h2>Lịch trình</h2>
        <div className="itinerary">{tour.itinerary}</div>
              </div>
      {/* Review section */}
      <div className="tour-section">
        <h2>Đánh giá tour</h2>
                {reviewLoading ? (
                  <div>Đang tải đánh giá...</div>
        ) : reviewStats && reviewStats.reviews && reviewStats.reviews.length > 0 ? (
          <div>
            {reviewStats.reviews.map((review, idx) => (
              <div key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{review.userName || 'Ẩn danh'} <span style={{ color: '#ffd600', marginLeft: 8 }}><FaStar /> {review.rating}/5</span></div>
                <div style={{ color: '#555', fontSize: 15 }}>{review.comment}</div>
                    </div>
            ))}
                          </div>
                      ) : (
                        <div>Chưa có đánh giá nào cho tour này.</div>
                      )}
                    </div>
      {/* Related tours */}
      <div className="tour-section related-tours">
        <h4>Các tour liên quan</h4>
        <div className="related-tours-list">
              {loadingRelated ? (
            <div>Đang tải...</div>
          ) : relatedTours && relatedTours.length > 0 ? (
            relatedTours.map((rtour, idx) => (
              <div className="related-tour-card" key={rtour.id} onClick={() => navigateToTourDetail(rtour.id)}>
                <img className="related-tour-img" src={rtour.images && rtour.images[0] ? rtour.images[0].url : 'https://via.placeholder.com/200x120?text=No+Image'} alt={rtour.title} />
                <div className="related-tour-info">
                  <div className="related-tour-title">{rtour.title}</div>
                  <div className="price"><FaMoneyBillWave /> {new Intl.NumberFormat('vi-VN').format(rtour.priceAdults)} đ</div>
                  <span className="related-tour-detail-link">Xem chi tiết &rarr;</span>
                </div>
                      </div>
            ))
          ) : (
            <div>Không có tour liên quan.</div>
          )}
                        </div>
                </div>
    </Container>
  );
};

export default TourDetail; 