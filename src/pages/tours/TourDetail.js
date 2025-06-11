import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./TourDetail.css";

const ImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="detail-carousel">
      <div className="carousel-container">
        {images.map((image, index) => (
          <img
            key={image.id}
            src={image.url}
            alt={`Tour image ${index + 1}`}
            className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`}
          />
        ))}
        <button className="carousel-button prev" onClick={prevImage}>❮</button>
        <button className="carousel-button next" onClick={nextImage}>❯</button>
      </div>
      <div className="carousel-dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => goToImage(index)}
          />
        ))}
      </div>
    </div>
  );
};

const TourDetail = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/v1/tours/${id}`)
      .then(res => {
        console.log('Tour detail:', res.data);
        if (res.data && res.data.data) {
          setTour(res.data.data);
        } else {
          setError('Không tìm thấy thông tin tour');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi lấy thông tin tour:", err);
        setError('Có lỗi xảy ra khi tải thông tin tour');
        setLoading(false);
      });
  }, [id]);

  const handleExportPDF = async () => {
    try {
      setDownloading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/tours/${id}/export/pdf`,
        { responseType: 'blob' }
      );
      
      // Tạo URL cho blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Tạo link tạm thời và click để tải
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tour_${tour.code}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloading(false);
    } catch (err) {
      console.error("Lỗi khi xuất PDF:", err);
      alert("Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại sau.");
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin tour...</div>;
  }

  if (error || !tour) {
    return (
      <div className="error-container">
        <div className="error">{error || 'Không tìm thấy thông tin tour'}</div>
        <Link to="/tours" className="back-button">Quay lại danh sách tour</Link>
      </div>
    );
  }

  return (
    <div className="tour-detail">
      <div className="tour-detail-header">
        <Link to="/tours" className="back-link">← Quay lại danh sách tour</Link>
        <h1>{tour.title}</h1>
        <div className="tour-code">Mã tour: {tour.code}</div>
      </div>

      <div className="tour-detail-images">
        {tour.images && tour.images.length > 0 && (
          <ImageCarousel images={tour.images} />
        )}
      </div>

      <div className="tour-detail-content">
        <div className="tour-detail-main">
          <section className="tour-section">
            <h2>Thông tin chung</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Điểm đến:</label>
                <span>{tour.destination}</span>
              </div>
              <div className="info-item">
                <label>Thời gian:</label>
                <span>{tour.durationDays} ngày {tour.durationNights} đêm</span>
              </div>
              <div className="info-item">
                <label>Ngày khởi hành:</label>
                <span>{new Date(tour.startDate).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="info-item">
                <label>Ngày kết thúc:</label>
                <span>{new Date(tour.endDate).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="info-item">
                <label>Hãng bay:</label>
                <span>{tour.airline}</span>
              </div>
              <div className="info-item">
                <label>Loại tour:</label>
                <span>{tour.category}</span>
              </div>
              <div className="info-item">
                <label>Khu vực:</label>
                <span>{tour.region === 'DOMESTIC' ? 'Trong nước' : 'Quốc tế'}</span>
              </div>
              <div className="info-item">
                <label>Số chỗ:</label>
                <span>{tour.capacity} người</span>
              </div>
            </div>
          </section>

          <section className="tour-section">
            <h2>Giá tour</h2>
            <div className="price-info">
              <div className="price-item">
                <label>Người lớn:</label>
                <span className="price">{tour.priceAdults.toLocaleString()} VNĐ</span>
              </div>
              <div className="price-item">
                <label>Trẻ em:</label>
                <span className="price">{tour.priceChildren.toLocaleString()} VNĐ</span>
              </div>
            </div>
          </section>

          <section className="tour-section">
            <h2>Mô tả tour</h2>
            <p className="tour-description">{tour.description}</p>
          </section>

          <section className="tour-section">
            <h2>Lịch trình chi tiết</h2>
            <div className="itinerary-list">
              {tour.itinerary.map((item, index) => (
                <div key={index} className="itinerary-item">
                  <div className="day-number">{index + 1}</div>
                  <div className="day-content">{item}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="tour-detail-sidebar">
          <div className="booking-card">
            <h3>Đặt tour này</h3>
            <div className="booking-info">
              <div className="booking-price">
                <label>Giá từ:</label>
                <span className="price">{tour.priceAdults.toLocaleString()} VNĐ</span>
              </div>
              <button className="booking-button">Đặt ngay</button>
              <button 
                className="export-pdf-button" 
                onClick={handleExportPDF}
                disabled={downloading}
              >
                {downloading ? 'Đang tải...' : 'Tải thông tin tour (PDF)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail; 