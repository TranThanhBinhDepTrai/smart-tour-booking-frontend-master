import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="travelvn-footer">
      <div className="footer-main">
        <div className="footer-col">
          <div className="footer-logo">
            <img src={require('../../assets/images/hero-image.jpg')} alt="Smart Tour Logo" className="footer-logo-img" />
            <span className="footer-logo-text">SMART TOUR BOOKING</span>
          </div>
          <p className="footer-desc">Đặt tour du lịch thông minh, tiện lợi, an toàn cùng Smart Tour. Đối tác tin cậy của mọi hành trình.</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="Youtube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Liên hệ</h4>
          <p><i className="fas fa-map-marker-alt"></i> 180 Cao Lỗ, Phường 4, Quận 8, TP.HCM</p>
          <p><i className="fas fa-phone-alt"></i> Hotline: <a href="tel:19001839">1900 1839</a></p>
          <p><i className="fas fa-envelope"></i> Email: info@smarttour.com</p>
          <p><i className="fas fa-clock"></i> Thứ 2 - Thứ 6: 8:00 - 17:00</p>
        </div>
        <div className="footer-col">
          <h4>Về chúng tôi</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/tours">Tour du lịch</a></li>
            <li><a href="/custom-tour">Tour theo yêu cầu</a></li>
            <li><a href="/promotions">Khuyến mãi</a></li>
            <li><a href="/check-booking">Kiểm tra đơn hàng</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Chính sách</h4>
          <ul>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Hỗ trợ khách hàng</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 SMART TOUR BOOKING. Bản quyền thuộc về Smart Tour Booking.</p>
      </div>
    </footer>
  );
};

export default Footer; 