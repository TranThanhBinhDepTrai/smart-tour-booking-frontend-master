import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { format } from 'date-fns';
import './FeaturedTours.css';

const FeaturedTours = () => {
    const [domesticTours, setDomesticTours] = useState([]);
    const [internationalTours, setInternationalTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);
                // Lấy tất cả tour (không giới hạn size)
                const response = await tourService.getTours({ page: 0, size: 1000 });
                if (response && response.data && response.data.content) {
                    const allTours = response.data.content;
                    setDomesticTours(allTours.filter(tour => tour.region === 'DOMESTIC'));
                    setInternationalTours(allTours.filter(tour => tour.region === 'INTERNATIONAL'));
                } else {
                    setDomesticTours([]);
                    setInternationalTours([]);
                }
            } catch (error) {
                console.error("Error fetching featured tours:", error);
                setDomesticTours([]);
                setInternationalTours([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    const TourCard = ({ tour }) => {
        if (!tour) return null;
        const imageUrl = tour.images && tour.images.length > 0 ? tour.images[0].url : 'https://via.placeholder.com/300x200?text=No+Image';
        return (
            <Card className="featured-tour-card mb-4">
                <div className="tour-card-inner">
                    <div className="tour-info">
                        <div className="tour-info-header">
                            <div className="tour-locations">
                                <strong>{tour.departure || 'HÀ NỘI'}</strong>
                                <span style={{ margin: '0 8px', fontWeight: 600, fontSize: 18 }}>&rarr;</span>
                                <strong>{tour.destination || 'ĐÀ NẴNG'}</strong>
                            </div>
                        </div>
                        <div className="tour-info-body">
                            <div className="tour-info-row"><span role="img" aria-label="tour">🧳</span> <b>Mã tour:</b> {tour.code || tour.id}</div>
                            <div className="tour-info-row"><span role="img" aria-label="calendar">📅</span> <b>Khởi hành:</b> {tour.startDate ? format(new Date(tour.startDate), 'dd/MM/yyyy') : 'N/A'}</div>
                            <div className="tour-info-row"><span role="img" aria-label="hotel">🏨</span> <b>Khách sạn:</b> {tour.hotelName || 'N/A'}</div>
                            <div className="tour-info-row"><span role="img" aria-label="plane">✈️</span> <b>Phương tiện:</b> {tour.transport || 'Máy bay'}</div>
                            <div className="tour-info-row tour-info-price">Giá từ <span className="price">{new Intl.NumberFormat('vi-VN').format(tour.priceAdults)} đ</span> / Khách</div>
                        </div>
                    </div>
                    <div className="tour-image-hover" onClick={() => navigate(`/tours/${tour.id}`)}>
                        <img src={imageUrl} alt={tour.title} className="tour-hover-img" />
                        <div className="tour-hover-overlay">
                            <div className="tour-hover-arrow"><span className="tour-hover-arrow-icon">→</span></div>
                            <div className="tour-hover-text">XEM CHI TIẾT</div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    if (loading) {
        return <div className="text-center py-5">Đang tải tour...</div>;
    }

    return (
        <section className="featured-tours-section">
            <Container>
                <h2 className="featured-section-title-home text-center">CHÙM TOUR ƯU ĐÃI</h2>
                <Row>
                    <Col md={6}>
                        <h3 className="tour-type-title">Tour trong nước</h3>
                        {domesticTours.slice(0, 5).map(tour => <TourCard key={tour.id} tour={tour} />)}
                        <div className="text-center">
                            <Button variant="outline-primary" onClick={() => navigate('/tours?region=DOMESTIC')}>Xem tất cả</Button>
                        </div>
                    </Col>
                    <Col md={6}>
                        <h3 className="tour-type-title">Tour nước ngoài</h3>
                        {internationalTours.slice(0, 5).map(tour => <TourCard key={tour.id} tour={tour} />)}
                        <div className="text-center">
                            <Button variant="outline-primary" onClick={() => navigate('/tours?region=INTERNATIONAL')}>Xem tất cả</Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default FeaturedTours; 