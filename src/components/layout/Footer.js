import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Smart Tour Booking</h3>
          <p>Khám phá những điểm đến tuyệt vời cùng chúng tôi</p>
        </div>
        <div className="footer-section">
          <h3>Liên hệ</h3>
          <p>Email: contact@smarttour.com</p>
          <p>Điện thoại: (84) 123-456-789</p>
        </div>
        <div className="footer-section">
          <h3>Theo dõi chúng tôi</h3>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>Twitter</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Smart Tour Booking. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 