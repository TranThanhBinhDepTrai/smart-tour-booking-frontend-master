import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './Contact.css';

const Contact = () => {
    return (
        <Container className="contact-container py-5">
            <h2 className="text-center mb-4">Liên Hệ</h2>
            <Row>
                <Col md={6} className="mb-4">
                    <Card className="h-100">
                        <Card.Body>
                            <h3 className="mb-4">Thông Tin Liên Hệ</h3>
                            <div className="contact-info">
                                <p>
                                    <i className="fas fa-map-marker-alt me-2"></i>
                                    180 Cao Lỗ, Phường 4, Quận 8, TP.HCM
                                </p>
                                <p>
                                    <i className="fas fa-phone me-2"></i>
                                    (028) 3850 5520
                                </p>
                                <p>
                                    <i className="fas fa-envelope me-2"></i>
                                    info@smarttour.com
                                </p>
                                <p>
                                    <i className="fas fa-clock me-2"></i>
                                    Thứ 2 - Thứ 6: 8:00 - 17:00
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-4">
                    <Card className="h-100">
                        <Card.Body className="p-0">
                            <div className="map-container">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.954410425893!2d106.67525717480439!3d10.73799718940847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f62a90e5dbd%3A0x674d5126513db295!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgU8OgaSBHw7Ju!5e0!3m2!1svi!2s!4v1749833420577!5m2!1svi!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Maps"
                                ></iframe>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Contact; 