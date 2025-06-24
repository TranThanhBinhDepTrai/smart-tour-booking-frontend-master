import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { Container, Row, Col } from 'react-bootstrap';
import './TourCategoryList.css';

const CATEGORY_LABELS = {
  ADVENTURE: 'Phiêu Lưu Mạo Hiểm',
  CULTURAL: 'Văn Hóa',
  HOLIDAY: 'Nghỉ Dưỡng',
  SEASONAL: 'Theo mùa',
};

const TourCategoryList = () => {
  const { category } = useParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const response = await tourService.getAllTours();
        let allTours = [];
        if (response && response.data && Array.isArray(response.data.content)) {
          allTours = response.data.content;
        }
        const filtered = allTours.filter(tour => {
          if (!tour.category) return false;
          return tour.category.toUpperCase() === category.toUpperCase();
        });
        setTours(filtered);
      } catch (err) {
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [category]);

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ textAlign: 'center' }}>{CATEGORY_LABELS[category] || category}</h2>
      {loading ? (
        <div className="text-center py-5">Đang tải danh sách tour...</div>
      ) : tours.length === 0 ? (
        <div className="text-center py-5">Không có tour nào thuộc thể loại này.</div>
      ) : (
        <Row>
          {tours.map(tour => (
            <Col key={tour.id} md={4} sm={6} className="mb-4">
              <div className="tour-list-card">
                <img src={tour.images && tour.images[0] ? tour.images[0].url : 'https://via.placeholder.com/300x200?text=No+Image'} className="tour-list-card-img" alt={tour.title} />
                <div className="tour-list-card-body">
                  <div className="tour-list-card-title">{tour.title}</div>
                  <div className="tour-list-card-desc">{tour.description}</div>
                  <div className="tour-list-card-info"><strong>Điểm đến:</strong> {tour.destination}</div>
                  <div className="tour-list-card-info"><strong>Giá người lớn:</strong> {tour.priceAdults?.toLocaleString('vi-VN')} VND</div>
                  <div className="tour-list-card-info"><strong>Giá trẻ em:</strong> {tour.priceChildren?.toLocaleString('vi-VN')} VND</div>
                  <div className="tour-list-card-info"><strong>Ngày đi:</strong> {tour.startDate ? new Date(tour.startDate).toLocaleDateString('vi-VN') : ''}</div>
                  <div className="tour-list-card-info"><strong>Ngày về:</strong> {tour.endDate ? new Date(tour.endDate).toLocaleDateString('vi-VN') : ''}</div>
                  <div className="tour-list-card-info"><strong>Hãng bay:</strong> {tour.airline}</div>
                  <div className="tour-list-card-info"><strong>Mã tour:</strong> {tour.code}</div>
                  <button className="tour-list-card-btn">Xem chi tiết</button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TourCategoryList; 