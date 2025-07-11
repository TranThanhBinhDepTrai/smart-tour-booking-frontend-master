import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Pagination, Dropdown, Row, Col, Form, InputGroup, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './BookingManagement.css';
import { emailService } from '../../services/emailService';
import { FaSearch } from 'react-icons/fa';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [updateLoading, setUpdateLoading] = useState(false);
    const limit = 10;
    const [searchTerm, setSearchTerm] = useState("");

    // State for the details modal
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [isLastPage, setIsLastPage] = useState(false);

    const STATUS_OPTIONS = {
        PENDING: { text: 'Chờ xử lý', variant: 'warning' },
        CONFIRMED: { text: 'Đã xác nhận', variant: 'success' },
        CANCELLED: { text: 'Đã hủy', variant: 'danger' },
        COMPLETED: { text: 'Hoàn thành', variant: 'info' }
    };

    const REFUND_STATUS_OPTIONS = {
        IN_PROCESS: { text: 'Đang xử lý', variant: 'warning' },
        DONE: { text: 'Đã hoàn tiền', variant: 'success' },
        REJECTED: { text: 'Từ chối', variant: 'danger' }
    };

    // Get the auth token
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        fetchBookings();
    }, [currentPage]);

    const fetchBookingDetails = async (bookingId) => {
        try {
            setModalLoading(true);
            const response = await axios.get(
                `http://localhost:8080/api/v1/bookings/${bookingId}`,
                { headers: getAuthHeader() }
            );
            if (response.data.statusCode === 200) {
                setSelectedBooking(response.data.data);
                setShowModal(true);
            }
        } catch (err) {
            console.error(`Lỗi khi tải chi tiết đơn đặt tour ${bookingId}:`, err);
            alert('Không thể tải chi tiết đơn đặt tour.');
        } finally {
            setModalLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8080/api/v1/bookings/search?page=${currentPage}&limit=${limit}`,
                { headers: getAuthHeader() }
            );
            if (response.data.statusCode === 200) {
                setBookings(response.data.data);
                setIsLastPage(response.data.data.length < limit);
                if (currentPage === 0 && response.data.data.length < limit) {
                  setTotalPages(1);
                } else if (response.data.data.length === limit) {
                  setTotalPages(currentPage + 2);
                } else {
                  setTotalPages(currentPage + 1);
                }
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách đơn đặt tour:', err);
            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setError('Không thể tải danh sách đơn đặt tour');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            setUpdateLoading(true);
            const response = await axios.put(
                `http://localhost:8080/api/v1/bookings/${bookingId}/status?status=${newStatus}`,
                {},  // empty body
                { headers: getAuthHeader() }
            );
            
            if (response.data.statusCode === 200) {
                setBookings(bookings.map(booking => 
                    booking.id === bookingId 
                        ? { ...booking, status: newStatus }
                        : booking
                ));
                // Gửi email khi hủy
                if (newStatus === 'CANCELLED') {
                    try {
                        await emailService.sendBookingCancellation(bookingId);
                    } catch (e) {
                        alert('Cập nhật trạng thái thành công, nhưng gửi email thất bại!');
                    }
                }
                alert('Cập nhật trạng thái thành công!');
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            if (err.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                alert('Không thể cập nhật trạng thái: ' + (err.response?.data?.message || 'Đã có lỗi xảy ra'));
            }
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleRefundStatusUpdate = async (bookingId) => {
        try {
            setUpdateLoading(true);
            const response = await axios.put(
                `http://localhost:8080/api/v1/bookings/${bookingId}/update-refund-status`,
                { status: "DONE" },  // Gửi status DONE
                { headers: getAuthHeader() }
            );
            
            if (response.data.statusCode === 200) {
                // Cập nhật trạng thái hoàn tiền trong danh sách bookings
                setBookings(bookings.map(booking => {
                    if (booking.id === bookingId) {
                        return {
                            ...booking,
                            refund: {
                                ...booking.refund,
                                ...response.data.data,
                                status: 'DONE'
                            }
                        };
                    }
                    return booking;
                }));
                alert('Xác nhận hoàn tiền thành công!');
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái hoàn tiền:', err);
            if (err.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                alert('Không thể cập nhật trạng thái hoàn tiền: ' + (err.response?.data?.message || 'Đã có lỗi xảy ra'));
            }
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            setUpdateLoading(true);
            await axios.delete(
                `http://localhost:8080/api/v1/bookings/${bookingId}/cancel`,
                { headers: getAuthHeader() }
            );
            // Sau khi hủy thành công, reload lại danh sách
            fetchBookings();
            alert('Hủy booking thành công!');
        } catch (err) {
            alert('Không thể hủy booking: ' + (err.response?.data?.message || 'Đã có lỗi xảy ra'));
        } finally {
            setUpdateLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusInfo = STATUS_OPTIONS[status] || { text: status, variant: 'secondary' };
        return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
    };

    const getRefundStatusBadge = (status) => {
        const statusInfo = REFUND_STATUS_OPTIONS[status] || { text: status, variant: 'secondary' };
        return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN') + ' VNĐ';
        }
        // Xử lý giá trị dạng scientific notation (ví dụ: 1.05E7)
        if (typeof price === 'string' && price.includes('E')) {
            const [base, exponent] = price.split('E');
            const actualPrice = parseFloat(base) * Math.pow(10, parseInt(exponent));
            return actualPrice.toLocaleString('vi-VN') + ' VNĐ';
        }
        return '0 VNĐ';
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 0 || (isLastPage && pageNumber > currentPage)) return;
        setCurrentPage(pageNumber);
    };

    const renderStatusDropdown = (booking) => {
        // Determine which status options should be available based on current status
        const getAvailableStatuses = (currentStatus) => {
            switch (currentStatus) {
                case 'PENDING':
                    return ['CONFIRMED'];
                case 'CONFIRMED':
                    return ['COMPLETED'];
                case 'COMPLETED':
                case 'CANCELLED':
                    return []; // No further status changes allowed
                default:
                    return Object.keys(STATUS_OPTIONS).filter(s => s !== 'CANCELLED');
            }
        };

        const availableStatuses = getAvailableStatuses(booking.status);

        if (availableStatuses.length === 0) {
            return getStatusBadge(booking.status);
        }

        return (
            <div className="d-flex align-items-center">
                {getStatusBadge(booking.status)}
                <Dropdown className="ms-2">
                    <Dropdown.Toggle 
                        variant="outline-secondary" 
                        size="sm"
                        disabled={updateLoading}
                    >
                        Cập nhật
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {availableStatuses.map(status => (
                            <Dropdown.Item
                                key={status}
                                onClick={() => handleStatusUpdate(booking.id, status)}
                                className={`text-${STATUS_OPTIONS[status].variant}`}
                            >
                                {STATUS_OPTIONS[status].text}
                            </Dropdown.Item>
                        ))}
                        <Dropdown.Item
                            key="CANCELLED"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-danger"
                        >
                            Đã hủy
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        );
    };

    const renderRefundStatusDropdown = (booking) => {
        // Nếu đơn không phải trạng thái đã hủy, không hiển thị gì cả
        if (booking.status !== 'CANCELLED') {
            return 'Không có';
        }

        // Nếu đã có thông tin hoàn tiền, hiển thị trạng thái
        if (booking.refund) {
            return (
                <div className="d-flex align-items-center">
                    {getRefundStatusBadge(booking.refund.status)}
                    {booking.refund.status === 'IN_PROCESS' && (
                        <Button 
                            variant="outline-success" 
                            size="sm"
                            className="ms-2"
                            onClick={() => handleRefundStatusUpdate(booking.id)}
                            disabled={updateLoading}
                        >
                            Xác nhận hoàn tiền
                        </Button>
                    )}
                </div>
            );
        }

        // Nếu đơn đã hủy nhưng chưa có thông tin hoàn tiền
        return (
            <div className="d-flex align-items-center">
                <Badge bg="secondary">Chưa hoàn tiền</Badge>
            </div>
        );
    };

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="admin-page-container py-4">
            <div className="booking-card">
                <div className="admin-header booking-header mb-3 text-start">
                    <div>
                        <h2 className="admin-title mb-0 text-start">Quản lý đơn đặt tour</h2>
                        <div className="admin-subtitle text-start">Danh sách các đơn đặt tour của khách hàng</div>
                    </div>
                </div>
                <div className="search-bar-wrapper">
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Tìm theo tên tour, email, số điện thoại, tên khách"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="search-bar-btn" type="button" disabled>
                        <FaSearch />
                    </button>
                </div>
                
                <div className="user-list">
                    {bookings.filter(booking => {
                        const s = searchTerm.toLowerCase();
                        return (
                            booking.id.toString().includes(s) ||
                            booking.customerName.toLowerCase().includes(s) ||
                            booking.customerEmail.toLowerCase().includes(s) ||
                            booking.customerPhone.toLowerCase().includes(s) ||
                            booking.tour.title.toLowerCase().includes(s) ||
                            (booking.status && booking.status.toLowerCase().includes(s))
                        );
                    }).map((booking) => (
                        <div className="user-card-item" key={booking.id}>
                            <div className="user-card-header d-flex justify-content-between align-items-center mb-2">
                                <span className="user-id fw-bold">#{booking.id}</span>
                                <span className="ms-2 badge bg-primary booking-title-badge">{booking.tour.title}</span>
                            </div>
                            <div className="user-card-body mb-2">
                                <div><strong>Khách hàng:</strong> {booking.customerName} ({booking.customerEmail}, {booking.customerPhone})</div>
                                <div><strong>Ngày đặt:</strong> {booking.bookingAt}</div>
                                <div><strong>Thời gian tour:</strong> {formatDate(booking.tour.startDate)} - {formatDate(booking.tour.endDate)}</div>
                                <div><strong>Tổng tiền:</strong> {formatPrice(booking.totalPrice)}</div>
                                <div><strong>Khuyến mãi:</strong> {booking.promotionDto ? `${booking.promotionDto.code} (${booking.promotionDto.discountPercent}%)` : 'Không có'}</div>
                            </div>
                            <div className="user-card-status mb-2">
                                {renderStatusDropdown(booking)}
                                <div className="mt-1">Hoàn tiền: {renderRefundStatusDropdown(booking)}</div>
                            </div>
                            <div className="user-card-actions d-flex flex-wrap gap-2">
                                <Button 
                                    variant="info" 
                                    size="sm"
                                    onClick={() => fetchBookingDetails(booking.id)}
                                    title="Chi tiết"
                                >
                                    <i className="fas fa-eye"></i>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pagination">
                    <button onClick={() => handlePageChange(0)} disabled={currentPage === 0}>Đầu</button>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>Trước</button>
                    <span>Trang {currentPage + 1}{isLastPage ? '' : ` / ${totalPages}`}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={isLastPage}>Sau</button>
                    <button onClick={() => handlePageChange(totalPages - 1)} disabled={isLastPage}>Cuối</button>
                </div>
            </div>

            {/* Booking Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn đặt tour #{selectedBooking?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalLoading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : selectedBooking ? (
                        <div>
                            <Row>
                                <Col md={6}>
                                    <h5>Thông tin khách hàng</h5>
                                    <p><strong>Tên:</strong> {selectedBooking.customerName}</p>
                                    <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                                    <p><strong>SĐT:</strong> {selectedBooking.customerPhone}</p>
                                    <p><strong>Ngày đặt:</strong> {formatDate(selectedBooking.bookingAt)}</p>
                                </Col>
                                <Col md={6}>
                                    <h5>Thông tin tour</h5>
                                    <p><strong>Tên tour:</strong> {selectedBooking.tour.title}</p>
                                    <p><strong>Bắt đầu:</strong> {formatDate(selectedBooking.tour.startDate)}</p>
                                    <p><strong>Kết thúc:</strong> {formatDate(selectedBooking.tour.endDate)}</p>
                                </Col>
                            </Row>
                            <hr/>
                            <Row>
                                <Col md={6}>
                                    <h5>Thanh toán & Trạng thái</h5>
                                    <p><strong>Tổng tiền:</strong> {formatPrice(selectedBooking.totalPrice)}</p>
                                    <p><strong>Trạng thái:</strong> {getStatusBadge(selectedBooking.status)}</p>
                                    <p><strong>Khuyến mãi:</strong> {selectedBooking.promotionDto ? `${selectedBooking.promotionDto.code} (${selectedBooking.promotionDto.discountPercent}%)` : 'Không có'}</p>
                                </Col>
                            </Row>
                            <hr/>
                            <h5>Danh sách người tham gia</h5>
                            {selectedBooking.participants && selectedBooking.participants.length > 0 ? (
                                <Table striped bordered size="sm">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tên</th>
                                            <th>Số điện thoại</th>
                                            <th>Giới tính</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedBooking.participants.map((p, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{p.name}</td>
                                                <td>{p.phone}</td>
                                                <td>{p.gender === 'MALE' ? 'Nam' : 'Nữ'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p>Không có thông tin người tham gia.</p>
                            )}
                        </div>
                    ) : (
                        <p>Không thể tải dữ liệu.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BookingManagement; 