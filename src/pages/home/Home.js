import React from 'react';
import { Container } from 'react-bootstrap';
import TourCategories from '../../components/TourCategories/TourCategories';
import RecommendedTours from '../../components/RecommendedTours/RecommendedTours';
import FeaturedTours from '../../components/FeaturedTours/FeaturedTours';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section with Search */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Khám phá những điểm đến tuyệt vời</h1>
                    <p>Tìm kiếm và đặt tour du lịch dễ dàng</p>
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tour du lịch, địa điểm..." 
                            className="search-input"
                        />
                        <button className="search-button">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                    <div className="search-filters">
                        <button className="filter-button">
                            <i className="fas fa-dollar-sign"></i> Giá
                        </button>
                        <button className="filter-button">
                            <i className="fas fa-calendar"></i> Ngày Khởi Hành
                        </button>
                        <button className="filter-button">
                            <i className="fas fa-map-marker-alt"></i> Điểm Đến
                        </button>
                        <button className="filter-button">
                            <i className="fas fa-star"></i> Đánh Giá
                        </button>
                    </div>
                </div>
            </div>

            {/* Tour Categories Section */}
            <section className="tour-categories-section">
                <Container>
                    <h2 className="section-title">Khám phá theo chủ đề</h2>
                    <TourCategories />
                </Container>
            </section>

            {/* Recommended Tours Section */}
            <RecommendedTours />

            {/* Featured Tours Section */}
            <FeaturedTours />
        </div>
    );
};

export default Home; 