import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import './VnpayReturn.css';

const VnpayReturn = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processVnpayReturn = async () => {
            try {
                // Lấy query string từ URL
                const queryString = window.location.search;
                
                // Gửi request đến backend API với query string
                const apiUrl = "http://localhost:8080/api/v1/bookings/vnpay-return" + queryString;
                
                const response = await axios.get(apiUrl);

                // Đọc paymentStatus từ response
                const paymentStatus = response.data.data.paymentStatus;
                
                if (paymentStatus === "PAID") {
                    setMessage("Thanh toán thành công");
                } else if (paymentStatus === "UNPAID") {
                    setMessage("Thanh toán thất bại");
                } else {
                    setMessage("Trạng thái thanh toán không xác định");
                }

            } catch (error) {
                console.error("Lỗi khi xử lý thanh toán:", error);
                setMessage("Có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };

        processVnpayReturn();
    }, []);

    return (
        <Container className="vnpay-return-container">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Kết Quả Thanh Toán</Card.Title>
                            {loading ? (
                                <div>
                                    <Spinner animation="border" role="status" className="mb-2">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                    <p>Đang xử lý...</p>
                                </div>
                            ) : (
                                <Alert variant={message.includes("thành công") ? "success" : "danger"}>
                                    {message}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default VnpayReturn; 