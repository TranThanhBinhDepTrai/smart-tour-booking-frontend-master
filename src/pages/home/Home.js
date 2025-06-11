import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="search-section">
        <div className="search-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm tour du lịch, địa điểm..." 
              className="search-input"
            />
            <button className="voice-search">
              <i className="fas fa-microphone"></i>
            </button>
          </div>
          <div className="filter-buttons">
            <button className="filter-btn">
              <i className="fas fa-dollar-sign"></i>
              Giá
            </button>
            <button className="filter-btn">
              <i className="fas fa-calendar"></i>
              Ngày Khởi Hành
            </button>
            <button className="filter-btn">
              <i className="fas fa-map-marker-alt"></i>
              Điểm Đến
            </button>
            <button className="filter-btn">
              <i className="fas fa-star"></i>
              Đánh Giá
            </button>
          </div>
        </div>
      </div>
      <div className="featured-tours">
        {/* Phần nội dung tour sẽ thêm sau */}
      </div>
    </div>
  );
};

export default Home; 