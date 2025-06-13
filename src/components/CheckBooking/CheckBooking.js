import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import './CheckBooking.css';

const CheckBooking = () => {
    const [bookingId, setBookingId] = useState('');
    const [bookingData, setBookingData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBookingData(null);
        setCancelSuccess(null);
        setLoading(true);

        if (!bookingId.trim()) {
            setError('Vui lòng nhập mã đơn hàng');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/api/v1/bookings/${bookingId}`);
            if (response.data.statusCode === 200) {
                setBookingData(response.data.data);
            } else {
                setError('Không tìm thấy thông tin đơn hàng với mã ' + bookingId);
            }
        } catch (err) {
            console.error('Lỗi khi tìm đơn hàng:', err);
            if (err.response && err.response.status === 400) {
                setError(`Không tìm thấy đơn hàng với mã ${bookingId}. Vui lòng kiểm tra lại mã đơn hàng của bạn.`);
            } else if (err.response) {
                setError(err.response.data?.message || 'Không thể tìm thấy thông tin đơn hàng. Vui lòng thử lại sau.');
            } else if (err.request) {
                setError('Không thể kết nối đến hệ thống. Vui lòng kiểm tra kết nối mạng của bạn và thử lại.');
            } else {
                setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Kiểm tra điều kiện hủy đơn
            if (!bookingData) {
                setError('Không tìm thấy thông tin đơn hàng.');
                return;
            }

            if (bookingData.status !== 'PENDING') {
                setError('Chỉ có thể hủy những đơn hàng đang ở trạng thái chờ xử lý.');
                return;
            }

            if (bookingData.refund) {
                setError('Đơn hàng này đã có yêu cầu hoàn tiền, không thể hủy lại.');
                return;
            }

            const response = await axios.delete(`http://localhost:8080/api/v1/bookings/${bookingId}/cancel`);
            
            if (response.data.statusCode === 200) {
                setCancelSuccess(response.data.data);
                // Cập nhật lại thông tin đơn hàng
                const updatedBooking = await axios.get(`http://localhost:8080/api/v1/bookings/${bookingId}`);
                setBookingData(updatedBooking.data.data);
            } else {
                setError('Không thể hủy đơn hàng: ' + (response.data.message || 'Đã có lỗi xảy ra'));
            }
        } catch (err) {
            console.error('Lỗi khi hủy đơn hàng:', err);
            if (err.response) {
                // Xử lý các trường hợp lỗi cụ thể
                if (err.response.data?.code === 'ERR_BAD_RESPONSE') {
                    setError('Đơn hàng này đã được hủy hoặc đã có yêu cầu hoàn tiền. Vui lòng liên hệ hỗ trợ nếu cần thiết.');
                } else {
                    const errorMessage = err.response.data?.message || err.response.data?.error || 'Không thể hủy đơn hàng';
                    setError(`Lỗi: ${errorMessage}. Vui lòng liên hệ hỗ trợ nếu cần thiết.`);
                }
            } else if (err.request) {
                // Lỗi không thể kết nối đến server
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
            } else {
                setError('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusText = (status) => {
        const statusMap = {
            'PENDING': 'Chờ xử lý',
            'CONFIRMED': 'Đã xác nhận',
            'CANCELLED': 'Đã hủy',
            'COMPLETED': 'Hoàn thành'
        };
        return statusMap[status] || status;
    };

    const getRefundStatusText = (status) => {
        const statusMap = {
            'IN_PROCESS': 'Đang xử lý',
            'COMPLETED': 'Đã hoàn tiền',
            'REJECTED': 'Từ chối'
        };
        return statusMap[status] || status;
    };

    // Kiểm tra xem có thể hiển thị nút hủy không
    const canShowCancelButton = (booking) => {
        return booking.status === 'PENDING' && !booking.refund;
    };

    return (
        <Container className="check-booking-container py-5">
            <h2 className="text-center mb-4">Kiểm tra đơn hàng</h2>
            
            <Card className="search-card mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nhập mã đơn hàng</Form.Label>
                            <Form.Control
                                type="text"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                placeholder="Nhập mã đơn hàng của bạn"
                                required
                            />
                        </Form.Group>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? 'Đang tìm kiếm...' : 'Kiểm tra'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {error && (
                <Alert variant="warning" className="text-center">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                    <div className="mt-2">
                        <small>
                            Nếu bạn cần hỗ trợ, vui lòng liên hệ hotline: <strong>1900 8000</strong>
                        </small>
                    </div>
                </Alert>
            )}

            {cancelSuccess && (
                <Alert variant="success">
                    <h5>Đơn hàng đã được hủy thành công!</h5>
                    <p>Thông tin hoàn tiền:</p>
                    <ul>
                        <li>Số tiền gốc: {cancelSuccess.originalAmount.toLocaleString('vi-VN')} VNĐ</li>
                        <li>Phí phạt: {cancelSuccess.penaltyPercent}%</li>
                        <li>Số tiền hoàn trả: {cancelSuccess.refundAmount.toLocaleString('vi-VN')} VNĐ</li>
                    </ul>
                </Alert>
            )}

            {bookingData && (
                <Card className="booking-details">
                    <Card.Header>
                        <h4>Thông tin đơn hàng #{bookingData.id}</h4>
                    </Card.Header>
                    <Card.Body>
                        <div className="booking-info">
                            <h5>Thông tin khách hàng</h5>
                            <p><strong>Họ tên:</strong> {bookingData.customerName}</p>
                            <p><strong>Email:</strong> {bookingData.customerEmail}</p>
                            <p><strong>Số điện thoại:</strong> {bookingData.customerPhone}</p>
                            
                            <h5 className="mt-4">Thông tin tour</h5>
                            <p><strong>Tên tour:</strong> {bookingData.tour.title}</p>
                            <p><strong>Ngày bắt đầu:</strong> {formatDate(bookingData.tour.startDate)}</p>
                            <p><strong>Ngày kết thúc:</strong> {formatDate(bookingData.tour.endDate)}</p>
                            
                            <h5 className="mt-4">Thông tin đặt tour</h5>
                            <p><strong>Trạng thái:</strong> {getStatusText(bookingData.status)}</p>
                            <p><strong>Ngày đặt:</strong> {bookingData.bookingAt}</p>
                            <p><strong>Tổng tiền:</strong> {bookingData.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                            
                            {bookingData.promotionDto && (
                                <div className="mt-3">
                                    <h5>Thông tin khuyến mãi</h5>
                                    <p><strong>Mã khuyến mãi:</strong> {bookingData.promotionDto.code}</p>
                                    <p><strong>Giảm giá:</strong> {bookingData.promotionDto.discountPercent}%</p>
                                </div>
                            )}

                            {bookingData.refund && (
                                <div className="mt-3">
                                    <h5>Thông tin hoàn tiền</h5>
                                    <p><strong>Trạng thái:</strong> {getRefundStatusText(bookingData.refund.status)}</p>
                                    <p><strong>Phần trăm hoàn tiền:</strong> {bookingData.refund.refundPercent}%</p>
                                    <p><strong>Số tiền hoàn:</strong> {bookingData.refund.refundAmount.toLocaleString('vi-VN')} VNĐ</p>
                                </div>
                            )}
                        </div>

                        {canShowCancelButton(bookingData) && (
                            <Button 
                                variant="danger" 
                                className="mt-3"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                {loading ? 'Đang hủy đơn...' : 'Hủy đơn hàng'}
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default CheckBooking; 