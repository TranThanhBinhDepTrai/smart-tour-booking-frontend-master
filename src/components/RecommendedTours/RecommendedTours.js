import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { useAuth } from '../../contexts/AuthContext';
import './RecommendedTours.css';

const RecommendedTours = () => {
    const { currentUser } = useAuth();
    const [recommendedTours, setRecommendedTours] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Chỉ tải tour gợi ý khi người dùng đã đăng nhập
        if (currentUser && currentUser.id) {
            loadRecommendedTours(currentUser.id);
        }
    }, [currentUser]);

    const loadRecommendedTours = async (userId) => {
        try {
            setLoading(true);
            // Lấy danh sách ID tour gợi ý
            const recommendationsResponse = await tourService.getUserRecommendations(userId);
            
            if (recommendationsResponse && recommendationsResponse.recommended_tours && 
                recommendationsResponse.recommended_tours.length > 0) {
                
                // Lấy thông tin chi tiết của các tour
                const toursData = await tourService.getMultipleTours(recommendationsResponse.recommended_tours);
                console.log("Recommended tours data:", toursData);
                setRecommendedTours(toursData);
            }
        } catch (error) {
            console.error("Error loading recommended tours:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy URL hình ảnh đầu tiên của tour
    const getTourImageUrl = (tour) => {
        if (tour.images && tour.images.length > 0) {
            return tour.images[0].url;
        }
        return 'https://via.placeholder.com/300x200?text=Không+có+hình+ảnh';
    };

    // Hàm format giá tiền
    const formatPrice = (price) => {
        return price ? price.toLocaleString('vi-VN') + ' VND' : 'Liên hệ';
    };

    // Hàm tính số ngày của tour
    const calculateDuration = (days, nights) => {
        return `${days || 0} ngày ${nights || 0} đêm`;
    };

    // Nếu người dùng chưa đăng nhập, không hiển thị gì
    if (!currentUser) return null;

    return (
        <section className="recommended-tours-section">
            <Container>
                <h2 className="section-title">Tour gợi ý cho bạn</h2>
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-2">Đang tải tour gợi ý...</p>
                    </div>
                ) : recommendedTours.length > 0 ? (
                    <Row>
                        {recommendedTours.map((tour) => (
                            <Col key={tour.id} lg={4} md={6} sm={12} className="mb-4">
                                <Card className="tour-card h-100">
                                    <div className="tour-image-container">
                                        <Card.Img 
                                            variant="top" 
                                            src={getTourImageUrl(tour)} 
                                            alt={tour.title} 
                                            className="tour-image"
                                        />
                                        <div className="tour-favorite">
                                            <i className="fas fa-star"></i>
                                        </div>
                                        {tour.category && (
                                            <div className="tour-badge">
                                                {tour.category}
                                            </div>
                                        )}
                                    </div>
                                    <Card.Body>
                                        <Card.Title className="tour-title">{tour.title}</Card.Title>
                                        <div className="tour-location">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <span>{tour.destination || 'Chưa cập nhật'}</span>
                                        </div>
                                        <div className="tour-duration">
                                            <i className="far fa-clock"></i>
                                            <span>{calculateDuration(tour.durationDays, tour.durationNights)}</span>
                                        </div>
                                        <div className="tour-price">
                                            <i className="fas fa-tag"></i>
                                            <span>{formatPrice(tour.priceAdults)}</span>
                                        </div>
                                        <Link to={`/tours/${tour.id}`} className="view-details-btn">
                                            Xem chi tiết <i className="fas fa-arrow-right"></i>
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
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