import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { emailService } from '../../services/emailService';
import './VnpayReturn.css';

const VnpayReturn = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [emailSent, setEmailSent] = useState(false);

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
                    
                    // Gửi email thông báo nếu thanh toán thành công
                    try {
                        const bookingId = response.data.data.bookingId;
                        if (bookingId) {
                            await emailService.sendPaymentSuccess(bookingId);
                            setEmailSent(true);
                        }
                    } catch (emailError) {
                        console.error("Lỗi khi gửi email thông báo:", emailError);
                        // Không hiển thị lỗi email cho user, chỉ log
                    }
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
                                <div>
                                    <Alert variant={message.includes("thành công") ? "success" : "danger"}>
                                        {message}
                                    </Alert>
                                    {emailSent && message.includes("thành công") && (
                                        <Alert variant="info" className="mt-3">
                                            <i className="fas fa-envelope me-2"></i>
                                            Email xác nhận đã được gửi đến địa chỉ email của bạn!
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default VnpayReturn; 