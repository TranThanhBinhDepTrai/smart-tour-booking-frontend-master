import React from 'react';
import { Container } from 'react-bootstrap';
import TourCategories from '../../components/TourCategories/TourCategories';
import RecommendedTours from '../../components/RecommendedTours/RecommendedTours';
import FeaturedTours from '../../components/FeaturedTours/FeaturedTours';
import HomeSearch from '../../components/HomeSearch/HomeSearch';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section chỉ còn thanh tìm kiếm nhỏ gọn */}
            <section className="hero-section-home search-only">
                <div className="hero-bg-overlay">
                    <img src={require('../../assets/images/hero-image.jpg')} alt="Du lịch Việt Nam" className="hero-bg-img" />
                    <div className="hero-bg-dark"></div>
                </div>
                <div className="hero-content-home search-only">
                    <HomeSearch alwaysCompact />
                </div>
            </section>

            {/* Danh mục tour */}
            <section className="tour-categories-section-home">
                <h2 className="section-title-home">Khám phá theo chủ đề</h2>
                <TourCategories />
            </section>

            {/* Tour gợi ý cho bạn */}
            <section className="recommended-tours-section-home">
                <RecommendedTours />
            </section>

            {/* Tour nổi bật */}
            <section className="featured-tours-section-home">
                <FeaturedTours />
            </section>
        </div>
    );
};

export default Home; 