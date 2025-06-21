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
            {/* Hero Section with New Search Component */}
            <HomeSearch />

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