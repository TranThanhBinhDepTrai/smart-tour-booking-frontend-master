import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import './TourCategoryList.css';
import '../tours/Tour.css';

const CATEGORY_LABELS = {
  ADVENTURE: 'Phiêu Lưu Mạo Hiểm',
  CULTURAL: 'Văn Hóa',
  HOLIDAY: 'Nghỉ Dưỡng',
  SEASONAL: 'Mùa hè',
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
      {/* Chính sách hủy/phạt */}
      <div className="tour-section cancellation-policy" style={{marginTop: 32, background: '#fffbe6', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(255,214,0,0.08)'}}>
        <h2 style={{color: '#e67e22', display: 'flex', alignItems: 'center', gap: 8}}>
          <span role="img" aria-label="pin">📌</span> Chính sách hủy / phạt
        </h2>
        <div style={{fontSize: 16, color: '#444', marginTop: 10, whiteSpace: 'pre-line'}}>
<b>Lưu ý về chuyển hoặc hủy tour</b>
<br/>
a) <b>Đối với ngày thường:</b>
<ul style={{marginTop: 4}}>
  <li>Hủy vé trong vòng 24 giờ hoặc ngày khởi hành, chịu phạt 90% tiền tour.</li>
  <li>Hủy vé từ 2 – 4 ngày trước ngày khởi hành, chịu phạt 50% tiền tour.</li>
  <li>Hủy vé từ 5 – 7 ngày trước ngày khởi hành, chịu phạt 30% tiền tour.</li>
  <li>Hủy vé trước 30 ngày, chịu phạt 10% tiền tour.</li>
  <li>Hủy vé trước 30 ngày trở lên, không phạt.</li>
</ul>
<hr/>
b) <b>Đối với dịp Lễ, Tết:</b>
<ul style={{marginTop: 4}}>
  <li>Hủy vé trong vòng 24 giờ hoặc ngày khởi hành, chịu phạt 100% tiền tour.</li>
  <li>Hủy vé từ 2 – 7 ngày trước ngày khởi hành, chịu phạt 80% tiền tour.</li>
  <li>Hủy vé từ 8 – 15 ngày trước ngày khởi hành, chịu phạt 50% tiền tour.</li>
  <li>Hủy vé trước 30 ngày, chịu phạt 20% tiền tour.</li>
  <li>Hủy vé trước 30 ngày trở lên, không phạt.</li>
</ul>
c) Sau khi hủy tour, du khách vui lòng đến nhận tiền trong vòng 15 ngày kể từ ngày kết thúc tour. Chúng tôi chỉ thanh toán trong khoảng thời gian nói trên.<br/>
d) Trường hợp hủy tour do sự cố khách quan như thiên tai, lũ lụt, dịch bệnh, tàu thủy, xe lửa, máy bay hoãn/hủy chuyến...<br/>
Lữ hành sẽ không chịu trách nhiệm bồi thường chi phí nào khác ngoài việc hoàn trả chi phí dịch vụ chưa sử dụng của tour đó.
        </div>
      </div>
    </div>
  );
};

export default TourCategoryList; 