import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
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
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [detailData, setDetailData] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

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

    const handleReviewClick = (booking) => {
        setSelectedReviewBooking(booking);
        setReviewData({ rating: 5, comment: '' });
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8080/api/v1/reviews',
                {
                    tourId: selectedReviewBooking.tour.id,
                    userId: currentUser.id,
                    rating: reviewData.rating,
                    comment: reviewData.comment
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setShowReviewModal(false);
        } catch (err) {
            console.error('Error sending review:', err);
        }
    };

    const handleDetailClick = async (booking) => {
        setDetailLoading(true);
        setDetailError('');
        setShowDetailModal(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/v1/bookings/${booking.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setDetailData(res.data.data);
        } catch (err) {
            setDetailError('Lỗi khi tải chi tiết đơn: ' + (err.response?.data?.message || err.message));
        } finally {
            setDetailLoading(false);
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
                                        {booking.status === 'COMPLETED' && (
                                            <Button 
                                                variant="info" 
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => handleDetailClick(booking)}
                                            >
                                                Xem chi tiết
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
                    <Form onSubmit={handleReviewSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Chấm điểm</Form.Label>
                            <Form.Select
                                value={reviewData.rating}
                                onChange={e => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                                required
                            >
                                <option value={5}>5 - Tuyệt vời</option>
                                <option value={4}>4 - Tốt</option>
                                <option value={3}>3 - Bình thường</option>
                                <option value={2}>2 - Kém</option>
                                <option value={1}>1 - Rất tệ</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung đánh giá</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={reviewData.comment}
                                onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                                Đóng
                            </Button>
                            <Button variant="primary" type="submit">
                                Gửi đánh giá
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal xem chi tiết booking */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn đặt tour</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading && <Spinner animation="border" role="status"><span className="visually-hidden">Đang tải...</span></Spinner>}
                    {detailError && <Alert variant="danger">{detailError}</Alert>}
                    {detailData && (
                        <>
                            <div><strong>Mã đơn:</strong> {detailData.id}</div>
                            <div><strong>Khách hàng:</strong> {detailData.customerName}</div>
                            <div><strong>Email:</strong> {detailData.customerEmail}</div>
                            <div><strong>SĐT:</strong> {detailData.customerPhone}</div>
                            <div><strong>Tour:</strong> {detailData.tour?.title}</div>
                            <div><strong>Ngày bắt đầu:</strong> {formatDate(detailData.tour?.startDate)}</div>
                            <div><strong>Ngày kết thúc:</strong> {formatDate(detailData.tour?.endDate)}</div>
                            <div><strong>Tổng tiền:</strong> {formatPrice(detailData.totalPrice)}</div>
                            <div><strong>Trạng thái:</strong> {getStatusBadge(detailData.status)}</div>
                            <div><strong>Ngày đặt:</strong> {formatDate(detailData.bookingAt)}</div>
                            {detailData.cancelAt && <div><strong>Ngày hủy:</strong> {formatDate(detailData.cancelAt)}</div>}
                            <div><strong>Người tham gia:</strong>
                                {detailData.participants?.map((p, idx) => (
                                    <div key={idx}>{p.name} - {p.phone} ({p.gender})</div>
                                ))}
                            </div>
                            {detailData.refund && (
                                <div className="mt-2">
                                    <strong>Hoàn tiền:</strong>
                                    <div>Số tiền: {formatPrice(detailData.refund.refundAmount)}</div>
                                    <div>Trạng thái: {detailData.refund.status}</div>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                    {detailData && detailData.status === 'COMPLETED' && (
                        <Button variant="success" onClick={() => {
                            setShowDetailModal(false);
                            handleReviewClick({
                                ...detailData,
                                tour: { id: detailData.tour?.tourId, title: detailData.tour?.title, startDate: detailData.tour?.startDate, endDate: detailData.tour?.endDate }
                            });
                        }}>
                            Đánh giá tour
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default History; 