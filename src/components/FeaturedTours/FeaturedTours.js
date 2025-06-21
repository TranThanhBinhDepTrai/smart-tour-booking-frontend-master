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
                // Lấy 5 tour trong nước
                const domesticResponse = await tourService.getTours({ page: 0, size: 5, region: 'DOMESTIC' });
                if (domesticResponse && domesticResponse.data && domesticResponse.data.content) {
                    setDomesticTours(domesticResponse.data.content);
                }

                // Lấy 5 tour nước ngoài
                const internationalResponse = await tourService.getTours({ page: 0, size: 5, region: 'INTERNATIONAL' });
                if (internationalResponse && internationalResponse.data && internationalResponse.data.content) {
                    setInternationalTours(internationalResponse.data.content);
                }
            } catch (error) {
                console.error("Error fetching featured tours:", error);
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
            <Card className="featured-tour-card mb-4" onClick={() => navigate(`/tours/${tour.id}`)}>
                <Card.Img variant="top" src={imageUrl} />
                <Card.Body>
                    <Card.Title>{tour.title}</Card.Title>
                    <Card.Text>
                        <strong>Xuất phát:</strong> TP. Hồ Chí Minh <br />
                        <strong>Ngày khởi hành:</strong> {tour.startDate ? format(new Date(tour.startDate), 'dd/MM/yyyy') : 'N/A'} <br />
                        <strong>Thời gian:</strong> {tour.durationDays} ngày {tour.durationNights} đêm <br />
                        <strong>Giá tour:</strong> <span className="price">{new Intl.NumberFormat('vi-VN').format(tour.priceAdults)} đ</span>
                    </Card.Text>
                    <Button variant="primary" className="view-details-btn">Xem chi tiết</Button>
                </Card.Body>
            </Card>
        );
    };

    if (loading) {
        return <div className="text-center py-5">Đang tải tour...</div>;
    }

    return (
        <section className="featured-tours-section">
            <Container>
                <h2 className="section-title text-center">CHÙM TOUR ƯU ĐÃI</h2>
                <Row>
                    <Col md={6}>
                        <h3 className="tour-type-title">Tour trong nước</h3>
                        {domesticTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
                        <div className="text-center">
                            <Button variant="outline-primary" onClick={() => navigate('/tours?region=DOMESTIC')}>Xem tất cả</Button>
                        </div>
                    </Col>
                    <Col md={6}>
                        <h3 className="tour-type-title">Tour nước ngoài</h3>
                        {internationalTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
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