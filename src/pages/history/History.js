import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import './History.css';

const History = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        console.log('Current user in History:', currentUser);
        console.log('Token:', localStorage.getItem('token'));
        if (currentUser?.id) {
            loadBookings();
        } else {
            setError('Vui lòng đăng nhập để xem lịch sử đặt tour');
            setLoading(false);
        }
    }, [currentUser]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Loading bookings for user ID:', currentUser.id);
            console.log('User role:', currentUser.role);
            const response = await bookingService.getUserBookings(currentUser.id);
            console.log('Full bookings response:', response);
            if (Array.isArray(response)) {
                setBookings(response);
                console.log('Bookings set:', response);
            } else {
                // This case might happen if the API returns an unexpected object on error
                setError('Không thể tải lịch sử đặt tour: Dữ liệu không hợp lệ.');
            }
        } catch (err) {
            console.error('Error loading bookings:', err);
            console.error('Error details:', err.response?.data);
            setError('Không thể tải lịch sử đặt tour: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        try {
            setCancelLoading(true);
            const response = await bookingService.cancelBooking(selectedBooking.id);
            if (response.statusCode === 200) {
                // Reload bookings after successful cancellation
                await loadBookings();
                setShowCancelModal(false);
                alert('Hủy đơn thành công!');
            } else {
                throw new Error(response.message || 'Không thể hủy đơn');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert(err.message || 'Không thể hủy đơn. Vui lòng thử lại sau.');
        } finally {
            setCancelLoading(false);
            setShowCancelModal(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { text: 'Chờ xử lý', variant: 'warning' },
            'CONFIRMED': { text: 'Đã xác nhận', variant: 'success' },
            'CANCELLED': { text: 'Đã hủy', variant: 'danger' },
            'COMPLETED': { text: 'Hoàn thành', variant: 'info' }
        };
        const statusInfo = statusMap[status] || { text: status, variant: 'secondary' };
        return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN') + ' VNĐ';
        }
        if (typeof price === 'string' && price.includes('E')) {
            const [base, exponent] = price.split('E');
            const actualPrice = parseFloat(base) * Math.pow(10, parseInt(exponent));
            return actualPrice.toLocaleString('vi-VN') + ' VNĐ';
        }
        return '0 VNĐ';
    };

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!currentUser) {
        return (
            <Container className="py-4">
                <Alert variant="warning">Vui lòng đăng nhập để xem lịch sử đặt tour</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Lịch sử đặt tour</h2>
            
            {bookings.length === 0 ? (
                <Alert variant="info">Bạn chưa có đơn đặt tour nào</Alert>
            ) : (
                <div className="table-responsive">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Tour</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Khuyến mãi</th>
                                <th>Người tham gia</th>
                                <th>Hoàn tiền</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.id}</td>
                                    <td>
                                        <div><strong>{booking.tour?.title}</strong></div>
                                        <div>Bắt đầu: {formatDate(booking.tour?.startDate)}</div>
                                        <div>Kết thúc: {formatDate(booking.tour?.endDate)}</div>
                                    </td>
                                    <td>{formatDate(booking.bookingAt)}</td>
                                    <td>{formatPrice(booking.totalPrice)}</td>
                                    <td>{getStatusBadge(booking.status)}</td>
                                    <td>
                                        {booking.promotionDto ? (
                                            <>
                                                <div><strong>{booking.promotionDto.code}</strong></div>
                                                <div>Giảm {booking.promotionDto.discountPercent}%</div>
                                            </>
                                        ) : (
                                            'Không có'
                                        )}
                                    </td>
                                    <td>
                                        {booking.participants?.map((p, index) => (
                                            <div key={index}>
                                                {p.name} - {p.phone}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        {booking.refund ? (
                                            <>
                                                <div>Số tiền: {formatPrice(booking.refund.refundAmount)}</div>
                                                <div>Trạng thái: {booking.refund.status}</div>
                                            </>
                                        ) : (
                                            'Không có'
                                        )}
                                    </td>
                                    <td>
                                        {booking.status === 'PENDING' && (
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => handleCancelClick(booking)}
                                            >
                                                Hủy đơn
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Modal xác nhận hủy đơn */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận hủy đơn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn hủy đơn đặt tour này không?
                    {selectedBooking && (
                        <div className="mt-3">
                            <p><strong>Mã đơn:</strong> {selectedBooking.id}</p>
                            <p><strong>Tour:</strong> {selectedBooking.tour?.title}</p>
                            <p><strong>Tổng tiền:</strong> {formatPrice(selectedBooking.totalPrice)}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Đóng
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleCancelConfirm}
                        disabled={cancelLoading}
                    >
                        {cancelLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default History; 