import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { useAuth } from '../../contexts/AuthContext';
import './RecommendedTours.css';

const RecommendedTours = () => {
    const { currentUser } = useAuth();
    const [recommendedTours, setRecommendedTours] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.id) {
            loadRecommendedTours(currentUser.id);
        }
    }, [currentUser]);

    const loadRecommendedTours = async (userId) => {
        try {
            setLoading(true);
            const recommendationsResponse = await tourService.getUserRecommendations(userId);
            if (recommendationsResponse && recommendationsResponse.recommended_tours && 
                recommendationsResponse.recommended_tours.length > 0) {
                const toursData = await tourService.getMultipleTours(recommendationsResponse.recommended_tours);
                setRecommendedTours(toursData);
            }
        } catch (error) {
            console.error("Error loading recommended tours:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTourImageUrl = (tour) => {
        if (tour.images && tour.images.length > 0) {
            return tour.images[0].url;
        }
        return 'https://via.placeholder.com/300x200?text=Không+có+hình+ảnh';
    };

    // Dòng phụ: số ngày, số đêm nếu có
    const getSubText = (tour) => {
        if (tour.durationDays && tour.durationNights) {
            return `${tour.durationDays} ngày ${tour.durationNights} đêm`;
        }
        if (tour.durationDays) {
            return `${tour.durationDays} ngày`;
        }
        return '';
    };

    if (!currentUser) return null;

    // Chia 6 tour thành các vị trí masonry
    const tours = recommendedTours.slice(0, 6);
    // Bên trái: trên 1 lớn, dưới 2 nhỏ; bên phải: trên 2 nhỏ, dưới 1 lớn
    const bigLeft = tours[0];
    const smallLeft1 = tours[1];
    const smallLeft2 = tours[2];
    const smallRight1 = tours[3];
    const smallRight2 = tours[4];
    const bigRight = tours[5];

    const categoryTranslations = {
        ADVENTURE: 'Phiêu lưu',
        CULTURAL: 'Văn hóa',
        HOLIDAY: 'Nghỉ hè',
        SEASONAL: 'Theo mùa'
    };

    const renderCard = (tour, type, key) => {
        if (!tour) return null;
        return (
            <div
                className={`tour-card-masonry ${type} tour-card-clickable`}
                key={key}
                onClick={() => navigate(`/tours/${tour.id}`)}
                tabIndex={0}
                role="button"
                style={{ cursor: 'pointer' }}
            >
                <div className="tour-image-container">
                    <img 
                        src={getTourImageUrl(tour)} 
                        alt={tour.title} 
                        className="tour-image" 
                    />
                    <div className="tour-favorite-right">
                        <i className="fas fa-heart"></i>
                    </div>
                    {tour.category && (
                        <div className="tour-badge">{categoryTranslations[tour.category] || tour.category}</div>
                    )}
                </div>
                <div className="tour-card-body">
                    <div className="tour-title">
                        {tour.title}
                        <span className="arrow">&rarr;</span>
                    </div>
                    {getSubText(tour) && (
                        <div className="tour-sub">{getSubText(tour)}</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="recommended-tours-section">
            <Container>
                <h2 className="tour-section-title-home">Tour gợi ý cho bạn</h2>
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-2">Đang tải tour gợi ý...</p>
                    </div>
                ) : tours.length > 0 ? (
                    <div className="recommended-tours-2col">
                        <div className="col-left">
                            {renderCard(bigLeft, 'big', 'bigLeft')}
                            <div className="small-row">
                                {renderCard(smallLeft1, 'small', 'smallLeft1')}
                                {renderCard(smallLeft2, 'small', 'smallLeft2')}
                            </div>
                        </div>
                        <div className="col-right">
                            <div className="small-row">
                                {renderCard(smallRight1, 'small', 'smallRight1')}
                                {renderCard(smallRight2, 'small', 'smallRight2')}
                            </div>
                            {renderCard(bigRight, 'big', 'bigRight')}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p>Không có tour gợi ý nào cho bạn. Hãy khám phá thêm các tour khác!</p>
                    </div>
                )}
            </Container>
        </section>
    );
};

export default RecommendedTours; 