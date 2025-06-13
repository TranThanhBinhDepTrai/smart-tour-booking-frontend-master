import React, { useEffect, useState } from 'react';
import { Container, Alert, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lấy tất cả các query params
                const params = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                // Gọi API để verify payment
                const response = await axios.get('http://localhost:8080/api/v1/bookings/vnpay-return', {
                    params: params
                });

                setPaymentStatus(response.data);
            } catch (error) {
                console.error('Error verifying payment:', error);
                setPaymentStatus({
                    success: false,
                    message: 'Có lỗi xảy ra khi xác thực thanh toán'
                });
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang xử lý...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card className="p-4">
                <Card.Body className="text-center">
                    {paymentStatus?.success ? (
                        <>
                            <i className="fas fa-check-circle text-success mb-3" style={{ fontSize: '3rem' }}></i>
                            <Alert variant="success">
                                Thanh toán thành công!
                            </Alert>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-times-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
                            <Alert variant="danger">
                                {paymentStatus?.message || 'Thanh toán thất bại!'}
                            </Alert>
                        </>
                    )}
                    
                    <div className="mt-4">
                        <Button 
                            variant="primary" 
                            className="me-3"
                            onClick={() => navigate('/history')}
                        >
                            Xem lịch sử đặt tour
                        </Button>
                        <Button 
                            variant="outline-primary"
                            onClick={() => navigate('/')}
                        >
                            Về trang chủ
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentResult; 