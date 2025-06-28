import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import './History.css';
import axios from 'axios';

const History = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [showTourDetailModal, setShowTourDetailModal] = useState(false);
    const [detailBooking, setDetailBooking] = useState(null);
    const [reviewTourId, setReviewTourId] = useState(null);

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
            await bookingService.cancelBooking(selectedBooking.id);
            // Even if the API returns 500, we'll refetch in `finally`.
            // If it was a success on the DB, the UI will update.
            // We can show a success message optimistically.
            alert('Đã gửi yêu cầu hủy đơn. Vui lòng đợi trong khi trang cập nhật.');
        } catch (err) {
            console.error('Error cancelling booking:', err);
            // We still refetch, but we can show a more cautious message.
            alert('Yêu cầu hủy đơn đã được gửi đi nhưng có thể có lỗi xảy ra. Đang làm mới dữ liệu...');
        } finally {
            setCancelLoading(false);
            setShowCancelModal(false);
            // Always reload bookings to reflect the latest state from the DB
            await loadBookings();
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
                                        {['PENDING', 'CONFIRMED'].includes((booking.status || '').toUpperCase()) && (
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => handleCancelClick(booking)}
                                            >
                                                Hủy đơn
                                            </Button>
                                        )}
                                        {['COMPLETED'].includes((booking.status || '').toUpperCase()) && (
                                            <Button 
                                                variant="info" 
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => {
                                                    setDetailBooking(booking);
                                                    setShowTourDetailModal(true);
                                                }}
                                            >
                                                Xem chi tiết tour
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

            {/* Modal đánh giá tour */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Đánh giá tour</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}
                    {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                    <div className="mb-3">
                        <label className="form-label">Chọn số sao:</label><br/>
                        {[1,2,3,4,5].map(star => (
                            <span
                                key={star}
                                style={{
                                    fontSize: '1.7rem',
                                    color: star <= reviewRating ? '#ffd600' : '#ccc',
                                    cursor: 'pointer',
                                    marginRight: 4
                                }}
                                onClick={() => setReviewRating(star)}
                            >★</span>
                        ))}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nhận xét:</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            placeholder="Hãy chia sẻ cảm nhận của bạn về tour này..."
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)} disabled={reviewLoading}>
                        Đóng
                    </Button>
                    <Button
                        variant="success"
                        onClick={async () => {
                            setReviewLoading(true);
                            setReviewSuccess('');
                            setReviewError('');
                            try {
                                const token = localStorage.getItem('token');
                                const tourId = reviewTourId;
                                const res = await axios.post('http://localhost:8080/api/v1/reviews', {
                                    rating: reviewRating,
                                    comment: reviewComment,
                                    tourId: tourId,
                                    userId: currentUser?.id
                                }, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                });
                                if (res.data && res.data.statusCode === 200) {
                                    setReviewSuccess('Đánh giá thành công!');
                                    setTimeout(() => {
                                        setShowReviewModal(false);
                                    }, 1200);
                                } else {
                                    setReviewError('Đánh giá thất bại!');
                                }
                            } catch (err) {
                                setReviewError('Đánh giá thất bại!');
                            } finally {
                                setReviewLoading(false);
                            }
                        }}
                        disabled={reviewLoading || !reviewComment.trim()}
                    >
                        {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal chi tiết tour */}
            <Modal show={showTourDetailModal} onHide={() => setShowTourDetailModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết tour</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailBooking && (
                        <>
                            <div><strong>Mã đơn:</strong> {detailBooking.id}</div>
                            <div><strong>Tên khách:</strong> {detailBooking.customerName}</div>
                            <div><strong>Email:</strong> {detailBooking.customerEmail}</div>
                            <div><strong>SĐT:</strong> {detailBooking.customerPhone}</div>
                            <div><strong>Ngày đặt:</strong> {formatDate(detailBooking.bookingAt)}</div>
                            <div><strong>Tên tour:</strong> {detailBooking.tour?.title}</div>
                            <div><strong>Mã tour:</strong> {detailBooking.tour?.tourId}</div>
                            <div><strong>Ngày bắt đầu:</strong> {formatDate(detailBooking.tour?.startDate)}</div>
                            <div><strong>Ngày kết thúc:</strong> {formatDate(detailBooking.tour?.endDate)}</div>
                            <div><strong>Giá tour:</strong> {formatPrice(detailBooking.tour?.price)}</div>
                            <div><strong>Tổng tiền:</strong> {formatPrice(detailBooking.totalPrice)}</div>
                            <div><strong>Trạng thái:</strong> {getStatusBadge(detailBooking.status)}</div>
                            <div><strong>Người tham gia:</strong>
                                <ul style={{paddingLeft: 18}}>
                                    {detailBooking.participants && detailBooking.participants.length > 0 ? (
                                        detailBooking.participants.map((p, idx) => (
                                            <li key={idx}>{p.name} - {p.phone} ({p.gender === 'MALE' ? 'Nam' : 'Nữ'})</li>
                                        ))
                                    ) : (
                                        <li>Không có</li>
                                    )}
                                </ul>
                            </div>
                            <div className="mt-2"><strong>Mô tả tour:</strong> {detailBooking.tour?.description || 'Không có'}</div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTourDetailModal(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => {
                            setReviewBooking(detailBooking);
                            setReviewTourId(detailBooking?.tour?.tourId);
                            setReviewRating(5);
                            setReviewComment('');
                            setShowReviewModal(true);
                            setReviewSuccess('');
                            setReviewError('');
                        }}
                    >
                        Đánh giá tour
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default History; 