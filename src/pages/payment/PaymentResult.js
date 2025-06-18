import React, { useEffect, useState } from 'react';
import { Container, Alert, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './PaymentResult.css';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentDetails, setPaymentDetails] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lấy tất cả các query params
                const params = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                // Lưu một số thông tin thanh toán để hiển thị
                setPaymentDetails({
                    amount: params.vnp_Amount ? (parseInt(params.vnp_Amount) / 100).toLocaleString('vi-VN') : 0,
                    bankCode: params.vnp_BankCode || 'N/A',
                    orderInfo: params.vnp_OrderInfo || 'Thanh toán tour',
                    payDate: params.vnp_PayDate ? formatPaymentDate(params.vnp_PayDate) : 'N/A',
                    transactionNo: params.vnp_TransactionNo || 'N/A'
                });

                // Gọi API để verify payment
                const response = await axios.get('http://localhost:8080/api/v1/bookings/vnpay-return', {
                    params: params
                });

                console.log('Payment verification response:', response.data);
                setPaymentStatus(response.data);
            } catch (error) {
                console.error('Error verifying payment:', error);
                setPaymentStatus({
                    statusCode: 400,
                    error: 'Error',
                    message: 'Có lỗi xảy ra khi xác thực thanh toán',
                    data: { paymentStatus: 'FAILED' }
                });
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    // Format payment date from YYYYMMDDHHMMSS to DD/MM/YYYY HH:MM:SS
    const formatPaymentDate = (dateString) => {
        if (!dateString || dateString.length !== 14) return dateString;
        
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const hour = dateString.substring(8, 10);
        const minute = dateString.substring(10, 12);
        const second = dateString.substring(12, 14);
        
        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    if (loading) {
        return (
            <div className="payment-result-container loading">
                <div className="payment-loader">
                    <div className="spinner"></div>
                    <p>Đang xử lý thanh toán...</p>
                </div>
            </div>
        );
    }

    const isSuccess = paymentStatus?.statusCode === 200 && 
                      paymentStatus?.data?.paymentStatus === 'PAID';

    return (
        <div className="payment-result-container">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="payment-result-card">
                            <Card.Body>
                                <div className="text-center mb-4">
                                    {isSuccess ? (
                                        <div className="success-animation">
                                            <div className="checkmark-circle">
                                                <div className="checkmark draw"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="failed-animation">
                                            <div className="cross-circle">
                                                <div className="cross-line1"></div>
                                                <div className="cross-line2"></div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <h2 className={`payment-status ${isSuccess ? 'success' : 'failed'}`}>
                                        {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                                    </h2>
                                    
                                    <p className="payment-message">
                                        {isSuccess 
                                            ? 'Cảm ơn bạn đã đặt tour. Tour của bạn đã được xác nhận.' 
                                            : paymentStatus?.message || 'Có lỗi xảy ra trong quá trình thanh toán.'}
                                    </p>
                                </div>
                                
                                <div className="payment-details">
                                    <h4>Chi tiết giao dịch</h4>
                                    <table className="payment-info-table">
                                        <tbody>
                                            <tr>
                                                <td>Số tiền:</td>
                                                <td>{paymentDetails.amount} VNĐ</td>
                                            </tr>
                                            <tr>
                                                <td>Ngân hàng:</td>
                                                <td>{paymentDetails.bankCode}</td>
                                            </tr>
                                            <tr>
                                                <td>Nội dung:</td>
                                                <td>{decodeURIComponent(paymentDetails.orderInfo).replace(/\+/g, ' ')}</td>
                                            </tr>
                                            <tr>
                                                <td>Thời gian:</td>
                                                <td>{paymentDetails.payDate}</td>
                                            </tr>
                                            <tr>
                                                <td>Mã giao dịch:</td>
                                                <td>{paymentDetails.transactionNo}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="payment-actions">
                                    <Button 
                                        variant={isSuccess ? "primary" : "secondary"}
                                        className="action-button"
                                        onClick={() => navigate('/history')}
                                    >
                                        <i className="fas fa-history me-2"></i>
                                        Xem lịch sử đặt tour
                                    </Button>
                                    <Button 
                                        variant="outline-primary"
                                        className="action-button"
                                        onClick={() => navigate('/')}
                                    >
                                        <i className="fas fa-home me-2"></i>
                                        Về trang chủ
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PaymentResult; 