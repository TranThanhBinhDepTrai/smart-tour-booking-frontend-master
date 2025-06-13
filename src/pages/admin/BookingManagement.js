import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Pagination, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './BookingManagement.css';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [updateLoading, setUpdateLoading] = useState(false);
    const limit = 10;

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

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8080/api/v1/bookings/search?page=${currentPage}&limit=${limit}`,
                { headers: getAuthHeader() }
            );
            if (response.data.statusCode === 200) {
                setBookings(response.data.data);
                setTotalPages(5);
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
        setCurrentPage(pageNumber);
    };

    const renderStatusDropdown = (booking) => {
        // Determine which status options should be available based on current status
        const getAvailableStatuses = (currentStatus) => {
            switch (currentStatus) {
                case 'PENDING':
                    return ['CONFIRMED', 'CANCELLED'];
                case 'CONFIRMED':
                    return ['COMPLETED', 'CANCELLED'];
                case 'COMPLETED':
                case 'CANCELLED':
                    return []; // No further status changes allowed
                default:
                    return Object.keys(STATUS_OPTIONS);
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
        <Container fluid className="py-4">
            <h2 className="mb-4">Quản lý đơn đặt tour</h2>
            
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Khách hàng</th>
                            <th>Tour</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Khuyến mãi</th>
                            <th>Hoàn tiền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>
                                    <div><strong>{booking.customerName}</strong></div>
                                    <div>{booking.customerEmail}</div>
                                    <div>{booking.customerPhone}</div>
                                </td>
                                <td>
                                    <div><strong>{booking.tour.title}</strong></div>
                                    <div>Bắt đầu: {formatDate(booking.tour.startDate)}</div>
                                    <div>Kết thúc: {formatDate(booking.tour.endDate)}</div>
                                </td>
                                <td>{booking.bookingAt}</td>
                                <td>{formatPrice(booking.totalPrice)}</td>
                                <td>{renderStatusDropdown(booking)}</td>
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
                                <td>{renderRefundStatusDropdown(booking)}</td>
                                <td>
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="me-2"
                                        onClick={() => {/* Xem chi tiết */}}
                                    >
                                        Chi tiết
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <div className="d-flex justify-content-center mt-4">
                <Pagination>
                    <Pagination.First 
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                    />
                    <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    />
                    
                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                            key={index}
                            active={index === currentPage}
                            onClick={() => handlePageChange(index)}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}
                    
                    <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                    />
                    <Pagination.Last 
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                    />
                </Pagination>
            </div>
        </Container>
    );
};

export default BookingManagement; 