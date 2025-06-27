import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import './TourCategoryList.css';
import '../tours/Tour.css';

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
    <div className="tour-list-container">
      <div className="tour-header">
        <h1>{CATEGORY_LABELS[category] || category} ({tours.length} tour)</h1>
      </div>
      {loading ? (
        <div className="text-center py-5">Đang tải danh sách tour...</div>
      ) : tours.length === 0 ? (
        <div className="text-center py-5">Không có tour nào thuộc thể loại này.</div>
      ) : (
        <div className="tour-list">
          {tours.map(tour => (
            <div className="tour-card" key={tour.id}>
              <div className="tour-images">
                {tour.images && tour.images.length > 0 && (
                  <img src={tour.images[0].url} alt={tour.title} className="carousel-image active" />
                )}
              </div>
              <div className="tour-info">
                <h2>{tour.title}</h2>
                <p className="description">{tour.description}</p>
                <p><strong>Điểm đến:</strong> {tour.destination}</p>
                <p><strong>Giá người lớn:</strong> {tour.priceAdults ? tour.priceAdults.toLocaleString('vi-VN') : 'N/A'} VNĐ</p>
                <p><strong>Giá trẻ em:</strong> {tour.priceChildren ? tour.priceChildren.toLocaleString('vi-VN') : 'N/A'} VNĐ</p>
                <p><strong>Ngày đi:</strong> {tour.startDate ? new Date(tour.startDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                <p><strong>Ngày về:</strong> {tour.endDate ? new Date(tour.endDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                <p><strong>Hãng bay:</strong> {tour.airline || 'N/A'}</p>
                <p><strong>Mã tour:</strong> {tour.code}</p>
                <div className="tour-actions">
                  <Link to={`/tours/${tour.id}`} className="view-details-button">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourCategoryList; 