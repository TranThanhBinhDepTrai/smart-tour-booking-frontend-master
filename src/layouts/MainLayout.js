import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import './Layout.css';

const MainLayout = () => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Smart Tour Booking</h3>
            <p>Đặt tour du lịch thông minh và tiện lợi</p>
          </div>
          <div className="footer-section">
            <h3>Liên hệ</h3>
            <p>Email: info@smarttour.com</p>
            <p>Điện thoại: 1900 8000</p>
          </div>
          <div className="footer-section">
            <h3>Theo dõi chúng tôi</h3>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Smart Tour Booking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 